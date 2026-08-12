import { google } from "googleapis";
import { Readable } from "stream";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

export async function getDriveAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Google OAuth credentials. Please check your .env.local file.");
  }

  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "http://localhost:3000/api/auth/callback/google"
  );

  oAuth2Client.setCredentials({ refresh_token: refreshToken });

  return oAuth2Client;
}

export async function getDriveClient() {
  const auth = await getDriveAuthClient();
  return google.drive({ version: "v3", auth });
}

export async function uploadFileToDrive(file: File, folderId: string) {
  const drive = await getDriveClient();
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const fileMetadata = {
    name: file.name,
    parents: [folderId],
  };

  const media = {
    mimeType: file.type,
    body: stream,
  };

  try {
    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink, webContentLink",
      supportsAllDrives: true,
    });

    return res.data;
  } catch (error: any) {
    console.error("Error uploading to Google Drive:", error);
    throw new Error(error.message);
  }
}

export async function listFilesInDrive(folderId: string) {
  const drive = await getDriveClient();
  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink, size, createdTime)",
      orderBy: "createdTime desc",
      pageSize: 100,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    return res.data.files || [];
  } catch (error: any) {
    console.error("Error listing files from Google Drive:", error);
    throw new Error(error.message);
  }
}

export async function deleteFileFromDrive(fileId: string) {
  const drive = await getDriveClient();
  try {
    await drive.files.delete({
      fileId: fileId,
      supportsAllDrives: true,
    });
    return true;
  } catch (error: any) {
    console.error("Error deleting file from Google Drive:", error);
    throw new Error(error.message);
  }
}

export async function createFolderInDrive(folderName: string, parentFolderId: string) {
  const drive = await getDriveClient();
  const fileMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentFolderId],
  };

  try {
    const res = await drive.files.create({
      requestBody: fileMetadata,
      fields: "id, name",
      supportsAllDrives: true,
    });
    return res.data;
  } catch (error: any) {
    console.error("Error creating folder in Google Drive:", error);
    throw new Error(error.message);
  }
}

export async function moveFileInDrive(fileId: string, newParentId: string) {
  const drive = await getDriveClient();
  try {
    // Retrieve the existing parents to remove
    const file = await drive.files.get({
      fileId: fileId,
      fields: "parents",
      supportsAllDrives: true,
    });
    const previousParents = file.data.parents?.join(",") || "";

    // Move the file to the new folder
    const res = await drive.files.update({
      fileId: fileId,
      addParents: newParentId,
      removeParents: previousParents,
      fields: "id, parents",
      supportsAllDrives: true,
    });
    return res.data;
  } catch (error: any) {
    console.error("Error moving file in Google Drive:", error);
    throw new Error(error.message);
  }
}

export async function renameFileInDrive(fileId: string, newName: string) {
  const drive = await getDriveClient();
  try {
    const res = await drive.files.update({
      fileId: fileId,
      requestBody: {
        name: newName
      },
      supportsAllDrives: true,
    });
    return res.data;
  } catch (error: any) {
    console.error("Error renaming file in Google Drive:", error);
    throw new Error(error.message);
  }
}
