"use server"

import { readSheet, appendRow, appendRows, updateRowById, deleteRowById, deleteRowsByFilter, mapRowToObject, mapObjectToRow, SHEETS, getIndexCaseInsensitive } from "./google-sheets";
import { type AuthUser } from "./auth";
import { type Category, type DeviceModel, type Guide, type GuideStep, type SubCategory, type SymptomType, type Symptom } from "./types";
import {
  parseUsersFromRows,
  parseModelsFromRows,
  parseCategoriesFromRows,
  parseSubCategoriesFromRows,
  parseSymptomTypesFromRows,
  parseSymptomsFromRows,
  parseGuidesFromRows,
  parseRepairStatsFromRows,
  parseTopModelsFromRows,
  parseMasterDataMappingsFromRows,
} from "./sheet-parsers";

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
  return parseUsersFromRows(allRows);
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
    LineName: newUser.lineName || "-",
    assignedHeads: (newUser.assignedSupervisors || []).join(','),
    accessibleMenus: Array.isArray(newUser.accessibleMenus) 
      ? (newUser.accessibleMenus.length === 0 ? "none" : newUser.accessibleMenus.join(',')) 
      : (newUser.accessibleMenus || "")
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
    LineName: merged.lineName || "-",
    assignedHeads: (merged.assignedSupervisors || []).join(','),
    accessibleMenus: Array.isArray(merged.accessibleMenus) 
      ? (merged.accessibleMenus.length === 0 ? "none" : merged.accessibleMenus.join(',')) 
      : (merged.accessibleMenus || "")
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
  return parseModelsFromRows(allRows);
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
  return parseCategoriesFromRows(allRows);
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

export async function deleteCategory(id: string): Promise<{
  deletedSubCategoriesCount: number;
  deletedModelsCount: number;
}> {
  const cats = await getCategories();
  const targetCat = cats.find(c => c.id === id || c.slug === id);
  const catSlug = (targetCat?.slug || id).trim().toUpperCase();
  const catId = (targetCat?.id || id).trim();

  // 1. Collect and delete subcategories belonging to this category
  const subCatIdsToDelete = new Set<string>();
  const subCatIndexesToDelete = new Set<string>();
  const subCatNamesToDelete = new Set<string>();

  const deletedSubCatsCount = await deleteRowsByFilter(SHEETS.SUBCATEGORIES, (obj) => {
    const scCatId = (obj.Index || obj.categoryId || '').trim().toUpperCase();
    const scMatCode = (obj['MAT Category Code'] || obj.MATCategoryCode || obj.index || '').trim().toUpperCase();
    const scId = (obj.ID || obj.id || '').trim();
    const scName = (obj.Description || obj.name || '').trim();

    const isMatch = scCatId === catSlug || scCatId === catId || (catSlug && scMatCode.startsWith(`${catSlug}-`));
    if (isMatch) {
      if (scId) subCatIdsToDelete.add(scId);
      if (scMatCode) subCatIndexesToDelete.add(scMatCode);
      if (scName) subCatNamesToDelete.add(scName);
      return true;
    }
    return false;
  });

  // 2. Delete models belonging to this category or its subcategories
  const deletedModelsCount = await deleteRowsByFilter(SHEETS.MODELS, (obj) => {
    const mCatId = (obj.categoryId || '').trim().toUpperCase();
    const mSubCatId = (obj.subcategoryId || '').trim();

    const isDirectMatch = mCatId === catSlug || mCatId === catId;
    const isSubCatMatch = subCatIdsToDelete.has(mSubCatId) || 
                          subCatIndexesToDelete.has(mSubCatId.toUpperCase()) || 
                          subCatNamesToDelete.has(mSubCatId);

    return Boolean(isDirectMatch || isSubCatMatch);
  });

  // 3. Delete category from ProductGroup
  await deleteRowsByFilter(SHEETS.CATEGORIES, (obj) => {
    const cId = (obj.ID || obj.id || '').trim();
    const cSlug = (obj.Index || obj.slug || '').trim().toUpperCase();
    return Boolean(cId === catId || cSlug === catSlug);
  });

  return {
    deletedSubCategoriesCount: deletedSubCatsCount,
    deletedModelsCount: deletedModelsCount,
  };
}

// ---------------------------------------------------------------------------
// SubCategories
// ---------------------------------------------------------------------------
export async function getSubCategories(): Promise<SubCategory[]> {
  const allRows = await readSheet(`${SHEETS.SUBCATEGORIES}!A1:Z`);
  return parseSubCategoriesFromRows(allRows);
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

export async function deleteSubCategory(id: string): Promise<{
  deletedModelsCount: number;
}> {
  const subCats = await getSubCategories();
  const targetSubCat = subCats.find(sc => sc.id === id);
  const subCatId = (targetSubCat?.id || id).trim();
  const subCatIndex = (targetSubCat?.index || '').trim().toUpperCase();
  const subCatName = (targetSubCat?.name || '').trim();

  // 1. Delete models belonging to this subcategory
  const deletedModelsCount = await deleteRowsByFilter(SHEETS.MODELS, (obj) => {
    const mSubCatId = (obj.subcategoryId || '').trim();
    return Boolean(
      mSubCatId === subCatId || 
      (subCatIndex && mSubCatId.toUpperCase() === subCatIndex) || 
      (subCatName && mSubCatId === subCatName)
    );
  });

  // 2. Delete the subcategory itself
  await deleteRowsByFilter(SHEETS.SUBCATEGORIES, (obj) => {
    const sId = (obj.ID || obj.id || '').trim();
    return Boolean(sId === subCatId);
  });

  return {
    deletedModelsCount,
  };
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

export interface CreateFullCategoryInput {
  isNewGroup: boolean;
  groupIndex: string;  // e.g. FH or FA
  groupName: string;   // e.g. เครื่องผลิตน้ำแข็ง
  subCatIndex: string; // e.g. FH-01-00 (MAT Category Code)
  subCatName: string;  // e.g. เครื่องผลิตน้ำแข็ง
}

export async function createFullCategory(input: CreateFullCategoryInput): Promise<{
  group: Category;
  subCategory: SubCategory;
}> {
  const { isNewGroup, groupIndex, groupName, subCatIndex, subCatName } = input;
  const cleanGroupIndex = (groupIndex || '').trim().toUpperCase();
  const cleanGroupName = (groupName || '').trim();
  const cleanSubCatIndex = (subCatIndex || '').trim();
  const cleanSubCatName = (subCatName || '').trim();

  if (!cleanGroupIndex) throw new Error("กรุณาระบุรหัสกลุ่มสินค้าหลัก (Index เช่น FH, FA)");
  if (!cleanSubCatIndex) throw new Error("กรุณาระบุรหัสหมวดหมู่ SFTP (MAT Category Code เช่น FH-01-00)");
  if (!cleanSubCatName) throw new Error("กรุณาระบุชื่อหมวดหมู่ย่อย");

  let group: Category;

  if (isNewGroup) {
    const allGroups = await getCategories();
    const existingGroup = allGroups.find(g => (g.slug || '').toUpperCase() === cleanGroupIndex);
    if (existingGroup) {
      group = existingGroup;
    } else {
      group = await createCategory({
        slug: cleanGroupIndex,
        name: cleanGroupName || cleanSubCatName,
      });
    }
  } else {
    const allGroups = await getCategories();
    const existingGroup = allGroups.find(g => (g.slug || '').toUpperCase() === cleanGroupIndex || g.id === cleanGroupIndex);
    if (!existingGroup) {
      throw new Error(`ไม่พบกลุ่มสินค้าหลักรหัส ${cleanGroupIndex}`);
    }
    group = existingGroup;
  }

  // Create Subcategory with FK (Index in ProductCategory = group.slug e.g. 'FH')
  const subCategory = await createSubCategory({
    categoryId: group.slug || cleanGroupIndex,
    index: cleanSubCatIndex,
    name: cleanSubCatName,
  });

  return { group, subCategory };
}

// ---------------------------------------------------------------------------
// Symptom Types & Symptoms
// ---------------------------------------------------------------------------
export async function getSymptomTypes(): Promise<SymptomType[]> {
  const allRows = await readSheet(`${SHEETS.SYMPTOM_TYPES}!A1:Z`);
  return parseSymptomTypesFromRows(allRows);
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
  return parseSymptomsFromRows(allRows);
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
  return parseGuidesFromRows(guideAllRows);
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
  try {
    const timestamp = new Date().toISOString();
    const id = `fb-${Date.now()}`;
    
    // Standard headers for feedbacks sheet to avoid redundant readSheet API call
    const headers = ['id', 'guideId', 'modelId', 'userId', 'userName', 'isSuccess', 'stepsViewed', 'totalSteps', 'timestamp', 'note'];
    
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
  } catch (err) {
    console.error("Non-blocking error logging repair feedback:", err);
  }
}

export async function getRepairStats() {
  const allRows = await readSheet(`${SHEETS.FEEDBACKS}!A1:Z`);
  return parseRepairStatsFromRows(allRows);
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
  return parseTopModelsFromRows(allRows);
}

import { MasterDataMapping } from './types';

export async function getMasterDataMappings(): Promise<MasterDataMapping[]> {
  const allRows = await readSheet(`${SHEETS.MASTERDATA}!A1:Z`);
  return parseMasterDataMappingsFromRows(allRows);
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

  // Auto-sync symptomTypeId to Models sheet
  if (data.modelCode && data.symptomTypeCode) {
    try {
      const models = await getModels();
      const matched = models.find(m => m.code?.trim() === data.modelCode?.trim() || m.name?.trim() === data.modelName?.trim());
      if (matched) {
        await updateModel(matched.id, { symptomTypeId: data.symptomTypeCode });
      }
    } catch (e) {
      console.warn("Failed to auto-update model symptomTypeId:", e);
    }
  }

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
  
  await appendRows(`${SHEETS.MASTERDATA}!A2:Z`, rowsToAppend);

  // Auto-sync symptomTypeId to Models
  try {
    const models = await getModels();
    for (const mData of mappings) {
      if (mData.modelCode && mData.symptomTypeCode) {
        const matched = models.find(m => m.code?.trim() === mData.modelCode?.trim());
        if (matched) {
          await updateModel(matched.id, { symptomTypeId: mData.symptomTypeCode });
        }
      }
    }
  } catch (e) {
    console.warn("Failed to auto-sync bulk models symptomTypeId:", e);
  }

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

  // Auto-sync symptomTypeId to Models
  if (merged.modelCode && merged.symptomTypeCode) {
    try {
      const models = await getModels();
      const matched = models.find(m => m.code?.trim() === merged.modelCode?.trim());
      if (matched) {
        await updateModel(matched.id, { symptomTypeId: merged.symptomTypeCode });
      }
    } catch (e) {
      console.warn("Failed to update model symptomTypeId:", e);
    }
  }

  return merged as any;
}
export async function deleteMasterDataMapping(id: string): Promise<void> {
  const all = await getMasterDataMappings();
  const existing = all.find(x => x.id === id);

  await deleteRowById(SHEETS.MASTERDATA, id);

  // Clear symptomTypeId on matched Model
  if (existing?.modelCode) {
    try {
      const models = await getModels();
      const matched = models.find(m => m.code?.trim() === existing.modelCode?.trim());
      if (matched && matched.symptomTypeId === existing.symptomTypeCode) {
        await updateModel(matched.id, { symptomTypeId: "" });
      }
    } catch (e) {
      console.warn("Failed to clear model symptomTypeId:", e);
    }
  }
}
