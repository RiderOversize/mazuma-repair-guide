import Client from 'ssh2-sftp-client';
import { google } from "googleapis";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEETS = { SUBCATEGORIES: "SubCategories" };

async function main() {
  const sftp = new Client();
  try {
    console.log("Connecting to SFTP...");
    await sftp.connect({
      host: process.env.SFTP_HOST,
      port: parseInt(process.env.SFTP_PORT || '22', 10),
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD
    });

    console.log("Downloading MATCategory.json...");
    const data = await sftp.get('/uploads/MATCategory.json');
    const json = JSON.parse(data.toString('utf8'));
    
    let matched: any[] = [];
    if (Array.isArray(json)) {
      matched = json.filter(item => {
        return Object.values(item).some(val => 
          typeof val === 'string' && val.trim().startsWith('เครื่อง')
        );
      });
    }
    
    console.log(`Found ${matched.length} SubCategories. Saving to Google Sheets...`);
    
    // Connect to Google Sheets
    const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: privateKey },
      scopes: SCOPES,
    });
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

    // Format for SubCategories: ["id", "categoryId", "name"]
    const rows = matched.map((m, idx) => [
      `sftp-subcat-${idx + 1}`, // Generate ID
      "",                       // Blank Category ID for now (user maps manually)
      m.MATCategory             // Name
    ]);

    // Clear existing or just append? 
    // Let's clear existing SubCategories first, or just append? 
    // Since we seeded dummy data earlier, let's just overwrite row 2 to 100.
    await sheets.spreadsheets.values.batchClear({
      spreadsheetId,
      requestBody: { ranges: [`${SHEETS.SUBCATEGORIES}!A2:Z100`] }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEETS.SUBCATEGORIES}!A2:Z100`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows }
    });

    console.log("Successfully imported into SubCategories sheet!");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await sftp.end();
  }
}

main();
