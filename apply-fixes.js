const fs = require('fs');
let content = fs.readFileSync('lib/sheets-db.ts', 'utf-8');

content = content.replace(
  \      id: obj.id,
      name: obj.name,
      slug: obj.slug,
      description: obj.description,
      status: obj.status as any,
      createdAt: obj.createdAt\,
  \      id: obj.ID || obj.id || obj.Index || \\\cat-\\\\\\,
      name: obj.Description || obj.name || "",
      slug: obj.Index || obj.slug || "",
      description: obj.description || "",
      status: (obj.status as any) || "active",
      createdAt: obj.createdAt || new Date().toISOString()\
);

content = content.replace(
  \    return {
      id: obj.id || (hasIdCol ? r[idColIndex] : \\\	ype-\\\\\\),
      categoryId: obj.categoryId || "",
      name: obj.name || (hasIdCol ? (idColIndex === 0 ? r[1] : r[0]) : r[1] || r[0])
    };
  }).filter(t => t.name);\,
  \    return {
      id: obj['?????????????'] || obj.ID || obj.id || \\\	ype-\\\\\\,
      categoryId: obj.categoryId || "",
      name: obj['??????????????????'] || obj.name || "???????????????????"
    };
  }).filter(t => t.id && t.name);\
);

content = content.replace(
  \    // Find column positions of keys case-insensitively
    const idIdx = getIndexCaseInsensitive(headers, 'id');
    const typeIdx = getIndexCaseInsensitive(headers, 'symptomtypeid') !== -1 ? getIndexCaseInsensitive(headers, 'symptomtypeid') : getIndexCaseInsensitive(headers, 'symptomtypesid');
    const descIdx = getIndexCaseInsensitive(headers, 'description') !== -1 ? getIndexCaseInsensitive(headers, 'description') : getIndexCaseInsensitive(headers, 'description');
    
    return {
      id: obj.id || (idIdx !== -1 ? r[idIdx] : \\\sym-\\\\\\),
      symptomTypeId: obj.symptomTypeId || obj.SymptomTypesID || (typeIdx !== -1 ? r[typeIdx] : (hasIdCol ? r[1] : r[0])),
      title: obj.title || (obj.name || "?????????????"),
      description: obj.description || obj.name || (descIdx !== -1 ? r[descIdx] : (hasIdCol ? r[2] : r[1])),
      severity: obj.severity || "Medium",
      tags: obj.tags ? obj.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      specificModelIds: obj.specificModelIds ? obj.specificModelIds.split(',').map((t: string) => t.trim()).filter(Boolean) : undefined
    };\,
  \    return {
      id: obj['?????????????'] || obj.ID || obj.id || \\\sym-\\\\\\,
      symptomTypeId: obj['???????????????'] || obj.symptomTypeId || obj.SymptomTypesID || "",
      title: obj['?????????'] || obj.title || obj.name || "?????????????",
      description: obj['?????????'] || obj.description || obj.name || "",
      severity: (obj.severity as any) || "Medium",
      tags: obj.tags ? obj.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      specificModelIds: obj.specificModelIds ? obj.specificModelIds.split(',').map((t: string) => t.trim()).filter(Boolean) : undefined
    } as Symptom;\
);

content = content.replace(
  \    return {
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
    };\,
  \    return {
      id: guideId || obj['????????????????????'] || \\\guide-\\\\\\,
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
    } as Guide;\
);

fs.writeFileSync('lib/sheets-db.ts', content);
console.log('Applied mappings');
