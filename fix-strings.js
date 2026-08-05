const fs = require('fs');
let content = fs.readFileSync('lib/sheets-db.ts', 'utf-8');

content = content.replace(/\\\\!A1:Z\\\\/g, '\\!A1:Z\');
content = content.replace(/readSheet\\(\\\\\\!A1:Z\\\\\\)/g, "readSheet(\\!A1:Z\)"); // this won't work well, I'll just use simple regex or exact replace

// The easier way is just to rewrite the bottom part.
const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('export async function getSubCategories'));
if (startIdx !== -1) {
  content = lines.slice(0, startIdx).join('\n') + \
export async function getSubCategories(): Promise<SubCategory[]> {
  const allRows = await readSheet(\\\\\\!A1:Z\\\);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  return rows.map(r => mapRowToObject(headers, r) as any);
}
export async function createSubCategory(data: Partial<SubCategory>): Promise<SubCategory> {
  const allRows = await readSheet(\\\\\\!A1:Z\\\);
  const headers = allRows[0] || [];
  const id = data.id || \\\subcat-\\\\\\;
  const obj = { ...data, id };
  const rowToAppend = mapObjectToRow(headers, obj);
  await appendRow(\\\\\\!A2:Z\\\, rowToAppend);
  return obj as any;
}
export async function updateSubCategory(id: string, data: Partial<SubCategory>): Promise<SubCategory> {
  const all = await getSubCategories();
  const existing = all.find(x => x.id === id);
  if (!existing) throw new Error('Not found');
  const merged = { ...existing, ...data };
  const allRows = await readSheet(\\\\\\!A1:Z\\\);
  const headers = allRows[0] || [];
  await updateRowById(SHEETS.SUBCATEGORIES, id, mapObjectToRow(headers, merged));
  return merged as any;
}
export async function deleteSubCategory(id: string): Promise<void> {
  await deleteRowById(SHEETS.SUBCATEGORIES, id);
}

export async function getMasterDataMappings(): Promise<MasterDataMapping[]> {
  const allRows = await readSheet(\\\\\\!A1:Z\\\);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  return rows.map(r => mapRowToObject(headers, r) as any);
}
export async function createMasterDataMapping(data: Partial<MasterDataMapping>): Promise<MasterDataMapping> {
  const allRows = await readSheet(\\\\\\!A1:Z\\\);
  const headers = allRows[0] || [];
  const id = data.id || \\\map-\\\\\\;
  const obj = { ...data, id };
  await appendRow(\\\\\\!A2:Z\\\, mapObjectToRow(headers, obj));
  return obj as any;
}
export async function updateMasterDataMapping(id: string, data: Partial<MasterDataMapping>): Promise<MasterDataMapping> {
  const all = await getMasterDataMappings();
  const existing = all.find(x => x.id === id);
  if (!existing) throw new Error('Not found');
  const merged = { ...existing, ...data };
  const allRows = await readSheet(\\\\\\!A1:Z\\\);
  const headers = allRows[0] || [];
  await updateRowById(SHEETS.MASTER_DATA, id, mapObjectToRow(headers, merged));
  return merged as any;
}
export async function deleteMasterDataMapping(id: string): Promise<void> {
  await deleteRowById(SHEETS.MASTER_DATA, id);
}
\;
  fs.writeFileSync('lib/sheets-db.ts', content);
}
