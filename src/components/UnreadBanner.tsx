"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function UnreadBanner() {
  const [msgs, setMsgs] = useState<any[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  async function loadUnread() {
    try {
      const res = await fetch("/api/messages/unread", { cache: "no-store" });
      const data = await res.json();
      setMsgs(data);
    } catch (err) {
      console.error("Unread fetch failed:", err);
    }
  }

  useEffect(() => {
    loadUnread();

    //  re-check when pathname changes (e.g. after viewing a message)
    // ensures banner disappears immediately once message marked read
  }, [pathname]);

  // poll every 30s to keep it fresh
  useEffect(() => {
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  if (msgs.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "1rem",
        right: "1rem",
        background: "#fef3c7",
        border: "1px solid #f59e0b",
        padding: "12px",
        borderRadius: "6px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        zIndex: 1000,
        maxWidth: "300px",
      }}
    >
      <strong style={{ display: "block", marginBottom: 8 }}>
        New Messages:
      </strong>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {msgs.map((m) => (
          <li key={m.id} style={{ marginBottom: 6 }}>
            <button
              onClick={() => router.push(`/messages/${m.id}`)}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                margin: 0,
                cursor: "pointer",
                color: "#b45309",
                textDecoration: "underline",
                fontSize: "0.95rem",
                textAlign: "left",
              }}
            >
              {m.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
