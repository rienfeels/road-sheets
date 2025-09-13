import NewSheetForm from "@/app/sheets/new/ui/NewSheetForm";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EditSheetPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sheet = await prisma.sheet.findUnique({
    where: { id: params.id },
    include: { driver: true, job: true },
  });

  if (!sheet) redirect("/sheets");

  return <NewSheetForm sheetId={sheet.id} initialData={sheet} />;
}
