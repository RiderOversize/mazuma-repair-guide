import { google } from "googleapis";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const SHEETS = {
  MODELS: "Models",
  SYMPTOM_TYPES: "SymptomTypes",
  SYMPTOMS: "Symptoms",
  GUIDES: "Guides_V2",
};

async function main() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.error("Missing Google credentials");
    return;
  }
  
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  if (!spreadsheetId) {
    console.error("Missing GOOGLE_SHEETS_ID");
    return;
  }

  console.log("Connecting to Google Sheets...");

  // 1. Clear Data (Row 2 to 100)
  const clearRequests = [
    { range: `${SHEETS.MODELS}!A2:Z100` },
    { range: `${SHEETS.SYMPTOM_TYPES}!A2:Z100` },
    { range: `${SHEETS.SYMPTOMS}!A2:Z100` },
    { range: `${SHEETS.GUIDES}!A2:Z100` },
  ];

  console.log("Clearing existing data...");
  await sheets.spreadsheets.values.batchClear({
    spreadsheetId,
    requestBody: { ranges: clearRequests.map(r => r.range) }
  });

  // 2. Insert Data
  // ["id", "categoryId", "subcategoryId", "symptomTypeId", "name", "code", "status", "thumbnail", "createdAt", "updatedAt"]
  const models = [
    ["model-01", "F1", "sub-f1-01", "WH-EL1R", "Mazuma ICON PLUS", "ICON-P", "active", "", new Date().toISOString(), new Date().toISOString()],
    ["model-02", "F1", "sub-f1-01", "WH-EL1R", "Mazuma MIRACLE", "MIR-01", "active", "", new Date().toISOString(), new Date().toISOString()]
  ];

  // ["id", "categoryId", "name"]
  const symptomTypes = [
    ["WH-EL1R", "F1", "อาการน้ำอุ่น 1R (กลุ่มอาการหลัก)"]
  ];

  // ["id", "symptomTypeId", "title", "description", "severity", "tags", "specificModelIds"]
  const symptoms = [
    ["EL1R-01", "WH-EL1R", "น้ำไม่ร้อน", "เครื่องเปิดติดแต่ไม่ทำความร้อน", "High", "ความร้อน,ฮีตเตอร์", ""],
    ["EL1R-02", "WH-EL1R", "ไฟไม่เข้า", "กดปุ่มเปิดแล้วไม่มีไฟติดเลย", "Critical", "ไฟ", ""],
    ["EL1R-99", "WH-EL1R", "ไฟ LED หน้าจอค้าง", "ไฟ LED ค้างสีแดง ไม่ยอมตัด", "Medium", "LED", "model-01"] // Specific to model-01
  ];

  const steps1 = [
    {
      stepNum: 1,
      title: "ตรวจสอบเบรกเกอร์ (ELCB)",
      instruction: "ให้ทำการกดปุ่ม TEST ที่หน้าเครื่อง หากเบรกเกอร์ทิปลงมา ถือว่าเบรกเกอร์ปกติ ให้ดันกลับขึ้นไป",
      mediaUrl: "https://example.com/video-elcb.mp4",
      pdfUrl: ""
    },
    {
      stepNum: 2,
      title: "เช็คค่าความต้านทานขดลวดฮีตเตอร์",
      instruction: "ใช้มัลติมิเตอร์วัดค่าโอห์มที่ขั้วฮีตเตอร์ หากไม่มีค่าขึ้น (OL) แสดงว่าฮีตเตอร์ขาด ต้องเปลี่ยนหม้อต้มใหม่",
      mediaUrl: "https://example.com/image-heater.png",
      pdfUrl: "https://example.com/manual-heater.pdf",
      warning: "ระวัง: ต้องถอดปลั๊กหรือเอาเบรกเกอร์หลักลงก่อนวัดค่าเสมอ!"
    }
  ];

  const steps2 = [
    {
      stepNum: 1,
      title: "ตรวจเช็คจุดเชื่อมต่อสายไฟ",
      instruction: "ตรวจสอบจุดต่อสายไฟ L, N, G ว่าหลวมหรือมีรอยไหม้หรือไม่",
      mediaUrl: "",
      pdfUrl: ""
    }
  ];

  // ["id", "title", "categoryId", "subcategoryId", "modelIds", "symptomTypeId", "symptomId", "description", "difficulty", "timeEstimated", "status", "tags", "toolsRequired", "partsRequired", "createdAt", "updatedAt", "steps"]
  const guides = [
    ["guide-01", "วิธีแก้ไขเครื่องเปิดติด แต่น้ำไม่ร้อน", "F1", "sub-f1-01", "", "WH-EL1R", "EL1R-01", "คู่มือตรวจเช็คระบบทำความร้อนและฮีตเตอร์", "Intermediate", "20 นาที", "published", "ฮีตเตอร์", "มัลติมิเตอร์, ไขควงแฉก", "หม้อต้มฮีตเตอร์", new Date().toISOString(), new Date().toISOString(), JSON.stringify(steps1)],
    ["guide-02", "วิธีเช็คกรณีไฟไม่เข้าเครื่อง", "F1", "sub-f1-01", "", "WH-EL1R", "EL1R-02", "คู่มือเช็คระบบไฟและเบรกเกอร์ ELCB", "Advanced", "30 นาที", "published", "ระบบไฟ", "ไขควงวัดไฟ, มัลติมิเตอร์", "เบรกเกอร์ ELCB", new Date().toISOString(), new Date().toISOString(), JSON.stringify(steps2)]
  ];

  console.log("Inserting Mock Data...");
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEETS.MODELS}!A2:Z100`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: models }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEETS.SYMPTOM_TYPES}!A2:Z100`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: symptomTypes }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEETS.SYMPTOMS}!A2:Z100`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: symptoms }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEETS.GUIDES}!A2:Z100`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: guides }
  });

  console.log("Successfully seeded mock data!");
}

main().catch(console.error);
