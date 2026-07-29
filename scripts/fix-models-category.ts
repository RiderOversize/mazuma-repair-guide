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
  let updatedCount = 0;

  // We want to update just the categoryId (Column B) based on subcategoryId (Column C)
  // To update efficiently, we'll recreate the whole array and batch update
  const updatedRows = rows.map(row => {
    // row[0] is id, row[1] is categoryId, row[2] is subcategoryId
    let categoryId = row[1] || "";
    const subcategoryId = row[2] || "";
    
    // If categoryId is empty and subcategoryId contains '-', extract the prefix
    if (!categoryId && subcategoryId.includes("-")) {
      categoryId = subcategoryId.split("-")[0];
      row[1] = categoryId;
      updatedCount++;
    }
    
    // Also, if subcategoryId doesn't have a '-', maybe it's just raw text, we skip for now
    // Since Google Sheets arrays might not have all trailing empty strings, let's make sure it has the required length
    return row;
  });

  if (updatedCount > 0) {
    console.log(`Updating ${updatedCount} rows with new categoryId...`);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.MODELS}!A2:Z${1 + rows.length}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: updatedRows }
    });
    console.log("Update completed!");
  } else {
    console.log("No rows needed updating.");
  }
}

main().catch(console.error);
