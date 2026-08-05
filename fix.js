const fs = require('fs');
let content = fs.readFileSync('lib/sheets-db.ts', 'utf-8');

// Find where updateSymptom ends
const beforeDeleteSym = content.substring(0, content.indexOf('const rowToUpdate = mapObjectToRow(headers, objToSave as Record<string, any>);'));

const restOfFile = content.substring(content.indexOf('export async function createGuide(guide: Guide): Promise<Guide> {'));

const replacement = \  const rowToUpdate = mapObjectToRow(headers, objToSave as Record<string, any>);
  await updateRowById(SHEETS.SYMPTOMS, id, rowToUpdate);
  return merged;
}

export async function deleteSymptom(id: string): Promise<void> {
  await deleteRowById(SHEETS.SYMPTOMS, id);
}

// ---------------------------------------------------------------------------
// Guides
// ---------------------------------------------------------------------------
export async function getGuides(): Promise<Guide[]> {
  const guideAllRows = await readSheet(\\\\!A1:Z\\\);
  const guideHeaders = guideAllRows[0] || [];
  const guideRows = guideAllRows.slice(1);
  
  const guideIdIdx = getIndexCaseInsensitive(guideHeaders, 'id');
  const uniqueGuideRows = Array.from(new Map(guideRows.map(r => [r[guideIdIdx !== -1 ? guideIdIdx : 0], r])).values());

  return uniqueGuideRows.map((r, index) => {
    const obj = mapRowToObject(guideHeaders, r);
    const guideId = obj['????????????????????'] || obj.ID || obj.id || \\\guide-\\\\;
    return {
      id: guideId,
      title: obj['????????????????'] || obj.title || obj.specificCause || "",
      categoryId: obj.categoryId || "",
      subcategoryId: obj.subcategoryId || "",
      modelIds: obj.modelIds ? obj.modelIds.split(',').filter(Boolean) : [],
      symptomTypeId: obj.symptomTypeId || "",
      symptomId: obj['?????????????'] || obj.symptomId || "",
      description: obj.description || "",
      difficulty: obj.difficulty as any,
      timeEstimated: obj.timeEstimated || "",
      status: "published",
      tags: obj.tags ? obj.tags.split(',').filter(Boolean) : [],
      toolsRequired: obj.toolsRequired ? obj.toolsRequired.split(',').filter(Boolean) : [],
      partsRequired: obj.partsRequired ? obj.partsRequired.split(',').filter(Boolean) : [],
      createdAt: obj.createdAt || new Date().toISOString(),
      updatedAt: obj.updatedAt || new Date().toISOString(),
      steps: safeParse(obj.steps, []),
      mediaUrl: obj['????? VDO'] || obj.mediaUrl || "",
      pdfUrl: obj['????? PDF'] || obj.pdfUrl || ""
    } as Guide;
  });
}

export async function getGuideById(id: string): Promise<Guide | null> {
  const guides = await getGuides();
  return guides.find(g => g.id === id) || null;
}

\;

fs.writeFileSync('lib/sheets-db.ts', beforeDeleteSym + replacement + restOfFile);
console.log('Fixed lib/sheets-db.ts');
