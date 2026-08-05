import fs from 'fs';

let content = fs.readFileSync('lib/sheets-db.ts', 'utf8');

const missingFunctions = `
export async function deleteSymptom(id: string): Promise<void> {
  await deleteRowById(SHEETS.SYMPTOMS, id);
}

// ---------------------------------------------------------------------------
// Guides
// ---------------------------------------------------------------------------
export async function getGuides(): Promise<Guide[]> {
  const guideAllRows = await readSheet(\`\${SHEETS.GUIDES}!A1:Z\`);
  const guideHeaders = guideAllRows[0] || [];
  const guideRows = guideAllRows.slice(1);
  
  const guideIdIdx = getIndexCaseInsensitive(guideHeaders, 'รหัสหัวขัอการตรวจสอบ');
  const uniqueGuideRows = Array.from(new Map(guideRows.map(r => [r[guideIdIdx !== -1 ? guideIdIdx : 0], r])).values());

  return uniqueGuideRows.map(r => {
    const obj = mapRowToObject(guideHeaders, r);
    const guideId = obj.รหัสหัวขัอการตรวจสอบ || obj.id || obj.ID || "";
    return {
      id: guideId,
      title: obj.หัวข้อการตรวจสอบ || obj.title || obj.specificCause || "",
      symptomId: obj.รหัสอาการเสีย || obj.symptomId || "",
      mediaUrl: obj['ลิงค์ VDO'] || obj.mediaUrl || "",
      pdfUrl: obj['ลิงค์ PDF'] || obj.pdfUrl || "",
      categoryId: "",
      subcategoryId: "",
      modelIds: [],
      symptomTypeId: "",
      description: "",
      difficulty: "Intermediate" as any,
      timeEstimated: "",
      status: "published" as any,
      tags: [],
      toolsRequired: [],
      partsRequired: [],
      createdAt: "",
      updatedAt: "",
      steps: []
    } as any;
  });
}

export async function getGuideById(id: string): Promise<Guide | null> {
  const guides = await getGuides();
  return guides.find(g => g.id === id) || null;
}

export async function createGuide(guide: Guide): Promise<Guide> {
  const newGuide: Guide = {
    ...guide,
    id: guide.id || \`guide-\${Date.now()}\`
  };
  
  const allRows = await readSheet(\`\${SHEETS.GUIDES}!A1:Z\`);
  const headers = allRows[0] || [];
  
  const lastId = allRows.length > 1 ? parseInt(allRows[allRows.length - 1][0] || "0") || 0 : 0;
  const newId = (lastId + 1).toString();
  
  const symptoms = await getSymptoms();
  const sym = symptoms.find(s => s.id === newGuide.symptomId);
  
  const objToSave = {
    "ID": newId,
    "รหัสอาการเสีย": newGuide.symptomId,
    "อาการเสีย": sym?.title || "",
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
  
  const existingRow = allRows.slice(1).find(r => r[headers.indexOf('รหัสหัวขัอการตรวจสอบ')] === id || r[headers.indexOf('id')] === id);
  const existingId = existingRow ? existingRow[0] : (allRows.length > 1 ? parseInt(allRows[allRows.length - 1][0] || "0") + 1 : 1).toString();
  
  const symptoms = await getSymptoms();
  const sym = symptoms.find(s => s.id === merged.symptomId);
  
  const objToSave = {
    "ID": existingId,
    "รหัสอาการเสีย": merged.symptomId,
    "อาการเสีย": sym?.title || "",
    "รหัสหัวขัอการตรวจสอบ": merged.id,
    "หัวข้อการตรวจสอบ": merged.title,
    "ลิงค์ VDO": merged.mediaUrl || "",
    "ลิงค์ PDF": merged.pdfUrl || ""
  };
  
  const rowToUpdate = mapObjectToRow(headers, objToSave as Record<string, any>);
  await updateRowById(SHEETS.GUIDES, id, rowToUpdate);
  return merged;
}

export async function deleteGuide(id: string): Promise<void> {
  await deleteRowById(SHEETS.GUIDES, id);
}
`;

content += missingFunctions;

fs.writeFileSync('lib/sheets-db.ts', content);
