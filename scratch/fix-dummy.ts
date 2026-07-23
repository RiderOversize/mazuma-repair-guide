import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const envLocal = path.resolve(process.cwd(), '.env.local');
const envRegular = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envLocal)) { dotenv.config({ path: envLocal }); }
else { dotenv.config(); }

import { createGuide, deleteGuide, getGuides } from '../lib/sheets-db';

async function fixHeadersAndRecreate() {
  const allGuides = await getGuides();
  const dummyGuides = allGuides.filter(g => g.id.startsWith("guide-dummy"));
  for (const dg of dummyGuides) {
    console.log(`Deleting old dummy guide ${dg.id}...`);
    try {
      await deleteGuide(dg.id);
    } catch (e) {
      console.log("Could not delete", dg.id, e);
    }
  }

  // Create new dummy guide
  console.log("Creating new dummy guide...");
  const dummyGuide = {
    id: `guide-dummy-${Date.now()}`,
    categoryId: "F1",
    symptomId: "EL1R-01",
    specificCause: "สาเหตุจำลอง: ขดลวดทำความร้อนขาด",
    description: "นี่คือข้อมูลจำลองเพื่อใช้ทดสอบการแสดงผล",
    status: "published" as const,
    tags: ["ทดสอบ", "จำลอง"],
    toolsRequired: ["ไขควง", "มัลติมิเตอร์"],
    steps: [
      {
        stepNum: 1,
        instruction: "ขั้นตอนที่ 1: ถอดปลั๊กไฟออกเพื่อความปลอดภัย",
        videoUrl: "",
        pdfUrl: ""
      },
      {
        stepNum: 2,
        instruction: "ขั้นตอนที่ 2: ใช้ไขควงขันน็อตฝาหลังเครื่อง",
        videoUrl: "",
        pdfUrl: ""
      },
      {
        stepNum: 3,
        instruction: "ขั้นตอนที่ 3: ตรวจสอบขดลวดความร้อนด้วยมัลติมิเตอร์",
        videoUrl: "",
        pdfUrl: ""
      }
    ]
  };

  const res = await createGuide(dummyGuide as any);
  console.log("Success! Created guide:", res.id, "Category:", res.categoryId, "Symptom:", res.symptomId);
}

fixHeadersAndRecreate().catch(console.error);
