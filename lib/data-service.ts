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
  logRepairFeedback as _logRepairFeedback,
  getRepairStats as _getRepairStats,
  logSessionActivity as _logSessionActivity,
  getActiveSessions as _getActiveSessions,
  getTopModels as _getTopModels,
  getSubCategories as _getSubCategories,
  createSubCategory as _createSubCategory,
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

export const logRepairFeedback = _logRepairFeedback;
export const getRepairStats = _getRepairStats;
export const logSessionActivity = _logSessionActivity;
export const getActiveSessions = _getActiveSessions;
export const getTopModels = _getTopModels;
