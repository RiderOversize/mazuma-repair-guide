import { google } from "googleapis";
import { unstable_cache, revalidateTag } from "next/cache";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export const SHEETS = {
  USERS: "Users",
  CATEGORIES: "ProductGroup",
  SUBCATEGORIES: "ProductCategory",
  SYMPTOM_TYPES: "SymptomGroup",
  SYMPTOMS: "Issue",
  MODELS: "Models",
  GUIDES: "Guide",
  GUIDE_STEPS: "GuideSteps_V2",
  FEEDBACKS: "Feedbacks",
  MASTERDATA: "MasterData",
  ACTIVITY_LOGS: "ActivityLogs",
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
    { title: SHEETS.USERS, headers: ["employeeCode", "name", "phone", "role", "status", "createdAt", "lineUserId", "avatarUrl", "assignedHeads", "accessibleMenus", "LineName"] },
    { title: SHEETS.CATEGORIES, headers: ["id", "name", "slug", "description", "status", "createdAt"] },
    { title: SHEETS.SYMPTOM_TYPES, headers: ["id", "categoryId", "name"] },
    { title: SHEETS.SYMPTOMS, headers: ["id", "symptomTypeId", "title", "description", "severity", "tags"] },
    { title: SHEETS.SUBCATEGORIES, headers: ["id", "categoryId", "name"] },
    { title: SHEETS.MODELS, headers: ["id", "categoryId", "subcategoryId", "symptomTypeId", "name", "code", "status", "thumbnail", "createdAt", "updatedAt"] },
    { title: SHEETS.GUIDES, headers: ["id", "title", "categoryId", "subcategoryId", "modelIds", "symptomTypeId", "symptomId", "description", "difficulty", "timeEstimated", "status", "tags", "toolsRequired", "partsRequired", "createdAt", "updatedAt", "steps"] },
    { title: SHEETS.GUIDE_STEPS, headers: ["id", "guideId", "stepNum", "instruction", "videoUrl", "pdfUrl", "title", "mediaUrl", "warning"] },
    { title: SHEETS.FEEDBACKS, headers: ["id", "guideId", "modelId", "userId", "userName", "isSuccess", "stepsViewed", "totalSteps", "timestamp"] },
    { title: SHEETS.ACTIVITY_LOGS, headers: ["id", "action", "resource", "resourceId", "resourceName", "userCode", "userName", "timestamp", "details"] },
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
      } else {
        // Sheet exists, let's check and append missing headers
        try {
          const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${reqSheet.title}!1:1`,
          });
          const existingHeaders = res.data.values?.[0] || [];
          const missingHeaders = reqSheet.headers.filter(h => !existingHeaders.includes(h));
          
          if (missingHeaders.length > 0) {
            const newHeaders = [...existingHeaders, ...missingHeaders];
            await sheets.spreadsheets.values.update({
              spreadsheetId,
              range: `${reqSheet.title}!A1:Z1`,
              valueInputOption: "USER_ENTERED",
              requestBody: {
                values: [newHeaders]
              }
            });
            console.log(`Added missing headers [${missingHeaders.join(', ')}] to ${reqSheet.title}`);
          }
        } catch (e) {
          console.error(`Failed to sync headers for ${reqSheet.title}`, e);
        }
      }
    }
  } else {
    // If no new sheets were created, still sync headers for existing sheets
    for (const reqSheet of requiredSheets) {
      if (existingTitles.includes(reqSheet.title)) {
        try {
          const res = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${reqSheet.title}!1:1`,
          });
          const existingHeaders = res.data.values?.[0] || [];
          const missingHeaders = reqSheet.headers.filter(h => !existingHeaders.includes(h));
          
          if (missingHeaders.length > 0) {
            const newHeaders = [...existingHeaders, ...missingHeaders];
            await sheets.spreadsheets.values.update({
              spreadsheetId,
              range: `${reqSheet.title}!A1:Z1`,
              valueInputOption: "USER_ENTERED",
              requestBody: {
                values: [newHeaders]
              }
            });
            console.log(`Added missing headers [${missingHeaders.join(', ')}] to ${reqSheet.title}`);
          }
        } catch (e) {
          console.error(`Failed to sync headers for ${reqSheet.title}`, e);
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Cache Management (Next.js Data Cache)
// ---------------------------------------------------------------------------

export function clearCache(sheetName?: string) {
  if (sheetName) {
    // @ts-expect-error Next.js 15 canary types issue
    revalidateTag(`sheet-${sheetName}`);
  } else {
    // @ts-expect-error Next.js 15 canary types issue
    revalidateTag('all-sheets');
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

export async function readSheet(range: string, forceFetch: boolean = false) {
  const sheetName = range.split('!')[0];
  
  if (forceFetch) {
    // @ts-expect-error Next.js 15 canary types issue
    revalidateTag(`sheet-${sheetName}`);
  }

  const getCachedData = unstable_cache(
    async () => {
      const sheets = await getSheetsClient();
      const spreadsheetId = await getSpreadsheetId();
      
      let response;
      try {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });
      } catch (error: any) {
        if (error.message && error.message.includes("Unable to parse range")) {
          console.log(`Sheet missing for range ${range}. Initializing sheets...`);
          await initSheets();
          response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
          });
        } else {
          throw error;
        }
      }
      
      return response.data.values || [];
    },
    [`sheet-range-${range}`],
    {
      tags: [`sheet-${sheetName}`, 'all-sheets'],
      revalidate: 3600 // Cache for 1 hour, invalidated manually on mutation
    }
  );

  return getCachedData();
}

// Batch read multiple sheets in a single API call
export async function readMultipleSheets(ranges: string[]): Promise<Record<string, any[][]>> {
  const tags = ranges.map(r => `sheet-${r.split('!')[0]}`);
  const key = `batch-${ranges.slice().sort().join('-')}`;
  
  const getCachedBatch = unstable_cache(
    async () => {
      const sheets = await getSheetsClient();
      const spreadsheetId = await getSpreadsheetId();

      try {
        const response = await sheets.spreadsheets.values.batchGet({
          spreadsheetId,
          ranges,
        });

        const result: Record<string, any[][]> = {};
        const valueRanges = response.data.valueRanges || [];
        for (let i = 0; i < ranges.length; i++) {
          result[ranges[i]] = valueRanges[i]?.values || [];
        }
        return result;
      } catch (error: any) {
        console.warn("batchGet failed, falling back to individual reads:", error.message);
        const result: Record<string, any[][]> = {};
        for (const range of ranges) {
          result[range] = await readSheet(range, true); // force fetch to bypass individual cache if batch fails
        }
        return result;
      }
    },
    [key],
    {
      tags: [...tags, 'all-sheets'],
      revalidate: 3600
    }
  );

  return getCachedBatch();
}

export async function appendRows(range: string, values: any[][]) {
  const sheetName = range.split('!')[0];
  if (sheetName) clearCache(sheetName);
  const sheets = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();
  
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: values
      }
    });
  } catch (error: any) {
    if (error.message && error.message.includes("Unable to parse range")) {
      console.log(`Sheet missing for range ${range}. Initializing sheets...`);
      await initSheets();
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: values
        }
      });
    } else {
      throw error;
    }
  }
}

export async function appendRow(range: string, values: any[]) {
  // Range is usually in format "SheetName!A2:Z", extract SheetName for targeted invalidation
  const sheetName = range.split('!')[0];
  if (sheetName) clearCache(sheetName);
  const sheets = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();
  
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [values]
      }
    });
  } catch (error: any) {
    if (error.message && error.message.includes("Unable to parse range")) {
      console.log(`Sheet missing for range ${range}. Initializing sheets...`);
      await initSheets();
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [values]
        }
      });
    } else {
      throw error;
    }
  }
}

// In Google Sheets, updating a specific row requires knowing its row number.
export async function updateRowById(sheetName: string, id: string, updatedValues: any[]) {
  clearCache(sheetName); // Invalidate cache before/after updates
  const sheets = await getSheetsClient();
  const spreadsheetId = await getSpreadsheetId();
  
  // Read all rows to find the index
  const data = await readSheet(`${sheetName}!A:Z`);
  const headers = data[0] || [];
  let idIndex = -1;
  if (sheetName === SHEETS.GUIDES) {
    idIndex = getIndexCaseInsensitive(headers, 'รหัสหัวขัอการตรวจสอบ');
  } else if (sheetName === SHEETS.SYMPTOMS || sheetName === SHEETS.SYMPTOM_TYPES) {
    idIndex = getIndexCaseInsensitive(headers, 'รหัสอาการเสีย');
  }
  
  if (idIndex === -1) idIndex = getIndexCaseInsensitive(headers, 'id');
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
  let idIndex = -1;
  if (sheetName === SHEETS.GUIDES) {
    idIndex = getIndexCaseInsensitive(headers, 'รหัสหัวขัอการตรวจสอบ');
  } else if (sheetName === SHEETS.SYMPTOMS || sheetName === SHEETS.SYMPTOM_TYPES) {
    idIndex = getIndexCaseInsensitive(headers, 'รหัสอาการเสีย');
  }
  
  if (idIndex === -1) idIndex = getIndexCaseInsensitive(headers, 'id');
  if (idIndex === -1) idIndex = getIndexCaseInsensitive(headers, 'employeeCode');
  if (idIndex === -1) idIndex = 0;

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
