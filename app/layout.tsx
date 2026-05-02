import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Support is Blind — StealthQL",
  description: "Support access is not a backdoor.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
