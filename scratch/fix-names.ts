import fs from 'fs';

let content = fs.readFileSync('lib/sheets-db.ts', 'utf8');

content = content.replace(
  `  const objToSave = {
    "ID": Date.now().toString(),
    "รหัสประเภทอาการ": newSym.symptomTypeId,
    "ประเภทอาการอาการ": "",
    "รหัสอาการเสีย": newSym.id,
    "อาการเสีย": newSym.title
  };`,
  `  const symptomTypes = await getSymptomTypes();
  const st = symptomTypes.find(t => t.subcategoryId === newSym.symptomTypeId || t.id === newSym.symptomTypeId);
  
  const objToSave = {
    "ID": Date.now().toString(),
    "รหัสประเภทอาการ": newSym.symptomTypeId,
    "ประเภทอาการอาการ": st?.name || "",
    "รหัสอาการเสีย": newSym.id,
    "อาการเสีย": newSym.title
  };`
);

content = content.replace(
  `  const objToSave = {
    "ID": existing.id || Date.now().toString(),
    "รหัสประเภทอาการ": merged.symptomTypeId,
    "ประเภทอาการอาการ": "",
    "รหัสอาการเสีย": merged.id,
    "อาการเสีย": merged.title
  };`,
  `  const symptomTypes = await getSymptomTypes();
  const st = symptomTypes.find(t => t.subcategoryId === merged.symptomTypeId || t.id === merged.symptomTypeId);

  const objToSave = {
    "ID": existing.id || Date.now().toString(),
    "รหัสประเภทอาการ": merged.symptomTypeId,
    "ประเภทอาการอาการ": st?.name || "",
    "รหัสอาการเสีย": merged.id,
    "อาการเสีย": merged.title
  };`
);

// Do the same for Guide
content = content.replace(
  `  const objToSave = {
    "ID": Date.now().toString(),
    "รหัสอาการเสีย": newGuide.symptomId,
    "อาการเสีย": "",
    "รหัสหัวขัอการตรวจสอบ": newGuide.id,
    "หัวข้อการตรวจสอบ": newGuide.title,
    "ลิงค์ VDO": newGuide.mediaUrl || "",
    "ลิงค์ PDF": newGuide.pdfUrl || ""
  };`,
  `  const symptoms = await getSymptoms();
  const sym = symptoms.find(s => s.id === newGuide.symptomId);
  
  const objToSave = {
    "ID": Date.now().toString(),
    "รหัสอาการเสีย": newGuide.symptomId,
    "อาการเสีย": sym?.title || "",
    "รหัสหัวขัอการตรวจสอบ": newGuide.id,
    "หัวข้อการตรวจสอบ": newGuide.title,
    "ลิงค์ VDO": newGuide.mediaUrl || "",
    "ลิงค์ PDF": newGuide.pdfUrl || ""
  };`
);

content = content.replace(
  `  const objToSave = {
    "ID": existing.id || Date.now().toString(),
    "รหัสอาการเสีย": merged.symptomId,
    "อาการเสีย": "",
    "รหัสหัวขัอการตรวจสอบ": merged.id,
    "หัวข้อการตรวจสอบ": merged.title,
    "ลิงค์ VDO": merged.mediaUrl || "",
    "ลิงค์ PDF": merged.pdfUrl || ""
  };`,
  `  const symptoms = await getSymptoms();
  const sym = symptoms.find(s => s.id === merged.symptomId);
  
  const objToSave = {
    "ID": existing.id || Date.now().toString(),
    "รหัสอาการเสีย": merged.symptomId,
    "อาการเสีย": sym?.title || "",
    "รหัสหัวขัอการตรวจสอบ": merged.id,
    "หัวข้อการตรวจสอบ": merged.title,
    "ลิงค์ VDO": merged.mediaUrl || "",
    "ลิงค์ PDF": merged.pdfUrl || ""
  };`
);

fs.writeFileSync('lib/sheets-db.ts', content);
