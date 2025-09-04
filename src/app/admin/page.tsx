import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const isAdmin = (session.user as any)?.role === "ADMIN";
  if (!isAdmin) redirect("/");

  const [users, sheets, jobs, vehicles] = await Promise.all([
    prisma.user.count(),
    prisma.sheet.count(),
    prisma.job.count(),
    prisma.vehicle.count(),
  ]);

  return (
    <main style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Admin</h1>
      <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
        <Stat label="Users" value={users} />
        <Stat label="Sheets" value={sheets} />
        <Stat label="Jobs" value={jobs} />
        <Stat label="Vehicles" value={vehicles} />
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "12px 14px",
        background: "#fff",
      }}
    >
      <strong>{label}:</strong> <span>{value}</span>
    </div>
  );
}
