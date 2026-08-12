import { NextRequest, NextResponse } from "next/server";
import { uploadFileToDrive } from "@/lib/google-drive";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const folderId = (formData.get("folderId") as string) || process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    if (!folderId) {
      return NextResponse.json({ error: "Google Drive folder ID not configured" }, { status: 500 });
    }

    const result = await uploadFileToDrive(file, folderId);
    
    return NextResponse.json({
      success: true,
      url: result.webViewLink,
      id: result.id,
    });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
