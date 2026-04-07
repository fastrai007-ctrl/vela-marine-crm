export const revalidate = 30;

import { prisma } from "@/lib/prisma";
import { MarineLeadsBoard } from "@/components/MarineLeadsBoard";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="fade-up">
      <div className="mb-7">
        <p className="heading-xs mb-1">Vela Marine Group</p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: "2rem",
            color: "#f0ece4",
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
          }}
        >
          Lead Pipeline
        </h1>
      </div>
      <MarineLeadsBoard leads={leads} />
    </main>
  );
}
