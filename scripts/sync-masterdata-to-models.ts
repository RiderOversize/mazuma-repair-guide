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

  console.log("1. Fetching MasterData & Models...");
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

  console.log(`  Loaded ${mapByCode.size} code mappings and ${mapByName.size} name mappings from MasterData.`);

  const mAllRows = mRes.data.values || [];
  const mHeaders = mAllRows[0] || [];
  const mData = mAllRows.slice(1);

  // Check if symptomTypeId exists in headers
  let symTypeIdx = mHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'symptomtypeid');
  if (symTypeIdx === -1) {
    // Insert symptomTypeId at index 3 (after subcategoryId)
    console.log("  Adding symptomTypeId column to Models header...");
    mHeaders.splice(3, 0, 'symptomTypeId');
    symTypeIdx = 3;
    mData.forEach(row => {
      row.splice(3, 0, '');
    });
  }

  const mCatIdx = mHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'categoryid');
  const mSubcatIdx = mHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'subcategoryid');
  const mNameIdx = mHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'name');
  const mCodeIdx = mHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'code');

  let updatedCount = 0;

  const updatedRows = mData.map(row => {
    while (row.length < mHeaders.length) row.push("");

    const code = (row[mCodeIdx] || "").trim();
    const name = (row[mNameIdx] || "").trim();
    const cat = (row[mCatIdx] || "").trim();
    const currentSymType = (row[symTypeIdx] || "").trim();

    let targetSymType = mapByCode.get(code) || mapByName.get(name) || "";

    // If still empty, check partial matches
    if (!targetSymType) {
      for (const [mCode, sType] of mapByCode.entries()) {
        if (code && (code.includes(mCode) || mCode.includes(code))) {
          targetSymType = sType;
          break;
        }
      }
    }
    if (!targetSymType) {
      for (const [mName, sType] of mapByName.entries()) {
        if (name && (name.includes(mName) || mName.includes(name))) {
          targetSymType = sType;
          break;
        }
      }
    }

    // Default category based symptomType fallbacks
    if (!targetSymType) {
      if (cat === "F1") {
        targetSymType = name.includes("2R") || name.includes("MAX") ? "WH-EL2R" : "WH-EL1R";
      } else if (cat === "F4") {
        targetSymType = "WP-RO3G";
      } else if (cat === "F6") {
        targetSymType = "WP-ROID";
      }
    }

    if (targetSymType && row[symTypeIdx] !== targetSymType) {
      row[symTypeIdx] = targetSymType;
      updatedCount++;
    }

    return row;
  });

  console.log(`\nUpdated ${updatedCount} model rows with symptomTypeId from MasterData.`);

  if (updatedCount > 0 || mHeaders.length !== mAllRows[0]?.length) {
    console.log("Writing updated Models sheet...");
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Models!A1:Z${1 + updatedRows.length}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [mHeaders, ...updatedRows] }
    });
    console.log("✅ Models successfully synced with MasterData!");
  }
}

main().catch(console.error);
