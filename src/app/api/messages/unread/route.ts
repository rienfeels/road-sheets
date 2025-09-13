// src/app/api/messages/unread/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json([], { status: 200 });
  }

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { MessageRead: true },
  });
  if (!me) return NextResponse.json([], { status: 200 });

  const readIds = me.MessageRead.map((r) => r.messageId);
  const roleStr = String(me.role); // ensure enum is compared as string

  const unread = await prisma.message.findMany({
    where: {
      published: true,
      audience: { in: ["ALL", roleStr] },
      NOT: { id: { in: readIds } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json(unread);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!me) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const body = await req.json();
  const ids: string[] = body.ids || [];

  await prisma.$transaction(
    ids.map((id) =>
      prisma.messageRead.upsert({
        where: { userId_messageId: { userId: me.id, messageId: id } },
        update: {},
        create: { userId: me.id, messageId: id },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
