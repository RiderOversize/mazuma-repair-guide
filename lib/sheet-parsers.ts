import { mapRowToObject, getIndexCaseInsensitive } from "./google-sheets";
import { type AuthUser } from "./auth";
import {
  type Category,
  type DeviceModel,
  type Guide,
  type SubCategory,
  type SymptomType,
  type Symptom,
  type MasterDataMapping
} from "./types";

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

const safeParse = (str: string, fallback: any) => {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

// ---------------------------------------------------------------------------
// Users Parser
// ---------------------------------------------------------------------------
export function parseUsersFromRows(allRows: any[][]): AuthUser[] {
  if (!allRows || allRows.length <= 1) return [];
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  const empCodeIdx = getIndexCaseInsensitive(headers, 'employeeCode');

  const validRows = rows.filter(r => {
    if (!r || !Array.isArray(r) || r.length === 0) return false;
    const code = empCodeIdx !== -1 ? r[empCodeIdx] : r[0];
    return typeof code === 'string' ? code.trim() !== '' : !!code;
  });

  const uniqueRows = Array.from(new Map(validRows.map(r => {
    const code = String((empCodeIdx !== -1 ? r[empCodeIdx] : r[0]) || '').trim();
    return [code, r];
  })).values());
  
  const users: AuthUser[] = [];
  for (const r of uniqueRows) {
    const obj = mapRowToObject(headers, r);
    const code = String(obj.employeeCode || '').trim();
    if (!code) continue;
    let accessibleMenus: string[] | undefined = undefined;
    if (obj.accessibleMenus !== undefined && obj.accessibleMenus !== null) {
      const raw = String(obj.accessibleMenus).trim();
      if (raw === "none" || raw === "-") {
        accessibleMenus = [];
      } else if (raw !== "") {
        accessibleMenus = raw.split(',').map((s: string) => s.trim()).filter(Boolean);
      } else if (obj.role !== "technician") {
        // If the accessibleMenus field is explicitly blank for admin/head
        accessibleMenus = [];
      }
    }

    users.push({
      employeeCode: code,
      name: obj.name || "",
      phone: obj.phone || "",
      role: (obj.role as any) || "technician",
      title: obj.role === "admin" ? "ผู้ดูแลระบบ" : obj.role === "head" ? "หัวหน้าช่าง" : "ช่างเทคนิค",
      status: (obj.status as any) || "active",
      createdAt: obj.createdAt || "",
      initials: obj.name ? obj.name.substring(0, 2) : "",
      avatar: obj.avatarUrl || (obj.role === "admin" ? "/avatars/admin.png" : "/avatars/technician.png"),
      lineName: obj.LineName || obj.lineName || "-",
      lineUserId: obj.lineUserId || "",
      assignedSupervisors: obj.assignedHeads ? obj.assignedHeads.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      accessibleMenus,
    });
  }
  return users;
}

// ---------------------------------------------------------------------------
// Models Parser
// ---------------------------------------------------------------------------
export function parseModelsFromRows(allRows: any[][]): DeviceModel[] {
  if (!allRows || allRows.length <= 1) return [];
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

// ---------------------------------------------------------------------------
// Categories Parser
// ---------------------------------------------------------------------------
export function parseCategoriesFromRows(allRows: any[][]): Category[] {
  if (!allRows || allRows.length <= 1) return [];
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

// ---------------------------------------------------------------------------
// SubCategories Parser
// ---------------------------------------------------------------------------
export function parseSubCategoriesFromRows(allRows: any[][]): SubCategory[] {
  if (!allRows || allRows.length <= 1) return [];
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

// ---------------------------------------------------------------------------
// Symptom Types Parser
// ---------------------------------------------------------------------------
export function parseSymptomTypesFromRows(allRows: any[][]): SymptomType[] {
  if (!allRows || allRows.length <= 1) return [];
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  
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
  
  const unique = new Map();
  mapped.forEach(t => {
    if (!unique.has(t.id)) unique.set(t.id, t);
  });
  return Array.from(unique.values());
}

// ---------------------------------------------------------------------------
// Symptoms Parser
// ---------------------------------------------------------------------------
export function parseSymptomsFromRows(allRows: any[][]): Symptom[] {
  if (!allRows || allRows.length <= 1) return [];
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  
  const mapped = rows.map((r, index) => {
    const obj = mapRowToObject(headers, r);
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
  
  const unique = new Map();
  mapped.forEach(s => {
    if (!unique.has(s.id)) unique.set(s.id, s);
  });
  return Array.from(unique.values());
}

// ---------------------------------------------------------------------------
// Guides Parser
// ---------------------------------------------------------------------------
export function parseGuidesFromRows(guideAllRows: any[][]): Guide[] {
  if (!guideAllRows || guideAllRows.length <= 1) return [];
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

// ---------------------------------------------------------------------------
// Repair Stats & Feedback Parser
// ---------------------------------------------------------------------------
export function parseRepairStatsFromRows(allRows: any[][]) {
  if (!allRows || allRows.length <= 1) {
    return { total: 0, successRate: 0, avgStepsSuccess: "0", successCount: 0, failedCount: 0, feedbacks: [] as RepairFeedback[] };
  }
  const headers = allRows[0] || [];
  const rows = allRows.slice(1);
  
  const total = rows.length;
  const isSuccessIndex = getIndexCaseInsensitive(headers, 'isSuccess');
  const stepsViewedIndex = getIndexCaseInsensitive(headers, 'stepsViewed');
  
  const successRows = rows.filter(r => isSuccessIndex !== -1 && (r[isSuccessIndex] === "TRUE" || r[isSuccessIndex] === true));
  const successCount = successRows.length;
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;
  
  const avgStepsSuccess = successRows.length > 0 && stepsViewedIndex !== -1
    ? (successRows.reduce((sum, r) => sum + parseInt(r[stepsViewedIndex] || "0"), 0) / successRows.length).toFixed(1)
    : "0";

  const failedCount = total - successCount;

  const feedbacks = rows.map(r => {
    const obj = mapRowToObject(headers, r);
    return {
      id: obj.id || `fb-${Math.random()}`,
      guideId: obj.guideId,
      modelId: obj.modelId,
      userId: obj.userId,
      userName: obj.userName,
      isSuccess: obj.isSuccess === "TRUE" || obj.isSuccess === true,
      stepsViewed: parseInt(obj.stepsViewed || "0"),
      totalSteps: parseInt(obj.totalSteps || "0"),
      timestamp: obj.timestamp,
      note: obj.note
    } as RepairFeedback;
  });

  return { total, successRate, avgStepsSuccess, successCount, failedCount, feedbacks: feedbacks.reverse() };
}

// ---------------------------------------------------------------------------
// Top Models Parser
// ---------------------------------------------------------------------------
export function parseTopModelsFromRows(allRows: any[][]) {
  if (!allRows || allRows.length <= 1) return [];
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
  
  return Object.entries(modelCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([modelId, count]) => ({ modelId, count }))
    .slice(0, 5);
}

// ---------------------------------------------------------------------------
// Master Data Mappings Parser
// ---------------------------------------------------------------------------
export function parseMasterDataMappingsFromRows(allRows: any[][]): MasterDataMapping[] {
  if (!allRows || allRows.length <= 1) return [];
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
