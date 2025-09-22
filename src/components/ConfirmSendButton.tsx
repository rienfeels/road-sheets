"use client";

import { useState } from "react";

export default function ConfirmSendButton({ sheetId }: { sheetId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleConfirm() {
    if (
      !window.confirm("Are you sure you want to confirm and send this sheet?")
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/sheets/${sheetId}/confirm`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to confirm");
      } else {
        setDone(true);
        alert("✅ Sheet confirmed and sent to DOT email.");
      }
    } catch (err) {
      console.error("ConfirmSendButton error:", err);
      alert("❌ Network error — check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={loading || done}
      className="btn btn-primary"
      style={{ minWidth: 160 }}
    >
      {done ? "Confirmed ✓" : loading ? "Confirming..." : "Confirm & Send"}
    </button>
  );
}
