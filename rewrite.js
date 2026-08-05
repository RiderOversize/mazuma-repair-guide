const fs = require('fs');
let content = fs.readFileSync('lib/sheets-db.ts', 'utf-8');

const endOfTopModels = `  return sorted;
}
`;

const startIdx = content.indexOf(endOfTopModels);
if (startIdx !== -1) {
  const before = content.substring(0, startIdx + endOfTopModels.length);
  const correctBottom = `
import { SubCategory, MasterDataMapping } from './types';
import { readSheet, appendRow, updateRowById, deleteRowById, mapRowToObject, mapObjectToRow, getIndexCaseInsensitive, SHEETS } from './google-sheets';

export async function getSubCategories(): Promise<SubCategory[]> {
  const allRows = await readSheet(\`\${SHEETS.SUBCATEGORIES}!A1:Z\`);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  return rows.map(r => mapRowToObject(headers, r) as any);
}
export async function createSubCategory(data: Partial<SubCategory>): Promise<SubCategory> {
  const allRows = await readSheet(\`\${SHEETS.SUBCATEGORIES}!A1:Z\`);
  const headers = allRows[0] || [];
  const id = data.id || \`subcat-\${Date.now()}\`;
  const obj = { ...data, id };
  const rowToAppend = mapObjectToRow(headers, obj);
  await appendRow(\`\${SHEETS.SUBCATEGORIES}!A2:Z\`, rowToAppend);
  return obj as any;
}
export async function updateSubCategory(id: string, data: Partial<SubCategory>): Promise<SubCategory> {
  const all = await getSubCategories();
  const existing = all.find(x => x.id === id);
  if (!existing) throw new Error('Not found');
  const merged = { ...existing, ...data };
  const allRows = await readSheet(\`\${SHEETS.SUBCATEGORIES}!A1:Z\`);
  const headers = allRows[0] || [];
  await updateRowById(SHEETS.SUBCATEGORIES, id, mapObjectToRow(headers, merged));
  return merged as any;
}
export async function deleteSubCategory(id: string): Promise<void> {
  await deleteRowById(SHEETS.SUBCATEGORIES, id);
}

export async function getMasterDataMappings(): Promise<MasterDataMapping[]> {
  const allRows = await readSheet(\`\${SHEETS.MASTER_DATA}!A1:Z\`);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  return rows.map(r => mapRowToObject(headers, r) as any);
}
export async function createMasterDataMapping(data: Partial<MasterDataMapping>): Promise<MasterDataMapping> {
  const allRows = await readSheet(\`\${SHEETS.MASTER_DATA}!A1:Z\`);
  const headers = allRows[0] || [];
  const id = data.id || \`map-\${Date.now()}\`;
  const obj = { ...data, id };
  await appendRow(\`\${SHEETS.MASTER_DATA}!A2:Z\`, mapObjectToRow(headers, obj));
  return obj as any;
}
export async function updateMasterDataMapping(id: string, data: Partial<MasterDataMapping>): Promise<MasterDataMapping> {
  const all = await getMasterDataMappings();
  const existing = all.find(x => x.id === id);
  if (!existing) throw new Error('Not found');
  const merged = { ...existing, ...data };
  const allRows = await readSheet(\`\${SHEETS.MASTER_DATA}!A1:Z\`);
  const headers = allRows[0] || [];
  await updateRowById(SHEETS.MASTER_DATA, id, mapObjectToRow(headers, merged));
  return merged as any;
}
export async function deleteMasterDataMapping(id: string): Promise<void> {
  await deleteRowById(SHEETS.MASTER_DATA, id);
}
`;
  fs.writeFileSync('lib/sheets-db.ts', before + correctBottom);
  console.log('Fixed lib/sheets-db.ts successfully');
} else {
  console.error('Could not find anchor point!');
}
