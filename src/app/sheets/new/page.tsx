import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewSheetForm from "./ui/NewSheetForm";

export default async function NewSheetPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <main style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
        New Sheet
      </h1>
      <NewSheetForm />
    </main>
  );
}
