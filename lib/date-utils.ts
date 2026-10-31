/**
 * Date and Timestamp utilities for Mazuma Repair Guide
 * Formats timestamps in Thailand local time (Asia/Bangkok, GMT+7)
 * using the clean, sortable, Excel & Google Sheets-friendly format: "YYYY-MM-DD HH:mm:ss"
 */

export function getThaiTimestamp(date: Date = new Date()): string {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(dtf.formatToParts(date).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

export function parseThaiDate(str?: string | null): Date {
  if (!str) return new Date();
  const trimmed = String(str).trim();
  if (trimmed.includes("T")) {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }
  // If formatted as "YYYY-MM-DD HH:mm:ss" or similar:
  const normalized = trimmed.replace(" ", "T");
  if (!normalized.includes("+") && !normalized.endsWith("Z")) {
    const d = new Date(`${normalized}+07:00`);
    if (!isNaN(d.getTime())) return d;
  }
  const fallback = new Date(trimmed);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

export function formatThaiDateTime(str?: string | null): string {
  if (!str) return "-";
  const date = parseThaiDate(str);
  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatTimeAgo(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const date = parseThaiDate(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "เมื่อสักครู่";
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
  return `${Math.floor(diff / 86400)} วันที่แล้ว`;
}
