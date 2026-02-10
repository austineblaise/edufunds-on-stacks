"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Stipend = {
  id: string;
  student: string;
  amount: number;
  category: string;
  unlockDate: number; // unix seconds
  createdAt: number;
};

const SAMPLE_STIPENDS: Stipend[] = [
  {
    id: "p1",
    student: "0x3a...9f2",
    amount: 120,
    category: "Living Support",
    unlockDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3,
    createdAt: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 2,
  },
  {
    id: "p2",
    student: "0x7b...c13",
    amount: 50,
    category: "Books",
    unlockDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14,
    createdAt: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 1,
  },
];

export default function ParentDashboard() {
  const [balance, setBalance] = useState<number>(420);
  const [student, setStudent] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [unlockDate, setUnlockDate] = useState<string>("");

  const [assigning, setAssigning] = useState(false);

  const [stipends, setStipends] = useState<Stipend[]>(SAMPLE_STIPENDS);
  const [selected, setSelected] = useState<Stipend | null>(null);

  useEffect(() => {
    // visual polish hook
  }, []);

  const totals = useMemo(() => {
    const totalAssigned = stipends.reduce((s, it) => s + it.amount, 0);
    const upcoming = stipends.filter((s) => s.unlockDate > Math.floor(Date.now() / 1000)).length;
    return { totalAssigned, upcoming };
  }, [stipends]);

  const formatSTX = (v: number) => `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} STX`;

  const handleAssign = () => {
    if (!student || !amount || !category || !unlockDate) return toast.error("Please fill all fields");
    const amt = Number(amount);
    if (isNaN(amt) || amt <= 0) return toast.error("Enter a valid amount");

    setAssigning(true);
    setTimeout(() => {
      const id = (typeof crypto !== "undefined" && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : String(Date.now());
      const unlock = Math.floor(new Date(unlockDate).getTime() / 1000);
      const newStipend: Stipend = {
        id,
        student: student.trim(),
        amount: amt,
        category: category.trim() || "Unspecified",
        unlockDate: unlock,
        createdAt: Math.floor(Date.now() / 1000),
      };
      setStipends((s) => [newStipend, ...s]);
      setStudent("");
      setAmount("");
      setCategory("");
      setUnlockDate("");
      setAssigning(false);
      toast.success("Stipend assigned (design-only)");
    }, 800);
  };

  const handleRemove = (id: string) => {
    setStipends((s) => s.filter((x) => x.id !== id));
    toast.info("Removed stipend (demo)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
   

      <main className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Parent Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and assign stipends to students — design-only view (Stacks balance).</p>
          </div>

          {/* stacked stats: balance and assigned total shown vertically */}
          {/* stats row: balance and assigned total side-by-side */}
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
            <div className="flex-1 min-w-[220px] bg-white px-4 py-3 rounded-xl shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold">STX</div>
              <div>
                <div className="text-xs text-slate-400">Balance</div>
                <div className="text-lg font-semibold text-slate-900">{formatSTX(balance)}</div>
              </div>
            </div>

            <div className="flex-1 min-w-[220px] bg-white px-4 py-3 rounded-xl shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold">AL</div>
              <div>
                <div className="text-xs text-slate-400">Assigned Total</div>
                <div className="text-lg font-semibold text-slate-900">{formatSTX(totals.totalAssigned)}</div>
                <div className="text-xs text-slate-400">{totals.upcoming} upcoming</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-1 bg-white p-6 rounded-2xl shadow border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Assign Stipend</h2>
            <p className="text-xs text-slate-400 mt-1 mb-4">Quickly create a stipend allocation for a student (design-only).</p>

            <div className="space-y-3">
              <label className="text-xs text-slate-600">Student Wallet / ID</label>
              <input value={student} onChange={(e) => setStudent(e.target.value)} placeholder="0x123... or student id" className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-slate-600">Amount (STX)</label>
                  <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50" type="number" className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>

                <div className="flex-1">
                  <label className="text-xs text-slate-600">Category</label>
                  <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Books, transport" className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600">Unlock date & time</label>
                <input value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} type="datetime-local" className="w-full px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
              </div>

              <div className="pt-2">
                <button onClick={handleAssign} disabled={assigning} className="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                  {assigning ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" />
                      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  ) : null}
                  <span>{assigning ? "Assigning…" : "Assign Stipend"}</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-400">This view is design-only. When you're ready I can wire this to your smart contract or backend API.</div>
          </section>

          <section className="lg:col-span-2">
            <div className="grid gap-4">
              {stipends.length === 0 ? (
                <div className="bg-white p-6 rounded-xl shadow border border-slate-100 text-center text-slate-500">No stipends assigned yet.</div>
              ) : (
                // show each stipend in a stacked card layout
                stipends.map((s) => (
                  <div key={s.id} className="bg-white p-4 rounded-xl shadow border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700 font-semibold">{s.category.charAt(0)}</div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{s.category}</div>
                        <div className="text-xs text-slate-400">For: {s.student}</div>
                        <div className="text-xs text-slate-400 mt-1">Created {formatDistanceToNow(new Date(s.createdAt * 1000), { addSuffix: true })}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between md:justify-end">
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900">{formatSTX(s.amount)}</div>
                        <div className="text-xs text-slate-400">Unlocks {formatDistanceToNow(new Date(s.unlockDate * 1000), { addSuffix: true })}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(s)} className="px-3 py-1 text-sm rounded-md border text-slate-600 hover:bg-slate-50">Details</button>
                        <button onClick={() => handleRemove(s.id)} className="px-3 py-1 text-sm rounded-md bg-red-50 text-red-600">Remove</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <footer className="mt-8 text-sm text-slate-400">Tip: this is a mock UI — smart contract and wallet interactions are intentionally omitted for now.</footer>
      </main>

      {/* Details modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{selected.category}</h3>
                  <p className="text-sm text-slate-500 mt-1">Allocated to {selected.student}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{formatSTX(selected.amount)}</div>
                  <div className="text-xs text-slate-400">Created {formatDistanceToNow(new Date(selected.createdAt * 1000), { addSuffix: true })}</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500">Unlock date</div>
                  <div className="mt-1 text-sm">{new Date(selected.unlockDate * 1000).toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">Status</div>
                  <div className="mt-1 text-sm">{selected.unlockDate <= Math.floor(Date.now() / 1000) ? "Unlocked" : "Locked"}</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-md border text-sm text-slate-600 hover:bg-slate-50">Close</button>
                <button onClick={() => { navigator.clipboard?.writeText(selected.student); toast.success("Student address copied"); }} className="px-4 py-2 rounded-md bg-indigo-600 text-white">Copy student</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" />
    </div>
  );
}
