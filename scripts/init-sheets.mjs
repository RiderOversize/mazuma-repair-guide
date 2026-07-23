import { google } from "googleapis";
import dotenv from "dotenv";
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
  FEEDBACKS: "Feedbacks",
};

async function init() {
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

  console.log("Connecting to spreadsheet:", spreadsheetId);

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTitles = meta.data.sheets?.map(s => s.properties?.title) || [];
  console.log("Existing sheets:", existingTitles);

  const requiredSheets = [
    { title: SHEETS.USERS, headers: ["employeeCode", "name", "phone", "role", "status", "createdAt", "lineUserId", "assignedHeads", "accessibleMenus"] },
    { title: SHEETS.CATEGORIES, headers: ["ID", "Name", "Slug", "Description", "Status", "CreatedAt"] },
    { title: SHEETS.SUBCATEGORIES, headers: ["ID", "CategoryID", "Name"] },
    { title: SHEETS.SYMPTOM_TYPES, headers: ["ID", "Name"] },
    { title: SHEETS.SYMPTOMS, headers: ["ID", "SymptomTypeID", "Description"] },
    { title: SHEETS.MODELS, headers: ["ID", "CategoryID", "SubCategoryID", "SymptomTypeID", "Name", "Code", "Status", "Thumbnail", "CreatedAt"] },
    { title: SHEETS.GUIDES, headers: ["ID", "CategoryID", "SymptomID", "SpecificCause", "Description", "Status", "Tags", "ToolsRequired", "CreatedAt", "UpdatedAt"] },
    { title: SHEETS.GUIDE_STEPS, headers: ["id", "guideId", "stepNum", "instruction", "videoUrl", "pdfUrl"] },
    { title: SHEETS.FEEDBACKS, headers: ["id", "guideId", "modelId", "userId", "userName", "isSuccess", "stepsViewed", "totalSteps", "timestamp"] },
  ];

  const requests = [];

  for (const reqSheet of requiredSheets) {
    if (!existingTitles.includes(reqSheet.title)) {
      requests.push({
        addSheet: {
          properties: { title: reqSheet.title }
        }
      });
    }
  }

  if (requests.length > 0) {
    console.log("Creating missing sheets...");
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
    
    console.log("Adding headers...");
    for (const reqSheet of requiredSheets) {
      if (!existingTitles.includes(reqSheet.title)) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${reqSheet.title}!A1:Z1`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [reqSheet.headers]
          }
        });
        
        // bold header
        const newMeta = await sheets.spreadsheets.get({ spreadsheetId });
        const sheetId = newMeta.data.sheets?.find(s => s.properties?.title === reqSheet.title)?.properties?.sheetId;
        
        if (sheetId !== undefined) {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [{
                repeatCell: {
                  range: {
                    sheetId: sheetId,
                    startRowIndex: 0,
                    endRowIndex: 1,
                  },
                  cell: {
                    userEnteredFormat: {
                      textFormat: { bold: true },
                      backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }
                    }
                  },
                  fields: "userEnteredFormat(textFormat,backgroundColor)"
                }
              }]
            }
          });
        }
      }
    }
    console.log("Initialization complete!");
  } else {
    console.log("All sheets already exist.");
  }
}

init().catch(console.error);
