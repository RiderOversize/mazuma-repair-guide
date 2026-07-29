import { google } from "googleapis";
import * as dotenv from "dotenv";
const models = [
  { id: "m-h1", categoryId: "F1", subcategoryId: "F1-01-00", symptomTypeId: "WH-EL", name: "Mazuma รุ่น Hydro Pro", code: "MZ-HP4500", status: "active", thumbnail: "https://images.unsplash.com/photo-1585250005740-410a56247c4e?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-05-12").toISOString() },
  { id: "m-h2", categoryId: "F1", subcategoryId: "F1-01-00", symptomTypeId: "WH-EL", name: "Mazuma รุ่น Aqua Smart", code: "MZ-AS3600", status: "active", thumbnail: "https://images.unsplash.com/photo-1542013936693-884638332954?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-06-20").toISOString() },
  { id: "m-h3", categoryId: "F1", subcategoryId: "F1-02-00", symptomTypeId: "WH-EL", name: "Mazuma รุ่น Thermo Plus", code: "MZ-TP5000", status: "discontinued", thumbnail: "", createdAt: new Date("2022-11-05").toISOString() },
  { id: "m-p1", categoryId: "F4", subcategoryId: "F4-01-02", symptomTypeId: "WP-RO", name: "Mazuma รุ่น Pure RO", code: "MZ-RO500", status: "active", thumbnail: "https://images.unsplash.com/photo-1627918349272-9b2f2757270d?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-08-01").toISOString() },
  { id: "m-p2", categoryId: "F4", subcategoryId: "F4-01-03", symptomTypeId: "WP-RO", name: "Mazuma รุ่น Crystal UF", code: "MZ-UF320", status: "active", thumbnail: "", createdAt: new Date("2023-09-10").toISOString() },
  { id: "m-wd1", categoryId: "FA", subcategoryId: "FA-01-00", symptomTypeId: "WD-CO", name: "Mazuma รุ่น Cool Max", code: "MZ-CM200", status: "active", thumbnail: "", createdAt: new Date("2023-10-15").toISOString() },
  { id: "m-pu1", categoryId: "FD", subcategoryId: "FD-01-00", symptomTypeId: "PU-WA", name: "Mazuma รุ่น Power Flow", code: "MZ-PF250", status: "active", thumbnail: "https://images.unsplash.com/photo-1584820927508-ea24dfc02b37?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-02-14").toISOString() },
  { id: "m-im1", categoryId: "FH", subcategoryId: "FH-01-00", symptomTypeId: "IM-IC", name: "Mazuma รุ่น Ice Maker Pro", code: "MZ-IM100", status: "active", thumbnail: "", createdAt: new Date("2024-01-20").toISOString() },
  { id: "m-fn1", categoryId: "FB", subcategoryId: "FB-01-00", symptomTypeId: "FN-AF", name: "Mazuma รุ่น Air Flow", code: "MZ-AF16", status: "active", thumbnail: "", createdAt: new Date("2023-11-11").toISOString() },
  { id: "m-ap1", categoryId: "FC", subcategoryId: "FC-01-00", symptomTypeId: "AP-PA", name: "Mazuma รุ่น Pure Air", code: "MZ-PA30", status: "draft", thumbnail: "", createdAt: new Date("2024-02-28").toISOString() },
]

dotenv.config({ path: ".env.local" });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEETS = { MODELS: "Models" };

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

  // Clear existing Models data
  console.log("Clearing existing Models data...");
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${SHEETS.MODELS}!A2:Z100`,
  });

  // Prepare models data
  // ["id", "categoryId", "subcategoryId", "symptomTypeId", "name", "code", "status", "thumbnail", "createdAt", "updatedAt"]
  const modelsData = models.map(m => [
    m.id,
    m.categoryId,
    m.subcategoryId || "",
    m.symptomTypeId || "",
    m.name,
    m.code,
    m.status || "active",
    m.thumbnail || "",
    m.createdAt || new Date().toISOString(),
    (m as any).updatedAt || new Date().toISOString()
  ]);

  // Add the two specific F1 models from the previous demo as well
  modelsData.push([
    "model-01", "F1", "sub-f1-01", "WH-EL1R", "Mazuma ICON PLUS", "ICON-P", "active", "", new Date().toISOString(), new Date().toISOString()
  ]);
  modelsData.push([
    "model-02", "F1", "sub-f1-01", "WH-EL1R", "Mazuma MIRACLE", "MIR-01", "active", "", new Date().toISOString(), new Date().toISOString()
  ]);

  console.log(`Inserting ${modelsData.length} models...`);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEETS.MODELS}!A2:Z100`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: modelsData }
  });

  console.log("Models seeded successfully!");
}

main().catch(console.error);
