#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
================================================================================
Mazuma Repair Guide - Documentation Builder (PDF & DOCX Generator)
ผู้พัฒนา: นาย ภานุเดช ตะวงษ์
รองรับการแปลงเอกสารเป็นทั้ง PDF (Vector Publication Quality) และ DOCX (Word)
================================================================================
"""

import os
import sys
import subprocess
import shutil

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    md_file = os.path.join(script_dir, "MAZUMA_REPAIR_GUIDE_MANUAL.md")
    pdf_script = os.path.join(script_dir, "generate_pdf.mjs")
    docx_script = os.path.join(script_dir, "build_docx.mjs")

    print("=" * 65)
    print("🚀 MAZUMA REPAIR GUIDE - ALL-IN-ONE DOCUMENT BUILDER")
    print("=" * 65)

    if not os.path.exists(md_file):
        print(f"❌ ไม่พบไฟล์ Markdown ที่: {md_file}")
        sys.exit(1)

    node_exe = shutil.which("node")
    if not node_exe:
        print("❌ ไม่พบคำสั่ง node ในระบบ กรุณาติดตั้ง Node.js")
        sys.exit(1)

    # 1. Build PDF
    print("\n[1/2] 📄 กำลังสร้างเอกสาร PDF (Infographic High-Res Vector)...")
    try:
        subprocess.check_call([node_exe, pdf_script], cwd=script_dir)
    except Exception as e:
        print(f"⚠️ เกิดข้อผิดพลาดในการสร้าง PDF: {e}")

    # 2. Build DOCX
    print("\n[2/2] 📝 กำลังสร้างเอกสาร Word DOCX...")
    try:
        subprocess.check_call([node_exe, docx_script], cwd=script_dir)
    except Exception as e:
        print(f"⚠️ เกิดข้อผิดพลาดในการสร้าง DOCX: {e}")

    print("\n" + "=" * 65)
    print("🎉 สร้างเอกสารครบถ้วนเรียบร้อยแล้ว!")
    print(f"  • PDF  : {os.path.join(script_dir, 'MAZUMA_REPAIR_GUIDE_MANUAL.pdf')}")
    print(f"  • Word : {os.path.join(script_dir, 'MAZUMA_REPAIR_GUIDE_MANUAL.docx')}")
    print(f"  • MD   : {md_file}")
    print("=" * 65)

if __name__ == "__main__":
    main()
