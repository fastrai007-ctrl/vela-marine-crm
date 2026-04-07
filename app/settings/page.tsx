export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { MarineSettings } from "@/components/MarineSettings";

export default async function SettingsPage() {
  const rows = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;

  return (
    <main className="fade-up">
      <div className="mb-7">
        <p className="heading-xs mb-1">Vela Marine Group</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 500, fontSize: "2rem", color: "#f0ece4", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
          Settings
        </h1>
      </div>
      <MarineSettings initial={settings} />
    </main>
  );
}
