import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// optional during debugging
// export const runtime = "nodejs";

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
    if (!me)
      return NextResponse.json(
        { error: "Unauthorized (user not found)" },
        { status: 401 }
      );

    const body = await req.json();

    const dateSubmitted: string | undefined = body.date_submitted;
    const milesNum = Number(body.miles ?? 0);
    const safeMiles = Number.isNaN(milesNum) ? 0 : milesNum;

    const sheet = await prisma.sheet.create({
      data: {
        date: dateSubmitted ? new Date(dateSubmitted) : new Date(),
        driverId: me.id,
        miles: safeMiles,
        notes: body.notes ?? "",
        materials: {
          road_name: body.road_name ?? "",
          contract_number: body.contract_number ?? "",
          contractor: body.contractor ?? "",
          workers: body.workers ?? "",
          color: body.color ?? "",
          material: body.material ?? "",
          dot_employee: !!body.dot_employee,
          dot_employee_name: body.dot_employee_name ?? "",
          hand_work: !!body.hand_work,
          stop_bars: body.stop_bars ?? "",
          arrows: body.arrows ?? "",
          onlys: body.onlys ?? "",
          railroad_crossing: body.railroad_crossing ?? "",
          rpm: body.rpm ?? "",
          white_line_type: body.white_line_type ?? "",
          white_solid_footage: Number(body.white_solid_footage || 0),
          white_solid_size: body.white_solid_size ?? "",
          white_skip_footage: Number(body.white_skip_footage || 0),
          white_skip_size: body.white_skip_size ?? "",
          yellow_line_type: body.yellow_line_type ?? "",
          yellow_solid_footage: Number(body.yellow_solid_footage || 0),
          yellow_solid_size: body.yellow_solid_size ?? "",
          yellow_skip_footage: Number(body.yellow_skip_footage || 0),
          yellow_skip_size: body.yellow_skip_size ?? "",
          job_time_arrived: body.job_time_arrived ?? "",
          job_time_finished: body.job_time_finished ?? "",
        },
        status: "SUBMITTED", // valid per your enum
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
