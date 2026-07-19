import {
  categories as mockCategories,
  models as mockModels,
  guides as mockGuides,
  type Category,
  type DeviceModel,
  type Guide,
} from "./mock-data"
import { MOCK_USERS, type AuthUser } from "./auth"

// In-memory data store for the mock phase
let memCategories = [...mockCategories]
let memModels = [...mockModels]
let memGuides = [...mockGuides]
let memUsers = Object.values(MOCK_USERS)

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export async function getUsers(): Promise<AuthUser[]> {
  await delay(300)
  return [...memUsers]
}

export async function createUser(user: AuthUser): Promise<AuthUser> {
  await delay(300)
  if (memUsers.some((u) => u.employeeCode === user.employeeCode)) {
    throw new Error("Employee code already exists")
  }
  const newUser = { ...user, status: user.status || "active", createdAt: user.createdAt || new Date().toISOString() }
  memUsers.push(newUser as AuthUser)
  return newUser as AuthUser
}

export async function updateUser(employeeCode: string, data: Partial<AuthUser>): Promise<AuthUser> {
  await delay(300)
  const index = memUsers.findIndex((u) => u.employeeCode === employeeCode)
  if (index === -1) throw new Error("User not found")
  memUsers[index] = { ...memUsers[index], ...data }
  return memUsers[index]
}

export async function deleteUser(employeeCode: string): Promise<void> {
  await delay(300)
  memUsers = memUsers.filter((u) => u.employeeCode !== employeeCode)
}

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------
export async function getModels(): Promise<DeviceModel[]> {
  await delay(300)
  return [...memModels]
}

export async function createModel(model: DeviceModel): Promise<DeviceModel> {
  await delay(300)
  const newModel = { ...model, status: model.status || "active", createdAt: model.createdAt || new Date().toISOString() }
  memModels.push(newModel as DeviceModel)
  return newModel as DeviceModel
}

export async function updateModel(id: string, data: Partial<DeviceModel>): Promise<DeviceModel> {
  await delay(300)
  const index = memModels.findIndex((m) => m.id === id)
  if (index === -1) throw new Error("Model not found")
  memModels[index] = { ...memModels[index], ...data }
  return memModels[index]
}

export async function deleteModel(id: string): Promise<void> {
  await delay(300)
  memModels = memModels.filter((m) => m.id !== id)
}

// ---------------------------------------------------------------------------
// Guides
// ---------------------------------------------------------------------------
export async function getGuides(): Promise<Guide[]> {
  await delay(300)
  return [...memGuides]
}

export async function getGuideById(id: string): Promise<Guide | null> {
  await delay(300)
  return memGuides.find((g) => g.id === id) || null
}

export async function createGuide(guide: Guide): Promise<Guide> {
  await delay(300)
  const newGuide = { 
    ...guide, 
    status: guide.status || "published", 
    createdAt: guide.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  memGuides.push(newGuide as Guide)
  return newGuide as Guide
}

export async function updateGuide(id: string, data: Partial<Guide>): Promise<Guide> {
  await delay(300)
  const index = memGuides.findIndex((g) => g.id === id)
  if (index === -1) throw new Error("Guide not found")
  memGuides[index] = { ...memGuides[index], ...data, updatedAt: new Date().toISOString() }
  return memGuides[index]
}

export async function deleteGuide(id: string): Promise<void> {
  await delay(300)
  memGuides = memGuides.filter((g) => g.id !== id)
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  await delay(300)
  return [...memCategories]
}

export async function createCategory(category: Partial<Category>): Promise<Category> {
  await delay(300)
  const newCat: Category = {
    id: category.id || `cat-${Date.now()}`,
    name: category.name || "",
    slug: category.slug || `slug-${Date.now()}`,
    description: category.description || "",
    status: "active",
    createdAt: new Date().toISOString(),
    symptomGroups: category.symptomGroups || []
  }
  memCategories.push(newCat)
  return newCat
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  await delay(300)
  const index = memCategories.findIndex((c) => c.id === id)
  if (index === -1) throw new Error("Category not found")
  memCategories[index] = { ...memCategories[index], ...data }
  return memCategories[index]
}

export async function deleteCategory(id: string): Promise<void> {
  await delay(300)
  memCategories = memCategories.filter((c) => c.id !== id)
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

let memFeedbacks: RepairFeedback[] = [
  {
    id: "fb-1",
    guideId: "g1",
    modelId: "m1",
    userId: "tech1",
    userName: "ช่างเทคนิค ก",
    isSuccess: true,
    stepsViewed: 2,
    totalSteps: 4,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: "fb-2",
    guideId: "g1",
    modelId: "m2",
    userId: "tech2",
    userName: "ช่างเทคนิค ข",
    isSuccess: true,
    stepsViewed: 4,
    totalSteps: 4,
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  },
  {
    id: "fb-3",
    guideId: "g2",
    modelId: "m1",
    userId: "tech1",
    userName: "ช่างเทคนิค ก",
    isSuccess: false,
    stepsViewed: 5,
    totalSteps: 5,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  }
]

let memSessions: Record<string, ActiveSession> = {
  "tech1": {
    userId: "tech1",
    userName: "ช่างเทคนิค ก",
    action: "กำลังดูรุ่น Hydro Pro",
    lastActive: new Date().toISOString()
  }
}

export async function logRepairFeedback(feedback: Omit<RepairFeedback, "id" | "timestamp">) {
  await delay(200)
  memFeedbacks.push({
    ...feedback,
    id: `fb-${Date.now()}`,
    timestamp: new Date().toISOString()
  })
}

export async function getRepairStats() {
  await delay(200)
  const total = memFeedbacks.length
  const successCount = memFeedbacks.filter(f => f.isSuccess).length
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0
  
  const successFeedbacks = memFeedbacks.filter(f => f.isSuccess)
  const avgStepsSuccess = successFeedbacks.length > 0 
    ? (successFeedbacks.reduce((sum, f) => sum + f.stepsViewed, 0) / successFeedbacks.length).toFixed(1)
    : "0"

  return {
    total,
    successRate,
    avgStepsSuccess
  }
}

export async function logSessionActivity(userId: string, userName: string, action: string) {
  memSessions[userId] = {
    userId,
    userName,
    action,
    lastActive: new Date().toISOString()
  }
}

export async function getActiveSessions() {
  await delay(200)
  const fiveMinsAgo = Date.now() - 5 * 60 * 1000
  return Object.values(memSessions).filter(s => new Date(s.lastActive).getTime() > fiveMinsAgo)
}

export async function getTopModels() {
  await delay(200)
  // Dummy logic: calculate which models are most in feedback
  const modelCounts: Record<string, number> = {}
  
  // Add some dummy counts so it looks good on dashboard
  modelCounts["m1"] = 45 // Hydro Pro
  modelCounts["m2"] = 32 // Aqua Smart
  modelCounts["m3"] = 18 // Thermo Plus
  modelCounts["m5"] = 12 // INOX
  
  memFeedbacks.forEach(f => {
    if (f.modelId) {
      modelCounts[f.modelId] = (modelCounts[f.modelId] || 0) + 1
    }
  })
  
  const sorted = Object.entries(modelCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([modelId, count]) => ({ modelId, count }))
    .slice(0, 5) // Top 5
    
  return sorted
}

