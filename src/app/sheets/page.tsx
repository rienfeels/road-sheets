import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SheetsList from "../ui/SheetsList";
// import UnreadBannerWrapper from "@/components/UnreadBannerWrapper";

export default async function SheetsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isAdmin = (session.user as any)?.role === "ADMIN";
  const email = session.user?.email || "";

  const sheets = await prisma.sheet.findMany({
    where: isAdmin ? {} : { driver: { email } },
    include: { driver: true, job: true },
    orderBy: { date: "desc" },
    take: 100,
  });

  return (
    <main className="page-wrapper">
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 0",
          borderBottom: "1px solid #e5e7eb",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>
          Sheets
        </h1>
        <Link
          href="/sheets/new"
          style={{
            background: "#1f883d",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: 6,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          + New Sheet
        </Link>
      </div>

      {/* Content area */}
      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: "1rem",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <SheetsList sheets={sheets} />
      </div>
    </main>
  );
}
