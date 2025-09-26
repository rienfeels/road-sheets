import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ConfirmDeleteButton } from "./ui/ConfirmDeleteButton";
import ConfirmSendButton from "@/components/ConfirmSendButton";

function labelToKey(label: string) {
  return label
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function formatTime(timeStr?: string) {
  if (!timeStr) return "-";
  const [hourStr, minute] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  if (isNaN(hour)) return timeStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
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

  const m = (sheet.materials as any) || {};

  return (
    <main className="paper">
      <h1 className="paper-header">
        {m.road_name || sheet.job?.name || "Unnamed Road"} •{" "}
        {new Date(sheet.date).toLocaleDateString()}
      </h1>

      <div className="paper-grid">
        {/* LEFT */}
        <div className="paper-section">
          <div className="paper-title">Job Details</div>
          <div className="form-row">
            <label>Date</label>
            <span>{new Date(sheet.date).toLocaleDateString()}</span>
          </div>
          <div className="form-row">
            <label>Road</label>
            <span>{m.road_name || sheet.job?.name || "-"}</span>
          </div>
          <div className="form-row">
            <label>Contractor</label>
            <span>{m.contractor || "-"}</span>
          </div>
          <div className="form-row">
            <label>File #</label>
            <span>{m.contract_number || "-"}</span>
          </div>
          <div className="form-row">
            <label>Workers</label>
            <span>{m.workers || "-"}</span>
          </div>
          <div className="form-row">
            <label>Job Time Arrived</label>
            <span>{formatTime(m.job_time_arrived)}</span>
          </div>
          <div className="form-row">
            <label>Job Time Finished</label>
            <span>{formatTime(m.job_time_finished)}</span>
          </div>

          {/* PAINT */}
          <div className="paper-title">PAINT</div>
          <table className="paper-table">
            <tbody>
              {renderRows("paint", m, [
                `4" YEL SLD`,
                `4" YEL SKIP`,
                `4" WH SLD`,
                `4" WH SKIP`,
                `6" YEL SLD`,
                `6" YEL SKIP`,
                `6" WH SLD`,
                `6" WH SKIP`,
                `8" WH SLD`,
                `12" WH SLD`,
                `24" WH SLD`,
                `YIELD (12x18)`,
                `YIELD (24x36)`,
                `ARROWS`,
                `COMBO`,
                `ONLY`,
                `RxR`,
              ])}
            </tbody>
          </table>

          {/* RPM */}
          <div className="paper-title">RPM</div>
          <table className="paper-table">
            <tbody>
              {renderRows("rpm", m, [
                "AMBER_1_way",
                "AMBER_2_way",
                "CLEAR_1_way",
                "CLEAR_2_way",
              ])}
            </tbody>
          </table>

          {/* GRINDING */}
          <div className="paper-title">GRINDING</div>
          <table className="paper-table">
            <tbody>
              {renderRows("grinding", m, [`4" WIDE`, `24" WIDE`, `ARROWS`])}
            </tbody>
          </table>
        </div>

        {/* RIGHT */}
        <div className="paper-section">
          <div className="form-row">
            <label>DOT Employee</label>
            <span>{m.dot_employee ? "Yes" : "No"}</span>
          </div>
          {m.dot_employee_name && (
            <div className="form-row">
              <label>DOT Name/ID</label>
              <span>{m.dot_employee_name}</span>
            </div>
          )}
          {m.dot_employee_email && (
            <div className="form-row">
              <label>DOT Email</label>
              <span>{m.dot_employee_email}</span>
            </div>
          )}
          <div className="form-row">
            <label>Invoice #</label>
            <span>{m.invoice_number || "-"}</span>
          </div>
          <div className="form-row">
            <label>FED Payroll</label>
            <span>{m.fed_payroll || "-"}</span>
          </div>
          <div className="form-row">
            <label>Job Totals</label>
            <span>{m.job_totals || "-"}</span>
          </div>
          <div className="form-row">
            <label>Daily Minimum</label>
            <span>{m.daily_minimum || "-"}</span>
          </div>
          <div className="form-row">
            <label>Location</label>
            <span>{m.location || sheet.job?.locationId || "-"}</span>
          </div>
          <div className="form-row"></div>
          <div className="form-row"></div>
          <div className="form-row"></div>
          <div className="form-row"></div>
          <div className="form-row"></div>
          <div className="form-row"></div>
          <div className="form-row"></div>
          <div className="form-row"></div>

          {/* THERMO */}
          <div className="paper-title">THERMO</div>
          <table className="paper-table">
            <tbody>
              {renderRows("thermo", m, [
                `4" YEL SLD`,
                `4" YEL SKIP`,
                `4" WH SLD`,
                `4" WH SKIP`,
                `6" YEL SLD`,
                `6" WH SLD`,
                `6" WH SKIP`,
                `8" WH SLD`,
                `12" WH SLD`,
                `24" WH SLD`,
                `YIELD (12x18)`,
                `YIELD (24x36)`,
                `ARROW`,
                `COMBO`,
                `ONLY`,
                `RxR`,
              ])}
            </tbody>
          </table>

          <div className="paper-title">NOTES</div>
          <p style={{ whiteSpace: "pre-wrap" }}>{sheet.notes || "-"}</p>
        </div>
      </div>

      <div className="form-actions">
        <a href="/sheets" className="btn btn-secondary">
          Back
        </a>
        <a
          href={`/api/sheets/${sheet.id}/download`}
          className="btn btn-secondary"
        >
          Download
        </a>
        <a href={`/sheets/${sheet.id}/edit`} className="btn btn-primary">
          Edit
        </a>
        <ConfirmSendButton sheetId={sheet.id} />
        {isAdmin && (
          <form action={deleteSheetAction.bind(null, sheet.id)}>
            <ConfirmDeleteButton confirmText="Delete this sheet?">
              <span className="btn btn-danger">Delete</span>
            </ConfirmDeleteButton>
          </form>
        )}
      </div>
    </main>
  );
}

function renderRows(prefix: string, m: any, items: string[]) {
  return items.map((label) => {
    const base = labelToKey(label); // e.g. "yield_24x36"
    const alt = `${base}_`; // legacy accidental key: "yield_24x36_"
    const section = m[prefix] || {};

    // Prefer nested (correct) → then legacy nested → then flat (correct) → then flat (legacy)
    let value =
      section[base] ??
      section[alt] ??
      m[`${prefix}_${base}`] ??
      m[`${prefix}_${alt}`];

    return (
      <tr key={label}>
        <td>{label}</td>
        <td align="right">{value ?? "-"}</td>
      </tr>
    );
  });
}

async function deleteSheetAction(id: string) {
  "use server";
  const session = await getSession();
  if (!session) redirect("/login");
  await prisma.sheet.delete({ where: { id } });
  redirect("/sheets");
}
