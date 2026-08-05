import fs from 'fs';

let content = fs.readFileSync('lib/sheets-db.ts', 'utf8');

const getSymptomsCode = `export async function getSymptoms(): Promise<Symptom[]> {
  const allRows = await readSheet(\`\${SHEETS.SYMPTOMS}!A1:Z\`);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  
  const mapped = rows.map((r, index) => {
    const obj = mapRowToObject(headers, r);
    return {
      id: obj['รหัสอาการเสีย'] || obj.id || \`sym-\${index}\`,
      symptomTypeId: obj['รหัสประเภทอาการ'] || obj.symptomTypeId || "",
      title: obj['อาการเสีย'] || obj.title || "",
      description: obj.description || "",
      severity: obj.severity || "Medium",
      tags: obj.tags ? obj.tags.split(',').filter(Boolean) : []
    } as Symptom;
  }).filter(s => s.title);
  
  const unique = new Map();
  mapped.forEach(s => {
    if (!unique.has(s.id)) unique.set(s.id, s);
  });
  return Array.from(unique.values());
}

export async function createSymptom`;

content = content.replace(/export async function createSymptom/g, getSymptomsCode);

fs.writeFileSync('lib/sheets-db.ts', content);
