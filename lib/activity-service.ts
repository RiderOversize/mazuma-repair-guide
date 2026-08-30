"use server"

import { AuthUser } from "./auth"
import { readSheet, appendRow, SHEETS, mapRowToObject, mapObjectToRow } from "./google-sheets"

export type ActivityAction = "create" | "update" | "delete" | "login" | "logout" | "view" | "alert"
export type ActivityResource = "guide" | "model" | "user" | "category" | "subcategory" | "system" | "symptom_type" | "symptom" | "masterdata_mapping" | "unmapped_category_alert"

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

export interface UnmappedCategoryAlert {
  categoryCode: string
  name: string
  count: number
  sampleCodes: string[]
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

export async function getLastSyncTime(): Promise<string | null> {
  try {
    const activities = await getActivities()
    const syncActivity = activities.find(a => a.userName === 'SFTP Auto Sync')
    return syncActivity ? syncActivity.timestamp : null
  } catch (error) {
    return null
  }
}

export async function getUnmappedCategoryAlerts(): Promise<UnmappedCategoryAlert[]> {
  try {
    const activities = await getActivities()
    const latestAlert = activities.find(a => a.resource === 'unmapped_category_alert')
    if (!latestAlert || !latestAlert.details) return []
    
    let rawList: UnmappedCategoryAlert[] = []
    try {
      rawList = JSON.parse(latestAlert.details)
    } catch {
      return []
    }
    
    if (!Array.isArray(rawList) || rawList.length === 0) return []

    // Filter out categories that have already been created in ProductCategory
    const subCatRows = await readSheet(`${SHEETS.SUBCATEGORIES}!A1:Z`)
    if (subCatRows.length > 1) {
      const headers = subCatRows[0] || []
      const existingCodes = new Set<string>()
      const existingNames = new Set<string>()
      
      subCatRows.slice(1).forEach(r => {
        const obj = mapRowToObject(headers, r)
        const matCode = (obj['MAT Category Code'] || obj.MATCategoryCode || obj.index || '').trim().toLowerCase()
        const name = (obj.Description || obj.name || '').trim().toLowerCase()
        if (matCode) existingCodes.add(matCode)
        if (name) existingNames.add(name)
      })

      return rawList.filter(item => {
        const c = (item.categoryCode || '').trim()
        const cLower = c.toLowerCase()
        const n = (item.name || '').trim()
        const nLower = n.toLowerCase()

        // Only include categories containing "เครื่อง" or "ตู้"
        const isTargetCategory = c.includes('เครื่อง') || c.includes('ตู้')
        if (!isTargetCategory) return false

        const isMapped = 
          (cLower && existingCodes.has(cLower)) || 
          (cLower && existingNames.has(cLower)) || 
          (nLower && existingNames.has(nLower)) ||
          (nLower && existingCodes.has(nLower))
        return !isMapped
      })
    }

    return rawList.filter(item => {
      const c = (item.categoryCode || '').trim()
      return c.includes('เครื่อง') || c.includes('ตู้')
    })
  } catch (error) {
    console.error("Failed to get unmapped category alerts:", error)
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
    const headers = ["id", "action", "resource", "resourceId", "resourceName", "userCode", "userName", "timestamp", "details"];
    
    const obj = {
      ...newLog,
      resourceId: newLog.resourceId || "",
      resourceName: newLog.resourceName || "",
      details: newLog.details || "",
    };
    
    const row = mapObjectToRow(headers, obj);
    await appendRow(SHEETS.ACTIVITY_LOGS, row);
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
