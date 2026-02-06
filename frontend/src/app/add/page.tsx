"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { expenseApi } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import {
  CreditCard,
  IndianRupee,
  User,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function AddExpense() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [includePaidBy, setIncludePaidBy] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    paidBy: "",
    participants: "",
  });

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (user) setFormData((prev) => ({ ...prev, paidBy: user.name }));
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let participantList = formData.participants
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p !== "");
      if (includePaidBy && formData.paidBy) {
        if (
          !participantList.some(
            (p) => p.toLowerCase() === formData.paidBy.toLowerCase()
          )
        ) {
          participantList.push(formData.paidBy);
        }
      }
      const payload = {
        name: formData.name,
        amount: Number(formData.amount),
        description: formData.name,
        paidBy: formData.paidBy,
        participants: participantList,
      };
      await expenseApi.createExpense(payload);
      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to add expense. Check backend connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-stone-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="mb-12">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          Add new expense
        </h1>
        <p className="mt-2 text-stone-500">
          Split costs instantly with your friends
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-xl border border-orange-200/50 bg-gradient-to-br from-orange-50/60 to-amber-50/40 p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-stone-800">
              Splitting simplified
            </h3>
            <ul className="space-y-4 text-sm text-stone-600">
              <li className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <CreditCard size={18} />
                </div>
                <div>
                  <span className="font-semibold text-stone-800">
                    Smart entry
                  </span>
                  <p className="mt-0.5">
                    Enter the total amount and who paid.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <Users size={18} />
                </div>
                <div>
                  <span className="font-semibold text-stone-800">
                    Auto-balance
                  </span>
                  <p className="mt-0.5">
                    Tag participants to divide the debt.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
              <AlertCircle size={20} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </aside>

        <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          {success ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={28} />
              </div>
              <h2 className="text-xl font-semibold text-stone-900">
                Expense added
              </h2>
              <p className="mt-1 text-stone-500">
                Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-stone-600">
                  <FileText size={16} />
                  Title / description
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border-2 border-stone-200 px-4 py-3 text-base outline-none transition-all focus:border-orange-600 focus:ring-4 focus:ring-orange-600/15"
                  placeholder="What was this for?"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-stone-600">
                  <IndianRupee size={16} />
                  Amount
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border-2 border-stone-200 px-4 py-3 text-base outline-none transition-all focus:border-orange-600 focus:ring-4 focus:ring-orange-600/15"
                  placeholder="0.00"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-stone-600">
                  <User size={16} />
                  Paid by
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border-2 border-stone-200 px-4 py-3 text-base outline-none transition-all focus:border-orange-600 focus:ring-4 focus:ring-orange-600/15"
                  placeholder="Who paid?"
                  required
                  value={formData.paidBy}
                  onChange={(e) =>
                    setFormData({ ...formData, paidBy: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-3 rounded-xl bg-orange-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                  <User size={16} className="text-orange-600" />
                  Include payer in participants
                </span>
                <label className="relative inline-block h-6 w-11 cursor-pointer">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={includePaidBy}
                    onChange={(e) => setIncludePaidBy(e.target.checked)}
                  />
                  <span className="absolute inset-0 rounded-full bg-stone-300 transition-colors peer-checked:bg-orange-600"></span>
                  <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-stone-600">
                  <Users size={16} />
                  Other participants
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border-2 border-stone-200 px-4 py-3 text-base outline-none transition-all focus:border-orange-600 focus:ring-4 focus:ring-orange-600/15"
                  placeholder="Rahul, Neha (comma-separated)"
                  value={formData.participants}
                  onChange={(e) =>
                    setFormData({ ...formData, participants: e.target.value })
                  }
                />
                <p className="text-xs text-stone-400">
                  Separate names with commas
                </p>
              </div>
              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/40 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
                {loading ? "Adding expense..." : "Add expense"}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
