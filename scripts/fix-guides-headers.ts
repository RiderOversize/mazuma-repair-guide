import { google } from "googleapis";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEETS = { GUIDES: "Guides_V2" };

async function main() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: privateKey },
    scopes: SCOPES,
  });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  console.log("Updating Guides_V2 headers...");
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEETS.GUIDES}!A1:Z1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { 
      values: [["id", "title", "categoryId", "subcategoryId", "modelIds", "symptomTypeId", "symptomId", "description", "difficulty", "timeEstimated", "status", "tags", "toolsRequired", "partsRequired", "createdAt", "updatedAt", "steps"]] 
    }
  });
  console.log("Headers updated!");
}
main().catch(console.error);
