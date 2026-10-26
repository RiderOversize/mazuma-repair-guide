import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfScript = path.join(__dirname, 'generate_pdf.mjs');
const docxScript = path.join(__dirname, 'build_docx.mjs');

console.log('='.repeat(70));
console.log('🚀 MAZUMA REPAIR GUIDE — ENTERPRISE DOCUMENTATION BUILDER');
console.log('='.repeat(70));

// 1. Generate PDF
console.log('\n[1/2] 📄 กำลังสร้างเอกสาร Vector PDF (Enterprise CDP Edition)...');
try {
  execFileSync(process.execPath, [pdfScript], { stdio: 'inherit', cwd: __dirname });
} catch (err) {
  console.error('⚠️ เกิดข้อผิดพลาดในการสร้าง PDF:', err.message);
}

// 2. Generate DOCX
console.log('\n[2/2] 📝 กำลังสร้างเอกสาร Word DOCX (WordprocessingML)...');
try {
  execFileSync(process.execPath, [docxScript], { stdio: 'inherit', cwd: __dirname });
} catch (err) {
  console.error('⚠️ เกิดข้อผิดพลาดในการสร้าง DOCX:', err.message);
}

console.log('\n' + '='.repeat(70));
console.log('🎉 สร้างเอกสารครบถ้วนเรียบร้อยแล้ว!');
console.log(`  • PDF  : ${path.join(__dirname, 'MAZUMA_REPAIR_GUIDE_MANUAL.pdf')}`);
console.log(`  • DOCX : ${path.join(__dirname, 'MAZUMA_REPAIR_GUIDE_MANUAL.docx')}`);
console.log(`  • HTML : ${path.join(__dirname, 'MAZUMA_REPAIR_GUIDE_MANUAL.html')}`);
console.log(`  • ภาพ  : ${path.join(__dirname, 'images')}`);
console.log('='.repeat(70));
