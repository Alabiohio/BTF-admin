"use client";

import { jsPDF } from "jspdf";

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

const BIRO_BLUE: [number, number, number] = [49, 126, 254];

async function getCompressedLogoDataUrl(): Promise<string> {
  try {
    const response = await fetch("/images/logo/logo.png");
    const blob = await response.blob();

    return new Promise<string>((resolve) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(blob);

      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 360;
        canvas.height = 180;

        const context = canvas.getContext("2d");
        if (!context) {
          URL.revokeObjectURL(objectUrl);
          resolve("");
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        const scale = Math.min(
          canvas.width / image.naturalWidth,
          canvas.height / image.naturalHeight
        );
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        const drawX = (canvas.width - drawWidth) / 2;
        const drawY = (canvas.height - drawHeight) / 2;

        context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve("");
      };

      image.src = objectUrl;
    });
  } catch {
    return "";
  }
}

export async function exportRegistrationsToPDF<T extends RegistrationRecord>(
  records: T[],
  title: string,
  fieldLabels: string[]
): Promise<void> {
  const doc = new jsPDF({ orientation: "landscape", compress: true });
  const logoDataUrl = await getCompressedLogoDataUrl();

  if (logoDataUrl) {
    doc.addImage(
      logoDataUrl,
      "JPEG",
      doc.internal.pageSize.getWidth() - 44,
      5,
      30,
      15,
      "btf-logo",
      "FAST"
    );
  }

  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const tableWidth = pageWidth - margin * 2;
  const firstColumnWidth = fieldLabels.length > 0 ? 25 : tableWidth;
  const columnWidth =
    fieldLabels.length > 0
      ? (tableWidth - firstColumnWidth) / fieldLabels.length
      : 0;
  const columnWidths = [firstColumnWidth, ...fieldLabels.map(() => columnWidth)];
  const rowPadding = 3;
  const lineHeight = 4;
  const tableStartY = 22;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(BIRO_BLUE[0], BIRO_BLUE[1], BIRO_BLUE[2]);
  doc.text(`${title} Registrations`, 14, 12);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Total: ${records.length} registration(s)`, 14, 18);

  const head = ["Registrant", ...fieldLabels];
  const body = [...records]
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

  const wrapCellText = (value: string | number, width: number): string[] =>
    doc.splitTextToSize(
      String(value),
      Math.max(width - rowPadding * 2, 4)
    ) as string[];

  const drawTableHeader = (startY: number): number => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setLineWidth(0.2);

    const wrappedHead = head.map((label, index) =>
      wrapCellText(label, columnWidths[index])
    );
    const headerHeight =
      Math.max(...wrappedHead.map((lines) => lines.length)) * lineHeight +
      rowPadding * 2;

    let x = margin;
    wrappedHead.forEach((lines, index) => {
      const width = columnWidths[index];

      doc.setFillColor(BIRO_BLUE[0], BIRO_BLUE[1], BIRO_BLUE[2]);
      doc.setDrawColor(BIRO_BLUE[0], BIRO_BLUE[1], BIRO_BLUE[2]);
      doc.rect(x, startY, width, headerHeight, "FD");

      doc.setTextColor(255, 255, 255);
      doc.text(lines, x + rowPadding, startY + rowPadding + 3, {
        maxWidth: width - rowPadding * 2,
      });
      x += width;
    });

    return startY + headerHeight;
  };

  let currentY = drawTableHeader(tableStartY);

  body.forEach((row, rowIndex) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    const wrappedCells = row.map((value, index) =>
      wrapCellText(value, columnWidths[index])
    );
    const rowHeight =
      Math.max(...wrappedCells.map((lines) => lines.length)) * lineHeight +
      rowPadding * 2;

    if (currentY + rowHeight > pageHeight - margin) {
      doc.addPage();
      currentY = drawTableHeader(margin);
    }

    let x = margin;
    const isAlternateRow = rowIndex % 2 === 1;
    wrappedCells.forEach((lines, index) => {
      const width = columnWidths[index];
      if (isAlternateRow) {
        doc.setFillColor(248, 249, 250);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.setDrawColor(220, 220, 220);
      doc.rect(x, currentY, width, rowHeight, "FD");

      if (index === 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(BIRO_BLUE[0], BIRO_BLUE[1], BIRO_BLUE[2]);
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
      }

      doc.text(lines, x + rowPadding, currentY + rowPadding + 3, {
        maxWidth: width - rowPadding * 2,
      });
      x += width;
    });

    currentY += rowHeight;
  });

  doc.save(`${title.toLowerCase().replace(/\s+/g, "-")}-registrations.pdf`);
}
