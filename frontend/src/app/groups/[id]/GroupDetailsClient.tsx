"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  groupsApi,
  usersApi,
  expenseApi,
  Group,
  Expense,
  Settlement,
  User,
  getPaidByName,
  isNetworkError,
  API_BASE_URL,
} from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  ArrowRight,
  IndianRupee,
  RefreshCw,
  Users,
  UserCircle2,
  UserPlus,
  Wallet,
  Pencil,
  Eye,
  Trash2,
} from "lucide-react";
import AddExpenseForm from "@/components/AddExpenseForm";
import ExpenseDetailModal from "@/components/ExpenseDetailModal";
import Avatar from "@/components/Avatar";

export default function GroupDetailsClient() {
  const params = useParams<{ id: string }>();
  const groupId = params?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [balancesLoading, setBalancesLoading] = useState(true);
  const [error, setError] = useState("");
  const [balancesError, setBalancesError] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [addMemberDropdownOpen, setAddMemberDropdownOpen] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [deleteGroupConfirm, setDeleteGroupConfirm] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const addMemberDropdownRef = useRef<HTMLDivElement>(null);

  const isNewlyCreated = searchParams?.get("created") === "1";

  const isGroupCreator = useMemo(() => {
    if (!group || !user) return false;
    const creatorId = typeof group.createdBy === "object" && group.createdBy && "_id" in group.createdBy
      ? (group.createdBy as User)._id
      : String(group.createdBy ?? "");
    return creatorId === user._id;
  }, [group, user]);

  const currentMemberIds = useMemo(
    () =>
      (group?.members ?? []).map((m) =>
        typeof m === "object" && m && "_id" in m ? (m as User)._id : String(m)
      ),
    [group?.members]
  );

  const usersToAdd = useMemo(
    () =>
      allUsers.filter(
        (u) =>
          !currentMemberIds.includes(u._id) && u._id !== user?._id
      ),
    [allUsers, currentMemberIds, user?._id]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        addMemberDropdownRef.current &&
        !addMemberDropdownRef.current.contains(e.target as Node)
      ) {
        setAddMemberDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchGroup = async () => {
    if (!groupId) return;
    try {
      const res = await groupsApi.getGroup(groupId);
      setGroup((res as { data?: Group }).data ?? null);
    } catch (err: unknown) {
      const isNetwork = isNetworkError(err);
      setError(
        isNetwork
          ? `Cannot reach the backend. Start it with \"npm run dev\" in the backend folder (default: ${API_BASE_URL.replace(
              "/api",
              ""
            )}).`
          : "Failed to fetch group details."
      );
      console.error(err);
    }
  };

  const fetchExpenses = async () => {
    if (!groupId) return;
    try {
      const res = await groupsApi.getGroupExpenses(groupId);
      const list = (res as { data?: Expense[] }).data ?? [];
      setExpenses(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to fetch group expenses.");
    }
  };

  const fetchBalances = async () => {
    if (!groupId) return;
    try {
      setBalancesLoading(true);
      const res = await groupsApi.getGroupBalances(groupId);
      const list = (res as { data?: Settlement[] }).data ?? [];
      setSettlements(Array.isArray(list) ? list : []);
      setBalancesError("");
    } catch (err: unknown) {
      const isNetwork = isNetworkError(err);
      setBalancesError(
        isNetwork
          ? `Cannot reach the backend. Start it with \"npm run dev\" in the backend folder (default: ${API_BASE_URL.replace(
              "/api",
              ""
            )}).`
          : "Failed to fetch group balances."
      );
      console.error(err);
    } finally {
      setBalancesLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await usersApi.getAllUsers();
      const list = (res as { data?: User[] }).data ?? [];
      setAllUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!groupId) return;
    try {
      setAddMemberLoading(true);
      setAddMemberError("");
      const res = await groupsApi.addMember(groupId, userId);
      const updated = (res as { data?: Group }).data;
      if (updated) setGroup(updated);
      setAddMemberDropdownOpen(false);
    } catch (err: unknown) {
      const isNetwork = isNetworkError(err);
      setAddMemberError(
        isNetwork
          ? "Cannot reach the backend."
          : (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to add member."
      );
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      setDeletingExpenseId(expenseId);
      await expenseApi.deleteExpense(expenseId);
      setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
      fetchBalances();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to delete expense";
      setError(msg);
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId) return;
    try {
      setDeletingGroup(true);
      await groupsApi.deleteGroup(groupId);
      router.push("/groups");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to delete group";
      setError(msg);
      setDeleteGroupConfirm(false);
    } finally {
      setDeletingGroup(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user && groupId) {
      setLoading(true);
      Promise.all([
        fetchGroup(),
        fetchExpenses(),
        fetchBalances(),
        fetchUsers(),
      ]).finally(() => setLoading(false));
    }
  }, [user, authLoading, groupId]);

  const totalAmount = useMemo(
    () => expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    [expenses]
  );

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!groupId) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Invalid group id.
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <button
        type="button"
        onClick={() => router.push("/groups")}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to groups
      </button>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {group?.name ?? "Group"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track expenses and see optimized settlements just for this group.
          </p>
          {group && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1">
                <Users size={14} className="text-muted-foreground" />
                {group.members?.length ?? 0} member
                {(group.members?.length ?? 0) !== 1 ? "s" : ""}
              </span>
              {isNewlyCreated && (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                  New group
                </span>
              )}
            </div>
          )}

        </div>
        {group && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/add?groupId=${group._id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-smooth hover:opacity-90 hover:shadow-xl hover:shadow-primary/40"
            >
              Add expense to group
            </Link>
            {isGroupCreator && (
              deleteGroupConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Delete group?</span>
                  <button
                    type="button"
                    onClick={handleDeleteGroup}
                    disabled={deletingGroup}
                    className="inline-flex items-center gap-1.5 rounded-xl border-2 border-red-500 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-smooth hover:bg-red-100 disabled:opacity-60"
                  >
                    {deletingGroup ? "Deleting..." : "Yes, delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteGroupConfirm(false)}
                    disabled={deletingGroup}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeleteGroupConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-smooth hover:border-red-300 hover:bg-red-50"
                  title="Delete group (creator only)"
                >
                  <Trash2 size={16} />
                  Delete group
                </button>
              )
            )}
          </div>
        )}
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5">
          {group && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Members
              </h3>
              <ul className="space-y-2">
                {(group.members ?? []).map((m) => {
                  const member = typeof m === "object" && m && "name" in m ? (m as User) : null;
                  const name = member?.name ?? (typeof m === "string" ? m : "Unknown");
                  const email = member?.email ?? "";
                  const id = member?._id ?? String(m);
                  return (
                    <li
                      key={id}
                      className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2"
                    >
                      {member?._id ? (
                        <Avatar userId={member._id} name={name} size={36} />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <UserCircle2 size={20} className="text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-foreground">{name}</span>
                        {email && (
                          <span className="text-xs text-muted-foreground truncate">{email}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {usersToAdd.length > 0 && (
                <div className="mt-4" ref={addMemberDropdownRef}>
                  <label className="mb-2 block text-xs font-semibold text-muted-foreground">
                    Add member
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setAddMemberDropdownOpen(!addMemberDropdownOpen)
                      }
                      disabled={addMemberLoading}
                      className="flex w-full items-center justify-between rounded-lg border-2 border-border bg-card px-3 py-2 text-left text-sm outline-none transition-all hover:border-primary/50 focus:border-primary disabled:opacity-60"
                    >
                      <span className="flex items-center gap-2 text-foreground">
                        <UserPlus size={14} />
                        {addMemberLoading ? "Adding..." : "Select user to add"}
                      </span>
                      <svg
                        className={`h-4 w-4 text-muted-foreground transition-transform ${addMemberDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {addMemberDropdownOpen && (
                      <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 w-full overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-card py-1 shadow-lg">
                        {usersToAdd.map((u) => (
                          <li key={u._id}>
                            <button
                              type="button"
                              onClick={() => handleAddMember(u._id)}
                              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-secondary"
                            >
                              <Avatar userId={u._id} name={u.name} size={32} />
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium text-foreground">
                                  {u.name}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {u.email}
                                </span>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {addMemberError && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {addMemberError}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl border border-border bg-gradient-to-br bg-secondary p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Group total
            </h3>
            <div className="mt-3 flex items-center gap-2 text-3xl font-extrabold text-primary">
              <IndianRupee size={28} strokeWidth={2.5} />
              {totalAmount.toLocaleString()}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Across {expenses.length} transaction
              {expenses.length !== 1 ? "s" : ""} in this group.
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-6 text-white shadow-xl shadow-primary/25">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card/20">
              <Wallet size={24} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">
              Group settlements
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              The algorithm minimises the number of transfers between members to
              clear all balances within this group.
            </p>
            <button
              type="button"
              onClick={fetchBalances}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-card/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-card/20"
            >
              <RefreshCw
                size={14}
                className={balancesLoading ? "animate-spin" : ""}
              />
              Refresh settlements
            </button>
          </div>
        </aside>

        <section className="space-y-8">
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Group expenses
            </h2>

            {loading ? (
              <div className="py-10 text-center text-muted-foreground">
                Loading group expenses...
              </div>
            ) : expenses.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
                <p className="text-muted-foreground">
                  No expenses yet in this group. Add one to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => {
                  const createdById = typeof expense.createdBy === "object" && expense.createdBy && "_id" in expense.createdBy
                    ? (expense.createdBy as { _id: string })._id
                    : (expense.createdBy ?? "");
                  const canEdit = user?._id && createdById === user._id;
                  return (
                    <div
                      key={expense._id}
                      className="relative min-h-[10rem] overflow-hidden rounded-xl border-2 border-border p-5 shadow-[0_2px_12px_rgba(5,3,21,0.06),inset_0_1px_0_rgba(255,255,255,0.7)] transition-smooth"
                      style={{ background: "linear-gradient(135deg, #fbf8f5 0%, #faefdd 45%, #f5e6d6 80%, rgba(247,133,45,0.06) 100%)" }}
                    >
                      <div
                        className="pointer-events-none absolute top-0 left-0 flex h-[10rem] w-[10rem] items-center justify-center translate-x-[38%] text-primary/12"
                        aria-hidden
                      >
                        <IndianRupee size={4000} strokeWidth={3} />
                      </div>
                      <div className="relative z-10 flex flex-col gap-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-foreground">
                              {expense.description || "—"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Paid by{" "}
                              <span className="font-medium text-foreground">
                                {getPaidByName(expense)}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center text-lg font-bold text-primary">
                              <IndianRupee size={18} strokeWidth={2.5} className="shrink-0" />
                              {expense.amount.toLocaleString()}
                            </div>
                            {canEdit && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setEditingExpense(expense)}
                                  className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                                  title="Edit expense"
                                  aria-label="Edit expense"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteExpense(expense._id)}
                                  disabled={deletingExpenseId === expense._id}
                                  className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                                  title="Delete expense"
                                  aria-label="Delete expense"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 pt-3 border-t border-border/60 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setViewingExpense(expense)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#622c04]/30 bg-[#fef3e8] px-4 py-2.5 text-sm font-semibold text-[#622c04] transition-all duration-200 hover:border-[#622c04] hover:bg-[#faefdd]"
                            title="View details"
                            aria-label="View expense details"
                          >
                            <Eye size={16} />
                            View detail
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Group settlements
            </h2>

            {balancesError && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {balancesError}
              </div>
            )}

            {balancesLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Calculating settlements...
              </div>
            ) : settlements.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
                <p className="text-muted-foreground">
                  No settlements needed yet. Add or update expenses.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {settlements.map((item, index) => {
                  const isYouPay = item.sender === user?.name;
                  const isYouReceive = item.receiver === user?.name;
                  return (
                    <div
                      key={index}
                      className={`rounded-xl border p-5 shadow-sm transition-smooth ${
                        isYouPay
                          ? "border-accent/40 bg-[#faf3e8]"
                          : isYouReceive
                            ? "border-primary/40 bg-[#fef9f5]"
                            : "border-border bg-card"
                      }`}
                    >
                      {(isYouPay || isYouReceive) && (
                        <div className="mb-3 flex justify-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                              isYouPay
                                ? "bg-accent/15 text-accent"
                                : "bg-[#faefdd] text-[#050315] ring-2 ring-[#f7852d]/50"
                            }`}
                          >
                            {isYouPay ? "You pay" : "You receive"}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                        <div className="flex flex-1 flex-col items-center text-center">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full shrink-0">
                            {item.senderId ? (
                              <Avatar
                                userId={item.senderId}
                                name={item.sender}
                                size={48}
                              />
                            ) : (
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                  isYouPay
                                    ? "bg-accent/20 text-accent"
                                    : "bg-secondary text-muted-foreground"
                                }`}
                              >
                                <UserCircle2 size={26} />
                              </div>
                            )}
                          </div>
                          <div className="mt-2 text-sm font-semibold text-foreground">
                            {item.sender}
                          </div>
                        </div>
                        <div className="flex flex-1.5 flex-col items-center">
                          <div className="text-lg font-extrabold text-primary">
                            ₹{item.amount.toLocaleString()}
                          </div>
                          <div className="flex w-full items-center justify-center py-2">
                            <div className="h-px flex-1 bg-primary/30" />
                            <div className="rounded-full bg-card px-2 shadow-sm">
                              <ArrowRight size={18} className="text-primary" />
                            </div>
                            <div className="h-px flex-1 bg-primary/30" />
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col items-center text-center">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full shrink-0">
                            {item.receiverId ? (
                              <Avatar
                                userId={item.receiverId}
                                name={item.receiver}
                                size={48}
                              />
                            ) : (
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                                  isYouReceive
                                    ? "bg-primary/20 text-primary"
                                    : "bg-secondary text-muted-foreground"
                                }`}
                              >
                                <UserCircle2 size={26} />
                              </div>
                            )}
                          </div>
                          <div className="mt-2 text-sm font-semibold text-foreground">
                            {item.receiver}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 rounded-lg border-l-4 border-primary bg-secondary/50 px-4 py-2 text-center text-xs text-foreground">
                        {item.statement}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                groupId={groupId ?? null}
                compact
                onClose={() => {
                  setEditingExpense(null);
                  fetchGroup();
                  fetchExpenses();
                  fetchBalances();
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
