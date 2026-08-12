import { NextRequest, NextResponse } from "next/server";
import { listYouTubeVideos, deleteYouTubeVideo, renameYouTubeVideo } from "@/lib/google-youtube";
import { getGuides, updateGuide } from "@/lib/data-service";

export async function GET(request: NextRequest) {
  try {
    const files = await listYouTubeVideos();
    return NextResponse.json({ files });
  } catch (error: any) {
    console.error("Error fetching YouTube media:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch YouTube media" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "Missing required fields (id, name)" }, { status: 400 });
    }

    await renameYouTubeVideo(id, name);

    return NextResponse.json({ success: true, message: "YouTube video renamed" });
  } catch (error: any) {
    console.error("Error renaming YouTube video:", error);
    return NextResponse.json({ error: error.message || "Failed to rename YouTube video" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const idsString = url.searchParams.get("ids");
    const singleId = url.searchParams.get("id");

    const fileIds = idsString ? idsString.split(',') : (singleId ? [singleId] : []);

    if (fileIds.length === 0) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    const guides = await getGuides();

    for (const id of fileIds) {
      if (id.trim()) {
        const videoId = id.trim();
        await deleteYouTubeVideo(videoId);
        
        // Check if any guide has this video ID linked, and remove it
        for (const guide of guides) {
          let updated = false;
          const updateData: any = {};
          if (guide.mediaUrl && guide.mediaUrl.includes(videoId)) {
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
    console.error("Error deleting YouTube video:", error);
    return NextResponse.json({ error: error.message || "Failed to delete YouTube video" }, { status: 500 });
  }
}
