import fs from 'fs';

let content = fs.readFileSync('lib/sheets-db.ts', 'utf8');

const regex = /export async function getGuides[\s\S]*?export async function createGuide/m;

const newCode = `export async function getGuides(): Promise<Guide[]> {
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

export async function createGuide`;

content = content.replace(regex, newCode);
fs.writeFileSync('lib/sheets-db.ts', content);
