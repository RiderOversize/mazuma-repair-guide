require('dotenv').config({ path: '.env.local' });
const { readSheet, SHEETS } = require('./lib/google-sheets');
async function main() {
  try {
    const symRows = await readSheet(SHEETS.SYMPTOMS + '!A1:Z');
    console.log('=== Symptom Headers ===');
    console.log(JSON.stringify(symRows[0]));
    console.log('=== First 3 Symptom Rows ===');
    symRows.slice(1, 4).forEach((r,i) => {
      console.log(i, JSON.stringify(r));
    });
  } catch(e) {
    console.error('Error:', e);
  }
}
main();
