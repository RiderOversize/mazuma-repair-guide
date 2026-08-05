import fs from 'fs';

let content = fs.readFileSync('lib/sheets-db.ts', 'utf8');

content = content.replace(
  /const objToSave = {\s*"ID": Date.now\(\).toString\(\),/g,
  `const lastId = allRows.length > 1 ? parseInt(allRows[allRows.length - 1][0] || "0") || 0 : 0;
  const newId = (lastId + 1).toString();
  
  const objToSave = {
    "ID": newId,`
);

fs.writeFileSync('lib/sheets-db.ts', content);
