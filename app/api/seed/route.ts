import { NextResponse } from "next/server";
import { createSymptomType, createSymptom } from "@/lib/sheets-db";

const types = [
  { id: "WH-EL1R", categoryId: "F1", name: "อาการน้ำอุ่น 1R" },
  { id: "WH-EL2R", categoryId: "F1", name: "อาการน้ำอุ่น 2R" },
  { id: "WH-ELGT", categoryId: "F1", name: "อาการน้ำอุ่น GT" },
  { id: "WH-ELBK", categoryId: "F1", name: "อาการน้ำอุ่น BK" },
  { id: "WP-RO3G", categoryId: "F3", name: "อาการ RO-3G" },
  { id: "WP-ROES", categoryId: "F3", name: "อาการ RO ESSENCE" },
  { id: "WP-ROID", categoryId: "F6", name: "อาการ RO อุตสาหกรรม" }
];

const syms = [
  { id: "EL1R-01", symptomTypeId: "WH-EL1R", title: "เครื่องเปิดติด แต่เครื่องไม่ทำความร้อน / น้ำไม่อุ่น", description: "เครื่องเปิดติด แต่เครื่องไม่ทำความร้อน / น้ำไม่อุ่น", severity: "High" as const, tags: ["ทำความร้อน"] },
  { id: "EL1R-02", symptomTypeId: "WH-EL1R", title: "เครื่องไม่ทำงานเลย ไฟหน้าปัดไม่ติด หรือทำงานติดๆ ดับๆ", description: "เครื่องไม่ทำงานเลย ไฟหน้าปัดไม่ติด หรือทำงานติดๆ ดับๆ", severity: "High" as const, tags: ["ไฟฟ้า"] },
  { id: "EL1R-03", symptomTypeId: "WH-EL1R", title: "น้ำร้อนจัดควบคุมไม่ได้ หรือร้อนๆเย็นๆ", description: "น้ำร้อนจัดควบคุมไม่ได้ หรือร้อนๆเย็นๆ", severity: "High" as const, tags: ["อุณหภูมิ"] },
  { id: "EL1R-04", symptomTypeId: "WH-EL1R", title: "ไฟดูด ไฟรั่ว หรือไฟโชว์เตือนระบบสายดิน", description: "ไฟดูด ไฟรั่ว หรือไฟโชว์เตือนระบบสายดิน", severity: "Critical" as const, tags: ["ไฟรั่ว", "อันตราย"] },
  { id: "EL1R-05", symptomTypeId: "WH-EL1R", title: "น้ำรั่วซึมออกจากตัวเครื่อง", description: "น้ำรั่วซึมออกจากตัวเครื่อง", severity: "High" as const, tags: ["น้ำรั่ว"] },
  
  { id: "RO3G-01", symptomTypeId: "WP-RO3G", title: "เครื่องไม่ทำงาน", description: "เครื่องไม่ทำงาน", severity: "High" as const, tags: ["ไฟฟ้า"] },
  { id: "RO3G-02", symptomTypeId: "WP-RO3G", title: "เครื่องทำงานตัดต่อบ่อย", description: "เครื่องทำงานตัดต่อบ่อย", severity: "Medium" as const, tags: ["ตัดต่อบ่อย"] },
  { id: "RO3G-03", symptomTypeId: "WP-RO3G", title: "เครื่องทำงานตลอดไม่ตัด", description: "เครื่องทำงานตลอดไม่ตัด", severity: "High" as const, tags: ["ไม่ตัด"] },
  
  { id: "ROES-01", symptomTypeId: "WP-ROES", title: "เครื่องไม่ทำงานเลย ไฟหน้าปัดไม่ติด หรือทำงานติดๆ ดับๆ", description: "เครื่องไม่ทำงานเลย ไฟหน้าปัดไม่ติด หรือทำงานติดๆ ดับๆ", severity: "High" as const, tags: ["ไฟฟ้า"] },
  { id: "ROES-02", symptomTypeId: "WP-ROES", title: "เครื่องทำงานตัดต่อบ่อย", description: "เครื่องทำงานตัดต่อบ่อย", severity: "Medium" as const, tags: ["ตัดต่อบ่อย"] },
  { id: "ROES-03", symptomTypeId: "WP-ROES", title: "เครื่องทำงานตลอดไม่ตัด", description: "เครื่องทำงานตลอดไม่ตัด", severity: "High" as const, tags: ["ไม่ตัด"] },
  
  { id: "ROID-01", symptomTypeId: "WP-ROID", title: "รอระบุอาการ 01", description: "", severity: "Medium" as const, tags: [] },
  { id: "ROID-02", symptomTypeId: "WP-ROID", title: "รอระบุอาการ 02", description: "", severity: "Medium" as const, tags: [] },
  { id: "ROID-03", symptomTypeId: "WP-ROID", title: "รอระบุอาการ 03", description: "", severity: "Medium" as const, tags: [] },
];

export async function GET() {
  const results = [];
  for (const t of types) {
    try {
      await createSymptomType(t);
      results.push(`Added Type: ${t.id}`);
    } catch (e: any) {
      results.push(`Error Type ${t.id}: ${e.message}`);
    }
  }
  
  for (const s of syms) {
    try {
      await createSymptom(s);
      results.push(`Added Sym: ${s.id}`);
    } catch (e: any) {
      results.push(`Error Sym ${s.id}: ${e.message}`);
    }
  }
  
  return NextResponse.json({ success: true, results });
}
