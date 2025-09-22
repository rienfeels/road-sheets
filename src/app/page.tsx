import Link from "next/link";
import { getSession } from "@/lib/auth";
import { SignOutButton } from "./ui/SignOutButton";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    return (
      <main className="page-wrapper">
        <h1 className="page-title">Road Sheets</h1>
        <p className="page-subtitle">
          Please sign in or create an account to submit and view road sheets.
        </p>
        <div className="button-row">
          <Link href="/login" className="btn-primary">
            Sign in
          </Link>
          <Link href="/register" className="btn-secondary">
            Create account
          </Link>
        </div>
      </main>
    );
  }

  const role = (session.user as any)?.role;
  return (
    <main className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Road Sheets</h1>
          <div className="page-subtitle">
            Welcome {session.user?.name} {role ? `• ${role}` : ""}
          </div>
        </div>
        <Link
          href="/messages"
          style={{
            background: "#2563eb",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: 6,
            fontWeight: 500,
            textDecoration: "none",
            marginLeft: "0.5rem",
          }}
        >
          Messages
        </Link>
        <SignOutButton />
      </div>

      <ul className="link-list">
        <li>
          <Link href="/sheets/new">➕ Submit a sheet</Link>
        </li>
        <li>
          <Link href="/sheets">📄 View all sheets</Link>
        </li>
        {role === "ADMIN" && (
          <li>
            <Link href="/admin">🛠️ Admin</Link>
          </li>
        )}
      </ul>
    </main>
  );
}
