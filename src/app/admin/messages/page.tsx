import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminMessagesPage() {
  const session = await getSession();
  if (!session || (session.user as any)?.role !== "ADMIN") redirect("/");

  return (
    <main className="page-wrapper">
      <h1 className="page-title">Admin Messages</h1>
      <form action="/api/messages" method="post" className="form">
        <div className="form-row">
          <label>Title</label>
          <input name="title" className="form-input" required />
        </div>
        <div className="form-row">
          <label>Body</label>
          <textarea name="body" className="form-textarea" rows={5} required />
        </div>
        <div className="form-row">
          <label>Audience</label>
          <select name="audience" className="form-select">
            <option value="ALL">ALL</option>
            <option value="DRIVER">DRIVER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" formAction={async (_) => {}}>
            Create (use client fetch below)
          </button>
        </div>
      </form>
      {/* Minimal client helper to POST via fetch */}
      <CreateMessageClient />
    </main>
  );
}

("use client");
import { useState } from "react";

function CreateMessageClient() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [aud, setAud] = useState("ALL");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, audience: aud }),
    });
    setSaving(false);
    setTitle("");
    setBody("");
    alert("Message created");
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
