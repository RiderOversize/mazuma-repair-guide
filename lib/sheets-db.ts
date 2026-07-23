"use server"

import { readSheet, appendRow, updateRowById, deleteRowById, mapRowToObject, mapObjectToRow, SHEETS, getIndexCaseInsensitive } from "./google-sheets";
import { type AuthUser } from "./auth";
import { type Category, type DeviceModel, type Guide, type GuideStep, type SubCategory, type SymptomType, type Symptom } from "./mock-data";

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
export async function getUsers(): Promise<AuthUser[]> {
  const allRows = await readSheet(`${SHEETS.USERS}!A1:Z`);
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
      avatar: obj.role === "admin" ? "/avatars/admin.png" : "/avatars/technician.png",
      lineName: "-",
      lineUserId: obj.lineUserId,
      assignedSupervisors: obj.assignedSupervisors ? obj.assignedSupervisors.split(',').filter(Boolean) : [],
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
    assignedSupervisors: (newUser.assignedSupervisors || []).join(','),
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
    assignedSupervisors: (merged.assignedSupervisors || []).join(','),
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
  
  return uniqueRows.map(r => {
    const obj = mapRowToObject(headers, r);
    const subCatCode = obj.subCategoryId || obj.categoryId || r[1] || "";
    const categoryId = subCatCode.substring(0, 2) || "F1"; 
    
    return {
      id: obj.id || r[0],
      subcategoryId: subCatCode || undefined,
      symptomTypeId: obj.SymptomTypesID || obj.symptomTypeId || r[2] || undefined,
      categoryId: categoryId,
      name: obj.name || r[3],
      code: obj.code || r[4],
      status: obj.status || r[5] || "active",
      thumbnail: obj.thumbnail || r[6] || "",
      createdAt: obj.createdAt || r[7] || new Date().toISOString()
    };
  });
}

export async function createModel(model: DeviceModel): Promise<DeviceModel> {
  const newModel = { ...model, id: model.id || `m-${Date.now()}`, status: model.status || "active", createdAt: model.createdAt || new Date().toISOString() };
  
  const allRows = await readSheet(`${SHEETS.MODELS}!A1:Z`);
  const headers = allRows[0] || [];
  
  const objToSave = {
    id: newModel.id,
    subCategoryId: newModel.subcategoryId || "",
    SymptomTypesID: newModel.symptomTypeId || "",
    name: newModel.name,
    code: newModel.code,
    status: newModel.status,
    thumbnail: newModel.thumbnail || "",
    createdAt: newModel.createdAt
  };
  
  const rowToAppend = mapObjectToRow(headers, objToSave);
  await appendRow(`${SHEETS.MODELS}!A2:Z`, rowToAppend);
  return newModel as DeviceModel;
}

export async function updateModel(id: string, data: Partial<DeviceModel>): Promise<DeviceModel> {
  const models = await getModels();
  const existing = models.find(m => m.id === id);
  if (!existing) throw new Error("Model not found");
  
  const merged = { ...existing, ...data };
  
  const allRows = await readSheet(`${SHEETS.MODELS}!A1:Z`);
  const headers = allRows[0] || [];
  
  const objToSave = {
    id: merged.id,
    subCategoryId: merged.subcategoryId || "",
    SymptomTypesID: merged.symptomTypeId || "",
    name: merged.name,
    code: merged.code,
    status: merged.status,
    thumbnail: merged.thumbnail || "",
    createdAt: merged.createdAt
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
      id: obj.id,
      name: obj.name,
      slug: obj.slug,
      description: obj.description,
      status: obj.status as any,
      createdAt: obj.createdAt
    };
  });
}

export async function createCategory(category: Partial<Category>): Promise<Category> {
  const newCat: Category = {
    id: category.id || `cat-${Date.now()}`,
    name: category.name || "",
    slug: category.slug || `slug-${Date.now()}`,
    description: category.description || "",
    status: "active",
    createdAt: new Date().toISOString()
  };
  
  const allRows = await readSheet(`${SHEETS.CATEGORIES}!A1:Z`);
  const headers = allRows[0] || [];
  
  const rowToAppend = mapObjectToRow(headers, newCat as Record<string, any>);
  await appendRow(`${SHEETS.CATEGORIES}!A2:Z`, rowToAppend);
  
  return newCat;
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  const cats = await getCategories();
  const existing = cats.find(c => c.id === id);
  if (!existing) throw new Error("Category not found");
  
  const merged = { ...existing, ...data };
  
  const allRows = await readSheet(`${SHEETS.CATEGORIES}!A1:Z`);
  const headers = allRows[0] || [];
  
  const rowToUpdate = mapObjectToRow(headers, merged as Record<string, any>);
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
      id: obj.id,
      categoryId: obj.categoryId,
      name: obj.name
    };
  });
}

export async function createSubCategory(subCat: SubCategory): Promise<SubCategory> {
  const allRows = await readSheet(`${SHEETS.SUBCATEGORIES}!A1:Z`);
  const headers = allRows[0] || [];
  const rowToAppend = mapObjectToRow(headers, subCat as Record<string, any>);
  await appendRow(`${SHEETS.SUBCATEGORIES}!A2:Z`, rowToAppend);
  return subCat;
}

export async function deleteSubCategory(id: string): Promise<void> {
  await deleteRowById(SHEETS.SUBCATEGORIES, id);
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
  
  return rows.map((r, index) => {
    const obj = mapRowToObject(headers, r);
    return {
      id: obj.id || (hasIdCol ? r[idColIndex] : `type-${index}`),
      name: obj.name || (hasIdCol ? (idColIndex === 0 ? r[1] : r[0]) : r[1] || r[0])
    };
  }).filter(t => t.name);
}

export async function getSymptoms(): Promise<Symptom[]> {
  const allRows = await readSheet(`${SHEETS.SYMPTOMS}!A1:Z`);
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  
  const idColIndex = getIndexCaseInsensitive(headers, 'id');
  const hasIdCol = idColIndex !== -1 || headers.some(h => h && (h.toLowerCase().includes('id') || h.includes('รหัสอาการ')));

  return rows.map((r, index) => {
    const obj = mapRowToObject(headers, r);
    // Find column positions of keys case-insensitively
    const idIdx = getIndexCaseInsensitive(headers, 'id');
    const typeIdx = getIndexCaseInsensitive(headers, 'symptomtypeid') !== -1 ? getIndexCaseInsensitive(headers, 'symptomtypeid') : getIndexCaseInsensitive(headers, 'symptomtypesid');
    const descIdx = getIndexCaseInsensitive(headers, 'description') !== -1 ? getIndexCaseInsensitive(headers, 'description') : getIndexCaseInsensitive(headers, 'description');
    
    return {
      id: obj.id || (idIdx !== -1 ? r[idIdx] : `sym-${index}`),
      symptomTypeId: obj.symptomTypeId || obj.SymptomTypesID || (typeIdx !== -1 ? r[typeIdx] : (hasIdCol ? r[1] : r[0])),
      description: obj.description || obj.name || (descIdx !== -1 ? r[descIdx] : (hasIdCol ? r[2] : r[1]))
    };
  }).filter(s => s.description);
}

// ---------------------------------------------------------------------------
// Guides
// ---------------------------------------------------------------------------
export async function getGuides(): Promise<Guide[]> {
  const guideAllRows = await readSheet(`${SHEETS.GUIDES}!A1:Z`);
  const guideHeaders = guideAllRows[0] || [];
  const guideRows = guideAllRows.slice(1);
  
  const stepAllRows = await readSheet(`${SHEETS.GUIDE_STEPS}!A1:Z`);
  const stepHeaders = stepAllRows[0] || [];
  const stepRows = stepAllRows.slice(1);
  
  const guideIdIdx = getIndexCaseInsensitive(guideHeaders, 'id');
  const stepIdIdx = getIndexCaseInsensitive(stepHeaders, 'id');
  const uniqueGuideRows = Array.from(new Map(guideRows.map(r => [r[guideIdIdx !== -1 ? guideIdIdx : 0], r])).values());
  const uniqueStepRows = Array.from(new Map(stepRows.map(r => [r[stepIdIdx !== -1 ? stepIdIdx : 0], r])).values());
  
  const stepsByGuideId: Record<string, GuideStep[]> = {};
  uniqueStepRows.forEach(r => {
    const obj = mapRowToObject(stepHeaders, r);
    const guideId = obj.guideId;
    if (!stepsByGuideId[guideId]) stepsByGuideId[guideId] = [];
    stepsByGuideId[guideId].push({
      stepNum: parseInt(obj.stepNum || "1"),
      instruction: obj.instruction,
      videoUrl: obj.videoUrl || "",
      pdfUrl: obj.pdfUrl || ""
    });
  });

  return uniqueGuideRows.map(r => {
    const obj = mapRowToObject(guideHeaders, r);
    const guideId = obj.id;
    return {
      id: guideId,
      categoryId: obj.categoryId,
      symptomId: obj.symptomId,
      specificCause: obj.specificCause,
      description: obj.description,
      status: obj.status as any,
      tags: obj.tags ? obj.tags.split(',').filter(Boolean) : [],
      toolsRequired: obj.toolsRequired ? obj.toolsRequired.split(',').filter(Boolean) : [],
      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt,
      steps: stepsByGuideId[guideId] || []
    };
  });
}

export async function getGuideById(id: string): Promise<Guide | null> {
  const guides = await getGuides();
  return guides.find(g => g.id === id) || null;
}

export async function createGuide(guide: Guide): Promise<Guide> {
  const newGuide = { 
    ...guide, 
    status: guide.status || "published", 
    createdAt: guide.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const guideAllRows = await readSheet(`${SHEETS.GUIDES}!A1:Z`);
  const guideHeaders = guideAllRows[0] || [];
  
  const objToSave = {
    id: newGuide.id,
    categoryId: newGuide.categoryId,
    symptomId: newGuide.symptomId,
    specificCause: newGuide.specificCause,
    description: newGuide.description || "",
    status: newGuide.status,
    tags: (newGuide.tags || []).join(','),
    toolsRequired: (newGuide.toolsRequired || []).join(','),
    createdAt: newGuide.createdAt,
    updatedAt: newGuide.updatedAt
  };
  
  const rowToAppend = mapObjectToRow(guideHeaders, objToSave);
  await appendRow(`${SHEETS.GUIDES}!A2:Z`, rowToAppend);
  
  if (newGuide.steps && newGuide.steps.length > 0) {
    const stepAllRows = await readSheet(`${SHEETS.GUIDE_STEPS}!A1:Z`);
    const stepHeaders = stepAllRows[0] || [];
    
    for (const step of newGuide.steps) {
      const stepObj = {
        id: `step-${newGuide.id}-${step.stepNum}`,
        guideId: newGuide.id,
        stepNum: step.stepNum,
        instruction: step.instruction,
        videoUrl: step.videoUrl || "",
        pdfUrl: step.pdfUrl || ""
      };
      await appendRow(`${SHEETS.GUIDE_STEPS}!A2:Z`, mapObjectToRow(stepHeaders, stepObj));
    }
  }
  
  return newGuide;
}

export async function updateGuide(id: string, data: Partial<Guide>): Promise<Guide> {
  const guides = await getGuides();
  const existing = guides.find(g => g.id === id);
  if (!existing) throw new Error("Guide not found");
  
  const merged = { ...existing, ...data, updatedAt: new Date().toISOString() };
  
  const guideAllRows = await readSheet(`${SHEETS.GUIDES}!A1:Z`);
  const guideHeaders = guideAllRows[0] || [];
  
  const objToSave = {
    id: merged.id,
    categoryId: merged.categoryId,
    symptomId: merged.symptomId,
    specificCause: merged.specificCause,
    description: merged.description || "",
    status: merged.status,
    tags: (merged.tags || []).join(','),
    toolsRequired: (merged.toolsRequired || []).join(','),
    createdAt: merged.createdAt,
    updatedAt: merged.updatedAt
  };
  
  const rowToUpdate = mapObjectToRow(guideHeaders, objToSave);
  await updateRowById(SHEETS.GUIDES, id, rowToUpdate);
  
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
    timestamp
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

  return { total, successRate, avgStepsSuccess };
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
