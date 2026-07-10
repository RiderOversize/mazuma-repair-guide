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
  /** Short English/label helper for iconography */
  slug: "water-heater" | "water-purifier" | "water-pump"
  description: string
  symptomGroups: SymptomGroup[]
}

export interface DeviceModel {
  id: string
  categoryId: string
  name: string
  code: string
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
  /** The actual root cause this guide resolves */
  specificCause: string
  supportedModels: string[] // array of DeviceModel ids
  toolsRequired: string[]
  steps: GuideStep[]
}

// ---------------------------------------------------------------------------
// Categories with predefined symptom groups (from Excel master)
// ---------------------------------------------------------------------------

export const categories: Category[] = [
  {
    id: "cat-heater",
    name: "เครื่องทำน้ำอุ่น",
    slug: "water-heater",
    description: "เครื่องทำน้ำอุ่นและน้ำร้อนไฟฟ้า",
    symptomGroups: [
      { id: "sg-h1", name: "เครื่องเปิดติด แต่น้ำไม่อุ่น" },
      { id: "sg-h2", name: "เบรกเกอร์ ELCB ตัดบ่อย" },
      { id: "sg-h3", name: "น้ำไหลเบา / น้ำไม่ไหล" },
      { id: "sg-h4", name: "มีน้ำรั่วซึมจากตัวเครื่อง" },
      { id: "sg-h5", name: "เครื่องไม่ทำงาน (ไฟไม่เข้า)" },
    ],
  },
  {
    id: "cat-purifier",
    name: "เครื่องกรองน้ำ",
    slug: "water-purifier",
    description: "เครื่องกรองน้ำดื่มระบบ RO และ UF",
    symptomGroups: [
      { id: "sg-p1", name: "น้ำไม่ไหลออกจากก๊อก" },
      { id: "sg-p2", name: "น้ำมีรสชาติ / กลิ่นผิดปกติ" },
      { id: "sg-p3", name: "ปั๊มทำงานตลอดเวลาไม่ตัด" },
      { id: "sg-p4", name: "มีน้ำรั่วบริเวณกระบอกไส้กรอง" },
    ],
  },
  {
    id: "cat-pump",
    name: "ปั๊มน้ำอัตโนมัติ",
    slug: "water-pump",
    description: "ปั๊มน้ำแรงดันอัตโนมัติภายในบ้าน",
    symptomGroups: [
      { id: "sg-pu1", name: "ปั๊มตัด-ต่อบ่อยผิดปกติ" },
      { id: "sg-pu2", name: "ปั๊มไม่ทำงาน / ไม่สตาร์ท" },
      { id: "sg-pu3", name: "ปั๊มมีเสียงดังผิดปกติ" },
    ],
  },
]

// ---------------------------------------------------------------------------
// Device Models
// ---------------------------------------------------------------------------

export const models: DeviceModel[] = [
  // Water heaters
  { id: "m-h1", categoryId: "cat-heater", name: "Mazuma รุ่น Hydro Pro", code: "MZ-HP4500" },
  { id: "m-h2", categoryId: "cat-heater", name: "Mazuma รุ่น Aqua Smart", code: "MZ-AS3600" },
  { id: "m-h3", categoryId: "cat-heater", name: "Mazuma รุ่น Thermo Plus", code: "MZ-TP5000" },
  { id: "m-h4", categoryId: "cat-heater", name: "Mazuma รุ่น Eco Warm", code: "MZ-EW3300" },
  // Water purifiers
  { id: "m-p1", categoryId: "cat-purifier", name: "Mazuma รุ่น Pure RO", code: "MZ-RO500" },
  { id: "m-p2", categoryId: "cat-purifier", name: "Mazuma รุ่น Crystal UF", code: "MZ-UF320" },
  { id: "m-p3", categoryId: "cat-purifier", name: "Mazuma รุ่น Pure Max", code: "MZ-RO800" },
  // Pumps
  { id: "m-pu1", categoryId: "cat-pump", name: "Mazuma รุ่น Power Flow", code: "MZ-PF250" },
  { id: "m-pu2", categoryId: "cat-pump", name: "Mazuma รุ่น Constant Pro", code: "MZ-CP400" },
]

// ---------------------------------------------------------------------------
// Guides — each belongs to a symptom group and resolves one specific cause
// ---------------------------------------------------------------------------

const V = "https://drive.mazuma.internal/secure-video" // mock secured video source

export const guides: Guide[] = [
  {
    id: "g-1",
    categoryId: "cat-heater",
    symptomGroupId: "sg-h1",
    specificCause: "ฮีตเตอร์ขาด (Heating Element Broken)",
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
    categoryId: "cat-heater",
    symptomGroupId: "sg-h1",
    specificCause: "เทอร์โมสตัทเสีย (Thermostat Failure)",
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
    categoryId: "cat-heater",
    symptomGroupId: "sg-h2",
    specificCause: "ความต้านทานฉนวนฮีตเตอร์ต่ำ (Low Insulation Resistance)",
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
    categoryId: "cat-heater",
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
    categoryId: "cat-purifier",
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
    categoryId: "cat-purifier",
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
    categoryId: "cat-pump",
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
