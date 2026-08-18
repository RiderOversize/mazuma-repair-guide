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

  console.log("1. Fetching ProductCategory & Models...");
  const [pcRes, mRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId, range: 'ProductCategory!A1:Z' }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: 'Models!A1:Z' }),
  ]);

  const subcats = pcRes.data.values?.slice(1) || [];
  const allModels = mRes.data.values || [];
  const headers = allModels[0] || [];
  const dataRows = allModels.slice(1);

  const subCatById = new Map<string, { id: string; index: string; matCode: string; name: string }>();
  const subCatByMatCode = new Map<string, { id: string; index: string; matCode: string; name: string }>();
  const subCatByName = new Map<string, { id: string; index: string; matCode: string; name: string }>();

  subcats.forEach(r => {
    const id = r[0]?.trim();
    const index = r[1]?.trim();
    const matCode = r[2]?.trim();
    const name = r[3]?.trim();
    const item = { id, index, matCode, name };
    if (id) subCatById.set(id, item);
    if (matCode) subCatByMatCode.set(matCode, item);
    if (name) subCatByName.set(name, item);
  });

  const mIdIdx = headers.findIndex((h: string) => h.trim().toLowerCase() === 'id');
  const mCatIdx = headers.findIndex((h: string) => h.trim().toLowerCase() === 'categoryid');
  const mSubcatIdx = headers.findIndex((h: string) => h.trim().toLowerCase() === 'subcategoryid');
  const mNameIdx = headers.findIndex((h: string) => h.trim().toLowerCase() === 'name');
  const mCodeIdx = headers.findIndex((h: string) => h.trim().toLowerCase() === 'code');

  let updatedCount = 0;

  const updatedRows = dataRows.map(row => {
    while (row.length < headers.length) row.push("");

    const currentCat = (row[mCatIdx] || "").trim();
    const currentSub = (row[mSubcatIdx] || "").trim();
    const name = (row[mNameIdx] || "").trim();
    const code = (row[mCodeIdx] || "").trim();

    let targetCat = "";
    let targetSub = "";

    // 1. Text subcategory mappings
    if (currentSub === "เครื่องกรองพลาสติกเล็ก (ไม่มีไฟฟ้า)" || currentSub.includes("พลาสติกเล็ก (ไม่มีไฟฟ้า)")) {
      targetCat = "F4";
      targetSub = "35";
    } else if (currentSub === "เครื่องกรองพลาสติกเล็ก (มีไฟฟ้า)" || currentSub.includes("พลาสติกเล็ก (มีไฟฟ้า)")) {
      targetCat = "F4";
      targetSub = "36";
    } else if (currentSub === "เครื่องกรองเล็ก BWT (ไม่มีไฟฟ้า)" || currentSub.includes("BWT (ไม่มีไฟฟ้า)")) {
      targetCat = "F2";
      targetSub = "9";
    } else if (currentSub === "ตู้น้ำดื่มมีระบบกรอง" || currentSub.includes("ตู้น้ำดื่มมีระบบกรอง")) {
      targetCat = "FA";
      targetSub = "50";
    } else if (currentSub === "ตู้น้ำดื่มไม่มีระบบกรอง" || currentSub.includes("ตู้น้ำดื่มไม่มีระบบกรอง")) {
      targetCat = "FA";
      targetSub = "51";
    } else if (currentSub === "เครื่องกำจัดเชื้อ" || currentSub.includes("กำจัดเชื้อ") || name.includes("โอโซน") || name.includes("ฆ่าเชื้อ") || name.includes("HYDROGEN") || name.includes("OZONIZER")) {
      targetCat = "FJ";
      targetSub = name.includes("HYDROGEN") ? "65" : name.includes("AIR") ? "66" : "64";
    } else if (currentSub === "เครื่องฟอกอากาศ" || name.includes("เครื่องฟอกอากาศ") || code.startsWith("C1-") || code.startsWith("C11-")) {
      targetCat = "FC";
      targetSub = name.includes("HONEYWELL") ? "58" : "57";
    }
    // 2. Exact match by subCat ID (1 to 67)
    else if (subCatById.has(currentSub)) {
      const match = subCatById.get(currentSub)!;
      targetCat = match.index;
      targetSub = match.id;
    }
    // 3. Exact match by MAT Code (e.g. F1-01-00)
    else if (subCatByMatCode.has(currentSub)) {
      const match = subCatByMatCode.get(currentSub)!;
      targetCat = match.index;
      targetSub = match.id;
    }
    // 4. Exact match by Description name
    else if (subCatByName.has(currentSub)) {
      const match = subCatByName.get(currentSub)!;
      targetCat = match.index;
      targetSub = match.id;
    }

    // 5. Fallback heuristics for products by name/code
    if (!targetCat || !targetSub) {
      if (name.includes("พัดลม") || code.startsWith("FB-")) {
        targetCat = "FB";
        targetSub = name.includes("HONEYWELL") ? "55" : "54";
      } else if (name.includes("ปั๊มน้ำ") || code.startsWith("FD-") || name.includes("POWER FLOW")) {
        targetCat = "FD";
        targetSub = "59";
      } else if (name.includes("น้ำแข็ง") || code.startsWith("FH-") || name.includes("ICE")) {
        targetCat = "FH";
        targetSub = "63";
      } else if (name.startsWith("ตู้") || code.startsWith("70-") || code.startsWith("A01-") || code.startsWith("A00-")) {
        targetCat = "FA";
        targetSub = name.includes("ไม่มี") ? "51" : "50";
      } else if (name.includes("น้ำอุ่น") || code.startsWith("10-") || code.startsWith("12-") || code.startsWith("13-")) {
        targetCat = "F1";
        targetSub = "1";
      } else if (name.includes("น้ำร้อน") || name.includes("POWER 1P") || name.includes("POWER 3P") || name.includes("SPC-")) {
        targetCat = "F1";
        targetSub = "2";
      } else if (name.includes("หม้อต้ม")) {
        targetCat = "F1";
        targetSub = "3";
      } else if (name.includes("สแตนเลส") || code.startsWith("B1-")) {
        targetCat = "F2";
        targetSub = "9";
      } else if (name.includes("พลาสติก") || code.startsWith("40-") || name.includes("UF") || name.includes("RO")) {
        targetCat = "F4";
        targetSub = "35";
      } else if (code.startsWith("30-") || code.startsWith("31-") || name.includes("เครื่องกรอง")) {
        targetCat = "F3";
        targetSub = "21";
      }
    }

    let changed = false;
    if (targetCat && row[mCatIdx] !== targetCat) {
      row[mCatIdx] = targetCat;
      changed = true;
    }
    if (targetSub && row[mSubcatIdx] !== targetSub) {
      row[mSubcatIdx] = targetSub;
      changed = true;
    }

    if (changed) updatedCount++;
    return row;
  });

  console.log(`\nUpdated ${updatedCount} rows across entire database.`);

  if (updatedCount > 0) {
    console.log("Writing updates to Google Sheets...");
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Models!A2:Z${1 + updatedRows.length}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: updatedRows }
    });
    console.log("✅ Master update completed successfully!");
  }
}

main().catch(console.error);
