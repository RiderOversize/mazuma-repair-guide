import { NextRequest, NextResponse } from "next/server";
import { createFolderInDrive } from "@/lib/google-drive";

export async function POST(request: NextRequest) {
  try {
    const { name, parentId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const targetParentId = parentId || process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    if (!targetParentId) {
      return NextResponse.json({ error: "Google Drive folder ID not configured" }, { status: 500 });
    }

    const result = await createFolderInDrive(name, targetParentId);

    return NextResponse.json({ success: true, folder: result });
  } catch (error: any) {
    console.error("Error creating folder:", error);
    return NextResponse.json({ error: error.message || "Failed to create folder" }, { status: 500 });
  }
}
