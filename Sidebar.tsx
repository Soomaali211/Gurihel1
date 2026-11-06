"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS } from "@/lib/sections";

export default function Sidebar() {
  const pathname = usePathname();
  const items = [{ href: "/", label: "Dashboard" }, ...SECTIONS.map((s) => ({ href: `/${s.slug}`, label: s.label }))];

  return (
    <nav className="sidebar" aria-label="Maamulka">
      <div className="brand">
        Guri<span>Hel</span> Admin
      </div>
      {items.map((it) => (
        <Link key={it.href} href={it.href} className="nav-link" aria-current={pathname === it.href ? "page" : undefined}>
          {it.label}
        </Link>
      ))}
    </nav>
  );
}
