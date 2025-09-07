import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

function normalizeMaterials(body: any) {
  return {
    // Header info
    road_name: body.road_name ?? "",
    contract_number: body.contract_number ?? "",
    contractor: body.contractor ?? "",
    workers: body.workers ?? "",
    dot_employee: !!body.dot_employee,
    dot_employee_name: body.dot_employee_name ?? "",
    invoice_number: body.invoice_number ?? "",
    fed_payroll: body.fed_payroll ?? "",
    job_totals: body.job_totals ?? "",
    daily_minimum: body.daily_minimum ?? "",
    location: body.location ?? "",
    job_time_arrived: body.job_time_arrived ?? "",
    job_time_finished: body.job_time_finished ?? "",

    // Grouped sections
    paint: {
      "4_yel_sld": Number(body.paint_4_yel_sld || 0),
      "4_yel_skip": Number(body.paint_4_yel_skip || 0),
      "4_wh_sld": Number(body.paint_4_wh_sld || 0),
      "4_wh_skip": Number(body.paint_4_wh_skip || 0),
      "6_yel_sld": Number(body.paint_6_yel_sld || 0),
      "6_yel_skip": Number(body.paint_6_yel_skip || 0),
      "6_wh_sld": Number(body.paint_6_wh_sld || 0),
      "6_wh_skip": Number(body.paint_6_wh_skip || 0),
      "8_wh_sld": Number(body.paint_8_wh_sld || 0),
      "12_wh_sld": Number(body.paint_12_wh_sld || 0),
      "24_wh_sld": Number(body.paint_24_wh_sld || 0),
      yield: Number(body.paint_yield || 0),
      arrows: Number(body.paint_arrows || 0),
      combo: Number(body.paint_combo || 0),
      stencil: Number(body.paint_stencil || 0),
      speed_hump: Number(body.paint_speed_hump || 0),
    },
    rpm: {
      amber_1_way: Number(body.rpm_amber_1_way || 0),
      amber_2_way: Number(body.rpm_amber_2_way || 0),
      clear_1_way: Number(body.rpm_clear_1_way || 0),
      clear_2_way: Number(body.rpm_clear_2_way || 0),
    },
    grinding: {
      "4_wide": Number(body.grinding_4_wide || 0),
      "24_wide": Number(body.grinding_24_wide || 0),
    },
    thermo: {
      "4_yel_sld": Number(body.thermo_4_yel_sld || 0),
      "4_yel_skip": Number(body.thermo_4_yel_skip || 0),
      "4_wh_sld": Number(body.thermo_4_wh_sld || 0),
      "4_wh_skip": Number(body.thermo_4_wh_skip || 0),
      "6_yel_sld": Number(body.thermo_6_yel_sld || 0),
      "6_wh_sld": Number(body.thermo_6_wh_sld || 0),
      "6_wh_skip": Number(body.thermo_6_wh_skip || 0),
      "8_wh_sld": Number(body.thermo_8_wh_sld || 0),
      "12_wh_sld": Number(body.thermo_12_wh_sld || 0),
      "24_wh_sld": Number(body.thermo_24_wh_sld || 0),
      yield: Number(body.thermo_yield || 0),
      arrow: Number(body.thermo_arrow || 0),
      combo: Number(body.thermo_combo || 0),
      speed_hump: Number(body.thermo_speed_hump || 0),
    },
  };
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized (no session)" },
        { status: 401 }
      );
    }

    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!me) {
      return NextResponse.json(
        { error: "Unauthorized (user not found)" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const dateSubmitted: string | undefined = body.date_submitted;
    const safeDate = dateSubmitted ? new Date(dateSubmitted) : new Date();

    const sheet = await prisma.sheet.create({
      data: {
        date: safeDate,
        driverId: me.id,
        notes: body.notes ?? "",
        materials: normalizeMaterials(body),
        status: "SUBMITTED",
      },
    });

    return NextResponse.json({ id: sheet.id }, { status: 201 });
  } catch (err: any) {
    console.error("Create sheet failed:", err);
    const message =
      err?.meta?.cause || err?.message || "Failed to create sheet";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
