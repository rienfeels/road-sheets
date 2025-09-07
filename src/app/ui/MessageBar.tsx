"use client";
import { useEffect, useState } from "react";

export default function MessageBar() {
  const [msgs, setMsgs] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then(setMsgs)
      .catch(() => {});
  }, []);

  if (!msgs.length) return null;

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Announcements</div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {msgs.slice(0, 5).map((m) => (
          <li key={m.id} style={{ marginBottom: 6 }}>
            <div style={{ fontWeight: 600 }}>{m.title}</div>
            <div className="small muted">{m.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
