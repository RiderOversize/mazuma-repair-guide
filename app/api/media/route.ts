import { NextRequest, NextResponse } from "next/server";
import { listFilesInDrive, deleteFileFromDrive } from "@/lib/google-drive";
import { getGuides, updateGuide } from "@/lib/data-service";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryFolderId = url.searchParams.get("folderId");
    const folderId = queryFolderId || process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    if (!folderId) {
      return NextResponse.json({ error: "Google Drive folder ID not configured" }, { status: 500 });
    }

    const files = await listFilesInDrive(folderId);
    
    const formattedFiles = files.map(f => {
      const isFolder = f.mimeType === 'application/vnd.google-apps.folder';
      const isPdf = f.mimeType === 'application/pdf';
      const isVideo = f.mimeType?.startsWith('video/');
      const type = isFolder ? 'folder' : (isPdf ? 'pdf' : (isVideo ? 'video' : 'image'));
      
      let thumb = f.thumbnailLink || '';
      // Google Drive returns thumbnailLink with '=s220' size by default. Let's make it bigger for better preview.
      if (thumb) {
        thumb = thumb.replace(/=s\d+/, '=s600');
      }

      return {
        id: f.id,
        name: f.name,
        type: type,
        // Prioritize webViewLink to open in browser instead of downloading
        url: f.webViewLink || f.webContentLink,
        thumbnailUrl: thumb,
        size: f.size ? formatBytes(parseInt(f.size)) : "Unknown",
        rawSize: f.size ? parseInt(f.size) : 0,
        createdAt: f.createdTime,
      }
    });

    return NextResponse.json({ files: formattedFiles });
  } catch (error: any) {
    console.error("Error fetching media:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch media" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idsString = url.searchParams.get("ids");
    const singleId = url.searchParams.get("id");

    const fileIds = idsString ? idsString.split(',') : (singleId ? [singleId] : []);

    if (fileIds.length === 0) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    const guides = await getGuides();

    for (const id of fileIds) {
      if (id.trim()) {
        const fileId = id.trim();
        await deleteFileFromDrive(fileId);
        
        // Check if any guide has this file ID linked, and remove it
        for (const guide of guides) {
          let updated = false;
          const updateData: any = {};
          if (guide.pdfUrl && guide.pdfUrl.includes(fileId)) {
            updateData.pdfUrl = "";
            updated = true;
          }
          if (guide.mediaUrl && guide.mediaUrl.includes(fileId)) {
            updateData.mediaUrl = "";
            updated = true;
          }
          if (updated) {
            await updateGuide(guide.id, updateData);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting media:", error);
    return NextResponse.json({ error: error.message || "Failed to delete media" }, { status: 500 });
  }
}

function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
