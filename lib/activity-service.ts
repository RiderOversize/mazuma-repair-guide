"use server"

import { AuthUser } from "./auth"
import { readSheet, appendRow, SHEETS, mapRowToObject, mapObjectToRow } from "./google-sheets"

export type ActivityAction = "create" | "update" | "delete" | "login" | "logout" | "view"
export type ActivityResource = "guide" | "model" | "user" | "category" | "subcategory" | "system" | "symptom_type" | "symptom" | "masterdata_mapping"

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

export async function getActivities(): Promise<ActivityLog[]> {
  try {
    const allRows = await readSheet(`${SHEETS.ACTIVITY_LOGS}!A1:Z`)
    if (allRows.length <= 1) return []
    
    const headers = allRows[0] || []
    const rows = allRows.slice(1)
    
    const logs = rows.map(r => {
      const obj = mapRowToObject(headers, r)
      return {
        id: obj.id,
        action: obj.action as ActivityAction,
        resource: obj.resource as ActivityResource,
        resourceId: obj.resourceId,
        resourceName: obj.resourceName,
        userCode: obj.userCode,
        userName: obj.userName,
        timestamp: obj.timestamp,
        details: obj.details
      }
    })
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch (error) {
    console.error("Failed to get activities:", error)
    return []
  }
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
  
  try {
    let headers: string[]
    try {
      const allRows = await readSheet(`${SHEETS.ACTIVITY_LOGS}!A1:Z`)
      headers = allRows[0] || ["id", "action", "resource", "resourceId", "resourceName", "userCode", "userName", "timestamp", "details"]
    } catch {
      // If sheet doesn't exist yet, use default headers
      headers = ["id", "action", "resource", "resourceId", "resourceName", "userCode", "userName", "timestamp", "details"]
    }
    
    const obj = {
      ...newLog,
      resourceId: newLog.resourceId || "",
      resourceName: newLog.resourceName || "",
      details: newLog.details || "",
    }
    
    const row = mapObjectToRow(headers, obj)
    await appendRow(SHEETS.ACTIVITY_LOGS, row)
  } catch (error) {
    console.error("Failed to log activity:", error)
  }
}
