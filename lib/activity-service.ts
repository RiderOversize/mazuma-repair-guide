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
    const headers = allRows && allRows.length > 0 ? allRows[0] : []
    const rows = allRows && allRows.length > 1 ? allRows.slice(1) : []
    
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
    
    // Combine with pending in-memory logs
    const existingIds = new Set(logs.map(l => l.id));
    const pendingUnique = activityLogEntries.filter(p => !existingIds.has(p.id));
    const combined = [...pendingUnique, ...logs];

    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch (error) {
    console.error("Failed to get activities:", error)
    return [...activityLogEntries];
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

const ACTIVITY_HEADERS = ["id", "action", "resource", "resourceId", "resourceName", "userCode", "userName", "timestamp", "details"];

// Global batch queue for activity logs to protect Google Sheets rate limits
const globalForLogs = globalThis as unknown as {
  activityLogQueue?: any[][];
  activityLogEntries?: ActivityLog[];
  activityFlushTimer?: NodeJS.Timeout;
};

const activityLogQueue: any[][] = globalForLogs.activityLogQueue || [];
const activityLogEntries: ActivityLog[] = globalForLogs.activityLogEntries || [];
globalForLogs.activityLogQueue = activityLogQueue;
globalForLogs.activityLogEntries = activityLogEntries;

let isFlushing = false;

export async function flushActivityLogs(): Promise<void> {
  if (isFlushing || activityLogQueue.length === 0) return;
  isFlushing = true;
  
  const batch = activityLogQueue.splice(0, activityLogQueue.length);
  activityLogEntries.splice(0, activityLogEntries.length);
  
  try {
    const { appendRows, SHEETS } = await import("./google-sheets");
    await appendRows(`${SHEETS.ACTIVITY_LOGS}!A2:Z`, batch);
  } catch (error) {
    console.error("[ActivityService] Failed to flush activity batch to Google Sheets:", error);
    // Put items back into queue if flush fails
    activityLogQueue.unshift(...batch);
  } finally {
    isFlushing = false;
  }
}

// Auto-flush every 10 seconds if there are pending logs
if (!globalForLogs.activityFlushTimer) {
  globalForLogs.activityFlushTimer = setInterval(() => {
    if (activityLogQueue.length > 0) {
      flushActivityLogs().catch(() => {});
    }
  }, 10000);
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
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    resource,
    resourceId: resourceId || "",
    resourceName: resourceName || "",
    userCode: user.employeeCode,
    userName: user.name,
    timestamp: new Date().toISOString(),
    details: details || ""
  };

  const obj = { ...newLog };
  const row = mapObjectToRow(ACTIVITY_HEADERS, obj);
  
  activityLogQueue.push(row);
  activityLogEntries.unshift(newLog);

  // If queue reaches 25 items, trigger immediate non-blocking flush
  if (activityLogQueue.length >= 25) {
    flushActivityLogs().catch(() => {});
  }
}
