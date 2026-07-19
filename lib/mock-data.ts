// ---------------------------------------------------------------------------
// Mazuma Repair Guide — Symptom-Driven Data Model
// Hierarchy: Category -> Symptom Groups -> Guides (Specific Cause)
//            -> Supported Models -> Step-by-Step Videos
// ---------------------------------------------------------------------------

export const WATERMARK_OWNER = "นาย ภานุเดช ตะวงษ์"

export interface SymptomGroup {
  id: string
  name: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  status?: "active" | "inactive"
  createdAt?: string
  symptomGroups: SymptomGroup[]
}

export interface DeviceModel {
  id: string
  categoryId: string
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
}

export interface Guide {
  id: string
  categoryId: string
  symptomGroupId: string
  specificCause: string
  description?: string // NEW
  status?: "published" | "draft" | "archived" // NEW
  tags?: string[] // NEW
  createdAt?: string // NEW
  updatedAt?: string // NEW
  supportedModels: string[] // array of DeviceModel ids
  toolsRequired: string[]
  steps: GuideStep[]
}

// ---------------------------------------------------------------------------
// Categories with predefined symptom groups (from Excel master)
// ---------------------------------------------------------------------------

export const categories: Category[] = [
  { id: "F1", name: "เครื่องทำน้ำอุ่น-น้ำร้อน", slug: "F1", description: "เครื่องทำน้ำอุ่น-น้ำร้อน", status: "active", createdAt: new Date("2023-01-10").toISOString(), symptomGroups: [ { id: "sg-h1", name: "เครื่องเปิดติด แต่น้ำไม่อุ่น" }, { id: "sg-h2", name: "เบรกเกอร์ ELCB ตัดบ่อย" }, { id: "sg-h3", name: "น้ำไหลเบา / น้ำไม่ไหล" }, { id: "sg-h4", name: "มีน้ำรั่วซึมจากตัวเครื่อง" }, { id: "sg-h5", name: "เครื่องไม่ทำงาน (ไฟไม่เข้า)" }, { id: "sg-h6", name: "อุณหภูมิน้ำสวิง (เดี๋ยวร้อนเดี๋ยวเย็น)" } ] },
  { id: "F2", name: "เครื่องกรองสแตนเลสเล็ก", slug: "F2", description: "เครื่องกรองสแตนเลสเล็ก", symptomGroups: [] },
  { id: "F3", name: "เครื่องกรองใหญ่", slug: "F3", description: "เครื่องกรองใหญ่", symptomGroups: [] },
  { id: "F4", name: "เครื่องกรองพลาสติก", slug: "F4", description: "เครื่องกรองพลาสติก", symptomGroups: [ { id: "sg-p1", name: "น้ำไม่ไหลออกจากก๊อก" }, { id: "sg-p2", name: "น้ำมีรสชาติ / กลิ่นผิดปกติ" }, { id: "sg-p3", name: "ปั๊มทำงานตลอดเวลาไม่ตัด" }, { id: "sg-p4", name: "มีน้ำรั่วบริเวณกระบอกไส้กรอง" } ] },
  { id: "F6", name: "เครื่องกรองงานระบบอุตสาหกรรม", slug: "F6", description: "เครื่องกรองงานระบบอุตสาหกรรม", symptomGroups: [] },
  { id: "FA", name: "ตู้กดน้ำ", slug: "FA", description: "ตู้กดน้ำ", symptomGroups: [] },
  { id: "FB", name: "พัดลม", slug: "FB", description: "พัดลม", symptomGroups: [] },
  { id: "FC", name: "เครื่องฟอก", slug: "FC", description: "เครื่องฟอก", symptomGroups: [] },
  { id: "FD", name: "ปั๊มน้ำ", slug: "FD", description: "ปั๊มน้ำ", symptomGroups: [ { id: "sg-pu1", name: "ปั๊มตัด-ต่อบ่อยผิดปกติ" }, { id: "sg-pu2", name: "ปั๊มไม่ทำงาน / ไม่สตาร์ท" }, { id: "sg-pu3", name: "ปั๊มมีเสียงดังผิดปกติ" } ] },
  { id: "FE", name: "SMART ZENFLOW", slug: "FE", description: "SMART ZENFLOW", symptomGroups: [] },
  { id: "FH", name: "เครื่องผลิตน้ำแข็ง", slug: "FH", description: "เครื่องผลิตน้ำแข็ง", symptomGroups: [] },
  { id: "FJ", name: "STERILIZER", slug: "FJ", description: "STERILIZER", symptomGroups: [] },
  { id: "FK", name: "PUDU", slug: "FK", description: "PUDU", symptomGroups: [] },
]

// ---------------------------------------------------------------------------
// Device Models
// ---------------------------------------------------------------------------

export const models: DeviceModel[] = [
  // Water heaters
  { id: "m-h1", categoryId: "F1", name: "Mazuma รุ่น Hydro Pro", code: "MZ-HP4500", status: "active", thumbnail: "https://images.unsplash.com/photo-1585250005740-410a56247c4e?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-05-12").toISOString() },
  { id: "m-h2", categoryId: "F1", name: "Mazuma รุ่น Aqua Smart", code: "MZ-AS3600", status: "active", thumbnail: "https://images.unsplash.com/photo-1542013936693-884638332954?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-06-20").toISOString() },
  { id: "m-h3", categoryId: "F1", name: "Mazuma รุ่น Thermo Plus", code: "MZ-TP5000", status: "discontinued", thumbnail: "", createdAt: new Date("2022-11-05").toISOString() },
  { id: "m-h4", categoryId: "F1", name: "Mazuma รุ่น Eco Warm", code: "MZ-EW3300", status: "active", thumbnail: "", createdAt: new Date("2024-01-15").toISOString() },
  // Water purifiers
  { id: "m-p1", categoryId: "F4", name: "Mazuma รุ่น Pure RO", code: "MZ-RO500", status: "active", thumbnail: "https://images.unsplash.com/photo-1627918349272-9b2f2757270d?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-08-01").toISOString() },
  { id: "m-p2", categoryId: "F4", name: "Mazuma รุ่น Crystal UF", code: "MZ-UF320", status: "active", thumbnail: "", createdAt: new Date("2023-09-10").toISOString() },
  { id: "m-p3", categoryId: "F4", name: "Mazuma รุ่น Pure Max", code: "MZ-RO800", status: "draft", thumbnail: "", createdAt: new Date("2024-03-25").toISOString() },
  // Pumps
  { id: "m-pu1", categoryId: "FD", name: "Mazuma รุ่น Power Flow", code: "MZ-PF250", status: "active", thumbnail: "https://images.unsplash.com/photo-1584820927508-ea24dfc02b37?w=300&auto=format&fit=crop&q=60", createdAt: new Date("2023-02-14").toISOString() },
  { id: "m-pu2", categoryId: "FD", name: "Mazuma รุ่น Constant Pro", code: "MZ-CP400", status: "active", thumbnail: "", createdAt: new Date("2023-07-22").toISOString() },
  
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
    symptomGroupId: "sg-h1",
    specificCause: "ฮีตเตอร์ขาด (Heating Element Broken)",
    description: "อาการฮีตเตอร์ขาดมักเกิดจากการใช้งานที่ไม่มีน้ำไหลผ่าน หรือฮีตเตอร์เสื่อมสภาพตามอายุการใช้งาน",
    status: "published",
    tags: ["ไฟฟ้า", "ความร้อน", "ฮีตเตอร์", "เปลี่ยนอะไหล่"],
    createdAt: new Date("2023-11-20").toISOString(),
    supportedModels: ["m-h1", "m-h2", "m-h3"],
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
    symptomGroupId: "sg-h1",
    specificCause: "เทอร์โมสตัทเสีย (Thermostat Failure)",
    description: "เทอร์โมสตัททำหน้าที่ตัดไฟเมื่อความร้อนสูงเกินไป หากเสียหน้าสัมผัสอาจจะไม่ต่อวงจรทำให้น้ำไม่ร้อน",
    status: "published",
    tags: ["ไฟฟ้า", "เซ็นเซอร์", "เทอร์โมสตัท"],
    createdAt: new Date("2023-12-05").toISOString(),
    supportedModels: ["m-h1", "m-h4"],
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
    symptomGroupId: "sg-h2",
    specificCause: "ความต้านทานฉนวนฮีตเตอร์ต่ำ (Low Insulation Resistance)",
    description: "ฉนวนฮีตเตอร์เสื่อมสภาพทำให้มีไฟฟ้ารั่วไหลลงกราวด์ ระบบ ELCB จึงตัดการทำงานเพื่อความปลอดภัย",
    status: "draft",
    tags: ["ELCB", "ไฟตก", "อันตราย", "ไฟรั่ว"],
    createdAt: new Date("2024-02-15").toISOString(),
    supportedModels: ["m-h1", "m-h2", "m-h3", "m-h4"],
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
    symptomGroupId: "sg-h3",
    specificCause: "ตะแกรงกรองน้ำขาเข้าอุดตัน (Clogged Inlet Filter)",
    supportedModels: ["m-h2", "m-h3", "m-h4"],
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
    symptomGroupId: "sg-p1",
    specificCause: "ไส้กรอง Sediment อุดตัน (Clogged Sediment Filter)",
    supportedModels: ["m-p1", "m-p2", "m-p3"],
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
    symptomGroupId: "sg-p3",
    specificCause: "สวิตช์แรงดันสูงเสีย (High Pressure Switch Failure)",
    supportedModels: ["m-p1", "m-p3"],
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
    symptomGroupId: "sg-pu1",
    specificCause: "ถังแรงดัน (Pressure Tank) ลมหมด",
    supportedModels: ["m-pu1", "m-pu2"],
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

export function getModelNames(ids: string[]) {
  return ids.map((id) => getModel(id)?.name ?? id)
}

export function getSymptomGroup(category: Category | undefined, symptomGroupId: string) {
  return category?.symptomGroups.find((s) => s.id === symptomGroupId)
}

export function getGuidesByCategory(categoryId: string) {
  return guides.filter((g) => g.categoryId === categoryId)
}

export function getGuidesBySymptomGroup(symptomGroupId: string) {
  return guides.filter((g) => g.symptomGroupId === symptomGroupId)
}

export function searchModels(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return models.filter(
    (m) => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q),
  )
}

export function getGuidesForModel(modelId: string) {
  return guides.filter((g) => g.supportedModels.includes(modelId))
}
