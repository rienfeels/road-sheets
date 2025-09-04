import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SheetsList from "../ui/SheetsList";

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
    <main style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Sheets</h1>
        <Link href="/sheets/new">New Sheet</Link>
      </div>

      <SheetsList sheets={sheets} />
    </main>
  );
}
