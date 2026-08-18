import { 
  ShowerHead, 
  Filter, 
  Factory, 
  GlassWater, 
  Fan, 
  Wind, 
  Gauge, 
  Cpu, 
  Boxes,
  LucideIcon 
} from "lucide-react"

export interface CategoryTheme {
  icon: LucideIcon
  gradient: string
  bgHover: string
  border: string
  borderHover: string
  iconBg: string
  iconColor: string
  badgeBg: string
  badgeText: string
  accentGlow: string
  tag: string
}

export const getCategoryTheme = (slug?: string): CategoryTheme => {
  switch (slug) {
    case "F1":
      return {
        icon: ShowerHead,
        gradient: "from-amber-500/15 via-orange-500/5 to-transparent",
        bgHover: "hover:from-amber-500/25 hover:via-orange-500/10",
        border: "border-amber-500/20",
        borderHover: "hover:border-amber-500/40 hover:shadow-amber-500/10",
        iconBg: "bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/20",
        iconColor: "text-amber-600 dark:text-amber-400",
        badgeBg: "bg-amber-500/10 border-amber-500/20",
        badgeText: "text-amber-700 dark:text-amber-300",
        accentGlow: "bg-amber-500/15",
        tag: "ทำน้ำอุ่น-น้ำร้อน",
      }
    case "F2":
    case "F3":
    case "F4":
      return {
        icon: Filter,
        gradient: "from-cyan-500/15 via-blue-500/5 to-transparent",
        bgHover: "hover:from-cyan-500/25 hover:via-blue-500/10",
        border: "border-cyan-500/20",
        borderHover: "hover:border-cyan-500/40 hover:shadow-cyan-500/10",
        iconBg: "bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/20",
        iconColor: "text-cyan-600 dark:text-cyan-400",
        badgeBg: "bg-cyan-500/10 border-cyan-500/20",
        badgeText: "text-cyan-700 dark:text-cyan-300",
        accentGlow: "bg-cyan-500/15",
        tag: "เครื่องกรองน้ำ",
      }
    case "F6":
      return {
        icon: Factory,
        gradient: "from-slate-500/15 via-indigo-500/5 to-transparent",
        bgHover: "hover:from-slate-500/25 hover:via-indigo-500/10",
        border: "border-indigo-500/20",
        borderHover: "hover:border-indigo-500/40 hover:shadow-indigo-500/10",
        iconBg: "bg-gradient-to-br from-slate-500/20 to-indigo-500/10 text-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/20",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        badgeBg: "bg-indigo-500/10 border-indigo-500/20",
        badgeText: "text-indigo-700 dark:text-indigo-300",
        accentGlow: "bg-indigo-500/15",
        tag: "ระบบอุตสาหกรรม",
      }
    case "FA":
      return {
        icon: GlassWater,
        gradient: "from-sky-500/15 via-blue-500/5 to-transparent",
        bgHover: "hover:from-sky-500/25 hover:via-blue-500/10",
        border: "border-sky-500/20",
        borderHover: "hover:border-sky-500/40 hover:shadow-sky-500/10",
        iconBg: "bg-gradient-to-br from-sky-500/20 to-blue-500/10 text-sky-500 shadow-md shadow-sky-500/10 ring-1 ring-sky-500/20",
        iconColor: "text-sky-600 dark:text-sky-400",
        badgeBg: "bg-sky-500/10 border-sky-500/20",
        badgeText: "text-sky-700 dark:text-sky-300",
        accentGlow: "bg-sky-500/15",
        tag: "ตู้กดน้ำดื่ม",
      }
    case "FB":
      return {
        icon: Fan,
        gradient: "from-teal-500/15 via-emerald-500/5 to-transparent",
        bgHover: "hover:from-teal-500/25 hover:via-emerald-500/10",
        border: "border-teal-500/20",
        borderHover: "hover:border-teal-500/40 hover:shadow-teal-500/10",
        iconBg: "bg-gradient-to-br from-teal-500/20 to-emerald-500/10 text-teal-500 shadow-md shadow-teal-500/10 ring-1 ring-teal-500/20",
        iconColor: "text-teal-600 dark:text-teal-400",
        badgeBg: "bg-teal-500/10 border-teal-500/20",
        badgeText: "text-teal-700 dark:text-teal-300",
        accentGlow: "bg-teal-500/15",
        tag: "พัดลมระบายอากาศ",
      }
    case "FC":
      return {
        icon: Wind,
        gradient: "from-violet-500/15 via-purple-500/5 to-transparent",
        bgHover: "hover:from-violet-500/25 hover:via-purple-500/10",
        border: "border-violet-500/20",
        borderHover: "hover:border-violet-500/40 hover:shadow-violet-500/10",
        iconBg: "bg-gradient-to-br from-violet-500/20 to-purple-500/10 text-violet-500 shadow-md shadow-violet-500/10 ring-1 ring-violet-500/20",
        iconColor: "text-violet-600 dark:text-violet-400",
        badgeBg: "bg-violet-500/10 border-violet-500/20",
        badgeText: "text-violet-700 dark:text-violet-300",
        accentGlow: "bg-violet-500/15",
        tag: "เครื่องฟอกอากาศ",
      }
    case "FD":
      return {
        icon: Gauge,
        gradient: "from-blue-600/15 via-indigo-500/5 to-transparent",
        bgHover: "hover:from-blue-600/25 hover:via-indigo-500/10",
        border: "border-blue-500/20",
        borderHover: "hover:border-blue-500/40 hover:shadow-blue-500/10",
        iconBg: "bg-gradient-to-br from-blue-600/20 to-indigo-500/10 text-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/20",
        iconColor: "text-blue-600 dark:text-blue-400",
        badgeBg: "bg-blue-500/10 border-blue-500/20",
        badgeText: "text-blue-700 dark:text-blue-300",
        accentGlow: "bg-blue-500/15",
        tag: "ปั๊มน้ำแรงดัน",
      }
    case "FF":
      return {
        icon: Cpu,
        gradient: "from-fuchsia-500/15 via-purple-500/5 to-transparent",
        bgHover: "hover:from-fuchsia-500/25 hover:via-purple-500/10",
        border: "border-fuchsia-500/20",
        borderHover: "hover:border-fuchsia-500/40 hover:shadow-fuchsia-500/10",
        iconBg: "bg-gradient-to-br from-fuchsia-500/20 to-purple-500/10 text-fuchsia-500 shadow-md shadow-fuchsia-500/10 ring-1 ring-fuchsia-500/20",
        iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
        badgeBg: "bg-fuchsia-500/10 border-fuchsia-500/20",
        badgeText: "text-fuchsia-700 dark:text-fuchsia-300",
        accentGlow: "bg-fuchsia-500/15",
        tag: "อุปกรณ์อัจฉริยะ",
      }
    default:
      return {
        icon: Boxes,
        gradient: "from-primary/15 via-primary/5 to-transparent",
        bgHover: "hover:from-primary/25 hover:via-primary/10",
        border: "border-border/50",
        borderHover: "hover:border-primary/40 hover:shadow-primary/10",
        iconBg: "bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-md ring-1 ring-primary/20",
        iconColor: "text-primary",
        badgeBg: "bg-secondary border-border/50",
        badgeText: "text-secondary-foreground",
        accentGlow: "bg-primary/15",
        tag: "สินค้าทั่วไป",
      }
  }
}

import { type Category, type SubCategory, type DeviceModel } from "./types"

export function isModelInSubCategory(
  model: DeviceModel,
  category: Category,
  subCategory?: SubCategory | null,
  subCategoryId?: string | null
): boolean {
  // 1. Verify model belongs to the parent category
  const isCatMatch =
    model.categoryId === category.id ||
    model.categoryId === category.slug ||
    model.categoryId?.toLowerCase() === category.slug?.toLowerCase() ||
    model.categoryId?.toLowerCase() === category.id?.toLowerCase()

  if (!isCatMatch) return false

  // 2. If no subcategory specified, model matches category
  if (!subCategory && !subCategoryId) return true

  const mSub = (model.subcategoryId || "").trim().toLowerCase()
  if (!mSub) return false

  const scId = (subCategory?.id || subCategoryId || "").trim().toLowerCase()
  const scIndex = (subCategory?.index || "").trim().toLowerCase()
  const scName = (subCategory?.name || "").trim().toLowerCase()

  // Exact matching against SubCategory ID (e.g. "1", "2"), MAT Code (e.g. "f1-02-00"), or Name
  if (scId !== "" && mSub === scId) return true
  if (scIndex !== "" && mSub === scIndex) return true
  if (scName !== "" && mSub === scName) return true

  return false
}

