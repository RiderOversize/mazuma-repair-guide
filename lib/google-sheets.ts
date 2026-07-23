import { google } from "googleapis";

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

export async function getAuthClient() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Missing Google Service Account credentials");
  }
  
  // Format the private key correctly (replace literal \n with actual newlines if needed)
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });

  return auth;
}

export async function getSheetsClient() {
  const auth = await getAuthClient();
  return google.sheets({ version: "v4", auth });
}

export async function getSpreadsheetId() {
  const id = process.env.GOOGLE_SHEETS_ID;
  if (!id) throw new Error("Missing GOOGLE_SHEETS_ID");
  return id;
}

// ---------------------------------------------------------------------------
// Initialization (Creates tabs and headers if they don't exist)
// ---------------------------------------------------------------------------
export async function initSheets() {
  const sheets = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();

  // Get current sheets
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTitles = meta.data.sheets?.map(s => s.properties?.title) || [];

  const requiredSheets = [
    { title: SHEETS.USERS, headers: ["employeeCode", "name", "phone", "role", "status", "createdAt", "lineUserId", "assignedHeads"] },
    { title: SHEETS.CATEGORIES, headers: ["id", "name", "slug", "description", "status", "createdAt"] },
    { title: SHEETS.SYMPTOM_GROUPS, headers: ["id", "categoryId", "name"] },
    { title: SHEETS.SUBCATEGORIES, headers: ["id", "categoryId", "name"] },
    { title: SHEETS.MODELS, headers: ["รหัสสินค้า", "ชื่อสินค้า", "MAT Category Code", "MAT Category", "รหัสประเภทอาการ", "ประเภทอาการอาการ", "status", "thumbnail", "createdAt"] },
    { title: SHEETS.GUIDES, headers: ["id", "categoryId", "symptomGroupId", "specificCause", "description", "status", "tags", "supportedModels", "toolsRequired", "createdAt", "updatedAt"] },
    { title: SHEETS.GUIDE_STEPS, headers: ["id", "guideId", "stepNum", "instruction", "videoUrl", "pdfUrl"] },
    { title: SHEETS.FEEDBACKS, headers: ["id", "guideId", "modelId", "userId", "userName", "isSuccess", "stepsViewed", "totalSteps", "timestamp"] },
  ];

  const requests: any[] = [];

  // Check what needs to be created
  for (const reqSheet of requiredSheets) {
    if (!existingTitles.includes(reqSheet.title)) {
      requests.push({
        addSheet: {
          properties: { title: reqSheet.title }
        }
      });
    }
  }

  // Execute batch creation if any are missing
  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
    
    // After creating sheets, add headers
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
        
        // Also format headers to be bold
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
  }
}

// ---------------------------------------------------------------------------
// In-Memory Cache (For Server Actions Performance)
// ---------------------------------------------------------------------------
type CacheEntry = {
  data: any[];
  timestamp: number;
};
const sheetCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function clearCache(sheetName?: string) {
  if (sheetName) {
    for (const key of sheetCache.keys()) {
      if (key.startsWith(`${sheetName}!`)) {
        sheetCache.delete(key);
      }
    }
  } else {
    sheetCache.clear();
  }
}

// ---------------------------------------------------------------------------
// Mapping Helpers
// ---------------------------------------------------------------------------

export function getIndexCaseInsensitive(headers: string[], name: string): number {
  const nameLower = name.toLowerCase();
  return headers.findIndex(h => h && h.trim().toLowerCase() === nameLower);
}

export function mapRowToObject(headers: string[], row: any[]): Record<string, any> {
  const obj: Record<string, any> = {};
  headers.forEach((header, index) => {
    if (header) {
      obj[header.trim()] = row[index] !== undefined ? row[index] : "";
    }
  });
  
  return new Proxy(obj, {
    get(target, prop) {
      if (typeof prop === "string") {
        const propLower = prop.toLowerCase();
        for (const key of Object.keys(target)) {
          if (key.toLowerCase() === propLower) {
            return target[key];
          }
        }
      }
      return target[prop as string];
    },
    has(target, prop) {
      if (typeof prop === "string") {
        const propLower = prop.toLowerCase();
        for (const key of Object.keys(target)) {
          if (key.toLowerCase() === propLower) {
            return true;
          }
        }
      }
      return prop in target;
    }
  });
}

export function mapObjectToRow(headers: string[], obj: Record<string, any>): any[] {
  return headers.map(header => {
    if (header) {
      const cleanHeader = header.trim();
      if (obj[cleanHeader] !== undefined) {
        return obj[cleanHeader];
      }
      const headerLower = cleanHeader.toLowerCase();
      for (const key of Object.keys(obj)) {
        if (key.toLowerCase() === headerLower) {
          return obj[key];
        }
      }
    }
    return "";
  });
}

// ---------------------------------------------------------------------------
// CRUD Helpers
// ---------------------------------------------------------------------------

export async function readSheet(range: string) {
  // Check cache first
  const cached = sheetCache.get(range);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const sheets = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  
  const data = response.data.values || [];
  
  // Save to cache
  sheetCache.set(range, { data, timestamp: Date.now() });
  
  return data;
}

export async function appendRow(range: string, values: any[]) {
  // Range is usually in format "SheetName!A2:Z", extract SheetName for targeted invalidation
  const sheetName = range.split('!')[0];
  if (sheetName) clearCache(sheetName);
  const sheets = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [values]
    }
  });
}

// In Google Sheets, updating a specific row requires knowing its row number.
export async function updateRowById(sheetName: string, id: string, updatedValues: any[]) {
  clearCache(sheetName); // Invalidate cache before/after updates
  const sheets = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();
  
  // Read all rows to find the index
  const data = await readSheet(`${sheetName}!A:Z`);
  const headers = data[0] || [];
  let idIndex = getIndexCaseInsensitive(headers, 'id');
  if (idIndex === -1) idIndex = getIndexCaseInsensitive(headers, 'employeeCode');
  if (idIndex === -1) idIndex = 0; // Fallback to first column

  const rowIndex = data.findIndex(row => row[idIndex] === id);
  
  if (rowIndex === -1) {
    throw new Error(`Row with ID ${id} not found in ${sheetName}`);
  }
  
  // rowIndex is 0-indexed, Sheets is 1-indexed.
  // Example: rowIndex 1 => Row 2.
  const sheetRow = rowIndex + 1;
  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${sheetRow}:Z${sheetRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [updatedValues]
    }
  });
}

export async function deleteRowById(sheetName: string, id: string) {
  clearCache(sheetName); // Invalidate cache for this sheet
  const sheets = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();
  
  // Read all rows to find the index
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetId = meta.data.sheets?.find(s => s.properties?.title === sheetName)?.properties?.sheetId;
  
  if (sheetId === undefined) throw new Error(`Sheet ${sheetName} not found`);

  const data = await readSheet(`${sheetName}!A:Z`);
  const headers = data[0] || [];
  let idIndex = getIndexCaseInsensitive(headers, 'id');
  if (idIndex === -1) idIndex = getIndexCaseInsensitive(headers, 'employeeCode');
  if (idIndex === -1) idIndex = 0; // Fallback

  const rowIndex = data.findIndex(row => row[idIndex] === id);
  
  if (rowIndex === -1) {
    throw new Error(`Row with ID ${id} not found in ${sheetName}`);
  }
  
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1
            }
          }
        }
      ]
    }
  });
}
