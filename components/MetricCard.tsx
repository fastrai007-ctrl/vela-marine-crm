type MetricCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: boolean;
};

export function MetricCard({ label, value, sublabel, accent }: MetricCardProps) {
  return (
    <div className={`card p-5 ${accent ? "card-accent" : ""}`}>
      <p className="heading-xs">{label}</p>
      <p className="mt-3 mono-data leading-none text-white font-bold" style={{ fontSize: "2rem", letterSpacing: "-0.04em" }}>{value}</p>
      {sublabel && <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>{sublabel}</p>}
    </div>
  );
}
