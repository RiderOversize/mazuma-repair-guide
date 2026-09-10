"use server"

import {
  getUsers as _getUsers,
  createUser as _createUser,
  updateUser as _updateUser,
  deleteUser as _deleteUser,
  getModels as _getModels,
  createModel as _createModel,
  updateModel as _updateModel,
  deleteModel as _deleteModel,
  getCategories as _getCategories,
  createCategory as _createCategory,
  updateCategory as _updateCategory,
  deleteCategory as _deleteCategory,
  getGuides as _getGuides,
  getGuideById as _getGuideById,
  createGuide as _createGuide,
  updateGuide as _updateGuide,
  deleteGuide as _deleteGuide,
  getMasterDataMappings as _getMasterDataMappings,
  createMasterDataMapping as _createMasterDataMapping,
  bulkCreateMasterDataMappings as _bulkCreateMasterDataMappings,
  updateMasterDataMapping as _updateMasterDataMapping,
  deleteMasterDataMapping as _deleteMasterDataMapping,
  logRepairFeedback as _logRepairFeedback,
  getRepairStats as _getRepairStats,
  logSessionActivity as _logSessionActivity,
  getActiveSessions as _getActiveSessions,
  getTopModels as _getTopModels,
  getSubCategories as _getSubCategories,
  createSubCategory as _createSubCategory,
  updateSubCategory as _updateSubCategory,
  deleteSubCategory as _deleteSubCategory,
  createFullCategory as _createFullCategory,
  getSymptomTypes as _getSymptomTypes,
  createSymptomType as _createSymptomType,
  updateSymptomType as _updateSymptomType,
  deleteSymptomType as _deleteSymptomType,
  getSymptoms as _getSymptoms,
  createSymptom as _createSymptom,
  updateSymptom as _updateSymptom,
  deleteSymptom as _deleteSymptom
} from "./sheets-db";
import type { Category, SubCategory, DeviceModel, ActiveSession, RepairFeedback } from "./types";

export { type ActiveSession, type RepairFeedback } from "./types";
export { type CreateFullCategoryInput } from "./sheets-db";

export const getUsers = _getUsers;
export const createUser = _createUser;
export const updateUser = _updateUser;
export const deleteUser = _deleteUser;

export const getModels = _getModels;
export const createModel = _createModel;
export const updateModel = _updateModel;
export const deleteModel = _deleteModel;

export const getCategories = _getCategories;
export const createCategory = _createCategory;
export const updateCategory = _updateCategory;
export const deleteCategory = _deleteCategory;

export const getSubCategories = _getSubCategories;
export const createSubCategory = _createSubCategory;
export const updateSubCategory = _updateSubCategory;
export const deleteSubCategory = _deleteSubCategory;
export const createFullCategory = _createFullCategory;
export const getSymptomTypes = _getSymptomTypes;
export const createSymptomType = _createSymptomType;
export const updateSymptomType = _updateSymptomType;
export const deleteSymptomType = _deleteSymptomType;
export const getSymptoms = _getSymptoms;
export const createSymptom = _createSymptom;
export const updateSymptom = _updateSymptom;
export const deleteSymptom = _deleteSymptom;

export const getGuides = _getGuides;
export const getGuideById = _getGuideById;
export const createGuide = _createGuide;
export const updateGuide = _updateGuide;
export const deleteGuide = _deleteGuide;

export const getMasterDataMappings = _getMasterDataMappings;
export const createMasterDataMapping = _createMasterDataMapping;
export const bulkCreateMasterDataMappings = _bulkCreateMasterDataMappings;
export const updateMasterDataMapping = _updateMasterDataMapping;
export const deleteMasterDataMapping = _deleteMasterDataMapping;

export const logRepairFeedback = _logRepairFeedback;
export const getRepairStats = _getRepairStats;
export const logSessionActivity = _logSessionActivity;
export const getActiveSessions = _getActiveSessions;
export const getTopModels = _getTopModels;

// ---------------------------------------------------------------------------
// Preload: Fetch all data in a single batchGet call for faster page loads
// ---------------------------------------------------------------------------
import { readMultipleSheets, SHEETS } from "./google-sheets";
import {
  parseUsersFromRows,
  parseModelsFromRows,
  parseCategoriesFromRows,
  parseSubCategoriesFromRows,
  parseSymptomTypesFromRows,
  parseSymptomsFromRows,
  parseGuidesFromRows,
  parseMasterDataMappingsFromRows,
  parseRepairStatsFromRows,
  parseTopModelsFromRows,
} from "./sheet-parsers";

import { deriveCategoriesFromModels, PREFIX_CATEGORY_NAMES, isAllowedModel, isModelInSubCategory } from "./category-theme";

export async function preloadTechnicianData(forceRefresh = false) {
  const ranges = [
    `${SHEETS.GUIDES}!A1:Z`,
    `${SHEETS.SYMPTOM_TYPES}!A1:Z`,
    `${SHEETS.SYMPTOMS}!A1:Z`,
    `${SHEETS.MASTERDATA}!A1:Z`,
    `${SHEETS.MODELS}!A1:Z`,
  ];

  // Batch fetch models, guides, and symptoms directly without ProductGroup/ProductCategory
  const batchData = await readMultipleSheets(ranges, forceRefresh);

  const gds = parseGuidesFromRows(batchData[`${SHEETS.GUIDES}!A1:Z`] || []);
  const symTypes = parseSymptomTypesFromRows(batchData[`${SHEETS.SYMPTOM_TYPES}!A1:Z`] || []);
  const syms = parseSymptomsFromRows(batchData[`${SHEETS.SYMPTOMS}!A1:Z`] || []);
  const mappings = parseMasterDataMappingsFromRows(batchData[`${SHEETS.MASTERDATA}!A1:Z`] || []);
  const rawMods = parseModelsFromRows(batchData[`${SHEETS.MODELS}!A1:Z`] || []);

  // สร้างหมวดหมู่โดยตรงจาก Models (SFTP) และ MasterData
  const sftpCategories = deriveCategoriesFromModels(rawMods, mappings);

  // ดึง Thumbnail และ Status จากชีต Models (ถ้ามี) มาประกอบกับ MasterData
  const thumbByCode = new Map<string, string>();
  const thumbByName = new Map<string, string>();
  const statusByCode = new Map<string, "active" | "discontinued">();
  const statusByName = new Map<string, "active" | "discontinued">();
  rawMods.forEach((m) => {
    const s: "active" | "discontinued" = m.status === "discontinued" ? "discontinued" : "active";
    if (m.code) {
      const codeKey = m.code.trim().toLowerCase();
      if (m.thumbnail) thumbByCode.set(codeKey, m.thumbnail);
      statusByCode.set(codeKey, s);
    }
    if (m.name) {
      const nameKey = m.name.trim().toLowerCase();
      if (m.thumbnail) thumbByName.set(nameKey, m.thumbnail);
      statusByName.set(nameKey, s);
    }
  });

  // สร้างรายการรุ่นสินค้าสำหรับแอปช่าง ดึงตรงจากชีต MasterData
  const validMappings = mappings.filter((m) => {
    return (m.modelCode || "").trim() !== "" || (m.modelName || "").trim() !== "";
  });

  const masterDataModels: DeviceModel[] = validMappings.map((m, index) => {
    const code = (m.modelCode || "").trim();
    const name = (m.modelName || "").trim();
    const matCatCode = (m.matCategoryCode || "").trim();
    const matCatName = (m.matCategoryName || "").trim();

    // Use raw Thai category name directly with prefix fallback
    let categoryId = matCatName;
    if (!categoryId && matCatCode) {
      const prefix = matCatCode.split("-")[0].toUpperCase();
      categoryId = PREFIX_CATEGORY_NAMES[prefix] || matCatCode;
    }
    if (!categoryId && code) {
      const prefix = code.split("-")[0].toUpperCase();
      categoryId = PREFIX_CATEGORY_NAMES[prefix] || "";
    }
    if (!categoryId) {
      categoryId = "สินค้าทั่วไป";
    }

    const codeLower = code.toLowerCase();
    const nameLower = name.toLowerCase();
    const thumbnail = (codeLower ? thumbByCode.get(codeLower) : "") || (nameLower ? thumbByName.get(nameLower) : "") || "";
    const status: "active" | "discontinued" =
      (codeLower ? statusByCode.get(codeLower) : undefined) ||
      (nameLower ? statusByName.get(nameLower) : undefined) ||
      "active";

    return {
      id: code || m.id || `md-model-${index}`,
      code: code,
      name: name || code || "ไม่ระบุชื่อรุ่น",
      categoryId: categoryId,
      subcategoryId: "",
      symptomTypeId: (m.symptomTypeCode || "").trim(),
      thumbnail: thumbnail,
      status: status,
      createdAt: m.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }).filter((m) => m.code || m.name);

  // ตัดรายการซ้ำตามรหัสรุ่น (Deduplicate)
  const uniqueMasterModels = new Map<string, DeviceModel>();
  masterDataModels.forEach((m) => {
    const key = m.code ? m.code.toLowerCase() : m.id;
    if (!uniqueMasterModels.has(key)) {
      uniqueMasterModels.set(key, m);
    }
  });

  // รุ่นสินค้าที่มีคู่มือจริงตรงตามชีต MasterData
  const finalModels = Array.from(uniqueMasterModels.values()).filter(isAllowedModel);

  // นับจำนวนรุ่นของแต่ละหมวดหมู่ SFTP เพื่อจัดเรียงหมวดหมู่ที่มีสินค้าขึ้นมาก่อน
  const modelCountByCat = new Map<string, number>();
  finalModels.forEach((m) => {
    if (m.categoryId) {
      const key = m.categoryId.toLowerCase();
      modelCountByCat.set(key, (modelCountByCat.get(key) || 0) + 1);
    }
  });

  sftpCategories.sort((a, b) => {
    const countA = modelCountByCat.get(a.slug.toLowerCase()) || modelCountByCat.get(a.id.toLowerCase()) || 0;
    const countB = modelCountByCat.get(b.slug.toLowerCase()) || modelCountByCat.get(b.id.toLowerCase()) || 0;
    if (countA > 0 && countB === 0) return -1;
    if (countB > 0 && countA === 0) return 1;
    return a.slug.localeCompare(b.slug, 'th');
  });

  // โชว์เฉพาะหมวดที่มีคู่มือแล้วเท่านั้น (มีรุ่นที่มีคู่มือ published จริง)
  const categoriesWithGuides = sftpCategories.filter((cat) => {
    return finalModels.some((m) =>
      m.categoryId === cat.id ||
      m.categoryId === cat.slug ||
      m.categoryId === cat.name ||
      isModelInSubCategory(m, cat)
    );
  });

  return {
    categories: categoriesWithGuides,
    guides: gds,
    subCategories: [] as SubCategory[],
    symptomTypes: symTypes,
    symptoms: syms,
    mappings,
    models: finalModels,
  };
}

export async function preloadAdminData() {
  const ranges = [
    `${SHEETS.MASTERDATA}!A1:Z`,
    `${SHEETS.FEEDBACKS}!A1:Z`,
    `${SHEETS.SYMPTOMS}!A1:Z`,
    `${SHEETS.MODELS}!A1:Z`,
    `${SHEETS.GUIDES}!A1:Z`,
    `${SHEETS.USERS}!A1:Z`,
  ];

  const batchData = await readMultipleSheets(ranges);

  const maps = parseMasterDataMappingsFromRows(batchData[`${SHEETS.MASTERDATA}!A1:Z`] || []);
  const masterCatByCode = new Map<string, string>();
  const masterCatByName = new Map<string, string>();
  maps.forEach((m) => {
    const code = (m.modelCode || "").trim().toUpperCase();
    const name = (m.modelName || "").trim().toLowerCase();
    const cat = (m.matCategoryName || "").trim();
    if (code && cat) masterCatByCode.set(code, cat);
    if (name && cat) masterCatByName.set(name, cat);
  });

  const rawMods = parseModelsFromRows(batchData[`${SHEETS.MODELS}!A1:Z`] || []);
  const mods = rawMods.map((m) => {
    const codeKey = (m.code || "").trim().toUpperCase();
    const nameKey = (m.name || "").trim().toLowerCase();
    const masterCat = masterCatByCode.get(codeKey) || (nameKey ? masterCatByName.get(nameKey) : undefined);
    if (masterCat) {
      return { ...m, categoryId: masterCat };
    }

    const cat = (m.categoryId || "").trim();
    const sub = (m.subcategoryId && isNaN(Number(m.subcategoryId))) ? m.subcategoryId.trim() : "";
    let finalCat = "";
    if (/[ก-๙]/.test(cat)) {
      finalCat = cat;
    } else if (sub && /[ก-๙]/.test(sub)) {
      finalCat = sub;
    } else if (cat) {
      const prefix = cat.split("-")[0].toUpperCase();
      finalCat = PREFIX_CATEGORY_NAMES[prefix] || cat;
    } else if (m.code) {
      const prefix = m.code.split("-")[0].toUpperCase();
      finalCat = PREFIX_CATEGORY_NAMES[prefix] || "";
    }

    // Infer category from model name if category is still missing or "สินค้าทั่วไป"
    if (!finalCat || finalCat === "สินค้าทั่วไป") {
      const name = (m.name || "").trim();
      if (name.includes("เครื่องทำน้ำอุ่น") || name.includes("เครื่องทำน้ำร้อน")) {
        finalCat = "เครื่องทำน้ำอุ่น-น้ำร้อน";
      } else if (name.includes("เครื่องกรอง") || name.includes("กรองน้ำ")) {
        finalCat = "เครื่องกรองน้ำ";
      } else if (name.includes("ตู้กดน้ำ") || name.includes("ตู้ทำน้ำเย็น") || name.includes("ตู้ทำน้ำดื่ม")) {
        finalCat = "ตู้กดน้ำดื่ม";
      } else if (name.includes("พัดลม")) {
        finalCat = "พัดลมระบายอากาศ";
      } else if (name.includes("ปั๊ม")) {
        finalCat = "ปั๊มน้ำแรงดัน";
      } else if (name.includes("เครื่องฟอกอากาศ")) {
        finalCat = "เครื่องฟอกอากาศ";
      } else if (name.includes("เครื่องผลิตน้ำแข็ง")) {
        finalCat = "เครื่องผลิตน้ำแข็ง";
      } else if (name.includes("หม้อต้ม")) {
        finalCat = "หม้อต้มน้ำร้อน";
      } else if (name.includes("แอร์") || name.includes("ปรับอากาศ")) {
        finalCat = "เครื่องปรับอากาศ";
      } else if (name.toLowerCase().includes("robot") || name.includes("หุ่นยนต์")) {
        finalCat = "หุ่นยนต์บริการ";
      }
    }

    return { ...m, categoryId: finalCat || "สินค้าทั่วไป" };
  }).filter(isAllowedModel);
  const cats = deriveCategoriesFromModels(mods, maps);
  const repStats = parseRepairStatsFromRows(batchData[`${SHEETS.FEEDBACKS}!A1:Z`] || []);
  const sessions: ActiveSession[] = [];
  const top = parseTopModelsFromRows(batchData[`${SHEETS.FEEDBACKS}!A1:Z`] || []);
  const syms = parseSymptomsFromRows(batchData[`${SHEETS.SYMPTOMS}!A1:Z`] || []);
  const gds = parseGuidesFromRows(batchData[`${SHEETS.GUIDES}!A1:Z`] || []);
  const users = parseUsersFromRows(batchData[`${SHEETS.USERS}!A1:Z`] || []);

  return { categories: cats, mappings: maps, models: mods, repairStats: repStats, activeSessions: sessions, topModels: top, symptoms: syms, guides: gds, users };
}
