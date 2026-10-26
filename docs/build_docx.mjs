import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mdPath = path.join(__dirname, 'MAZUMA_REPAIR_GUIDE_MANUAL.md');
const outDocxPath = path.join(__dirname, 'MAZUMA_REPAIR_GUIDE_MANUAL.docx');
const tempDir = path.join(__dirname, '.temp_docx');

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function renderFormattedRuns(text) {
  // Clean markdown links: [Title](#anchor) -> Title, [Title](url) -> Title (url)
  text = text.replace(/\[([^\]]+)\]\(#([^)]+)\)/g, '$1');
  text = text.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '$1 ($2)');

  const tokens = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  let xml = '';
  for (const token of tokens) {
    if (!token) continue;
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      xml += `<w:r><w:rPr><w:b/><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/></w:rPr><w:t xml:space="preserve">${escapeXml(token.slice(2, -2))}</w:t></w:r>`;
    } else if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      xml += `<w:r><w:rPr><w:i/><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/></w:rPr><w:t xml:space="preserve">${escapeXml(token.slice(1, -1))}</w:t></w:r>`;
    } else if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      xml += `<w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:color w:val="C2410C"/><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">${escapeXml(token.slice(1, -1))}</w:t></w:r>`;
    } else {
      xml += `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/></w:rPr><w:t xml:space="preserve">${escapeXml(token)}</w:t></w:r>`;
    }
  }
  return xml;
}

function parseMarkdownToDocxXml(content) {
  const lines = content.split(/\r?\n/);
  let bodyXml = '';

  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];
  let inCodeBlock = false;
  let codeLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const codeContent = escapeXml(codeLines.join('\n'));
        bodyXml += `
        <w:tbl>
          <w:tblPr>
            <w:tblW w:w="9200" w:type="dxa"/>
            <w:tblBorders>
              <w:top w:val="single" w:sz="6" w:space="0" w:color="0284C7"/>
              <w:left w:val="single" w:sz="24" w:space="0" w:color="0284C7"/>
              <w:bottom w:val="single" w:sz="6" w:space="0" w:color="0284C7"/>
              <w:right w:val="single" w:sz="6" w:space="0" w:color="0284C7"/>
            </w:tblBorders>
          </w:tblPr>
          <w:tr>
            <w:tc>
              <w:tcPr>
                <w:tcW w:w="9200" w:type="dxa"/>
                <w:shd w:val="clear" w:color="auto" w:fill="F0F9FF"/>
                <w:tcMar><w:top w:w="160" w:type="dxa"/><w:left w:w="200" w:type="dxa"/><w:bottom w:w="160" w:type="dxa"/><w:right w:w="200" w:type="dxa"/></w:tcMar>
              </w:tcPr>
              <w:p>
                <w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="19"/><w:color w:val="0369A1"/></w:rPr><w:t xml:space="preserve">${codeContent}</w:t></w:r>
              </w:p>
            </w:tc>
          </w:tr>
        </w:tbl>
        <w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>`;
        codeLines = [];
      } else {
        inCodeBlock = true;
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

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
        bodyXml += renderTableXml(tableHeaders, tableRows);
        tableHeaders = [];
        tableRows = [];
      }
    }

    if (!trimmed) continue;

    const imgMatch = trimmed.match(/\[🖼️\s*แทรกรูปภาพ:\s*([^\]]+)\]/);
    if (imgMatch) {
      const desc = escapeXml(imgMatch[1]);
      bodyXml += `
      <w:tbl>
        <w:tblPr>
          <w:tblW w:w="9200" w:type="dxa"/>
          <w:jc w:val="center"/>
          <w:tblBorders>
            <w:top w:val="dashed" w:sz="12" w:space="0" w:color="F59E0B"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="D97706"/>
            <w:bottom w:val="dashed" w:sz="12" w:space="0" w:color="F59E0B"/>
            <w:right w:val="dashed" w:sz="12" w:space="0" w:color="F59E0B"/>
          </w:tblBorders>
        </w:tblPr>
        <w:tr>
          <w:tc>
            <w:tcPr>
              <w:tcW w:w="9200" w:type="dxa"/>
              <w:shd w:val="clear" w:color="auto" w:fill="FEF3C7"/>
              <w:tcMar><w:top w:w="180" w:type="dxa"/><w:left w:w="240" w:type="dxa"/><w:bottom w:w="180" w:type="dxa"/><w:right w:w="240" w:type="dxa"/></w:tcMar>
            </w:tcPr>
            <w:p>
              <w:pPr><w:jc w:val="center"/><w:spacing w:before="60" w:after="40"/></w:pPr>
              <w:r><w:rPr><w:b/><w:sz w:val="21"/><w:color w:val="B45309"/></w:rPr><w:t xml:space="preserve">📸 [ตำแหน่งแทรกภาพถ่ายหน้าจอ / SCREENSHOT]</w:t></w:r>
            </w:p>
            <w:p>
              <w:pPr><w:jc w:val="center"/><w:spacing w:before="20" w:after="60"/></w:pPr>
              <w:r><w:rPr><w:b/><w:sz w:val="23"/><w:color w:val="78350F"/></w:rPr><w:t xml:space="preserve">${desc}</w:t></w:r>
            </w:p>
          </w:tc>
        </w:tr>
      </w:tbl>
      <w:p><w:pPr><w:spacing w:after="140"/></w:pPr></w:p>`;
      continue;
    }

    if (trimmed.startsWith('>')) {
      const calloutText = trimmed.replace(/^>\s*/, '');
      bodyXml += `
      <w:tbl>
        <w:tblPr>
          <w:tblW w:w="9200" w:type="dxa"/>
          <w:tblBorders>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="28" w:space="0" w:color="0066CC"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
          </w:tblBorders>
        </w:tblPr>
        <w:tr>
          <w:tc>
            <w:tcPr>
              <w:tcW w:w="9200" w:type="dxa"/>
              <w:shd w:val="clear" w:color="auto" w:fill="EFF6FF"/>
              <w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="200" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="180" w:type="dxa"/></w:tcMar>
            </w:tcPr>
            <w:p>
              <w:pPr><w:spacing w:before="40" w:after="40"/></w:pPr>
              ${renderFormattedRuns(calloutText)}
            </w:p>
          </w:tc>
        </w:tr>
      </w:tbl>
      <w:p><w:pPr><w:spacing w:after="100"/></w:pPr></w:p>`;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      const hText = trimmed.slice(2);
      bodyXml += `
      <w:p>
        <w:pPr>
          <w:spacing w:before="360" w:after="140"/>
          <w:pBdr><w:bottom w:val="single" w:sz="18" w:space="4" w:color="0A2540"/></w:pBdr>
        </w:pPr>
        <w:r>
          <w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:sz w:val="38"/><w:color w:val="0A2540"/></w:rPr>
          <w:t xml:space="preserve">${escapeXml(hText)}</w:t>
        </w:r>
      </w:p>`;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      const hText = trimmed.slice(3);
      bodyXml += `
      <w:p>
        <w:pPr>
          <w:spacing w:before="280" w:after="100"/>
        </w:pPr>
        <w:r>
          <w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:sz w:val="30"/><w:color w:val="0066CC"/></w:rPr>
          <w:t xml:space="preserve">${escapeXml(hText)}</w:t>
        </w:r>
      </w:p>`;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      const hText = trimmed.slice(4);
      bodyXml += `
      <w:p>
        <w:pPr>
          <w:spacing w:before="200" w:after="80"/>
        </w:pPr>
        <w:r>
          <w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:sz w:val="25"/><w:color w:val="0284C7"/></w:rPr>
          <w:t xml:space="preserve">${escapeXml(hText)}</w:t>
        </w:r>
      </w:p>`;
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      const hText = trimmed.slice(5);
      bodyXml += `
      <w:p>
        <w:pPr>
          <w:spacing w:before="160" w:after="60"/>
        </w:pPr>
        <w:r>
          <w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:sz w:val="23"/><w:color w:val="1E293B"/></w:rPr>
          <w:t xml:space="preserve">${escapeXml(hText)}</w:t>
        </w:r>
      </w:p>`;
      continue;
    }

    if (trimmed === '---') {
      bodyXml += `
      <w:p>
        <w:pPr>
          <w:spacing w:before="120" w:after="120"/>
          <w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="CBD5E1"/></w:pBdr>
        </w:pPr>
      </w:p>`;
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bText = trimmed.slice(2);
      bodyXml += `
      <w:p>
        <w:pPr>
          <w:ind w:left="420" w:hanging="240"/>
          <w:spacing w:before="30" w:after="40"/>
        </w:pPr>
        <w:r><w:rPr><w:color w:val="0066CC"/><w:b/></w:rPr><w:t xml:space="preserve">•  </w:t></w:r>
        ${renderFormattedRuns(bText)}
      </w:p>`;
      continue;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const itemText = numMatch[2];
      bodyXml += `
      <w:p>
        <w:pPr>
          <w:ind w:left="420" w:hanging="240"/>
          <w:spacing w:before="30" w:after="40"/>
        </w:pPr>
        <w:r><w:rPr><w:color w:val="0A2540"/><w:b/></w:rPr><w:t xml:space="preserve">${num}.  </w:t></w:r>
        ${renderFormattedRuns(itemText)}
      </w:p>`;
      continue;
    }

    bodyXml += `
    <w:p>
      <w:pPr>
        <w:spacing w:before="40" w:after="60" w:line="260" w:lineRule="auto"/>
      </w:pPr>
      ${renderFormattedRuns(trimmed)}
    </w:p>`;
  }

  if (inTable && tableHeaders.length > 0) {
    bodyXml += renderTableXml(tableHeaders, tableRows);
  }

  return bodyXml;
}

function renderTableXml(headers, rows) {
  const colCount = headers.length || 1;
  const colWidth = Math.floor(9200 / colCount);

  let xml = `
  <w:tbl>
    <w:tblPr>
      <w:tblW w:w="9200" w:type="dxa"/>
      <w:jc w:val="center"/>
      <w:tblBorders>
        <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:bottom w:val="single" w:sz="12" w:space="0" w:color="0A2540"/>
        <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
      </w:tblBorders>
    </w:tblPr>
    <w:tr>
      <w:trPr><w:tblHeader/></w:trPr>`;

  for (const h of headers) {
    xml += `
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="${colWidth}" w:type="dxa"/>
          <w:shd w:val="clear" w:color="auto" w:fill="0A2540"/>
          <w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar>
        </w:tcPr>
        <w:p>
          <w:pPr><w:jc w:val="center"/><w:spacing w:before="20" w:after="20"/></w:pPr>
          <w:r><w:rPr><w:b/><w:sz w:val="20"/><w:color w:val="FFFFFF"/></w:rPr><w:t xml:space="preserve">${escapeXml(h)}</w:t></w:r>
        </w:p>
      </w:tc>`;
  }
  xml += `</w:tr>`;

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const fill = r % 2 === 1 ? 'F8FAFC' : 'FFFFFF';
    xml += `<w:tr>`;
    for (let c = 0; c < colCount; c++) {
      const val = row[c] || '';
      xml += `
      <w:tc>
        <w:tcPr>
          <w:tcW w:w="${colWidth}" w:type="dxa"/>
          <w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>
          <w:tcMar><w:top w:w="90" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar>
        </w:tcPr>
        <w:p>
          <w:pPr><w:spacing w:before="20" w:after="20"/></w:pPr>
          ${renderFormattedRuns(val)}
        </w:p>
      </w:tc>`;
    }
    xml += `</w:tr>`;
  }

  xml += `</w:tbl>
  <w:p><w:pPr><w:spacing w:after="120"/></w:pPr></w:p>`;
  return xml;
}

function buildDocx() {
  console.log('📖 Reading Markdown source...');
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  console.log('⚙️ Converting Markdown to WordprocessingML...');
  const bodyXml = parseMarkdownToDocxXml(mdContent);

  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(tempDir, '_rels'), { recursive: true });
  fs.mkdirSync(path.join(tempDir, 'word', '_rels'), { recursive: true });

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>`;
  fs.writeFileSync(path.join(tempDir, '[Content_Types].xml'), contentTypesXml, 'utf8');

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;
  fs.writeFileSync(path.join(tempDir, '_rels', '.rels'), rootRelsXml, 'utf8');

  const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>`;
  fs.writeFileSync(path.join(tempDir, 'word', '_rels', 'document.xml.rels'), docRelsXml, 'utf8');

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
      <w:sz w:val="22"/>
      <w:szCs w:val="22"/>
      <w:color w:val="1E293B"/>
    </w:rPrDefault>
  </w:docDefaults>
</w:styles>`;
  fs.writeFileSync(path.join(tempDir, 'word', 'styles.xml'), stylesXml, 'utf8');

  const headerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr><w:jc w:val="right"/></w:pPr>
    <w:r>
      <w:rPr><w:sz w:val="17"/><w:color w:val="64748B"/></w:rPr>
      <w:t>MAZUMA REPAIR GUIDE — SYSTEM MANUAL &amp; TECHNICAL DOCUMENTATION</w:t>
    </w:r>
  </w:p>
</w:hdr>`;
  fs.writeFileSync(path.join(tempDir, 'word', 'header1.xml'), headerXml, 'utf8');

  const footerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr><w:jc w:val="right"/></w:pPr>
    <w:r>
      <w:rPr><w:sz w:val="17"/><w:color w:val="64748B"/></w:rPr>
      <w:t>Mazuma (Thailand) Co., Ltd.  |  ผู้จัดทำ: นาย ภานุเดช ตะวงษ์  |  เอกสารภายในองค์กร</w:t>
    </w:r>
  </w:p>
</w:ftr>`;
  fs.writeFileSync(path.join(tempDir, 'word', 'footer1.xml'), footerXml, 'utf8');

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rId2"/>
      <w:footerReference w:type="default" r:id="rId3"/>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1152" w:right="1296" w:bottom="1152" w:left="1296" w:header="720" w:footer="720"/>
    </w:sectPr>
  </w:body>
</w:document>`;
  fs.writeFileSync(path.join(tempDir, 'word', 'document.xml'), documentXml, 'utf8');

  console.log('📦 Compressing to .docx archive...');
  if (fs.existsSync(outDocxPath)) {
    fs.unlinkSync(outDocxPath);
  }

  const psCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${tempDir}\\*' -DestinationPath '${outDocxPath}' -Force"`;
  execSync(psCmd, { stdio: 'inherit' });

  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log(`✅ Word document successfully generated: ${outDocxPath}`);
}

buildDocx();
