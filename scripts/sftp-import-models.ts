import Client from 'ssh2-sftp-client';
import { google } from "googleapis";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEETS = { 
  MODELS: "Models",
  SUBCATEGORIES: "SubCategories"
};

async function main() {
  const sftp = new Client();
  try {
    // 1. Connect to Google Sheets
    const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: privateKey },
      scopes: SCOPES,
    });
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

    // Fetch SubCategories to map MATCategoryUSERID_Full to subcategoryId
    const subcatsRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEETS.SUBCATEGORIES}!A2:C1000` // id, categoryId, name
    });
    const subcatsRows = subcatsRes.data.values || [];
    
    // Create a map of name -> id
    const subcatMap = new Map<string, string>();
    for (const row of subcatsRows) {
      if (row[0] && row[2]) {
        subcatMap.set(row[2].trim(), row[0]);
      }
    }

    // 2. Fetch from SFTP
    console.log("Connecting to SFTP...");
    await sftp.connect({
      host: process.env.SFTP_HOST,
      port: parseInt(process.env.SFTP_PORT || '22', 10),
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD
    });

    console.log("Downloading MATUnit.json...");
    const data = await sftp.get('/uploads/MATUnit.json');
    const json = JSON.parse(data.toString('utf8'));
    
    let matched: any[] = [];
    if (Array.isArray(json)) {
      matched = json.filter(item => {
        // Find items where the MAT (name) starts with 'เครื่อง'
        return item.MAT && typeof item.MAT === 'string' && item.MAT.trim().startsWith('เครื่อง');
      });
    }
    
    console.log(`Found ${matched.length} Models starting with "เครื่อง". Preparing data...`);
    
    // Format for Models: ["id", "categoryId", "subcategoryId", "symptomTypeId", "name", "code", "status", "thumbnail", "createdAt", "updatedAt"]
    const rows = matched.map((m) => {
      const subcategoryName = m.MATCategoryUSERID_Full || "";
      const subcategoryId = subcatMap.get(subcategoryName.trim()) || subcategoryName; // fallback to name if not found
      
      return [
        m.MATUnitUSERID || `model-${Date.now()}-${Math.random().toString(36).substring(7)}`, // id
        "",                   // categoryId
        subcategoryId,        // subcategoryId
        "",                   // symptomTypeId
        m.MAT || "",          // name
        m.MATUnitUSERID || "",// code
        "active",             // status
        "",                   // thumbnail
        new Date().toISOString(),
        new Date().toISOString()
      ];
    });

    console.log("Clearing existing Models data...");
    await sheets.spreadsheets.values.batchClear({
      spreadsheetId,
      requestBody: { ranges: [`${SHEETS.MODELS}!A2:Z10000`] }
    });

    console.log("Uploading Models to Google Sheets...");
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.MODELS}!A2:Z10000`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows }
    });

    console.log("Successfully imported Models into Google Sheets!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sftp.end();
  }
}

main();
