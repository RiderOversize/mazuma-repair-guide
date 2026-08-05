import { deleteRowById } from '../lib/google-sheets';
import { SHEETS } from '../lib/google-sheets';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function cleanup() {
  console.log('Cleaning up row with ID: F1-00-80');
  await deleteRowById(SHEETS.SUBCATEGORIES, 'F1-00-80');
  console.log('Cleanup complete.');
}

cleanup().catch(console.error);
