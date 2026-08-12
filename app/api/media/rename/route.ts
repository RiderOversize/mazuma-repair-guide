import { NextRequest, NextResponse } from "next/server";
import { renameFileInDrive } from "@/lib/google-drive";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileId, newName } = body;

    if (!fileId || !newName) {
      return NextResponse.json({ error: "fileId and newName are required" }, { status: 400 });
    }

    const data = await renameFileInDrive(fileId, newName);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error renaming media:", error);
    return NextResponse.json({ error: error.message || "Failed to rename media" }, { status: 500 });
  }
}
