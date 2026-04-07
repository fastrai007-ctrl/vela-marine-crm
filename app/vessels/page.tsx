export const revalidate = 30;

import { prisma } from "@/lib/prisma";
import { VesselBoard } from "@/components/VesselBoard";

export default async function VesselsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vessels: {
        orderBy: { createdAt: "desc" },
        include: {
          shoots: {
            orderBy: { shootDate: "asc" },
            include: { deliverables: true },
          },
        },
      },
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
          Vessels &amp; Clients
        </h1>
      </div>
      <VesselBoard clients={clients} />
    </main>
  );
}
