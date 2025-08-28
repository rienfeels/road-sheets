"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@exmaple.com");
  const [password, setPassword] = useState("admin123!");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/",
    });
    if ((res as any)?.error) {
      toast.error("Invalid credentials");
      setLoading(false);
    }
  }
  return (
    <div style={styles.wrapper}>
      <form style={styles.card as any} onSubmit={onSubmit}>
        <h1 style={styles.title}>Sign in</h1>

        <label style={styles.label}>
          Email
          <input
            style={styles.input as any}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            style={styles.input as any}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
          />
        </label>

        <button style={styles.button as any} type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
          Try <b>admin@example.com</b> / <b>admin123!</b> (from seed)
        </p>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: "2rem",
    background: "#f6f7fb",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    display: "grid",
    gap: 12,
  },
  title: { fontSize: 22, fontWeight: 700 },
  label: { display: "grid", gap: 6, fontSize: 14 },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
  },
  button: {
    marginTop: 6,
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    borderRadius: 8,
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 600,
  },
};
