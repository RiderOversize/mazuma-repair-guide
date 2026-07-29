import { NextResponse } from 'next/server';
import Client from 'ssh2-sftp-client';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

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
    
    // Fetch SubCategories map to translate Thai names to IDs
    const subCatSheet = doc.sheetsByTitle['SubCategories'];
    const subCatMap = new Map();
    if (subCatSheet) {
      const subCatRows = await subCatSheet.getRows();
      subCatRows.forEach(r => {
        const name = r.get('name');
        const id = r.get('id');
        if (name && id) {
          subCatMap.set(name.trim(), id);
        }
      });
    }
    
    // 7. Load existing rows to perform Upsert
    const rows = await sheet.getRows();
    
    // 8. Create a map of existing products by 'code' (primary key)
    const existingProductsMap = new Map();
    rows.forEach(row => {
      const code = row.get('code');
      if (code) {
        existingProductsMap.set(code, row);
      }
    });
    
    // 9. Process incoming data
    const rowsToAdd: any[] = [];
    let updateCount = 0;
    
    for (const item of dataArray) {
      // Mapping from the actual SFTP JSON structure
      const code = item.MATUnitUSERID || item.productCode || item.code || item.PRODUCT_CODE || item.matCode;
      if (!code) continue; 
      
      const itemName = item.MAT || item.productName || item.name || item.PRODUCT_NAME || item.itemName || '';
      const rawCat = item.MATCategoryUSERID_Full || item.categoryCode || item.categoryId || item.subCategoryId || '';
      
      const subCatId = subCatMap.get(rawCat.trim());
      if (!subCatId) {
         // Skip if subcategory is not found in the DB (avoids junk categories)
         continue;
      }
      
      // Derive categoryId from the first segment of subCatId (e.g., F1 from F1-01-00)
      const categoryId = subCatId.split('-')[0];

      const existingRow = existingProductsMap.get(code);
      const currentTime = new Date().toISOString();
      
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
        
        // Also update updatedAt if changed, or if it doesn't have an updatedAt yet
        if (changed || !existingRow.get('updatedAt')) {
          existingRow.assign({ 'updatedAt': currentTime });
          await existingRow.save();
          updateCount++;
        }
      } else {
        // Insert new
        rowsToAdd.push({
          'id': `m-${code}-${Date.now()}`,
          'code': code,
          'name': itemName,
          'categoryId': categoryId,
          'subcategoryId': subCatId,
          'status': 'active', 
          'createdAt': currentTime,
          'updatedAt': currentTime,
        });
      }
    }
    
    // 10. Append new rows
    if (rowsToAdd.length > 0) {
      await sheet.addRows(rowsToAdd);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully synced SFTP data to Google Sheets (Upsert)',
      stats: {
        totalReceived: dataArray.length,
        updated: updateCount,
        inserted: rowsToAdd.length,
      },
      debug: (updateCount === 0 && rowsToAdd.length === 0 && dataArray.length > 0) 
        ? { sampleItem: dataArray[0] } 
        : undefined
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
