import { NextRequest, NextResponse } from "next/server";
import { getDriveClient } from "@/lib/google-drive";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const fileId = url.searchParams.get("fileId") || url.searchParams.get("id");

    if (!fileId) {
      return NextResponse.json({ error: "Missing fileId parameter" }, { status: 400 });
    }

    const drive = await getDriveClient();

    // Fetch file metadata
    const fileMeta = await drive.files.get({
      fileId: fileId,
      fields: "id, name, mimeType, size",
      supportsAllDrives: true,
    });

    const mimeType = fileMeta.data.mimeType || "video/mp4";
    const fileSize = parseInt(fileMeta.data.size || "0", 10);
    const range = request.headers.get("range");

    if (range && fileSize > 0) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const driveStream = await drive.files.get(
        { fileId: fileId, alt: "media", supportsAllDrives: true },
        {
          responseType: "stream",
          headers: { Range: `bytes=${start}-${end}` },
        }
      );

      return new Response(driveStream.data as any, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    } else {
      const driveStream = await drive.files.get(
        { fileId: fileId, alt: "media", supportsAllDrives: true },
        { responseType: "stream" }
      );

      const headers: Record<string, string> = {
        "Content-Type": mimeType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      };
      if (fileSize > 0) {
        headers["Content-Length"] = fileSize.toString();
      }

      return new Response(driveStream.data as any, {
        status: 200,
        headers,
      });
    }
  } catch (error: any) {
    console.error("Error streaming media from Google Drive:", error);
    return NextResponse.json(
      { error: error.message || "Failed to stream media" },
      { status: 500 }
    );
  }
}
