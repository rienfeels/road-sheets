import "./globals.css";
import "./styles.css";
import { Toaster } from "sonner";

export const metadata = {
  title: "Road Sheets",
  description: "Daily road sheet tracking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
