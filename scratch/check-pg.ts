import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const pk = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');
const auth = new google.auth.GoogleAuth({ credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: pk }, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const s = google.sheets({ version: 'v4', auth });
const sid = process.env.GOOGLE_SHEETS_ID!;
async function go() {
  const r = await s.spreadsheets.values.get({ spreadsheetId: sid, range: 'ProductGroup!A1:Z5' });
  console.log('ProductGroup sample:', JSON.stringify(r.data.values, null, 2));
}
go();
