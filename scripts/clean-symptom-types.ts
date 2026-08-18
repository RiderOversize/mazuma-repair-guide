import { google } from "googleapis";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function main() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: privateKey },
    scopes: SCOPES,
  });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  console.log("Fetching MasterData & Models...");
  const [mdRes, mRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId, range: 'MasterData!A1:Z' }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: 'Models!A1:Z' }),
  ]);

  const mdRows = mdRes.data.values || [];
  const mdHeaders = mdRows[0] || [];
  const mdData = mdRows.slice(1);

  const mdCodeIdx = mdHeaders.findIndex((h: string) => h.includes('รหัสสินค้า') || h.toLowerCase().includes('code'));
  const mdNameIdx = mdHeaders.findIndex((h: string) => h.includes('ชื่อสินค้า') || h.toLowerCase().includes('name'));
  const mdSymTypeIdx = mdHeaders.findIndex((h: string) => h.includes('รหัสประเภทอาการ') || h.toLowerCase().includes('symptomtype'));

  const mapByCode = new Map<string, string>();
  const mapByName = new Map<string, string>();

  mdData.forEach(r => {
    const code = r[mdCodeIdx]?.trim();
    const name = r[mdNameIdx]?.trim();
    const symType = r[mdSymTypeIdx]?.trim();
    if (code && symType) mapByCode.set(code, symType);
    if (name && symType) mapByName.set(name, symType);
  });

  console.log(`Loaded ${mapByCode.size} exact model code mappings from MasterData.`);

  const mAllRows = mRes.data.values || [];
  const mHeaders = mAllRows[0] || [];
  const mData = mAllRows.slice(1);

  const symTypeIdx = mHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'symptomtypeid');
  const mNameIdx = mHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'name');
  const mCodeIdx = mHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'code');

  let exactMappedCount = 0;
  let clearedCount = 0;

  const updatedRows = mData.map(row => {
    while (row.length < mHeaders.length) row.push("");

    const code = (row[mCodeIdx] || "").trim();
    const name = (row[mNameIdx] || "").trim();

    // STRICT MATCH ONLY from MasterData
    const exactSymType = mapByCode.get(code) || mapByName.get(name) || "";

    if (exactSymType) {
      row[symTypeIdx] = exactSymType;
      exactMappedCount++;
    } else {
      // Clear out artificial fallback so only genuine MasterData mappings exist
      if (row[symTypeIdx]) clearedCount++;
      row[symTypeIdx] = "";
    }

    return row;
  });

  console.log(`\nExact matches from MasterData: ${exactMappedCount} models.`);
  console.log(`Cleared unmapped symptomTypeId: ${clearedCount} models.`);

  console.log("Writing back to Google Sheets...");
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Models!A1:Z${1 + updatedRows.length}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [mHeaders, ...updatedRows] }
  });
  console.log("✅ Models sheet cleaned: Only genuine MasterData mappings remain.");
}

main().catch(console.error);
