import fs from 'fs';

let content = fs.readFileSync('lib/sheets-db.ts', 'utf8');

const createSymptomCode = `export async function createSymptom(data: Partial<Symptom>): Promise<Symptom> {
  const newSym: Symptom = {
    id: data.id || \`sym-\${Date.now()}\`,
    symptomTypeId: data.symptomTypeId || "",
    title: data.title || "",
    description: data.description || "",
    severity: data.severity || "Medium",
    tags: data.tags || []
  };
  const allRows = await readSheet(\`\${SHEETS.SYMPTOMS}!A1:Z\`);
  const headers = allRows[0] || [];
  
  const lastId = allRows.length > 1 ? parseInt(allRows[allRows.length - 1][0] || "0") || 0 : 0;
  const newId = (lastId + 1).toString();
  
  const symptomTypes = await getSymptomTypes();
  const st = symptomTypes.find(t => t.subcategoryId === newSym.symptomTypeId || t.id === newSym.symptomTypeId);
  
  const objToSave = {
    "ID": newId,
    "รหัสประเภทอาการ": newSym.symptomTypeId,
    "ประเภทอาการอาการ": st?.name || "",
    "รหัสอาการเสีย": newSym.id,
    "อาการเสีย": newSym.title
  };
  
  const rowToAppend = mapObjectToRow(headers, objToSave);
  await appendRow(\`\${SHEETS.SYMPTOMS}!A2:Z\`, rowToAppend);
  return newSym;
}`;

content = content.replace(/export async function createSymptom[\s\S]*?return newSym;\n}/m, createSymptomCode);

const updateSymptomCode = `export async function updateSymptom(id: string, data: Partial<Symptom>): Promise<Symptom> {
  const symptoms = await getSymptoms();
  const existing = symptoms.find(s => s.id === id);
  if (!existing) throw new Error("Symptom not found");
  const merged = { ...existing, ...data };
  
  const allRows = await readSheet(\`\${SHEETS.SYMPTOMS}!A1:Z\`);
  const headers = allRows[0] || [];
  
  const existingRow = allRows.slice(1).find(r => r[headers.indexOf('รหัสอาการเสีย')] === id || r[headers.indexOf('id')] === id);
  const existingId = existingRow ? existingRow[0] : (allRows.length > 1 ? parseInt(allRows[allRows.length - 1][0] || "0") + 1 : 1).toString();
  
  const symptomTypes = await getSymptomTypes();
  const st = symptomTypes.find(t => t.subcategoryId === merged.symptomTypeId || t.id === merged.symptomTypeId);
  
  const objToSave = {
    "ID": existingId,
    "รหัสประเภทอาการ": merged.symptomTypeId,
    "ประเภทอาการอาการ": st?.name || "",
    "รหัสอาการเสีย": merged.id,
    "อาการเสีย": merged.title
  };
  
  const rowToUpdate = mapObjectToRow(headers, objToSave as Record<string, any>);
  await updateRowById(SHEETS.SYMPTOMS, id, rowToUpdate);
  return merged;
}`;

content = content.replace(/export async function updateSymptom[\s\S]*?return merged;\n}/m, updateSymptomCode);

fs.writeFileSync('lib/sheets-db.ts', content);
