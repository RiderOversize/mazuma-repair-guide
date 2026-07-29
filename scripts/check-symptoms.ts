import { google } from "googleapis";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEETS = { 
  SYMPTOM_TYPES: "SymptomTypes",
  SYMPTOMS: "Symptoms",
  MODELS: "Models"
};

async function main() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: privateKey },
    scopes: SCOPES,
  });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  const typesRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${SHEETS.SYMPTOM_TYPES}!A1:Z100` });
  console.log("--- SymptomTypes ---");
  console.log(typesRes.data.values?.slice(0, 5));

  const symRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${SHEETS.SYMPTOMS}!A1:Z100` });
  console.log("\n--- Symptoms ---");
  console.log(symRes.data.values?.slice(0, 5));

}

main().catch(console.error);
