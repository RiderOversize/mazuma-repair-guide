import { google } from "googleapis";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

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

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${SHEETS.GUIDES}!A1:Z1` });
  console.log("Current Guides_V2 Headers:");
  console.log(res.data.values?.[0] || "No headers found");

}

main().catch(console.error);
