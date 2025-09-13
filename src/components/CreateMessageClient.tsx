"use client";

import { useState } from "react";

export default function CreateMessageClient() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [aud, setAud] = useState("ALL");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, audience: aud }),
    });
    setSaving(false);

    if (res.ok) {
      setTitle("");
      setBody("");
      alert("Message created");
      window.location.href = "/messages"; // redirect after creating
    }
  }

  return (
    <div className="form" style={{ marginTop: 16 }}>
      <div className="form-row">
        <label>Title</label>
        <input
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="form-row">
        <label>Body</label>
        <textarea
          className="form-textarea"
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      <div className="form-row">
        <label>Audience</label>
        <select
          className="form-select"
          value={aud}
          onChange={(e) => setAud(e.target.value)}
        >
          <option value="ALL">ALL</option>
          <option value="DRIVER">DRIVER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>
      <div className="form-actions">
        <button onClick={save} className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Publish"}
        </button>
      </div>
    </div>
  );
}
