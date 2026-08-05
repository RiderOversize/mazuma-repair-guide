import fs from 'fs';

let content = fs.readFileSync('lib/sheets-db.ts', 'utf8');

const regex = /export async function createGuide[\s\S]*?export async function deleteGuide/m;

const newCode = `export async function createGuide(guide: Guide): Promise<Guide> {
  const newGuide: Guide = {
    ...guide,
    id: guide.id || \`guide-\${Date.now()}\`
  };
  
  const allRows = await readSheet(\`\${SHEETS.GUIDES}!A1:Z\`);
  const headers = allRows[0] || [];
  
  const objToSave = {
    "ID": Date.now().toString(),
    "รหัสอาการเสีย": newGuide.symptomId,
    "อาการเสีย": "",
    "รหัสหัวขัอการตรวจสอบ": newGuide.id,
    "หัวข้อการตรวจสอบ": newGuide.title,
    "ลิงค์ VDO": newGuide.mediaUrl || "",
    "ลิงค์ PDF": newGuide.pdfUrl || ""
  };
  
  const rowToAppend = mapObjectToRow(headers, objToSave);
  await appendRow(\`\${SHEETS.GUIDES}!A2:Z\`, rowToAppend);
  return newGuide;
}

export async function updateGuide(id: string, updates: Partial<Guide>): Promise<Guide> {
  const guides = await getGuides();
  const existing = guides.find(g => g.id === id);
  if (!existing) throw new Error("Guide not found");
  
  const merged = { ...existing, ...updates } as Guide;
  const allRows = await readSheet(\`\${SHEETS.GUIDES}!A1:Z\`);
  const headers = allRows[0] || [];
  
  const objToSave = {
    "ID": existing.id || Date.now().toString(),
    "รหัสอาการเสีย": merged.symptomId,
    "อาการเสีย": "",
    "รหัสหัวขัอการตรวจสอบ": merged.id,
    "หัวข้อการตรวจสอบ": merged.title,
    "ลิงค์ VDO": merged.mediaUrl || "",
    "ลิงค์ PDF": merged.pdfUrl || ""
  };
  
  const rowToUpdate = mapObjectToRow(headers, objToSave as Record<string, any>);
  await updateRowById(SHEETS.GUIDES, id, rowToUpdate);
  return merged;
}

export async function deleteGuide`;

content = content.replace(regex, newCode);
fs.writeFileSync('lib/sheets-db.ts', content);
