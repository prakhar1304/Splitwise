"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { expenseApi, isNetworkError, API_BASE_URL } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import {
  RefreshCw,
  ArrowRight,
  Wallet,
  UserCircle2,
  Info,
} from "lucide-react";

interface Settlement {
  sender: string;
  receiver: string;
  amount: number;
  statement: string;
}

export default function BalancesSummary() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBalances = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await expenseApi.getBalances();
      const data = (response as { data?: Settlement[] }).data;
      setSettlements(Array.isArray(data) ? data : []);
      setError("");
    } catch (err: unknown) {
      setError(
        isNetworkError(err)
          ? `Cannot reach the backend. Start it with "npm run dev" in the backend folder (default: ${API_BASE_URL.replace("/api", "")}).`
          : "Failed to fetch group balances. Make sure you're logged in."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) fetchBalances();
  }, [user, authLoading]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-stone-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Settlements
          </h1>
          <p className="mt-1 text-stone-500">
            Optimal way to settle all group debts
          </p>
        </div>
        <button
          type="button"
          onClick={fetchBalances}
          className="inline-flex w-auto shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-orange-600 bg-white px-5 py-2.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50 disabled:opacity-60"
          disabled={loading}
        >
          <RefreshCw
            size={18}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 p-6 text-white shadow-xl shadow-orange-600/25">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Wallet size={24} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">
              Optimized split
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              The algorithm uses the minimum number of transactions to settle
              everyone&apos;s balances.
            </p>
          </div>
          <div className="flex gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <Info size={20} className="shrink-0 text-orange-600" />
            <p className="text-sm text-stone-500">
              Follow these transfers to clear all outstanding amounts in the
              group.
            </p>
          </div>
        </aside>

        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-500">
            Active settlements
          </h2>

          {loading && (
            <div className="py-12 text-center text-stone-500">
              Calculating settlements...
            </div>
          )}

          {!loading && settlements.length === 0 && !error && (
            <div className="rounded-xl border border-stone-200 bg-white p-12 text-center shadow-sm">
              <p className="text-stone-500">
                No settlements yet. Add some expenses first.
              </p>
            </div>
          )}

          <div className="space-y-5">
            {settlements.map((item, index) => (
              <div key={index} className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                  <div className="flex flex-1 flex-col items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <UserCircle2 size={28} />
                    </div>
                    <div className="mt-2 font-semibold text-stone-900">
                      {item.sender}
                    </div>
                    <div className="text-xs font-semibold uppercase text-red-600">
                      Debtor
                    </div>
                  </div>
                  <div className="flex flex-1.5 flex-col items-center">
                    <div className="text-xl font-extrabold text-orange-600 sm:text-2xl">
                      ₹{item.amount.toLocaleString()}
                    </div>
                    <div className="flex w-full items-center justify-center py-2">
                      <div className="h-px flex-1 bg-orange-200" />
                      <div className="rounded-full bg-white px-2 shadow-sm">
                        <ArrowRight size={20} className="text-orange-600" />
                      </div>
                      <div className="h-px flex-1 bg-orange-200" />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <UserCircle2 size={28} />
                    </div>
                    <div className="mt-2 font-semibold text-stone-900">
                      {item.receiver}
                    </div>
                    <div className="text-xs font-semibold uppercase text-emerald-600">
                      Creditor
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-lg border-l-4 border-orange-500 bg-orange-50/50 px-4 py-3 text-center text-sm text-stone-600">
                  {item.statement}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
