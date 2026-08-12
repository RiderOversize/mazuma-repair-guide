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
