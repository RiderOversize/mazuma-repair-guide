import { google } from "googleapis";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const SHEETS = {
  SYMPTOM_TYPES: "SymptomTypes",
  MODELS: "Models",
  SYMPTOMS: "Symptoms",
};

async function main() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.error("Missing Google credentials");
    return;
  }
  
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  if (!spreadsheetId) {
    console.error("Missing GOOGLE_SHEETS_ID");
    return;
  }

  console.log("Connecting to Google Sheets...");

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTitles = meta.data.sheets?.map(s => s.properties?.title) || [];
  
  if (!existingTitles.includes(SHEETS.SYMPTOM_TYPES)) {
    console.log("Creating SymptomTypes sheet...");
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: SHEETS.SYMPTOM_TYPES } } }]
      }
    });
    console.log("Adding headers to SymptomTypes...");
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.SYMPTOM_TYPES}!A1:Z1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["id", "categoryId", "name"]] }
    });
  } else {
    console.log("SymptomTypes sheet already exists.");
  }

  console.log("Updating Headers for Models...");
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEETS.MODELS}!A1:Z1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { 
      values: [["id", "categoryId", "subcategoryId", "symptomTypeId", "name", "code", "status", "thumbnail", "createdAt", "updatedAt"]] 
    }
  });

  console.log("Updating Headers for Symptoms...");
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEETS.SYMPTOMS}!A1:Z1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { 
      values: [["id", "symptomTypeId", "title", "description", "severity", "tags", "specificModelIds"]] 
    }
  });

  console.log("Successfully updated all headers!");
}

main().catch(console.error);
