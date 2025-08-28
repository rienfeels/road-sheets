import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    return (
      <main style={{ padding: "2rem" }}>
        <h1>Road Sheets</h1>
        <p>
          <Link href="/login">Sign in</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Road Sheets</h1>
      <p>Welcome {session.user?.name}</p>
      <ul>
        <li>
          <Link href="/sheets"></Link>
        </li>
        <li>
          <Link href="/sheets/new"></Link>
        </li>
        {session.user?.role === "ADMIN" && (
          <li>
            <Link href="/admin">Admin</Link>
          </li>
        )}
      </ul>
    </main>
  );
}
