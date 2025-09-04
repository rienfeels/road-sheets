"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{
        border: "1px solid #d1d5db",
        background: "#fff",
        color: "#111827",
        borderRadius: 8,
        padding: "8px 10px",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      Sign out
    </button>
  );
}
