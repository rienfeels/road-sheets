"use client";

import { useState } from "react";
import Link from "next/link";

export default function SheetsList({ sheets }: { sheets: any[] }) {
  const [query, setQuery] = useState("");

  const filtered = sheets.filter((s) => {
    const road = (s.materials as any)?.road_name ?? "";
    const job = s.job?.name ?? "";
    const contractor = (s.materials as any)?.contractor ?? "";
    const driver = s.driver?.name ?? "";
    const haystack = [road, job, contractor, driver, s.notes ?? ""]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="container">
      <input
        type="text"
        className="search"
        placeholder="Search sheets…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p>No matching sheets.</p>
      ) : (
        <div className="cards">
          {filtered.map((s) => {
            const road = (s.materials as any)?.road_name ?? "";
            return (
              <div key={s.id} className="card">
                <div className="card-head">
                  <strong>
                    {new Date(s.date).toLocaleDateString()}
                    {road ? ` • ${road}` : ""}
                    {s.job?.name ? ` • ${s.job.name}` : ""}
                  </strong>
                  <span className="muted small">{s.driver?.name ?? "—"}</span>
                </div>
                <div className="muted small">
                  Miles: {s.miles ?? 0} •{" "}
                  <span className={`badge ${s.status}`}>{s.status}</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Link href={`/sheets/${s.id}`} className="btn btn-outline">
                    Open
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
