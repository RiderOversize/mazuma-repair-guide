import { getModels, getSymptoms, createGuide } from '../lib/sheets-db';
import { Guide } from '../lib/types';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function seedGuides() {
  console.log('Fetching data to seed guides...');
  const models = await getModels();
  const symptoms = await getSymptoms();

  if (models.length === 0 || symptoms.length === 0) {
    console.error('No models or symptoms found to link to.');
    return;
  }

  const generatedGuides: Guide[] = [];

  for (let i = 1; i <= 10; i++) {
    // Pick a random model and symptom
    const model = models[Math.floor(Math.random() * models.length)];
    const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];

    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)] as any;

    const newGuide: Guide = {
      id: `guide-${Date.now()}-${i}`,
      title: `วิธีการแก้ไขปัญหา: ${symptom.title} สำหรับ ${model.name}`,
      categoryId: model.categoryId,
      subcategoryId: model.subcategoryId,
      modelIds: [model.id],
      symptomTypeId: symptom.symptomTypeId,
      symptomId: symptom.id,
      description: `คู่มือจำลองสำหรับการซ่อมบำรุงและแก้ไขปัญหา ${symptom.title} ที่เกิดกับเครื่องรุ่น ${model.code} โดยละเอียด`,
      difficulty: difficulty,
      timeEstimated: `${Math.floor(Math.random() * 30) + 15} นาที`,
      status: 'published',
      tags: ['ทดสอบระบบ', 'ซ่อมบำรุง', symptom.title.slice(0, 10)],
      toolsRequired: ['ไขควงแฉก', 'ประแจเบอร์ 10'],
      partsRequired: ['อะไหล่ชุดลูกยาง'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        {
          stepNum: 1,
          title: 'เตรียมความพร้อมก่อนเริ่มงาน',
          instruction: 'ตัดกระแสไฟฟ้าและปิดวาล์วน้ำก่อนดำเนินการ เพื่อความปลอดภัย',
          warning: 'ห้ามปฏิบัติงานขณะที่ยังมีกระแสไฟฟ้าวิ่งอยู่เด็ดขาด!'
        },
        {
          stepNum: 2,
          title: 'ถอดประกอบชิ้นส่วน',
          instruction: 'ใช้ไขควงแฉกขันน็อต 4 ตัวที่ฝาครอบออก จากนั้นค่อยๆ ดึงฝาครอบออก',
          mediaUrl: 'https://placehold.co/600x400/png?text=Step+2'
        },
        {
          stepNum: 3,
          title: 'ประกอบกลับคืนและทดสอบ',
          instruction: 'เปลี่ยนอะไหล่ที่ชำรุด จากนั้นประกอบฝาครอบกลับคืน ขันน็อตให้แน่น และเปิดระบบทดสอบการทำงาน',
        }
      ]
    };

    generatedGuides.push(newGuide);
  }

  console.log(`Generating ${generatedGuides.length} dummy guides...`);
  
  let count = 0;
  for (const guide of generatedGuides) {
    console.log(`Creating guide: ${guide.title}`);
    await createGuide(guide);
    count++;
  }

  console.log(`Successfully created ${count} guides!`);
}

seedGuides();
