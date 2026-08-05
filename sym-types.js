require('dotenv').config({ path: '.env.local' });
const { readSheet, SHEETS } = require('./lib/google-sheets');
async function main() {
  try {
    const rows = await readSheet(SHEETS.SYMPTOM_TYPES + '!A1:Z');
    console.log('=== Symptom Type Headers ===');
    console.log(JSON.stringify(rows[0]));
    console.log('=== First 3 Rows ===');
    rows.slice(1, 4).forEach((r,i) => {
      console.log(i, JSON.stringify(r));
    });
  } catch(e) {
    console.error('Error:', e);
  }
}
main();
