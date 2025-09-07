import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const msgs = await prisma.message.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(msgs);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const msg = await prisma.message.create({
    data: {
      title: body.title,
      body: body.body,
      audience: body.audience ?? "ALL",
      published: body.published ?? true,
    },
  });
  return NextResponse.json(msg);
}
