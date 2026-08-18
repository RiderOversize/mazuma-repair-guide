import { google } from "googleapis";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEETS = { 
  MODELS: "Models",
  CATEGORIES: "ProductGroup",
  SUBCATEGORIES: "ProductCategory"
};

async function main() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: privateKey },
    scopes: SCOPES,
  });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  console.log("1. Fetching ProductGroup & ProductCategory...");
  const [pgRes, pcRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId, range: `${SHEETS.CATEGORIES}!A1:Z` }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: `${SHEETS.SUBCATEGORIES}!A1:Z` })
  ]);

  const pgRows = pgRes.data.values || [];
  const pgHeaders = pgRows[0] || [];
  const pgData = pgRows.slice(1);
  const pgIdIdx = pgHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'id');
  const pgIndexIdx = pgHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'index');
  const pgDescIdx = pgHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'description');

  const groupMap = new Map<string, { id: string; index: string; name: string }>();
  pgData.forEach(r => {
    const id = r[pgIdIdx]?.trim();
    const index = r[pgIndexIdx]?.trim();
    const name = r[pgDescIdx]?.trim();
    if (index) groupMap.set(index, { id, index, name });
    if (id) groupMap.set(id, { id, index, name });
  });

  const pcRows = pcRes.data.values || [];
  const pcHeaders = pcRows[0] || [];
  const pcData = pcRows.slice(1);
  const pcIdIdx = pcHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'id');
  const pcIndexIdx = pcHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'index');
  const pcMatCodeIdx = pcHeaders.findIndex((h: string) => h.trim().toLowerCase().includes('mat') || h.trim().toLowerCase().includes('code'));
  const pcDescIdx = pcHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'description' || h.trim().toLowerCase() === 'name');

  const subCatById = new Map<string, { id: string; index: string; matCode: string; name: string }>();
  const subCatByName = new Map<string, { id: string; index: string; matCode: string; name: string }>();
  const subCatByMatCode = new Map<string, { id: string; index: string; matCode: string; name: string }>();

  pcData.forEach(r => {
    const id = r[pcIdIdx]?.trim();
    const index = r[pcIndexIdx]?.trim();
    const matCode = r[pcMatCodeIdx]?.trim();
    const name = r[pcDescIdx]?.trim();
    const item = { id, index, matCode, name };

    if (id) subCatById.set(id, item);
    if (name) subCatByName.set(name, item);
    if (matCode) subCatByMatCode.set(matCode, item);
  });

  console.log(`  Loaded ${groupMap.size} product groups and ${subCatById.size} subcategories.`);

  console.log("2. Fetching Models table...");
  const modelsRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEETS.MODELS}!A1:Z`
  });

  const allModelRows = modelsRes.data.values || [];
  const headers = allModelRows[0] || [];
  const dataRows = allModelRows.slice(1);

  const mCatIdx = headers.findIndex((h: string) => h.trim().toLowerCase() === 'categoryid');
  const mSubcatIdx = headers.findIndex((h: string) => h.trim().toLowerCase() === 'subcategoryid');
  const mNameIdx = headers.findIndex((h: string) => h.trim().toLowerCase() === 'name');
  const mCodeIdx = headers.findIndex((h: string) => h.trim().toLowerCase() === 'code');

  let updatedCount = 0;
  let correctedDetails: { code: string; name: string; oldCat: string; newCat: string; subCat: string }[] = [];

  const updatedRows = dataRows.map((row) => {
    while (row.length < headers.length) row.push("");

    const currentCat = (row[mCatIdx] || "").trim();
    const currentSubCat = (row[mSubcatIdx] || "").trim();
    const name = (row[mNameIdx] || "").trim();
    const code = (row[mCodeIdx] || "").trim();

    let correctCat = "";
    let correctSubCat = currentSubCat;

    // Explicit mappings for text subcategories
    if (currentSubCat === "ตู้น้ำดื่มมีระบบกรอง" || name.includes("ตู้น้ำดื่มมีระบบกรอง") || (name.startsWith("ตู้") && name.includes("มีระบบกรอง"))) {
      correctCat = "FA";
      correctSubCat = "50";
    } else if (currentSubCat === "ตู้น้ำดื่มไม่มีระบบกรอง" || name.includes("ตู้น้ำดื่มไม่มีระบบกรอง") || (name.startsWith("ตู้") && name.includes("ไม่มีระบบกรอง")) || name.startsWith("ตู้ทำน้ำเย็น") || name.startsWith("ตู้ทำน้ำร้อน")) {
      correctCat = "FA";
      correctSubCat = "51";
    } else if (name.startsWith("ตู้") || code.startsWith("70-") || code.startsWith("A01-") || code.startsWith("A00-")) {
      correctCat = "FA";
      correctSubCat = currentSubCat && subCatById.has(currentSubCat) ? currentSubCat : "50";
    }
    // 1. Try matching by subcategoryId ID (e.g. "27", "24", "1", "2")
    else if (subCatById.has(currentSubCat)) {
      const match = subCatById.get(currentSubCat)!;
      correctCat = match.index; // e.g. "F3"
    } 
    // 2. Try matching by subcategoryId MAT Code (e.g. "F1-01-00", "F3-02-06")
    else if (subCatByMatCode.has(currentSubCat)) {
      const match = subCatByMatCode.get(currentSubCat)!;
      correctCat = match.index;
      correctSubCat = match.id;
    }
    // 3. Try matching by subcategory Name text (e.g. "เครื่องกรองพลาสติกเล็ก (ไม่มีไฟฟ้า)")
    else if (subCatByName.has(currentSubCat)) {
      const match = subCatByName.get(currentSubCat)!;
      correctCat = match.index;
      correctSubCat = match.id;
    } 
    // 4. Try matching partial text in subcategory Name
    else {
      for (const [sName, sItem] of subCatByName.entries()) {
        if (currentSubCat && (sName.includes(currentSubCat) || currentSubCat.includes(sName))) {
          correctCat = sItem.index;
          correctSubCat = sItem.id;
          break;
        }
      }
    }

    // 5. Fallback: if categoryId has prefix like "F1-01-00"
    if (!correctCat && currentCat.includes('-')) {
      correctCat = currentCat.split('-')[0];
    }

    // 6. Fallback: If categoryId is already a valid ProductGroup Index
    if (!correctCat && groupMap.has(currentCat)) {
      const g = groupMap.get(currentCat)!;
      correctCat = g.index;
    }

    // 7. Fallback based on Product Code prefixes or Names
    if (!correctCat) {
      if (name.includes('ตู้น้ำ') || name.includes('ตู้กด') || name.includes('ตู้ทำน้ำ') || code.startsWith('70-') || code.startsWith('A01-') || code.startsWith('A00-')) {
        correctCat = "FA";
      } else if (name.includes('น้ำอุ่น') || name.includes('น้ำร้อน') || code.startsWith('10-') || code.startsWith('12-') || code.startsWith('13-')) {
        correctCat = "F1";
      } else if (name.includes('สแตนเลส') || code.startsWith('B1-')) {
        correctCat = "F2";
      } else if (name.includes('พลาสติก') || code.startsWith('40-')) {
        correctCat = "F4";
      } else if (name.includes('อุตสาหกรรม') || name.includes('HYDROGEN') || code.startsWith('E4-')) {
        correctCat = "F6";
      } else if (name.includes('เครื่องกรอง') || code.startsWith('30-') || code.startsWith('31-')) {
        correctCat = "F3";
      }
    }

    // Check if categoryId or subcategoryId changed
    let changed = false;
    if (correctCat && row[mCatIdx] !== correctCat) {
      row[mCatIdx] = correctCat;
      changed = true;
    }
    if (correctSubCat && row[mSubcatIdx] !== correctSubCat) {
      row[mSubcatIdx] = correctSubCat;
      changed = true;
    }

    if (changed) {
      updatedCount++;
      if (correctedDetails.length < 15) {
        correctedDetails.push({ code, name, oldCat: currentCat, newCat: correctCat, subCat: correctSubCat });
      }
    }

    return row;
  });

  console.log(`\nFound ${updatedCount} rows requiring correction.`);
  console.log("Sample corrections:");
  console.table(correctedDetails);

  if (updatedCount > 0) {
    console.log(`Writing corrected data back to Models sheet (${updatedRows.length} rows)...`);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.MODELS}!A2:Z${1 + updatedRows.length}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: updatedRows }
    });
    console.log("Update completed successfully!");
  } else {
    console.log("All rows are already correct.");
  }
}

main().catch(console.error);
