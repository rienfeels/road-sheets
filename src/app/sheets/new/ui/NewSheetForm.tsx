"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type FormDataState = {
  road_name: string;
  contract_number: string;
  contractor: string;
  workers: string;
  job_time_arrived: string;
  job_time_finished: string;
  color: "" | "white" | "yellow" | "both";
  material: string;
  dot_employee: boolean;
  dot_employee_name: string;
  hand_work: boolean;
  stop_bars: string;
  arrows: string;
  onlys: string;
  railroad_crossing: string;
  rpm: string;
  white_line_type?: "" | "solid" | "skip" | "both";
  white_solid_footage?: number | string;
  white_solid_size?: string;
  white_skip_footage?: number | string;
  white_skip_size?: string;
  yellow_line_type?: "" | "solid" | "skip" | "both";
  yellow_solid_footage?: number | string;
  yellow_solid_size?: string;
  yellow_skip_footage?: number | string;
  yellow_skip_size?: string;
  date_submitted?: string;
  miles?: number | string;
  notes?: string;
};

const initialFormData: FormDataState = {
  road_name: "",
  contract_number: "",
  contractor: "",
  workers: "",
  job_time_arrived: "",
  job_time_finished: "",
  color: "",
  material: "",
  dot_employee: false,
  dot_employee_name: "",
  hand_work: false,
  stop_bars: "",
  arrows: "",
  onlys: "",
  railroad_crossing: "",
  rpm: "",
  white_line_type: "",
  yellow_line_type: "",
  date_submitted: new Date().toISOString().slice(0, 10),
  miles: "",
  notes: "",
};

export default function NewSheetForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

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
      const res = await fetch("/api/sheets", {
        method: "POST",
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
          data.error || `Failed to create sheet (HTTP ${res.status})`
        );
      }

      toast.success("Sheet submitted");
      router.push(data.id ? `/sheets/${data.id}` : "/sheets");
    } catch (err: any) {
      setSubmissionError(err.message || "Unknown error");
      toast.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const RenderColorSpecificInputs = () => {
    if (formData.color === "white")
      return (
        <>
          <div className="form-row">
            <label>White Line Type</label>
            <select
              name="white_line_type"
              value={formData.white_line_type}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select</option>
              <option value="solid">Solid</option>
              <option value="skip">Skip</option>
              <option value="both">Both</option>
            </select>
          </div>
          {formData.white_line_type === "solid" && (
            <>
              <NumRow
                name="white_solid_footage"
                label="White Solid Footage"
                value={formData.white_solid_footage}
                onChange={handleChange}
              />
              <TextRow
                name="white_solid_size"
                label="White Solid Size"
                value={formData.white_solid_size}
                onChange={handleChange}
              />
            </>
          )}
          {formData.white_line_type === "skip" && (
            <>
              <NumRow
                name="white_skip_footage"
                label="White Skip Footage"
                value={formData.white_skip_footage}
                onChange={handleChange}
              />
              <TextRow
                name="white_skip_size"
                label="White Skip Size"
                value={formData.white_skip_size}
                onChange={handleChange}
              />
            </>
          )}
          {formData.white_line_type === "both" && (
            <>
              <NumRow
                name="white_solid_footage"
                label="White Solid Footage"
                value={formData.white_solid_footage}
                onChange={handleChange}
              />
              <TextRow
                name="white_solid_size"
                label="White Solid Size"
                value={formData.white_solid_size}
                onChange={handleChange}
              />
              <NumRow
                name="white_skip_footage"
                label="White Skip Footage"
                value={formData.white_skip_footage}
                onChange={handleChange}
              />
              <TextRow
                name="white_skip_size"
                label="White Skip Size"
                value={formData.white_skip_size}
                onChange={handleChange}
              />
            </>
          )}
        </>
      );

    if (formData.color === "yellow")
      return (
        <>
          <div className="form-row">
            <label>Yellow Line Type</label>
            <select
              name="yellow_line_type"
              value={formData.yellow_line_type}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select</option>
              <option value="solid">Solid</option>
              <option value="skip">Skip</option>
              <option value="both">Both</option>
            </select>
          </div>
          {formData.yellow_line_type === "solid" && (
            <>
              <NumRow
                name="yellow_solid_footage"
                label="Yellow Solid Footage"
                value={formData.yellow_solid_footage}
                onChange={handleChange}
              />
              <TextRow
                name="yellow_solid_size"
                label="Yellow Solid Size"
                value={formData.yellow_solid_size}
                onChange={handleChange}
              />
            </>
          )}
          {formData.yellow_line_type === "skip" && (
            <>
              <NumRow
                name="yellow_skip_footage"
                label="Yellow Skip Footage"
                value={formData.yellow_skip_footage}
                onChange={handleChange}
              />
              <TextRow
                name="yellow_skip_size"
                label="Yellow Skip Size"
                value={formData.yellow_skip_size}
                onChange={handleChange}
              />
            </>
          )}
        </>
      );

    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-row">
        <label>Date Submitted</label>
        <input
          type="date"
          name="date_submitted"
          value={formData.date_submitted}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-row">
        <label>Road Name</label>
        <input
          name="road_name"
          value={formData.road_name}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-row">
        <label>Contract #</label>
        <input
          name="contract_number"
          value={formData.contract_number}
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
        <label>Workers</label>
        <input
          name="workers"
          value={formData.workers}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-row">
        <label>Arrived</label>
        <input
          type="time"
          name="job_time_arrived"
          value={formData.job_time_arrived}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-row">
        <label>Finished</label>
        <input
          type="time"
          name="job_time_finished"
          value={formData.job_time_finished}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-row">
        <label>Color</label>
        <select
          name="color"
          value={formData.color}
          onChange={handleChange}
          className="form-select"
        >
          <option value="">Select</option>
          <option value="white">White</option>
          <option value="yellow">Yellow</option>
          <option value="both">Both</option>
        </select>
      </div>

      {RenderColorSpecificInputs()}

      <div className="form-row">
        <label>Material</label>
        <input
          name="material"
          value={formData.material}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-row">
        <label>Miles</label>
        <input
          type="number"
          name="miles"
          value={formData.miles as any}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-row">
        <label>Notes</label>
        <textarea
          name="notes"
          rows={4}
          value={formData.notes}
          onChange={handleChange}
          className="form-textarea"
        />
      </div>

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
        <div className="form-row">
          <label>DOT Name/ID</label>
          <input
            name="dot_employee_name"
            value={formData.dot_employee_name}
            onChange={handleChange}
            className="form-input"
          />
        </div>
      )}

      <div className="form-row">
        <label>Hand Work</label>
        <input
          type="checkbox"
          name="hand_work"
          checked={formData.hand_work}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-outline"
        >
          Cancel
        </button>
      </div>

      {submissionError && <p className="error-text">{submissionError}</p>}
    </form>
  );
}

function TextRow(props: {
  name: string;
  label: string;
  value: any;
  onChange?: any;
}) {
  return (
    <div className="form-row">
      <label>{props.label}</label>
      <input
        name={props.name}
        value={props.value || ""}
        onChange={props.onChange}
        className="form-input"
      />
    </div>
  );
}

function NumRow(props: {
  name: string;
  label: string;
  value: any;
  onChange?: any;
}) {
  return (
    <div className="form-row">
      <label>{props.label}</label>
      <input
        type="number"
        name={props.name}
        value={(props.value as any) || ""}
        onChange={props.onChange}
        className="form-input"
      />
    </div>
  );
}
