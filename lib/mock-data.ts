// ---------------------------------------------------------------------------
// Mazuma Repair Guide — Symptom-Driven Data Model
// Hierarchy: Category -> Symptom Groups -> Guides (Specific Cause)
//            -> Supported Models -> Step-by-Step Videos
// ---------------------------------------------------------------------------

export const WATERMARK_OWNER = "นาย ภานุเดช ตะวงษ์"

export interface SymptomType {
  id: string
  categoryId?: string
  name: string
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
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const categories: Category[] = [
  { id: "F1", name: "เครื่องทำน้ำอุ่น-น้ำร้อน", slug: "F1", description: "เครื่องทำน้ำอุ่น-น้ำร้อน", status: "active", createdAt: new Date("2023-01-10").toISOString() },
  { id: "F2", name: "เครื่องกรองสแตนเลสเล็ก", slug: "F2", description: "เครื่องกรองสแตนเลสเล็ก" },
  { id: "F3", name: "เครื่องกรองใหญ่", slug: "F3", description: "เครื่องกรองใหญ่" },
  { id: "F4", name: "เครื่องกรองพลาสติก", slug: "F4", description: "เครื่องกรองพลาสติก" },
  { id: "F6", name: "เครื่องกรองงานระบบอุตสาหกรรม", slug: "F6", description: "เครื่องกรองงานระบบอุตสาหกรรม" },
  { id: "FA", name: "ตู้กดน้ำ", slug: "FA", description: "ตู้กดน้ำ" },
  { id: "FB", name: "พัดลม", slug: "FB", description: "พัดลม" },
  { id: "FC", name: "เครื่องฟอก", slug: "FC", description: "เครื่องฟอก" },
  { id: "FD", name: "ปั๊มน้ำ", slug: "FD", description: "ปั๊มน้ำ" },
  { id: "FE", name: "SMART ZENFLOW", slug: "FE", description: "SMART ZENFLOW" },
  { id: "FH", name: "เครื่องผลิตน้ำแข็ง", slug: "FH", description: "เครื่องผลิตน้ำแข็ง" },
  { id: "FJ", name: "STERILIZER", slug: "FJ", description: "STERILIZER" },
  { id: "FK", name: "PUDU", slug: "FK", description: "PUDU" },
]

// ---------------------------------------------------------------------------
// SubCategories
// ---------------------------------------------------------------------------

export interface SubCategory {
  id: string
  categoryId: string
  name: string
}

export const subCategories: SubCategory[] = [
  { id: "F1-01-00", categoryId: "F1", name: "เครื่องทำน้ำอุ่น" },
  { id: "F1-02-00", categoryId: "F1", name: "เครื่องทำน้ำร้อน" },
  { id: "F4-01-02", categoryId: "F4", name: "เครื่องกรองพลาสติก RO" },
  { id: "F4-01-03", categoryId: "F4", name: "เครื่องกรองพลาสติก UF" },
  { id: "FA-01-00", categoryId: "FA", name: "เครื่องกดน้ำร้อน-น้ำเย็น มีระบบกรอง" },
  { id: "FB-01-00", categoryId: "FB", name: "พัดลม" },
  { id: "FC-01-00", categoryId: "FC", name: "เครื่องฟอก OEM" },
  { id: "FD-01-00", categoryId: "FD", name: "ปั๊มน้ำบ้าน" },
  { id: "FH-01-00", categoryId: "FH", name: "เครื่องผลิตน้ำแข็ง" },
]

// ---------------------------------------------------------------------------
// Symptom Types & Symptoms
// ---------------------------------------------------------------------------

export const symptomTypes: SymptomType[] = [
  { id: "WH-EL", categoryId: "F1", name: "ระบบทำน้ำอุ่น-น้ำร้อน" },
  { id: "WP-RO", categoryId: "F3", name: "ระบบเครื่องกรองน้ำ" },
  { id: "WD-CO", categoryId: "FA", name: "ระบบตู้กดน้ำร้อน-เย็น" },
  { id: "PU-WA", categoryId: "FD", name: "ระบบปั๊มน้ำ" },
  { id: "IM-IC", categoryId: "FH", name: "ระบบทำน้ำแข็ง" },
  { id: "FN-AF", categoryId: "FB", name: "ระบบพัดลมระบายอากาศ" },
  { id: "AP-PA", categoryId: "FC", name: "ระบบฟอกอากาศ" },
  { id: "WH-EL1R", categoryId: "F1", name: "อาการน้ำอุ่น 1R" },
  { id: "WH-EL2R", categoryId: "F1", name: "อาการน้ำอุ่น 2R" },
  { id: "WH-ELGT", categoryId: "F1", name: "อาการน้ำอุ่น GT" },
  { id: "WH-ELBK", categoryId: "F1", name: "อาการน้ำอุ่น BK" },
  { id: "WP-RO3G", categoryId: "F3", name: "อาการ RO-3G" },
  { id: "WP-ROES", categoryId: "F3", name: "อาการ RO ESSENCE" },
  { id: "WP-ROID", categoryId: "F6", name: "อาการ RO อุตสาหกรรม" },
]

export const symptoms: Symptom[] = [
  { id: "EL-01", symptomTypeId: "WH-EL", title: "ไฟเข้าแต่น้ำไม่ร้อน", description: "เปิดเครื่องทำงาน ไฟหน้าปัดติด แต่น้ำที่ออกมาไม่มีความร้อน", severity: "High", tags: ["ไฟฟ้า", "ความร้อน"] },
  { id: "EL-02", symptomTypeId: "WH-EL", title: "น้ำร้อนจัด ควบคุมไม่ได้", description: "หมุนปรับอุณหภูมิแล้วไม่มีผล น้ำร้อนจัดตลอดเวลา", severity: "Critical", tags: ["เซ็นเซอร์", "อันตราย"] },
  { id: "WP-01", symptomTypeId: "WP-RO", title: "น้ำไหลเบา หรือไม่ไหลเลย", description: "เปิดก๊อกน้ำดื่มแล้วน้ำไหลออกน้อยมาก หรือไม่ไหลเลยแม้เครื่องทำงาน", severity: "Medium", tags: ["ไส้กรอง", "อุดตัน"] },
  { id: "WD-01", symptomTypeId: "WD-CO", title: "น้ำไม่เย็น", description: "คอมเพรสเซอร์ทำงาน แต่น้ำฝั่งเย็นอุณหภูมิปกติ", severity: "Medium", tags: ["คอมเพรสเซอร์", "น้ำยาแอร์"] },
  { id: "PU-01", symptomTypeId: "PU-WA", title: "ปั๊มตัดต่อบ่อย", description: "ปั๊มน้ำมีอาการตัด-ต่อ (ทำงานแล้วหยุด) ตลอดเวลาแม้ไม่ได้ใช้น้ำ", severity: "High", tags: ["แรงดัน", "รั่วซึม"] },
  { id: "IM-01", symptomTypeId: "IM-IC", title: "ทำน้ำแข็งช้า หรือไม่เป็นก้อน", description: "รอบการทำน้ำแข็งใช้เวลานานผิดปกติ หรือได้น้ำแข็งที่ละลายเร็ว", severity: "Medium", tags: ["ความเย็น"] },
  { id: "FN-01", symptomTypeId: "FN-AF", title: "พัดลมมีเสียงดังผิดปกติ", description: "ขณะทำงานมีเสียงหอน หรือเสียงเสียดสีดังแก๊กๆ", severity: "Low", tags: ["มอเตอร์", "เสียงดัง"] },
  { id: "AP-01", symptomTypeId: "AP-PA", title: "ไฟเตือนไส้กรองติดค้าง", description: "เปลี่ยนไส้กรองแล้ว แต่ไฟแสดงสถานะให้เปลี่ยนไส้กรองยังคงสว่างสีแดง", severity: "Low", tags: ["เซ็นเซอร์", "รีเซ็ต"] },
  
  // อาการใหม่จากตาราง 3
  { id: "EL1R-01", symptomTypeId: "WH-EL1R", title: "เครื่องเปิดติด แต่เครื่องไม่ทำความร้อน / น้ำไม่อุ่น", description: "เครื่องเปิดติด แต่เครื่องไม่ทำความร้อน / น้ำไม่อุ่น", severity: "High", tags: ["ทำความร้อน"] },
  { id: "EL1R-02", symptomTypeId: "WH-EL1R", title: "เครื่องไม่ทำงานเลย ไฟหน้าปัดไม่ติด หรือทำงานติดๆ ดับๆ", description: "เครื่องไม่ทำงานเลย ไฟหน้าปัดไม่ติด หรือทำงานติดๆ ดับๆ", severity: "High", tags: ["ไฟฟ้า"] },
  { id: "EL1R-03", symptomTypeId: "WH-EL1R", title: "น้ำร้อนจัดควบคุมไม่ได้ หรือร้อนๆเย็นๆ", description: "น้ำร้อนจัดควบคุมไม่ได้ หรือร้อนๆเย็นๆ", severity: "High", tags: ["อุณหภูมิ"] },
  { id: "EL1R-04", symptomTypeId: "WH-EL1R", title: "ไฟดูด ไฟรั่ว หรือไฟโชว์เตือนระบบสายดิน", description: "ไฟดูด ไฟรั่ว หรือไฟโชว์เตือนระบบสายดิน", severity: "Critical", tags: ["ไฟรั่ว", "อันตราย"] },
  { id: "EL1R-05", symptomTypeId: "WH-EL1R", title: "น้ำรั่วซึมออกจากตัวเครื่อง", description: "น้ำรั่วซึมออกจากตัวเครื่อง", severity: "High", tags: ["น้ำรั่ว"] },
  
  { id: "RO3G-01", symptomTypeId: "WP-RO3G", title: "เครื่องไม่ทำงาน", description: "เครื่องไม่ทำงาน", severity: "High", tags: ["ไฟฟ้า"] },
  { id: "RO3G-02", symptomTypeId: "WP-RO3G", title: "เครื่องทำงานตัดต่อบ่อย", description: "เครื่องทำงานตัดต่อบ่อย", severity: "Medium", tags: ["ตัดต่อบ่อย"] },
  { id: "RO3G-03", symptomTypeId: "WP-RO3G", title: "เครื่องทำงานตลอดไม่ตัด", description: "เครื่องทำงานตลอดไม่ตัด", severity: "High", tags: ["ไม่ตัด"] },
  
  { id: "ROES-01", symptomTypeId: "WP-ROES", title: "เครื่องไม่ทำงานเลย ไฟหน้าปัดไม่ติด หรือทำงานติดๆ ดับๆ", description: "เครื่องไม่ทำงานเลย ไฟหน้าปัดไม่ติด หรือทำงานติดๆ ดับๆ", severity: "High", tags: ["ไฟฟ้า"] },
  { id: "ROES-02", symptomTypeId: "WP-ROES", title: "เครื่องทำงานตัดต่อบ่อย", description: "เครื่องทำงานตัดต่อบ่อย", severity: "Medium", tags: ["ตัดต่อบ่อย"] },
  { id: "ROES-03", symptomTypeId: "WP-ROES", title: "เครื่องทำงานตลอดไม่ตัด", description: "เครื่องทำงานตลอดไม่ตัด", severity: "High", tags: ["ไม่ตัด"] },
  
  { id: "ROID-01", symptomTypeId: "WP-ROID", title: "รอระบุอาการ 01", description: "", severity: "Medium", tags: [] },
  { id: "ROID-02", symptomTypeId: "WP-ROID", title: "รอระบุอาการ 02", description: "", severity: "Medium", tags: [] },
  { id: "ROID-03", symptomTypeId: "WP-ROID", title: "รอระบุอาการ 03", description: "", severity: "Medium", tags: [] },
]

// ---------------------------------------------------------------------------
// Device Models (10 Dummy Models)
// ---------------------------------------------------------------------------

export const models: DeviceModel[] = [
  { id: "m-h1", categoryId: "F1", subcategoryId: "F1-01-00", symptomTypeId: "WH-EL", name: "Mazuma รุ่น Hydro Pro", code: "MZ-HP4500", status: "active", thumbnail: "https://images.unsplash.com/photo-1585250005740-410a56247c4e?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-05-12").toISOString() },
  { id: "m-h2", categoryId: "F1", subcategoryId: "F1-01-00", symptomTypeId: "WH-EL", name: "Mazuma รุ่น Aqua Smart", code: "MZ-AS3600", status: "active", thumbnail: "https://images.unsplash.com/photo-1542013936693-884638332954?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-06-20").toISOString() },
  { id: "m-h3", categoryId: "F1", subcategoryId: "F1-02-00", symptomTypeId: "WH-EL", name: "Mazuma รุ่น Thermo Plus", code: "MZ-TP5000", status: "discontinued", thumbnail: "", createdAt: new Date("2022-11-05").toISOString() },
  { id: "m-p1", categoryId: "F4", subcategoryId: "F4-01-02", symptomTypeId: "WP-RO", name: "Mazuma รุ่น Pure RO", code: "MZ-RO500", status: "active", thumbnail: "https://images.unsplash.com/photo-1627918349272-9b2f2757270d?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-08-01").toISOString() },
  { id: "m-p2", categoryId: "F4", subcategoryId: "F4-01-03", symptomTypeId: "WP-RO", name: "Mazuma รุ่น Crystal UF", code: "MZ-UF320", status: "active", thumbnail: "", createdAt: new Date("2023-09-10").toISOString() },
  { id: "m-wd1", categoryId: "FA", subcategoryId: "FA-01-00", symptomTypeId: "WD-CO", name: "Mazuma รุ่น Cool Max", code: "MZ-CM200", status: "active", thumbnail: "", createdAt: new Date("2023-10-15").toISOString() },
  { id: "m-pu1", categoryId: "FD", subcategoryId: "FD-01-00", symptomTypeId: "PU-WA", name: "Mazuma รุ่น Power Flow", code: "MZ-PF250", status: "active", thumbnail: "https://images.unsplash.com/photo-1584820927508-ea24dfc02b37?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-02-14").toISOString() },
  { id: "m-im1", categoryId: "FH", subcategoryId: "FH-01-00", symptomTypeId: "IM-IC", name: "Mazuma รุ่น Ice Maker Pro", code: "MZ-IM100", status: "active", thumbnail: "", createdAt: new Date("2024-01-20").toISOString() },
  { id: "m-fn1", categoryId: "FB", subcategoryId: "FB-01-00", symptomTypeId: "FN-AF", name: "Mazuma รุ่น Air Flow", code: "MZ-AF16", status: "active", thumbnail: "", createdAt: new Date("2023-11-11").toISOString() },
  { id: "m-ap1", categoryId: "FC", subcategoryId: "FC-01-00", symptomTypeId: "AP-PA", name: "Mazuma รุ่น Pure Air", code: "MZ-PA30", status: "draft", thumbnail: "", createdAt: new Date("2024-02-28").toISOString() },
]

// ---------------------------------------------------------------------------
// Guides
// ---------------------------------------------------------------------------

const V = "https://drive.mazuma.internal/secure-video"

export const guides: Guide[] = [
  {
    id: "g-1",
    title: "การเปลี่ยนชุดฮีตเตอร์ทำความร้อน",
    categoryId: "F1",
    subcategoryId: "F1-01-00",
    modelIds: ["m-h1", "m-h2"],
    symptomTypeId: "WH-EL",
    symptomId: "EL-01",
    description: "ฮีตเตอร์ขาดมักเกิดจากการใช้งานที่ไม่มีน้ำไหลผ่าน หรือฮีตเตอร์เสื่อมสภาพตามอายุการใช้งาน",
    difficulty: "Advanced",
    timeEstimated: "45 นาที",
    status: "published",
    tags: ["ไฟฟ้า", "ความร้อน", "ฮีตเตอร์", "เปลี่ยนอะไหล่"],
    createdAt: new Date("2023-11-20").toISOString(),
    toolsRequired: ["มัลติมิเตอร์", "ไขควงแฉก", "ประแจเลื่อน", "ถุงมือกันไฟฟ้า"],
    partsRequired: ["ชุดฮีตเตอร์ 4500W (MZ-H45)"],
    steps: [
      { stepNum: 1, title: "ตัดระบบไฟ", instruction: "ตัดไฟเบรกเกอร์หลักของเครื่องทำน้ำอุ่นก่อนเริ่มงานทุกครั้ง เพื่อความปลอดภัย", mediaUrl: `${V}/g1-s1` },
      { stepNum: 2, title: "ตรวจสอบค่าความต้านทาน", instruction: "ใช้มัลติมิเตอร์ตั้งค่าวัดความต้านทาน (โอห์ม) วัดที่ขั้วฮีตเตอร์ทั้งสองด้าน หากค่าเป็น infinity แสดงว่าฮีตเตอร์ขาด", mediaUrl: `${V}/g1-s2` },
      { stepNum: 3, title: "เปลี่ยนอะไหล่", instruction: "ถอดสายไฟที่ขั้วฮีตเตอร์ คลายน็อตยึดด้วยประแจเลื่อน และใส่ฮีตเตอร์ใหม่", mediaUrl: `${V}/g1-s3` },
    ],
  },
  {
    id: "g-2",
    title: "การเปลี่ยนเทอร์โมสตัท (Thermostat)",
    categoryId: "F1",
    subcategoryId: "F1-01-00",
    modelIds: ["m-h1", "m-h2", "m-h3"],
    symptomTypeId: "WH-EL",
    symptomId: "EL-02",
    description: "เทอร์โมสตัทเสื่อมสภาพ ทำให้ไม่ตัดการทำงานเมื่อน้ำร้อนเกินไป",
    difficulty: "Intermediate",
    timeEstimated: "30 นาที",
    status: "published",
    tags: ["เซ็นเซอร์", "เทอร์โมสตัท", "ความร้อน"],
    createdAt: new Date("2023-12-05").toISOString(),
    toolsRequired: ["มัลติมิเตอร์", "ไขควงแฉก"],
    partsRequired: ["เทอร์โมสตัท 95°C"],
    steps: [
      { stepNum: 1, title: "ถอดฝาครอบหน้าเครื่อง", instruction: "ตัดไฟเบรกเกอร์และถอดฝาครอบ ค้นหาตำแหน่งเทอร์โมสตัทที่ติดกับชุดหม้อต้ม", mediaUrl: `${V}/g2-s1` },
      { stepNum: 2, title: "เปลี่ยนอุปกรณ์", instruction: "ถอดน็อตยึดเทอร์โมสตัทออก ทาซิลิโคนระบายความร้อนที่ตัวใหม่ และยึดกลับเข้าที่", mediaUrl: `${V}/g2-s2` },
    ],
  },
  {
    id: "g-3",
    title: "การเปลี่ยนไส้กรอง Sediment & Carbon",
    categoryId: "F4",
    subcategoryId: "F4-01-02",
    modelIds: ["m-p1", "m-p2"],
    symptomTypeId: "WP-RO",
    symptomId: "WP-01",
    description: "ไส้กรองอุดตันตามอายุการใช้งาน ทำให้แรงดันน้ำลดลง",
    difficulty: "Beginner",
    timeEstimated: "15 นาที",
    status: "published",
    tags: ["ไส้กรอง", "น้ำไม่ไหล"],
    createdAt: new Date("2023-12-10").toISOString(),
    toolsRequired: ["ประแจกระบอกกรอง", "ผ้าสะอาด", "ถังรองน้ำ"],
    partsRequired: ["ไส้กรอง Sediment (PP)", "ไส้กรอง Carbon Block (CTO)"],
    steps: [
      { stepNum: 1, title: "ปิดวาล์วน้ำดิบ", instruction: "ปิดวาล์วน้ำดิบเข้าเครื่อง และปล่อยน้ำในระบบออกให้หมดเพื่อลดแรงดัน", mediaUrl: `${V}/g3-s1` },
      { stepNum: 2, title: "ถอดกระบอกกรอง", instruction: "ใช้ประแจขันกระบอกกรองตัวที่ 1 (PP) และ 2 (CTO) ออก ทิ้งไส้กรองเก่าและล้างกระบอกให้สะอาด", mediaUrl: `${V}/g3-s2` },
      { stepNum: 3, title: "ใส่ไส้กรองใหม่", instruction: "ใส่ไส้กรองใหม่ลงไป ขันกระบอกให้แน่นด้วยมือ และใช้ประแจขันย้ำอีกเล็กน้อย", mediaUrl: `${V}/g3-s3` },
    ],
  },
  {
    id: "g-4",
    title: "เติมน้ำยาทำความเย็นตู้กดน้ำ",
    categoryId: "FA",
    subcategoryId: "FA-01-00",
    modelIds: ["m-wd1"],
    symptomTypeId: "WD-CO",
    symptomId: "WD-01",
    description: "ระบบน้ำยาทำความเย็นรั่วซึม ทำให้คอมเพรสเซอร์ทำงานแต่น้ำไม่เย็น",
    difficulty: "Advanced",
    timeEstimated: "60 นาที",
    status: "published",
    tags: ["คอมเพรสเซอร์", "น้ำยา R134a", "เชื่อมท่อ"],
    createdAt: new Date("2024-01-10").toISOString(),
    toolsRequired: ["เกจแมนิโฟลด์", "ปั๊มสูญญากาศ (Vacuum Pump)", "ชุดเชื่อมแก๊ส"],
    partsRequired: ["น้ำยา R134a", "ฟิลเตอร์ดรายเออร์"],
    steps: [
      { stepNum: 1, title: "หาจุดรั่วและเชื่อมปิด", instruction: "อัดแรงดันไนโตรเจนเพื่อหาจุดรั่ว เมื่อพบให้เชื่อมปิดและเปลี่ยนดรายเออร์ใหม่", mediaUrl: `${V}/g4-s1` },
      { stepNum: 2, title: "ทำสุญญากาศ (Vacuum)", instruction: "ต่อเครื่องแวคคั่มเพื่อดูดอากาศและความชื้นออกจากระบบ ใช้เวลาอย่างน้อย 30 นาที", mediaUrl: `${V}/g4-s2` },
      { stepNum: 3, title: "เติมน้ำยา", instruction: "เติมน้ำยา R134a ตามสเปกของตู้กดน้ำ สังเกตแรงดันและความเย็นที่คอยล์เย็น", mediaUrl: `${V}/g4-s3` },
    ],
  },
  {
    id: "g-5",
    title: "เติมลมถังแรงดัน (Pressure Tank)",
    categoryId: "FD",
    subcategoryId: "FD-01-00",
    modelIds: ["m-pu1"],
    symptomTypeId: "PU-WA",
    symptomId: "PU-01",
    description: "ลมในถังแรงดันพร่อง ทำให้น้ำหนุนถุงยางยืดจนเต็ม และปั๊มตัด-ต่อบ่อย",
    difficulty: "Beginner",
    timeEstimated: "20 นาที",
    status: "published",
    tags: ["แรงดัน", "ลม", "ตัดต่อบ่อย"],
    createdAt: new Date("2024-02-05").toISOString(),
    toolsRequired: ["เกจวัดลม", "ที่สูบลมจักรยาน หรือปั๊มลม"],
    steps: [
      { stepNum: 1, title: "ปิดเบรกเกอร์และระบายน้ำ", instruction: "ปิดเบรกเกอร์ปั๊มน้ำ เปิดก๊อกน้ำในบ้านให้สุดเพื่อให้น้ำไหลออกจากถังแรงดันให้หมด", mediaUrl: `${V}/g5-s1` },
      { stepNum: 2, title: "เติมลม", instruction: "นำที่สูบลมต่อเข้ากับจุ๊บลมที่ถัง เติมลมให้ได้แรงดันประมาณ 1.2 - 1.5 Bar (ตามสเปก)", mediaUrl: `${V}/g5-s2` },
      { stepNum: 3, title: "ทดสอบการทำงาน", instruction: "ปิดก๊อก เปิดเบรกเกอร์ สังเกตการทำงานของปั๊มว่ามีการตัด-ต่อปกติหรือไม่", mediaUrl: `${V}/g5-s3` },
    ],
  },
  {
    id: "g-6",
    title: "การล้างและตรวจสอบเซ็นเซอร์ทำน้ำแข็ง",
    categoryId: "FH",
    subcategoryId: "FH-01-00",
    modelIds: ["m-im1"],
    symptomTypeId: "IM-IC",
    symptomId: "IM-01",
    description: "เซ็นเซอร์ระดับน้ำหรืออุณหภูมิสกปรก ทำให้เครื่องอ่านค่าเพี้ยน",
    difficulty: "Intermediate",
    timeEstimated: "40 นาที",
    status: "draft",
    tags: ["เซ็นเซอร์", "น้ำแข็ง", "ทำความสะอาด"],
    createdAt: new Date("2024-03-10").toISOString(),
    toolsRequired: ["แปรงขนอ่อน", "น้ำยาทำความสะอาด (Food Grade)", "ไขควงแฉก"],
    steps: [
      { stepNum: 1, title: "ถอดฝาครอบชุดทำน้ำแข็ง", instruction: "ถอดปลั๊กและระบายน้ำทิ้ง ถอดน็อตยึดฝาครอบชุดถาดน้ำแข็ง", mediaUrl: `${V}/g6-s1` },
      { stepNum: 2, title: "ทำความสะอาดเซ็นเซอร์", instruction: "ใช้แปรงขนอ่อนชุบน้ำยาเช็ดทำความสะอาดตะกรันที่เกาะบริเวณเซ็นเซอร์อุณหภูมิและเซ็นเซอร์ระดับน้ำ", mediaUrl: `${V}/g6-s2` },
    ],
  },
  {
    id: "g-7",
    title: "หยอดน้ำมันหล่อลื่นและเปลี่ยนบูชมอเตอร์",
    categoryId: "FB",
    subcategoryId: "FB-01-00",
    modelIds: ["m-fn1"],
    symptomTypeId: "FN-AF",
    symptomId: "FN-01",
    description: "บูชและแกนมอเตอร์ฝืดเนื่องจากน้ำมันหล่อลื่นแห้ง",
    difficulty: "Intermediate",
    timeEstimated: "45 นาที",
    status: "published",
    tags: ["มอเตอร์", "เสียงดัง", "บูช"],
    createdAt: new Date("2024-04-12").toISOString(),
    toolsRequired: ["ไขควง", "คีมล็อค", "น้ำมันหล่อลื่นเอนกประสงค์"],
    partsRequired: ["ชุดบูชทองเหลือง 8mm"],
    steps: [
      { stepNum: 1, title: "ถอดชุดกะโหลกมอเตอร์", instruction: "ถอดตะแกรงและใบพัดออก จากนั้นไขน็อต 4 ตัวที่ยึดกะโหลกมอเตอร์หน้า-หลัง", mediaUrl: `${V}/g7-s1` },
      { stepNum: 2, title: "เปลี่ยนบูชและหยอดน้ำมัน", instruction: "ทำความสะอาดแกนมอเตอร์ เปลี่ยนบูชทองเหลืองที่ฝาครอบ และหยอดน้ำมันที่สักหลาดอุ้มน้ำมัน", mediaUrl: `${V}/g7-s2` },
    ],
  },
  {
    id: "g-8",
    title: "วิธีรีเซ็ตสถานะอายุไส้กรอง (Filter Reset)",
    categoryId: "FC",
    subcategoryId: "FC-01-00",
    modelIds: ["m-ap1"],
    symptomTypeId: "AP-PA",
    symptomId: "AP-01",
    description: "การรีเซ็ตระบบนับเวลาไส้กรองหลังจากทำการเปลี่ยนไส้กรองแผ่นใหม่",
    difficulty: "Beginner",
    timeEstimated: "5 นาที",
    status: "published",
    tags: ["รีเซ็ต", "ไส้กรอง", "ไฟเตือน"],
    createdAt: new Date("2024-05-01").toISOString(),
    toolsRequired: [],
    steps: [
      { stepNum: 1, title: "เปิดเครื่อง", instruction: "เสียบปลั๊กและเปิดเครื่องฟอกอากาศให้ทำงานตามปกติ ไฟเตือนสีแดงจะยังคงสว่างอยู่", mediaUrl: `${V}/g8-s1` },
      { stepNum: 2, title: "กดปุ่ม Reset", instruction: "กดปุ่ม Filter Reset ค้างไว้ 5 วินาที จนกว่าจะได้ยินเสียงสัญญาณ 'ปิ๊บ' และไฟสีแดงเปลี่ยนเป็นสีเขียว", mediaUrl: `${V}/g8-s2` },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getCategory(id: string) {
  return categories.find((c) => c.id === id)
}

export function getModel(id: string) {
  return models.find((m) => m.id === id)
}

export function getModelsByCategory(categoryId: string) {
  return models.filter((m) => m.categoryId === categoryId)
}

export function getSubCategoriesByCategory(categoryId: string) {
  return subCategories.filter((sc) => sc.categoryId === categoryId)
}

export function getModelNames(ids: string[]) {
  return ids.map((id) => getModel(id)?.name ?? id)
}

export function getSymptomType(id: string) {
  return symptomTypes.find((s) => s.id === id)
}

export function getSymptomsByType(typeId: string) {
  return symptoms.filter((s) => s.symptomTypeId === typeId)
}

export function getGuidesByCategory(categoryId: string) {
  return guides.filter((g) => g.categoryId === categoryId)
}

export function getGuidesBySymptom(symptomId: string) {
  return guides.filter((g) => g.symptomId === symptomId)
}

export function searchModels(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return models.filter(
    (m) => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q),
  )
}

export function getGuidesForModel(modelId: string) {
  const model = getModel(modelId);
  if (!model || !model.symptomTypeId) return [];
  const modelSymptoms = getSymptomsByType(model.symptomTypeId);
  const symptomIds = modelSymptoms.map(s => s.id);
  return guides.filter(g => g.symptomId && symptomIds.includes(g.symptomId));
}
