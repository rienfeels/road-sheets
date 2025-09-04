"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Registration failed");
      }
      toast.success("Account created");

      // auto sign-in with the provided credentials
      const login = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (login?.error) {
        // fallback: send to login page
        router.push("/login");
      } else {
        router.push("/");
      }
    } catch (e: any) {
      setErr(e.message || "Registration failed");
      toast.error("Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: "2rem", display: "grid", placeItems: "center" }}>
      <form onSubmit={onSubmit} style={card as any}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          Create account
        </h1>

        <label style={label}>
          Name
          <input
            style={input as any}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </label>

        <label style={label}>
          Email
          <input
            style={input as any}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label style={label}>
          Password
          <input
            style={input as any}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <button type="submit" disabled={busy} style={primaryBtn as any}>
          {busy ? "Creating..." : "Create account"}
        </button>

        {err && <p style={{ color: "#dc2626", marginTop: 8 }}>{err}</p>}

        <p style={{ marginTop: 10, fontSize: 13 }}>
          Already have an account? <a href="/login">Sign in</a>
        </p>
      </form>
    </main>
  );
}

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 420,
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  display: "grid",
  gap: 12,
};
const label: React.CSSProperties = { display: "grid", gap: 6, fontSize: 14 };
const input: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  outline: "none",
};
const primaryBtn: React.CSSProperties = {
  marginTop: 6,
  border: "1px solid #111827",
  background: "#111827",
  color: "#fff",
  borderRadius: 8,
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: 600,
};
