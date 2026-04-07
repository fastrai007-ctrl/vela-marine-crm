export const dynamic = "force-dynamic";

import { MarineAgentChat } from "@/components/MarineAgentChat";

export default function AgentPage() {
  return (
    <main className="fade-up">
      <div className="mb-7">
        <p className="heading-xs mb-1">Vela Marine Group</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 500, fontSize: "2rem", color: "#f0ece4", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
          Marina Agent
        </h1>
      </div>
      <MarineAgentChat />
    </main>
  );
}
