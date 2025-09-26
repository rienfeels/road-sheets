"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type FormDataState = {
  // Header info
  road_name: string;
  contract_number: string;
  contractor: string;
  workers: string;
  job_time_arrived: string;
  job_time_finished: string;
  dot_employee: boolean;
  dot_employee_name: string;
  date_submitted?: string;
  notes?: string;

  // Extra header fields
  invoice_number?: string;
  fed_payroll?: string;
  job_totals?: string;
  daily_minimum?: string;
  location?: string;

  // Dynamic material entries
  [key: string]: any;
};

const initialFormData: FormDataState = {
  road_name: "",
  contract_number: "",
  contractor: "",
  workers: "",
  job_time_arrived: "",
  job_time_finished: "",
  dot_employee: false,
  dot_employee_name: "",
  date_submitted: new Date().toISOString().slice(0, 10),
  notes: "",
  invoice_number: "",
  fed_payroll: "",
  job_totals: "",
  daily_minimum: "",
  location: "",
};

export default function NewSheetForm({
  sheetId,
  initialData,
}: {
  sheetId?: string;
  initialData?: any;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Load initial data in edit mode
  useEffect(() => {
    if (initialData) {
      const flat: any = {};

      const flattenSection = (prefix: string, section: Record<string, any>) => {
        for (const [k, v] of Object.entries(section || {})) {
          flat[`${prefix}_${k}`] = v;
        }
      };

      // Flatten each section
      flattenSection("paint", initialData.materials.paint);
      flattenSection("thermo", initialData.materials.thermo);
      flattenSection("rpm", initialData.materials.rpm);
      flattenSection("grinding", initialData.materials.grinding);

      setFormData({
        ...initialFormData,
        ...initialData.materials,
        ...flat, // <- ensures inputs like paint_only are populated
        date_submitted: initialData.date
          ? new Date(initialData.date).toISOString().slice(0, 10)
          : initialFormData.date_submitted,
        notes: initialData.notes || "",
      });
    }
  }, [initialData]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type, checked } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? !!checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const url = sheetId ? `/api/sheets/${sheetId}` : "/api/sheets";
      const method = sheetId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {}

      if (!res.ok) {
        throw new Error(
          data.error || `Failed to ${sheetId ? "update" : "create"} sheet`
        );
      }

      toast.success(sheetId ? "Sheet updated" : "Sheet submitted");
      router.push(`/sheets/${sheetId || data.id}`);
    } catch (err: any) {
      setSubmissionError(err.message || "Unknown error");
      toast.error("Save failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Utility to render rows
  const renderRows = (prefix: string, items: string[]) =>
    items.map((label) => {
      const key = `${prefix}_${label
        .replace(/[^a-z0-9]+/gi, "_")
        .toLowerCase()}`;
      return (
        <tr key={label}>
          <td>{label}</td>
          <td align="right">
            <input
              type="number"
              min={0}
              className="paper-qty"
              name={key}
              value={formData[key] || ""}
              onChange={handleChange}
            />
          </td>
        </tr>
      );
    });

  return (
    <form onSubmit={handleSubmit} className="paper">
      <div className="paper-grid">
        {/* ---- LEFT COLUMN ---- */}
        <div className="paper-section">
          <div className="paper-title"></div>

          <div className="form-row">
            <label>Date</label>
            <input
              type="date"
              name="date_submitted"
              value={formData.date_submitted}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-row">
            <label>Road</label>
            <input
              name="road_name"
              value={formData.road_name}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-row">
            <label>Contractor</label>
            <input
              name="contractor"
              value={formData.contractor}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-row">
            <label>File #</label>
            <input
              name="contract_number"
              value={formData.contract_number}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-row">
            <label>Workers</label>
            <input
              name="workers"
              value={formData.workers}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-row">
            <label>Job Time Arrived</label>
            <input
              type="time"
              name="job_time_arrived"
              value={formData.job_time_arrived}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-row">
            <label>Job Time Finished</label>
            <input
              type="time"
              name="job_time_finished"
              value={formData.job_time_finished}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Paint, RPM, Grinding */}
          <div className="paper-title">PAINT</div>
          <table className="paper-table">
            <tbody>
              {renderRows("paint", [
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

          <div className="paper-title">RPM</div>
          <table className="paper-table">
            <tbody>
              {renderRows("rpm", [
                "AMBER_1_way",
                "AMBER_2_way",
                "CLEAR_1_way",
                "CLEAR_2_way",
              ])}
            </tbody>
          </table>

          <div className="paper-title">GRINDING</div>
          <table className="paper-table">
            <tbody>
              {renderRows("grinding", [`4" WIDE`, `24" WIDE`, `ARROWS`])}
            </tbody>
          </table>
        </div>

        {/* ---- RIGHT COLUMN ---- */}
        <div className="paper-section">
          <div className="paper-title"></div>
          <div className="form-row">
            <label>DOT Employee</label>
            <input
              type="checkbox"
              name="dot_employee"
              checked={formData.dot_employee}
              onChange={handleChange}
            />
          </div>
          {formData.dot_employee && (
            <>
              <div className="form-row">
                <label>DOT Name/ID</label>
                <input
                  name="dot_employee_name"
                  value={formData.dot_employee_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-row">
                <label>DOT Email</label>
                <input
                  type="email"
                  name="dot_employee_email"
                  value={formData.dot_employee_email || ""}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </>
          )}

          <div className="form-row">
            <label>Invoice #</label>
            <input
              name="invoice_number"
              value={formData.invoice_number}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-row">
            <label>FED Payroll</label>
            <input
              name="fed_payroll"
              value={formData.fed_payroll}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-row">
            <label>Job Totals</label>
            <input
              name="job_totals"
              value={formData.job_totals}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-row">
            <label>Daily Minimum</label>
            <input
              name="daily_minimum"
              value={formData.daily_minimum}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-row">
            <label>Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-row"></div>
          <div className="form-row"></div>
          <div className="form-row"></div>
          <div className="form-row"></div>
          <div className="form-row"></div>
          <div className="form-row"></div>
          <div className="form-row"></div>
          <div className="form-row"></div>

          {/* Thermo, Notes */}
          <div className="paper-title thermo-block">THERMO</div>
          <table className="paper-table">
            <tbody>
              {renderRows("thermo", [
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
          <textarea
            name="notes"
            rows={6}
            value={formData.notes}
            onChange={handleChange}
            className="form-textarea"
          />
        </div>
      </div>

      {/* ---- Actions ---- */}
      <div className="form-actions" style={{ gridColumn: "span 2" }}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting
            ? sheetId
              ? "Updating..."
              : "Submitting..."
            : sheetId
            ? "Update"
            : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </div>

      {submissionError && <p className="error-text">{submissionError}</p>}
    </form>
  );
}
