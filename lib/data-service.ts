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
  getSymptomTypes as _getSymptomTypes,
  createSymptomType as _createSymptomType,
  updateSymptomType as _updateSymptomType,
  deleteSymptomType as _deleteSymptomType,
  getSymptoms as _getSymptoms,
  createSymptom as _createSymptom,
  updateSymptom as _updateSymptom,
  deleteSymptom as _deleteSymptom
} from "./sheets-db";

export { type ActiveSession, type RepairFeedback } from "./sheets-db";

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
  ];

  // This single batchGet call populates the cache for all ranges
  await readMultipleSheets(ranges);

  // Now these calls will all hit cache (instant)
  const [cats, gds, subCats, symTypes, syms, mappings] = await Promise.all([
    _getCategories(),
    _getGuides(),
    _getSubCategories(),
    _getSymptomTypes(),
    _getSymptoms(),
    _getMasterDataMappings(),
  ]);

  return { categories: cats, guides: gds, subCategories: subCats, symptomTypes: symTypes, symptoms: syms, mappings };
}

export async function preloadAdminData() {
  const ranges = [
    `${SHEETS.CATEGORIES}!A1:Z`,
    `${SHEETS.MASTERDATA}!A1:Z`,
    `${SHEETS.MODELS}!A1:Z`,
    `${SHEETS.FEEDBACKS}!A1:Z`,
    `${SHEETS.SYMPTOMS}!A1:Z`,
  ];

  await readMultipleSheets(ranges);

  const [cats, maps, mods, repStats, sessions, top, syms] = await Promise.all([
    _getCategories(),
    _getMasterDataMappings(),
    _getModels(),
    _getRepairStats(),
    _getActiveSessions(),
    _getTopModels(),
    _getSymptoms(),
  ]);

  return { categories: cats, mappings: maps, models: mods, repairStats: repStats, activeSessions: sessions, topModels: top, symptoms: syms };
}
