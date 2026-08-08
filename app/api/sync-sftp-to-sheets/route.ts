import { NextResponse } from 'next/server';
import Client from 'ssh2-sftp-client';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { clearCache } from '@/lib/google-sheets';

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
    
    // Fetch SubCategories map to translate Thai names to IDs
    const subCatSheet = doc.sheetsByTitle['ProductCategory'];
    const subCatMap = new Map();
    if (subCatSheet) {
      const subCatRows = await subCatSheet.getRows();
      subCatRows.forEach(r => {
        const name = r.get('Description') || r.get('name');
        const id = r.get('ID') || r.get('id');
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
    const rowsToUpdate: any[] = [];
    let updateCount = 0;
    
    for (const item of dataArray) {
      // Mapping from the actual SFTP JSON structure
      const code = item.MATUnitUSERID || item.productCode || item.code || item.PRODUCT_CODE || item.matCode;
      if (!code) continue; 
      
      const itemName = item.MAT || item.productName || item.name || item.PRODUCT_NAME || item.itemName || '';
      const rawCat = item.MATCategoryUSERID_Full || item.categoryCode || item.categoryId || item.subCategoryId || '';
      
      let subCatId = subCatMap.get(rawCat.trim());
      if (!subCatId) {
        // Try partial match
        for (const [key, value] of subCatMap.entries()) {
          if (key.includes(rawCat.trim()) || rawCat.trim().includes(key)) {
            subCatId = value;
            break;
          }
        }
      }

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
        
        if (changed) {
          existingRow.assign({ 'updatedAt': currentTime, 'lastSyncAt': currentTime });
          updateCount++;
          rowsToUpdate.push(existingRow);
        }
        
      } else {
        // Insert new
        const newRow = {
          'id': `m-${code}-${Date.now()}`,
          'code': code,
          'name': itemName,
          'categoryId': categoryId,
          'subcategoryId': subCatId,
          'status': 'active', 
          'createdAt': currentTime,
          'updatedAt': currentTime,
          'lastSyncAt': currentTime,
        };
        rowsToAdd.push(newRow);
      }
    }
    
    // Save updates in chunks to avoid rate limits
    if (rowsToUpdate.length > 0) {
      for (const row of rowsToUpdate) {
        await row.save();
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
