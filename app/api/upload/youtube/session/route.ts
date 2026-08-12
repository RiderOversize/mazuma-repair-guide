import { NextRequest, NextResponse } from "next/server";
import { getYouTubeAuthClient } from "@/lib/google-youtube";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, mimeType, size } = body;

    if (!filename || !mimeType || !size) {
      return NextResponse.json(
        { error: "Missing required fields (filename, mimeType, size)" },
        { status: 400 }
      );
    }

    const auth = await getYouTubeAuthClient();
    const tokenResponse = await auth.getAccessToken();
    const token = tokenResponse.token;

    if (!token) {
      throw new Error("Failed to get YouTube access token");
    }

    const metadata = {
      snippet: {
        title: filename,
        description: "Uploaded via Mazuma Repair Guide System",
      },
      status: {
        privacyStatus: "unlisted", // 'public', 'private', or 'unlisted'
        embeddable: true,
      }
    };

    // The YouTube Data API endpoint for resumable uploads
    const initRes = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": mimeType,
        "X-Upload-Content-Length": size.toString(),
        "Origin": request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
      body: JSON.stringify(metadata),
    });

    if (!initRes.ok) {
      const errorText = await initRes.text();
      console.error("YouTube Init Error:", errorText);
      throw new Error("Failed to initialize YouTube upload session");
    }

    const uploadUrl = initRes.headers.get("location");
    if (!uploadUrl) {
      throw new Error("No upload URL returned from YouTube");
    }

    return NextResponse.json({ uploadUrl });
  } catch (error: any) {
    console.error("YouTube Upload Session Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
