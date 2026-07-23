import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local first, then .env
const envLocal = path.resolve(process.cwd(), '.env.local');
const envRegular = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
} else if (fs.existsSync(envRegular)) {
  dotenv.config({ path: envRegular });
} else {
  dotenv.config();
}

import { getCategories, getSymptoms, createGuide } from "../lib/sheets-db";

async function main() {
  try {
    const cats = await getCategories();
    const syms = await getSymptoms();
    
    if (cats.length === 0 || syms.length === 0) {
      console.log("No categories or symptoms found.");
      return;
    }

    const catId = cats[0].id;
    const symId = syms[0].id;
    
    console.log("Creating dummy guide for Cat:", catId, "Sym:", symId);

    const dummyGuide = {
      id: `guide-dummy-${Date.now()}`,
      categoryId: catId,
      symptomId: symId,
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
    console.log("Success! Created guide:", res.id);
  } catch(e) {
    console.error(e);
  }
}

main();
