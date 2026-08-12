import { NextRequest, NextResponse } from "next/server";
import { moveFileInDrive } from "@/lib/google-drive";

export async function PUT(request: NextRequest) {
  try {
    const { fileIds, newParentId } = await request.json();

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: "File IDs are required" }, { status: 400 });
    }

    const targetParentId = newParentId || process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!targetParentId) {
      return NextResponse.json({ error: "Google Drive folder ID not configured" }, { status: 500 });
    }

    const results = [];
    for (const id of fileIds) {
      const res = await moveFileInDrive(id, targetParentId);
      results.push(res);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Error moving file:", error);
    return NextResponse.json({ error: error.message || "Failed to move file" }, { status: 500 });
  }
}
