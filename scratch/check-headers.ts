import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const envLocal = path.resolve(process.cwd(), '.env.local');
const envRegular = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envLocal)) { dotenv.config({ path: envLocal }); }
else { dotenv.config(); }

import { readSheet, SHEETS } from '../lib/google-sheets';

async function check() {
  const data = await readSheet(SHEETS.GUIDES + '!A1:Z10');
  console.log('Guides headers:', data[0]);
  
  const dummyRows = data.filter(r => r[0] && r[0].startsWith('guide-dummy'));
  console.log('Dummy Rows:', dummyRows);
}

check().catch(console.error);
