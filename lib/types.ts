// ---------------------------------------------------------------------------
// Mazuma Repair Guide — Symptom-Driven Data Model
// Hierarchy: Category -> Symptom Groups -> Guides (Specific Cause)
//            -> Supported Models -> Step-by-Step Videos
// ---------------------------------------------------------------------------

export const WATERMARK_OWNER = "นาย ภานุเดช ตะวงษ์"

export interface SymptomType {
  id: string
  subcategoryId?: string
  categoryId?: string // Deprecated in favor of subcategoryId
  name: string
  description?: string
}

export interface Symptom {
  id: string
  symptomTypeId: string
  title: string
  description: string
  severity: "Low" | "Medium" | "High" | "Critical"
  tags: string[]
  specificModelIds?: string[] // หากระบุ จะโชว์เฉพาะรุ่นเหล่านี้
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  status?: "active" | "inactive"
  createdAt?: string
}

export interface SubCategory {
  id: string
  categoryId: string
  index: string
  name: string
}

export interface DeviceModel {
  id: string
  categoryId: string
  subcategoryId?: string
  symptomTypeId?: string
  name: string
  code: string
  status?: "active" | "discontinued" | "draft"
  thumbnail?: string
  createdAt?: string
  updatedAt?: string
  lastSyncAt?: string
}

export interface GuideStep {
  stepNum: number
  title: string
  instruction: string
  mediaUrl?: string
  pdfUrl?: string
  warning?: string
}

export interface Guide {
  id: string
  title: string
  categoryId: string
  subcategoryId?: string
  modelIds?: string[]
  symptomTypeId?: string
  symptomId?: string 
  description?: string 
  difficulty?: "Beginner" | "Intermediate" | "Advanced"
  timeEstimated?: string
  status?: "published" | "draft" | "archived" 
  tags?: string[] 
  createdAt?: string 
  updatedAt?: string 
  toolsRequired: string[]
  partsRequired?: string[]
  steps: GuideStep[]
  mediaUrl?: string
  pdfUrl?: string
}

export interface MasterDataMapping {
  id: string
  modelCode: string
  modelName: string
  matCategoryCode: string
  matCategoryName: string
  symptomTypeCode: string
  symptomTypeName: string
  createdAt?: string
}
