// src/app/messages/page.tsx
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isAdmin = (session.user as any)?.role === "ADMIN";

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const hdrs = headers();
  const res = await fetch(`${baseUrl}/api/messages`, {
    cache: "no-store",
    headers: {
      cookie: hdrs.get("cookie") ?? "",
    },
  });

  if (!res.ok) {
    return (
      <main className="page-wrapper">
        <div className="page-header">
          <h1 className="page-title">Messages</h1>
          {isAdmin && (
            <a
              href="/admin/messages"
              style={{
                background: "#2563eb",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              + New Message
            </a>
          )}
        </div>
        <p>Failed to load messages.</p>
      </main>
    );
  }

  const msgs = await res.json();

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
        <h1 className="page-title">Messages</h1>
        {isAdmin && (
          <a
            href="/admin/messages"
            style={{
              background: "#2563eb",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            + New Message
          </a>
        )}
      </div>

      {!msgs || msgs.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <ul>
          {msgs.map((m: any) => (
            <li
              key={m.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                marginBottom: "12px",
                background: m.read ? "#f9fafb" : "#fff7ed",
              }}
            >
              <Link
                href={`/messages/${m.id}`}
                style={{
                  display: "block",
                  padding: "12px",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h2 style={{ fontWeight: 600, fontSize: "1.2rem" }}>
                    {m.title}
                  </h2>
                  <span
                    style={{
                      fontSize: 12,
                      padding: "2px 8px",
                      borderRadius: 999,
                      border: "1px solid #e5e7eb",
                      background: m.read ? "#eef2ff" : "#fee2e2",
                      color: m.read ? "#374151" : "#991b1b",
                    }}
                  >
                    {m.read ? "Read" : "Unread"}
                  </span>
                </div>
                {/* keep formatting of message body */}
                <p
                  style={{
                    marginTop: 6,
                    marginBottom: 6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.body}
                </p>
                <small style={{ color: "#555" }}>
                  {new Date(m.createdAt).toLocaleString()}
                </small>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
