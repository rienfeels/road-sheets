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

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]); // Letter
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const draw = (text: string, x: number, y: number, size = 12) =>
    page.drawText(text, { x, y, size, font, color: rgb(0.15, 0.15, 0.2) });

  let y = 760;
  draw("FIELDS SPECIALTY CONTRACTORS — DAILY WORK SHEET", 40, y, 14);
  y -= 24;
  draw(`Date: ${new Date(sheet.date).toLocaleDateString()}`, 40, y);
  draw(`Driver: ${sheet.driver?.name ?? "-"}`, 260, y);
  y -= 18;
  const m = (sheet.materials as any) || {};
  draw(`Road: ${m.road_name ?? "-"}`, 40, y);
  draw(`Contractor: ${m.contractor ?? "-"}`, 260, y);
  y -= 18;
  draw(`Arrived: ${m.job_time_arrived ?? "-"}`, 40, y);
  draw(`Finished: ${m.job_time_finished ?? "-"}`, 260, y);
  y -= 24;

  draw("Totals", 40, y);
  y -= 16;
  draw(`Miles: ${sheet.miles ?? 0}`, 40, y);
  draw(`Material: ${m.material ?? "-"}`, 260, y);
  y -= 24;

  // dump a few key lines from materials (example)
  const keys = Object.keys(m).filter(
    (k) =>
      k.startsWith("paint_") ||
      k.startsWith("thermo_") ||
      k.startsWith("tape_") ||
      k.startsWith("grinding_") ||
      k.startsWith("rpm_")
  );
  draw("Line Items:", 40, y);
  y -= 16;
  for (const k of keys.slice(0, 40)) {
    // basic pagination safety
    const val = m[k];
    if (val && Number(val) > 0) {
      draw(`${k.replaceAll("_", " ").toUpperCase()}: ${val}`, 48, y);
      y -= 14;
      if (y < 60) break;
    }
  }

  const bytes = await pdf.save();
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="sheet-${sheet.id}.pdf"`,
    },
  });
}
