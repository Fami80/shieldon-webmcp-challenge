import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShieldOn WebMCP Challenge",
  description:
    "A read-only WebMCP demo: governed evidence, missing evidence, and contradictions from a synthetic ShieldOn revenue investigation.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
