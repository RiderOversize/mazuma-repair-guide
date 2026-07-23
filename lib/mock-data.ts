// ---------------------------------------------------------------------------
// Mazuma Repair Guide — Symptom-Driven Data Model
// Hierarchy: Category -> Symptom Groups -> Guides (Specific Cause)
//            -> Supported Models -> Step-by-Step Videos
// ---------------------------------------------------------------------------

export const WATERMARK_OWNER = "นาย ภานุเดช ตะวงษ์"

export interface SymptomType {
  id: string
  name: string
}

export interface Symptom {
  id: string
  symptomTypeId: string
  description: string
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
  subcategoryId?: string // NEW
  symptomTypeId?: string // NEW
  name: string
  code: string
  status?: "active" | "discontinued" | "draft"
  thumbnail?: string
  createdAt?: string
}

export interface GuideStep {
  stepNum: number
  instruction: string
  videoUrl: string
  pdfUrl?: string
}

export interface Guide {
  id: string
  categoryId: string
  symptomId: string // Changed from symptomGroupId
  specificCause: string
  description?: string 
  status?: "published" | "draft" | "archived" 
  tags?: string[] 
  createdAt?: string 
  updatedAt?: string 
  toolsRequired: string[]
  steps: GuideStep[]
}

// ---------------------------------------------------------------------------
// Categories with predefined symptom groups (from Excel master)
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
// SubCategories (from Table 5)
// ---------------------------------------------------------------------------

export interface SubCategory {
  id: string
  categoryId: string
  name: string
}

export const subCategories: SubCategory[] = [
  { id: "F1-01-00", categoryId: "F1", name: "เครื่องทำน้ำอุ่น" },
  { id: "F1-02-00", categoryId: "F1", name: "เครื่องทำน้ำร้อน" },
  { id: "F1-03-00", categoryId: "F1", name: "หม้อต้มขนาด 15-100 ลิตร" },
  { id: "F1-03-01", categoryId: "F1", name: "หม้อต้มขนาด 101-200 ลิตร" },
  { id: "F1-03-02", categoryId: "F1", name: "หม้อต้มขนาด 201-300 ลิตร" },
  { id: "F1-03-03", categoryId: "F1", name: "หม้อต้มขนาด 301-500 ลิตร" },
  { id: "F1-03-04", categoryId: "F1", name: "หม้อต้มขนาด 501 ลิตรขึ้นไป" },
  { id: "F1-04-00", categoryId: "F1", name: "เครื่องทำน้ำร้อน LPG" },
  { id: "F2-01-00", categoryId: "F2", name: "เครื่องกรองสแตนเลสเล็ก 2 ท่อ" },
  { id: "F2-02-00", categoryId: "F2", name: "เครื่องกรองสแตนเลสเล็ก 3 ท่อ" },
  { id: "F2-02-01", categoryId: "F2", name: "เครื่องกรองสแตนเลสเล็ก 3 ท่อ (CJ ไม่มีไฟฟ้า)" },
  { id: "F2-03-00", categoryId: "F2", name: "เครื่องกรองสแตนเลสเล็ก UV" },
  { id: "F3-01-00", categoryId: "F3", name: "เครื่องกรองใหญ่ 19" },
  { id: "F3-01-01", categoryId: "F3", name: "เครื่องกรองใหญ่ 19 (มีไฟฟ้า)" },
  { id: "F3-01-02", categoryId: "F3", name: "เครื่องกรองใหญ่ 27" },
  { id: "F3-01-03", categoryId: "F3", name: "เครื่องกรองใหญ่ 27 (มีไฟฟ้า)" },
  { id: "F3-01-04", categoryId: "F3", name: "เครื่องกรองใหญ่ 38" },
  { id: "F3-01-05", categoryId: "F3", name: "เครื่องกรองใหญ่ 38 (มีไฟฟ้า)" },
  { id: "F3-01-06", categoryId: "F3", name: "เครื่องกรองใหญ่ 49" },
  { id: "F3-01-08", categoryId: "F3", name: "เครื่องกรองใหญ่ 72" },
  { id: "F3-02-00", categoryId: "F3", name: "เครื่องกรองใหญ่ 19" },
  { id: "F3-02-01", categoryId: "F3", name: "เครื่องกรองใหญ่ 19 (มีไฟฟ้า)" },
  { id: "F3-02-02", categoryId: "F3", name: "เครื่องกรองใหญ่ 27" },
  { id: "F3-02-03", categoryId: "F3", name: "เครื่องกรองใหญ่ 27 (มีไฟฟ้า)" },
  { id: "F3-02-04", categoryId: "F3", name: "เครื่องกรองใหญ่ 38" },
  { id: "F3-02-05", categoryId: "F3", name: "เครื่องกรองใหญ่ 38 (มีไฟฟ้า)" },
  { id: "F3-02-06", categoryId: "F3", name: "เครื่องกรองใหญ่ 49" },
  { id: "F3-02-07", categoryId: "F3", name: "เครื่องกรองใหญ่ 49 (มีไฟฟ้า)" },
  { id: "F3-02-08", categoryId: "F3", name: "เครื่องกรองใหญ่ 72" },
  { id: "F3-02-09", categoryId: "F3", name: "เครื่องกรองใหญ่ 72 (มีไฟฟ้า)" },
  { id: "F3-02-10", categoryId: "F3", name: "เครื่องกรองใหญ่ 19 (CP ALL)" },
  { id: "F3-02-11", categoryId: "F3", name: "เครื่องกรองใหญ่ 27 (CP ALL)" },
  { id: "F3-02-12", categoryId: "F3", name: "เครื่องกรองใหญ่ 38 (CP ALL)" },
  { id: "F3-05-00", categoryId: "F3", name: "เครื่องกรองใหญ่ BWT" },
  { id: "F4-01-00", categoryId: "F4", name: "เครื่องกรองพลาสติกธรรมดา" },
  { id: "F4-01-01", categoryId: "F4", name: "เครื่องกรองพลาสติก UV" },
  { id: "F4-01-02", categoryId: "F4", name: "เครื่องกรองพลาสติก RO" },
  { id: "F4-01-03", categoryId: "F4", name: "เครื่องกรองพลาสติก UF" },
  { id: "F4-01-04", categoryId: "F4", name: "เครื่องกรองพลาสติก ALKALINE" },
  { id: "F4-01-05", categoryId: "F4", name: "เครื่องกรองพลาสติก CR" },
  { id: "F4-02-00", categoryId: "F4", name: "เครื่องกรองพลาสติกตั้งโต๊ะ" },
  { id: "F4-03-00", categoryId: "F4", name: "เครื่องกรองน้ำใช้" },
  { id: "F4-04-00", categoryId: "F4", name: "เครื่องกรองติดปลายก๊อก" },
  { id: "F4-06-01", categoryId: "F4", name: "เครื่องกรอง BWT (มีไฟฟ้า)" },
  { id: "F4-07-00", categoryId: "F4", name: "เครื่องกรองพลาสติก RO ขนาดเล็ก" },
  { id: "F4-07-01", categoryId: "F4", name: "เครื่องกรองพลาสติก RO ขนาดกลาง" },
  { id: "F6-01-00", categoryId: "F6", name: "เครื่อง RO งานระบบอุตสาหกรรม" },
  { id: "F6-03-00", categoryId: "F6", name: "เครื่อง UF งานระบบอุตสาหกรรม" },
  { id: "F9-01-09", categoryId: "F9", name: "โมเดลหรือหุ่นจำลอง" },
  { id: "FA-01-00", categoryId: "FA", name: "เครื่องกดน้ำร้อน-น้ำเย็น มีระบบกรอง" },
  { id: "FA-01-01", categoryId: "FA", name: "เครื่องกดน้ำร้อน-น้ำเย็น ไม่มีระบบกรอง" },
  { id: "FA-03-00", categoryId: "FA", name: "เครื่องกดน้ำเย็น-น้ำปกติ-ไม่มีระบบกรอง" },
  { id: "FA-04-00", categoryId: "FA", name: "เครื่องกดน้ำดื่ม MAXCOOL" },
  { id: "FB-01-00", categoryId: "FB", name: "พัดลม" },
  { id: "FB-02-00", categoryId: "FB", name: "พัดลม HONEYWELL" },
  { id: "FB-03-00", categoryId: "FB", name: "พัดลม OEM" },
  { id: "FC-01-00", categoryId: "FC", name: "เครื่องฟอก OEM" },
  { id: "FC-02-00", categoryId: "FC", name: "เครื่องฟอก HONEYWELL" },
  { id: "FD-01-00", categoryId: "FD", name: "ปั๊มน้ำบ้าน" },
  { id: "FD-05-00", categoryId: "FD", name: "HEAT PUMP" },
  { id: "FD-06-00", categoryId: "FD", name: "RETURN PUMP" },
  { id: "FE-02-00", categoryId: "FE", name: "SMART ZENFLOW" },
  { id: "FH-01-00", categoryId: "FH", name: "เครื่องผลิตน้ำแข็ง" },
  { id: "FJ-01-00", categoryId: "FJ", name: "OZONE STERILIZER" },
  { id: "FJ-01-01", categoryId: "FJ", name: "HYDROGEN STERILIZER" },
  { id: "FJ-01-04", categoryId: "FJ", name: "HYGIENIC AIR SYSTEM" },
  { id: "FK-01-00", categoryId: "FK", name: "PUDU" },
]

// ---------------------------------------------------------------------------
// Symptom Types & Symptoms (Table 2 & 3)
// ---------------------------------------------------------------------------

export const symptomTypes: SymptomType[] = [
  { id: "WH-EL1R", name: "อาการน้ำอุ่น 1R" },
  { id: "WH-EL2R", name: "อาการน้ำอุ่น 2R" },
  { id: "WP-RO3G", name: "อาการ RO-3G" },
  { id: "WP-PUMP", name: "อาการปั๊มน้ำบ้าน" },
]

export const symptoms: Symptom[] = [
  { id: "EL1R-01", symptomTypeId: "WH-EL1R", description: "เครื่องเปิดติด แต่เครื่องไม่ทำความร้อน / น้ำไม่อุ่น" },
  { id: "EL1R-02", symptomTypeId: "WH-EL1R", description: "เครื่องไม่ทำงานเลย ไฟหน้าปัดไม่ติด หรือทำงานติดๆ ดับๆ" },
  { id: "EL1R-03", symptomTypeId: "WH-EL1R", description: "น้ำร้อนจัดควบคุมไม่ได้ หรือร้อนๆเย็นๆ" },
  { id: "EL1R-04", symptomTypeId: "WH-EL1R", description: "ไฟดูด ไฟรั่ว หรือไฟโชว์เตือนระบบสายดิน" },
  { id: "RO3G-01", symptomTypeId: "WP-RO3G", description: "เครื่องไม่ทำงาน" },
  { id: "RO3G-02", symptomTypeId: "WP-RO3G", description: "เครื่องทำงานตัดต่อบ่อย" },
  { id: "RO3G-03", symptomTypeId: "WP-RO3G", description: "เครื่องทำงานตลอดไม่ตัด" },
  { id: "PU-01", symptomTypeId: "WP-PUMP", description: "ปั๊มตัด-ต่อบ่อยผิดปกติ" },
  { id: "PU-02", symptomTypeId: "WP-PUMP", description: "ปั๊มมีเสียงดังผิดปกติ" },
]

// ---------------------------------------------------------------------------
// Device Models
// ---------------------------------------------------------------------------

export const models: DeviceModel[] = [
  // Water heaters
  { id: "m-h1", categoryId: "F1", subcategoryId: "F1-01-00", symptomTypeId: "WH-EL1R", name: "Mazuma รุ่น Hydro Pro", code: "MZ-HP4500", status: "active", thumbnail: "https://images.unsplash.com/photo-1585250005740-410a56247c4e?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-05-12").toISOString() },
  { id: "m-h2", categoryId: "F1", subcategoryId: "F1-01-00", symptomTypeId: "WH-EL1R", name: "Mazuma รุ่น Aqua Smart", code: "MZ-AS3600", status: "active", thumbnail: "https://images.unsplash.com/photo-1542013936693-884638332954?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-06-20").toISOString() },
  { id: "m-h3", categoryId: "F1", subcategoryId: "F1-02-00", symptomTypeId: "WH-EL2R", name: "Mazuma รุ่น Thermo Plus", code: "MZ-TP5000", status: "discontinued", thumbnail: "", createdAt: new Date("2022-11-05").toISOString() },
  { id: "m-h4", categoryId: "F1", subcategoryId: "F1-01-00", symptomTypeId: "WH-EL1R", name: "Mazuma รุ่น Eco Warm", code: "MZ-EW3300", status: "active", thumbnail: "", createdAt: new Date("2024-01-15").toISOString() },
  // Water purifiers
  { id: "m-p1", categoryId: "F4", subcategoryId: "F4-01-02", symptomTypeId: "WP-RO3G", name: "Mazuma รุ่น Pure RO", code: "MZ-RO500", status: "active", thumbnail: "https://images.unsplash.com/photo-1627918349272-9b2f2757270d?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-08-01").toISOString() },
  { id: "m-p2", categoryId: "F4", subcategoryId: "F4-01-03", symptomTypeId: "WP-RO3G", name: "Mazuma รุ่น Crystal UF", code: "MZ-UF320", status: "active", thumbnail: "", createdAt: new Date("2023-09-10").toISOString() },
  { id: "m-p3", categoryId: "F4", subcategoryId: "F4-01-02", symptomTypeId: "WP-RO3G", name: "Mazuma รุ่น Pure Max", code: "MZ-RO800", status: "draft", thumbnail: "", createdAt: new Date("2024-03-25").toISOString() },
  // Pumps
  { id: "m-pu1", categoryId: "FD", subcategoryId: "FD-01-00", symptomTypeId: "WP-PUMP", name: "Mazuma รุ่น Power Flow", code: "MZ-PF250", status: "active", thumbnail: "https://images.unsplash.com/photo-1584820927508-ea24dfc02b37?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-02-14").toISOString() },
  { id: "m-pu2", categoryId: "FD", subcategoryId: "FD-01-00", symptomTypeId: "WP-PUMP", name: "Mazuma รุ่น Constant Pro", code: "MZ-CP400", status: "active", thumbnail: "", createdAt: new Date("2023-07-22").toISOString() },
  
  // Dummy models to demonstrate missing guides banner
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `m-demo-${i + 1}`,
    categoryId: "F1",
    name: `Mazuma รุ่น Demo Series ${i + 1}`,
    code: `MZ-D${i + 1}00`,
    status: "draft" as const,
    thumbnail: "",
    createdAt: new Date().toISOString()
  }))
]

// ---------------------------------------------------------------------------
// Guides — each belongs to a symptom group and resolves one specific cause
// ---------------------------------------------------------------------------

const V = "https://drive.mazuma.internal/secure-video" // mock secured video source

export const guides: Guide[] = [
  {
    id: "g-1",
    categoryId: "F1",
    symptomId: "EL1R-01",
    specificCause: "ขดลวดฮีตเตอร์ (Heater) ขาดหรือเสื่อมสภาพ",
    description: "อาการฮีตเตอร์ขาดมักเกิดจากการใช้งานที่ไม่มีน้ำไหลผ่าน หรือฮีตเตอร์เสื่อมสภาพตามอายุการใช้งาน",
    status: "published",
    tags: ["ไฟฟ้า", "ความร้อน", "ฮีตเตอร์", "เปลี่ยนอะไหล่"],
    createdAt: new Date("2023-11-20").toISOString(),
    toolsRequired: ["มัลติมิเตอร์", "ไขควงแฉก", "ประแจเลื่อน", "ถุงมือกันไฟฟ้า"],
    steps: [
      {
        stepNum: 1,
        instruction: "ตัดไฟเบรกเกอร์หลักของเครื่องทำน้ำอุ่นก่อนเริ่มงานทุกครั้ง เพื่อความปลอดภัย จากนั้นถอดฝาครอบด้านหน้าออกด้วยไขควงแฉก",
        videoUrl: `${V}/g1-s1`,
      },
      {
        stepNum: 2,
        instruction: "ใช้มัลติมิเตอร์ตั้งค่าวัดความต้านทาน (โอห์ม) วัดที่ขั้วฮีตเตอร์ทั้งสองด้าน หากค่าเป็น infinity แสดงว่าฮีตเตอร์ขาด ต้องเปลี่ยนใหม่",
        videoUrl: `${V}/g1-s2`,
      },
      {
        stepNum: 3,
        instruction: "ถอดสายไฟที่ขั้วฮีตเตอร์ แล้วคลายน็อตยึดฮีตเตอร์ด้วยประแจเลื่อน ระวังน้ำที่อาจค้างอยู่ในถังทำความร้อน",
        videoUrl: `${V}/g1-s3`,
      },
      {
        stepNum: 4,
        instruction: "ติดตั้งฮีตเตอร์ตัวใหม่ ขันน็อตให้แน่นพอดี ต่อสายไฟกลับตามเดิม แล้วประกอบฝาครอบ ทดสอบการทำงานหลังเปิดไฟ",
        videoUrl: `${V}/g1-s4`,
      },
    ],
  },
  {
    id: "g-2",
    categoryId: "F1",
    symptomId: "EL1R-01",
    specificCause: "ตัวตัดสวิตซ์ความร้อน (Thermostat) เด้งทริปหรือเสีย",
    description: "เทอร์โมสตัททำหน้าที่ตัดไฟเมื่อความร้อนสูงเกินไป หากเสียหน้าสัมผัสอาจจะไม่ต่อวงจรทำให้น้ำไม่ร้อน",
    status: "published",
    tags: ["ไฟฟ้า", "เซ็นเซอร์", "เทอร์โมสตัท"],
    createdAt: new Date("2023-12-05").toISOString(),
    toolsRequired: ["มัลติมิเตอร์", "ไขควงแฉก", "ไขควงปากแบน"],
    steps: [
      {
        stepNum: 1,
        instruction: "ตัดไฟเบรกเกอร์และถอดฝาครอบหน้าเครื่อง ค้นหาตำแหน่งเทอร์โมสตัทซึ่งอยู่ติดกับชุดฮีตเตอร์",
        videoUrl: `${V}/g2-s1`,
      },
      {
        stepNum: 2,
        instruction: "วัดการนำไฟฟ้าของเทอร์โมสตัทด้วยมัลติมิเตอร์ หากไม่มีการต่อวงจรขณะอุณหภูมิปกติ แสดงว่าเทอร์โมสตัทเสีย",
        videoUrl: `${V}/g2-s2`,
      },
      {
        stepNum: 3,
        instruction: "เปลี่ยนเทอร์โมสตัทตัวใหม่ให้ตรงรุ่น ต่อสายไฟกลับ ประกอบฝาครอบ และทดสอบการตัดการทำงานที่อุณหภูมิที่กำหนด",
        videoUrl: `${V}/g2-s3`,
      },
    ],
  },
  {
    id: "g-3",
    categoryId: "F1",
    symptomId: "EL1R-04",
    specificCause: "สายไฟภายในหลวม หรือฟิวส์ขาด",
    description: "ฉนวนฮีตเตอร์เสื่อมสภาพทำให้มีไฟฟ้ารั่วไหลลงกราวด์ ระบบ ELCB จึงตัดการทำงานเพื่อความปลอดภัย",
    status: "draft",
    tags: ["ELCB", "ไฟตก", "อันตราย", "ไฟรั่ว"],
    createdAt: new Date("2024-02-15").toISOString(),
    toolsRequired: ["เมกโอห์มมิเตอร์", "ไขควงแฉก", "ถุงมือกันไฟฟ้า"],
    steps: [
      {
        stepNum: 1,
        instruction: "ตัดไฟและถอดสายไฟทั้งหมดออกจากชุดฮีตเตอร์ เพื่อเตรียมวัดค่าความต้านทานฉนวน",
        videoUrl: `${V}/g3-s1`,
      },
      {
        stepNum: 2,
        instruction: "ใช้เมกโอห์มมิเตอร์วัดระหว่างขั้วฮีตเตอร์กับตัวถัง (Ground) หากค่าต่ำกว่า 1 MΩ แสดงว่าฉนวนเสื่อม เป็นสาเหตุที่ทำให้ ELCB ตัด",
        videoUrl: `${V}/g3-s2`,
      },
      {
        stepNum: 3,
        instruction: "เปลี่ยนชุดฮีตเตอร์ใหม่ทั้งชุด ตรวจสอบซีลกันน้ำให้อยู่ในสภาพดี ประกอบกลับและทดสอบด้วยการกดปุ่ม TEST ที่ ELCB",
        videoUrl: `${V}/g3-s3`,
      },
    ],
  },
  {
    id: "g-4",
    categoryId: "F1",
    symptomId: "EL1R-03",
    specificCause: "ตัวไตรแอค (Triac) ช็อตลัดวงจร ทำให้น้ำร้อนตลอดเวลาควบคุมไม่ได้",
    toolsRequired: ["ประแจเลื่อน", "แปรงขนาดเล็ก", "ผ้าสะอาด"],
    steps: [
      {
        stepNum: 1,
        instruction: "ปิดวาล์วน้ำเข้าเครื่อง แล้วคลายข้อต่อท่อน้ำเข้าด้วยประแจเลื่อน เตรียมผ้ารองรับน้ำที่ค้างในท่อ",
        videoUrl: `${V}/g4-s1`,
      },
      {
        stepNum: 2,
        instruction: "ถอดตะแกรงกรองน้ำขาเข้าออกมา ใช้แปรงขนาดเล็กทำความสะอาดคราบตะกอนและสนิมที่อุดตัน",
        videoUrl: `${V}/g4-s2`,
      },
      {
        stepNum: 3,
        instruction: "ประกอบตะแกรงกลับ ขันข้อต่อให้แน่น เปิดวาล์วน้ำและตรวจสอบแรงดันน้ำที่ไหลออก",
        videoUrl: `${V}/g4-s3`,
      },
    ],
  },
  {
    id: "g-5",
    categoryId: "F4",
    symptomId: "RO3G-01",
    specificCause: "ไส้กรอง Sediment อุดตัน (Clogged Sediment Filter)",
    toolsRequired: ["ประแจถอดกระบอกกรอง", "ผ้าสะอาด", "ถังรองน้ำ"],
    steps: [
      {
        stepNum: 1,
        instruction: "ปิดวาล์วน้ำดิบและเปิดก๊อกน้ำดื่มเพื่อลดแรงดันในระบบ วางถังรองน้ำใต้กระบอกไส้กรอง",
        videoUrl: `${V}/g5-s1`,
      },
      {
        stepNum: 2,
        instruction: "ใช้ประแจถอดกระบอกกรองตัวแรก (Sediment) ออกมา สังเกตคราบตะกอนที่อุดตันบนผิวไส้กรอง",
        videoUrl: `${V}/g5-s2`,
      },
      {
        stepNum: 3,
        instruction: "เปลี่ยนไส้กรอง Sediment ตัวใหม่ ประกอบกระบอกกลับให้แน่น เปิดวาล์วน้ำและตรวจสอบการรั่วซึม",
        videoUrl: `${V}/g5-s3`,
      },
    ],
  },
  {
    id: "g-6",
    categoryId: "F4",
    symptomId: "RO3G-03",
    specificCause: "สวิตช์แรงดันสูงเสีย (High Pressure Switch Failure)",
    toolsRequired: ["มัลติมิเตอร์", "ไขควงแฉก"],
    steps: [
      {
        stepNum: 1,
        instruction: "ถอดปลั๊กไฟของเครื่องกรองน้ำ ค้นหาตำแหน่งสวิตช์แรงดันสูงบริเวณท่อน้ำออกจากเมมเบรน",
        videoUrl: `${V}/g6-s1`,
      },
      {
        stepNum: 2,
        instruction: "วัดการทำงานของสวิตช์ด้วยมัลติมิเตอร์ หากสวิตช์ไม่ตัดวงจรเมื่อถังเต็ม ทำให้ปั๊มทำงานตลอดเวลา",
        videoUrl: `${V}/g6-s2`,
      },
      {
        stepNum: 3,
        instruction: "เปลี่ยนสวิตช์แรงดันสูงตัวใหม่ ต่อสายไฟให้ถูกขั้ว เสียบปลั๊กและทดสอบการตัดการทำงานของปั๊ม",
        videoUrl: `${V}/g6-s3`,
      },
    ],
  },
  {
    id: "g-7",
    categoryId: "FD",
    symptomId: "PU-01",
    specificCause: "ถังแรงดัน (Pressure Tank) ลมหมด",
    toolsRequired: ["เกจวัดลม", "ที่สูบลม", "ประแจเลื่อน"],
    steps: [
      {
        stepNum: 1,
        instruction: "ปิดเบรกเกอร์ปั๊มและเปิดก๊อกน้ำเพื่อระบายแรงดันในระบบให้หมด ค้นหาจุ๊บเติมลมที่ถังแรงดัน",
        videoUrl: `${V}/g7-s1`,
      },
      {
        stepNum: 2,
        instruction: "ใช้เกจวัดลมตรวจสอบแรงดันลมในถัง ค่ามาตรฐานควรอยู่ที่ประมาณ 1.4-1.8 บาร์ หากต่ำกว่าให้เติมลมเพิ่ม",
        videoUrl: `${V}/g7-s2`,
      },
      {
        stepNum: 3,
        instruction: "เติมลมจนได้ค่าที่กำหนด ปิดจุ๊บลมให้สนิท เปิดเบรกเกอร์และสังเกตรอบการตัด-ต่อของปั๊มว่าเป็นปกติหรือไม่",
        videoUrl: `${V}/g7-s3`,
      },
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
  return guides.filter(g => symptomIds.includes(g.symptomId));
}
