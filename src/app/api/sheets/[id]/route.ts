import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

function normalizeMaterials(body: any) {
  return {
    road_name: body.road_name ?? "",
    contract_number: body.contract_number ?? "",
    contractor: body.contractor ?? "",
    workers: body.workers ?? "",
    dot_employee: !!body.dot_employee,
    dot_employee_name: body.dot_employee_name ?? "",
    dot_employee_email: body.dot_employee_email ?? "",
    invoice_number: body.invoice_number ?? "",
    fed_payroll: body.fed_payroll ?? "",
    job_totals: body.job_totals ?? "",
    daily_minimum: body.daily_minimum ?? "",
    location: body.location ?? "",
    job_time_arrived: body.job_time_arrived ?? "",
    job_time_finished: body.job_time_finished ?? "",

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
      only: Number(body.paint_only || 0),
      rxr: Number(body.paint_rxr || 0),
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
      only: Number(body.thermo_only || 0),
      rxr: Number(body.thermo_rxr || 0),
    },
  };
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!me) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const sheet = await prisma.sheet.findUnique({
      where: { id: params.id },
    });
    if (!sheet) {
      return NextResponse.json({ error: "Sheet not found" }, { status: 404 });
    }

    // normalize before merge
    const updatedMaterials = normalizeMaterials(body);
    const mergedMaterials = {
      ...(sheet.materials as any),
      ...updatedMaterials,
    };

    const updated = await prisma.sheet.update({
      where: { id: params.id },
      data: {
        date: body.date_submitted ? new Date(body.date_submitted) : sheet.date,
        notes: body.notes ?? sheet.notes,
        miles: body.miles ?? sheet.miles,
        materials: mergedMaterials,
      },
    });

    return NextResponse.json({ id: updated.id }, { status: 200 });
  } catch (err: any) {
    console.error("Update sheet failed:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update sheet" },
      { status: 500 }
    );
  }
}
