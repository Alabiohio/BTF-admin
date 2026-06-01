"use client";

interface RegistrationRecord {
  id: number;
  created_at: Date;
  name?: string;
  email?: string;
  phone?: string;
  topic?: string;
  company?: string;
  company_name?: string;
  contact_person?: string;
  website?: string | null;
  description?: string | null;
  interests?: string | null;
  skills?: string | null;
  availability?: string | null;
  application_type?: string;
  sponsorship_tier?: string | null;
}

function escapeXml(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getColumnName(index: number): string {
  let columnName = "";
  let columnNumber = index + 1;

  while (columnNumber > 0) {
    const remainder = (columnNumber - 1) % 26;
    columnName = String.fromCharCode(65 + remainder) + columnName;
    columnNumber = Math.floor((columnNumber - 1) / 26);
  }

  return columnName;
}

function getColumnWidth(label: string): number {
  const columnWidths: Record<string, number> = {
    "Application Type": 18,
    "Availability": 24,
    "Company": 24,
    "Contact Name": 24,
    "Contact Person": 24,
    "Date": 14,
    "Description": 42,
    "Email": 32,
    "Interests": 36,
    "Name": 24,
    "Phone": 18,
    "Registrant": 14,
    "Skills": 34,
    "Sponsorship Tier": 20,
    "Topic": 36,
    "Website": 34,
  };

  return columnWidths[label] || 22;
}

function createCrc32Table(): number[] {
  return Array.from({ length: 256 }, (_, index) => {
    let crc = index;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    return crc >>> 0;
  });
}

const crc32Table = createCrc32Table();

function getCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;

  data.forEach((byte) => {
    crc = crc32Table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });

  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(target: Uint8Array, offset: number, value: number): void {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
}

function writeUint32(target: Uint8Array, offset: number, value: number): void {
  target[offset] = value & 0xff;
  target[offset + 1] = (value >>> 8) & 0xff;
  target[offset + 2] = (value >>> 16) & 0xff;
  target[offset + 3] = (value >>> 24) & 0xff;
}

function createZip(files: Array<{ path: string; content: string }>): Blob {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  files.forEach((file) => {
    const pathData = encoder.encode(file.path);
    const contentData = encoder.encode(file.content);
    const crc = getCrc32(contentData);
    const localHeader = new Uint8Array(30 + pathData.length);

    writeUint32(localHeader, 0, 0x04034b50);
    writeUint16(localHeader, 4, 20);
    writeUint16(localHeader, 6, 0);
    writeUint16(localHeader, 8, 0);
    writeUint16(localHeader, 10, 0);
    writeUint16(localHeader, 12, 0);
    writeUint32(localHeader, 14, crc);
    writeUint32(localHeader, 18, contentData.length);
    writeUint32(localHeader, 22, contentData.length);
    writeUint16(localHeader, 26, pathData.length);
    writeUint16(localHeader, 28, 0);
    localHeader.set(pathData, 30);

    localParts.push(localHeader, contentData);

    const centralHeader = new Uint8Array(46 + pathData.length);
    writeUint32(centralHeader, 0, 0x02014b50);
    writeUint16(centralHeader, 4, 20);
    writeUint16(centralHeader, 6, 20);
    writeUint16(centralHeader, 8, 0);
    writeUint16(centralHeader, 10, 0);
    writeUint16(centralHeader, 12, 0);
    writeUint16(centralHeader, 14, 0);
    writeUint32(centralHeader, 16, crc);
    writeUint32(centralHeader, 20, contentData.length);
    writeUint32(centralHeader, 24, contentData.length);
    writeUint16(centralHeader, 28, pathData.length);
    writeUint16(centralHeader, 30, 0);
    writeUint16(centralHeader, 32, 0);
    writeUint16(centralHeader, 34, 0);
    writeUint16(centralHeader, 36, 0);
    writeUint32(centralHeader, 38, 0);
    writeUint32(centralHeader, 42, offset);
    centralHeader.set(pathData, 46);
    centralParts.push(centralHeader);

    offset += localHeader.length + contentData.length;
  });

  const centralDirectorySize = centralParts.reduce(
    (size, part) => size + part.length,
    0
  );
  const endRecord = new Uint8Array(22);

  writeUint32(endRecord, 0, 0x06054b50);
  writeUint16(endRecord, 4, 0);
  writeUint16(endRecord, 6, 0);
  writeUint16(endRecord, 8, files.length);
  writeUint16(endRecord, 10, files.length);
  writeUint32(endRecord, 12, centralDirectorySize);
  writeUint32(endRecord, 16, offset);
  writeUint16(endRecord, 20, 0);

  const zipParts = [...localParts, ...centralParts, endRecord];
  const zipSize = zipParts.reduce((size, part) => size + part.length, 0);
  const zipData = new Uint8Array(zipSize);
  let zipOffset = 0;

  zipParts.forEach((part) => {
    zipData.set(part, zipOffset);
    zipOffset += part.length;
  });

  return new Blob([zipData.buffer as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export async function exportRegistrationsToExcel<T extends RegistrationRecord>(
  records: T[],
  title: string,
  fieldLabels: string[]
): Promise<void> {
  const header = ["Registrant", ...fieldLabels];
  const rows = [...records]
    .sort((a, b) => a.id - b.id)
    .map((record) => {
      const rowData: (string | number)[] = [`#${record.id}`];
      const fieldMappings: Record<string, string | undefined> = {
        "Date": new Date(record.created_at).toLocaleDateString(),
        "Name": record.name,
        "Email": record.email,
        "Phone": record.phone,
        "Topic": record.topic,
        "Company": record.company || record.company_name,
        "Contact Name": record.name,
        "Contact Person": record.contact_person,
        "Website": record.website || undefined,
        "Description": record.description || undefined,
        "Interests": record.interests || undefined,
        "Skills": record.skills || undefined,
        "Availability": record.availability || undefined,
        "Application Type": record.application_type || undefined,
        "Sponsorship Tier": record.sponsorship_tier || undefined,
      };

      fieldLabels.forEach((label) => {
        rowData.push(fieldMappings[label] || "-");
      });

      return rowData;
    });

  const worksheetRows = [header, ...rows]
    .map(
      (row, rowIndex) =>
        `<row r="${rowIndex + 1}">${row
          .map((cell, cellIndex) => {
            const cellRef = `${getColumnName(cellIndex)}${rowIndex + 1}`;
            const style = rowIndex === 0 ? ' s="1"' : "";

            return `<c r="${cellRef}" t="inlineStr"${style}><is><t>${escapeXml(
              cell
            )}</t></is></c>`;
          })
          .join("")}</row>`
    )
    .join("");
  const worksheetColumns = header
    .map(
      (label, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${getColumnWidth(
          String(label)
        )}" customWidth="1"/>`
    )
    .join("");

  const files = [
    {
      path: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
    },
    {
      path: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
    },
    {
      path: "docProps/app.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>BTF Admin</Application>
</Properties>`,
    },
    {
      path: "docProps/core.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(title)} Registrations</dc:title>
  <dc:creator>BTF Admin</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
</cp:coreProperties>`,
    },
    {
      path: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Registrations" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`,
    },
    {
      path: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
    },
    {
      path: "xl/styles.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF317EFE"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left style="thin"/><right style="thin"/><top style="thin"/><bottom style="thin"/><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
  </cellXfs>
</styleSheet>`,
    },
    {
      path: "xl/worksheets/sheet1.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>${worksheetColumns}</cols>
  <sheetData>${worksheetRows}</sheetData>
</worksheet>`,
    },
  ];

  const blob = createZip(files);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${title.toLowerCase().replace(/\s+/g, "-")}-registrations.xlsx`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
