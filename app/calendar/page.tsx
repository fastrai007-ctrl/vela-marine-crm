export const revalidate = 30;

import { prisma } from "@/lib/prisma";
import { MarineCalendar } from "@/components/MarineCalendar";

export default async function CalendarPage() {
  const shoots = await prisma.shoot.findMany({
    orderBy: { shootDate: "asc" },
    include: { vessel: { include: { client: { select: { companyName: true } } } } },
  });

  return (
    <main className="fade-up">
      <div className="mb-7">
        <p className="heading-xs mb-1">Vela Marine Group</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 500, fontSize: "2rem", color: "#f0ece4", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
          Shoot Calendar
        </h1>
      </div>
      <MarineCalendar shoots={shoots} />
    </main>
  );
}
