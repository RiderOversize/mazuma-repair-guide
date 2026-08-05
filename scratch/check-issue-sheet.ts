import { readSheet } from '../lib/google-sheets';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  const allRows = await readSheet('Issue!A1:Z');
  console.log("Headers:");
  console.log(allRows[0]);
  console.log("Row 1:");
  console.log(allRows[1]);
  console.log("Row 2:");
  console.log(allRows[2]);
}

check().catch(console.error);
