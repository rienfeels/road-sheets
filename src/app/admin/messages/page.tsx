import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateMessageClient from "@/components/CreateMessageClient";

export default async function AdminMessagesPage() {
  const session = await getSession();
  if (!session || (session.user as any)?.role !== "ADMIN") redirect("/");

  return (
    <main className="page-wrapper">
      <h1 className="page-title">Admin Messages</h1>

      {/* Client-side form for creating messages */}
      <CreateMessageClient />
    </main>
  );
}
