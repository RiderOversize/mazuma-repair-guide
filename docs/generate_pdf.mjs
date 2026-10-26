import fs from 'fs';
import path from 'path';
import { spawn, execFileSync } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mdPath = path.join(__dirname, 'MAZUMA_REPAIR_GUIDE_MANUAL.md');
const htmlPath = path.join(__dirname, 'MAZUMA_REPAIR_GUIDE_MANUAL.html');
const pdfPath = path.join(__dirname, 'MAZUMA_REPAIR_GUIDE_MANUAL.pdf');
const imagesDir = path.join(__dirname, 'images');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatInline(text) {
  if (!text) return '';
  // Status badges
  text = text.replace(/`'active'`/g, '<span class="badge badge-success">ACTIVE</span>');
  text = text.replace(/`'inactive'`/g, '<span class="badge badge-danger">INACTIVE</span>');
  text = text.replace(/`'discontinued'`/g, '<span class="badge badge-warning">DISCONTINUED</span>');
  text = text.replace(/`'published'`/g, '<span class="badge badge-primary">PUBLISHED</span>');
  text = text.replace(/`'draft'`/g, '<span class="badge badge-slate">DRAFT</span>');
  text = text.replace(/`'Critical'`/g, '<span class="badge badge-critical">CRITICAL</span>');
  text = text.replace(/`'High'`/g, '<span class="badge badge-high">HIGH</span>');
  text = text.replace(/`'Medium'`/g, '<span class="badge badge-medium">MEDIUM</span>');
  text = text.replace(/`'Low'`/g, '<span class="badge badge-low">LOW</span>');

  // Keys
  text = text.replace(/\*\*PK\*\*/g, '<span class="badge badge-pk">PK</span>');
  text = text.replace(/\*\*FK\*\*/g, '<span class="badge badge-fk">FK</span>');

  // Markdown links [label](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
    if (url.startsWith('#')) {
      return `<a href="${url}" class="doc-link anchor-link">${label}</a>`;
    }
    return `<a href="${url}" class="doc-link external-link" target="_blank">${label} <span class="ext-icon">↗</span></a>`;
  });

  // Bold **text**
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic *text*
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Inline code `text`
  text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  return text;
}

// =============================================================================
// SCREENSHOT SPECIFICATION REGISTRY (12 จุดภาพหน้าจอ)
// =============================================================================
const SCREENSHOT_CONFIG = [
  {
    id: 1,
    filename: '01_login_view.png',
    code: 'รูปที่ 1.3-1',
    title: 'หน้าจอเข้าสู่ระบบหลัก (LoginView)',
    view: 'components/login-view.tsx',
    urlPath: 'http://localhost:3000/login',
    device: 'Mobile PWA View / Desktop View',
    aspect: '9:19.5 (Mobile) หรือ 16:9 (Desktop)',
    resolution: '1170 × 2532 หรือ 1920 × 1080',
    caption: 'หน้าจอเข้าสู่ระบบหลัก แสดงโลโก้ Mazuma และปุ่มเชื่อมต่อบัญชี LINE Official',
    description: 'หน้าจอเข้าสู่ระบบหลัก สไตล์ Glassmorphism แสดงโลโก้ Mazuma และปุ่มสีเขียว "เข้าสู่ระบบด้วย LINE"'
  },
  {
    id: 2,
    filename: '02_employee_bind_view.png',
    code: 'รูปที่ 1.3-2',
    title: 'หน้าจอผูกบัญชีความปลอดภัย 2FA (EmployeeBindView)',
    view: 'components/employee-bind-view.tsx',
    urlPath: 'http://localhost:3000/bind',
    device: 'Mobile PWA View',
    aspect: '9:19.5 (Mobile) หรือ 16:9',
    resolution: '1170 × 2532 หรือ 1920 × 1080',
    caption: 'หน้าจอผูกบัญชีความปลอดภัยครั้งแรก (Two-Factor Identity Binding) ป้องกันการสวมสิทธิ์',
    description: 'ช่องกรอกรหัสพนักงาน (MZ-xxx) และเบอร์โทรศัพท์ 10 หลัก พร้อมปุ่มกดยืนยันการผูกบัญชีความปลอดภัย'
  },
  {
    id: 3,
    filename: '03_technician_home.png',
    code: 'รูปที่ 1.4-1',
    title: 'หน้าหลักช่างเทคนิคภาคสนาม (TechnicianHome)',
    view: 'components/technician/technician-home.tsx',
    urlPath: 'http://localhost:3000 (Technician Role)',
    device: 'Mobile PWA View',
    aspect: '9:19.5 (Mobile)',
    resolution: '1170 × 2532 หรือ 1080 × 2340',
    caption: 'หน้าหลัก TechnicianHome แสดงช่องค้นหาด่วน แท็บเลือกหมวดหมู่ และการ์ดสถานะสินค้า',
    description: 'แถบค้นหาด่วน Universal Search, แท็บหมวดหมู่ 4 แท็บ, และการ์ดกลุ่มผลิตภัณฑ์'
  },
  {
    id: 4,
    filename: '05_guide_wizard.png',
    code: 'รูปที่ 1.4-2',
    title: 'ตัวช่วยซ่อมทีละขั้นตอน (Step-by-Step GuideWizard)',
    view: 'components/technician/guide-wizard.tsx',
    urlPath: 'TechnicianHome -> เลือกรุ่น -> เลือกอาการเสีย',
    device: 'Mobile PWA View',
    aspect: '9:19.5 (Mobile)',
    resolution: '1170 × 2532 หรือ 1080 × 2340',
    caption: 'หน้าจอตัวช่วยซ่อมแบบ Step-by-Step พร้อมวิดีโอสาธิต แผนภาพประกอบ และรายการเครื่องมือ',
    description: 'ชื่ออาการเสีย, วิดีโอคลิปสาธิต, รายการเครื่องมือช่างที่ต้องใช้, และปุ่มเลื่อนขั้นตอน Step 1 of X'
  },
  {
    id: 5,
    filename: '06_tech_tools_modal.png',
    code: 'รูปที่ 1.4-3',
    title: 'กล่องเครื่องมือช่างและเครื่องคิดเลขวิศวกรรม (TechToolsModal)',
    view: 'components/technician/tech-tools-modal.tsx',
    urlPath: 'TechnicianHome -> แตะไอคอนเครื่องคิดเลข/ประแจ',
    device: 'Popup Dialog View',
    aspect: '4:3 หรือ 16:9',
    resolution: '1200 × 900 หรือ 1920 × 1080',
    caption: 'ป๊อปอัปเครื่องมือคำนวณทางวิศวกรรมไฟฟ้าและประปา ช่วยให้ช่างหน้างานตรวจสอบมาตรฐานความปลอดภัย',
    description: 'แท็บคำนวณสายไฟและเบรกเกอร์ (วัตต์ -> แอมป์ -> ขนาดสาย/เบรกเกอร์) และแท็บแปลงหน่วยแรงดันน้ำ Bar/PSI'
  },
  {
    id: 6,
    filename: '07_feedback_escalation.png',
    code: 'รูปที่ 1.4-4',
    title: 'หน้าต่างส่งบันทึกผลการซ่อมและสายด่วนหัวหน้าช่าง (Feedback Modal)',
    view: 'components/technician/guide-wizard.tsx (Finish Step)',
    urlPath: 'GuideWizard -> กดทำครบทุกขั้นตอนจนจบ',
    device: 'Mobile Modal View',
    aspect: '9:19.5 หรือ 3:4',
    resolution: '1170 × 2532 หรือ 900 × 1200',
    caption: 'หน้าต่างประเมินผลการซ่อมแซม พร้อมระบบติดต่อหัวหน้าช่างด่วนกรณีเกิดปัญหาติดขัดหน้างาน',
    description: 'ปุ่ม Thumbs Up (สำเร็จ) / Thumbs Down (ไม่สำเร็จ), ช่องระบุหมายเหตุ, และรายชื่อหัวหน้าช่างพร้อมปุ่มโทรออก'
  },
  {
    id: 7,
    filename: '07_5_admin_switch.png',
    code: 'รูปที่ 1.5-1',
    title: 'เมนูสลับโหมดผู้ดูแลระบบ (Admin Mode Switch)',
    view: 'Profile Dropdown',
    urlPath: 'Profile Menu',
    device: 'Mobile / Desktop View',
    aspect: '16:9',
    resolution: '1920 × 1080',
    caption: 'การสลับเข้าสู่โหมดผู้ดูแลระบบ (Admin Mode) สำหรับหัวหน้าช่างที่ได้รับสิทธิ์',
    description: 'เมนูโปรไฟล์มุมขวาบน และปุ่มสลับไปหน้าผู้ดูแลระบบ'
  },
  {
    id: 8,
    filename: '08_admin_dashboard.png',
    code: 'รูปที่ 1.6-1',
    title: 'แดชบอร์ดสถิติผู้บริหารแบบ Real-Time (AdminDashboard)',
    view: 'components/admin/admin-dashboard.tsx',
    urlPath: 'http://localhost:3000 (Admin Role) -> เมนู Dashboard',
    device: 'Desktop Browser (16:9)',
    aspect: '16:9 (Desktop Browser)',
    resolution: '1920 × 1080 (Full HD)',
    caption: 'แดชบอร์ดมอนิเตอร์ภาพรวมระบบ แสดงสถิติ KPI อัตราความสำเร็จ และการใช้งานของช่างเทคนิคแบบ Real-time',
    description: 'การ์ดสถิติ 4 ใบ, กราฟ Top Models, และตาราง Feedback'
  },
  {
    id: 9,
    filename: '09_guides_management.png',
    code: 'รูปที่ 1.6-2',
    title: 'การบริหารจัดการคู่มือและรุ่นสินค้า (GuidesManagement)',
    view: 'components/admin/guides-management.tsx',
    urlPath: 'Admin Backoffice -> เมนู Guides',
    device: 'Desktop Browser (16:9)',
    aspect: '16:9 (Desktop Browser)',
    resolution: '1920 × 1080 (Full HD)',
    caption: 'หน้ารายการโมเดลและการเชื่อมโยงคู่มือซ่อม แสดงป้ายสถานะ Discontinued Ribbon ชัดเจน',
    description: 'รายการรุ่นสินค้า, ตัวกรองสถานะ, ป้ายสถานะ Discontinued Ribbon, และแบนเนอร์สินค้ายังไม่จับคู่'
  },
  {
    id: 10,
    filename: '10_master_data_drilldown.png',
    code: 'รูปที่ 1.6-3',
    title: 'การจัดการโครงสร้างข้อมูลหลัก 5 ระดับ (MasterData Drill-Down)',
    view: 'components/admin/master-data.tsx',
    urlPath: 'Admin Backoffice -> เมนู Master Data',
    device: 'Desktop Browser (16:9)',
    aspect: '16:9 (Desktop Browser)',
    resolution: '1920 × 1080 (Full HD)',
    caption: 'หน้าจัดการข้อมูลหลักแบบ Drill-Down 5 ระดับ พร้อมโปรแกรมแก้ไขขั้นตอนการซ่อมและอัปโหลดสื่อ',
    description: 'Breadcrumb นำทาง 5 ระดับ, รายการสเต็ป, และปุ่มอัปโหลดสื่อ'
  },
  {
    id: 11,
    filename: '11_media_library.png',
    code: 'รูปที่ 1.6-4',
    title: 'คลังสื่อดิจิทัลและการสตรีมมิ่ง (MediaLibrary)',
    view: 'components/admin/media-library.tsx',
    urlPath: 'Admin Backoffice -> เมนู Media',
    device: 'Desktop Browser (16:9)',
    aspect: '16:9 (Desktop Browser)',
    resolution: '1920 × 1080 (Full HD)',
    caption: 'คลังสื่อดิจิทัล Media Library เชื่อมต่อ Google Drive และ YouTube พร้อมพรีวิวในตัว',
    description: 'โฟลเดอร์ Google Drive, การ์ดแสดงไฟล์วิดีโอ/PDF ในมุมมองการ์ด, แถบพื้นที่จัดเก็บ, และปุ่มอัปโหลด'
  },
  {
    id: 12,
    filename: '12_user_management.png',
    code: 'รูปที่ 1.6-5',
    title: 'การบริหารจัดการผู้ใช้งานและสิทธิ์รายเมนู (User & RBAC Management)',
    view: 'components/admin/user-management.tsx',
    urlPath: 'Admin Backoffice -> เมนู Users',
    device: 'Desktop Browser (16:9)',
    aspect: '16:9 (Desktop Browser)',
    resolution: '1920 × 1080 (Full HD)',
    caption: 'หน้าจอการบริหารจัดการผู้ใช้งาน การมอบหมายหัวหน้าช่าง และการกำหนดสิทธิ์แบบรายเมนู',
    description: 'ตารางรายชื่อพนักงาน, บทบาท, สถานะ, บอร์ดสิทธิ์รายเมนู, และหน้าต่างแก้ไขข้อมูล'
  },
  {
    id: 13,
    filename: '13_settings_management.png',
    code: 'รูปที่ 1.6-6',
    title: 'การตั้งค่าระบบและการล้างหน่วยความจำแคช (SettingsManagement)',
    view: 'components/admin/settings-management.tsx',
    urlPath: 'Admin Backoffice -> เมนู Settings',
    device: 'Desktop Browser (16:9)',
    aspect: '16:9 (Desktop Browser)',
    resolution: '1920 × 1080 (Full HD)',
    caption: 'หน้าจอตั้งค่าระบบ การปรับแต่งฟอนต์ และปุ่มควบคุมการล้าง RAM Cache',
    description: 'การตั้งค่าธีม Dark/Light, การปรับขนาดตัวอักษร, และปุ่มสั่งล้างหน่วยความจำแคช'
  }
];

function findExistingImage(filename) {
  const baseName = filename.replace(/\.[^.]+$/, '');
  const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
  for (const ext of extensions) {
    const candidate = path.join(imagesDir, baseName + ext);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function renderScreenshotElement(index, fallbackDesc, captionText) {
  const cfg = SCREENSHOT_CONFIG[index] || {
    id: index + 1,
    filename: `screenshot_${index + 1}.png`,
    code: `รูปที่ ${index + 1}`,
    title: 'ภาพหน้าจอประกอบ',
    view: 'Mazuma Repair Guide',
    urlPath: 'http://localhost:3000',
    device: 'Web Screen',
    aspect: '16:9',
    resolution: '1920 × 1080',
    caption: captionText || fallbackDesc,
    description: fallbackDesc
  };

  const finalCaption = captionText || cfg.caption;
  const imagePath = findExistingImage(cfg.filename);

  if (imagePath) {
    // Real image exists -> Embed in stunning modern device frame
    const ext = path.extname(imagePath).slice(1).toLowerCase();
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : (ext === 'webp' ? 'image/webp' : 'image/png');
    const b64 = fs.readFileSync(imagePath).toString('base64');
    const dataUri = `data:${mime};base64,${b64}`;

    return `
    <figure class="screenshot-figure" style="page-break-inside: avoid; break-inside: avoid;">
      <div class="device-window-frame">
        <div class="window-titlebar">
          <div class="window-dots">
            <span class="wdot dot-red"></span>
            <span class="wdot dot-yellow"></span>
            <span class="wdot dot-green"></span>
          </div>
          <div class="window-url-bar">
            <span class="lock-icon">🔒</span>
            <span class="url-text">${escapeHtml(cfg.urlPath)}</span>
          </div>
          <div class="window-badge">${escapeHtml(cfg.device)}</div>
        </div>
        <div class="image-inner-box">
          <img src="${dataUri}" alt="${escapeHtml(cfg.title)}" class="device-screenshot-img" />
        </div>
      </div>
      <figcaption class="figure-caption">
        <span class="fig-badge">${escapeHtml(cfg.code)}:</span>
        <span class="fig-title">${escapeHtml(cfg.title)}</span> — ${escapeHtml(finalCaption)}
      </figcaption>
    </figure>\n`;
  }

  // Real image does not exist yet -> Render high-end blueprint card
  return `
  <div class="screenshot-blueprint-card" style="page-break-inside: avoid; break-inside: avoid;">
    <div class="blueprint-header">
      <div class="blueprint-header-left">
        <span class="blueprint-camera-icon">📸</span>
        <span class="blueprint-title">จุดระบุตำแหน่งแทรกภาพถ่ายหน้าจอจริง (SCREENSHOT BLUEPRINT)</span>
      </div>
      <div class="blueprint-badge-pending">🟡 รอไฟล์ภาพ (AWAITING CAPTURE)</div>
    </div>
    <div class="blueprint-body">
      <div class="blueprint-meta-grid">
        <div class="bmeta-item">
          <span class="bmeta-label">ชื่อไฟล์ที่ต้องบันทึก (FILE NAME):</span>
          <code class="bmeta-code">docs/images/${escapeHtml(cfg.filename)}</code>
        </div>
        <div class="bmeta-item">
          <span class="bmeta-label">หน้าจอเป้าหมาย (TARGET VIEW):</span>
          <span class="bmeta-val">${escapeHtml(cfg.view)}</span>
        </div>
        <div class="bmeta-item">
          <span class="bmeta-label">ความละเอียดแนะนำ (RESOLUTION):</span>
          <span class="bmeta-val">${escapeHtml(cfg.resolution)} (${escapeHtml(cfg.aspect)})</span>
        </div>
        <div class="bmeta-item">
          <span class="bmeta-label">ประเภทอุปกรณ์ (DEVICE FRAME):</span>
          <span class="bmeta-val">${escapeHtml(cfg.device)}</span>
        </div>
      </div>
      <div class="blueprint-desc-box">
        <div class="bdesc-title">🎯 องค์ประกอบที่ต้องแคปติดในภาพ:</div>
        <div class="bdesc-text">${escapeHtml(cfg.description)}</div>
      </div>
    </div>
    <div class="blueprint-footer">
      <span class="fig-badge-outline">${escapeHtml(cfg.code)}:</span>
      <span class="fig-caption-text">${escapeHtml(finalCaption)}</span>
    </div>
  </div>\n`;
}

// =============================================================================
// VISUAL DIAGRAM RENDERERS (VECTOR-STYLING)
// =============================================================================
function renderVisualArchitectureDiagram() {
  return `
  <div class="visual-diagram-card" style="page-break-inside: avoid; break-inside: avoid;">
    <div class="vdiagram-header">
      <span class="vdiagram-title">🏛️ ผังแสดงสถาปัตยกรรมระบบภาพรวม (HIGH-LEVEL SYSTEM ARCHITECTURE BLUEPRINT)</span>
      <span class="vdiagram-badge">SERVERLESS / SWR / ZERO-LATENCY</span>
    </div>
    <div class="vdiagram-body">
      <div class="vdiagram-grid">
        <!-- Layer 1: Clients -->
        <div class="vlayer-col">
          <div class="vlayer-title">1. EDGE CLIENT LAYER (PWA)</div>
          <div class="vbox vbox-client">📱 ช่างเทคนิค (Mobile PWA)</div>
          <div class="vbox vbox-client">📱 หัวหน้าช่าง (Tablet PWA)</div>
          <div class="vbox vbox-client">💻 ผู้ดูแลระบบ (Desktop Admin)</div>
        </div>

        <div class="varrow">➔</div>

        <!-- Layer 2: Security & Routing -->
        <div class="vlayer-col">
          <div class="vlayer-title">2. SECURITY &amp; GATEWAY</div>
          <div class="vbox vbox-security">🛡️ Global Watermark Engine</div>
          <div class="vbox vbox-security">🔐 NextAuth.js JWT Token</div>
          <div class="vbox vbox-security">🚦 RBAC Granular Menu Gate</div>
        </div>

        <div class="varrow">➔</div>

        <!-- Layer 3: Compute & Cache -->
        <div class="vlayer-col">
          <div class="vlayer-title">3. COMPUTE &amp; CACHING</div>
          <div class="vbox vbox-compute">⚡ Next.js 16.2 App Router</div>
          <div class="vbox vbox-cache">🚀 InMemoryCache (SWR &lt;2ms)</div>
          <div class="vbox vbox-cache">🛡️ Single-Flight Deduplication</div>
          <div class="vbox vbox-compute">📹 HTTP 206 Partial Streamer</div>
        </div>

        <div class="varrow">➔</div>

        <!-- Layer 4: External Cloud -->
        <div class="vlayer-col">
          <div class="vlayer-title">4. CLOUD &amp; ENTERPRISE</div>
          <div class="vbox vbox-cloud">📊 Google Sheets DB v4</div>
          <div class="vbox vbox-cloud">📁 Google Drive Storage v3</div>
          <div class="vbox vbox-cloud">📺 YouTube Data API v3</div>
          <div class="vbox vbox-cloud">🏢 Mazuma SFTP (Port 22)</div>
        </div>
      </div>
    </div>
  </div>`;
}

function renderVisualSequenceDiagram() {
  return `
  <div class="visual-diagram-card" style="page-break-inside: avoid; break-inside: avoid;">
    <div class="vdiagram-header">
      <span class="vdiagram-title">🔐 ลำดับขั้นตอนการยืนยันตัวตน (AUTHENTICATION &amp; 2FA IDENTITY BINDING FLOW)</span>
      <span class="vdiagram-badge">PKCE + 2FA SECURITY</span>
    </div>
    <div class="vdiagram-body">
      <div class="vseq-steps">
        <div class="vseq-step">
          <span class="vseq-num">1</span>
          <div class="vseq-info"><strong>ผู้ใช้เปิดเว็บแอป:</strong> หน้าจอ LoginView สไตล์ Glassmorphism</div>
        </div>
        <div class="vseq-step">
          <span class="vseq-num">2</span>
          <div class="vseq-info"><strong>กด "เข้าสู่ระบบด้วย LINE":</strong> ส่งคำขอ OAuth 2.0 พร้อม PKCE Code Verifier และ State Token</div>
        </div>
        <div class="vseq-step">
          <span class="vseq-num">3</span>
          <div class="vseq-info"><strong>ผู้ใช้กดยินยอมให้สิทธิ์:</strong> LINE ตรวจสอบและส่ง Authorization Code กลับมาที่ Callback URL</div>
        </div>
        <div class="vseq-step">
          <span class="vseq-num">4</span>
          <div class="vseq-info"><strong>ตรวจสอบในฐานข้อมูล (Users Sheet):</strong> ระบบค้นหา LINE User ID ในชีต Users</div>
        </div>
        <div class="vseq-branch">
          <div class="vbranch-item vbranch-success">
            <strong>กรณีที่ 1: ผูกบัญชีไว้แล้ว (Existing User)</strong>
            <p>สถานะ Active ➔ ออก JWT Session Cookie ➔ เข้าสู่หน้า TechnicianHome ทันที (&lt;1 วินาที)</p>
          </div>
          <div class="vbranch-item vbranch-warning">
            <strong>กรณีที่ 2: ใช้งานครั้งแรก (First-Time Binding)</strong>
            <p>นำทางไปหน้า EmployeeBindView ➔ กรอกรหัสพนักงาน MZ-xxx + เบอร์โทรศัพท์ 10 หลัก (2FA) ➔ ตรวจสอบตรงกัน ➔ ผูก LINE ID สำเร็จ</p>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function renderVisualCacheDiagram() {
  return `
  <div class="visual-diagram-card" style="page-break-inside: avoid; break-inside: avoid;">
    <div class="vdiagram-header">
      <span class="vdiagram-title">⚡ วงจรการทำงานของระบบแคช (IN-MEMORY CACHE &amp; CONCURRENCY LIFECYCLE)</span>
      <span class="vdiagram-badge">QUOTA SHIELD: 60 REQ/MIN LIMIT</span>
    </div>
    <div class="vdiagram-body">
      <div class="vcache-grid">
        <div class="vcache-card vcache-fresh">
          <div class="vcache-badge">1. FRESH STATE (&lt;30 วินาที)</div>
          <h4>ตอบกลับข้อมูลทันที</h4>
          <p>ส่งคืนข้อมูลจากหน่วยความจำ RAM เซิร์ฟเวอร์ทันที ภายใน <strong>&lt; 2 มิลลิวินาที</strong> ไม่เรียก API ภายนอก</p>
        </div>
        <div class="vcache-card vcache-stale">
          <div class="vcache-badge">2. STALE REVALIDATE (30s - 5 นาที)</div>
          <h4>SWR ส่งคืนเดิม + แอบรีเฟรช</h4>
          <p>ส่งข้อมูลเดิมให้ผู้ใช้ทันที แล้วใช้ Next.js <code>after()</code> ดึงข้อมูลใหม่จาก Sheets มาเก็บใน RAM เบื้องหลัง</p>
        </div>
        <div class="vcache-card vcache-single">
          <div class="vcache-badge">3. SINGLE-FLIGHT DEDUPLICATION</div>
          <h4>รวมคำขอซ้ำเหลือ 1 Request</h4>
          <p>หากมีช่าง 1,000 คนเปิดพร้อมกัน คำขอทั้งหมดจะรวมเป็น 1 Fetch เดียวไปยัง Google Sheets แล้วแชร์ผลลัพธ์พร้อมกัน</p>
        </div>
      </div>
    </div>
  </div>`;
}

function renderVisualHierarchyFlow() {
  return `
  <div class="visual-hierarchy-box" style="page-break-inside: avoid; break-inside: avoid;">
    <div class="vh-title">📌 ผังโครงสร้างความสัมพันธ์ข้อมูล 5 ระดับ (5-LEVEL HIERARCHICAL DRILL-DOWN):</div>
    <div class="vh-flow">
      <div class="vh-step"><span>1. หมวดสินค้า</span><small>ProductGroup</small></div>
      <div class="vh-arrow">➔</div>
      <div class="vh-step"><span>2. กลุ่มย่อย</span><small>ProductCategory</small></div>
      <div class="vh-arrow">➔</div>
      <div class="vh-step"><span>3. กลุ่มอาการ</span><small>SymptomGroup</small></div>
      <div class="vh-arrow">➔</div>
      <div class="vh-step"><span>4. อาการเสีย</span><small>Issue</small></div>
      <div class="vh-arrow">➔</div>
      <div class="vh-step vh-step-final"><span>5. คู่มือ &amp; สเต็ป</span><small>Guide &amp; Steps</small></div>
    </div>
  </div>`;
}

function renderVisualErDiagram() {
  return `
  <div class="visual-diagram-card visual-er-card" style="page-break-inside: avoid; break-inside: avoid;">
    <div class="vdiagram-header">
      <span class="vdiagram-title">📊 ผังความสัมพันธ์โครงสร้างฐานข้อมูล (ENTITY-RELATIONSHIP ARCHITECTURE MODEL)</span>
      <span class="vdiagram-badge">11 NORMALIZED SHEETS • RELATIONAL GOOGLE SPREADSHEET</span>
    </div>
    <div class="vdiagram-body">
      <div class="er-domains-grid">
        
        <!-- Domain 1: Core Knowledge Hierarchy -->
        <div class="er-domain-box er-domain-knowledge">
          <div class="er-domain-header">
            <span class="er-domain-icon">📚</span>
            <span class="er-domain-title">1. CORE REPAIR KNOWLEDGE DOMAIN (โครงสร้างข้อมูลการซ่อม 5 ระดับชั้น)</span>
          </div>
          <div class="er-entities-row">
            <div class="er-entity-pill">
              <strong>ProductGroup</strong>
              <small>PK: id | name, slug, status</small>
            </div>
            <div class="er-arrow">➔</div>
            <div class="er-entity-pill">
              <strong>ProductCategory</strong>
              <small>PK: id | FK: categoryId | index</small>
            </div>
            <div class="er-arrow">➔</div>
            <div class="er-entity-pill">
              <strong>SymptomGroup</strong>
              <small>PK: id | FK: subcategoryId | name</small>
            </div>
          </div>
          <div class="er-entities-row" style="margin-top: 6px;">
            <div class="er-entity-pill">
              <strong>Issue (อาการเสีย)</strong>
              <small>PK: id | FK: symptomTypeId | severity</small>
            </div>
            <div class="er-arrow">➔</div>
            <div class="er-entity-pill er-highlight">
              <strong>Guide (คู่มือ)</strong>
              <small>PK: id | FK: categoryId, symptomId</small>
            </div>
            <div class="er-arrow">➔</div>
            <div class="er-entity-pill er-highlight">
              <strong>GuideSteps_V2</strong>
              <small>PK: id | FK: guideId | stepNum, media</small>
            </div>
          </div>
        </div>

        <!-- Domain 2 & 3: Catalog, Identity & Audit -->
        <div class="er-domains-subgrid">
          
          <div class="er-domain-box er-domain-catalog">
            <div class="er-domain-header">
              <span class="er-domain-icon">🏷️</span>
              <span class="er-domain-title">2. PRODUCT CATALOG DOMAIN</span>
            </div>
            <div class="er-entity-pill">
              <strong>Models (โมเดลสินค้า)</strong>
              <small>PK: id | FK: categoryId, subcategoryId | code, status</small>
              <div class="er-link-badge">1:N ผูกกับ Guide &amp; SFTP ERP</div>
            </div>
          </div>

          <div class="er-domain-box er-domain-identity">
            <div class="er-domain-header">
              <span class="er-domain-icon">👥</span>
              <span class="er-domain-title">3. IDENTITY &amp; GOVERNANCE</span>
            </div>
            <div class="er-entity-pill">
              <strong>Users (พนักงาน)</strong>
              <small>PK: employeeCode | phone, role, status, lineUserId</small>
              <div class="er-link-badge">RBAC &amp; Granular Menus</div>
            </div>
          </div>

          <div class="er-domain-box er-domain-ops">
            <div class="er-domain-header">
              <span class="er-domain-icon">📈</span>
              <span class="er-domain-title">4. OPERATIONS &amp; AUDIT TRAIL</span>
            </div>
            <div class="er-entities-col">
              <div class="er-entity-pill">
                <strong>Feedbacks</strong>
                <small>PK: id | FK: guideId, modelId, userId | isSuccess</small>
              </div>
              <div class="er-entity-pill">
                <strong>ActivityLogs</strong>
                <small>PK: id | employeeCode, action, details</small>
              </div>
              <div class="er-entity-pill">
                <strong>MasterData</strong>
                <small>PK: id | matCode, category, subcategory (SAP)</small>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>`;
}

function renderStructuredTableOfContents() {
  return `
  <div class="toc-container">
    <div class="toc-header">
      <span class="toc-header-icon">📑</span>
      <h1 class="heading-1 toc-main-title">สารบัญรวม (Comprehensive Table of Contents)</h1>
    </div>
    
    <div class="toc-grid">
      <!-- COLUMN 1 -->
      <div class="toc-col">
        
        <div class="toc-card">
          <div class="toc-card-header">📌 บทสรุปสำหรับผู้บริหาร</div>
          <div class="toc-item toc-major">
            <span class="toc-title">บทสรุปสำหรับผู้บริหาร (Executive Summary)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 4</span>
          </div>
        </div>

        <div class="toc-card" style="margin-top: 8px;">
          <div class="toc-card-header">📘 ส่วนที่ 1: คู่มือผู้ใช้งานและระเบียบปฏิบัติการมาตรฐาน (User Manual &amp; SOP)</div>
          
          <div class="toc-item toc-major">
            <span class="toc-title">1.1 ภาพรวม ขอบเขต และกลุ่มเป้าหมาย (Overview)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 5</span>
          </div>
          
          <div class="toc-item toc-major">
            <span class="toc-title">1.2 เมทริกซ์สิทธิ์ผู้ใช้งาน (User Persona &amp; RBAC Matrix)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 5</span>
          </div>

          <div class="toc-item toc-major">
            <span class="toc-title">1.3 ระเบียบปฏิบัติด้านการยืนยันตัวตน (2FA Binding SOP)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 6</span>
          </div>

          <div class="toc-item toc-major">
            <span class="toc-title">1.4 คู่มือปฏิบัติงานช่างเทคนิคภาคสนาม (Field Technician)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 6</span>
          </div>
          <div class="toc-item toc-sub"><span class="toc-title">1.4.1 การติดตั้งและเปิดใช้งาน Progressive Web App (PWA)</span></div>
          <div class="toc-item toc-sub"><span class="toc-title">1.4.2 การค้นหาอัจฉริยะและการนำทางหมวดหมู่สินค้า</span></div>
          <div class="toc-item toc-sub"><span class="toc-title">1.4.3 การวินิจฉัยด่วนตามอาการเสีย (Diagnostics)</span></div>
          <div class="toc-item toc-sub"><span class="toc-title">1.4.4 การใช้งานตัวช่วยซ่อมทีละขั้นตอน (Step Wizard)</span></div>
          <div class="toc-item toc-sub"><span class="toc-title">1.4.5 เครื่องคิดเลขวิศวกรรมและเครื่องมือช่าง</span></div>
          <div class="toc-item toc-sub"><span class="toc-title">1.4.6 การส่งบันทึกผลการซ่อมและระบบส่งต่องานด่วน</span></div>

          <div class="toc-item toc-major" style="margin-top: 4px;">
            <span class="toc-title">1.5 คู่มือหัวหน้าทีมช่างเทคนิค (Supervisor Manual)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 8</span>
          </div>
          <div class="toc-item toc-sub"><span class="toc-title">1.5.1 การรับสายปรึกษาและสนับสนุนช่างหน้างาน</span></div>
          <div class="toc-item toc-sub"><span class="toc-title">1.5.2 การสลับเข้าสู่โหมดผู้ดูแลระบบ (Backoffice)</span></div>

          <div class="toc-item toc-major" style="margin-top: 4px;">
            <span class="toc-title">1.6 คู่มือผู้ดูแลระบบหลังบ้าน (Admin Backoffice)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 8</span>
          </div>
          <div class="toc-item toc-sub"><span class="toc-title">1.6.1 แดชบอร์ดสถิติ KPI และ Telemetry</span></div>
          <div class="toc-item toc-sub"><span class="toc-title">1.6.2 การบริหารจัดการคู่มือและการผูกรุ่นสินค้า</span></div>
          <div class="toc-item toc-sub"><span class="toc-title">1.6.3 การจัดการข้อมูลหลักแบบ Drill-Down 5 ระดับ</span></div>
          <div class="toc-item toc-sub"><span class="toc-title">1.6.4 การเชื่อมโยงและซิงค์ข้อมูลจาก SFTP Server</span></div>
          <div class="toc-item toc-sub"><span class="toc-title">1.6.5 การจัดการคลังสื่อดิจิทัลและการสตรีมมิ่ง</span></div>
          <div class="toc-item toc-sub"><span class="toc-title">1.6.6 การบริหารจัดการผู้ใช้งานและสิทธิ์รายเมนู</span></div>
          <div class="toc-item toc-sub"><span class="toc-title">1.6.7 การตั้งค่าระบบและการล้างหน่วยความจำแคช</span></div>
        </div>

      </div>

      <!-- COLUMN 2 -->
      <div class="toc-col">
        
        <div class="toc-card">
          <div class="toc-card-header">🏛️ ส่วนที่ 2: สถาปัตยกรรมทางเทคนิค (Architecture &amp; LLD)</div>
          
          <div class="toc-item toc-major">
            <span class="toc-title">2.1 สถาปัตยกรรมภาพรวมระดับสูง (High-Level Architecture)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 10</span>
          </div>
          <div class="toc-item toc-major">
            <span class="toc-title">2.2 รายละเอียดเทคโนโลยีที่ใช้งานจริง (Tech Stack)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 11</span>
          </div>
          <div class="toc-item toc-major">
            <span class="toc-title">2.3 ผังโครงสร้างโปรเจกต์และไฟล์สำคัญ (Project Topology)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 12</span>
          </div>
          <div class="toc-item toc-major">
            <span class="toc-title">2.4 พจนานุกรมข้อมูลและโครงสร้างฐานข้อมูล (Data Dictionary)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 13</span>
          </div>
          <div class="toc-item toc-major">
            <span class="toc-title">2.5 เอกสารอ้างอิง API และ Server Actions Reference</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 17</span>
          </div>
          <div class="toc-item toc-major">
            <span class="toc-title">2.6 กลไกการเร่งความเร็วและแคช (In-Memory Cache SWR)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 18</span>
          </div>
          <div class="toc-item toc-major">
            <span class="toc-title">2.7 การประมวลผลและสตรีมมิ่งมัลติมีเดีย (Media Proxy)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 19</span>
          </div>
          <div class="toc-item toc-major">
            <span class="toc-title">2.8 ไปป์ไลน์การซิงค์ข้อมูลสินค้าองค์กรผ่าน SFTP</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 19</span>
          </div>
          <div class="toc-item toc-major">
            <span class="toc-title">2.9 สถาปัตยกรรมความปลอดภัยและการปกป้องข้อมูล</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 20</span>
          </div>
        </div>

        <div class="toc-card" style="margin-top: 8px;">
          <div class="toc-card-header">🚀 ส่วนที่ 3: คู่มือการติดตั้งและบำรุงรักษา (DevOps Runbook)</div>
          
          <div class="toc-item toc-major">
            <span class="toc-title">3.1 การติดตั้งและรันระบบบนเครื่องพัฒนา (Local Setup)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 21</span>
          </div>
          <div class="toc-item toc-major">
            <span class="toc-title">3.2 เมทริกซ์ตัวแปรสภาพแวดล้อม (Environment Variables)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 22</span>
          </div>
          <div class="toc-item toc-major">
            <span class="toc-title">3.3 ขั้นตอนการนำขึ้นระบบจริงบน Vercel (Production SOP)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 23</span>
          </div>
          <div class="toc-item toc-major">
            <span class="toc-title">3.4 การตั้งค่าระบบภายนอก (External Cloud Services)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 23</span>
          </div>
          <div class="toc-item toc-major">
            <span class="toc-title">3.5 แผนผังการแก้ไขปัญหาฉุกเฉินและเมทริกซ์เหตุขัดข้อง</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 24</span>
          </div>
          <div class="toc-item toc-major">
            <span class="toc-title">3.6 แผนการกู้คืนระบบและความต่อเนื่องทางธุรกิจ (BCP)</span>
            <span class="toc-dots"></span>
            <span class="toc-pg">หน้า 24</span>
          </div>
        </div>

      </div>
    </div>
  </div>`;
}

function renderTopologyShowcase(content) {
  const lines = content.split('\n');
  const splitIdx = lines.findIndex(l => l.includes('components/watermark.tsx') || l.includes('components/login-view.tsx'));
  
  let pane1Lines = [];
  let pane2Lines = [];
  
  if (splitIdx > 0) {
    pane1Lines = lines.slice(0, splitIdx + 1);
    pane2Lines = lines.slice(splitIdx + 1);
  } else {
    const half = Math.ceil(lines.length / 2);
    pane1Lines = lines.slice(0, half);
    pane2Lines = lines.slice(half);
  }

  return `
  <div class="topology-container" style="page-break-inside: avoid; break-inside: avoid;">
    <div class="code-container" style="margin-bottom: 10px; page-break-inside: avoid; break-inside: avoid;">
      <div class="code-header">
        <span class="code-dot red"></span>
        <span class="code-dot yellow"></span>
        <span class="code-dot green"></span>
        <span class="code-title">📱 1. FRONTEND ARCHITECTURE &amp; ROUTING (app/ &amp; components/)</span>
      </div>
      <pre class="code-block" style="font-size: 7.2pt; line-height: 1.38;"><code>${escapeHtml(pane1Lines.join('\n'))}</code></pre>
    </div>

    <div class="code-container" style="page-break-inside: avoid; break-inside: avoid;">
      <div class="code-header">
        <span class="code-dot red"></span>
        <span class="code-dot yellow"></span>
        <span class="code-dot green"></span>
        <span class="code-title">⚙️ 2. DATA ACCESS, LOGIC, SCRIPTS &amp; CONFIG (lib/, scripts/, docs/)</span>
      </div>
      <pre class="code-block" style="font-size: 7.2pt; line-height: 1.38;"><code>${escapeHtml(pane2Lines.join('\n'))}</code></pre>
    </div>
  </div>`;
}

function renderTable(headers, rows) {
  let tableClass = 'tech-table';
  let colgroup = '';
  let containerClass = 'table-container';

  const colCount = headers.length;
  if (colCount === 4 && headers[0].includes('บทบาท') && headers[1].includes('สัญลักษณ์')) {
    colgroup = '<colgroup><col style="width: 22%"><col style="width: 12%"><col style="width: 26%"><col style="width: 40%"></colgroup>';
  } else if (colCount === 4 && headers[0].includes('สิทธิ์') && headers[1].includes('Technician')) {
    containerClass += ' rbac-table-box';
    colgroup = '<colgroup><col style="width: 38%"><col style="width: 20%"><col style="width: 20%"><col style="width: 22%"></colgroup>';
  } else if (colCount === 4 && headers[0].includes('ส่วนประกอบ') && headers[1].includes('เทคโนโลยี')) {
    colgroup = '<colgroup><col style="width: 24%"><col style="width: 26%"><col style="width: 14%"><col style="width: 36%"></colgroup>';
  } else if (colCount === 5 && headers[0].includes('Field Name')) {
    containerClass += ' data-dict-table-box';
    colgroup = '<colgroup><col style="width: 22%"><col style="width: 16%"><col style="width: 10%"><col style="width: 12%"><col style="width: 40%"></colgroup>';
  } else if (colCount === 4 && headers[0].includes('ตัวแปร')) {
    containerClass += ' env-table-box';
    colgroup = '<colgroup><col style="width: 32%"><col style="width: 28%"><col style="width: 14%"><col style="width: 26%"></colgroup>';
  } else if (colCount === 5 && headers[0].includes('รหัสเหตุการณ์')) {
    containerClass += ' incident-table-box';
    colgroup = '<colgroup><col style="width: 12%"><col style="width: 10%"><col style="width: 28%"><col style="width: 25%"><col style="width: 25%"></colgroup>';
  }

  let html = `<div class="${containerClass}" style="page-break-inside: avoid; break-inside: avoid;"><table class="${tableClass}">${colgroup}<thead><tr>`;
  for (const h of headers) {
    html += `<th>${formatInline(h)}</th>`;
  }
  html += '</tr></thead><tbody>';

  for (let r = 0; r < rows.length; r++) {
    html += '<tr>';
    for (let c = 0; c < headers.length; c++) {
      const cellVal = rows[r][c] || '';
      html += `<td>${formatInline(cellVal)}</td>`;
    }
    html += '</tr>';
  }

  html += '</tbody></table></div>\n';
  return html;
}

function convertMarkdownToHtml(md) {
  const lines = md.split(/\r?\n/);
  let html = '';
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];
  let inCodeBlock = false;
  let codeLines = [];
  let codeLang = '';

  let inToc = false;
  let inExecSummary = false;
  let screenshotIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Catch Table of Contents heading
    if (trimmed.includes('สารบัญรวม (Comprehensive Table of Contents)')) {
      inToc = true;
      html += renderStructuredTableOfContents();
      continue;
    }

    if (inToc) {
      if (trimmed.startsWith('# ') || trimmed === '---') {
        if (trimmed.startsWith('# ')) {
          inToc = false;
          // fall through to process this heading
        } else {
          continue;
        }
      } else {
        continue; // Skip raw TOC bullet lines since we rendered the structured 2-column TOC
      }
    }

    // Code block
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const codeContent = codeLines.join('\n');
        
        // Check if Mermaid diagram -> Replace with high quality visual diagram!
        if (codeLang.toLowerCase() === 'mermaid') {
          if (codeContent.includes('graph TD') || codeContent.includes('graph TB')) {
            html += renderVisualArchitectureDiagram();
          } else if (codeContent.includes('sequenceDiagram')) {
            html += renderVisualSequenceDiagram();
          } else if (codeContent.includes('stateDiagram')) {
            html += renderVisualCacheDiagram();
          } else if (codeContent.includes('erDiagram')) {
            html += renderVisualErDiagram();
          } else {
            html += `
            <div class="code-container" style="page-break-inside: avoid; break-inside: avoid;">
              <div class="code-header">
                <span class="code-dot red"></span>
                <span class="code-dot yellow"></span>
                <span class="code-dot green"></span>
                <span class="code-title">DIAGRAM SPECIFICATION</span>
              </div>
              <pre class="code-block"><code>${escapeHtml(codeContent)}</code></pre>
            </div>\n`;
          }
        } else if (codeContent.includes('mazuma-repair-guide/')) {
          // Directory topology showcase
          html += renderTopologyShowcase(codeContent);
        } else {
          // Normal code container
          const isShort = codeLines.length <= 25;
          const breakRule = isShort ? 'page-break-inside: avoid; break-inside: avoid;' : 'page-break-inside: auto; break-inside: auto;';
          html += `
          <div class="code-container" style="${breakRule}">
            <div class="code-header">
              <span class="code-dot red"></span>
              <span class="code-dot yellow"></span>
              <span class="code-dot green"></span>
              <span class="code-title">${escapeHtml(codeLang ? codeLang.toUpperCase() : 'SPECIFICATION / CODE')}</span>
            </div>
            <pre class="code-block"><code>${escapeHtml(codeContent)}</code></pre>
          </div>\n`;
        }
        codeLines = [];
      } else {
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cols = trimmed.slice(1, -1).split('|').map(c => c.trim());
      const isDivider = cols.every(c => /^:?-+:?$/.test(c));
      if (isDivider) continue;

      if (!inTable) {
        inTable = true;
        tableHeaders = cols;
        tableRows = [];
      } else {
        tableRows.push(cols);
      }
      continue;
    } else {
      if (inTable) {
        inTable = false;
        html += renderTable(tableHeaders, tableRows);
        tableHeaders = [];
        tableRows = [];
      }
    }

    if (!trimmed) continue;

    // Visual Drill-Down in Section 1.6.3
    if (trimmed.includes('1.6.3 การจัดการโครงสร้างข้อมูลหลัก 5 ระดับ')) {
      html += `<h3 class="heading-3">${formatInline(trimmed.slice(4))}</h3>\n`;
      html += renderVisualHierarchyFlow();
      continue;
    }

    // Screenshot placeholder [🖼️ แทรกรูปภาพ: ...]
    const imgMatch = trimmed.match(/\[🖼️\s*แทรกรูปภาพ:\s*([^\]]+)\]/);
    if (imgMatch) {
      const desc = imgMatch[1];
      let captionText = '';
      // Check if next non-empty line is a caption
      if (i + 1 < lines.length) {
        const nextTrimmed = lines[i + 1].trim();
        if (nextTrimmed.startsWith('*คำอธิบายภาพ:') || nextTrimmed.startsWith('*ภาพประกอบ:')) {
          captionText = nextTrimmed.replace(/^\*(คำอธิบายภาพ|ภาพประกอบ):\s*/, '').replace(/\*$/, '');
          i++; // Consume the caption line so it doesn't render as a floating paragraph
        }
      }

      html += renderScreenshotElement(screenshotIndex, desc, captionText);
      screenshotIndex++;
      continue;
    }

    // Callout / Blockquote > ...
    if (trimmed.startsWith('>')) {
      const calloutText = trimmed.replace(/^>\s*/, '');
      let calloutClass = 'callout-info';
      if (calloutText.includes('⚠️') || calloutText.includes('ข้อควรระวัง')) {
        calloutClass = 'callout-warning';
      } else if (calloutText.includes('🔴') || calloutText.includes('อันตราย') || calloutText.includes('วิกฤต')) {
        calloutClass = 'callout-danger';
      } else if (calloutText.includes('✅') || calloutText.includes('สำเร็จ')) {
        calloutClass = 'callout-success';
      }
      html += `<div class="callout-box ${calloutClass}">${formatInline(calloutText)}</div>\n`;
      continue;
    }

    // Headings with clean page break controls
    if (trimmed.startsWith('# ')) {
      const text = trimmed.slice(2);
      let pageBreakClass = '';
      if (text.includes('บทสรุปสำหรับผู้บริหาร')) {
        inExecSummary = true;
        pageBreakClass = 'page-break-before';
      } else if (text.includes('ส่วนที่ 1:') || text.includes('ส่วนที่ 2:') || text.includes('ส่วนที่ 3:')) {
        inExecSummary = false;
        pageBreakClass = 'page-break-before';
      }
      html += `<h1 class="heading-1 ${pageBreakClass}">${formatInline(text)}</h1>\n`;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      const text = trimmed.slice(3);
      html += `<h2 class="heading-2">${formatInline(text)}</h2>\n`;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      const text = trimmed.slice(4);
      let pageBreakClass = '';
      if (text.includes('2.3 ผังโครงสร้างโปรเจกต์') || 
          text.includes('3.3 ขั้นตอนการนำขึ้นระบบจริงบน Vercel') || 
          text.includes('3.5 แผนผังการแก้ไขปัญหาฉุกเฉิน')) {
        pageBreakClass = 'page-break-before';
      }
      html += `<h3 class="heading-3 ${pageBreakClass}">${formatInline(text)}</h3>\n`;
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      const text = trimmed.slice(5);
      html += `<h4 class="heading-4 data-dict-heading">${formatInline(text)}</h4>\n`;
      continue;
    }

    // Divider ---
    if (trimmed === '---') {
      if (inExecSummary) {
        html += `<hr class="divider page-break-after" />\n`;
        inExecSummary = false;
      } else {
        html += `<hr class="divider" />\n`;
      }
      continue;
    }

    // Unordered list - or *
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const text = trimmed.slice(2);
      html += `<div class="list-item"><span class="bullet">▪</span><span class="list-text">${formatInline(text)}</span></div>\n`;
      continue;
    }

    // Numbered list 1. 2.
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const text = numMatch[2];
      html += `<div class="list-item"><span class="num">${num}.</span><span class="list-text">${formatInline(text)}</span></div>\n`;
      continue;
    }

    // Normal paragraph
    html += `<p class="paragraph">${formatInline(trimmed)}</p>\n`;
  }

  if (inTable && tableHeaders.length > 0) {
    html += renderTable(tableHeaders, tableRows);
  }

  return html;
}

function generateCompleteEnterpriseHtml(contentHtml) {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>MAZUMA REPAIR GUIDE — Enterprise System Manual & Technical Architecture</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');

    @page {
      size: A4 portrait;
      margin-top: 15mm;
      margin-bottom: 15mm;
      margin-left: 12mm;
      margin-right: 12mm;
    }

    @page :first {
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0;
      margin-right: 0;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 8.8pt;
      line-height: 1.58;
      color: #0f172a;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    /* ==========================================================================
       ENTERPRISE FULL-BLEED COVER PAGE (A4 Single Page)
       ========================================================================== */
    .cover-page {
      width: 210mm;
      height: 297mm;
      min-height: 297mm;
      max-height: 297mm;
      padding: 24mm 20mm 18mm 20mm;
      box-sizing: border-box;
      background: linear-gradient(145deg, #071527 0%, #0A2540 45%, #004080 80%, #0066CC 100%);
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
      margin: 0;
      position: relative;
      overflow: hidden;
    }

    .cover-brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .brand-logo-box {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Prompt', sans-serif;
      font-size: 30pt;
      font-weight: 800;
      color: #0A2540;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
    }

    .brand-text-block {
      display: flex;
      flex-direction: column;
    }

    .brand-company {
      font-family: 'Prompt', sans-serif;
      font-size: 15pt;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #ffffff;
      text-transform: uppercase;
    }

    .brand-unit {
      font-family: 'Prompt', sans-serif;
      font-size: 8.8pt;
      font-weight: 400;
      color: #93c5fd;
      letter-spacing: 0.05em;
    }

    .cover-content {
      margin-top: 15mm;
      margin-bottom: 8mm;
    }

    .cover-doc-type {
      display: inline-block;
      background: rgba(14, 165, 233, 0.25);
      border: 1px solid rgba(14, 165, 233, 0.5);
      padding: 5px 14px;
      border-radius: 6px;
      font-family: 'Prompt', sans-serif;
      font-size: 8.5pt;
      font-weight: 600;
      color: #7dd3fc;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 14px;
    }

    .cover-title {
      font-family: 'Prompt', sans-serif;
      font-size: 30pt;
      font-weight: 800;
      line-height: 1.15;
      color: #ffffff;
      margin: 0 0 12px 0;
      letter-spacing: -0.02em;
    }

    .cover-subtitle {
      font-family: 'Prompt', sans-serif;
      font-size: 12pt;
      font-weight: 400;
      line-height: 1.48;
      color: #bfdbfe;
      margin: 0 0 20px 0;
      max-width: 680px;
    }

    .cover-accent-line {
      width: 120px;
      height: 4px;
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      border-radius: 4px;
    }

    .cover-metadata-card {
      background: rgba(15, 23, 42, 0.78);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 10px;
      padding: 16px 22px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px 24px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-family: 'Prompt', sans-serif;
      font-size: 7.2pt;
      font-weight: 500;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    .meta-value {
      font-family: 'Prompt', sans-serif;
      font-size: 9.5pt;
      font-weight: 600;
      color: #ffffff;
    }

    .cover-footer {
      padding-top: 8mm;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'Prompt', sans-serif;
      font-size: 8pt;
      color: #94a3b8;
    }

    /* ==========================================================================
       PAGE BREAKS & SECTION HEADINGS
       ========================================================================== */
    .page-break-before {
      page-break-before: always !important;
      break-before: page !important;
    }

    .page-break-after {
      page-break-after: always !important;
      break-after: page !important;
    }

    .heading-1 {
      font-family: 'Prompt', sans-serif;
      font-size: 15pt;
      font-weight: 700;
      color: #0A2540;
      border-bottom: 2px solid #0A2540;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 12px;
      break-after: avoid;
      page-break-after: avoid;
    }

    .heading-2 {
      font-family: 'Prompt', sans-serif;
      font-size: 11.8pt;
      font-weight: 600;
      color: #0066CC;
      margin-top: 18px;
      margin-bottom: 8px;
      break-after: avoid;
      page-break-after: avoid;
      border-left: 4px solid #0066CC;
      padding-left: 9px;
    }

    .heading-3 {
      font-family: 'Prompt', sans-serif;
      font-size: 10.2pt;
      font-weight: 600;
      color: #0369a1;
      margin-top: 14px;
      margin-bottom: 6px;
      break-after: avoid;
      page-break-after: avoid;
    }

    .heading-4 {
      font-family: 'Prompt', sans-serif;
      font-size: 9pt;
      font-weight: 600;
      color: #334155;
      margin-top: 10px;
      margin-bottom: 4px;
      break-after: avoid;
      page-break-after: avoid;
    }

    .paragraph {
      margin-top: 0;
      margin-bottom: 7px;
      text-align: justify;
      color: #1e293b;
      line-height: 1.58;
    }

    .divider {
      border: 0;
      height: 1px;
      background: #e2e8f0;
      margin: 14px 0;
    }

    /* ==========================================================================
       STRUCTURED TABLE OF CONTENTS (2-COLUMN GRID)
       ========================================================================== */
    .toc-container {
      page-break-before: always;
      break-before: page;
      page-break-after: always;
      break-after: page;
      padding: 0 0 10px 0;
    }

    .toc-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .toc-header-icon {
      font-size: 16pt;
    }

    .toc-main-title {
      margin: 0;
      padding-bottom: 4px;
      flex: 1;
    }

    .toc-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .toc-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 14px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    }

    .toc-card-header {
      font-family: 'Prompt', sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      color: #0A2540;
      border-bottom: 1.5px solid #0066cc;
      padding-bottom: 4px;
      margin-bottom: 7px;
      letter-spacing: 0.02em;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 7.5pt;
      line-height: 1.35;
      margin-bottom: 3px;
      color: #1e293b;
    }

    .toc-item.toc-major {
      font-weight: 600;
      color: #0369a1;
      margin-top: 3px;
    }

    .toc-item.toc-sub {
      padding-left: 10px;
      font-size: 7pt;
      color: #475569;
    }

    .toc-title {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toc-dots {
      flex: 1;
      border-bottom: 1px dotted #94a3b8;
      margin: 0 6px;
      min-width: 15px;
      height: 1px;
    }

    .toc-pg {
      font-family: 'Prompt', sans-serif;
      font-size: 7.5pt;
      font-weight: 600;
      color: #0066cc;
    }

    /* ==========================================================================
       VISUAL DIAGRAMS (HIGH-RES CARDS)
       ========================================================================== */
    .visual-diagram-card {
      background: #f8fafc;
      border: 1.5px solid #0284c7;
      border-radius: 8px;
      margin: 12px 0;
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
      box-shadow: 0 3px 10px rgba(2, 132, 199, 0.08);
    }

    .vdiagram-header {
      background: #0A2540;
      color: #ffffff;
      padding: 7px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .vdiagram-title {
      font-family: 'Prompt', sans-serif;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .vdiagram-badge {
      background: #0284c7;
      color: #ffffff;
      padding: 2px 8px;
      border-radius: 8px;
      font-family: 'Prompt', sans-serif;
      font-size: 6.5pt;
      font-weight: 600;
    }

    .vdiagram-body {
      padding: 10px 14px;
    }

    .vdiagram-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }

    .vlayer-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .vlayer-title {
      font-family: 'Prompt', sans-serif;
      font-size: 6.5pt;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      text-align: center;
      margin-bottom: 2px;
    }

    .vbox {
      border-radius: 5px;
      padding: 5px 6px;
      font-family: 'Prompt', sans-serif;
      font-size: 7pt;
      font-weight: 600;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .vbox-client { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
    .vbox-security { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .vbox-compute { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .vbox-cache { background: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff; }
    .vbox-cloud { background: #e0f2fe; color: #075985; border: 1px solid #bae6fd; }

    .varrow {
      font-size: 12pt;
      color: #94a3b8;
      font-weight: bold;
    }

    /* SEQUENCE DIAGRAM VISUAL */
    .vseq-steps {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .vseq-step {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      padding: 5px 9px;
    }

    .vseq-num {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #0066CC;
      color: #ffffff;
      font-family: 'Prompt', sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .vseq-info {
      font-size: 8pt;
      color: #1e293b;
    }

    .vseq-branch {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-top: 3px;
    }

    .vbranch-item {
      border-radius: 5px;
      padding: 6px 8px;
      font-size: 7.5pt;
    }

    .vbranch-success { background: #f0fdf4; border: 1px solid #86efac; color: #166534; }
    .vbranch-warning { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
    .vbranch-item p { margin: 3px 0 0 0; font-size: 7pt; }

    /* CACHE LIFECYCLE VISUAL */
    .vcache-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
    }

    .vcache-card {
      border-radius: 5px;
      padding: 6px 8px;
    }

    .vcache-card h4 {
      font-family: 'Prompt', sans-serif;
      font-size: 8pt;
      margin: 3px 0 2px 0;
    }

    .vcache-card p {
      font-size: 7pt;
      margin: 0;
      line-height: 1.35;
    }

    .vcache-badge {
      font-family: 'Prompt', sans-serif;
      font-size: 6.5pt;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .vcache-fresh { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }
    .vcache-fresh .vcache-badge { color: #059669; }
    .vcache-stale { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
    .vcache-stale .vcache-badge { color: #2563eb; }
    .vcache-single { background: #faf5ff; border: 1px solid #e9d5ff; color: #6b21a8; }
    .vcache-single .vcache-badge { color: #9333ea; }

    /* HIERARCHY FLOW VISUAL */
    .visual-hierarchy-box {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      margin: 10px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .vh-title {
      font-family: 'Prompt', sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: #334155;
      margin-bottom: 5px;
    }

    .vh-flow {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
    }

    .vh-step {
      background: #ffffff;
      border: 1px solid #94a3b8;
      border-radius: 5px;
      padding: 3px 6px;
      text-align: center;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .vh-step span {
      font-family: 'Prompt', sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: #0A2540;
    }

    .vh-step small {
      font-size: 6pt;
      color: #64748b;
    }

    .vh-step-final {
      background: #0066CC;
      border-color: #004080;
    }

    .vh-step-final span { color: #ffffff; }
    .vh-step-final small { color: #bfdbfe; }

    .vh-arrow {
      color: #0066CC;
      font-size: 10pt;
      font-weight: bold;
    }

    /* VISUAL ER DIAGRAM CARD */
    .visual-er-card {
      margin: 10px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .er-domains-grid {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .er-domain-box {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 7px 10px;
    }

    .er-domain-knowledge {
      background: #f0fdf4;
      border-color: #86efac;
    }

    .er-domain-catalog {
      background: #eff6ff;
      border-color: #93c5fd;
      flex: 1;
    }

    .er-domain-identity {
      background: #fefce8;
      border-color: #fde047;
      flex: 1;
    }

    .er-domain-ops {
      background: #faf5ff;
      border-color: #d8b4fe;
      flex: 1;
    }

    .er-domains-subgrid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 7px;
    }

    .er-domain-header {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-bottom: 5px;
      font-family: 'Prompt', sans-serif;
      font-size: 6.8pt;
      font-weight: 700;
      color: #0A2540;
      letter-spacing: 0.03em;
    }

    .er-entities-row {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .er-entities-col {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .er-entity-pill {
      flex: 1;
      background: #ffffff;
      border: 1px solid #94a3b8;
      border-radius: 5px;
      padding: 3px 5px;
      display: flex;
      flex-direction: column;
      font-size: 6.5pt;
    }

    .er-entity-pill strong {
      font-family: 'Prompt', sans-serif;
      font-size: 7.2pt;
      color: #0A2540;
    }

    .er-entity-pill small {
      color: #64748b;
      font-family: 'JetBrains Mono', monospace;
      font-size: 5.8pt;
    }

    .er-entity-pill.er-highlight {
      border: 1.5px solid #0066cc;
      background: #f0f9ff;
    }

    .er-link-badge {
      margin-top: 2px;
      background: #e2e8f0;
      color: #334155;
      font-size: 5.2pt;
      font-weight: 600;
      padding: 1px 3px;
      border-radius: 3px;
      align-self: flex-start;
    }

    /* ==========================================================================
       SCREENSHOT BLUEPRINT CARDS & EMBEDDED FRAMES
       ========================================================================== */
    .screenshot-blueprint-card {
      background: #f8fafc;
      border: 1.5px solid #0284c7;
      border-radius: 8px;
      margin: 12px 0;
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
      box-shadow: 0 3px 10px rgba(2, 132, 199, 0.08);
    }

    .blueprint-header {
      background: #0A2540;
      color: #ffffff;
      padding: 6px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .blueprint-header-left {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .blueprint-camera-icon { font-size: 11pt; }

    .blueprint-title {
      font-family: 'Prompt', sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #f8fafc;
      text-transform: uppercase;
    }

    .blueprint-badge-pending {
      background: #f59e0b;
      color: #78350f;
      padding: 2px 7px;
      border-radius: 4px;
      font-family: 'Prompt', sans-serif;
      font-size: 6.2pt;
      font-weight: 700;
      letter-spacing: 0.03em;
    }

    .blueprint-body {
      padding: 10px 14px;
      background: #ffffff;
    }

    .blueprint-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 7px 16px;
      margin-bottom: 9px;
      background: #f1f5f9;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .bmeta-item {
      display: flex;
      flex-direction: column;
    }

    .bmeta-label {
      font-family: 'Prompt', sans-serif;
      font-size: 6.2pt;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 1px;
    }

    .bmeta-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.2pt;
      color: #0369a1;
      font-weight: 600;
    }

    .bmeta-val {
      font-family: 'Prompt', sans-serif;
      font-size: 7.4pt;
      color: #1e293b;
      font-weight: 500;
    }

    .blueprint-desc-box {
      background: #fffdf5;
      border-left: 3px solid #f59e0b;
      padding: 6px 10px;
      border-radius: 0 4px 4px 0;
    }

    .bdesc-title {
      font-family: 'Prompt', sans-serif;
      font-size: 7.2pt;
      font-weight: 700;
      color: #92400e;
      margin-bottom: 2px;
    }

    .bdesc-text {
      font-size: 7.8pt;
      color: #78350f;
      line-height: 1.45;
    }

    .blueprint-footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 6px 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 7.6pt;
      color: #475569;
    }

    .fig-badge-outline {
      font-family: 'Prompt', sans-serif;
      font-size: 7pt;
      font-weight: 700;
      color: #0066cc;
      background: #e0f2fe;
      padding: 1px 6px;
      border-radius: 3px;
      border: 1px solid #bae6fd;
    }

    /* REAL EMBEDDED IMAGE WINDOW FRAME */
    .screenshot-figure {
      margin: 14px 0;
      padding: 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .device-window-frame {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    }

    .window-titlebar {
      background: #1e293b;
      color: #cbd5e1;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .window-dots {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .wdot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #f59e0b; }
    .dot-green { background: #10b981; }

    .window-url-bar {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 4px;
      padding: 2px 10px;
      display: flex;
      align-items: center;
      gap: 5px;
      flex: 1;
      max-width: 420px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 6.5pt;
      color: #94a3b8;
    }

    .window-badge {
      background: #334155;
      color: #e2e8f0;
      font-family: 'Prompt', sans-serif;
      font-size: 6pt;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 3px;
      letter-spacing: 0.03em;
    }

    .image-inner-box {
      background: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
    }

    .device-screenshot-img {
      width: 100%;
      height: auto;
      max-height: 420px;
      object-fit: contain;
      display: block;
      border-radius: 4px;
    }

    .figure-caption {
      margin-top: 6px;
      font-size: 8pt;
      color: #334155;
      text-align: center;
      line-height: 1.4;
      font-style: normal;
    }

    .fig-badge {
      font-family: 'Prompt', sans-serif;
      font-weight: 700;
      color: #0066cc;
      margin-right: 4px;
    }

    .fig-title {
      font-family: 'Prompt', sans-serif;
      font-weight: 600;
      color: #0A2540;
    }

    /* CALLOUT BOXES */
    .callout-box {
      border-radius: 6px;
      padding: 8px 12px;
      margin: 8px 0;
      font-size: 8.4pt;
      line-height: 1.5;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .callout-info { background: #eff6ff; border-left: 4px solid #0066cc; color: #1e3a8a; }
    .callout-warning { background: #fffbeb; border-left: 4px solid #f59e0b; color: #78350f; }
    .callout-danger { background: #fef2f2; border-left: 4px solid #ef4444; color: #991b1b; }
    .callout-success { background: #f0fdf4; border-left: 4px solid #10b981; color: #065f46; }

    /* CODE BLOCK CONTAINER */
    .code-container {
      background: #0b132b;
      border-radius: 6px;
      margin: 9px 0;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
    }

    .code-header {
      background: #1c2541;
      padding: 5px 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      border-bottom: 1px solid #2d3748;
      break-after: avoid;
      page-break-after: avoid;
    }

    .code-dot { width: 6px; height: 6px; border-radius: 50%; }
    .code-dot.red { background: #ef4444; }
    .code-dot.yellow { background: #f59e0b; }
    .code-dot.green { background: #10b981; }

    .code-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 6.5pt;
      color: #94a3b8;
      margin-left: 4px;
      font-weight: 500;
    }

    .code-block {
      margin: 0;
      padding: 8px 12px;
      color: #e2e8f0;
      font-family: 'JetBrains Mono', 'Consolas', monospace;
      font-size: 7.2pt;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    .inline-code {
      background: #f1f5f9;
      color: #b45309;
      padding: 1px 4px;
      border-radius: 3px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.2pt;
      border: 1px solid #e2e8f0;
      font-weight: 500;
    }

    /* BADGES */
    .badge {
      display: inline-block;
      padding: 1px 5px;
      border-radius: 3px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 6.2pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      vertical-align: middle;
      line-height: 1.25;
    }

    .badge-success { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .badge-danger { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
    .badge-warning { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .badge-primary { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
    .badge-slate { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    .badge-critical { background: #ffe4e6; color: #9f1239; border: 1px solid #fda4af; }
    .badge-high { background: #ffedd5; color: #9a3412; border: 1px solid #fed7aa; }
    .badge-medium { background: #fef9c3; color: #854d0e; border: 1px solid #fef08a; }
    .badge-low { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }

    .badge-pk { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; font-weight: 700; }
    .badge-fk { background: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff; font-weight: 700; }

    /* LINKS */
    .doc-link { color: #0066cc; text-decoration: none; font-weight: 500; }
    .doc-link:hover { text-decoration: underline; }
    .ext-icon { font-size: 6.5pt; opacity: 0.7; }

    /* TABLES */
    .table-container {
      margin: 10px 0;
      overflow-x: auto;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .data-dict-table-box {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-bottom: 10px;
    }

    .tech-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      font-size: 7.8pt;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    .tech-table thead {
      display: table-header-group;
    }

    .tech-table tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .tech-table th {
      background-color: #0A2540;
      color: #ffffff;
      font-family: 'Prompt', sans-serif;
      font-weight: 600;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #0A2540;
      font-size: 7.8pt;
      word-break: break-word;
    }

    .tech-table td {
      padding: 5px 8px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
      color: #1e293b;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    .tech-table tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* LISTS */
    .list-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 3.5px;
      page-break-inside: avoid;
    }

    .list-item .bullet {
      color: #0066cc;
      font-size: 8pt;
      margin-right: 6px;
      line-height: 1.5;
    }

    .list-item .num {
      font-family: 'Prompt', sans-serif;
      font-weight: 600;
      color: #0A2540;
      margin-right: 6px;
      min-width: 16px;
    }

    .list-item .list-text {
      flex: 1;
      word-break: break-word;
    }

    .data-dict-heading {
      break-after: avoid;
      page-break-after: avoid;
      margin-top: 14px;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>

  <!-- =========================================================================
       หน้าปกระดับ ENTERPRISE (A4 Full-Bleed Page)
       ========================================================================= -->
  <div class="cover-page">
    <div class="cover-brand">
      <div class="brand-logo-box">M</div>
      <div class="brand-text-block">
        <span class="brand-company">MAZUMA (THAILAND) CO., LTD.</span>
        <span class="brand-unit">AFTER-SALES SERVICE &amp; ENGINEERING DEPARTMENT</span>
      </div>
    </div>

    <div class="cover-content">
      <div class="cover-doc-type">ENTERPRISE SYSTEM MANUAL &amp; ARCHITECTURAL SPECIFICATION</div>
      <h1 class="cover-title">MAZUMA REPAIR GUIDE</h1>
      <p class="cover-subtitle">ระบบคู่มือการซ่อมเชิงปฏิสัมพันธ์ บริหารจัดการข้อมูลองค์ความรู้ทางวิศวกรรม และระเบียบปฏิบัติการมาตรฐานงานบริการภาคสนาม</p>
      <div class="cover-accent-line"></div>
    </div>

    <div class="cover-metadata-card">
      <div class="meta-item">
        <span class="meta-label">รหัสเอกสาร (DOCUMENT ID)</span>
        <span class="meta-value">DOC-MZM-2026-V1</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">เวอร์ชันระบบ (SYSTEM VERSION)</span>
        <span class="meta-value">1.0.0-PROD (STABLE RELEASE)</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">ระดับชั้นความลับ (SECURITY CLASSIFICATION)</span>
        <span class="meta-value">CONFIDENTIAL — INTERNAL ONLY</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">ผู้ออกแบบและพัฒนาหลัก (CHIEF ARCHITECT)</span>
        <span class="meta-value">นาย ภานุเดช ตะวงษ์</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">กลุ่มเป้าหมาย (TARGET AUDIENCE)</span>
        <span class="meta-value">ทีมช่างบริการ, หัวหน้าศูนย์, แอดมินระบบ</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">วันที่มีผลบังคับใช้ (EFFECTIVE DATE)</span>
        <span class="meta-value">กันยายน 2026</span>
      </div>
    </div>

    <div class="cover-footer">
      <span>© 2026 บริษัท มาซูม่า (ประเทศไทย) จำกัด. สงวนลิขสิทธิ์ทุกประการ</span>
      <span>ISO 9001:2015 QUALITY MANAGEMENT SYSTEM COMPLIANT</span>
    </div>
  </div>

  <!-- =========================================================================
       เนื้อหาเอกสารทั้งหมด
       ========================================================================= -->
  <div style="padding: 0;">
    ${contentHtml}
  </div>

</body>
</html>`;
}

// =============================================================================
// CDP CHROME HEADLESS VECTOR PDF BUILDER
// =============================================================================
async function renderWithCdp(browserExe, htmlUrl, destinationPdf) {
  const tmpDir = path.join(os.tmpdir(), `chrome-pdf-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const browserProc = spawn(browserExe, [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${tmpDir}`,
    '--no-sandbox',
    '--disable-gpu',
    '--disable-extensions'
  ]);

  let wsUrl = '';
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Browser startup timeout (10s)')), 10000);
    browserProc.stderr.on('data', (d) => {
      const match = d.toString().match(/DevTools listening on (ws:\/\/[^\r\n]+)/);
      if (match) {
        wsUrl = match[1];
        clearTimeout(timeout);
        resolve();
      }
    });
    browserProc.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });

  const pagesRes = await fetch(`http://127.0.0.1:${new URL(wsUrl).port}/json`);
  const pages = await pagesRes.json();
  const pageObj = pages.find(p => p.type === 'page') || pages[0];

  const pageWs = new WebSocket(pageObj.webSocketDebuggerUrl);
  await new Promise(r => pageWs.onopen = r);

  let pageMsgId = 1;
  const pagePending = new Map();
  function sendPage(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = pageMsgId++;
      pagePending.set(id, { resolve, reject });
      pageWs.send(JSON.stringify({ id, method, params }));
    });
  }

  pageWs.onmessage = (ev) => {
    const d = JSON.parse(ev.data);
    if (d.id && pagePending.has(d.id)) {
      const { resolve, reject } = pagePending.get(d.id);
      pagePending.delete(d.id);
      if (d.error) reject(d.error);
      else resolve(d.result);
    }
  };

  await sendPage('Page.enable');
  await sendPage('Page.navigate', { url: htmlUrl });

  // Wait for initial load and Google Fonts ready
  await new Promise(r => setTimeout(r, 2500));
  await sendPage('Runtime.evaluate', {
    expression: 'document.fonts.ready',
    awaitPromise: true
  });

  const headerTemplate = `
    <div style="font-family: 'Prompt', 'Sarabun', sans-serif; font-size: 7.2pt; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 12mm; color: #64748b; border-bottom: 0.5px solid #cbd5e1; padding-bottom: 3px;">
      <span style="font-weight: 700; color: #0066cc; letter-spacing: 0.03em;">MAZUMA REPAIR GUIDE</span>
      <span style="font-weight: 500; letter-spacing: 0.04em;">ENTERPRISE SYSTEM SPECIFICATION (DOC-MZM-2026-V1)</span>
    </div>
  `;

  const footerTemplate = `
    <div style="font-family: 'Prompt', 'Sarabun', sans-serif; font-size: 7.2pt; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 12mm; color: #64748b; border-top: 0.5px solid #cbd5e1; padding-top: 3px;">
      <span>CONFIDENTIAL  |  บริษัท มาซูม่า (ประเทศไทย) จำกัด  |  ผู้จัดทำ: นาย ภานุเดช ตะวงษ์</span>
      <span style="font-weight: 600; color: #0066cc;">หน้า <span class="pageNumber"></span> จาก <span class="totalPages"></span> หน้า</span>
    </div>
  `;

  const pdfResult = await sendPage('Page.printToPDF', {
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate,
    footerTemplate,
    preferCSSPageSize: true
  });

  fs.writeFileSync(destinationPdf, Buffer.from(pdfResult.data, 'base64'));

  pageWs.close();
  browserProc.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
}

async function buildEnterprisePdf() {
  console.log('📖 Reading Master Markdown source...');
  const md = fs.readFileSync(mdPath, 'utf8');

  console.log('⚙️ Converting Markdown to Big-Tech Styled Enterprise HTML...');
  const contentHtml = convertMarkdownToHtml(md);
  const fullHtml = generateCompleteEnterpriseHtml(contentHtml);

  fs.writeFileSync(htmlPath, fullHtml, 'utf8');
  console.log(`✅ Generated Enterprise HTML: ${htmlPath}`);

  console.log('🖨️ Rendering and Exporting Enterprise Vector PDF via Chrome CDP...');

  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const browserExe = fs.existsSync(chromePath) ? chromePath : edgePath;
  const htmlUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;

  try {
    await renderWithCdp(browserExe, htmlUrl, pdfPath);
    if (fs.existsSync(pdfPath)) {
      const stats = fs.statSync(pdfPath);
      console.log(`🎉 SUCCESS! Enterprise PDF generated via CDP: ${pdfPath} (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      throw new Error('PDF output file was not found after CDP render.');
    }
  } catch (err) {
    console.warn(`⚠️ CDP Render failed (${err.message}). Falling back to Chrome CLI print...`);
    const args = [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--no-pdf-header-footer',
      `--print-to-pdf=${pdfPath}`,
      htmlUrl
    ];
    execFileSync(browserExe, args, { stdio: 'inherit' });
    if (fs.existsSync(pdfPath)) {
      const stats = fs.statSync(pdfPath);
      console.log(`🎉 SUCCESS (CLI Fallback)! PDF generated: ${pdfPath} (${(stats.size / 1024).toFixed(1)} KB)`);
    }
  }
}

buildEnterprisePdf();
