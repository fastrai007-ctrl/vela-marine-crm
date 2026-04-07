export const revalidate = 30;

import { prisma } from "@/lib/prisma";
import { BookingsBoard } from "@/components/BookingsBoard";

export default async function BookingsPage() {
  const shoots = await prisma.shoot.findMany({
    orderBy: { shootDate: "asc" },
    include: {
      vessel: { include: { client: true } },
      deliverables: true,
    },
  });

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
          Shoot Bookings
        </h1>
      </div>
      <BookingsBoard shoots={shoots} />
    </main>
  );
}
