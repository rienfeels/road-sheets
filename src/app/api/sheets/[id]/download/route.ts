import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const sheet = await prisma.sheet.findUnique({
    where: { id: params.id },
    include: { driver: true, job: true },
  });
  if (!sheet) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const m = (sheet.materials as any) || {};
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]); // Letter size
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const drawText = (text: string, x: number, y: number, size = 9) => {
    page.drawText(String(text ?? "-"), {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  // Draw section with borders
  const drawSection = (
    title: string,
    rows: [string, any][],
    x: number,
    startY: number,
    width = 260
  ) => {
    const rowHeight = 16;
    const headerHeight = 18;
    const boxHeight = rows.length * rowHeight + headerHeight;

    // Outer box
    page.drawRectangle({
      x,
      y: startY - boxHeight,
      width,
      height: boxHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    // Header bar
    page.drawRectangle({
      x,
      y: startY - headerHeight,
      width,
      height: headerHeight,
      color: rgb(0.9, 0.9, 0.9),
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    drawText(title, x + 4, startY - 12, 10);

    let y = startY - headerHeight;
    for (const [label, value] of rows) {
      // Row line
      page.drawLine({
        start: { x, y },
        end: { x: x + width, y },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });
      drawText(label, x + 4, y - 12, 8);
      drawText(String(value ?? "-"), x + width / 2, y - 12, 8);
      y -= rowHeight;
    }

    return startY - boxHeight - 20;
  };

  // Layout: two columns like the paper sheet
  let leftY = 740;
  let rightY = 740;
  const leftX = 40;
  const rightX = 320;

  // LEFT COLUMN
  leftY = drawSection(
    "Job Details",
    [
      ["Date", new Date(sheet.date).toLocaleDateString()],
      ["Road", m.road_name],
      ["Contractor", m.contractor],
      ["File #", m.contract_number],
      ["Workers", m.workers],
      ["Arrived", m.job_time_arrived],
      ["Finished", m.job_time_finished],
    ],
    leftX,
    leftY
  );

  leftY = drawSection(
    "PAINT",
    Object.entries(m.paint || {}).map(([k, v]) => [k.replace(/_/g, " "), v]),
    leftX,
    leftY
  );

  leftY = drawSection(
    "RPM",
    Object.entries(m.rpm || {}).map(([k, v]) => [k.replace(/_/g, " "), v]),
    leftX,
    leftY
  );

  leftY = drawSection(
    "GRINDING",
    Object.entries(m.grinding || {}).map(([k, v]) => [k.replace(/_/g, " "), v]),
    leftX,
    leftY
  );

  // RIGHT COLUMN
  rightY = drawSection(
    "Admin / Totals",
    [
      ["DOT Employee", m.dot_employee ? "Yes" : "No"],
      ["DOT Name/ID", m.dot_employee_name],
      ["Invoice #", m.invoice_number],
      ["FED Payroll", m.fed_payroll],
      ["Job Totals", m.job_totals],
      ["Daily Minimum", m.daily_minimum],
      ["Location", m.location],
    ],
    rightX,
    rightY
  );

  rightY = drawSection(
    "THERMO",
    Object.entries(m.thermo || {}).map(([k, v]) => [k.replace(/_/g, " "), v]),
    rightX,
    rightY
  );

  rightY = drawSection("NOTES", [["Notes", sheet.notes]], rightX, rightY);

  const bytes = await pdf.save();
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="sheet-${sheet.id}.pdf"`,
    },
  });
}
