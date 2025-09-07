import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ConfirmDeleteButton } from "./ui/ConfirmDeleteButton";

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

  // Flatten materials JSON for easy access
  const m = (sheet.materials as any) || {};

  return (
    <main className="paper">
      <h1 className="paper-header">
        {m.road_name || sheet.job?.name || "Unnamed Road"} •{" "}
        {new Date(sheet.date).toLocaleDateString()}
      </h1>

      <div className="paper-grid">
        {/* ---- LEFT COLUMN ---- */}
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
            <span>{m.job_time_arrived || "-"}</span>
          </div>
          <div className="form-row">
            <label>Job Time Finished</label>
            <span>{m.job_time_finished || "-"}</span>
          </div>

          {/* Paint, RPM, Grinding */}
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
                `ARROWS`,
                `COMBO`,
                `STENCIL`,
                `Speed Hump`,
              ])}
            </tbody>
          </table>

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

          <div className="paper-title">GRINDING</div>
          <table className="paper-table">
            <tbody>{renderRows("grinding", m, [`4" WIDE`, `24" WIDE`])}</tbody>
          </table>
        </div>

        {/* ---- RIGHT COLUMN ---- */}
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
                `ARROW`,
                `COMBO`,
                `Speed Hump`,
              ])}
            </tbody>
          </table>

          <div className="paper-title">NOTES</div>
          <p style={{ whiteSpace: "pre-wrap" }}>{sheet.notes || "-"}</p>
        </div>
      </div>

      {/* ---- Actions ---- */}
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
        {isAdmin && (
          <form action={deleteSheetAction.bind(null, sheet.id)}>
            <ConfirmDeleteButton confirmText="Delete this sheet? This cannot be undone. You will be returned to all sheets.">
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
    // normalize label → key used in DB
    const key = label.replace(/[^a-z0-9]+/gi, "_").toLowerCase();

    // Look inside the nested section (paint, rpm, thermo, etc.)
    const section = m[prefix] || {};
    const value = section[key] ?? "-";

    return (
      <tr key={label}>
        <td>{label}</td>
        <td align="right">{value}</td>
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
