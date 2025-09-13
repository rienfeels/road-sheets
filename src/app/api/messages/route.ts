import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET all messages (filtered by audience + with read/unread per current user)
export async function GET() {
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json([], { status: 200 });
  }

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!me) return NextResponse.json([], { status: 200 });

  const role = me.role;

  // Fetch messages for this role (ALL + matching role)
  const messages = await prisma.message.findMany({
    where: {
      published: true,
      OR: [{ audience: "ALL" }, { audience: role }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      reads: {
        where: { userId: me.id },
        select: { id: true },
      },
    },
  });

  // Add `read` flag
  const result = messages.map((m) => ({
    id: m.id,
    title: m.title,
    body: m.body,
    audience: m.audience,
    published: m.published,
    createdAt: m.createdAt,
    read: m.reads.length > 0,
  }));

  return NextResponse.json(result);
}

// POST create new message (Admins only)
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
