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
import type { DeviceModel } from "./types";

export { type ActiveSession, type RepairFeedback, type CreateFullCategoryInput } from "./sheets-db";

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

export async function preloadTechnicianData() {
  const ranges = [
    `${SHEETS.CATEGORIES}!A1:Z`,
    `${SHEETS.GUIDES}!A1:Z`,
    `${SHEETS.SUBCATEGORIES}!A1:Z`,
    `${SHEETS.SYMPTOM_TYPES}!A1:Z`,
    `${SHEETS.SYMPTOMS}!A1:Z`,
    `${SHEETS.MASTERDATA}!A1:Z`,
    `${SHEETS.MODELS}!A1:Z`,
  ];

  // This single batchGet call populates the cache for all ranges
  await readMultipleSheets(ranges);

  // Now these calls will all hit cache (instant)
  const [cats, gds, subCats, symTypes, syms, mappings, rawMods] = await Promise.all([
    _getCategories(),
    _getGuides(),
    _getSubCategories(),
    _getSymptomTypes(),
    _getSymptoms(),
    _getMasterDataMappings(),
    _getModels(),
  ]);

  // ดึง Thumbnail จากชีต Models (ถ้ามี) มาประกอบกับ MasterData
  const thumbByCode = new Map<string, string>();
  const thumbByName = new Map<string, string>();
  rawMods.forEach((m) => {
    if (m.code && m.thumbnail) thumbByCode.set(m.code.trim().toLowerCase(), m.thumbnail);
    if (m.name && m.thumbnail) thumbByName.set(m.name.trim().toLowerCase(), m.thumbnail);
  });

  // หาชุดของ symptomTypeId และ modelIds ที่มีคู่มือ published จริง
  const symptomTypeIdsWithGuides = new Set(
    gds
      .filter((g) => g.status === "published" || !g.status)
      .map((g) => {
        if (g.symptomTypeId) return g.symptomTypeId.trim();
        const sym = syms.find((s) => s.id === g.symptomId);
        return (sym?.symptomTypeId || "").trim();
      })
      .filter(Boolean)
  );
  const modelIdsWithDirectGuides = new Set(
    gds.flatMap((g) => (g.modelIds || []).map((id) => id.trim().toLowerCase()))
  );

  // สร้างรายการรุ่นสินค้าสำหรับแอปช่างโดยตรงจากชีต MasterData เฉพาะรุ่นที่มีคู่มือจริงในชีต Guides
  const validMappings = mappings.filter((m) => {
    const symCode = (m.symptomTypeCode || "").trim();
    if (symCode && symptomTypeIdsWithGuides.has(symCode)) return true;
    const mCode = (m.modelCode || "").trim().toLowerCase();
    if (mCode && modelIdsWithDirectGuides.has(mCode)) return true;
    return false;
  });

  const masterDataModels: DeviceModel[] = validMappings.map((m, index) => {
    const code = (m.modelCode || "").trim();
    const name = (m.modelName || "").trim();
    const matCatCode = (m.matCategoryCode || "").trim();
    const matCatName = (m.matCategoryName || "").trim();

    // 1. ระบุ Category จาก matCategoryCode (เช่น "F1-01-00" -> slug "F1") หรือชื่อหมวดหมู่
    let categoryId = "";
    if (matCatCode) {
      const prefix = matCatCode.split("-")[0].trim().toUpperCase();
      const matchedCat = cats.find(
        (c) => c.slug.toUpperCase() === prefix || c.id === prefix || (matCatName && c.name.toLowerCase() === matCatName.toLowerCase())
      );
      if (matchedCat) {
        categoryId = matchedCat.id || matchedCat.slug;
      } else {
        categoryId = prefix;
      }
    }
    if (!categoryId && matCatName) {
      const matchedCat = cats.find((c) => c.name.toLowerCase() === matCatName.toLowerCase());
      if (matchedCat) categoryId = matchedCat.id || matchedCat.slug;
    }

    // 2. ระบุ SubCategory จาก SubCategories
    let subcategoryId = matCatCode || matCatName || "";
    if (matCatCode || matCatName) {
      const matchedSub = subCats.find(
        (sc) =>
          (matCatCode && (sc.index?.toLowerCase() === matCatCode.toLowerCase() || sc.id.toLowerCase() === matCatCode.toLowerCase())) ||
          (matCatName && sc.name?.toLowerCase() === matCatName.toLowerCase())
      );
      if (matchedSub) {
        subcategoryId = matchedSub.index || matchedSub.id;
      }
    }

    const codeLower = code.toLowerCase();
    const nameLower = name.toLowerCase();
    const thumbnail = (codeLower ? thumbByCode.get(codeLower) : "") || (nameLower ? thumbByName.get(nameLower) : "") || "";

    return {
      id: code || m.id || `md-model-${index}`,
      code: code,
      name: name || code || "ไม่ระบุชื่อรุ่น",
      categoryId: categoryId,
      subcategoryId: subcategoryId,
      symptomTypeId: (m.symptomTypeCode || "").trim(),
      thumbnail: thumbnail,
      status: "active" as const,
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

  const finalModels = Array.from(uniqueMasterModels.values());

  return { categories: cats, guides: gds, subCategories: subCats, symptomTypes: symTypes, symptoms: syms, mappings, models: finalModels };
}

export async function preloadAdminData() {
  const ranges = [
    `${SHEETS.CATEGORIES}!A1:Z`,
    `${SHEETS.MASTERDATA}!A1:Z`,
    `${SHEETS.FEEDBACKS}!A1:Z`,
    `${SHEETS.SYMPTOMS}!A1:Z`,
    `${SHEETS.MODELS}!A1:Z`,
    `${SHEETS.GUIDES}!A1:Z`,
    `${SHEETS.USERS}!A1:Z`,
  ];

  await readMultipleSheets(ranges);

  const [cats, maps, mods, repStats, sessions, top, syms, gds, users] = await Promise.all([
    _getCategories(),
    _getMasterDataMappings(),
    _getModels(),
    _getRepairStats(),
    _getActiveSessions(),
    _getTopModels(),
    _getSymptoms(),
    _getGuides(),
    _getUsers(),
  ]);

  return { categories: cats, mappings: maps, models: mods, repairStats: repStats, activeSessions: sessions, topModels: top, symptoms: syms, guides: gds, users };
}
