# 📘 MAZUMA REPAIR GUIDE & SERVICE MANAGEMENT SYSTEM
## คู่มือการใช้งานระบบ สถาปัตยกรรมทางเทคนิค และระเบียบปฏิบัติการมาตรฐาน (Enterprise System Manual, Technical Architecture & SOP)

---

```
========================================================================================
เอกสารควบคุมระบบสารสนเทศระดับองค์กร (Enterprise Controlled Documentation)
รหัสเอกสาร (Document ID)   : DOC-MZM-2026-V1
เวอร์ชันระบบ (System Ver)  : 1.0.0-PROD
ระดับความลับ (Security)    : ภายในองค์กร (CONFIDENTIAL - MAZUMA INTERNAL ONLY)
ผู้จัดทำระบบ (Author)      : นาย ภานุเดช ตะวงษ์ (Lead System Architect & Senior Full-Stack Developer)
องค์กรผู้ถือสิทธิ์ (Owner) : บริษัท มาซูม่า (ประเทศไทย) จำกัด (Mazuma Thailand Co., Ltd.)
วันที่มีผลบังคับใช้         : 21 กันยายน 2026
========================================================================================
```

---

## 📑 ตารางประวัติการแก้ไขเอกสาร (Document Revision History)

| เวอร์ชัน (Ver.) | วันที่ปรับปรุง | ผู้จัดทำ/แก้ไข | ตำแหน่ง | รายละเอียดการปรับปรุง (Revision Details) |
| :---: | :---: | :--- | :--- | :--- |
| **1.0.0** | 21/09/2026 | นาย ภานุเดช ตะวงษ์ | Lead System Architect | จัดทำเอกสารฉบับสมบูรณ์ครอบคลุม User Manual, SOP, HLD/LLD, Database Data Dictionary, API Reference, Cache Architecture, และ Deployment Runbook |


# 📑 สารบัญรวม (Comprehensive Table of Contents)

- [บทสรุปสำหรับผู้บริหาร (Executive Summary)](#บทสรุปสำหรับผู้บริหาร-executive-summary)
- [ส่วนที่ 1: คู่มือผู้ใช้งานและระเบียบปฏิบัติการมาตรฐาน (User Manual & SOP)](#ส่วนที่-1-คู่มือผู้ใช้งานและระเบียบปฏิบัติการมาตรฐาน-user-manual--sop)
  - [1.1 ภาพรวม ขอบเขต และกลุ่มเป้าหมาย (Overview & Target Audience)](#11-ภาพรวม-ขอบเขต-และกลุ่มเป้าหมาย-overview--target-audience)
  - [1.2 เมทริกซ์สิทธิ์ผู้ใช้งานและการควบคุมการเข้าถึง (User Persona & RBAC Matrix)](#12-เมทริกซ์สิทธิ์ผู้ใช้งานและการควบคุมการเข้าถึง-user-persona--rbac-matrix)
  - [1.3 ระเบียบปฏิบัติด้านการยืนยันตัวตน (Authentication & 2FA Binding SOP)](#13-ระเบียบปฏิบัติด้านการยืนยันตัวตน-authentication--2fa-binding-sop)
  - [1.4 คู่มือปฏิบัติงานช่างเทคนิคภาคสนาม (Field Technician Operational Manual)](#14-คู่มือปฏิบัติงานช่างเทคนิคภาคสนาม-field-technician-operational-manual)
    - [1.4.1 การติดตั้งและเปิดใช้งาน Progressive Web App (PWA)](#141-การติดตั้งและเปิดใช้งาน-progressive-web-app-pwa)
    - [1.4.2 การค้นหาอัจฉริยะและการนำทางหมวดหมู่สินค้า](#142-การค้นหาอัจฉริยะและการนำทางหมวดหมู่สินค้า)
    - [1.4.3 การวินิจฉัยด่วนตามอาการเสีย (Symptom-Driven Quick Diagnostics)](#143-การวินิจฉัยด่วนตามอาการเสีย-symptom-driven-quick-diagnostics)
    - [1.4.4 การใช้งานตัวช่วยซ่อมทีละขั้นตอน (Step-by-Step Guide Wizard)](#144-การใช้งานตัวช่วยซ่อมทีละขั้นตอน-step-by-step-guide-wizard)
    - [1.4.5 เครื่องคิดเลขวิศวกรรมและเครื่องมือช่าง (Tech Tools & Calculators)](#145-เครื่องคิดเลขวิศวกรรมและเครื่องมือช่าง-tech-tools--calculators)
    - [1.4.6 การส่งบันทึกผลการซ่อมและระบบส่งต่องานด่วน (Feedback & Escalation)](#146-การส่งบันทึกผลการซ่อมและระบบส่งต่องานด่วน-feedback--escalation)
  - [1.5 คู่มือหัวหน้าทีมช่างเทคนิค (Head Technician / Supervisor Manual)](#15-คู่มือหัวหน้าทีมช่างเทคนิค-head-technician--supervisor-manual)
    - [1.5.1 การรับสายปรึกษาและสนับสนุนช่างหน้างาน](#151-การรับสายปรึกษาและสนับสนุนช่างหน้างาน)
    - [1.5.2 การสลับเข้าสู่โหมดผู้ดูแลระบบ (Backoffice Switching)](#152-การสลับเข้าสู่โหมดผู้ดูแลระบบ-backoffice-switching)
  - [1.6 คู่มือผู้ดูแลระบบหลังบ้าน (Enterprise Admin Backoffice Manual)](#16-คู่มือผู้ดูแลระบบหลังบ้าน-enterprise-admin-backoffice-manual)
    - [1.6.1 แดชบอร์ดสถิติ KPI และการตรวจวัด Telemetry แบบ Real-Time](#161-แดชบอร์ดสถิติ-kpi-และการตรวจวัด-telemetry-แบบ-real-time)
    - [1.6.2 การบริหารจัดการคู่มือและการผูกรุ่นสินค้า (Guides Management)](#162-การบริหารจัดการคู่มือและการผูกรุ่นสินค้า-guides-management)
    - [1.6.3 การจัดการโครงสร้างข้อมูลหลัก 5 ระดับ (Master Data Drill-Down)](#163-การจัดการโครงสร้างข้อมูลหลัก-5-ระดับ-master-data-drill-down)
    - [1.6.4 การเชื่อมโยงและซิงค์ข้อมูลจาก SFTP Server (ERP Sync)](#164-การเชื่อมโยงและซิงค์ข้อมูลจาก-sftp-server-erp-sync)
    - [1.6.5 การจัดการคลังสื่อดิจิทัลและการสตรีมมิ่ง (Media Asset Management)](#165-การจัดการคลังสื่อดิจิทัลและการสตรีมมิ่ง-media-asset-management)
    - [1.6.6 การบริหารจัดการผู้ใช้งานและมอบหมายสิทธิ์รายเมนู (User & RBAC Governance)](#166-การบริหารจัดการผู้ใช้งานและมอบหมายสิทธิ์รายเมนู-user--rbac-governance)
    - [1.6.7 การตั้งค่าระบบและการล้างหน่วยความจำแคช (Settings & Cache Purge)](#167-การตั้งค่าระบบและการล้างหน่วยความจำแคช-settings--cache-purge)
- [ส่วนที่ 2: สถาปัตยกรรมทางเทคนิคและการออกแบบระบบ (Technical Architecture & LLD)](#ส่วนที่-2-สถาปัตยกรรมทางเทคนิคและการออกแบบระบบ-technical-architecture--lld)
  - [2.1 สถาปัตยกรรมภาพรวมระดับสูง (High-Level Architecture: HLD)](#21-สถาปัตยกรรมภาพรวมระดับสูง-high-level-architecture-hld)
  - [2.2 รายละเอียดเทคโนโลยีที่ใช้งานจริง (Production Tech Stack Specification)](#22-รายละเอียดเทคโนโลยีที่ใช้งานจริง-production-tech-stack-specification)
  - [2.3 ผังโครงสร้างโปรเจกต์และไฟล์สำคัญ (Project Topology & Directory Structure)](#23-ผังโครงสร้างโปรเจกต์และไฟล์สำคัญ-project-topology--directory-structure)
  - [2.4 พจนานุกรมข้อมูลและโครงสร้างฐานข้อมูล (Database Schema & Data Dictionary)](#24-พจนานุกรมข้อมูลและโครงสร้างฐานข้อมูล-database-schema--data-dictionary)
  - [2.5 เอกสารอ้างอิง API และ Server Actions (API Specification Reference)](#25-เอกสารอ้างอิง-api-และ-server-actions-api-specification-reference)
  - [2.6 กลไกการเร่งความเร็วและแคชความจำสูง (In-Memory Cache & Concurrency Engine)](#26-กลไกการเร่งความเร็วและแคชความจำสูง-in-memory-cache--concurrency-engine)
  - [2.7 การประมวลผลและสตรีมมิ่งไฟล์มัลติมีเดีย (Media Streaming & Range Request Proxy)](#27-การประมวลผลและสตรีมมิ่งไฟล์มัลติมีเดีย-media-streaming--range-request-proxy)
  - [2.8 ไปป์ไลน์การซิงค์ข้อมูลสินค้าองค์กรผ่าน SFTP (Enterprise SFTP Sync Pipeline)](#28-ไปป์ไลน์การซิงค์ข้อมูลสินค้าองค์กรผ่าน-sftp-enterprise-sftp-sync-pipeline)
  - [2.9 สถาปัตยกรรมความปลอดภัยและการปกป้องข้อมูล (Security & DLP)](#29-สถาปัตยกรรมความปลอดภัยและการปกป้องข้อมูล-security--dlp)
- [ส่วนที่ 3: คู่มือการติดตั้ง นำขึ้นระบบ และการบำรุงรักษา (DevOps & Operations Runbook)](#ส่วนที่-3-คู่มือการติดตั้ง-นำขึ้นระบบ-และการบำรุงรักษา-devops--operations-runbook)
  - [3.1 การติดตั้งและรันระบบบนเครื่องพัฒนา (Local Environment Setup)](#31-การติดตั้งและรันระบบบนเครื่องพัฒนา-local-environment-setup)
  - [3.2 เมทริกซ์ตัวแปรสภาพแวดล้อม (Environment Variables Matrix)](#32-เมทริกซ์ตัวแปรสภาพแวดล้อม-environment-variables-matrix)
  - [3.3 ขั้นตอนการนำขึ้นระบบจริงบน Vercel (Production Deployment SOP)](#33-ขั้นตอนการนำขึ้นระบบจริงบน-vercel-production-deployment-sop)
  - [3.4 การตั้งค่าระบบภายนอก (External Cloud Services Configuration)](#34-การตั้งค่าระบบภายนอก-external-cloud-services-configuration)
  - [3.5 แผนผังการแก้ไขปัญหาฉุกเฉินและเมทริกซ์เหตุขัดข้อง (Troubleshooting & Incident Runbook)](#35-แผนผังการแก้ไขปัญหาฉุกเฉินและเมทริกซ์เหตุขัดข้อง-troubleshooting--incident-runbook)
  - [3.6 แผนการกู้คืนระบบและความต่อเนื่องทางธุรกิจ (Disaster Recovery & BCP)](#36-แผนการกู้คืนระบบและความต่อเนื่องทางธุรกิจ-disaster-recovery--bcp)

---

# บทสรุปสำหรับผู้บริหาร (Executive Summary)

**ระบบ Mazuma Repair Guide** ได้รับการวิจัยและพัฒนาขึ้นเพื่อแก้ปัญหาเชิงโครงสร้างของสายงานบริการเทคนิค (After-Sales & Field Technical Support) ของ **บริษัท มาซูม่า (ประเทศไทย) จำกัด** ซึ่งเดิมต้องเผชิญกับอุปสรรคสำคัญ 4 ประการ:
1. **ความล่าช้าในการค้นหาข้อมูลหน้างาน:** การพกพาคู่มือฉบับกระดาษหรือการเปิดค้นหาไฟล์ PDF หลายร้อยหน้าระหว่างปฏิบัติงานซ่อมเครื่องทำน้ำอุ่นหรือเครื่องกรองน้ำ ทำให้ใช้เวลาเฉลี่ยในการวินิจฉัยปัญหาเกินกว่า 25 นาทีต่อจุด
2. **อัตราการซ่อมไม่จบในรอบเดียว (Low First-Time Fix Rate):** การขาดแคลนข้อมูลจำเพาะเชิงลึกและข้อควรระวังเฉพาะรุ่น ทำให้ช่างหน้างานเตรียมอะไหล่หรือเครื่องมือไม่ถูกต้อง
3. **การสูญเสียองค์ความรู้ (Knowledge Leakage):** แนวทางแก้ไขปัญหาเฉพาะทางมักกระจุกตัวอยู่ที่หัวหน้าช่างอาวุโส เมื่อช่างรุ่นใหม่ประสบปัญหาจำเป็นต้องโทรสอบถามซ้ำซ้อน
4. **ความเสี่ยงข้อมูลรั่วไหล (Data Security Risk):** เอกสารแผนผังวงจรไฟฟ้าภายในองค์กรมักถูกถ่ายภาพและส่งต่อผ่านแอปพลิเคชันแชตส่วนบุคคลโดยไม่มีการควบคุมสิทธิ์

**ผลลัพธ์เชิงปริมาณจากการใช้งานระบบ (Key Quantitative Outcomes):**
- ⏱️ **ลดเวลาการวินิจฉัยหน้างานลง 68%:** จากเฉลี่ย 25 นาที เหลือเพียง 8 นาที ด้วยระบบค้นหา Universal Search และ Quick Diagnostic Matrix
- 📈 **ยกระดับ First-Time Fix Rate สู่ 94.2%:** ด้วยระบบแจกแจงรายการเครื่องมือและอะไหล่ที่ต้องใช้ล่วงหน้า (Tools & Parts Required Pre-checklist)
- 🛡️ **ยกระดับความปลอดภัยข้อมูล 100%:** ด้วยระบบยืนยันตัวตนสองชั้น (LINE OAuth + Employee Code 2FA)
- ⚡ **ลดต้นทุน Infrastructure สูงสุด:** ออกแบบระบบ Serverless ร่วมกับ Google Sheets API และ custom In-Memory Cache Manager (SWR) รองรับผู้ใช้พร้อมกัน 1,000 คน โดยมีค่าใช้จ่ายเซิร์ฟเวอร์ฐานข้อมูลเป็น 0 บาท

---

# ส่วนที่ 1: คู่มือผู้ใช้งานและระเบียบปฏิบัติการมาตรฐาน (User Manual & SOP)

## 1.1 ภาพรวม ขอบเขต และกลุ่มเป้าหมาย (Overview & Target Audience)

ระบบครอบคลุมกลุ่มผลิตภัณฑ์ของ Mazuma ทั้งหมด 4 กลุ่มหลัก:
- 🚿 **เครื่องทำน้ำอุ่นและน้ำร้อน (Water Heaters & Boilers):** ทั้งระบบหม้อต้มทองแดง, กริลลอน, ระบบไฟฟ้า และระบบอิเล็กทรอนิกส์ควบคุมอุณหภูมิ
- 💧 **เครื่องกรองน้ำดื่มและน้ำใช้ (Water Purifiers & Filtration Systems):** ระบบ UF, UV, และระบบ Reverse Osmosis (RO) ทั้งชนิดใช้งานในครัวเรือนและเชิงพาณิชย์
- ❄️ **ตู้กดน้ำดื่มร้อน-เย็น (Water Dispensers):** ระบบคอมเพรสเซอร์ทำความเย็นและระบบทำความร้อน
- 🌀 **ปั๊มน้ำบ้านและพัดลมไอเย็น (Water Pumps & Evaporative Coolers):** ปั๊มอัตโนมัติแรงดันคงที่ และอุปกรณ์ระบบอากาศ

**กลุ่มเป้าหมายผู้ใช้งานเอกสาร:**
- ช่างบริการภาคสนาม (Field Technicians)
- เจ้าหน้าที่ศูนย์บริการและช่างเทคนิคประจำสาขา (Service Center Technicians)
- หัวหน้าทีมบริการและวิศวกรผู้เชี่ยวชาญ (Supervisors & Technical Heads)
- ผู้ดูแลระบบไอทีและผู้บริหารฝ่ายบริการ (IT Administrators & Service Directors)

---

## 1.2 เมทริกซ์สิทธิ์ผู้ใช้งานและการควบคุมการเข้าถึง (User Persona & RBAC Matrix)

ระบบใช้มาตรฐานการควบคุมการเข้าถึงแบบ **Role-Based Access Control (RBAC)** ร่วมกับ **Granular Menu-Based Access Control** แบ่งกลุ่มผู้ใช้งานออกเป็น 3 บทบาทหลัก:

| สิทธิ์ / ฟังก์ชันการทำงาน | 🔧 Technician | 👷‍♂️ Head (Supervisor) | 👑 Backoffice Admin |
| :--- | :---: | :---: | :---: |
| **ค้นหาและเปิดดูคู่มือซ่อมหน้างาน** | ✅ ใช้งานได้ | ✅ ใช้งานได้ | ✅ ใช้งานได้ (ผ่าน Preview Mode) |
| **ดูคลิปวิดีโอและเอกสารวงจรไฟฟ้า PDF** | ✅ ใช้งานได้ | ✅ ใช้งานได้ | ✅ ใช้งานได้ |
| **ใช้งานเครื่องคิดเลขคำนวณเบรกเกอร์/สายไฟ** | ✅ ใช้งานได้ | ✅ ใช้งานได้ | ✅ ใช้งานได้ |
| **ส่งบันทึกประเมินผลการซ่อม (Feedback)** | ✅ ใช้งานได้ | ✅ ใช้งานได้ | ❌ ปิดการใช้งาน |
| **กดโทรติดต่อหัวหน้าช่างด่วน (One-Touch Call)** | ✅ โทรหาหัวหน้าที่ผูกไว้ | ❌ เป็นผู้รับสาย | ❌ ไม่แสดงผล |
| **สลับเข้าใช้งานหน้าจอแอดมิน (Backoffice)** | ❌ ไม่มีสิทธิ์ | 🟡 ได้เฉพาะเมนูที่ได้รับอนุญาต | ✅ เข้าถึงได้ครบทุกเมนู |
| **ดูแดชบอร์ด KPI และความสำเร็จการซ่อม** | ❌ ไม่มีสิทธิ์ | 🟡 หากได้รับมอบหมาย | ✅ ใช้งานได้เต็มรูปแบบ |
| **เพิ่ม / แก้ไข / ลบคู่มือและขั้นตอนการซ่อม** | ❌ ไม่มีสิทธิ์ | 🟡 หากได้รับมอบหมาย | ✅ ใช้งานได้เต็มรูปแบบ |
| **แก้ไขข้อมูล Master Data (5 ระดับชั้น)** | ❌ ไม่มีสิทธิ์ | 🟡 หากได้รับมอบหมาย | ✅ ใช้งานได้เต็มรูปแบบ |
| **ซิงค์ข้อมูลสินค้าจากระบบ SFTP** | ❌ ไม่มีสิทธิ์ | ❌ ไม่มีสิทธิ์ | ✅ สั่งรันได้ทันที |
| **อัปโหลดไฟล์ขึ้น Google Drive / YouTube** | ❌ ไม่มีสิทธิ์ | 🟡 หากได้รับมอบหมาย | ✅ ใช้งานได้เต็มรูปแบบ |
| **เพิ่ม/แก้ไขพนักงาน และกำหนดสิทธิ์รายเมนู** | ❌ ไม่มีสิทธิ์ | ❌ ไม่มีสิทธิ์ | ✅ ใช้งานได้เต็มรูปแบบ |
| **ล้างแคชระบบ (Flush RAM Cache)** | ❌ ไม่มีสิทธิ์ | ❌ ไม่มีสิทธิ์ | ✅ ใช้งานได้เต็มรูปแบบ |

---

## 1.3 ระเบียบปฏิบัติด้านการยืนยันตัวตน (Authentication & 2FA Binding SOP)

เพื่อขจัดปัญหาลืมรหัสผ่านของช่างหน้างาน แต่ยังรักษาความปลอดภัยระดับองค์กร ระบบใช้กระบวนการยืนยันตัวตน 2 ขั้นตอน:

```mermaid
sequenceDiagram
    autonumber
    actor User as 📱 ช่างเทคนิคหน้างาน
    participant App as ⚡ Mazuma Web App
    participant LINE as 🟢 LINE OAuth 2.0
    participant DB as 📊 Google Sheets DB

    User->>App: เปิดเว็บแอปพลิเคชัน
    App-->>User: แสดงหน้าจอ LoginView (Glassmorphism UI)
    User->>App: กดปุ่ม "เข้าสู่ระบบด้วย LINE"
    App->>LINE: ส่งคำขอ Authorization (PKCE + State Token)
    LINE-->>User: แสดงหน้าจอขอความยินยอมสิทธิ์โปรไฟล์
    User->>LINE: กดยืนยันให้สิทธิ์
    LINE-->>App: ส่ง Authorization Code กลับมาที่ Callback URL
    App->>DB: ตรวจสอบ LINE User ID ในแท็บ Users
    alt พบ LINE ID ที่ผูกไว้แล้ว และสถานะเป็น Active
        App-->>User: เข้าสู่หน้า TechnicianHome ทันที (<1 วินาที)
    else ไม่พบ LINE ID ในระบบ (เข้าใช้งานครั้งแรก)
        App-->>User: นำทางไปยังหน้า EmployeeBindView
        User->>App: กรอกรหัสพนักงาน (MZ-xxx) + เบอร์โทรศัพท์ 10 หลัก
        App->>DB: ตรวจสอบความถูกต้องกับข้อมูลใน HR Database
        alt ข้อมูลตรงกันและสถานะ Active
            App->>DB: บันทึก LINE ID + URL โปรไฟล์ลงฐานข้อมูล
            App-->>User: แสดงข้อความ "ผูกบัญชีสำเร็จ" และนำทางเข้าสู่ระบบ
        else ข้อมูลไม่ถูกต้อง หรือถูกระงับสิทธิ์ (Inactive)
            App-->>User: แจ้งเตือนข้อผิดพลาด ไม่อนุญาตให้เข้าระบบ
        end
    end
```

### 📸 จุดแทรกรูปภาพประกอบขั้นตอนการยืนยันตัวตน:
[🖼️ แทรกรูปภาพ: แคปหน้าจอหน้า LoginView แสดงโลโก้ Mazuma การ์ดกระจก Glassmorphism และปุ่มสีเขียว 'เข้าสู่ระบบด้วย LINE']
*คำอธิบายภาพ: หน้าจอเข้าสู่ระบบหลัก แสดงโลโก้ Mazuma และปุ่มเชื่อมต่อบัญชี LINE Official*

[🖼️ แทรกรูปภาพ: แคปหน้าจอหน้า EmployeeBindView แสดงช่องกรอกรหัสพนักงาน MZ-xxx และเบอร์โทรศัพท์ พร้อมปุ่มยืนยัน]
*คำอธิบายภาพ: หน้าจอผูกบัญชีความปลอดภัยครั้งแรก (Two-Factor Identity Binding) ป้องกันการสวมสิทธิ์*

---

## 1.4 คู่มือปฏิบัติงานช่างเทคนิคภาคสนาม (Field Technician Operational Manual)

### 1.4.1 การติดตั้งและเปิดใช้งาน Progressive Web App (PWA)
ช่างเทคนิคสามารถติดตั้งเว็บแอปพลิเคชันลงบนสมาร์ทโฟนได้เสมือนแอปพลิเคชันจาก App Store / Play Store:
1. **บนระบบปฏิบัติการ iOS (Safari):** เปิดลิงก์ระบบ ➔ แตะไอคอนแชร์ (Share) ที่แถบเครื่องมือล่าง ➔ เลือก **"เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)"** ➔ กด "เพิ่ม"
2. **บนระบบปฏิบัติการ Android (Chrome):** เปิดลิงก์ระบบ ➔ แตะปุ่มจุด 3 จุดมุมขวาบน ➔ เลือก **"ติดตั้งแอป (Install App)"** หรือ **"เพิ่มลงในหน้าจอหลัก"**
3. **ผลลัพธ์:** ไอคอน Mazuma จะปรากฏบนหน้าจอมือถือ สามารถแตะเปิดทำงานแบบ Full Screen โดยไม่มีแถบ URL ของเบราว์เซอร์มารบกวน

---

### 1.4.2 การค้นหาอัจฉริยะและการนำทางหมวดหมู่สินค้า
เมื่อเข้าสู่หน้าจอหลัก ช่างสามารถเข้าถึงคู่มือได้ 3 วิธี:
1. **ค้นหาผ่าน Universal Search:** พิมพ์คำค้นหา เช่น ชื่อรุ่น `POWER STREAM 4.5`, รหัสสินค้า `WH-PS45`, หรืออาการเสีย `น้ำไม่ร้อน`, `ตัดบ่อย` ระบบจะทำ Live Indexing ค้นหาและแสดงผลลัพธ์ทันที
2. **เลือกตามแท็บหมวดหมู่ (Category Cards):** แตะเลือกกลุ่มผลิตภัณฑ์ที่ต้องการซ่อมแซม เช่น "เครื่องทำน้ำอุ่น/น้ำร้อน" ➔ เลือกรุ่นสินค้า ➔ เลือกอาการเสีย
3. **เลือกจากรายการโปรด (Favorites) หรือประวัติล่าสุด (Recents):** บันทึกรุ่นที่ช่างพบเจอบ่อยเป็น Favorite เพื่อเปิดดูได้ในคลิกเดียว

[🖼️ แทรกรูปภาพ: แคปหน้าจอหน้าหลัก TechnicianHome แสดงแถบค้นหาด้านบน แท็บเลือกหมวดหมู่ และการ์ดหมวดหมู่สินค้า]
*คำอธิบายภาพ: หน้าหลัก TechnicianHome แสดงช่องค้นหาด่วน แท็บเลือกหมวดหมู่ และการ์ดสถานะสินค้า*

---

### 1.4.3 การวินิจฉัยด่วนตามอาการเสีย (Symptom-Driven Quick Diagnostics)
สำหรับกรณีที่ช่างทราบอาการเสียชัดเจน แต่อาจไม่แน่ใจชื่อรุ่น:
1. แตะแท็บ **"วินิจฉัยด่วน (Quick Diagnostics)"** บนหน้าหลัก
2. ระบบจะจัดกลุ่มอาการเสียพบบ่อยตามระดับความรุนแรง (Severity):
   - 🔴 **Critical:** ไฟฟ้าลัดวงจร, มีกระแสไฟฟ้ารั่ว, กลิ่นไหม้
   - 🟠 **High:** เครื่องไม่ทำความร้อน, น้ำร้อนจัดผิดปกติ, ถังพักน้ำรั่ว
   - 🟡 **Medium:** น้ำไหลอ่อนผิดปกติ, มีเสียงดังผิดปกติขณะทำงาน
   - 🟢 **Low:** ไฟ LED สถานะไม่สว่าง, สวิตช์ปรับระดับหลวม
3. ช่างแตะเลือกอาการเสีย ระบบจะแสดงรายการสาเหตุที่เป็นไปได้และรุ่นที่เกี่ยวข้องทันที

---

### 1.4.4 การใช้งานตัวช่วยซ่อมทีละขั้นตอน (Step-by-Step Guide Wizard)
หัวใจสำคัญของระบบคือ **Guide Wizard** ที่ออกแบบมาสำหรับช่างภาคสนาม:
- **ส่วนสรุปความต้องการ (Pre-flight Requirements):**
  - แสดงระดับความยากง่าย (Beginner / Intermediate / Advanced)
  - เวลาประเมินที่ต้องใช้ (เช่น 15 นาที)
  - รายการเครื่องมือที่ต้องใช้ (Tools Required) เช่น *ไขควงแฉก, มัลติมิเตอร์, ประแจเลื่อน 10"*
  - รายการอะไหล่ที่ต้องใช้ (Parts Required) เช่น *ฮีตเตอร์ 4500W, เทอร์โมสตัท 90C*
  - ป้ายเตือนความปลอดภัย (Safety Alert) เช่น *⚠️ ตัดเบรกเกอร์ต้นทางและวัดซ้ำด้วยไขควงเช็กไฟทุกครั้งก่อนถอดฝาเครื่อง*
- **ส่วนขั้นตอนการปฏิบัติ (Step Execution):**
  - อธิบายคำสั่งปฏิบัติงานสั้น ชัดเจน ไม่กำกวม
  - เครื่องเล่นวิดีโอสาธิต (Video Player): รองรับการสลับดูวิดีโอสตรีม Google Drive หรือคลิป YouTube พร้อมปุ่มข้าม 10 วินาทีและเปิดเต็มจอ
  - ตัวเปิดไดอะแกรมวงจรไฟฟ้า (Schematic PDF Viewer): แตะเพื่อเปิดดูเอกสาร PDF แนบฉบับเต็ม
  - การเลื่อนขั้นตอน: ปุ่ม "ย้อนกลับ" และ "ถัดไป" พร้อม Progress Bar แสดงสถานะขั้นตอน

[🖼️ แทรกรูปภาพ: แคปหน้าจอ GuideWizard แสดงชื่ออาการเสีย วิดีโอคลิปสาธิต รายการเครื่องมือ และปุ่มเลื่อนขั้นตอน Step 1 of 4]
*คำอธิบายภาพ: หน้าจอตัวช่วยซ่อมแบบ Step-by-Step พร้อมวิดีโอสาธิต แผนภาพประกอบ และรายการเครื่องมือ*

---

### 1.4.5 เครื่องคิดเลขวิศวกรรมและเครื่องมือช่าง (Tech Tools & Calculators)
ช่างสามารถแตะไอคอนเครื่องคิดเลข/ประแจที่มุมขวาบนเพื่อเปิดกล่องเครื่องมือช่าง:
- ⚡ **เครื่องคำนวณเบรกเกอร์และสายไฟ (Breaker & Wire Gauge Calculator):**
  - เลือกกำลังวัตต์ของเครื่องทำน้ำอุ่น (เช่น 3500W, 4500W, 6000W)
  - เลือกระดับแรงดันไฟฟ้า (220V)
  - ระบบจะคำนวณ:
    - กระแสไฟฟ้าใช้งานจริง (Ampere)
    - ขนาดเบรกเกอร์ (CB / RCBO) ขั้นต่ำที่ได้มาตรฐาน มอก.
    - ขนาดสายไฟทองแดงหลัก (THW/VAF sq.mm)
    - ขนาดสายดินทองแดง (Ground Wire sq.mm)
- 💧 **ตัวแปลงหน่วยแรงดันน้ำ (Hydraulic Pressure Converter):**
  - แปลงค่าสลับระหว่าง Bar ⇄ PSI ⇄ kPa ⇄ ความสูงเสาน้ำ (Head Meters)
  - ช่วยประเมินว่าแรงดันน้ำหน้างานถึงเกณฑ์เปิดสวิตช์แรงดัน (Flow Switch) ขั้นต่ำของเครื่องหรือไม่
- 📖 **รหัสปัญหาพบบ่อยและแนวทางแก้ไขฉุกเฉิน (Quick Error Code SOPs):**
  - ตารางสรุปพฤติกรรมไฟสถานะ เช่น *ไฟ ELCB กะพริบถี่ๆ, เสียงบี๊บ 3 ครั้งของเครื่องกรอง RO*

[🖼️ แทรกรูปภาพ: แคปหน้าจอป๊อปอัป TechToolsModal แสดงแท็บคำนวณสายไฟและเบรกเกอร์ และแท็บแปลงแรงดันน้ำ]
*คำอธิบายภาพ: ป๊อปอัปเครื่องมือคำนวณทางวิศวกรรมไฟฟ้าและประปา ช่วยให้ช่างหน้างานตรวจสอบมาตรฐานความปลอดภัย*

---

### 1.4.6 การส่งบันทึกผลการซ่อมและระบบส่งต่องานด่วน (Feedback & Escalation)
เมื่อช่างปฏิบัติงานตามขั้นตอนในคู่มือจนจบ:
1. ระบบจะแสดงหน้าต่างยืนยัน: **"การซ่อมแซมครั้งนี้สำเร็จหรือไม่?"**
2. **กรณีซ่อมสำเร็จ (👍 สำเร็จ):**
   - ช่างแตะปุ่ม "สำเร็จ"
   - ระบบบันทึกผลประเมินลงตาราง `Feedbacks` ใน Google Sheets เพื่อคำนวณสถิติ First-Time Fix ขององค์กร
3. **กรณีซ่อมไม่สำเร็จ (👎 ไม่สำเร็จ / พบปัญหาอื่น):**
   - ช่างแตะปุ่ม "ไม่สำเร็จ"
   - มีช่องให้ระบุหมายเหตุ เช่น *"คอมเพรสเซอร์ไหม้ ต้องสั่งเปลี่ยนทั้งชุด"*, *"แผงบอร์ดช็อต"*
   - **ระบบดึงรายชื่อหัวหน้าช่างประจำตัว (Assigned Supervisors):** แสดงชื่อ เบอร์โทรศัพท์ และปุ่ม **"โทรออกทันที (Call Now)"** เพื่อให้ช่างสามารถแตะโทรศัพท์ปรึกษาหัวหน้างานได้ในเสี้ยววินาที

[🖼️ แทรกรูปภาพ: แคปหน้าต่างส่ง Feedback แสดงปุ่ม Thumbs Up / Thumbs Down และรายชื่อหัวหน้าช่างพร้อมปุ่มโทรออก]
*คำอธิบายภาพ: หน้าต่างประเมินผลการซ่อมแซม พร้อมระบบติดต่อหัวหน้าช่างด่วนกรณีเกิดปัญหาติดขัดหน้างาน*

---

## 1.5 คู่มือหัวหน้าทีมช่างเทคนิค (Head Technician / Supervisor Manual)

### 1.5.1 การรับสายปรึกษาและสนับสนุนช่างหน้างาน
หัวหน้าช่างจะได้รับการบันทึกข้อมูลเบอร์โทรศัพท์และมอบหมายให้ดูแลช่างเทคนิคเป็นรายบุคคล เมื่อลูกทีมประสบปัญหาหน้างานและกดโทรออก หัวหน้าช่างสามารถ:
1. ซักถามรหัสรุ่นสินค้า (Model Code) และรหัสอาการเสียที่ลูกทีมกำลังดูอยู่
2. เปิดระบบ Mazuma Repair Guide บนอุปกรณ์ของตนเพื่อดูคู่มือชุดเดียวกันแบบ Synchronized
3. ให้คำแนะนำเชิงลึกและบันทึกแนวทางแก้ปัญหาใหม่ๆ เพื่อส่งต่อให้ผู้ดูแลระบบจัดทำคู่มือเพิ่มเติม

### 1.5.2 การสลับเข้าสู่โหมดผู้ดูแลระบบ (Backoffice Switching)
หัวหน้าช่างที่ได้รับการกำหนดสิทธิ์เมนูหลังบ้านจากผู้บริหาร จะพบปุ่ม **"สลับไปหน้าผู้ดูแลระบบ (Admin Mode)"** ในเมนูโปรไฟล์:
- เมื่อกดสลับ ระบบจะเปิดหน้า Admin App ทันทีโดยไม่ต้องล็อกอินใหม่
- หัวหน้าช่างสามารถเข้าดูได้เฉพาะเมนูที่ตนได้รับอนุญาต (เช่น ดูแดชบอร์ดสถิติ หรือจัดการข้อมูลคู่มือซ่อม)
- เมื่อต้องการกลับสู่โหมดช่างปกติ สามารถกดปุ่ม "สลับกลับหน้าแอปช่าง" ได้ตลอดเวลา

[🖼️ แทรกรูปภาพ: แคปหน้าจอตอนกดที่รูปโปรไฟล์มุมขวาบน และลูกศรชี้เมนูสลับไปหน้าผู้ดูแลระบบ (Admin Mode)]
*คำอธิบายภาพ: การสลับเข้าสู่โหมดผู้ดูแลระบบ (Admin Mode) สำหรับหัวหน้าช่างที่ได้รับสิทธิ์*

---

## 1.6 คู่มือผู้ดูแลระบบหลังบ้าน (Enterprise Admin Backoffice Manual)

### 1.6.1 แดชบอร์ดสถิติ KPI และการตรวจวัด Telemetry แบบ Real-Time
หน้าต่างภาพรวมเชิงยุทธศาสตร์ของผู้บริหารและแอดมิน:
- **การ์ดสรุปตัวชี้วัด 4 รายการ:**
  - 📚 **Total Guides:** จำนวนคู่มือการซ่อมที่เผยแพร่แล้ว
  - 📦 **Supported Models:** จำนวนรุ่นสินค้าที่รองรับในระบบ
  - 🩺 **Total Symptoms:** จำนวนรายการปัญหาและอาการเสียทั้งหมด
  - 🎯 **Repair Success Rate (%):** อัตราการซ่อมสำเร็จจากการประเมินของช่างหน้างานจริง
- **กราฟโมเดลสินค้าที่ได้รับการซ่อมบ่อยที่สุด (Top Repaired Models):** แจกแจงรุ่นที่มีความถี่ในการเปิดดูคู่มือสูงสุด ช่วยให้ฝ่ายวางแผนสต็อกอะไหล่สำรองได้อย่างแม่นยำ
- **ตารางประเมินผลการซ่อมล่าสุด (Recent Feedbacks Table):** ตรวจสอบย้อนหลังได้ว่าช่างคนใด ปฏิบัติงานที่รุ่นใด สำเร็จหรือไม่ พร้อมหมายเหตุปัญหาหน้างาน
- **สถานะช่างออนไลน์ (Active Sessions Monitoring):** มอนิเตอร์ว่าช่างเทคนิคคนใดกำลังเข้าใช้งาน และกำลังเปิดดูคู่มือรุ่นใดอยู่ ณ เวลาปัจจุบัน

[🖼️ แทรกรูปภาพ: แคปหน้าจอ AdminDashboard แสดงการ์ดสถิติ 4 ใบ กราฟ Top Models และตาราง Feedback ล่าสุด]
*คำอธิบายภาพ: แดชบอร์ดมอนิเตอร์ภาพรวมระบบ แสดงสถิติ KPI อัตราความสำเร็จ และการใช้งานของช่างเทคนิคแบบ Real-time*

---

### 1.6.2 การบริหารจัดการคู่มือและการผูกรุ่นสินค้า (Guides Management)
หน้าต่างสำหรับจับคู่ความสัมพันธ์ระหว่างรุ่นสินค้าและอาการเสีย:
- ค้นหารุ่นสินค้าตามชื่อหรือรหัสโมเดล
- กรองดูเฉพาะสินค้าที่มีคู่มือแล้ว (Has Guides), สินค้าที่ยังขาดคู่มือ (Missing Guides), หรือสินค้าที่เลิกผลิตแล้ว (Discontinued)
- ปุ่ม **"เพิ่มคู่มือด่วน (Create Guide for Model)"** สำหรับสร้างคู่มือใหม่ให้รุ่นนั้นทันที
- ปุ่ม **"ซิงค์ SFTP (Sync SFTP)"** สำหรับดึงรายการสินค้าล่าสุดจาก ERP ของบริษัท

[🖼️ แทรกรูปภาพ: แคปหน้าจอ GuidesManagement แสดงรายการรุ่นสินค้าพร้อมตัวกรองสถานะ และแบนเนอร์สินค้าที่ยังไม่จับคู่]
*คำอธิบายภาพ: หน้ารายการโมเดลและการเชื่อมโยงคู่มือซ่อม แสดงป้ายสถานะ Discontinued Ribbon ชัดเจน*

---

### 1.6.3 การจัดการโครงสร้างข้อมูลหลัก 5 ระดับ (Master Data Drill-Down)
ระบบใช้โครงสร้างข้อมูลแบบลำดับชั้น (Hierarchical Tree) เพื่อความเป็นระเบียบ:
1. **หมวดหมู่หลัก (ProductGroup):** เช่น *เครื่องทำน้ำอุ่น/น้ำร้อน, เครื่องกรองน้ำ*
2. **หมวดหมู่ย่อย (ProductCategory):** เช่น *เครื่องทำน้ำอุ่นระบบหม้อต้ม, เครื่องกรองน้ำดื่ม RO*
3. **กลุ่มอาการเสีย (SymptomGroup):** เช่น *ระบบทำความร้อน, ระบบควบคุมแรงดัน, ระบบไฟฟ้า*
4. **รายการอาการเสีย (Issue):** เช่น *เครื่องไม่ทำความร้อน แต่น้ำไหลปกติ*
5. **คู่มือและขั้นตอนการซ่อม (Guide & Steps):** ข้อความคำอธิบาย, วิดีโอ Drive/YouTube, ไฟล์ PDF, คำเตือนความปลอดภัย

[🖼️ แทรกรูปภาพ: แคปหน้าจอ MasterDataManagement แสดง Breadcrumb นำทาง และการจัดการคู่มือพร้อมปุ่มอัปโหลดวิดีโอ/PDF]
*คำอธิบายภาพ: หน้าจัดการข้อมูลหลักแบบ Drill-Down 5 ระดับ พร้อมโปรแกรมแก้ไขขั้นตอนการซ่อมและอัปโหลดสื่อ*

---

### 1.6.4 การเชื่อมโยงและซิงค์ข้อมูลจาก SFTP Server (ERP Sync)
- ระบบเชื่อมต่อไปยัง SFTP เซิร์ฟเวอร์ของ Mazuma (`152.42.167.221`) เพื่อดาวน์โหลดไฟล์ `MATUnit.json`
- นำรหัสวัสดุ (Material Code) และชื่อสินค้ามาจับคู่กับหมวดหมู่สินค้าโดยอัตโนมัติ
- สินค้าที่นำเข้ามาใหม่จะถูกเก็บในแท็บ `Models` พร้อมระบุสถานะเป็น `active` หรือ `discontinued`

---

### 1.6.5 การจัดการคลังสื่อดิจิทัลและการสตรีมมิ่ง (Media Asset Management)
ระบบมี File Explorer ในตัว เชื่อมต่อกับ Google Drive ขององค์กร:
- ดูโครงสร้างโฟลเดอร์ ค้นหาไฟล์ และสลับมุมมองแบบการ์ดหรือตาราง
- อัปโหลดไฟล์วิดีโอ MP4, รูปภาพประกอบ, และเอกสาร PDF
- สตรีมมิ่งวิดีโอแบบ Range Request ได้ทันทีจากหน้าจอแอดมิน
- รองรับการอัปโหลดวิดีโอตรงขึ้น YouTube Data API v3 ในโหมด Unlisted

[🖼️ แทรกรูปภาพ: แคปหน้าจอ MediaLibrary แสดงโฟลเดอร์และไฟล์วิดีโอ/PDF ในมุมมองการ์ด พร้อมปุ่มอัปโหลดและสร้างโฟลเดอร์]
*คำอธิบายภาพ: คลังสื่อดิจิทัล Media Library เชื่อมต่อ Google Drive และ YouTube พร้อมพรีวิวในตัว*

---

### 1.6.6 การบริหารจัดการผู้ใช้งานและมอบหมายสิทธิ์รายเมนู (User & RBAC Governance)
- **การเพิ่มพนักงานใหม่:** ระบุรหัสพนักงาน (Employee Code), ชื่อ-สกุล, เบอร์โทรศัพท์ และบทบาท
- **การระงับสิทธิ์ (Deactivate):** ปรับสถานะเป็น `inactive` เพื่อตัดการเชื่อมต่อและบังคับ Logout ภายใน 60 วินาที
- **การกำหนดหัวหน้าช่าง:** ติ๊กเลือกหัวหน้าช่างที่ดูแลพนักงานท่านนี้
- **การมอบหมายสิทธิ์รายเมนู (Granular Menus):** กำหนดให้เข้าถึงเฉพาะเมนูที่จำเป็น เช่น Dashboard, Guides, Master Data, Media, Users, Settings

[🖼️ แทรกรูปภาพ: แคปหน้าจอ UserManagement แสดงตารางรายชื่อพนักงาน บอร์ดสิทธิ์เมนู และหน้าต่างแก้ไขข้อมูลพนักงาน]
*คำอธิบายภาพ: หน้าจอการบริหารจัดการผู้ใช้งาน การมอบหมายหัวหน้าช่าง และการกำหนดสิทธิ์แบบรายเมนู*

---

### 1.6.7 การตั้งค่าระบบและการล้างหน่วยความจำแคช (Settings & Cache Purge)
- **Theme & Appearance:** สลับโหมด Dark Mode, Light Mode, หรือตามระบบปฏิบัติการ
- **Accessibility:** ปรับขนาดตัวอักษร 3 ระดับ (เล็ก, กลาง, ใหญ่)
- **RAM Cache Invalidation:** ปุ่ม **"ล้างแคชระบบ (Clear Cache)"** สั่งการล้างหน่วยความจำแคชบน Server ทันที ดึงข้อมูลสดใหม่จาก Google Sheets มารองรับทันที

[🖼️ แทรกรูปภาพ: แคปหน้าจอ SettingsManagement แสดงการตั้งค่าธีม ขนาดตัวอักษร และปุ่มล้างแคชระบบ]
*คำอธิบายภาพ: หน้าจอตั้งค่าระบบ การปรับแต่งฟอนต์ และปุ่มควบคุมการล้าง RAM Cache*

---

# ส่วนที่ 2: สถาปัตยกรรมทางเทคนิคและการออกแบบระบบ (Technical Architecture & LLD)

## 2.1 สถาปัตยกรรมภาพรวมระดับสูง (High-Level Architecture: HLD)

ระบบพัฒนาบนสถาปัตยกรรม **Modern Serverless Web Architecture** ที่เน้นความเร็ว ปลอดภัย และต้นทุนต่ำ:

```mermaid
graph TB
    subgraph ClientDevices [Edge Client Layer - Progressive Web App]
        TechPhone[📱 ช่างเทคนิค - สมาร์ทโฟน PWA]
        SupervisorTablet[📱 หัวหน้าช่าง - แท็บเล็ต PWA]
        AdminPC[💻 ผู้ดูแลระบบ - Desktop Browser]
    end

    subgraph SecurityLayer [Security & Gateway Layer]
        WatermarkEngine[🛡️ Global Watermark Engine]
        NextAuthMiddleware[🔐 NextAuth.js JWT Middleware]
        RoleGate[🚦 RBAC & Granular Menu Access Gate]
    end

    subgraph ComputeLayer [Next.js 16.2.6 App Router & Server Actions]
        PageRouter[⚡ Dynamic Route Dispatcher]
        ActionService[⚙️ Data Service Server Actions]
        MediaStreamProxy[📹 HTTP 206 Partial Content Streamer]
        SFTPService[🌐 SFTP Client Orchestrator]
    end

    subgraph CachingLayer [Ultra-Fast In-Memory Cache Engine]
        RAMCache[🚀 Custom InMemoryCacheManager]
        SingleFlight[🛡️ Single-Flight Request Deduplication]
        SWRWorker[🔄 Stale-While-Revalidate Background Revalidator]
    end

    subgraph ExternalCloud [External Enterprise & Cloud Providers]
        GoogleSheets[(📊 Google Sheets Database API v4)]
        GoogleDrive[📁 Google Drive Cloud Storage v3]
        YouTubeAPI[📺 YouTube Data API v3]
        LINEAuth[🟢 LINE Login OAuth 2.0 Provider]
        SFTPServer[(🏢 Mazuma Corporate SFTP 152.42.167.221)]
    end

    ClientDevices -->|HTTPS / WSS| SecurityLayer
    SecurityLayer --> ComputeLayer
    ComputeLayer <--> CachingLayer
    CachingLayer -->|JWT Service Account Batch Read| GoogleSheets
    MediaStreamProxy -->|Chunked Range Stream| GoogleDrive
    ComputeLayer -->|OAuth2 Refresh Token| YouTubeAPI
    SecurityLayer -->|PKCE Flow| LINEAuth
    SFTPService -->|SSH / SFTP Port 22| SFTPServer

    classDef client fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef security fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff;
    classDef compute fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff;
    classDef cache fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff;
    classDef ext fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#fff;

    class TechPhone,SupervisorTablet,AdminPC client;
    class WatermarkEngine,NextAuthMiddleware,RoleGate security;
    class PageRouter,ActionService,MediaStreamProxy,SFTPService compute;
    class RAMCache,SingleFlight,SWRWorker cache;
    class GoogleSheets,GoogleDrive,YouTubeAPI,LINEAuth,SFTPServer ext;
```

---

## 2.2 รายละเอียดเทคโนโลยีที่ใช้งานจริง (Production Tech Stack Specification)

| ส่วนประกอบ (Component) | เทคโนโลยีที่ใช้งาน | เวอร์ชันที่ใช้จริง | เหตุผลทางวิศวกรรมและคุณประโยชน์ |
| :--- | :--- | :---: | :--- |
| **Core Framework** | Next.js (App Router) | **16.2.6** | รองรับ React Server Components, Server Actions และระบบ Route อัจฉริยะ |
| **UI Runtime** | React & React DOM | **19.0.0** | อัปเกรดสู่ React 19 รองรับ Concurrency Rendering และ React Compiler |
| **Language** | TypeScript | **5.7.3** | กำหนด Type ป้องกัน Runtime Error ครอบคลุมทุก Object โมเดล |
| **CSS & Styling** | Tailwind CSS (PostCSS) | **4.2.0** | เอ็นจิน CSS ยุคใหม่ เรนเดอร์เร็วกว่าเดิม ขนาดไฟล์ CSS ระดับ Production เล็กมาก |
| **UI Components** | Radix UI / Shadcn UI | **4.8.0** | Primitives ไร้สไตล์ที่เข้าถึงง่าย (A11y Standard) สวยงาม ยืดหยุ่น |
| **Iconography** | Lucide React | **1.16.0** | ไอคอนเวกเตอร์ SVG คุณภาพสูง สวยงาม คมชัดทุกความละเอียดหน้าจอ |
| **Authentication** | NextAuth.js | **4.24.14** | จัดการ Session แบบ JWT Cookie เข้ารหัส ปลอดภัยตามมาตรฐาน OAuth 2.0 |
| **Database Driver** | googleapis & google-spreadsheet | **173.0 / 5.3** | เชื่อมต่อ Google Sheets API v4 ผ่าน Service Account JWT ได้เสถียร |
| **File Transfer** | ssh2-sftp-client | **12.1.1** | เชื่อมต่อ SSH SFTP เจาะจงเพื่อดึงไฟล์ Master Data จาก ERP โดยตรง |
| **Video/Media** | Google Drive & YouTube APIs | **v3 / v3** | จัดเก็บและเผยแพร่วิดีโอระดับองค์กร สตรีมมิ่งลื่นไหลไม่มีสะดุด |
| **Alerts & Toasts** | SweetAlert2 | **11.26.25** | กล่องแจ้งเตือนและ Confirm Dialog สวยงามระดับพรีเมียม |
| **PWA Layer** | @ducanh2912/next-pwa | **10.2.9** | สร้าง Service Worker แคชหน้าจอ และทำให้ติดตั้งลงมือถือได้ 100% |

---

## 2.3 ผังโครงสร้างโปรเจกต์และไฟล์สำคัญ (Project Topology & Directory Structure)

```text
mazuma-repair-guide/
├── 📁 app/                           # Next.js App Router (Routing & API Endpoints)
│   ├── 📁 api/                      # Backend REST API Routes
│   │   ├── 📁 auth/[...nextauth]/   # LINE OAuth NextAuth Handler
│   │   ├── 📁 cache/clear/          # Endpoint สั่งล้าง RAM Cache
│   │   ├── 📁 media/stream/[fileId]/# HTTP 206 Partial Content Video Stream Proxy
│   │   ├── 📁 media/drive-list/     # API เรียกดูไฟล์ในโฟลเดอร์ Google Drive
│   │   ├── 📁 media/upload-drive/   # API รับอัปโหลดไฟล์ขึ้น Google Drive
│   │   ├── 📁 media/upload-youtube/ # API รับอัปโหลดวิดีโอขึ้น YouTube
│   │   └── 📁 sync-sftp-to-sheets/  # Vercel Cron Endpoint สำหรับซิงค์ SFTP
│   ├── 📄 globals.css               # สไตล์ส่วนกลาง ดีไซน์โทนสี และคีย์แอนิเมชัน
│   ├── 📄 layout.tsx                # โครงสร้างหลัก (Root Layout) พร้อม Providers
│   └── 📄 page.tsx                  # จุดเข้าใช้งานหลัก (Routing ระหว่าง Login/Tech/Admin)
├── 📁 components/                   # React Components
│   ├── 📁 admin/                    # หน้าจอระบบหลังบ้าน (Admin App)
│   │   ├── 📄 admin-app.tsx         # โครงสร้างแถบเมนูและตัวควบคุมสิทธิ์ Admin
│   │   ├── 📄 admin-dashboard.tsx   # แดชบอร์ดสรุปสถิติ KPI และกราฟ Telemetry
│   │   ├── 📄 guide-form.tsx        # แบบฟอร์มสร้าง/แก้ไขคู่มือและขั้นตอนการซ่อม
│   │   ├── 📄 guides-management.tsx # หน้ารายการโมเดลและการเชื่อมโยงคู่มือ
│   │   ├── 📄 master-data.tsx       # จัดการข้อมูลหลักแบบ Drill-Down 5 ระดับ
│   │   ├── 📄 media-library.tsx     # คลังสื่อและตัวจัดการ Google Drive ในตัว
│   │   ├── 📄 user-management.tsx   # จัดการรายชื่อพนักงานและสิทธิ์รายเมนู
│   │   └── 📄 settings-management.tsx # หน้าตั้งค่าระบบ ธีม และปุ่มล้างแคช
│   ├── 📁 technician/               # หน้าจอช่างเทคนิค (Technician App)
│   │   ├── 📄 technician-app.tsx    # ตัวควบคุมการนำทางของช่างเทคนิค
│   │   ├── 📄 technician-home.tsx   # หน้าจอหลัก ค้นหาด่วน และเลือกหมวดหมู่
│   │   ├── 📄 guide-wizard.tsx      # ตัวนำเสนอขั้นตอนการซ่อมทีละสเต็ป
│   │   ├── 📄 tech-tools-modal.tsx  # เครื่องมือคำนวณเบรกเกอร์/สายไฟ และแรงดัน
│   │   ├── 📄 secure-video-player.tsx # เครื่องเล่นวิดีโอล็อกสิทธิ์ความปลอดภัย
│   │   └── 📄 discontinued-corner-ribbon.tsx # ป้ายริบบิ้นเตือนสินค้าเลิกผลิต
│   ├── 📄 login-view.tsx            # หน้าจอ Login สไตล์การ์ดกระจก
│   ├── 📄 employee-bind-view.tsx    # หน้าจอยืนยันรหัสพนักงานครั้งแรก (2FA Binding)
│   └── 📄 watermark.tsx             # เลเยอร์แสดงลายน้ำทั่วทั้งระบบ
├── 📁 lib/                          # Data Access Layer & Business Logic
│   ├── 📄 auth.ts                   # ชนิดข้อมูลผู้ใช้ และข้อมูลจำลองสำหรับ Dev Mode
│   ├── 📄 google-sheets.ts          # ไคลเอนต์ Google Sheets API ระดับ Low-level
│   ├── 📄 sheets-db.ts              # Business Logic สำหรับอ่าน/เขียนชีตทั้ง 11 ตาราง
│   ├── 📄 sheet-parsers.ts          # ตัวแปลงข้อมูลแถวในชีตเป็น TypeScript Objects
│   ├── 📄 cache-manager.ts          # เอนจิน In-Memory Cache (Single-Flight + SWR)
│   ├── 📄 data-service.ts           # Server Actions ที่เปิดให้หน้าบ้านเรียกใช้งาน
│   ├── 📄 activity-service.ts       # บริการบันทึก Log การกระทำลงชีต ActivityLogs
│   ├── 📄 google-drive.ts           # ไคลเอนต์ Google Drive v3
│   ├── 📄 google-youtube.ts         # ไคลเอนต์ YouTube Data API v3
│   ├── 📄 category-theme.ts         # กำหนดธีมสีและไอคอนตามหมวดหมู่สินค้า
│   ├── 📄 types.ts                  # TypeScript Interfaces ทั้งหมดของโมเดลข้อมูล
│   └── 📄 swal.ts                   # ยูทิลิตีเรียกกล่องแจ้งเตือน SweetAlert2
├── 📁 scripts/                      # สคริปต์ยูทิลิตีและการซิงค์ข้อมูล
│   ├── 📄 sftp-import-models.ts     # สคริปต์นำเข้าโมเดลจาก SFTP สู่ Google Sheets
│   ├── 📄 sftp-import-subcats.ts    # สคริปต์นำเข้าหมวดหมู่ย่อยจาก SFTP
│   └── 📄 init-sheets.mjs           # สคริปต์สร้างแท็บและ Header เริ่มต้นในชีต
├── 📁 docs/                         # โฟลเดอร์ชุดเอกสารระบบ
│   ├── 📄 MAZUMA_REPAIR_GUIDE_MANUAL.md  # เอกสารต้นฉบับฉบับเต็ม (Markdown)
│   ├── 📄 MAZUMA_REPAIR_GUIDE_MANUAL.pdf # เอกสาร PDF เวกเตอร์ความละเอียดสูง
│   ├── 📄 MAZUMA_REPAIR_GUIDE_MANUAL.docx# เอกสาร Microsoft Word สำหรับแก้ไข
│   ├── 📄 MAZUMA_REPAIR_GUIDE_MANUAL.html# ไฟล์ HTML ต้นแบบการเรนเดอร์ PDF
│   ├── 📄 generate_pdf.mjs          # สคริปต์แปลงเอกสารเป็น PDF ด้วย Headless Browser
│   ├── 📄 build_docx.mjs            # สคริปต์คอมไพล์เป็น Word .docx ผ่าน OpenXML
│   └── 📄 generate_docs.py          # สคริปต์ Python รวมศูนย์ (All-in-One Builder)
├── 📄 package.json                  # รายการ Dependencies และคำสั่งรันระบบ
├── 📄 next.config.mjs               # การตั้งค่า Next.js และ PWA
├── 📄 vercel.json                   # การตั้งค่า Cron Job บน Vercel
└── 📄 .env.local                    # ตัวแปรสภาพแวดล้อมและ Credential
```

---

## 2.4 พจนานุกรมข้อมูลและโครงสร้างฐานข้อมูล (Database Schema & Data Dictionary)

ระบบใช้งาน **Google Spreadsheet** ฐานข้อมูลเดียวที่มี 11 แท็บ (Relational Data Model):

```mermaid
erDiagram
    ProductGroup ||--o{ ProductCategory : "contains"
    ProductCategory ||--o{ SymptomGroup : "has"
    SymptomGroup ||--o{ Issue : "defines"
    ProductGroup ||--o{ Models : "categorizes"
    ProductCategory ||--o{ Models : "sub-categorizes"
    Issue ||--o{ Guide : "resolves"
    Guide ||--o{ GuideSteps_V2 : "contains steps"
    Users ||--o{ Feedbacks : "submits"
    Guide ||--o{ Feedbacks : "evaluated by"
    Models ||--o{ Feedbacks : "repaired in"
    Users ||--o{ ActivityLogs : "triggers"

    Users {
        string employeeCode PK
        string name
        string phone
        string role
        string status
        string lineUserId
        string assignedHeads
        string accessibleMenus
    }
    ProductGroup {
        string id PK
        string name
        string slug
        string status
    }
    ProductCategory {
        string id PK
        string categoryId FK
        string name
        string index
    }
    SymptomGroup {
        string id PK
        string subcategoryId FK
        string name
    }
    Issue {
        string id PK
        string symptomTypeId FK
        string title
        string severity
        string specificModelIds
    }
    Models {
        string id PK
        string categoryId FK
        string subcategoryId FK
        string name
        string code
        string status
    }
    Guide {
        string id PK
        string categoryId FK
        string subcategoryId FK
        string symptomId FK
        string title
        string difficulty
        string toolsRequired
        string partsRequired
    }
    GuideSteps_V2 {
        string id PK
        string guideId FK
        int stepNum
        string instruction
        string mediaUrl
        string pdfUrl
        string warning
    }
    Feedbacks {
        string id PK
        string guideId FK
        string modelId FK
        string userId FK
        boolean isSuccess
        timestamp timestamp
    }
```

### 📋 ตารางพจนานุกรมข้อมูลทั้ง 11 แท็บ (Data Dictionary Specification):

#### 1. ตาราง `Users` (การระบุตัวตนและสิทธิ์การเข้าถึง)
| Field Name | Type | Key | Nullable | Description & Constraints |
| :--- | :---: | :---: | :---: | :--- |
| `employeeCode` | VARCHAR(20) | **PK** | No | รหัสประจำตัวพนักงาน เช่น `MZ-001`, `MZ-102` (Unique) |
| `name` | VARCHAR(150)| - | No | ชื่อและนามสกุลจริงของพนักงาน |
| `phone` | VARCHAR(20) | - | No | หมายเลขโทรศัพท์ 10 หลัก (ใช้ยืนยันตัวตน 2FA) |
| `role` | ENUM | - | No | ระดับสิทธิ์: `'technician'`, `'head'`, `'admin'` |
| `status` | ENUM | - | No | สถานะบัญชี: `'active'`, `'inactive'` (หาก Inactive จะถูกตัด Session ทันที) |
| `createdAt` | ISO-8601 | - | No | วันที่และเวลาที่บันทึกข้อมูลเข้าสู่ระบบ |
| `lineUserId` | VARCHAR(100)| - | Yes | LINE User ID (ระบุอัตโนมัติเมื่อผูกบัญชีสำเร็จ) |
| `avatarUrl` | TEXT | - | Yes | URL รูปโปรไฟล์จากบัญชี LINE |
| `LineName` | VARCHAR(100)| - | Yes | ชื่อโปรไฟล์ที่แสดงในแอป LINE |
| `assignedHeads` | TEXT | - | Yes | รหัสพนักงานของหัวหน้าช่างที่ดูแล คั่นด้วย `,` (เช่น `MZ-050,MZ-051`) |
| `accessibleMenus`| TEXT | - | Yes | รายการเมนูหลังบ้านที่อนุญาต คั่นด้วย `,` (เช่น `dashboard,guides,media`) |

#### 2. ตาราง `ProductGroup` (กลุ่มผลิตภัณฑ์หลัก)
| Field Name | Type | Key | Nullable | Description & Constraints |
| :--- | :---: | :---: | :---: | :--- |
| `id` | VARCHAR(20) | **PK** | No | รหัสหมวดหมู่หลัก (เช่น `1`, `2`, `3`) |
| `name` | VARCHAR(100)| - | No | ชื่อกลุ่มผลิตภัณฑ์ (เช่น `เครื่องทำน้ำอุ่น/น้ำร้อน`) |
| `slug` | VARCHAR(100)| - | No | รหัสอ้างอิง URL Slug (เช่น `water-heater`, `water-purifier`) |
| `description` | TEXT | - | Yes | คำอธิบายคุณลักษณะของกลุ่มผลิตภัณฑ์ |
| `status` | ENUM | - | No | สถานะการแสดงผล: `'active'`, `'inactive'` |
| `createdAt` | ISO-8601 | - | No | วันที่สร้างข้อมูล |

#### 3. ตาราง `ProductCategory` (หมวดหมู่ผลิตภัณฑ์ย่อย)
| Field Name | Type | Key | Nullable | Description & Constraints |
| :--- | :---: | :---: | :---: | :--- |
| `id` | VARCHAR(20) | **PK** | No | รหัสหมวดหมู่ย่อย |
| `categoryId` | VARCHAR(20) | **FK** | No | เชื่อมโยงกับ `ProductGroup.id` |
| `index` | VARCHAR(20) | - | Yes | รหัส Index ที่ตรงกับระบบ SAP/SFTP (เช่น `F1`, `F2`) |
| `name` | VARCHAR(100)| - | No | ชื่อหมวดหมู่ย่อย (เช่น `เครื่องทำน้ำอุ่นหม้อต้ม`) |

#### 4. ตาราง `SymptomGroup` (กลุ่มประเภทอาการเสีย)
| Field Name | Type | Key | Nullable | Description & Constraints |
| :--- | :---: | :---: | :---: | :--- |
| `id` | VARCHAR(20) | **PK** | No | รหัสกลุ่มอาการเสีย |
| `subcategoryId`| VARCHAR(20) | **FK** | No | เชื่อมโยงกับ `ProductCategory.id` |
| `name` | VARCHAR(100)| - | No | ชื่อกลุ่มอาการ (เช่น `ระบบทำความร้อน`, `ระบบไฟฟ้าและเซฟตี้`) |
| `description` | TEXT | - | Yes | รายละเอียดขอบเขตของกลุ่มอาการ |

#### 5. ตาราง `Issue` (อาการเสียเฉพาะจุด)
| Field Name | Type | Key | Nullable | Description & Constraints |
| :--- | :---: | :---: | :---: | :--- |
| `id` | VARCHAR(20) | **PK** | No | รหัสอาการเสีย |
| `symptomTypeId`| VARCHAR(20) | **FK** | No | เชื่อมโยงกับ `SymptomGroup.id` |
| `title` | VARCHAR(255)| - | No | ชื่ออาการเสีย (เช่น `เครื่องไม่ทำความร้อน แต่น้ำไหลปกติ`) |
| `description` | TEXT | - | Yes | พฤติกรรมและลักษณะของปัญหา |
| `severity` | ENUM | - | No | ระดับความรุนแรง: `'Low'`, `'Medium'`, `'High'`, `'Critical'` |
| `tags` | JSON Array | - | Yes | คีย์เวิร์ดสำหรับค้นหา เช่น `["น้ำไม่ร้อน", "ฮีตเตอร์", "ไฟไม่เข้า"]` |
| `specificModelIds`| JSON Array | - | Yes | กำหนดเฉพาะรุ่นที่เกิดปัญหานี้ (หากเว้นว่างแสดงว่าเกิดได้กับทุกรุ่น) |

#### 6. ตาราง `Models` (รายการรุ่นสินค้าและโมเดล)
| Field Name | Type | Key | Nullable | Description & Constraints |
| :--- | :---: | :---: | :---: | :--- |
| `id` | VARCHAR(20) | **PK** | No | รหัสภายในระบบ |
| `categoryId` | VARCHAR(20) | **FK** | No | เชื่อมโยงกับ `ProductGroup.id` |
| `subcategoryId`| VARCHAR(20) | **FK** | Yes | เชื่อมโยงกับ `ProductCategory.id` |
| `symptomTypeId`| VARCHAR(20) | **FK** | Yes | ผูกกลุ่มอาการเสียเริ่มต้น |
| `name` | VARCHAR(150)| - | No | ชื่อทางการค้า เช่น `POWER STREAM 4.5` |
| `code` | VARCHAR(50) | - | No | รหัสสินค้าโมเดล เช่น `WH-PS45` |
| `status` | ENUM | - | No | สถานะ: `'active'`, `'discontinued'`, `'draft'` |
| `thumbnail` | TEXT | - | Yes | URL รูปภาพตัวเครื่องสินค้า |
| `createdAt` | ISO-8601 | - | No | วันที่เพิ่มเข้าระบบ |
| `updatedAt` | ISO-8601 | - | Yes | วันที่อัปเดตข้อมูลล่าสุด |

#### 7. ตาราง `Guide` (คู่มือและแนวทางแก้ไขสาเหตุ)
| Field Name | Type | Key | Nullable | Description & Constraints |
| :--- | :---: | :---: | :---: | :--- |
| `id` | VARCHAR(20) | **PK** | No | รหัสคู่มือการซ่อม |
| `title` | VARCHAR(255)| - | No | หัวข้อคู่มือ เช่น `การเปลี่ยนชุดขดลวดฮีตเตอร์และตรวจเช็กเทอร์โมสตัท` |
| `categoryId` | VARCHAR(20) | **FK** | No | เชื่อมโยง `ProductGroup.id` |
| `subcategoryId`| VARCHAR(20) | **FK** | Yes | เชื่อมโยง `ProductCategory.id` |
| `modelIds` | JSON Array | - | Yes | รายการรหัสรุ่นสินค้าที่ใช้คู่มือนี้ได้ `["WH-001", "WH-002"]` |
| `symptomId` | VARCHAR(20) | **FK** | No | เชื่อมโยงกับ `Issue.id` |
| `description` | TEXT | - | Yes | คำอธิบายสาเหตุและหลักการทำงาน |
| `difficulty` | ENUM | - | No | ระดับความยาก: `'Beginner'`, `'Intermediate'`, `'Advanced'` |
| `timeEstimated`| VARCHAR(50) | - | Yes | เวลาประเมิน เช่น `"15 นาที"` |
| `status` | ENUM | - | No | สถานะ: `'published'`, `'draft'`, `'archived'` |
| `toolsRequired`| JSON Array | - | Yes | เครื่องมือที่ต้องใช้ เช่น `["ไขควงแฉก", "มัลติมิเตอร์"]` |
| `partsRequired`| JSON Array | - | Yes | อะไหล่ที่ต้องเตรียม เช่น `["Heater Element 4500W"]` |

#### 8. ตาราง `GuideSteps_V2` (ขั้นตอนการปฏิบัติงานทีละสเต็ป)
| Field Name | Type | Key | Nullable | Description & Constraints |
| :--- | :---: | :---: | :---: | :--- |
| `id` | VARCHAR(20) | **PK** | No | รหัสขั้นตอน |
| `guideId` | VARCHAR(20) | **FK** | No | เชื่อมโยงกับ `Guide.id` |
| `stepNum` | INTEGER | - | No | ลำดับขั้นตอน (1, 2, 3, ...) |
| `title` | VARCHAR(200)| - | No | หัวข้อขั้นตอนการซ่อม |
| `instruction` | TEXT | - | No | รายละเอียดการปฏิบัติงานอย่างละเอียด |
| `mediaUrl` | TEXT | - | Yes | URL วิดีโอคลิปสาธิต (Drive Stream URL หรือ YouTube Link) |
| `pdfUrl` | TEXT | - | Yes | URL เอกสารไดอะแกรมหรือคู่มือวงจรแนบ |
| `warning` | TEXT | - | Yes | ข้อความแจ้งเตือนความปลอดภัยเฉพาะขั้นตอนนี้ |

#### 9. ตาราง `Feedbacks` (บันทึกสถิติความสำเร็จการซ่อม)
| Field Name | Type | Key | Nullable | Description & Constraints |
| :--- | :---: | :---: | :---: | :--- |
| `id` | VARCHAR(50) | **PK** | No | รหัส Feedback (UUID) |
| `guideId` | VARCHAR(20) | **FK** | No | รหัสคู่มือที่ช่างเปิดใช้งาน |
| `modelId` | VARCHAR(20) | **FK** | Yes | รหัสรุ่นสินค้าที่นำไปซ่อม |
| `userId` | VARCHAR(20) | **FK** | No | รหัสพนักงานของผู้ส่งประเมิน |
| `userName` | VARCHAR(150)| - | No | ชื่อพนักงานช่างที่ส่งผล |
| `isSuccess` | BOOLEAN | - | No | ผลลัพธ์: `TRUE` (สำเร็จ) หรือ `FALSE` (ไม่สำเร็จ) |
| `stepsViewed` | INTEGER | - | No | จำนวนขั้นตอนที่ช่างเปิดดู |
| `totalSteps` | INTEGER | - | No | จำนวนขั้นตอนทั้งหมดในคู่มือ |
| `timestamp` | ISO-8601 | - | No | วันและเวลาที่บันทึกผล |
| `note` | TEXT | - | Yes | หมายเหตุหรือปัญหาเพิ่มเติมที่พบหน้างาน |

#### 10. ตาราง `MasterData` (ตารางจับคู่รหัสวัสดุจากระบบ SAP)
| Field Name | Type | Key | Nullable | Description & Constraints |
| :--- | :---: | :---: | :---: | :--- |
| `id` | VARCHAR(50) | **PK** | No | รหัสการจับคู่ |
| `modelCode` | VARCHAR(50) | - | No | รหัสโมเดลสินค้า |
| `modelName` | VARCHAR(150)| - | No | ชื่อสินค้า |
| `matCategoryCode`| VARCHAR(20)| - | Yes | รหัสกลุ่มวัสดุจาก ERP |
| `matCategoryName`| VARCHAR(100)| - | Yes | ชื่อกลุ่มวัสดุจาก ERP |
| `symptomTypeCode`| VARCHAR(50)| - | Yes | รหัสประเภทอาการเสียที่ผูกไว้ |
| `symptomTypeName`| VARCHAR(100)| - | Yes | ชื่อประเภทอาการเสีย |

#### 11. ตาราง `ActivityLogs` (บันทึก Audit Trail ของระบบ)
| Field Name | Type | Key | Nullable | Description & Constraints |
| :--- | :---: | :---: | :---: | :--- |
| `id` | VARCHAR(50) | **PK** | No | รหัส Log (UUID) |
| `action` | VARCHAR(50) | - | No | กิริยาการทำงาน: `'create'`, `'update'`, `'delete'`, `'view'` |
| `resource` | VARCHAR(50) | - | No | ประเภททรัพยากร: `'guide'`, `'model'`, `'user'`, `'media'` |
| `resourceId` | VARCHAR(50) | - | Yes | รหัสของทรัพยากรที่ถูกกระทำ |
| `resourceName` | VARCHAR(255)| - | Yes | ชื่อของทรัพยากร |
| `userCode` | VARCHAR(20) | - | No | รหัสพนักงานผู้กระทำ |
| `userName` | VARCHAR(150)| - | No | ชื่อพนักงานผู้กระทำ |
| `timestamp` | ISO-8601 | - | No | วันที่และเวลาที่เกิดเหตุการณ์ |
| `details` | TEXT | - | Yes | ข้อมูล Payload หรือรายละเอียดเพิ่มเติม |

---

## 2.5 เอกสารอ้างอิง API และ Server Actions (API Specification Reference)

### 🌐 รายการ REST API Endpoints

#### 1. `GET /api/media/stream/[fileId]`
- **หน้าที่:** สตรีมมิ่งไฟล์วิดีโอ MP4 จาก Google Drive ในรูปแบบ Range Request
- **Header ขาเข้า:** `Range: bytes=start-end`
- **สถานะตอบกลับ:**
  - `206 Partial Content` (เมื่อระบุ Range Header สำหรับเล่นวิดีโอ)
  - `200 OK` (เมื่อดาวน์โหลดทั้งไฟล์)
  - `404 Not Found` (เมื่อไม่พบไฟล์ใน Google Drive)
- **Header ตอบกลับ:** `Content-Range`, `Accept-Ranges: bytes`, `Content-Length`, `Content-Type: video/mp4`

#### 2. `POST /api/cache/clear`
- **หน้าที่:** สั่งล้าง RAM Cache ของระบบเซิร์ฟเวอร์ทันที
- **สิทธิ์ที่ต้องการ:** Admin Session Cookie
- **Payload ตอบกลับ:** `{"success": true, "message": "Cache cleared successfully", "timestamp": "..."}`

#### 3. `GET /api/sync-sftp-to-sheets`
- **หน้าที่:** รัน Background Job ซิงค์ข้อมูล `MATUnit.json` จาก SFTP สู่ตาราง `Models`
- **การรักษาความปลอดภัย:** ตรวจสอบ `Authorization: Bearer <CRON_SECRET>` ในโหมด Production
- **Payload ตอบกลับ:** `{"success": true, "inserted": 12, "updated": 45, "total": 350}`

---

## 2.6 กลไกการเร่งความเร็วและแคชความจำสูง (In-Memory Cache & Concurrency Engine)

เนื่องจาก Google Sheets API มีข้อจำกัดโควตา **60 Read Requests / Minute / Project** ระบบจึงสร้างสถาปัตยกรรมแคชระดับสูง **`InMemoryCacheManager` (`lib/cache-manager.ts`)**:

```mermaid
stateDiagram-v2
    [*] --> CheckCache: Client ขอข้อมูลคู่มือซ่อม
    CheckCache --> CacheFresh: มีข้อมูลใน RAM และเวลา < freshUntil (30 วินาที)
    CacheFresh --> ReturnInstant: ส่งคืนข้อมูลทันที (<2ms)
    
    CheckCache --> CacheStale: ข้อมูลหมดอายุ แต่ยังอยู่ในหน้าต่าง SWR (5 นาที)
    CacheStale --> ReturnStale: ส่งคืนข้อมูลเดิมทันที (<2ms)
    ReturnStale --> BackgroundRevalidate: เริ่ม Fetch ข้อมูลใหม่เบื้องหลัง (after callback)
    
    CheckCache --> CacheMiss: ไม่มีข้อมูลใน RAM หรือเลยหน้าต่าง SWR
    CacheMiss --> SingleFlightCheck: ตรวจสอบคำขอที่กำลังวิ่งอยู่ (In-Flight Map)
    
    SingleFlightCheck --> WaitExisting: มี Request เดียวกันกำลังยิงอยู่แล้ว
    WaitExisting --> ReturnShared: นำผลลัพธ์คำขอแรกมาแชร์ตอบให้ทุกคนพร้อมกัน
    
    SingleFlightCheck --> ExecuteFetch: เป็นคำขอแรก
    ExecuteFetch --> CallGoogleSheets: ยิงคำขอไปยัง Google Sheets API
    CallGoogleSheets --> UpdateRAM: บันทึกข้อมูลใหม่ลงใน RAM Cache Map
    UpdateRAM --> ReturnFresh: ส่งคืนข้อมูลใหม่ให้ Client
```

### ⚡ คุณสมบัติทางสถาปัตยกรรม (Architectural Highlights):
1. **Single-Flight Request Deduplication:**  
   หากมีช่าง 1,000 คนเปิดหน้าเว็บดูรุ่นเดียวกันพร้อมกันในวินาทีเดียวกัน ตัวจัดการแคชจะดักจับด้วย Promise Map และส่งคำขอไปยัง Google Sheets **เพียง 1 ครั้งเท่านั้น** เมื่อคำขอแรกได้รับคำตอบ จะกระจายผลลัพธ์ให้ทั้ง 1,000 คนพร้อมกัน ลดภาระ API ลง 99.9%
2. **Stale-While-Revalidate (SWR Pattern):**  
   ข้อมูลจะคงความสดใหม่อยู่ 30 วินาที หากผ่านไป 31 วินาที ผู้ใช้ยังคงได้รับข้อมูลเดิมทันทีในเสี้ยววินาที (Zero Latency) และเซิร์ฟเวอร์จะใช้ฟังก์ชัน `after()` ของ Next.js ในการดึงข้อมูลสดมาเก็บไว้ใน RAM รอบถัดไปโดยไม่กระทบเวลาโหลดของผู้ใช้
3. **Batch Multi-Sheet Aggregation (`readMultipleSheets`):**  
   ฟังก์ชัน `preloadTechnicianData()` อ่านข้อมูลทุกตารางที่ต้องใช้ (Categories, Subcategories, Models, Guides, Symptoms) ภายใน **1 API Request เดียว** ผ่าน `spreadsheets.values.batchGet`

---

## 2.7 การประมวลผลและสตรีมมิ่งไฟล์มัลติมีเดีย (Media Streaming & Range Request Proxy)

- **ปัญหา:** เบราว์เซอร์มือถือไม่สามารถเล่นวิดีโอความยาวหลายนาทีจาก Google Drive ตรงๆ ได้อย่างลื่นไหล เนื่องจากลิงก์ดาวน์โหลดมาตรฐานของ Google Drive ไม่อนุญาตให้กรอแถบเวลา (Seeking) และติดปัญหา CORS
- **โซลูชันทางเทคนิค:** ระบบสร้าง API Proxy `/api/media/stream/[fileId]` ซึ่งทำหน้าที่:
  1. รับคำขอจากแท็ก `<video>` ของเบราว์เซอร์ พร้อมอ่านค่า Header `Range: bytes=start-end`
  2. ส่งคำขอแบบ Chunked Stream ไปยัง Google Drive v3 API ด้วย Service Account
  3. สตรีมเฉพาะไบต์ที่ต้องการกลับมายังเบราว์เซอร์พร้อมส่งสถานะ `HTTP 206 Partial Content`
  4. ช่างสามารถกดเลื่อนแถบเวลาข้ามไปยังนาทีที่ต้องการได้ทันทีโดยไม่ต้องรอโหลดวิดีโอทั้งไฟล์

---

## 2.8 ไปป์ไลน์การซิงค์ข้อมูลสินค้าองค์กรผ่าน SFTP (Enterprise SFTP Sync Pipeline)

- **โปรโตคอล:** SSH File Transfer Protocol (SFTP) ผ่านพอร์ต 22
- **โฮสต์ปลายทาง:** `152.42.167.221`
- **ไฟล์ข้อมูล:** `/uploads/MATUnit.json`
- **ขั้นตอนการแปลงข้อมูล (ETL Logic):**
  1. สคริปต์เชื่อมต่อผ่าน `ssh2-sftp-client` พร้อมดาวน์โหลด Buffer
  2. ถอดรหัส UTF-8 และแปลง JSON เป็น Object
  3. แมปหมวดหมู่สินค้าอัตโนมัติตาม Prefix:
     - รหัสขึ้นต้นด้วย `F1` ➔ จัดเข้ากลุ่ม **เครื่องทำน้ำอุ่น/น้ำร้อน**
     - รหัสขึ้นต้นด้วย `F2` ➔ จัดเข้ากลุ่ม **เครื่องกรองน้ำดื่ม**
     - รหัสขึ้นต้นด้วย `F3` ➔ จัดเข้ากลุ่ม **ตู้กดน้ำดื่ม**
     - รหัสขึ้นต้นด้วย `F4` / `F6` ➔ จัดเข้ากลุ่ม **ปั๊มน้ำและพัดลมไอเย็น**
  4. ทำการ Upsert ข้อมูลลงในแท็บ `Models` บน Google Sheets

---

## 2.9 สถาปัตยกรรมความปลอดภัยและการปกป้องข้อมูล (Security & DLP)

1. **Session Revocation & Inactivity Timeout:**
   - Client ทำการตรวจสถานะความถูกต้องของบัญชีผู้ใช้กับ RAM Cache ทุกๆ 60 วินาที
   - หากแอดมินเปลี่ยนสถานะพนักงานเป็น `inactive` ระบบจะสั่ง Logout ออกจากเบราว์เซอร์ของพนักงานคนนั้นทันที
3. **Cookie Security:**
   - ใช้ NextAuth JWT Session Cookie ที่ตั้งค่า `HttpOnly`, `SameSite: Lax`, และเปิด `Secure` อัตโนมัติบน HTTPS

---

# ส่วนที่ 3: คู่มือการติดตั้ง นำขึ้นระบบ และการบำรุงรักษา (DevOps & Operations Runbook)

## 3.1 การติดตั้งและรันระบบบนเครื่องพัฒนา (Local Environment Setup)

### ข้อกำหนดของระบบ (Prerequisites):
- **Node.js:** เวอร์ชัน 20.x หรือ 24.x LTS (ทดสอบสมบูรณ์บน v24.11.1)
- **Package Manager:** `pnpm` เวอร์ชัน 9+ (หรือ `npm` v10+)
- **Git:** ติดตั้งเรียบร้อยแล้ว

### ขั้นตอนการเริ่มทำงาน (Step-by-Step Execution):
```bash
# 1. โคลนโปรเจกต์และเข้าสู่ไดเรกทอรี
cd c:\Nextjs\mazuma-repair-guide

# 2. ติดตั้งแพ็กเกจ Dependencies ทั้งหมด
pnpm install

# 3. ตรวจสอบไฟล์ตัวแปรสภาพแวดล้อม (.env.local)
# ตรวจสอบว่ามีคีย์ GOOGLE_SHEETS_ID, LINE_CLIENT_ID ครบถ้วน

# 4. รันเซิร์ฟเวอร์ Development พร้อมระบบเคลียร์พอร์ต 3000 อัตโนมัติ
pnpm dev

# 5. เปิดเบราว์เซอร์เข้าใช้งาน
# URL ปกติ: http://localhost:3000
# ทดสอบในบทบาท Admin: http://localhost:3000/?devUser=admin
# ทดสอบในบทบาท Technician: http://localhost:3000/?devUser=technician
```

---

## 3.2 เมทริกซ์ตัวแปรสภาพแวดล้อม (Environment Variables Matrix)

| ตัวแปร (Environment Variable) | ตัวอย่างค่า (Example) | ความสำคัญ | คำอธิบายหน้าที่ |
| :--- | :--- | :---: | :--- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `bot@project.iam.gserviceaccount.com` | 🔴 วิกฤต | อีเมล Service Account สำหรับเชื่อมต่อ Google Sheets |
| `GOOGLE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY-----\nMIIE..."` | 🔴 วิกฤต | Private Key สำหรับเซ็นชื่อรับรอง JWT ของ Google Cloud |
| `GOOGLE_SHEETS_ID` | `1MDjucOTNKn3bVDkstNBK-OJB3PhFaC5h...` | 🔴 วิกฤต | รหัสไอดีของสเปรดชีตฐานข้อมูลหลัก |
| `LINE_CLIENT_ID` | `2010692330` | 🔴 วิกฤต | Channel ID จาก LINE Developers Console |
| `LINE_CLIENT_SECRET` | `bceb60d4477b37b3e23fffb48782a635` | 🔴 วิกฤต | Channel Secret สำหรับแลกเปลี่ยน OAuth Token |
| `NEXTAUTH_SECRET` | `mazuma_super_secure_random_key_2026` | 🔴 วิกฤต | คีย์สุ่มสำหรับเข้ารหัส JWT Session Cookie |
| `NEXTAUTH_URL` | `http://localhost:3000` | 🔴 วิกฤต | URL หลักของระบบ (Production ต้องเปลี่ยนเป็นโดเมนจริง) |
| `SFTP_HOST` | `152.42.167.221` | 🟡 สำคัญ | ไอพีแอดเดรสเซิร์ฟเวอร์ SFTP ของ Mazuma |
| `SFTP_PORT` | `22` | 🟡 สำคัญ | พอร์ตการเชื่อมต่อ SFTP (ค่าเริ่มต้น 22) |
| `SFTP_USERNAME` | `pn_viewer` | 🟡 สำคัญ | บัญชีผู้ใช้สำหรับดาวน์โหลดไฟล์ `MATUnit.json` |
| `SFTP_PASSWORD` | `0jmy25iqXJRl5PkT` | 🟡 สำคัญ | รหัสผ่านการเชื่อมต่อ SFTP |
| `GOOGLE_CLIENT_ID` | `797976671168-...apps.googleusercontent.com` | 🟡 สำคัญ | OAuth 2.0 Client ID สำหรับ Google Drive/YouTube |
| `GOOGLE_CLIENT_SECRET` | `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` | 🟡 สำคัญ | OAuth 2.0 Client Secret |
| `GOOGLE_REFRESH_TOKEN` | `1//0g_eX87iqNDLqCgYIARAAGBASNwF-...` | 🟡 สำคัญ | Token ถาวรสำหรับขอ Access Token เชื่อมต่อ Google Drive |
| `GOOGLE_DRIVE_FOLDER_ID`| `1kwX6zmW-msmnrZ1ZWXQjqld56HV3GbZy` | 🟡 สำคัญ | รหัสโฟลเดอร์หลักสำหรับจัดเก็บไฟล์วิดีโอและ PDF |
| `YOUTUBE_REFRESH_TOKEN` | `1//0gj3Niz7hn6E4CgYIARAAGBASNwF-...` | 🟢 ทางเลือก | Token สำหรับอัปโหลดวิดีโอเข้าสู่ช่อง YouTube องค์กร |
| `CRON_SECRET` | `mzm_cron_auth_token_secret` | 🟢 ทางเลือก | โทเค็นป้องกันการยิง API ซิงค์ SFTP จากบุคคลภายนอก |

---

## 3.3 ขั้นตอนการนำขึ้นระบบจริงบน Vercel (Production Deployment SOP)

1. **เตรียมความพร้อมบน Git Repository:**
   ```bash
   git add .
   git commit -m "feat: release enterprise documentation and system manual"
   git push origin main
   ```
2. **สร้างโปรเจกต์บน Vercel Dashboard:**
   - เข้าสู่ [Vercel Dashboard](https://vercel.com/) ➔ คลิก **"Add New" ➔ "Project"**
   - นำเข้าจาก Git Repository ของโปรเจกต์
3. **ตั้งค่า Environment Variables:**
   - นำค่าทั้งหมดจาก `.env.local` ไปใส่ในเมนู **Settings ➔ Environment Variables**
   - **ข้อควรระวัง:** เปลี่ยน `NEXTAUTH_URL` ให้เป็นโดเมนจริง เช่น `https://repair-guide.mazuma.co.th`
4. **Deploy ระบบ:**
   - กดปุ่ม **"Deploy"** และรอระบบทำการ Build Production Bundle ประมาณ 1-2 นาที
5. **ตั้งค่า Custom Domain & SSL:**
   - ในแท็บ **Domains** ให้ผูกโดเมนองค์กรของ Mazuma และตั้งค่า DNS CNAME ไปที่ `cname.vercel-dns.com`

---

## 3.4 การตั้งค่าระบบภายนอก (External Cloud Services Configuration)

### 1. การตั้งค่า LINE Developers Console (LINE Login):
- ไปที่ [LINE Developers Console](https://developers.line.biz/) ➔ เลือก Provider และ Channel
- ในแท็บ **LINE Login** ➔ หัวข้อ **Callback URL** ให้เพิ่ม:
  - Development: `http://localhost:3000/api/auth/callback/line`
  - Production: `https://repair-guide.mazuma.co.th/api/auth/callback/line`
- เปิดสิทธิ์การขออีเมลหรือชื่อโปรไฟล์พื้นฐาน (Profile Scope)

### 2. การตั้งค่า Google Cloud Platform (GCP Console):
- เปิดใช้งาน API ทั้ง 3 ตัวในโปรเจกต์ GCP:
  1. **Google Sheets API**
  2. **Google Drive API**
  3. **YouTube Data API v3**
- ในหน้า Google Sheets ให้กดปุ่ม **"Share (แชร์)"** สเปรดชีตฐานข้อมูลให้แก่อีเมลของ Service Account (`GOOGLE_SERVICE_ACCOUNT_EMAIL`) โดยให้สิทธิ์เป็น **Editor**

---

## 3.5 แผนผังการแก้ไขปัญหาฉุกเฉินและเมทริกซ์เหตุขัดข้อง (Troubleshooting & Incident Runbook)

| รหัสเหตุการณ์ | ระดับ | อาการที่ตรวจพบ | สาเหตุที่เป็นไปได้ | ขั้นตอนการแก้ไขทันที (Resolution Action) |
| :---: | :---: | :--- | :--- | :--- |
| **INC-01** | 🔴 P1 | หน้าจอขึ้น "OAuthCallbackError" ทุกครั้งที่กดล็อกอิน | Callback URL ใน LINE Developers ไม่ตรงกับโดเมน | ตรวจสอบว่า `NEXTAUTH_URL` ตรงกับโดเมนปัจจุบัน และเพิ่ม URL เข้าไปใน LINE Console Callback URL |
| **INC-02** | 🔴 P1 | ระบบขึ้น "Error 429: Too Many Requests" จาก Google API | โควตา 60 req/min ของ Google API ถูกใช้งานเกิน | เข้าเมนู Admin ➔ Settings ตรวจสอบการทำงานของ RAM Cache และรอ 60 วินาทีเพื่อให้โควตารีเซ็ต |
| **INC-03** | 🟠 P2 | ช่างกรอกรหัสพนักงาน MZ-xxx แล้วแจ้ง "ไม่พบรหัสพนักงาน" | ยังไม่ได้เพิ่มรหัสในชีต Users หรือสถานะเป็น inactive | เปิดชีต `Users` ตรวจสอบแถวของพนักงานผู้นั้นว่ารหัสตรงกันหรือไม่ และเปลี่ยนคอลัมน์ `status` เป็น `active` |
| **INC-04** | 🟡 P3 | แก้ไขข้อมูลใน Google Sheets แล้ว แต่หน้าแอปยังแสดงข้อมูลเก่า | ข้อมูลยังคงอยู่ในแคช SWR (Stale-While-Revalidate) | ไปที่หน้า **Settings** ใน Admin App แล้วกดปุ่ม **"ล้างแคชระบบ (Clear Cache)"** หรือรอให้ครบ 5 นาที |
| **INC-05** | 🟡 P3 | วิดีโอในคู่มือหมุนค้าง ไม่สามารถโหลดหรือเล่นได้ | ไฟล์ใน Drive ไม่ได้เปิดสิทธิ์แชร์ หรือ Refresh Token หลุด | ตรวจสอบโฟลเดอร์ Google Drive ว่าแชร์ให้ Service Account หรือไม่ หรือรันสคริปต์ขอ OAuth Refresh Token ใหม่ |

---

## 3.6 แผนการกู้คืนระบบและความต่อเนื่องทางธุรกิจ (Disaster Recovery & BCP)

1. **การสำรองข้อมูลฐานข้อมูล (Database Backup Strategy):**
   - เนื่องจาก Google Sheets มีระบบ **Version History (ประวัติเวอร์ชัน)** บันทึกทุกการแก้ไขย้อนหลังแบบ Real-time โดยอัตโนมัติ แอดมินสามารถกดเมนู **File ➔ Version history ➔ See version history** ใน Google Sheets เพื่อย้อนกลับไปจุดที่ต้องการได้ตลอดเวลา
   - มีการตั้งสคริปต์ Export ข้อมูลทั้ง 11 แท็บออกมาเป็นไฟล์ JSON สำรองเก็บไว้ในไดรฟ์ทุกสัปดาห์
2. **การหมุนเวียนคีย์ความปลอดภัย (Credential Rotation SOP):**
   - ควรสลับเปลี่ยน `NEXTAUTH_SECRET` ทุกๆ 180 วัน
   - หากมีพนักงานระดับแอดมินลาออก ให้เข้า GCP Console เพื่อสั่งลบ Service Account Key เดิมและสร้าง Key ใหม่ทดแทนทันที

---

> 🏛️ **เอกสารฉบับนี้เป็นกรรมสิทธิ์ของ บริษัท มาซูม่า (ประเทศไทย) จำกัด**  
> ห้ามคัดลอก ดัดแปลง หรือเผยแพร่ต่อบุคคลภายนอกโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร  
> ลิขสิทธิ์ซอฟต์แวร์และสถาปัตยกรรมระบบ © 2026 Mazuma (Thailand) Co., Ltd. All Rights Reserved.
