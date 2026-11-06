import { notFound } from "next/navigation";
import { SECTIONS } from "@/lib/sections";

export const dynamicParams = false; // kaliya slugs-ka liiska ku jira; kuwa kale → 404

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ section: s.slug }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const s = SECTIONS.find((x) => x.slug === section);
  if (!s) notFound();

  return (
    <>
      <h1>{s.label}</h1>
      <p className="sub">Ku soo socota — qayb: {s.wp}</p>
      <div className="card">
        <p className="note">Bogga kani weli lama dhisin (skeleton).</p>
      </div>
    </>
  );
}
