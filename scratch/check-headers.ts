import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');
const auth = new google.auth.GoogleAuth({ credentials: { client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, private_key: privateKey }, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
const sheets = google.sheets({ version: 'v4', auth });
const sid = process.env.GOOGLE_SHEETS_ID!;

async function main() {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: sid, range: 'Models!A1:Z1' });
  console.log('Models headers:', JSON.stringify(res.data.values?.[0]));
  const res2 = await sheets.spreadsheets.values.get({ spreadsheetId: sid, range: 'ProductCategory!A1:Z1' });
  console.log('ProductCategory headers:', JSON.stringify(res2.data.values?.[0]));
  const res3 = await sheets.spreadsheets.values.get({ spreadsheetId: sid, range: 'ProductCategory!A2:C5' });
  console.log('ProductCategory sample:', JSON.stringify(res3.data.values));
  const res4 = await sheets.spreadsheets.values.get({ spreadsheetId: sid, range: 'Models!A2:K3' });
  console.log('Models sample:', JSON.stringify(res4.data.values));
}
main();
