// src/app/api/sheets/[id]/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function formatTime(timeStr?: string) {
  if (!timeStr) return "-";
  const [hourStr, minute] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  if (isNaN(hour)) return timeStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sheet = await prisma.sheet.findUnique({
      where: { id: params.id },
      include: { driver: true, job: true },
    });

    if (!sheet) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const m = (sheet.materials as any) || {};
    const dotEmail = m.dot_employee_email;
    if (!dotEmail) {
      return NextResponse.json(
        { error: "No DOT email provided" },
        { status: 400 }
      );
    }

    // === build PDF (same as download route) ===
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([612, 792]);
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

      page.drawRectangle({
        x,
        y: startY - boxHeight,
        width,
        height: boxHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

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

    const paintOrder = [
      `4" YEL SLD`,
      `4" YEL SKIP`,
      `4" WH SLD`,
      `4" WH SKIP`,
      `6" YEL SLD`,
      `6" YEL SKIP`,
      `6" WH SLD`,
      `6" WH SKIP`,
      `8" WH SLD`,
      `12" WH SLD`,
      `24" WH SLD`,
      `YIELD (12x18)`,
      `YIELD (24x36)`,
      `ARROWS`,
      `COMBO`,
      `ONLY`,
      `RxR`,
    ];

    const rpmOrder = [
      "AMBER 1 way",
      "AMBER 2 way",
      "CLEAR 1 way",
      "CLEAR 2 way",
    ];
    const grindingOrder = [`4" WIDE`, `24" WIDE`, `ARROWS`];
    const thermoOrder = [
      `4" YEL SLD`,
      `4" YEL SKIP`,
      `4" WH SLD`,
      `4" WH SKIP`,
      `6" YEL SLD`,
      `6" WH SLD`,
      `6" WH SKIP`,
      `8" WH SLD`,
      `12" WH SLD`,
      `24" WH SLD`,
      `YIELD (12x18)`,
      `YIELD (24x36)`,
      `ARROW`,
      `COMBO`,
      `ONLY`,
      `RxR`,
    ];

    const getRows = (prefix: string, items: string[]) =>
      items.map((label) => {
        const key = label.replace(/[^a-z0-9]+/gi, "_").toLowerCase();
        const section = m[prefix] || {};
        return [label, section[key] ?? 0] as [string, any];
      });

    let leftY = 740;
    let rightY = 740;
    const leftX = 40;
    const rightX = 320;

    page.drawText("Fields Specialty Contractors", {
      x: 40,
      y: 770,
      size: 14,
      font,
    });
    page.drawText("Email: fieldsspecialty@gmail.com", {
      x: 40,
      y: 750,
      size: 10,
      font,
    });
    page.drawText("Office: (864) 876-3377", { x: 40, y: 735, size: 10, font });
    page.drawText("Darrell Fields: (864) 303-3275", {
      x: 40,
      y: 720,
      size: 10,
      font,
    });

    leftY = drawSection(
      "Job Details",
      [
        ["Date", new Date(sheet.date).toLocaleDateString()],
        ["Road", m.road_name],
        ["Contractor", m.contractor],
        ["File #", m.contract_number],
        ["Workers", m.workers],
        ["Arrived", formatTime(m.job_time_arrived)],
        ["Finished", formatTime(m.job_time_finished)],
      ],
      leftX,
      leftY
    );

    leftY = drawSection("PAINT", getRows("paint", paintOrder), leftX, leftY);
    leftY = drawSection("RPM", getRows("rpm", rpmOrder), leftX, leftY);
    leftY = drawSection(
      "GRINDING",
      getRows("grinding", grindingOrder),
      leftX,
      leftY
    );

    rightY = drawSection(
      "Admin / Totals",
      [
        ["DOT Employee", m.dot_employee ? "Yes" : "No"],
        ["DOT Name/ID", m.dot_employee_name],
        ["DOT Employee Email", m.dot_employee_email],
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
      getRows("thermo", thermoOrder),
      rightX,
      rightY
    );
    rightY = drawSection("NOTES", [["Notes", sheet.notes]], rightX, rightY);

    const pdfBytes = await pdf.save();

    // === send email via Resend ===
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: dotEmail,
      subject: `Road Sheet Confirmation: ${
        m.road_name || sheet.job?.name || sheet.id
      }`,
      text: "Attached is the confirmed road sheet PDF.",
      attachments: [
        {
          filename: `sheet-${sheet.id}.pdf`,
          content: Buffer.from(pdfBytes).toString("base64"),
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Confirm send failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to confirm/send" },
      { status: 500 }
    );
  }
}
