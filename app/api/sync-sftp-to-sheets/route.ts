import { NextResponse } from 'next/server';
import Client from 'ssh2-sftp-client';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { clearCache, SHEETS } from '@/lib/google-sheets';

export const maxDuration = 300; // 5 minutes

// Developed for: นาย ภานุเดช ตะวงษ์

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  // Protect the route from unauthorized access
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', { status: 401 });
  }

  const sftp = new Client();
  
  try {
    // 1. Connect to the SFTP server
    await sftp.connect({
      host: process.env.SFTP_HOST,
      port: parseInt(process.env.SFTP_PORT || '22', 10),
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD,
    });

    // 2. Fetch the file from the remote path
    const remotePath = '/uploads/MATUnit.json';
    const buffer = await sftp.get(remotePath);
    
    // 3. Close the SFTP connection immediately after fetching
    await sftp.end();

    // 4. Parse the JSON buffer
    const fileContent = buffer.toString('utf8');
    const jsonData = JSON.parse(fileContent);
    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
    
    // 5. Initialize GoogleSpreadsheet using the Service Account JWT
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID as string, serviceAccountAuth);
    await doc.loadInfo(); 

    // 6. Select the 'Models' sheet
    const sheet = doc.sheetsByTitle['Models'];
    if (!sheet) {
      throw new Error("Sheet 'Models' not found in the Google Spreadsheet.");
    }
    
    // 5. Load ProductGroup & ProductCategory mapping
    const groupSheet = doc.sheetsByTitle['ProductGroup'];
    const groupMap = new Map<string, string>(); // Index (e.g. F1) -> ID (e.g. 1)
    if (groupSheet) {
      const groupRows = await groupSheet.getRows();
      groupRows.forEach(r => {
        const id = r.get('ID') || r.get('id');
        const index = r.get('Index') || r.get('index');
        if (id && index) groupMap.set(index.trim(), id.trim());
      });
    }

    const subCatSheet = doc.sheetsByTitle['ProductCategory'];
    interface SubCatInfo {
      id: string;
      index: string; // e.g. F1, F2, F3
      matCode: string; // e.g. F1-01-00
      name: string; // e.g. เครื่องทำน้ำอุ่น
    }
    const subCatMap = new Map<string, SubCatInfo>();
    if (subCatSheet) {
      const subCatRows = await subCatSheet.getRows();
      subCatRows.forEach(r => {
        const name = (r.get('Description') || r.get('name') || '').trim();
        const id = (r.get('ID') || r.get('id') || '').trim();
        const index = (r.get('Index') || r.get('index') || '').trim();
        const matCode = (r.get('MAT Category Code') || r.get('MATCategoryCode') || '').trim();
        
        const info: SubCatInfo = { id, index, matCode, name };
        if (name) subCatMap.set(name, info);
        if (matCode) subCatMap.set(matCode, info);
        if (id) subCatMap.set(id, info);
      });
    }

    // 6.2 Load MasterData mappings
    const masterDataMap = new Map<string, string>();
    if (doc.sheetsByTitle[SHEETS.MASTERDATA]) {
      const mdRows = await doc.sheetsByTitle[SHEETS.MASTERDATA].getRows();
      mdRows.forEach((r: any) => {
        const code = (r.get('รหัสสินค้า') || r.get('modelCode') || '').trim();
        const name = (r.get('ชื่อสินค้า') || r.get('modelName') || '').trim();
        const symType = (r.get('รหัสประเภทอาการ') || r.get('symptomTypeCode') || '').trim();
        if (code && symType) masterDataMap.set(code, symType);
        if (name && symType) masterDataMap.set(name, symType);
      });
    }
    
    // 7. Load existing rows to perform Upsert
    const rows = await sheet.getRows();
    const currentTime = new Date().toISOString();
    
    // 8. Create a map of existing products by 'code' (primary key)
    // And pre-populate rowsToUpdate to update lastSyncAt for ALL rows
    const existingProductsMap = new Map();
    const rowsToUpdate: any[] = [];
    rows.forEach(row => {
      const code = row.get('code');
      if (code) {
        existingProductsMap.set(code, row);
      }
      
      // Update lastSyncAt for EVERY existing row
      row.assign({ 'lastSyncAt': currentTime });
      rowsToUpdate.push(row);
    });
    
    // 9. Process incoming data
    const rowsToAdd: any[] = [];
    let updateCount = 0;
    
    for (const item of dataArray) {
      // Mapping from the actual SFTP JSON structure
      const code = item.MATUnitUSERID || item.productCode || item.code || item.PRODUCT_CODE || item.matCode;
      if (!code) continue; 
      
      const itemName = item.MAT || item.productName || item.name || item.PRODUCT_NAME || item.itemName || '';
      const rawCat = (item.MATCategoryUSERID_Full || item.categoryCode || item.categoryId || item.subCategoryId || '').trim();
      
      let matchedInfo = subCatMap.get(rawCat);
      if (!matchedInfo) {
        // Try partial match
        for (const [key, value] of subCatMap.entries()) {
          if (key && (key.includes(rawCat) || rawCat.includes(key))) {
            matchedInfo = value;
            break;
          }
        }
      }

      if (!matchedInfo) {
         // Skip if subcategory is not found in the DB (avoids junk categories)
         continue;
      }
      
      // Correct categoryId (Index like F1, F2, F3) and subcategoryId (ID like 1, 2, 27)
      const categoryId = matchedInfo.index || (matchedInfo.matCode ? matchedInfo.matCode.split('-')[0] : '');
      const subCatId = matchedInfo.id || rawCat;

      const existingRow = existingProductsMap.get(code);
      const targetSymType = (existingRow ? existingRow.get('symptomTypeId') : '') || masterDataMap.get(code) || masterDataMap.get(itemName) || '';
      
      if (existingRow) {
        // Update if properties changed
        let changed = false;
        
        if (existingRow.get('name') !== itemName) {
           existingRow.assign({ 'name': itemName });
           changed = true;
        }
        if (existingRow.get('subcategoryId') !== subCatId) {
           existingRow.assign({ 'subcategoryId': subCatId });
           changed = true;
        }
        if (existingRow.get('categoryId') !== categoryId) {
           existingRow.assign({ 'categoryId': categoryId });
           changed = true;
        }
        if (targetSymType && existingRow.get('symptomTypeId') !== targetSymType) {
           existingRow.assign({ 'symptomTypeId': targetSymType });
           changed = true;
        }
        
        if (changed) {
          existingRow.assign({ 'updatedAt': currentTime });
          updateCount++;
        }
        // Note: lastSyncAt is already updated above, and row is already in rowsToUpdate
        
      } else {
        // Insert new
        const newRow = {
          'id': `m-${code}-${Date.now()}`,
          'code': code,
          'name': itemName,
          'categoryId': categoryId,
          'subcategoryId': subCatId,
          'symptomTypeId': targetSymType,
          'status': 'active', 
          'createdAt': currentTime,
          'updatedAt': currentTime,
          'lastSyncAt': currentTime,
        };
        rowsToAdd.push(newRow);
      }
    }
    
    // Save updates in batch using googleapis to avoid rate limits
    if (rowsToUpdate.length > 0) {
      const { google } = require('googleapis');
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      const sheets = google.sheets({ version: 'v4', auth });
      
      const dataRanges = rowsToUpdate.map(row => {
        const rowArray = sheet.headerValues.map(header => row.get(header) || '');
        return {
          range: `Models!A${row.rowNumber}`,
          values: [rowArray]
        };
      });

      // Batch update in chunks of 500 ranges
      const chunkSize = 500;
      for (let i = 0; i < dataRanges.length; i += chunkSize) {
        const batch = dataRanges.slice(i, i + chunkSize);
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID as string,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: batch
          }
        });
      }
    }
    
    // Add new rows
    if (rowsToAdd.length > 0) {
      await sheet.addRows(rowsToAdd);
    }
    
    try {
      const activitySheet = doc.sheetsByTitle['ActivityLogs'];
      if (activitySheet) {
        await activitySheet.addRow({
          id: `log-${Date.now()}`,
          action: 'update',
          resource: 'system',
          userCode: 'SYSTEM_CRON',
          userName: 'SFTP Auto Sync',
          timestamp: new Date().toISOString(),
          details: `Synced ${dataArray.length} items (Updated: ${updateCount}, Inserted: ${rowsToAdd.length})`
        });
      }
    } catch (logError) {
      console.error('Failed to log sync activity:', logError);
    }
    
    // Invalidate Next.js cache so the frontend sees the new models and new activity log immediately
    try {
      clearCache();
    } catch (cacheErr) {
      console.warn('Could not clear cache (this is normal if running as an isolated script):', cacheErr);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully synced SFTP data to Google Sheets (Upsert)',
      stats: {
        totalReceived: dataArray.length,
        updated: updateCount,
        inserted: rowsToAdd.length,
      }
    });

  } catch (error: any) {
    console.error('Error syncing SFTP to Sheets:', error);
    
    // Ensure SFTP connection is closed on error
    try { await sftp.end(); } catch (e) {}
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
