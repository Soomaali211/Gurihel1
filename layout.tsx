import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GuriHel Admin",
  description: "GuriHel — Admin Dashboard (skeleton)",
  robots: { index: false, follow: false }, // meel gaar ah — ha la index-gareyn
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="so">
      <body>{children}</body>
    </html>
  );
}
