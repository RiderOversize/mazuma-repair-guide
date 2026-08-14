import Client from 'ssh2-sftp-client';
import { google } from "googleapis";
import * as dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

async function main() {
  const sftp = new Client();
  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: privateKey },
      scopes: SCOPES,
    });
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

    // Step 0: Load ProductGroup to map Index -> categoryId
    console.log("Fetching ProductGroup...");
    const groupsRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'ProductGroup!A1:Z' });
    const groupAllRows = groupsRes.data.values || [];
    const groupHeaders = groupAllRows[0] || [];
    const groupDataRows = groupAllRows.slice(1);
    const groupIdIdx = groupHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'id');
    const groupIndexIdx = groupHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'index');
    const groupMap = new Map<string, string>(); // Index (e.g., F1) -> ID (e.g., 1)
    for (const row of groupDataRows) {
      const id = row[groupIdIdx]?.trim();
      const idx = row[groupIndexIdx]?.trim();
      if (id && idx) groupMap.set(idx, id);
    }
    console.log('  Loaded ' + groupMap.size + ' product groups');

    // Step 1: Load ProductCategory
    console.log("Fetching ProductCategory...");
    const subcatsRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'ProductCategory!A1:Z' });
    const subcatAllRows = subcatsRes.data.values || [];
    const subcatHeaders = subcatAllRows[0] || [];
    const subcatDataRows = subcatAllRows.slice(1);
    const subcatIdIdx = subcatHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'id');
    const subcatDescIdx = subcatHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'description');
    const subcatIndexIdx = subcatHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'index');
    
    // Map Description -> { subcategoryId, categoryId }
    const subcatMap = new Map<string, { subcatId: string, catId: string }>();
    for (const row of subcatDataRows) {
      const id = row[subcatIdIdx]?.trim();
      const desc = row[subcatDescIdx]?.trim();
      const idx = row[subcatIndexIdx]?.trim();
      if (id && desc) {
        const catId = idx ? (groupMap.get(idx) || "") : "";
        subcatMap.set(desc, { subcatId: id, catId });
      }
    }
    console.log('  Loaded ' + subcatMap.size + ' subcategories');

    // Step 2: Load existing Models
    console.log("Fetching existing Models...");
    const modelsRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Models!A1:Z' });
    const modelsAllRows = modelsRes.data.values || [];
    const modelsHeaders = modelsAllRows[0] || [];
    const modelsDataRows = modelsAllRows.slice(1);
    
    const mIdIdx = modelsHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'id');
    const mCatIdx = modelsHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'categoryid');
    const mSubcatIdx = modelsHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'subcategoryid');
    const mNameIdx = modelsHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'name');
    const mCodeIdx = modelsHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'code');
    const mStatusIdx = modelsHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'status');
    const mThumbIdx = modelsHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'thumbnail');
    const mCreatedIdx = modelsHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'createdat');
    const mUpdatedIdx = modelsHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'updatedat');
    const mSyncIdx = modelsHeaders.findIndex((h: string) => h.trim().toLowerCase() === 'lastsyncat');
    
    const existingByCode = new Map<string, any[]>();
    for (const row of modelsDataRows) {
      const code = row[mCodeIdx]?.trim();
      if (code) existingByCode.set(code, row);
    }
    console.log('  Found ' + existingByCode.size + ' existing models');

    // Step 3: Fetch from SFTP
    console.log("Connecting to SFTP...");
    await sftp.connect({ host: process.env.SFTP_HOST, port: parseInt(process.env.SFTP_PORT || '22', 10), username: process.env.SFTP_USERNAME, password: process.env.SFTP_PASSWORD });
    console.log("Downloading MATUnit.json...");
    const data = await sftp.get('/uploads/MATUnit.json');
    const json = JSON.parse(data.toString('utf8'));
    let matched: any[] = [];
    if (Array.isArray(json)) {
      matched = json.filter((item: any) => {
        const code = item.MATUnitUSERID;
        const categoryName = item.MATCategoryUSERID_Full || "";
        const hasFOrC = code && typeof code === 'string' && (code.includes('-F') || code.includes('-C'));
        const hasKeyword = categoryName.includes('เครื่อง') || categoryName.includes('ตู้');
        return hasFOrC && hasKeyword;
      });
    }
    console.log('  Found ' + matched.length + ' items with -F/-C and category has เครื่อง/ตู้');

    // Step 4: Upsert
    const nowISO = new Date().toISOString();
    const processedCodes = new Set<string>();
    const finalRows: any[][] = [];
    let updateCount = 0;
    let newCount = 0;

    for (const m of matched) {
      const code = (m.MATUnitUSERID || "").trim();
      if (!code || processedCodes.has(code)) continue;
      processedCodes.add(code);
      
      const name = (m.MAT || "").trim();
      const sftpCatName = (m.MATCategoryUSERID_Full || "").trim();
      
      const mapped = subcatMap.get(sftpCatName) || { subcatId: sftpCatName, catId: "" };
      const existing = existingByCode.get(code);

      if (existing) {
        const row = new Array(modelsHeaders.length).fill("");
        const existingId = existing[mIdIdx] || "";
        const isValidUUID = existingId.length > 20 && !existingId.includes('-F') && !existingId.includes('-C');
        
        row[mIdIdx] = isValidUUID ? existingId : crypto.randomUUID();
        if (mCatIdx !== -1) row[mCatIdx] = mapped.catId;
        if (mSubcatIdx !== -1) row[mSubcatIdx] = mapped.subcatId;
        row[mNameIdx] = name || existing[mNameIdx] || "";
        row[mCodeIdx] = code;
        row[mStatusIdx] = existing[mStatusIdx] || "active";
        row[mThumbIdx] = existing[mThumbIdx] || "";
        row[mCreatedIdx] = existing[mCreatedIdx] || nowISO;
        row[mUpdatedIdx] = nowISO;
        if (mSyncIdx !== -1) row[mSyncIdx] = nowISO;
        
        finalRows.push(row);
        existingByCode.delete(code);
        updateCount++;
      } else {
        const row = new Array(modelsHeaders.length).fill("");
        row[mIdIdx] = crypto.randomUUID();
        if (mCatIdx !== -1) row[mCatIdx] = mapped.catId;
        if (mSubcatIdx !== -1) row[mSubcatIdx] = mapped.subcatId;
        row[mNameIdx] = name;
        row[mCodeIdx] = code;
        row[mStatusIdx] = "active";
        row[mThumbIdx] = "";
        row[mCreatedIdx] = nowISO;
        row[mUpdatedIdx] = nowISO;
        if (mSyncIdx !== -1) row[mSyncIdx] = nowISO;
        
        finalRows.push(row);
        newCount++;
      }
    }

    // Keep models not in SFTP
    let keptCount = 0;
    for (const [, row] of existingByCode.entries()) {
      while (row.length < modelsHeaders.length) row.push("");
      const existingId = row[mIdIdx] || "";
      if (existingId.includes('-F') || existingId.includes('-C')) {
        row[mIdIdx] = crypto.randomUUID();
      }
      finalRows.push(row);
      keptCount++;
    }

    console.log('\nUpsert summary:');
    console.log('  Updated: ' + updateCount);
    console.log('  New:     ' + newCount);
    console.log('  Kept:    ' + keptCount);
    console.log('  Total:   ' + finalRows.length);

    // Step 5: Write back
    console.log("\nClearing Models data rows...");
    await sheets.spreadsheets.values.batchClear({ spreadsheetId, requestBody: { ranges: ['Models!A2:Z10000'] } });
    console.log("Writing merged data...");
    await sheets.spreadsheets.values.update({ spreadsheetId, range: 'Models!A2', valueInputOption: "USER_ENTERED", requestBody: { values: finalRows } });
    console.log("\nDone! Successfully imported Models into Google Sheets!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sftp.end();
  }
}

main();
