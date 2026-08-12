import { NextRequest, NextResponse } from "next/server";
import { getDriveAuthClient } from "@/lib/google-drive";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, mimeType, folderId } = body;
    
    if (!filename || !mimeType) {
      return NextResponse.json({ error: "Missing filename or mimeType" }, { status: 400 });
    }

    const auth = await getDriveAuthClient();
    const { token } = await auth.getAccessToken();
    
    if (!token) {
      throw new Error("Failed to get access token");
    }

    const targetFolderId = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID;

    const metadata = {
      name: filename,
      parents: [targetFolderId],
    };

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,webViewLink,webContentLink", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": mimeType,
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error(`Failed to create upload session: ${response.statusText}`);
    }

    const uploadUrl = response.headers.get("Location");
    
    if (!uploadUrl) {
      throw new Error("No upload URL returned from Google Drive");
    }

    return NextResponse.json({
      success: true,
      uploadUrl,
    });
  } catch (error: any) {
    console.error("Session API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create session" }, { status: 500 });
  }
}
