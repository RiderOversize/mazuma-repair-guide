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
  Bot,
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

export const getCategoryTheme = (slugOrName?: string): CategoryTheme => {
  const code = (slugOrName || "").trim().toUpperCase();
  const lower = (slugOrName || "").trim().toLowerCase();
  const prefix = code.includes("-") ? code.split("-")[0].trim() : code;

  if (prefix === "F1" || lower.includes("น้ำอุ่น") || lower.includes("น้ำร้อน") || lower.includes("หม้อต้ม")) {
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
      tag: lower.includes("หม้อต้ม") ? "หม้อต้มน้ำร้อน" : "ทำน้ำอุ่น-น้ำร้อน",
    };
  }

  if (prefix === "F2" || prefix === "F3" || prefix === "F4" || lower.includes("กรองน้ำ") || lower.includes("กรอง")) {
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
    };
  }

  if (prefix === "F6" || lower.includes("อุตสาหกรรม")) {
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
    };
  }

  if (prefix === "FA" || lower.includes("ตู้กดน้ำ") || lower.includes("ตู้น้ำ")) {
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
    };
  }

  if (prefix === "FB" || lower.includes("พัดลม")) {
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
    };
  }

  if (prefix === "FC" || lower.includes("ฟอกอากาศ")) {
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
    };
  }

  if (prefix === "FD" || lower.includes("ปั๊ม")) {
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
    };
  }

  if (prefix === "FH" || lower.includes("น้ำแข็ง")) {
    return {
      icon: Boxes,
      gradient: "from-cyan-600/15 via-teal-500/5 to-transparent",
      bgHover: "hover:from-cyan-600/25 hover:via-teal-500/10",
      border: "border-cyan-500/20",
      borderHover: "hover:border-cyan-500/40 hover:shadow-cyan-500/10",
      iconBg: "bg-gradient-to-br from-cyan-600/20 to-teal-500/10 text-cyan-500 shadow-md ring-1 ring-cyan-500/20",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      badgeBg: "bg-cyan-500/10 border-cyan-500/20",
      badgeText: "text-cyan-700 dark:text-cyan-300",
      accentGlow: "bg-cyan-500/15",
      tag: "เครื่องผลิตน้ำแข็ง",
    };
  }

  if (prefix === "FJ" || lower.includes("กำจัดเชื้อ") || lower.includes("sterilizer")) {
    return {
      icon: Cpu,
      gradient: "from-rose-500/15 via-red-500/5 to-transparent",
      bgHover: "hover:from-rose-500/25 hover:via-red-500/10",
      border: "border-rose-500/20",
      borderHover: "hover:border-rose-500/40 hover:shadow-rose-500/10",
      iconBg: "bg-gradient-to-br from-rose-500/20 to-red-500/10 text-rose-500 shadow-md ring-1 ring-rose-500/20",
      iconColor: "text-rose-600 dark:text-rose-400",
      badgeBg: "bg-rose-500/10 border-rose-500/20",
      badgeText: "text-rose-700 dark:text-rose-300",
      accentGlow: "bg-rose-500/15",
      tag: "เครื่องกำจัดเชื้อ",
    };
  }

  if (lower.includes("แอร์") || lower.includes("ปรับอากาศ")) {
    return {
      icon: Wind,
      gradient: "from-sky-500/15 via-indigo-500/5 to-transparent",
      bgHover: "hover:from-sky-500/25 hover:via-indigo-500/10",
      border: "border-sky-500/20",
      borderHover: "hover:border-sky-500/40 hover:shadow-sky-500/10",
      iconBg: "bg-gradient-to-br from-sky-500/20 to-indigo-500/10 text-sky-500 shadow-md ring-1 ring-sky-500/20",
      iconColor: "text-sky-600 dark:text-sky-400",
      badgeBg: "bg-sky-500/10 border-sky-500/20",
      badgeText: "text-sky-700 dark:text-sky-300",
      accentGlow: "bg-sky-500/15",
      tag: "เครื่องปรับอากาศ",
    };
  }

  if (prefix === "FK" || lower.includes("robot") || lower.includes("หุ่นยนต์") || lower.includes("pudu")) {
    return {
      icon: Bot,
      gradient: "from-fuchsia-500/15 via-pink-500/5 to-transparent",
      bgHover: "hover:from-fuchsia-500/25 hover:via-pink-500/10",
      border: "border-fuchsia-500/20",
      borderHover: "hover:border-fuchsia-500/40 hover:shadow-fuchsia-500/10",
      iconBg: "bg-gradient-to-br from-fuchsia-500/20 to-pink-500/10 text-fuchsia-500 shadow-md ring-1 ring-fuchsia-500/20",
      iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
      badgeBg: "bg-fuchsia-500/10 border-fuchsia-500/20",
      badgeText: "text-fuchsia-700 dark:text-fuchsia-300",
      accentGlow: "bg-fuchsia-500/15",
      tag: "หุ่นยนต์บริการ",
    };
  }

  if (prefix === "FF" || prefix === "FE" || lower.includes("smart")) {
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
    };
  }

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
  };
};

import { type Category, type SubCategory, type DeviceModel } from "./types"

export function isModelInSubCategory(
  model: DeviceModel,
  category: Category,
  subCategory?: SubCategory | null,
  subCategoryId?: string | null
): boolean {
  const catName = (category.name || "").trim().toLowerCase();
  const catId = (category.id || "").trim().toLowerCase();
  const catSlug = (category.slug || "").trim().toLowerCase();

  const mCat = (model.categoryId || "").trim().toLowerCase();
  const mSub = (model.subcategoryId || "").trim().toLowerCase();

  // 1. Direct name/id match
  let isCatMatch =
    mCat === catName ||
    mCat === catId ||
    mCat === catSlug ||
    mSub === catName ||
    mSub === catId ||
    mSub === catSlug;

  // 2. Legacy code prefix match (e.g. model has F1, category is เครื่องทำน้ำอุ่น)
  if (!isCatMatch && mCat) {
    const prefix = mCat.split("-")[0].toUpperCase();
    const legacyName = (PREFIX_CATEGORY_NAMES[prefix] || "").toLowerCase();
    if (legacyName && (legacyName === catName || catName.includes(legacyName) || legacyName.includes(catName))) {
      isCatMatch = true;
    }
  }

  // 3. Fall back to model name only if category is unresolved or generic
  if (!isCatMatch && (!mCat || mCat === "สินค้าทั่วไป") && model.name) {
    const nameLower = model.name.toLowerCase();
    if (catName && (nameLower.includes(catName) || catName.includes(nameLower))) {
      isCatMatch = true;
    }
  }

  if (!isCatMatch) return false;

  // If no subcategory specified, model matches category
  if (!subCategory && !subCategoryId) return true;

  const scId = (subCategory?.id || subCategoryId || "").trim().toLowerCase();
  const scIndex = (subCategory?.index || "").trim().toLowerCase();
  const scName = (subCategory?.name || "").trim().toLowerCase();

  if (scId !== "" && mSub === scId) return true;
  if (scIndex !== "" && mSub === scIndex) return true;
  if (scName !== "" && mSub === scName) return true;

  return false;
}

export const PREFIX_CATEGORY_NAMES: Record<string, string> = {
  "F1": "เครื่องทำน้ำอุ่น-น้ำร้อน",
  "F2": "เครื่องกรองสแตนเลส",
  "F3": "เครื่องกรองใหญ่",
  "F4": "เครื่องกรองพลาสติก",
  "F6": "เครื่องกรองระบบอุตสาหกรรม",
  "FA": "ตู้กดน้ำดื่ม",
  "FB": "พัดลมระบายอากาศ",
  "FC": "เครื่องฟอกอากาศ",
  "FD": "ปั๊มน้ำแรงดัน",
  "FE": "Smart Zenflow",
  "FH": "เครื่องผลิตน้ำแข็ง",
  "FJ": "เครื่องกำจัดเชื้อ",
  "FK": "PUDU หุ่นยนต์บริการ",
};

export const ALLOWED_CATEGORY_KEYWORDS = [
  "เครื่อง",
  "ตู้",
  "ปั๊ม",
  "พัดลม",
  "หม้อต้ม",
  "แอร์",
  "robot",
  "หุ่นยนต์",
];

export const EXCLUDED_CATEGORY_KEYWORDS = [
  "อะไหล่",
  "spare",
  "part",
  "ตัวโชว์",
  "สินค้าโชว์",
  "โชว์",
  "display",
  "demo",
];

export function isAllowedCategory(nameOrSlug?: string): boolean {
  if (!nameOrSlug) return false;
  const lower = nameOrSlug.toLowerCase();
  
  // Cut / exclude any category with "อะไหล่" or spare parts
  if (EXCLUDED_CATEGORY_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))) {
    return false;
  }

  return ALLOWED_CATEGORY_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

export function isAllowedModel(model: DeviceModel): boolean {
  const name = (model.name || "").trim().toLowerCase();
  const cat = (model.categoryId || "").trim().toLowerCase();
  const sub = (model.subcategoryId || "").trim().toLowerCase();
  const code = (model.code || "").trim().toLowerCase();

  const fullText = `${name} ${cat} ${sub} ${code}`;

  // 1. Cut / exclude any model with "อะไหล่", "spare", or "part"
  if (EXCLUDED_CATEGORY_KEYWORDS.some((kw) => fullText.includes(kw.toLowerCase()))) {
    return false;
  }

  // 2. Check if category matches allowed category
  if (cat && cat !== "สินค้าทั่วไป" && isAllowedCategory(cat)) {
    return true;
  }

  // 3. Check if name, category, or subcategory contains any of the allowed appliance keywords:
  // เครื่อง, ตู้, ปั๊ม, พัดลม, หม้อต้ม, แอร์, robot, หุ่นยนต์
  return ALLOWED_CATEGORY_KEYWORDS.some((kw) => fullText.includes(kw.toLowerCase()));
}

export function deriveCategoriesFromModels(
  models: DeviceModel[],
  mappings: any[] = []
): Category[] {
  const catMap = new Map<string, Category>();
  const modelCount = new Map<string, number>();

  // 1. Map known categories directly from MasterData (filtered to target keywords)
  mappings.forEach((m) => {
    const rawName = (m.matCategoryName || "").trim();
    const rawCode = (m.matCategoryCode || "").trim().toUpperCase();
    const prefix = rawCode.split("-")[0].trim();
    const finalName = rawName || PREFIX_CATEGORY_NAMES[prefix] || rawCode;
    
    if (finalName && isAllowedCategory(finalName) && !catMap.has(finalName)) {
      catMap.set(finalName, {
        id: finalName,
        name: finalName,
        slug: finalName,
        description: finalName,
        status: "active",
      });
    }
  });

  // 2. Extract categories directly from Models (SFTP data)
  models.forEach((m) => {
    let cat = (m.categoryId || "").trim();
    const sub = (m.subcategoryId && isNaN(Number(m.subcategoryId))) ? m.subcategoryId.trim() : "";

    // Prefer Thai category name from categoryId or subcategoryId
    let finalName = "";
    if (/[ก-๙]/.test(cat)) {
      finalName = cat;
    } else if (sub && /[ก-๙]/.test(sub)) {
      finalName = sub;
    } else if (cat) {
      // Legacy code prefix fallback (e.g. F1 -> เครื่องทำน้ำอุ่น-น้ำร้อน)
      const prefix = cat.split("-")[0].toUpperCase();
      finalName = PREFIX_CATEGORY_NAMES[prefix] || cat;
    } else if (m.code) {
      const prefix = m.code.split("-")[0].toUpperCase();
      finalName = PREFIX_CATEGORY_NAMES[prefix] || "";
    }

    if (!finalName || !isAllowedCategory(finalName)) return;

    if (!catMap.has(finalName)) {
      catMap.set(finalName, {
        id: finalName,
        name: finalName,
        slug: finalName,
        description: finalName,
        status: "active",
      });
    }

    modelCount.set(finalName, (modelCount.get(finalName) || 0) + 1);
  });

  const list = Array.from(catMap.values());
  list.sort((a, b) => {
    const countA = modelCount.get(a.name) || 0;
    const countB = modelCount.get(b.name) || 0;
    if (countA > 0 && countB === 0) return -1;
    if (countB > 0 && countA === 0) return 1;
    return a.name.localeCompare(b.name, 'th');
  });

  return list;
}


