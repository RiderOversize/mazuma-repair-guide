const fs = require('fs');
let content = fs.readFileSync('lib/sheets-db.ts', 'utf-8');

// Normalize line endings to \n for easier replacing
content = content.replace(/\r\n/g, '\n');

// 1. Fix getCategories
content = content.replace(
  `    return {
      id: obj.id,
      name: obj.name,
      slug: obj.slug,
      description: obj.description,
      status: obj.status as any,
      createdAt: obj.createdAt
    };`,
  `    return {
      id: obj.ID || obj.id || obj.Index || \`cat-\${Date.now()}\`,
      name: obj.Description || obj.name || "",
      slug: obj.Index || obj.slug || "",
      description: obj.description || "",
      status: (obj.status as any) || "active",
      createdAt: obj.createdAt || new Date().toISOString()
    };`
);

// 2. Fix getSymptomTypes
content = content.replace(
  `    return {
      id: obj.id || (hasIdCol ? r[idColIndex] : \`type-\${index}\`),
      categoryId: obj.categoryId || "",
      name: obj.name || (hasIdCol ? (idColIndex === 0 ? r[1] : r[0]) : r[1] || r[0])
    };
  }).filter(t => t.name);`,
  `    return {
      id: obj['รหัสอาการเสีย'] || obj.ID || obj.id || \`type-\${index}\`,
      categoryId: obj.categoryId || "",
      name: obj['ชื่อกลุ่มอาการเสีย'] || obj.name || "ไม่มีชื่อกลุ่มอาการ"
    };
  }).filter(t => t.id && t.name);`
);

// 3. Fix getSymptoms
content = content.replace(
  /const idIdx = getIndexCaseInsensitive\(headers, 'id'\);\n\s*const typeIdx = getIndexCaseInsensitive\(headers, 'symptomtypeid'\) !== -1 \? getIndexCaseInsensitive\(headers, 'symptomtypeid'\) : getIndexCaseInsensitive\(headers, 'symptomtypesid'\);\n\s*const descIdx = getIndexCaseInsensitive\(headers, 'description'\) !== -1 \? getIndexCaseInsensitive\(headers, 'description'\) : getIndexCaseInsensitive\(headers, 'description'\);\n\s*return \{\n\s*id: obj.id \|\| \(idIdx !== -1 \? r\[idIdx\] : `sym-\$\{index\}`\),\n\s*symptomTypeId: obj.symptomTypeId \|\| obj.SymptomTypesID \|\| \(typeIdx !== -1 \? r\[typeIdx\] : \(hasIdCol \? r\[1\] : r\[0\]\)\),\n\s*title: obj.title \|\| \(obj.name \|\| "ระบุชื่ออาการ"\),\n\s*description: obj.description \|\| obj.name \|\| \(descIdx !== -1 \? r\[descIdx\] : \(hasIdCol \? r\[2\] : r\[1\]\)\),\n\s*severity: obj.severity \|\| "Medium",\n\s*tags: obj.tags \? obj.tags.split\(','\).map\(\(t: string\) => t.trim\(\)\).filter\(Boolean\) : \[\],\n\s*specificModelIds: obj.specificModelIds \? obj.specificModelIds.split\(','\).map\(\(t: string\) => t.trim\(\)\).filter\(Boolean\) : undefined\n\s*\};\n\s*\}\).filter\(s => s.description \|\| s.title\);/,
  `return {
      id: obj['รหัสอาการเสีย'] || obj.ID || obj.id || \`sym-\${index}\`,
      symptomTypeId: obj['รหัสประเภทอาการ'] || obj.symptomTypeId || obj.SymptomTypesID || "",
      title: obj['อาการเสีย'] || obj.title || obj.name || "ระบุชื่ออาการ",
      description: obj['อาการเสีย'] || obj.description || obj.name || "",
      severity: (obj.severity as any) || "Medium",
      tags: obj.tags ? obj.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      specificModelIds: obj.specificModelIds ? obj.specificModelIds.split(',').map((t: string) => t.trim()).filter(Boolean) : undefined
    } as Symptom;
  }).filter(s => s.description || s.title);`
);

// 4. Fix getGuides
content = content.replace(
  `    return {
      id: guideId,
      title: obj.title || obj.specificCause || "",
      categoryId: obj.categoryId,
      subcategoryId: obj.subcategoryId || "",
      modelIds: obj.modelIds ? obj.modelIds.split(',').filter(Boolean) : [],
      symptomTypeId: obj.symptomTypeId || "",
      symptomId: obj.symptomId || "",
      description: obj.description || "",
      difficulty: obj.difficulty as any,
      timeEstimated: obj.timeEstimated || "",
      status: obj.status as any,
      tags: obj.tags ? obj.tags.split(',').filter(Boolean) : [],
      toolsRequired: obj.toolsRequired ? obj.toolsRequired.split(',').filter(Boolean) : [],
      partsRequired: obj.partsRequired ? obj.partsRequired.split(',').filter(Boolean) : [],
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
      steps: safeParse(obj.steps, [])
    };`,
  `    return {
      id: guideId || obj['รหัสหัวขัอการตรวจสอบ'] || \`guide-\${index}\`,
      title: obj['หัวข้อการตรวจสอบ'] || obj.title || obj.specificCause || "",
      categoryId: obj.categoryId || "",
      subcategoryId: obj.subcategoryId || "",
      modelIds: obj.modelIds ? obj.modelIds.split(',').filter(Boolean) : [],
      symptomTypeId: obj.symptomTypeId || "",
      symptomId: obj['รหัสอาการเสีย'] || obj.symptomId || "",
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
      mediaUrl: obj['ลิงค์ VDO'] || obj.mediaUrl || "",
      pdfUrl: obj['ลิงค์ PDF'] || obj.pdfUrl || ""
    } as Guide;`
);

// 5. Add note to RepairFeedback
content = content.replace(
  `export interface RepairFeedback {
  id: string
  guideId: string
  modelId: string | null
  userId: string
  userName: string
  isSuccess: boolean
  stepsViewed: number
  totalSteps: number
  timestamp: string
}`,
  `export interface RepairFeedback {
  id: string
  guideId: string
  modelId: string | null
  userId: string
  userName: string
  isSuccess: boolean
  stepsViewed: number
  totalSteps: number
  timestamp: string
  note?: string
}`
);

// 6. Update logRepairFeedback implementation
content = content.replace(
  `    stepsViewed: feedback.stepsViewed,
    totalSteps: feedback.totalSteps,
    timestamp
  };`,
  `    stepsViewed: feedback.stepsViewed,
    totalSteps: feedback.totalSteps,
    timestamp,
    note: feedback.note || ""
  };`
);

// 7. Add updateSubCategory
content = content.replace(
  `export async function deleteSubCategory(id: string): Promise<void> {
  await deleteRowById(SHEETS.SUBCATEGORIES, id);
}`,
  `export async function deleteSubCategory(id: string): Promise<void> {
  await deleteRowById(SHEETS.SUBCATEGORIES, id);
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
}`
);

const missingExports = `
import { MasterDataMapping } from './types';

export async function getMasterDataMappings(): Promise<MasterDataMapping[]> {
  const allRows = await readSheet(\`\${SHEETS.MASTERDATA}!A1:Z\`);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  return rows.map(r => mapRowToObject(headers, r) as any);
}
export async function createMasterDataMapping(data: Partial<MasterDataMapping>): Promise<MasterDataMapping> {
  const allRows = await readSheet(\`\${SHEETS.MASTERDATA}!A1:Z\`);
  const headers = allRows[0] || [];
  const id = data.id || \`map-\${Date.now()}\`;
  const obj = { ...data, id };
  await appendRow(\`\${SHEETS.MASTERDATA}!A2:Z\`, mapObjectToRow(headers, obj));
  return obj as any;
}
export async function updateMasterDataMapping(id: string, data: Partial<MasterDataMapping>): Promise<MasterDataMapping> {
  const all = await getMasterDataMappings();
  const existing = all.find(x => x.id === id);
  if (!existing) throw new Error('Not found');
  const merged = { ...existing, ...data };
  const allRows = await readSheet(\`\${SHEETS.MASTERDATA}!A1:Z\`);
  const headers = allRows[0] || [];
  await updateRowById(SHEETS.MASTERDATA, id, mapObjectToRow(headers, merged));
  return merged as any;
}
export async function deleteMasterDataMapping(id: string): Promise<void> {
  await deleteRowById(SHEETS.MASTERDATA, id);
}
`;

fs.writeFileSync('lib/sheets-db.ts', content + missingExports);
console.log('Patch 3 complete.');
