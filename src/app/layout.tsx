"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import "./styles.css";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // any sheet pages should NOT be constrained to .container width
  const isSheetPage =
    pathname.startsWith("/sheets/new") || pathname.startsWith("/sheets/");

  return (
    <html lang="en">
      <body>
        <header
          className="container"
          style={{ paddingTop: 16, paddingBottom: 0 }}
        >
          <Link href="/" aria-label="Home">
            <Image
              src="/logo.png"
              alt="Company Logo"
              width={160}
              height={40}
              priority
            />
          </Link>
        </header>

        {/* remove container wrap for sheet pages */}
        <main className={isSheetPage ? "" : "container"}>{children}</main>
      </body>
    </html>
  );
}
