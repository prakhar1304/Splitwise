"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  expenseApi,
  Expense,
  isNetworkError,
  API_BASE_URL,
  getPaidByName,
  Analytics,
} from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import {
  Trash2,
  User,
  Users,
  Calendar,
  IndianRupee,
  RefreshCw,
  Pencil,
  Eye,
} from "lucide-react";
import AddExpenseForm from "@/components/AddExpenseForm";
import ExpenseDetailModal from "@/components/ExpenseDetailModal";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);

  const fetchExpenses = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [expRes, analyticsRes] = await Promise.all([
        expenseApi.getAllExpenses(),
        expenseApi.getAnalytics(),
      ]);
      const list = (expRes as { data?: Expense[] }).data ?? [];
      setExpenses(Array.isArray(list) ? list : []);
      const analyticsData = (analyticsRes as { data?: Analytics }).data ?? null;
      setAnalytics(analyticsData);
      setError("");
    } catch (err: unknown) {
      const isNetwork = isNetworkError(err);
      const apiMsg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(
        isNetwork
          ? `Cannot reach the backend. Start it with "npm run dev" in the backend folder (default: ${API_BASE_URL.replace("/api", "")}).`
          : apiMsg || "Failed to fetch expenses. Make sure you're logged in and the backend is running."
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
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your group expenses with ease
          </p>
        </div>
        <button
          type="button"
          onClick={fetchExpenses}
          className="inline-flex w-auto shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card px-5 py-2.5 text-sm font-semibold text-primary transition-smooth hover:bg-secondary disabled:opacity-60"
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
          <div className="rounded-xl border border-border bg-secondary p-6 shadow-sm transition-smooth">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Total spending
            </h3>
            <div className="mt-3 flex items-center gap-2 text-3xl font-extrabold text-primary">
              <IndianRupee size={28} strokeWidth={2.5} />
              {(analytics?.totalSpending ?? expenses.reduce((a, e) => a + e.amount, 0)).toLocaleString()}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Across {analytics?.expenseCount ?? expenses.length} transaction
              {(analytics?.expenseCount ?? expenses.length) !== 1 ? "s" : ""}
            </p>
          </div>
          {analytics && (analytics.byMonth?.length > 0 || analytics.byCategory?.length > 0) && (
            <div className="rounded-xl border border-border bg-secondary p-6 shadow-sm transition-smooth">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Spending by month
              </h3>
              <div className="mt-4 space-y-3">
                {analytics.byMonth.map((m) => {
                  const max = Math.max(...analytics.byMonth.map((x) => x.total), 1);
                  const pct = max > 0 ? (m.total / max) * 100 : 0;
                  return (
                    <div key={m.month} className="flex items-center gap-3">
                      <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">
                        {m.label}
                      </span>
                      <div className="flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-6 rounded-full bg-primary/80 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 shrink-0 text-right text-xs font-semibold text-foreground">
                        ₹{m.total.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
              {analytics.byCategory?.length > 0 && (
                <>
                  <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    By category
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {analytics.byCategory.map((c) => (
                      <li
                        key={c.name}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-muted-foreground">{c.name}</span>
                        <span className="font-semibold text-foreground">
                          ₹{c.total.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </aside>

        <section>
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent expenses
          </h2>

          {loading && (
            <div className="py-12 text-center text-muted-foreground">
              Loading expenses...
            </div>
          )}

          {!loading && expenses.length === 0 && !error && (
            <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
              <p className="text-muted-foreground">
                No expenses yet. Add one to get started.
              </p>
            </div>
          )}

          <div className="space-y-5">
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className="relative min-h-[11rem] overflow-hidden rounded-xl border-2 border-border p-6 shadow-[0_2px_12px_rgba(5,3,21,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] transition-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                style={{ background: "linear-gradient(135deg, #fbf8f5 0%, #faefdd 45%, #f5e6d6 80%, rgba(247,133,45,0.06) 100%)" }}
              >
                <div
                  className="pointer-events-none absolute top-0 right-0 flex h-[8.75rem] w-[8.75rem] items-center justify-center translate-x-[38%] -translate-y-[28%] text-primary/12"
                  aria-hidden
                >
                  <IndianRupee size={100} strokeWidth={1.25} />
                </div>
                <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {expense.description || "—"}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar size={14} />
                      {expense.createdAt
                        ? new Date(expense.createdAt).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                  <div className="flex items-center text-xl font-bold text-primary sm:text-2xl">
                    <IndianRupee size={20} strokeWidth={2.5} className="shrink-0" />
                    {expense.amount.toLocaleString()}
                  </div>
                </div>

                <div className="relative z-10 mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Paid by
                    </span>
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <User size={12} />
                      </div>
                      {getPaidByName(expense)}
                    </div>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Split
                    </span>
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <Users size={16} className="text-muted-foreground" />
                      {expense.splitType || "equal"} •{" "}
                      {expense.splitDetails?.length ?? 0} participants
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingExpense(expense)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-primary"
                    title="View details"
                    aria-label="View expense details"
                  >
                    <Eye size={16} />
                    View detail
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingExpense(expense)}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-primary"
                    title="Edit expense"
                    aria-label="Edit expense"
                  >
                    <Pencil size={16} />
                  </button>
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

      {viewingExpense && (
        <ExpenseDetailModal
          expense={viewingExpense}
          onClose={() => setViewingExpense(null)}
        />
      )}

      {editingExpense && (
        <>
          <div
            className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm animate-in fade-in duration-200"
            aria-hidden
            onClick={() => setEditingExpense(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-4 bottom-4 top-auto z-50 max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300 sm:inset-x-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:bottom-auto sm:max-h-[90vh] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2"
          >
            <div className="p-4 sm:p-6">
              <AddExpenseForm
                expenseId={editingExpense._id}
                initialExpense={editingExpense}
                groupId={
                  typeof editingExpense.groupId === "object" && editingExpense.groupId?._id
                    ? editingExpense.groupId._id
                    : typeof editingExpense.groupId === "string"
                      ? editingExpense.groupId
                      : null
                }
                compact
                onClose={() => {
                  setEditingExpense(null);
                  fetchExpenses();
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
