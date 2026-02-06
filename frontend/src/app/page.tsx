"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { expenseApi, Expense, isNetworkError, API_BASE_URL } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import {
  Trash2,
  User,
  Users,
  Calendar,
  IndianRupee,
  RefreshCw,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchExpenses = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await expenseApi.getAllExpenses();
      const list = (response as { data?: Expense[] }).data ?? [];
      setExpenses(Array.isArray(list) ? list : []);
      setError("");
    } catch (err: unknown) {
      const isNetwork = isNetworkError(err);
      setError(
        isNetwork
          ? `Cannot reach the backend. Start it with "npm run dev" in the backend folder (default: ${API_BASE_URL.replace("/api", "")}).`
          : "Failed to fetch expenses. Make sure you're logged in and the backend is running."
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
    if (user) fetchExpenses();
  }, [user, authLoading]);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await expenseApi.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Delete failed";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

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
            Dashboard
          </h1>
          <p className="mt-1 text-stone-500">
            Manage your group expenses with ease
          </p>
        </div>
        <button
          type="button"
          onClick={fetchExpenses}
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
          <p className="mt-2 text-sm text-amber-800 opacity-90">
            Backend should run on port 5000 by default. Set{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">
              NEXT_PUBLIC_API_URL
            </code>{" "}
            in the frontend if your API is at a different URL.
          </p>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-xl border border-stone-200 bg-gradient-to-br from-orange-50/60 to-amber-50/40 p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Total group spending
            </h3>
            <div className="mt-3 flex items-center gap-2 text-3xl font-extrabold text-orange-600">
              <IndianRupee size={28} strokeWidth={2.5} />
              {expenses
                .reduce((acc, curr) => acc + curr.amount, 0)
                .toLocaleString()}
            </div>
            <p className="mt-2 text-sm text-stone-500">
              Across {expenses.length} transaction
              {expenses.length !== 1 ? "s" : ""}
            </p>
          </div>
        </aside>

        <section>
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-stone-500">
            Recent expenses
          </h2>

          {loading && (
            <div className="py-12 text-center text-stone-500">
              Loading expenses...
            </div>
          )}

          {!loading && expenses.length === 0 && !error && (
            <div className="rounded-xl border border-stone-200 bg-white p-12 text-center shadow-sm">
              <p className="text-stone-500">
                No expenses yet. Add one to get started.
              </p>
            </div>
          )}

          <div className="space-y-5">
            {expenses.map((expense) => (
              <div key={expense._id} className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-lg hover:shadow-orange-500/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">
                      {expense.name || expense.description}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-stone-500">
                      <Calendar size={14} />
                      {expense.createdAt
                        ? new Date(expense.createdAt).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                  <div className="flex items-center text-xl font-bold text-orange-600 sm:text-2xl">
                    <IndianRupee size={20} strokeWidth={2.5} />
                    {expense.amount.toLocaleString()}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 border-t border-stone-100 pt-4 sm:grid-cols-2">
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-400">
                      Paid by
                    </span>
                    <div className="flex items-center gap-2 font-medium text-stone-700">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        <User size={12} />
                      </div>
                      {expense.paidBy}
                    </div>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-400">
                      Participants
                    </span>
                    <div className="flex items-center gap-2 font-medium text-stone-700">
                      <Users size={16} className="text-stone-400" />
                      {Array.isArray(expense.participants)
                        ? expense.participants.join(", ")
                        : ""}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                    onClick={() => handleDelete(expense._id)}
                    disabled={deletingId === expense._id}
                  >
                    <Trash2 size={16} />
                    {deletingId === expense._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
