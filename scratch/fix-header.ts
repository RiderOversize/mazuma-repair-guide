import { getSheetsClient, getSpreadsheetId, SHEETS } from '../lib/google-sheets';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fixHeaders() {
  console.log('Fixing Models sheet header...');
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = await getSpreadsheetId();
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.MODELS}!A1:J1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["id", "categoryId", "subcategoryId", "symptomTypeId", "name", "code", "status", "thumbnail", "createdAt", "updatedAt"]]
      }
    });
    
    console.log('Header updated successfully! You should now see updatedAt in column J.');
  } catch (err) {
    console.error('Error updating header:', err);
  }
}

fixHeaders();
