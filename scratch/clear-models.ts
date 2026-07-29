import { getSheetsClient, getSpreadsheetId, SHEETS, clearCache } from '../lib/google-sheets';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function clearModels() {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = await getSpreadsheetId();
    console.log('Clearing Models sheet data (keeping headers)...');
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${SHEETS.MODELS}!A2:Z`,
    });
    clearCache(SHEETS.MODELS);
    console.log('Cleared successfully.');
  } catch (e) {
    console.error('Error:', e);
  }
}

clearModels();
