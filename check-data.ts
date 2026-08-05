import { readSheet, SHEETS } from './lib/google-sheets';
async function main() {
  try {
    const catRows = await readSheet(SHEETS.CATEGORIES + '!A1:Z');
    console.log('=== Category Headers ===');
    console.log(JSON.stringify(catRows[0]));
    console.log('=== First 3 Category Rows ===');
    catRows.slice(1, 4).forEach((r,i) => {
      console.log(i, JSON.stringify(r));
    });
  } catch(e) {
    console.error('Error:', e);
  }
}
main();
