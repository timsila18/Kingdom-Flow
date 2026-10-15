import "server-only";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { join } from "node:path";
import type { PaySnapshot } from "./hr-payroll";
export type ReportRow = (string | number)[];
const kes = (value: number) =>
  `Ksh ${Number(value).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export async function payslipReportFile(
  church: string,
  period: string,
  pay: PaySnapshot,
) {
  const doc = new PDFDocument({ size: "A4", margin: 0 });
  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  const navy = "#10243F";
  const blue = "#2563EB";
  const gold = "#C59B46";
  const ink = "#17211E";
  const muted = "#64748B";
  const border = "#D8E0E8";
  const wash = "#F4F7FA";
  const pageWidth = doc.page.width;
  const contentX = 38;
  const contentWidth = pageWidth - contentX * 2;
  const clean = (value: string | undefined) => value?.trim() || "-";
  const humanPeriod = /^\d{4}-\d{2}$/.test(period)
    ? new Intl.DateTimeFormat("en-KE", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${period}-01T00:00:00Z`))
    : period;
  const variableRows = (
    kind: "Earning" | "Deduction",
    maxRows: number,
  ): [string, number][] => {
    const rows = pay.inputs
      .filter((item) => item.kind === kind && Number(item.amount) > 0)
      .map(
        (item) =>
          [
            item.description.trim() || `Other ${kind.toLowerCase()}`,
            Number(item.amount),
          ] as [string, number],
      );
    if (rows.length <= maxRows) return rows;
    return [
      ...rows.slice(0, maxRows - 1),
      [
        `Other ${kind === "Earning" ? "earnings" : "deductions"}`,
        rows
          .slice(maxRows - 1)
          .reduce((total, [, amount]) => total + amount, 0),
      ],
    ];
  };

  const earnings: [string, number][] = [
    ["Basic salary", pay.basic],
    ...variableRows("Earning", 5),
  ];
  if (pay.earnings > 0 && earnings.length === 1)
    earnings.push(["Other earnings", pay.earnings]);
  const deductions: [string, number][] = [
    ["SHIF", pay.sha],
    ["NSSF", pay.nssf],
    ["Affordable Housing Levy", pay.housing],
    ["PAYE", pay.paye],
    ...variableRows("Deduction", 2),
  ];

  const labelValue = (
    label: string,
    value: string,
    x: number,
    y: number,
    width: number,
  ) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(6.5)
      .fillColor(muted)
      .text(label.toUpperCase(), x, y, { width, characterSpacing: 0.3 });
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(ink)
      .text(value, x, y + 12, { width, height: 14, ellipsis: true });
  };
  const payTable = (
    title: string,
    rows: [string, number][],
    totalLabel: string,
    total: number,
    x: number,
    y: number,
    width: number,
  ) => {
    doc.roundedRect(x, y, width, 212, 6).fillAndStroke("#FFFFFF", border);
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(navy)
      .text(title.toUpperCase(), x + 14, y + 14, { characterSpacing: 0.6 });
    doc
      .font("Helvetica-Bold")
      .fontSize(6.5)
      .fillColor(muted)
      .text("DESCRIPTION", x + 14, y + 38)
      .text("AMOUNT (KES)", x + width - 94, y + 38, {
        width: 80,
        align: "right",
      });
    doc
      .moveTo(x + 14, y + 52)
      .lineTo(x + width - 14, y + 52)
      .strokeColor(border)
      .stroke();
    let rowY = y + 64;
    rows.slice(0, 6).forEach(([description, amount]) => {
      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(ink)
        .text(description, x + 14, rowY, {
          width: width - 118,
          height: 13,
          ellipsis: true,
        })
        .font("Helvetica-Bold")
        .text(kes(amount).replace("Ksh ", ""), x + width - 94, rowY, {
          width: 80,
          align: "right",
        });
      rowY += 21;
    });
    const totalY = y + 174;
    doc.roundedRect(x + 10, totalY, width - 20, 28, 4).fill(wash);
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(navy)
      .text(totalLabel.toUpperCase(), x + 20, totalY + 9)
      .fontSize(9)
      .text(kes(total), x + width - 116, totalY + 8, {
        width: 92,
        align: "right",
      });
  };

  doc.rect(0, 0, pageWidth, 118).fill(navy);
  doc.image(join(process.cwd(), "public", "kingdom-flow-logo.png"), 38, 24, {
    fit: [62, 62],
    align: "center",
    valign: "center",
  });
  doc
    .font("Helvetica-Bold")
    .fontSize(17)
    .fillColor("#FFFFFF")
    .text(church, 116, 28, { width: 300, height: 24, ellipsis: true })
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#DCE6F2")
    .text("CONFIDENTIAL PAYROLL DOCUMENT", 116, 57, {
      characterSpacing: 0.7,
    });
  doc
    .roundedRect(430, 24, 127, 66, 6)
    .fill("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(blue)
    .text("EMPLOYEE PAYSLIP", 443, 37, { width: 101, align: "right" })
    .fontSize(13)
    .fillColor(navy)
    .text(humanPeriod, 443, 56, { width: 101, align: "right" });
  doc.rect(0, 112, pageWidth, 6).fill(gold);

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(navy)
    .text("EMPLOYEE DETAILS", contentX, 139, { characterSpacing: 0.6 });
  doc
    .roundedRect(contentX, 158, contentWidth, 100, 6)
    .fillAndStroke(wash, border);
  const colWidth = 116;
  labelValue("Employee", pay.name, 52, 174, 205);
  labelValue("Staff number", pay.staffNo, 278, 174, colWidth);
  labelValue("Department", clean(pay.departmentName), 414, 174, 128);
  labelValue("National ID", clean(pay.nationalId), 52, 216, colWidth);
  labelValue("KRA PIN", clean(pay.kraPin), 188, 216, colWidth);
  labelValue("NSSF number", clean(pay.nssfNo), 324, 216, colWidth);
  labelValue("SHIF number", clean(pay.shaNo), 460, 216, 82);

  doc.roundedRect(contentX, 274, contentWidth, 76, 6).fill(navy);
  const summary = [
    ["GROSS PAY", kes(pay.gross)],
    ["TOTAL DEDUCTIONS", kes(pay.gross - pay.net)],
    ["NET PAY", kes(pay.net)],
  ];
  summary.forEach(([label, value], index) => {
    const x = contentX + index * (contentWidth / 3);
    if (index)
      doc.moveTo(x, 289).lineTo(x, 335).strokeColor("#3A4B64").stroke();
    doc
      .font("Helvetica-Bold")
      .fontSize(6.5)
      .fillColor(index === 2 ? "#E7C979" : "#B8C6D8")
      .text(label, x + 18, 291, {
        width: contentWidth / 3 - 36,
        align: index === 2 ? "right" : "left",
        characterSpacing: 0.4,
      })
      .fontSize(index === 2 ? 16 : 13)
      .fillColor("#FFFFFF")
      .text(value, x + 18, 311, {
        width: contentWidth / 3 - 36,
        align: index === 2 ? "right" : "left",
      });
  });

  const tableY = 370;
  const tableWidth = (contentWidth - 14) / 2;
  payTable(
    "Earnings",
    earnings,
    "Total earnings",
    pay.gross,
    contentX,
    tableY,
    tableWidth,
  );
  payTable(
    "Deductions",
    deductions,
    "Total deductions",
    pay.gross - pay.net,
    contentX + tableWidth + 14,
    tableY,
    tableWidth,
  );

  const detailsY = 600;
  doc
    .roundedRect(contentX, detailsY, contentWidth, 112, 6)
    .fillAndStroke("#FFFFFF", border);
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(navy)
    .text("PAYROLL DETAILS", 52, detailsY + 14, { characterSpacing: 0.6 });
  labelValue("Days paid", String(pay.days), 52, detailsY + 38, 80);
  labelValue("Taxable pay", kes(pay.taxable), 151, detailsY + 38, 116);
  labelValue("Personal relief", kes(pay.relief), 286, detailsY + 38, 116);
  labelValue("Payment method", clean(pay.bank), 421, detailsY + 38, 121);
  labelValue("Payment account", clean(pay.account), 52, detailsY + 78, 215);
  labelValue(
    "Employer contributions",
    `${kes(pay.employerNssf + pay.employerHousing)} total`,
    286,
    detailsY + 78,
    256,
  );

  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fillColor(muted)
    .text(
      "This payslip is system-generated from an approved payroll. Report any discrepancy to your church administrator.",
      contentX,
      738,
      { width: contentWidth, align: "center" },
    );
  doc
    .moveTo(contentX, 775)
    .lineTo(contentX + contentWidth, 775)
    .strokeColor(border)
    .stroke();
  doc
    .font("Helvetica-Bold")
    .fontSize(7)
    .fillColor(navy)
    .text("KINGDOMFLOW", contentX, 789, { lineBreak: false })
    .font("Helvetica")
    .fillColor(muted)
    .text(`Payslip ${pay.staffNo} / ${period}`, contentX + 160, 789, {
      width: 190,
      align: "center",
      lineBreak: false,
    })
    .text("Page 1 of 1", pageWidth - 103, 789, {
      width: 65,
      align: "right",
      lineBreak: false,
    });

  doc.end();
  return { bytes: await done, type: "application/pdf", extension: "pdf" };
}
export function csvCell(value: string | number) {
  const text =
    typeof value === "number"
      ? String(value)
      : /^[=+\-@\t\r]/.test(value)
        ? `'${value}`
        : value;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function payeReportFile(rows: ReportRow[]) {
  const book = new ExcelJS.Workbook();
  book.creator = "KingdomFlow";
  book.lastModifiedBy = "KingdomFlow";

  const sheet = book.addWorksheet("Detailed Individual Payment Bre");
  const headers: Array<string | null> = [
    "TAX PIN",
    "NAMES",
    "RESIDENT STATUS",
    "TYPE OF EMPLOYEE",
    "PWD",
    null,
    "GROSS PAY",
    "CAR BENEFIT",
    "MEALS",
    "NON CASH BENEFITS",
    "TYPE OF HOUSE GIVEN",
    null,
    "OTHER BENEFITS",
    null,
    "SHIF",
    "NSSF",
    "OTHER PENSION",
    "POST RETIREMENT MEDICAL",
    "MORTGAGE INTEREST",
    "AHL",
    null,
    "MONTHLY PERSONAL RELIEF",
    "INSURANCE RELIEF",
    null,
    "SELF ASSESMENT PAYE",
  ];
  sheet.addRow(headers);
  rows.forEach((row) => sheet.addRow(row));

  sheet.columns = [
    18, 34, 18, 20, 10, 4, 14, 14, 14, 18, 18, 16, 16, 4, 12, 12, 14, 18,
    18, 12, 4, 18, 16, 4, 18,
  ].map((width) => ({ width }));

  const header = sheet.getRow(1);
  header.font = { name: "Calibri", size: 11, bold: true };
  header.alignment = { horizontal: "center", vertical: "middle" };
  header.height = 15;

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    row.font = { name: "Calibri", size: 11 };
    for (const columnNumber of [7, 8, 9, 10, 13, 15, 16, 17, 18, 19, 20, 22, 23, 25]) {
      row.getCell(columnNumber).numFmt = "#,##0.00";
    }
  }

  return {
    bytes: Buffer.from(await book.xlsx.writeBuffer()),
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extension: "xlsx",
  };
}

export async function reportFile(
  title: string,
  church: string,
  headers: string[],
  rows: ReportRow[],
  format: string,
) {
  if (format === "csv")
    return {
      bytes: Buffer.from(
        [headers, ...rows]
          .map((row) => row.map(csvCell).join(","))
          .join("\r\n"),
      ),
      type: "text/csv; charset=utf-8",
      extension: "csv",
    };
  if (format === "xlsx") {
    const book = new ExcelJS.Workbook();
    book.creator = "KingdomFlow";
    const sheet = book.addWorksheet(
      title.slice(0, 31).replace(/[\[\]*?:/\\]/g, ""),
    );
    sheet.addRow([church]);
    sheet.addRow([title]);
    sheet.addRow([`Generated ${new Date().toISOString()}`]);
    sheet.addRow(headers);
    rows.forEach((row) => sheet.addRow(row));
    sheet.views = [{ state: "frozen", ySplit: 4 }];
    sheet.getRow(4).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(4).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    };
    sheet.columns.forEach((c) => {
      c.width = 23;
    });
    sheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: headers.length },
    };
    return {
      bytes: Buffer.from(await book.xlsx.writeBuffer()),
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      extension: "xlsx",
    };
  }
  if (format !== "pdf") throw new Error("Choose PDF, Excel or CSV.");
  const doc = new PDFDocument({
    size: "A4",
    layout: headers.length > 5 ? "landscape" : "portrait",
    margin: 36,
    bufferPages: true,
  });
  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  const heading = () => {
    doc.image(join(process.cwd(), "public", "kingdom-flow-logo.png"), 36, 36, {
      width: 32,
      height: 32,
    });
    doc.y = 36;
    doc
      .fillColor("#2563eb")
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("KingdomFlow", 80);
    doc.fillColor("#17211e").fontSize(12).text(church);
    doc.fontSize(11).text(title);
    doc
      .font("Helvetica")
      .fontSize(8)
      .text(`Generated ${new Date().toISOString()}`);
    doc.moveDown();
    doc.x = 36;
  };
  heading();
  const width = (doc.page.width - 72) / headers.length;
  const row = (values: ReportRow, bold = false) => {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(8);
    const height = Math.max(
      22,
      ...values.map(
        (value) => doc.heightOfString(String(value), { width: width - 8 }) + 10,
      ),
    );
    if (doc.y + height > doc.page.height - 50) {
      doc.addPage();
      heading();
      row(headers, true);
    }
    const y = doc.y;
    values.forEach((value, index) => {
      doc.text(String(value), 36 + index * width, y, {
        width: width - 8,
        height,
      });
    });
    doc
      .moveTo(36, y + height)
      .lineTo(doc.page.width - 36, y + height)
      .strokeColor("#dce3eb")
      .stroke();
    doc.y = y + height + 3;
  };
  row(headers, true);
  rows.forEach((r) => row(r));
  const range = doc.bufferedPageRange();
  for (let page = range.start; page < range.start + range.count; page++) {
    doc.switchToPage(page);
    doc
      .fontSize(8)
      .fillColor("#596579")
      .text(
        `Confidential - ${page + 1} / ${range.count}`,
        36,
        doc.page.height - 32,
        { lineBreak: false },
      );
  }
  doc.end();
  return { bytes: await done, type: "application/pdf", extension: "pdf" };
}
