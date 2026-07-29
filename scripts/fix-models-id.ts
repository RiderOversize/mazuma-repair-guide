import { google } from "googleapis";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEETS = { MODELS: "Models" };

async function main() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: privateKey },
    scopes: SCOPES,
  });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  console.log("Fetching Models...");
  const modelsRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEETS.MODELS}!A2:Z10000`
  });
  
  const rows = modelsRes.data.values || [];
  
  // Re-generate ID for all rows
  const updatedRows = rows.map((row, index) => {
    // We'll generate a clean sequential ID for each model
    // e.g. m-0001, m-0002
    const newId = `m-${String(index + 1).padStart(4, '0')}`;
    row[0] = newId;
    return row;
  });

  console.log(`Updating ${updatedRows.length} rows with new IDs...`);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEETS.MODELS}!A2:Z${1 + rows.length}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: updatedRows }
  });
  
  console.log("ID Update completed!");
}

main().catch(console.error);
