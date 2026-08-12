import { google } from "googleapis";

export async function getYouTubeAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN; // Note: specific for YouTube

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Google YouTube OAuth credentials. Please check your .env.local file.");
  }

  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "http://localhost:3000/api/auth/callback/google"
  );

  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  return oAuth2Client;
}

export async function getYouTubeClient() {
  const auth = await getYouTubeAuthClient();
  return google.youtube({ version: "v3", auth });
}

export async function listYouTubeVideos() {
  const youtube = await getYouTubeClient();
  try {
    // 1. Get the channel's "uploads" playlist ID
    const channelRes = await youtube.channels.list({
      mine: true,
      part: ["contentDetails"],
    });

    const uploadsPlaylistId = channelRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      return [];
    }

    // 2. Get videos from the uploads playlist
    const playlistRes = await youtube.playlistItems.list({
      playlistId: uploadsPlaylistId,
      part: ["snippet", "contentDetails"],
      maxResults: 50,
    });

    const items = playlistRes.data.items || [];
    
    // Map to match the MediaFile structure used in Media Library
    return items.map((item) => ({
      id: item.contentDetails?.videoId,
      name: item.snippet?.title || "Untitled",
      type: "video",
      url: `https://www.youtube.com/watch?v=${item.contentDetails?.videoId}`,
      thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || "",
      size: "YouTube Video", // We don't get exact byte size from YouTube API easily
      rawSize: 0,
      createdAt: item.snippet?.publishedAt || new Date().toISOString(),
    }));
  } catch (error: any) {
    console.error("Error with YouTube API:", error);
    if (error.message?.includes("quotaExceeded")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw new Error(error.message);
  }
}

export async function deleteYouTubeVideo(videoId: string) {
  const youtube = await getYouTubeClient();
  try {
    await youtube.videos.delete({
      id: videoId,
    });
    return true;
  } catch (error: any) {
    console.error("Error deleting YouTube video:", error);
    if (error.message?.includes("quotaExceeded")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw new Error(error.message);
  }
}

export async function renameYouTubeVideo(videoId: string, newTitle: string) {
  const youtube = await getYouTubeClient();
  try {
    // We must pass the snippet with the categoryId when updating a video
    // First, fetch the existing snippet to retain other fields
    const videoRes = await youtube.videos.list({
      id: [videoId],
      part: ["snippet"],
    });

    const existingSnippet = videoRes.data.items?.[0]?.snippet;
    if (!existingSnippet) {
      throw new Error("Video not found");
    }

    await youtube.videos.update({
      part: ["snippet"],
      requestBody: {
        id: videoId,
        snippet: {
          ...existingSnippet,
          title: newTitle,
        },
      },
    });
    return true;
  } catch (error: any) {
    console.error("Error renaming YouTube video:", error);
    if (error.message?.includes("quotaExceeded")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw new Error(error.message);
  }
}
