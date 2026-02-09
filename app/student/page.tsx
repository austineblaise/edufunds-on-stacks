"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
// import Navbar from "@/components/Navbar";
import { formatDistanceToNow } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/component/Navbar";

type Stipend = {
  id: string;
  amount: number; // in EDU token units (display)
  unlockDate: number; // unix seconds
  withdrawn: boolean;
  category: string;
  description?: string;
};

const MOCK_STIPENDS: Stipend[] = [
  {
    id: "s1",
    amount: 120,
    unlockDate: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 3, // 3 days ago
    withdrawn: false,
    category: "Living Support",
    description: "Monthly living stipend",
  },
  {
    id: "s2",
    amount: 300,
    unlockDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // in 7 days
    withdrawn: false,
    category: "Tuition",
    description: "Semester tuition allocation",
  },
  {
    id: "s3",
    amount: 50,
    unlockDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // in 30 days
    withdrawn: false,
    category: "Books",
    description: "Books and supplies",
  },
  {
    id: "s4",
    amount: 75,
    unlockDate: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 10,
    withdrawn: true,
    category: "Transport",
    description: "Transport reimbursement",
  },
];

export default function StudentDashboard() {
  // local mock connection state (no wagmi)
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [userLabel] = useState<string>("Demo Student");

  const [stipends, setStipends] = useState<Stipend[]>([]);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));

  // track which stipend is currently being withdrawn (shows spinner)
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  // modal state
  const [selected, setSelected] = useState<Stipend | null>(null);
  const modalCloseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const i = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 30_000);
    return () => clearInterval(i);
  }, []);

  // initial load: use mock data (replace this with API later)
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setStipends(MOCK_STIPENDS);
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, []);

  // when modal opens, focus the close button for accessibility
  useEffect(() => {
    if (selected) {
      // small delay to ensure element exists
      setTimeout(() => modalCloseRef.current?.focus(), 50);
    }
  }, [selected]);

  // derived totals
  const totals = useMemo(() => {
    const total = stipends.reduce((s, it) => s + it.amount, 0);
    const available = stipends.reduce((s, it) => {
      if (!it.withdrawn && it.unlockDate <= now) return s + it.amount;
      return s;
    }, 0);
    const locked =
      total -
      available -
      stipends.filter((s) => s.withdrawn).reduce((a, b) => a + b.amount, 0);
    return {
      total,
      available,
      locked: locked >= 0 ? locked : 0,
    };
  }, [stipends, now]);

  const formatEDU = (v: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(v) +
    " EDU";

  // simulate withdraw: update state, show toast, and show spinner only on clicked button
  const handleWithdraw = (id: string) => {
    const item = stipends.find((s) => s.id === id);
    if (!item) return;
    const unlocked = item.unlockDate <= now && !item.withdrawn;
    if (!unlocked) {
      toast.error("Stipend is not yet available.");
      return;
    }

    setWithdrawingId(id);
    // simulate network delay
    setTimeout(() => {
      setStipends((prev) => prev.map((s) => (s.id === id ? { ...s, withdrawn: true } : s)));
      setWithdrawingId(null);
      toast.success(`Withdrawn ${formatEDU(item.amount)} ✅`);
    }, 900);
  };

  const refreshStipends = () => {
    setLoading(true);
    setTimeout(() => {
      setStipends((prev) => [...prev]);
      setLoading(false);
      toast.info("Refreshed stipends.");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* <Navbar /> */}
      <main className="max-w-6xl mx-auto p-6">
        <header className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Student Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Overview of your stipends and upcoming unlocks.</p>
          </div>
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-md font-medium">DS</div>
                <div className="text-sm">
                  <div className="font-medium text-slate-700">{userLabel}</div>
                  <div className="text-xs text-slate-400">Demo account</div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => refreshStipends()}
                    className="px-3 py-1 bg-white border rounded-md text-sm text-slate-600 shadow-sm hover:shadow-md"
                    aria-label="Refresh stipends"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={() => setIsConnected(false)}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded-md text-sm hover:bg-red-100"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsConnected(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md shadow"
                >
                  Connect (demo)
                </button>
              </div>
            )}
          </div>
        </header>

        {/* summary cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow border border-slate-100">
            <div className="text-xs text-slate-500">Total Balance</div>
            <div className="mt-2 text-xl font-semibold text-slate-800">{formatEDU(totals.total)}</div>
            <div className="text-sm text-slate-400 mt-1">All stipends (withdrawn and pending)</div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-slate-500">Available</div>
                <div className="mt-2 text-lg font-semibold text-emerald-600">{formatEDU(totals.available)}</div>
                <div className="text-sm text-slate-400 mt-1">Ready to withdraw</div>
              </div>
              <div className="text-xs text-slate-400">{stipends.filter((s) => !s.withdrawn && s.unlockDate <= now).length} available</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-slate-500">Locked</div>
                <div className="mt-2 text-lg font-semibold text-amber-600">{formatEDU(totals.locked)}</div>
                <div className="text-sm text-slate-400 mt-1">Pending unlock</div>
              </div>
              <div className="text-xs text-slate-400">{stipends.filter((s) => !s.withdrawn && s.unlockDate > now).length} locked</div>
            </div>
          </div>
        </section>

        {/* stipend list / cards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Your Stipends</h2>
            <div className="text-sm text-slate-500">Updated {formatDistanceToNow(new Date(now * 1000), { addSuffix: true })}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              // skeleton placeholders
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-xl shadow p-4 animate-pulse" />
              ))
            ) : stipends.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl shadow p-6 text-center text-slate-500">No stipends assigned yet.</div>
            ) : (
              stipends.map((s) => {
                const unlocked = s.unlockDate <= now && !s.withdrawn;
                const unlockLabel = s.withdrawn
                  ? "Withdrawn"
                  : unlocked
                    ? "Available"
                    : `${formatDistanceToNow(new Date(s.unlockDate * 1000), { addSuffix: true })}`;

                return (
                  <article key={s.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-800">{s.category}</h3>
                          <p className="text-xs text-slate-400 mt-1">{s.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-800">{formatEDU(s.amount)}</div>
                          <div className={`text-xs mt-1 font-medium ${s.withdrawn ? "text-slate-400" : unlocked ? "text-emerald-600" : "text-amber-700"}`}>
                            {unlockLabel}
                          </div>
                        </div>
                      </div>

                      {/* visual progress bar for locked -> unlocked */}
                      <div className="mt-4">
                        <ProgressBar unlockDate={s.unlockDate} now={now} withdrawn={s.withdrawn} />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => handleWithdraw(s.id)}
                        disabled={!(!s.withdrawn && s.unlockDate <= now) || Boolean(withdrawingId)}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
                          s.withdrawn
                            ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                            : s.unlockDate <= now
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-amber-100 text-amber-800 cursor-not-allowed"
                        }`}
                        aria-disabled={s.withdrawn || s.unlockDate > now}
                      >
                        {withdrawingId === s.id ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" />
                              <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                            <span>Withdrawing...</span>
                          </>
                        ) : (
                          <>{s.withdrawn ? "Withdrawn" : s.unlockDate <= now ? "Withdraw" : "Locked"}</>
                        )}
                      </button>

                      <button
                        onClick={() => setSelected(s)}
                        className="px-3 py-2 rounded-md border text-sm text-slate-600 hover:bg-slate-50"
                      >
                        Details
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <footer className="mt-8 text-sm text-slate-400">Tip: This is a design-only view. When you’re ready I can wire this to your API or restore the smart contract calls.</footer>
      </main>

      {/* Modal (details) */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSelected(null)}
            aria-hidden
          />

          <div className="relative bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-2xl transform transition-all duration-200 ease-out scale-100">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{selected.category}</h3>
                  <p className="text-sm text-slate-500 mt-1">{selected.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-800">{formatEDU(selected.amount)}</div>
                  <div className={`text-sm mt-1 ${selected.withdrawn ? "text-slate-400" : selected.unlockDate <= now ? "text-emerald-600" : "text-amber-700"}`}>
                    {selected.withdrawn ? "Withdrawn" : selected.unlockDate <= now ? "Available" : `${formatDistanceToNow(new Date(selected.unlockDate * 1000), { addSuffix: true })}`}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <ProgressBar unlockDate={selected.unlockDate} now={now} withdrawn={selected.withdrawn} />
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-500">Unlock date</div>
                  <div className="mt-1 text-sm text-slate-700">{new Date(selected.unlockDate * 1000).toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">Status</div>
                  <div className="mt-1 text-sm text-slate-700">{selected.withdrawn ? "Withdrawn" : selected.unlockDate <= now ? "Available" : "Locked"}</div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 justify-end">
                <button
                  ref={modalCloseRef}
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-md border text-sm text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    // also allow withdraw from modal
                    handleWithdraw(selected.id);
                    setSelected(null);
                  }}
                  disabled={selected.withdrawn || selected.unlockDate > now || Boolean(withdrawingId)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${selected.withdrawn ? "bg-slate-100 text-slate-500" : selected.unlockDate <= now ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-amber-100 text-amber-800 cursor-not-allowed"}`}
                >
                  {withdrawingId === selected.id ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" />
                        <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                      Withdrawing...
                    </span>
                  ) : (
                    selected.withdrawn ? "Withdrawn" : selected.unlockDate <= now ? "Withdraw" : "Locked"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
}

/** small progress bar component (visual) */
function ProgressBar({ unlockDate, now, withdrawn }: { unlockDate: number; now: number; withdrawn: boolean }) {
  // show percentage between createdAt (approx now - 30d) and unlockDate for demo
  const windowStart = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30; // 30 days ago
  const range = Math.max(unlockDate - windowStart, 1);
  const filled = Math.min(Math.max((now - windowStart) / range, 0), 1) * 100;
  const pct = withdrawn ? 100 : filled;

  return (
    <div className="w-full">
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all ${withdrawn ? "bg-slate-400" : pct >= 100 ? "bg-emerald-600" : "bg-indigo-500"}`}
          style={{ width: `${Math.max(6, pct)}%` }}
        />
      </div>
      <div className="text-xs text-slate-400 mt-2 flex justify-between">
        <span>{withdrawn ? "Completed" : pct >= 100 ? "Unlocked" : "In progress"}</span>
        <span>{Math.round(pct)}%</span>
      </div>
    </div>
  );
}
