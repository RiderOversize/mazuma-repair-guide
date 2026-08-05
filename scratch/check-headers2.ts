import { config } from 'dotenv';
config({ path: '.env.local' });
import { readSheet, SHEETS } from '../lib/google-sheets';

async function main() {
  try {
    for (const [key, name] of Object.entries(SHEETS)) {
      const data = await readSheet(name + '!A1:Z');
      console.log(key + ' Headers:', data[0]);
    }
  } catch(e) {
    console.error('Error:', e);
  }
}
main();
