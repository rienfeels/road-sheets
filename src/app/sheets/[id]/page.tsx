import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ConfirmSubmitButton } from "./ui/ConfirmSubmitButton";
import { ConfirmDeleteButton } from "./ui/ConfirmDeleteButton";

// ---- Server actions ----
async function updateSheetAction(id: string, formData: FormData) {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  const date = (formData.get("date") as string) || "";
  const miles = Number(formData.get("miles") || 0);
  const notes = (formData.get("notes") as string) || "";
  const materialsStr = (formData.get("materials") as string) || "";

  let materials: any = null;
  if (materialsStr.trim()) {
    try {
      materials = JSON.parse(materialsStr);
    } catch {
      materials = { raw: materialsStr };
    }
  }

  await prisma.sheet.update({
    where: { id },
    data: {
      date: date ? new Date(date) : undefined,
      miles: Number.isNaN(miles) ? 0 : miles,
      notes,
      materials,
      // OPTIONAL: keep status as-is; or set to SUBMITTED again, your choice
    },
  });

  // after confirm+save → go back to list
  redirect("/sheets");
}

async function deleteSheetAction(id: string) {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");

  await prisma.sheet.delete({ where: { id } });

  // after confirm+delete → go back to list
  redirect("/sheets");
}

export default async function SheetDetail({
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
  if (!sheet) notFound();

  const isAdmin = (session.user as any)?.role === "ADMIN";
  const isOwner = sheet.driver?.email === session.user?.email;
  if (!isAdmin && !isOwner) redirect("/sheets");

  const materialsPretty =
    sheet.materials && typeof sheet.materials === "object"
      ? JSON.stringify(sheet.materials, null, 2)
      : typeof sheet.materials === "string"
      ? sheet.materials
      : "";

  return (
    <main style={{ padding: "2rem", maxWidth: 800, display: "grid", gap: 14 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>
        Edit Sheet • {new Date(sheet.date).toLocaleDateString()}
      </h1>

      {/* --- Edit form --- */}
      <form
        action={updateSheetAction.bind(null, sheet.id)}
        style={{ display: "grid", gap: 10 }}
      >
        <Row>
          <label>Date</label>
          <input
            type="date"
            name="date"
            defaultValue={sheet.date.toISOString().slice(0, 10)}
            style={input}
            required
          />
        </Row>

        <Row>
          <label>Miles</label>
          <input
            type="number"
            name="miles"
            min={0}
            step={1}
            defaultValue={sheet.miles ?? 0}
            style={input}
          />
        </Row>

        <Row>
          <label>Notes</label>
          <textarea
            name="notes"
            rows={4}
            defaultValue={sheet.notes ?? ""}
            style={textarea}
          />
        </Row>

        <Row alignStart>
          <label>Materials (JSON or text)</label>
          <textarea
            name="materials"
            rows={10}
            defaultValue={materialsPretty}
            style={textarea}
            placeholder={`e.g. {"road_name":"Main St","color":"white"}`}
          />
        </Row>

        <div style={{ display: "flex", gap: 8 }}>
          <ConfirmSubmitButton confirmText="Save changes and return to all sheets?">
            <span style={primaryBtn as any}>Save</span>
          </ConfirmSubmitButton>

          <a href="/sheets" style={secondaryBtn as any}>
            Back
          </a>
        </div>
      </form>

      {/* --- Delete form --- */}
      <form action={deleteSheetAction.bind(null, sheet.id)}>
        <ConfirmDeleteButton confirmText="Delete this sheet? This cannot be undone. You will be returned to all sheets.">
          <span style={dangerBtn as any}>Delete</span>
        </ConfirmDeleteButton>
      </form>
    </main>
  );
}

function Row({
  children,
  alignStart,
}: {
  children: React.ReactNode;
  alignStart?: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        alignItems: alignStart ? "start" : "center",
        gap: 8,
      }}
    >
      {children}
    </div>
  );
}

const input: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
};
const textarea = input;

const primaryBtn: React.CSSProperties = {
  display: "inline-block",
  border: "1px solid #111827",
  background: "#111827",
  color: "#fff",
  borderRadius: 8,
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: 600,
};
const secondaryBtn: React.CSSProperties = {
  display: "inline-block",
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#111827",
  borderRadius: 8,
  padding: "10px 12px",
};
const dangerBtn: React.CSSProperties = {
  display: "inline-block",
  border: "1px solid #dc2626",
  background: "#dc2626",
  color: "#fff",
  borderRadius: 8,
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: 600,
};
