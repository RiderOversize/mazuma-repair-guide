import { AuthUser } from "./auth"

export type ActivityAction = "create" | "update" | "delete" | "login" | "logout"
export type ActivityResource = "guide" | "model" | "user" | "category" | "system"

export interface ActivityLog {
  id: string
  action: ActivityAction
  resource: ActivityResource
  resourceId?: string
  resourceName?: string
  userCode: string
  userName: string
  timestamp: string
  details?: string
}

const mockActivities: ActivityLog[] = [
  {
    id: "act-1",
    action: "login",
    resource: "system",
    userCode: "MZ-001",
    userName: "แอดมินภานุเดช",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "act-2",
    action: "update",
    resource: "guide",
    resourceId: "g-1",
    resourceName: "ฮีตเตอร์ขาด (Heating Element Broken)",
    userCode: "MZ-001",
    userName: "แอดมินภานุเดช",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: "act-3",
    action: "create",
    resource: "model",
    resourceId: "m-new",
    resourceName: "Mazuma รุ่น Smart Flow",
    userCode: "MZ-002",
    userName: "แอดมินสมหญิง",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  }
]

let memActivities = [...mockActivities]

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export async function getActivities(): Promise<ActivityLog[]> {
  await delay(200)
  return [...memActivities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export async function logActivity(
  user: AuthUser,
  action: ActivityAction,
  resource: ActivityResource,
  resourceName?: string,
  resourceId?: string,
  details?: string
): Promise<void> {
  const newLog: ActivityLog = {
    id: `act-${Date.now()}`,
    action,
    resource,
    resourceId,
    resourceName,
    userCode: user.employeeCode,
    userName: user.name,
    timestamp: new Date().toISOString(),
    details
  }
  memActivities.push(newLog)
}
