import { getGuides } from '../lib/sheets-db';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verifyUpdate() {
  const guides = await getGuides();
  const guide = guides.find(g => g.id === 'guide-1785298237014-1');
  console.log('Guide title in sheet:', guide?.title);
}

verifyUpdate();
