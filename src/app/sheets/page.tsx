import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SheetsPage() {
  const session = await getSession();
  if (!session) redirect("/(auth)/login");

  const isAdmin = (session.user as any)?.role === "ADMIN";
  const email = session.user?.email || "";

  const sheets = await prisma.sheet.findMany({
    where: isAdmin ? {} : { driver: { email } },
    include: { driver: true, job: true, vehicle: true },
    orderBy: { date: "desc" },
    take: 100,
  });

  return (
    <main style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        Sheets
      </h1>

      {sheets.length === 0 ? (
        <p>No sheets yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {sheets.map((s) => (
            <div
              key={s.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "10px 12px",
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <strong>
                  {new Date(s.date).toLocaleDateString()} •{" "}
                  {s.job?.name ?? "No job"}
                </strong>
                <span style={{ color: "#6b7280" }}>
                  {s.driver?.name ?? "—"}
                </span>
              </div>
              <div style={{ marginTop: 4, fontSize: 13, color: "#374151" }}>
                Vehicle: {s.vehicle?.label ?? "—"} • Miles: {s.miles ?? 0} •
                Status: {s.status}
              </div>
              <div style={{ marginTop: 8 }}>
                <Link href={`/sheets/${s.id}`}>Open</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
