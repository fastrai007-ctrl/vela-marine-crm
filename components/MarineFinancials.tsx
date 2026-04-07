"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Expense, Shoot } from "@prisma/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getLast6Months, getCurrentMonth } from "@/lib/revenue";
import { createExpense, deleteExpense } from "@/lib/actions";
import { Trash2 } from "lucide-react";

type Props = {
  shoots: (Shoot & { vessel: { name: string } })[];
  expenses: Expense[];
};

export function MarineFinancials({ shoots, expenses }: Props) {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => setMounted(true), []);

  const currentMonth = getCurrentMonth();
  const last6 = getLast6Months();

  // Revenue = sum of completed/delivered shoot budgets
  function revenueForMonth(month: string): number {
    const [y, m] = month.split("-").map(Number);
    return shoots
      .filter(s => {
        if (!s.shootDate || !["COMPLETED", "DELIVERED"].includes(s.status)) return false;
        const d = new Date(s.shootDate);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      })
      .reduce((sum, s) => sum + (s.budget ?? 0), 0);
  }

  const monthRevenue = revenueForMonth(currentMonth);
  const monthExpenses = expenses.filter(e => e.month === currentMonth).reduce((s, e) => s + e.amount, 0);
  const monthProfit = monthRevenue - monthExpenses;

  const chartData = last6.map(month => ({
    month: month.slice(5),
    Revenue: revenueForMonth(month),
    Expenses: expenses.filter(e => e.month === month).reduce((s, e) => s + e.amount, 0),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: "-0.03em" }}>Financials</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Revenue from completed shoots · expenses tracked manually</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Monthly Revenue", value: `$${monthRevenue.toLocaleString()}`, sub: "From completed shoots" },
          { label: "Monthly Expenses", value: `$${monthExpenses.toLocaleString()}`, sub: "Equipment, software, fuel" },
          { label: "Monthly Profit", value: `$${monthProfit.toLocaleString()}`, sub: monthProfit >= 0 ? "Net positive" : "Net loss", loss: monthProfit < 0 },
        ].map(card => (
          <div key={card.label} className={`card card-accent p-5`}>
            <p className="heading-xs">{card.label}</p>
            <p className={`mt-3 text-[2rem] font-bold mono-data leading-none ${(card as any).loss ? "text-red-400" : "text-white"}`} style={{ letterSpacing: "-0.04em" }}>
              {card.value}
            </p>
            <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-white mb-4">Last 6 Months</h2>
        {mounted && (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `$${(v/1000).toFixed(0)}k` : `$${v}`} />
                <Tooltip contentStyle={{ background: "#0c0e14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#f1f5f9", fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                <Bar dataKey="Revenue" fill="#0ea5e9" radius={[4,4,0,0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[4,4,0,0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Expenses */}
      <div className="card p-6">
        <p className="heading-xs mb-4">Add Expense</p>
        <form ref={formRef} action={(fd) => { startTransition(async () => { await createExpense(fd); formRef.current?.reset(); }); }} className="grid grid-cols-2 gap-2 md:grid-cols-4 mb-6">
          <input name="title" placeholder="Expense name *" className="input" required />
          <input name="amount" type="number" placeholder="Amount *" className="input" required />
          <input name="purpose" placeholder="Purpose" className="input" />
          <input name="month" defaultValue={currentMonth} className="input" />
          <button type="submit" disabled={isPending} className="btn-primary col-span-2 md:col-span-4 justify-center">{isPending ? "Adding..." : "Add Expense"}</button>
        </form>

        <div className="space-y-1">
          <p className="heading-xs mb-3">This Month</p>
          {expenses.filter(e => e.month === currentMonth).length === 0 && <p className="text-sm text-slate-600">No expenses this month.</p>}
          {expenses.filter(e => e.month === currentMonth).map(exp => (
            <div key={exp.id} className="flex items-center justify-between py-2 border-b border-white/5 text-sm">
              <div className="flex-1 min-w-0">
                <span className="text-white font-medium">{exp.title}</span>
                {exp.purpose && <span className="text-slate-500 ml-2 text-xs">{exp.purpose}</span>}
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="text-white font-semibold mono-data">${exp.amount.toLocaleString()}</span>
                <button onClick={() => startTransition(() => deleteExpense(exp.id))} disabled={isPending} className="text-slate-600 hover:text-red-400 disabled:opacity-40"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
