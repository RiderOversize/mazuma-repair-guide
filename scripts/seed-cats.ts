import { google } from "googleapis";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

const SHEETS = {
  CATEGORIES: "Categories",
  SUBCATEGORIES: "SubCategories"
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

  // 1. Clear Data (Row 2 to 100)
  const clearRequests = [
    { range: `${SHEETS.CATEGORIES}!A2:Z100` },
    { range: `${SHEETS.SUBCATEGORIES}!A2:Z100` },
  ];

  await sheets.spreadsheets.values.batchClear({
    spreadsheetId,
    requestBody: { ranges: clearRequests.map(r => r.range) }
  });

  // ["id", "name", "slug", "description", "status", "createdAt"]
  const categories = [
    ["F1", "เครื่องทำน้ำอุ่น-น้ำร้อน", "f1-water-heater", "หมวดหมู่สำหรับเครื่องทำน้ำอุ่นและน้ำร้อนทั้งหมด", "active", new Date().toISOString()]
  ];

  // ["id", "categoryId", "name"]
  const subcats = [
    ["sub-f1-01", "F1", "เครื่องทำน้ำอุ่นแบบหม้อต้มกริลลอน"],
    ["sub-f1-02", "F1", "เครื่องทำน้ำอุ่นแบบหม้อต้มทองแดง"]
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEETS.CATEGORIES}!A2:Z100`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: categories }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEETS.SUBCATEGORIES}!A2:Z100`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: subcats }
  });

  console.log("Categories and Subcategories seeded!");
}

main().catch(console.error);
