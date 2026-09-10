import { google } from "googleapis";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export async function updateModelsSheetCategories() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: privateKey },
    scopes: SCOPES,
  });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  // 1. Fetch MasterData mappings
  console.log("1. Fetching MasterData...");
  const mdRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "MasterData!A1:Z"
  });
  const mdRows = mdRes.data.values || [];
  const mdHeaders = mdRows[0] || [];
  const mdCodeIdx = mdHeaders.findIndex((h: string) => h.includes('รหัสสินค้า') || h.toLowerCase().includes('code'));
  const mdNameIdx = mdHeaders.findIndex((h: string) => h.includes('ชื่อสินค้า') || h.toLowerCase().includes('name'));
  const mdCatIdx = mdHeaders.findIndex((h: string) => h.trim() === 'MAT Category');

  const masterCatByCode = new Map<string, string>();
  const masterCatByName = new Map<string, string>();

  mdRows.slice(1).forEach((r) => {
    const code = (r[mdCodeIdx] || "").trim().toUpperCase();
    const name = (r[mdNameIdx] || "").trim().toLowerCase();
    const cat = (r[mdCatIdx] || "").trim();
    if (code && cat) masterCatByCode.set(code, cat);
    if (name && cat) masterCatByName.set(name, cat);
  });

  console.log(`  Loaded ${masterCatByCode.size} mappings from MasterData.`);

  // 2. Fetch Models
  console.log("2. Fetching Models sheet...");
  const modelsRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Models!A1:Z"
  });
  const mRows = modelsRes.data.values || [];
  if (mRows.length === 0) return { updatedCount: 0 };

  const headers = mRows[0];
  const catIdx = headers.findIndex((h: string) => h.toLowerCase() === 'categoryid');
  const codeIdx = headers.findIndex((h: string) => h.toLowerCase() === 'code');
  const nameIdx = headers.findIndex((h: string) => h.toLowerCase() === 'name');

  const legacyCodes = new Set(["F1", "F2", "F3", "F4", "F6", "FA", "FB", "FC", "FD", "FE", "FH", "FJ", "FK"]);

  let updatedCount = 0;
  const nowISO = new Date().toISOString();

  // Column B is categoryId (index 1)
  const updatedRows = mRows.slice(1).map((r) => {
    const currentCat = (r[catIdx] || "").trim();
    if (!legacyCodes.has(currentCat)) return r;

    const code = (r[codeIdx] || "").trim().toUpperCase();
    const name = (r[nameIdx] || "").trim();
    const nameLower = name.toLowerCase();

    let newCat = masterCatByCode.get(code) || masterCatByName.get(nameLower) || "";

    if (!newCat) {
      if (currentCat === "F1") {
        if (nameLower.includes("น้ำร้อน") || nameLower.includes("หม้อต้ม") || nameLower.includes("boiler")) {
          newCat = "เครื่องทำน้ำร้อน";
        } else {
          newCat = "เครื่องทำน้ำอุ่น";
        }
      } else if (currentCat === "F2") {
        newCat = "เครื่องกรองสแตนเลส";
      } else if (currentCat === "F3") {
        if (nameLower.includes("ro") || nameLower.includes("purelife") || nameLower.includes("พลาสติก")) {
          newCat = "เครื่องกรองพลาสติก RO ขนาดเล็ก";
        } else {
          newCat = "เครื่องกรองใหญ่";
        }
      } else if (currentCat === "F4") {
        newCat = "เครื่องกรองพลาสติก";
      } else if (currentCat === "F6") {
        newCat = "เครื่องกรองระบบอุตสาหกรรม";
      } else if (currentCat === "FA") {
        newCat = "ตู้กดน้ำดื่ม";
      } else if (currentCat === "FB") {
        newCat = "พัดลมระบายอากาศ";
      } else if (currentCat === "FC") {
        newCat = "เครื่องฟอกอากาศ";
      } else if (currentCat === "FD") {
        newCat = "ปั๊มน้ำแรงดัน";
      } else if (currentCat === "FE") {
        newCat = "Smart Zenflow";
      } else if (currentCat === "FH") {
        newCat = "เครื่องผลิตน้ำแข็ง";
      } else if (currentCat === "FJ") {
        newCat = "เครื่องกำจัดเชื้อ";
      } else if (currentCat === "FK") {
        newCat = "PUDU หุ่นยนต์บริการ";
      }
    }

    if (newCat && newCat !== currentCat) {
      r[catIdx] = newCat;
      // Also update updatedAt column if it exists
      const updatedIdx = headers.findIndex((h: string) => h.toLowerCase() === 'updatedat');
      if (updatedIdx !== -1) r[updatedIdx] = nowISO;
      updatedCount++;
    }

    return r;
  });

  console.log(`3. Updating ${updatedCount} rows in Models sheet...`);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Models!A2:Z${1 + updatedRows.length}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: updatedRows
    }
  });

  console.log(`Done! Successfully updated ${updatedCount} rows.`);
  return { updatedCount };
}

if (require.main === module) {
  updateModelsSheetCategories().catch(console.error);
}
