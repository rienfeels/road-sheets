import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";

// Mark the message as read for the current user
async function markAsRead(userId: string, messageId: string) {
  await prisma.messageRead.upsert({
    where: { userId_messageId: { userId, messageId } },
    update: {},
    create: { userId, messageId },
  });
}

export default async function MessageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { email: session.user?.email || "" },
  });
  if (!me) redirect("/login");

  const message = await prisma.message.findUnique({
    where: { id: params.id },
  });

  if (!message) {
    return (
      <main className="page-wrapper">
        <p>Message not found.</p>
        <Link href="/messages" className="btn btn-secondary">
          Back to Messages
        </Link>
      </main>
    );
  }

  // 🔹 Mark this message as read as soon as it’s viewed
  await markAsRead(me.id, message.id);

  return (
    <main className="page-wrapper">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "0.75rem",
        }}
      >
        <h1 className="page-title">{message.title}</h1>
        <Link
          href="/messages"
          style={{
            background: "#e5e7eb",
            color: "#111",
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          ← Back
        </Link>
      </div>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          padding: "16px",
          background: "#fff",
          whiteSpace: "pre-line", // 🔹 keep line breaks/formatting
        }}
      >
        <p style={{ marginBottom: "1rem" }}>{message.body}</p>
        <small style={{ color: "#555" }}>
          {new Date(message.createdAt).toLocaleString()}
        </small>
      </div>
    </main>
  );
}
