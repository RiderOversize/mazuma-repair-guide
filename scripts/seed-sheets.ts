import { google } from "googleapis";
import dotenv from "dotenv";
import { categories, subCategories, symptomTypes, symptoms, models, guides } from "../lib/mock-data";
import { MOCK_USERS } from "../lib/auth";

dotenv.config({ path: ".env.local" });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export const SHEETS = {
  USERS: "Users",
  CATEGORIES: "Categories",
  SUBCATEGORIES: "SubCategories",
  SYMPTOM_TYPES: "SymptomTypes",
  SYMPTOMS: "Symptoms",
  MODELS: "Models",
  GUIDES: "Guides",
  GUIDE_STEPS: "GuideSteps",
  FEEDBACKS: "Feedbacks"
};

async function seed() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID as string;

  console.log("Seeding data to spreadsheet:", spreadsheetId);

  // 1. Users
  const userRows = Object.values(MOCK_USERS).map(u => [
    u.employeeCode,
    u.name,
    u.phone || "",
    u.role,
    u.status || "active",
    u.createdAt || new Date().toISOString(),
    u.lineUserId || "",
    (u.assignedSupervisors || []).join(","),
    (u.accessibleMenus || []).join(",")
  ]);
  
  if (userRows.length > 0) {
    await append(sheets, spreadsheetId, SHEETS.USERS, userRows);
    console.log(`Seeded ${userRows.length} Users`);
  }

  // 2. Categories
  const catRows: any[] = [];
  categories.forEach(c => {
    catRows.push([
      c.id, c.name, c.slug, c.description, c.status || "active", c.createdAt || new Date().toISOString()
    ]);
  });

  if (catRows.length > 0) {
    await append(sheets, spreadsheetId, SHEETS.CATEGORIES, catRows);
    console.log(`Seeded ${catRows.length} Categories`);
  }
  // 2.5 SubCategories
  const subCatRows = subCategories.map(sc => [
    sc.id, sc.categoryId, sc.name
  ]);
  if (subCatRows.length > 0) {
    await append(sheets, spreadsheetId, SHEETS.SUBCATEGORIES, subCatRows);
    console.log(`Seeded ${subCatRows.length} SubCategories`);
  }

  // 2.6 Symptom Types & Symptoms
  const symptomTypeRows = symptomTypes.map(st => [
    st.id, st.name
  ]);
  const symptomRows = symptoms.map(s => [
    s.id, s.symptomTypeId, s.description
  ]);

  if (symptomTypeRows.length > 0) {
    await append(sheets, spreadsheetId, SHEETS.SYMPTOM_TYPES, symptomTypeRows);
    console.log(`Seeded ${symptomTypeRows.length} SymptomTypes`);
  }
  if (symptomRows.length > 0) {
    await append(sheets, spreadsheetId, SHEETS.SYMPTOMS, symptomRows);
    console.log(`Seeded ${symptomRows.length} Symptoms`);
  }



  // 3. Models
  const modelRows = models.map(m => {
    const subCatName = subCategories.find(sc => sc.id === m.subcategoryId)?.name || "";
    const symTypeName = symptomTypes.find(st => st.id === m.symptomTypeId)?.name || "";
    return [
      m.code, // รหัสสินค้า
      m.name, // ชื่อสินค้า
      m.subcategoryId || "", // MAT Category Code
      subCatName, // MAT Category
      m.symptomTypeId || "", // รหัสประเภทอาการ
      symTypeName, // ประเภทอาการอาการ
      m.status || "active",
      m.thumbnail || "",
      m.createdAt || new Date().toISOString()
    ];
  });
  if (modelRows.length > 0) {
    await append(sheets, spreadsheetId, SHEETS.MODELS, modelRows);
    console.log(`Seeded ${modelRows.length} Models`);
  }

  // 4. Guides & GuideSteps
  const guideRows: any[] = [];
  const stepRows: any[] = [];
  
  guides.forEach(g => {
    guideRows.push([
      g.id, g.categoryId, g.symptomId, g.specificCause, g.description || "", g.status || "published",
      (g.tags || []).join(","), (g.toolsRequired || []).join(","),
      g.createdAt || new Date().toISOString(), g.updatedAt || new Date().toISOString()
    ]);
    
    g.steps.forEach(st => {
      stepRows.push([
        `step-${g.id}-${st.stepNum}`, g.id, st.stepNum, st.instruction, st.videoUrl, st.pdfUrl || ""
      ]);
    });
  });

  if (guideRows.length > 0) {
    await append(sheets, spreadsheetId, SHEETS.GUIDES, guideRows);
    console.log(`Seeded ${guideRows.length} Guides`);
  }
  if (stepRows.length > 0) {
    await append(sheets, spreadsheetId, SHEETS.GUIDE_STEPS, stepRows);
    console.log(`Seeded ${stepRows.length} GuideSteps`);
  }

  console.log("Seeding complete!");
}

async function append(sheets: any, spreadsheetId: string, sheetName: string, rows: any[]) {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A2:Z`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: rows }
  });
}

seed().catch(console.error);
