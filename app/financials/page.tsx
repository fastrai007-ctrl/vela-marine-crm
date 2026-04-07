export const revalidate = 30;

import { prisma } from "@/lib/prisma";
import { MarineFinancials } from "@/components/MarineFinancials";

export default async function FinancialsPage() {
  const [shoots, expenses] = await Promise.all([
    prisma.shoot.findMany({
      include: { vessel: { select: { name: true } } },
      orderBy: { shootDate: "desc" },
    }),
    prisma.expense.findMany({ orderBy: { month: "desc" } }),
  ]);

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
          Financials
        </h1>
      </div>
      <MarineFinancials shoots={shoots} expenses={expenses} />
    </main>
  );
}
