"use server"

import { readSheet, appendRow, updateRowById, deleteRowById, mapRowToObject, mapObjectToRow, SHEETS, getIndexCaseInsensitive } from "./google-sheets";
import { type AuthUser } from "./auth";
import { type Category, type DeviceModel, type Guide, type GuideStep, type SubCategory, type SymptomType, type Symptom } from "./types";

// Optional: check if sheet ID is configured
const useSheets = !!process.env.GOOGLE_SHEETS_ID;

// Fallback logic could be implemented here, but since the user provided the DB, we will use it directly.

// Helper to safely parse JSON strings
const safeParse = (str: string, fallback: any) => {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export async function getUsers(forceFetch: boolean = false): Promise<AuthUser[]> {
  const allRows = await readSheet(`${SHEETS.USERS}!A1:Z`, forceFetch);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  const empCodeIdx = getIndexCaseInsensitive(headers, 'employeeCode');
  const uniqueRows = Array.from(new Map(rows.map(r => [r[empCodeIdx !== -1 ? empCodeIdx : 0], r])).values());
  
  return uniqueRows.map(r => {
    const obj = mapRowToObject(headers, r);
    return {
      employeeCode: obj.employeeCode,
      name: obj.name,
      phone: obj.phone,
      role: obj.role as any,
      title: obj.role === "admin" ? "ผู้ดูแลระบบ" : obj.role === "head" ? "หัวหน้าช่าง" : "ช่างเทคนิค",
      status: obj.status as any,
      createdAt: obj.createdAt,
      initials: obj.name ? obj.name.substring(0, 2) : "",
      avatar: obj.avatarUrl || (obj.role === "admin" ? "/avatars/admin.png" : "/avatars/technician.png"),
      lineName: "-",
      lineUserId: obj.lineUserId,
      assignedSupervisors: obj.assignedHeads ? obj.assignedHeads.split(',').filter(Boolean) : [],
      accessibleMenus: obj.accessibleMenus ? obj.accessibleMenus.split(',').filter(Boolean) : undefined,
    };
  });
}

export async function createUser(user: AuthUser): Promise<AuthUser> {
  const users = await getUsers();
  if (users.some((u) => u.employeeCode === user.employeeCode)) {
    throw new Error("Employee code already exists");
  }
  const newUser = { ...user, status: user.status || "active", createdAt: user.createdAt || new Date().toISOString() };
  
  const allRows = await readSheet(`${SHEETS.USERS}!A1:Z`);
  const headers = allRows[0] || [];
  
  const objToSave = {
    employeeCode: newUser.employeeCode,
    name: newUser.name,
    phone: newUser.phone || "",
    role: newUser.role,
    status: newUser.status,
    createdAt: newUser.createdAt,
    lineUserId: newUser.lineUserId || "",
    avatarUrl: newUser.avatar || "",
    assignedHeads: (newUser.assignedSupervisors || []).join(','),
    accessibleMenus: (newUser.accessibleMenus || []).join(',')
  };
  
  const rowToAppend = mapObjectToRow(headers, objToSave);
  await appendRow(`${SHEETS.USERS}!A2:Z`, rowToAppend);
  return newUser as AuthUser;
}

export async function updateUser(employeeCode: string, data: Partial<AuthUser>): Promise<AuthUser> {
  const users = await getUsers();
  const existing = users.find(u => u.employeeCode === employeeCode);
  if (!existing) throw new Error("User not found");
  
  const merged = { ...existing, ...data };
  
  const allRows = await readSheet(`${SHEETS.USERS}!A1:Z`);
  const headers = allRows[0] || [];
  
  const objToSave = {
    employeeCode: merged.employeeCode,
    name: merged.name,
    phone: merged.phone || "",
    role: merged.role,
    status: merged.status,
    createdAt: merged.createdAt,
    lineUserId: merged.lineUserId || "",
    avatarUrl: merged.avatar || "",
    assignedHeads: (merged.assignedSupervisors || []).join(','),
    accessibleMenus: (merged.accessibleMenus || []).join(',')
  };
  
  const rowToUpdate = mapObjectToRow(headers, objToSave);
  await updateRowById(SHEETS.USERS, employeeCode, rowToUpdate);
  return merged;
}

export async function deleteUser(employeeCode: string): Promise<void> {
  await deleteRowById(SHEETS.USERS, employeeCode);
}

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------
export async function getModels(): Promise<DeviceModel[]> {
  const allRows = await readSheet(`${SHEETS.MODELS}!A1:Z`);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  const idIdx = getIndexCaseInsensitive(headers, 'id');
  const uniqueRows = Array.from(new Map(rows.map(r => [r[idIdx !== -1 ? idIdx : 0], r])).values());
  
  return uniqueRows.map((r, index) => {
    const obj = mapRowToObject(headers, r);
    
    return {
      id: obj.id || obj.ID || `m-${index}`,
      subcategoryId: obj.subcategoryId || "",
      symptomTypeId: obj.symptomTypeId || "",
      categoryId: obj.categoryId || "",
      name: obj.name || "ระบุชื่อรุ่น",
      code: obj.code || "",
      status: obj.status || "active",
      thumbnail: obj.thumbnail || "",
      createdAt: obj.createdAt || new Date().toISOString(),
      updatedAt: obj.updatedAt || new Date().toISOString(),
      lastSyncAt: obj.lastSyncAt || ""
    };
  });
}

export async function createModel(model: DeviceModel): Promise<DeviceModel> {
  const newModel = { ...model, id: model.id || `m-${Date.now()}`, status: model.status || "active", createdAt: model.createdAt || new Date().toISOString(), updatedAt: model.updatedAt || new Date().toISOString() };
  
  const allRows = await readSheet(`${SHEETS.MODELS}!A1:Z`);
  const headers = allRows[0] || [];
  
  const objToSave = {
    id: newModel.id,
    categoryId: newModel.categoryId || "",
    subcategoryId: newModel.subcategoryId || "",
    symptomTypeId: newModel.symptomTypeId || "",
    name: newModel.name,
    code: newModel.code,
    status: newModel.status,
    thumbnail: newModel.thumbnail || "",
    createdAt: newModel.createdAt,
    updatedAt: newModel.updatedAt
  };
  
  const rowToAppend = mapObjectToRow(headers, objToSave);
  await appendRow(`${SHEETS.MODELS}!A2:Z`, rowToAppend);
  return newModel as DeviceModel;
}

export async function bulkCreateModels(models: DeviceModel[]): Promise<DeviceModel[]> {
  if (models.length === 0) return [];
  const allRows = await readSheet(`${SHEETS.MODELS}!A1:Z`);
  const headers = allRows[0] || [];
  
  const rowsToAppend = models.map(model => {
    const newModel = { ...model, id: model.id || `m-${Date.now()}-${Math.random()}`, status: model.status || "active", createdAt: model.createdAt || new Date().toISOString(), updatedAt: model.updatedAt || new Date().toISOString() };
    const objToSave = {
      id: newModel.id,
      categoryId: newModel.categoryId || "",
      subcategoryId: newModel.subcategoryId || "",
      symptomTypeId: newModel.symptomTypeId || "",
      name: newModel.name,
      code: newModel.code,
      status: newModel.status,
      thumbnail: newModel.thumbnail || "",
      createdAt: newModel.createdAt,
      updatedAt: newModel.updatedAt
    };
    return mapObjectToRow(headers, objToSave);
  });
  
  // Need to import appendRows from google-sheets
  const { appendRows } = require('./google-sheets');
  await appendRows(`${SHEETS.MODELS}!A2:Z`, rowsToAppend);
  return models;
}

export async function updateModel(id: string, data: Partial<DeviceModel>): Promise<DeviceModel> {
  const models = await getModels();
  const existing = models.find(m => m.id === id || m.code === id);
  if (!existing) throw new Error("Model not found");
  
  const merged = { ...existing, ...data, updatedAt: new Date().toISOString() };
  
  const allRows = await readSheet(`${SHEETS.MODELS}!A1:Z`);
  const headers = allRows[0] || [];
  
  const objToSave = {
    id: merged.id,
    categoryId: merged.categoryId || "",
    subcategoryId: merged.subcategoryId || "",
    symptomTypeId: merged.symptomTypeId || "",
    name: merged.name,
    code: merged.code,
    status: merged.status,
    thumbnail: merged.thumbnail || "",
    createdAt: merged.createdAt,
    updatedAt: merged.updatedAt
  };

  const rowToUpdate = mapObjectToRow(headers, objToSave);
  await updateRowById(SHEETS.MODELS, id, rowToUpdate);
  return merged;
}

export async function deleteModel(id: string): Promise<void> {
  await deleteRowById(SHEETS.MODELS, id);
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  const allRows = await readSheet(`${SHEETS.CATEGORIES}!A1:Z`);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  const idIdx = getIndexCaseInsensitive(headers, 'id');
  const uniqueCatRows = Array.from(new Map(rows.map(r => [r[idIdx !== -1 ? idIdx : 0], r])).values());
  
  return uniqueCatRows.map(r => {
    const obj = mapRowToObject(headers, r);
    return {
      id: obj.ID || obj.id || obj.Index || `cat-${Date.now()}`,
      name: obj.Description || obj.name || "",
      slug: obj.Index || obj.slug || "",
      description: obj.description || "",
      status: (obj.status as any) || "active",
      createdAt: obj.createdAt || new Date().toISOString()
    };
  });
}

export async function createCategory(cat: Partial<Category>): Promise<Category> {
  const allRows = await readSheet(`${SHEETS.CATEGORIES}!A1:Z`);
  const headers = allRows[0] || [];
  
  let nextId: string = cat.id || "";
  if (!nextId) {
    const idIdx = getIndexCaseInsensitive(headers, 'id');
    const maxId = allRows.slice(1).reduce((max, r) => {
      const val = parseInt(r[idIdx], 10);
      return !isNaN(val) && val > max ? val : max;
    }, 0);
    nextId = (maxId + 1).toString();
  }
  
  const objToSave = {
    'ID': nextId,
    'Index': cat.slug,
    'Description': cat.name
  };
  
  const rowToAppend = mapObjectToRow(headers, objToSave);
  await appendRow(`${SHEETS.CATEGORIES}!A2:Z`, rowToAppend);
  return { ...cat, id: nextId } as Category;
}

export async function bulkCreateCategories(categories: Partial<Category>[]): Promise<Category[]> {
  if (categories.length === 0) return [];
  const allRows = await readSheet(`${SHEETS.CATEGORIES}!A1:Z`);
  const headers = allRows[0] || [];
  
  const createdCats: Category[] = [];
  const rowsToAppend = categories.map(category => {
    const newCat: Category = {
      id: category.id || `cat-${Date.now()}-${Math.random()}`,
      name: category.name || "",
      slug: category.slug || `slug-${Date.now()}-${Math.random()}`,
      description: category.description || "",
      status: "active",
      createdAt: new Date().toISOString()
    };
    createdCats.push(newCat);
    
    const objToSave = {
      'ID': newCat.id,
      'Index': newCat.slug,
      'Description': newCat.name
    };
    return mapObjectToRow(headers, objToSave);
  });
  
  const { appendRows } = require('./google-sheets');
  await appendRows(`${SHEETS.CATEGORIES}!A2:Z`, rowsToAppend);
  return createdCats;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  const cats = await getCategories();
  const existing = cats.find(c => c.id === id);
  if (!existing) throw new Error("Category not found");
  
  const merged = { ...existing, ...data };
  
  const allRows = await readSheet(`${SHEETS.CATEGORIES}!A1:Z`);
  const headers = allRows[0] || [];
  
  const objToSave = {
    'ID': merged.id,
    'Index': merged.slug,
    'Description': merged.name
  };
  
  const rowToUpdate = mapObjectToRow(headers, objToSave);
  await updateRowById(SHEETS.CATEGORIES, id, rowToUpdate);
  
  return merged;
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteRowById(SHEETS.CATEGORIES, id);
}

// ---------------------------------------------------------------------------
// SubCategories
// ---------------------------------------------------------------------------
export async function getSubCategories(): Promise<SubCategory[]> {
  const allRows = await readSheet(`${SHEETS.SUBCATEGORIES}!A1:Z`);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  const idIdx = getIndexCaseInsensitive(headers, 'id');
  const uniqueRows = Array.from(new Map(rows.map(r => [r[idIdx !== -1 ? idIdx : 0], r])).values());
  return uniqueRows.map(r => {
    const obj = mapRowToObject(headers, r);
    return {
      id: obj.ID || obj.id || `sub-${Date.now()}-${Math.random()}`,
      categoryId: obj.Index || obj.categoryId || "",
      index: obj['MAT Category Code'] || obj.index || "",
      name: obj.Description || obj.name || ""
    };
  });
}

export async function createSubCategory(subCat: Partial<SubCategory>): Promise<SubCategory> {
  const allRows = await readSheet(`${SHEETS.SUBCATEGORIES}!A1:Z`);
  const headers = allRows[0] || [];
  
  let nextId: string = subCat.id || "";
  if (!nextId) {
    const idIdx = getIndexCaseInsensitive(headers, 'id');
    const maxId = allRows.slice(1).reduce((max, r) => {
      const val = parseInt(r[idIdx], 10);
      return !isNaN(val) && val > max ? val : max;
    }, 0);
    nextId = (maxId + 1).toString();
  }
  
  const objToSave = {
    'ID': nextId,
    'Index': subCat.categoryId,
    'MAT Category Code': subCat.index,
    'Description': subCat.name
  };
  
  const rowToAppend = mapObjectToRow(headers, objToSave);
  await appendRow(`${SHEETS.SUBCATEGORIES}!A2:Z`, rowToAppend);
  return { ...subCat, id: nextId } as SubCategory;
}

export async function deleteSubCategory(id: string): Promise<void> {
  await deleteRowById(SHEETS.SUBCATEGORIES, id);
}

export async function updateSubCategory(id: string, data: Partial<SubCategory>): Promise<SubCategory> {
  const all = await getSubCategories();
  const existing = all.find(x => x.id === id);
  if (!existing) throw new Error('Not found');
  const merged = { ...existing, ...data };
  const allRows = await readSheet(`${SHEETS.SUBCATEGORIES}!A1:Z`);
  const headers = allRows[0] || [];
  
  const objToSave = {
    'ID': merged.id,
    'Index': merged.categoryId,
    'MAT Category Code': merged.index,
    'Description': merged.name
  };
  
  await updateRowById(SHEETS.SUBCATEGORIES, id, mapObjectToRow(headers, objToSave));
  return merged as any;
}

// ---------------------------------------------------------------------------
// Symptom Types & Symptoms
// ---------------------------------------------------------------------------
export async function getSymptomTypes(): Promise<SymptomType[]> {
  const allRows = await readSheet(`${SHEETS.SYMPTOM_TYPES}!A1:Z`);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  
  // Find ID column index, default to generating if not found
  const idColIndex = getIndexCaseInsensitive(headers, 'id');
  const hasIdCol = idColIndex !== -1;
  
  const mapped = rows.map((r, index) => {
    const obj = mapRowToObject(headers, r);
    return {
      id: obj['รหัสอาการเสีย'] || obj.ID || obj.id || `type-${index}`,
      categoryId: obj.categoryId || "",
      subcategoryId: obj['รหัสอาการเสีย'] || obj.ID || obj.id || "",
      name: obj['ชื่อกลุ่มอาการเสีย'] || obj.name || "ไม่มีชื่อกลุ่มอาการ",
      description: obj['คำอธิบาย'] || obj.description || ""
    };
  }).filter(t => t.id && t.name);
  
  // Deduplicate by ID
  const unique = new Map();
  mapped.forEach(t => {
    if (!unique.has(t.id)) unique.set(t.id, t);
  });
  return Array.from(unique.values());
}

export async function createSymptomType(data: Partial<SymptomType>): Promise<SymptomType> {
  const allRows = await readSheet(`${SHEETS.SYMPTOM_TYPES}!A1:Z`);
  const headers = allRows[0] || [];
  
  const idIdx = getIndexCaseInsensitive(headers, 'id');
  const maxId = allRows.slice(1).reduce((max, r) => {
    const val = parseInt(r[idIdx], 10);
    return !isNaN(val) && val > max ? val : max;
  }, 0);
  const nextNumericId = (maxId + 1).toString();
  
  const code = data.subcategoryId || data.id || `type-${Date.now()}`;
  
  const newSym: SymptomType = {
    id: code,
    categoryId: data.categoryId || "",
    subcategoryId: code,
    name: data.name || "",
    description: data.description || ""
  };
  
  const objToSave = {
    ...newSym,
    'ID': nextNumericId,
    'รหัสอาการเสีย': code,
    'ชื่อกลุ่มอาการเสีย': newSym.name,
    'คำอธิบาย': newSym.description
  };
  
  const rowToAppend = mapObjectToRow(headers, objToSave);
  await appendRow(`${SHEETS.SYMPTOM_TYPES}!A2:Z`, rowToAppend);
  return newSym;
}

export async function updateSymptomType(id: string, data: Partial<SymptomType>): Promise<SymptomType> {
  const types = await getSymptomTypes();
  const existing = types.find(t => t.id === id);
  if (!existing) throw new Error("SymptomType not found");
  const merged = { ...existing, ...data };
  const allRows = await readSheet(`${SHEETS.SYMPTOM_TYPES}!A1:Z`);
  const headers = allRows[0] || [];
  
  const objToSave = {
    ...merged,
    'ID': merged.id,
    'รหัสอาการเสีย': merged.id,
    'ชื่อกลุ่มอาการเสีย': merged.name,
    'คำอธิบาย': merged.description || ""
  };
  
  const rowToUpdate = mapObjectToRow(headers, objToSave);
  await updateRowById(SHEETS.SYMPTOM_TYPES, id, rowToUpdate);
  return merged;
}

export async function deleteSymptomType(id: string): Promise<void> {
  await deleteRowById(SHEETS.SYMPTOM_TYPES, id);
}

export async function getSymptoms(): Promise<Symptom[]> {
  const allRows = await readSheet(`${SHEETS.SYMPTOMS}!A1:Z`);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  
  const idColIndex = getIndexCaseInsensitive(headers, 'id');
  const hasIdCol = idColIndex !== -1 || headers.some((h: string) => h && (h.toLowerCase().includes('id') || h.includes('รหัสอาการ')));

  const mapped = rows.map((r, index) => {
    const obj = mapRowToObject(headers, r);
    // Find column positions of keys case-insensitively
    return {
      id: obj['รหัสอาการเสีย'] || obj.ID || obj.id || `sym-${index}`,
      symptomTypeId: obj['รหัสประเภทอาการ'] || obj.symptomTypeId || obj.SymptomTypesID || "",
      title: obj['อาการเสีย'] || obj.title || obj.name || "ระบุชื่ออาการ",
      description: obj['คำอธิบาย'] || obj.description || "",
      severity: (obj.severity as any) || "Medium",
      tags: obj.tags ? obj.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      specificModelIds: obj.specificModelIds ? obj.specificModelIds.split(',').map((t: string) => t.trim()).filter(Boolean) : undefined
    } as Symptom;
  }).filter(s => s.description || s.title);
  
  // Deduplicate by ID
  const unique = new Map();
  mapped.forEach(s => {
    if (!unique.has(s.id)) unique.set(s.id, s);
  });
  return Array.from(unique.values());
}

export async function createSymptom(data: Partial<Symptom>): Promise<Symptom> {
  const allRows = await readSheet(`${SHEETS.SYMPTOMS}!A1:Z`);
  const headers = allRows[0] || [];
  
  const idIdx = getIndexCaseInsensitive(headers, 'id');
  const maxId = allRows.slice(1).reduce((max, r) => {
    const val = parseInt(r[idIdx], 10);
    return !isNaN(val) && val > max ? val : max;
  }, 0);
  const nextNumericId = (maxId + 1).toString();

  const code = data.id || `sym-${Date.now()}`;

  const newSym: Symptom = {
    id: code,
    symptomTypeId: data.symptomTypeId || "",
    title: data.title || "",
    description: data.description || "",
    severity: data.severity || "Medium",
    tags: data.tags || []
  };
  
  const types = await getSymptomTypes();
  const st = types.find(t => t.id === newSym.symptomTypeId);
  
  const objToSave = {
    ...newSym,
    tags: newSym.tags.join(','),
    'ID': nextNumericId,
    'รหัสประเภทอาการ': newSym.symptomTypeId,
    'ประเภทอาการอาการ': st ? st.name : "",
    'รหัสอาการเสีย': code,
    'อาการเสีย': newSym.title,
    'คำอธิบาย': newSym.description || ""
  };
  
  const rowToAppend = mapObjectToRow(headers, objToSave);
  await appendRow(`${SHEETS.SYMPTOMS}!A2:Z`, rowToAppend);
  return newSym;
}

export async function updateSymptom(id: string, data: Partial<Symptom>): Promise<Symptom> {
  const symptoms = await getSymptoms();
  const existing = symptoms.find(s => s.id === id);
  if (!existing) throw new Error("Symptom not found");
  const merged = { ...existing, ...data };
  
  const allRows = await readSheet(`${SHEETS.SYMPTOMS}!A1:Z`);
  const headers = allRows[0] || [];
  
  const types = await getSymptomTypes();
  const st = types.find(t => t.id === merged.symptomTypeId);
  
  const objToSave = {
    ...merged,
    tags: merged.tags.join(','),
    'ID': merged.id,
    'รหัสประเภทอาการ': merged.symptomTypeId,
    'ประเภทอาการอาการ': st ? st.name : "",
    'รหัสอาการเสีย': merged.id,
    'อาการเสีย': merged.title,
    'คำอธิบาย': merged.description || ""
  };
  
  const rowToUpdate = mapObjectToRow(headers, objToSave as Record<string, any>);
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
  const guideAllRows = await readSheet(`${SHEETS.GUIDES}!A1:Z`);
  const guideHeaders = guideAllRows[0] || [];
  const guideRows = guideAllRows.slice(1);
  
  const guideIdIdx = getIndexCaseInsensitive(guideHeaders, 'id');
  const uniqueGuideRows = Array.from(new Map(guideRows.map(r => [r[guideIdIdx !== -1 ? guideIdIdx : 0], r])).values());

  return uniqueGuideRows.map((r, index) => {
    const obj = mapRowToObject(guideHeaders, r);
    return {
      id: obj['รหัสหัวขัอการตรวจสอบ'] || obj.ID || obj.id || `guide-${index}`,
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
    } as Guide;
  });
}

export async function getGuideById(id: string): Promise<Guide | null> {
  const guides = await getGuides();
  return guides.find(g => g.id === id) || null;
}

export async function createGuide(guide: Partial<Guide>): Promise<Guide> {
  const guideAllRows = await readSheet(`${SHEETS.GUIDES}!A1:Z`);
  const guideHeaders = guideAllRows[0] || [];
  
  const idIdx = getIndexCaseInsensitive(guideHeaders, 'id');
  const maxId = guideAllRows.slice(1).reduce((max, r) => {
    const val = parseInt(r[idIdx], 10);
    return !isNaN(val) && val > max ? val : max;
  }, 0);
  const nextNumericId = (maxId + 1).toString();
  
  const code = guide.id || `gd-${Date.now()}`;
  
  const newGuide = { 
    ...guide, 
    id: code,
    status: guide.status || "published", 
    createdAt: guide.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as Guide;
  
  const symptoms = await getSymptoms();
  const sym = symptoms.find(s => s.id === newGuide.symptomId);
  
  const objToSave = {
    ...newGuide,
    tags: (newGuide.tags || []).join(','),
    toolsRequired: (newGuide.toolsRequired || []).join(','),
    partsRequired: (newGuide.partsRequired || []).join(','),
    steps: JSON.stringify(newGuide.steps || []),
    'ID': nextNumericId,
    'รหัสอาการเสีย': newGuide.symptomId || "",
    'อาการเสีย': sym ? sym.title : "",
    'รหัสหัวขัอการตรวจสอบ': code,
    'หัวข้อการตรวจสอบ': newGuide.title || "",
    'ลิงค์ VDO': newGuide.mediaUrl || "",
    'ลิงค์ PDF': newGuide.pdfUrl || ""
  };
  
  const rowToAppend = mapObjectToRow(guideHeaders, objToSave);
  await appendRow(`${SHEETS.GUIDES}!A2:Z`, rowToAppend);
  
  // Auto-update symptomTypeId on linked models if they are different
  if (newGuide.symptomTypeId && newGuide.modelIds && newGuide.modelIds.length > 0) {
    const models = await getModels();
    for (const modelId of newGuide.modelIds) {
      const model = models.find(m => m.id === modelId);
      if (model && model.symptomTypeId !== newGuide.symptomTypeId) {
        await updateModel(model.id, { symptomTypeId: newGuide.symptomTypeId });
      }
    }
  }
  // Removed saving to GuideSteps_V2
  
  return newGuide;
}

export async function updateGuide(id: string, data: Partial<Guide>): Promise<Guide> {
  const guides = await getGuides();
  const existing = guides.find(g => g.id === id);
  if (!existing) throw new Error("Guide not found");
  
  const merged = { ...existing, ...data, updatedAt: new Date().toISOString() };
  
  const guideAllRows = await readSheet(`${SHEETS.GUIDES}!A1:Z`);
  const guideHeaders = guideAllRows[0] || [];
  
  const symptoms = await getSymptoms();
  const sym = symptoms.find(s => s.id === merged.symptomId);
  
  const objToSave = {
    ...merged,
    tags: (merged.tags || []).join(','),
    toolsRequired: (merged.toolsRequired || []).join(','),
    partsRequired: (merged.partsRequired || []).join(','),
    steps: JSON.stringify(merged.steps || []),
    'ID': merged.id,
    'รหัสอาการเสีย': merged.symptomId || "",
    'อาการเสีย': sym ? sym.title : "",
    'รหัสหัวขัอการตรวจสอบ': merged.id,
    'หัวข้อการตรวจสอบ': merged.title || "",
    'ลิงค์ VDO': merged.mediaUrl || "",
    'ลิงค์ PDF': merged.pdfUrl || ""
  };
  
  const rowToUpdate = mapObjectToRow(guideHeaders, objToSave);
  await updateRowById(SHEETS.GUIDES, id, rowToUpdate);
  
  // Auto-update symptomTypeId on linked models if they are different
  if (merged.symptomTypeId && merged.modelIds && merged.modelIds.length > 0) {
    const models = await getModels();
    for (const modelId of merged.modelIds) {
      const model = models.find(m => m.id === modelId);
      if (model && model.symptomTypeId !== merged.symptomTypeId) {
        await updateModel(model.id, { symptomTypeId: merged.symptomTypeId });
      }
    }
  }
  
  // Handle steps: For MVP, we skip deep step syncing or just trust user edits it in Sheets.
  
  return merged;
}

export async function deleteGuide(id: string): Promise<void> {
  await deleteRowById(SHEETS.GUIDES, id);
}

// ---------------------------------------------------------------------------
// Tracking & Analytics
// ---------------------------------------------------------------------------
export interface RepairFeedback {
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
}

export interface ActiveSession {
  userId: string
  userName: string
  action: string 
  lastActive: string
}

export async function logRepairFeedback(feedback: Omit<RepairFeedback, "id" | "timestamp">) {
  const timestamp = new Date().toISOString();
  const id = `fb-${Date.now()}`;
  
  const allRows = await readSheet(`${SHEETS.FEEDBACKS}!A1:Z`);
  const headers = allRows[0] || [];
  
  const objToSave = {
    id,
    guideId: feedback.guideId,
    modelId: feedback.modelId || "",
    userId: feedback.userId,
    userName: feedback.userName,
    isSuccess: feedback.isSuccess ? "TRUE" : "FALSE",
    stepsViewed: feedback.stepsViewed,
    totalSteps: feedback.totalSteps,
    timestamp,
    note: feedback.note || ""
  };
  
  await appendRow(`${SHEETS.FEEDBACKS}!A2:Z`, mapObjectToRow(headers, objToSave));
}

export async function getRepairStats() {
  const allRows = await readSheet(`${SHEETS.FEEDBACKS}!A1:Z`);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  
  const total = rows.length;
  const isSuccessIndex = getIndexCaseInsensitive(headers, 'isSuccess');
  const stepsViewedIndex = getIndexCaseInsensitive(headers, 'stepsViewed');
  
  const successRows = rows.filter(r => isSuccessIndex !== -1 && r[isSuccessIndex] === "TRUE");
  const successCount = successRows.length;
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;
  
  const avgStepsSuccess = successRows.length > 0 && stepsViewedIndex !== -1
    ? (successRows.reduce((sum, r) => sum + parseInt(r[stepsViewedIndex] || "0"), 0) / successRows.length).toFixed(1)
    : "0";

  const failedCount = total - successCount;

  return { total, successRate, avgStepsSuccess, successCount, failedCount };
}

export async function logSessionActivity(userId: string, userName: string, action: string) {
  // Session tracking in Sheets is too heavy (writing every 5 seconds).
  // We'll skip or use an ephemeral store (like Redis or just in-memory if server).
  // Next.js server actions are stateless, so memory won't persist across lambdas.
  // For now, we do nothing to save API quota.
}

export async function getActiveSessions(): Promise<ActiveSession[]> {
  return []; // Return empty for now
}

export async function getTopModels() {
  const allRows = await readSheet(`${SHEETS.FEEDBACKS}!A1:Z`);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  
  const modelIdIndex = getIndexCaseInsensitive(headers, 'modelId');
  const modelCounts: Record<string, number> = {};
  
  rows.forEach(r => {
    const modelId = modelIdIndex !== -1 ? r[modelIdIndex] : null;
    if (modelId) {
      modelCounts[modelId] = (modelCounts[modelId] || 0) + 1;
    }
  });
  
  const sorted = Object.entries(modelCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([modelId, count]) => ({ modelId, count }))
    .slice(0, 5);
    
  return sorted;
}

import { MasterDataMapping } from './types';

export async function getMasterDataMappings(): Promise<MasterDataMapping[]> {
  const allRows = await readSheet(`${SHEETS.MASTERDATA}!A1:Z`);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  return rows.map((r, i) => {
    const obj = mapRowToObject(headers, r);
    return {
      id: obj.ID || obj.id || `map-${i}`,
      modelCode: obj['รหัสสินค้า'] || obj.modelCode || "",
      modelName: obj['ชื่อสินค้า'] || obj.modelName || "",
      matCategoryCode: obj['MAT Category Code'] || obj.matCategoryCode || "",
      matCategoryName: obj['MAT Category'] || obj.matCategoryName || "",
      symptomTypeCode: obj['รหัสประเภทอาการ'] || obj.symptomTypeCode || "",
      symptomTypeName: obj['ประเภทอาการอาการ'] || obj.symptomTypeName || "",
      createdAt: obj.createdAt || new Date().toISOString()
    } as MasterDataMapping;
  });
}
export async function createMasterDataMapping(data: Partial<MasterDataMapping>): Promise<MasterDataMapping> {
  const allRows = await readSheet(`${SHEETS.MASTERDATA}!A1:Z`);
  const headers = allRows[0] || [];
  
  let nextId: string = data.id || "";
  if (!nextId) {
    const idIdx = getIndexCaseInsensitive(headers, 'id');
    const maxId = allRows.slice(1).reduce((max, r) => {
      const val = parseInt(r[idIdx], 10);
      return !isNaN(val) && val > max ? val : max;
    }, 0);
    nextId = (maxId + 1).toString();
  }
  
  const objToSave = {
    'ID': nextId,
    'รหัสสินค้า': data.modelCode || "",
    'ชื่อสินค้า': data.modelName || "",
    'MAT Category Code': data.matCategoryCode || "",
    'MAT Category': data.matCategoryName || "",
    'รหัสประเภทอาการ': data.symptomTypeCode || "",
    'ประเภทอาการอาการ': data.symptomTypeName || "",
  };
  
  await appendRow(`${SHEETS.MASTERDATA}!A2:Z`, mapObjectToRow(headers, objToSave));
  return { ...data, id: nextId } as any;
}
export async function bulkCreateMasterDataMappings(mappings: Partial<MasterDataMapping>[]): Promise<MasterDataMapping[]> {
  if (mappings.length === 0) return [];
  const allRows = await readSheet(`${SHEETS.MASTERDATA}!A1:Z`);
  const headers = allRows[0] || [];
  
  const idIdx = getIndexCaseInsensitive(headers, 'id');
  const maxId = allRows.slice(1).reduce((max, r) => {
    const val = parseInt(r[idIdx], 10);
    return !isNaN(val) && val > max ? val : max;
  }, 0);
  
  let currentId = maxId + 1;
  const createdMappings: MasterDataMapping[] = [];
  const rowsToAppend = mappings.map(data => {
    const nextId = (currentId++).toString();
    const objToSave = {
      'ID': nextId,
      'รหัสสินค้า': data.modelCode || "",
      'ชื่อสินค้า': data.modelName || "",
      'MAT Category Code': data.matCategoryCode || "",
      'MAT Category': data.matCategoryName || "",
      'รหัสประเภทอาการ': data.symptomTypeCode || "",
      'ประเภทอาการอาการ': data.symptomTypeName || "",
    };
    createdMappings.push({ ...data, id: nextId } as MasterDataMapping);
    return mapObjectToRow(headers, objToSave);
  });
  
  const { appendRows } = require('./google-sheets');
  await appendRows(`${SHEETS.MASTERDATA}!A2:Z`, rowsToAppend);
  return createdMappings;
}
export async function updateMasterDataMapping(id: string, data: Partial<MasterDataMapping>): Promise<MasterDataMapping> {
  const all = await getMasterDataMappings();
  const existing = all.find(x => x.id === id);
  if (!existing) throw new Error('Not found');
  const merged = { ...existing, ...data };
  const allRows = await readSheet(`${SHEETS.MASTERDATA}!A1:Z`);
  const headers = allRows[0] || [];
  
  const objToSave = {
    'ID': merged.id,
    'รหัสสินค้า': merged.modelCode || "",
    'ชื่อสินค้า': merged.modelName || "",
    'MAT Category Code': merged.matCategoryCode || "",
    'MAT Category': merged.matCategoryName || "",
    'รหัสประเภทอาการ': merged.symptomTypeCode || "",
    'ประเภทอาการอาการ': merged.symptomTypeName || "",
  };
  
  await updateRowById(SHEETS.MASTERDATA, id, mapObjectToRow(headers, objToSave));
  return merged as any;
}
export async function deleteMasterDataMapping(id: string): Promise<void> {
  await deleteRowById(SHEETS.MASTERDATA, id);
}
