import { google } from "googleapis";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEETS = { 
  MODELS: "Models",
  SUBCATEGORIES: "SubCategories"
};

async function main() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: privateKey },
    scopes: SCOPES,
  });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  const subcatsRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEETS.SUBCATEGORIES}!A1:D10`
  });
  
  console.log("SubCategories Head:");
  console.log(subcatsRes.data.values);

  const modelsRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEETS.MODELS}!A1:D10`
  });

  console.log("\nModels Head (Columns A-D):");
  console.log(modelsRes.data.values);
}

main().catch(console.error);
