"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { expenseApi, groupsApi, Group, SplitDetail, Expense } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import {
  CreditCard,
  IndianRupee,
  User,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import Avatar from "@/components/Avatar";

/** Convert percentage shares to amounts that sum exactly to totalAmount (handles rounding). */
function percentagesToAmounts(
  participantIds: string[],
  splitDetails: Record<string, string>,
  totalAmount: number
): SplitDetail[] {
  const pcts = participantIds.map((id) => Number(splitDetails[id] || 0) / 100);
  const sumPct = pcts.reduce((a, b) => a + b, 0);
  if (Math.abs(sumPct - 1) > 0.001) {
    throw new Error(`Percentages must add up to 100% (current: ${(sumPct * 100).toFixed(1)}%).`);
  }
  const amounts = pcts.map((p) => parseFloat((p * totalAmount).toFixed(2)));
  let diff = parseFloat((totalAmount - amounts.reduce((a, b) => a + b, 0)).toFixed(2));
  if (diff !== 0 && amounts.length > 0) {
    amounts[0] = parseFloat((amounts[0] + diff).toFixed(2));
  }
  return participantIds.map((id, i) => ({ userId: id, amount: amounts[i]! }));
}

interface AddExpenseFormProps {
  groupId?: string | null;
  onClose?: () => void;
  /** When true, render in compact modal style (no full-page header) */
  compact?: boolean;
  /** Edit mode: expense id and initial values */
  expenseId?: string | null;
  initialExpense?: Expense | null;
}

export default function AddExpenseForm({
  groupId = null,
  onClose,
  compact = false,
  expenseId = null,
  initialExpense = null,
}: AddExpenseFormProps) {
  const isEditMode = !!(expenseId && initialExpense);
  const effectiveGroupId = initialExpense?.groupId ?? groupId;
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
  const [group, setGroup] = useState<Group | null>(null);
  const [splitType, setSplitType] = useState<"equal" | "unequal" | "percentage">(
    "equal"
  );
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(
    []
  );
  const [splitDetails, setSplitDetails] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEditMode && user) setFormData((prev) => ({ ...prev, paidBy: user.name }));
  }, [user, isEditMode]);

  useEffect(() => {
    const loadGroup = async () => {
      if (!effectiveGroupId) return;
      try {
        const res = await groupsApi.getGroup(effectiveGroupId);
        const data = (res as { data?: Group }).data ?? null;
        setGroup(data);
        if (isEditMode && initialExpense?.splitDetails?.length) {
          const ids = initialExpense.splitDetails.map((d) => d.userId);
          setSelectedParticipantIds(ids);
          const details: Record<string, string> = {};
          const stype = (initialExpense.splitType as "equal" | "unequal" | "percentage") || "equal";
          const total = Number(initialExpense.amount) || 1;
          initialExpense.splitDetails.forEach((d) => {
            if (stype === "percentage" && total > 0) {
              details[d.userId] = String(Math.round((d.amount / total) * 1000) / 10);
            } else {
              details[d.userId] = String(d.amount);
            }
          });
          setSplitDetails(details);
          setSplitType(stype);
        } else if (data?.members && !isEditMode) {
          const ids = data.members.map((m) => m._id);
          setSelectedParticipantIds(ids);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (effectiveGroupId) loadGroup();
  }, [effectiveGroupId, isEditMode, initialExpense?.splitDetails, initialExpense?.splitType]);

  useEffect(() => {
    if (isEditMode && initialExpense) {
      setFormData({
        name: initialExpense.name || "",
        amount: String(initialExpense.amount ?? ""),
        paidBy: initialExpense.paidBy || "",
        participants: Array.isArray(initialExpense.participants)
          ? initialExpense.participants.join(", ")
          : "",
      });
      const paidByInParticipants = !!(
        Array.isArray(initialExpense.participants) &&
        initialExpense.paidBy &&
        initialExpense.participants.some(
          (p) => p.toLowerCase() === initialExpense.paidBy?.toLowerCase()
        )
      );
      setIncludePaidBy(paidByInParticipants);
    }
  }, [isEditMode, initialExpense]);

  const isGroupMode = !!effectiveGroupId && !!group;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const amountNumber = Number(formData.amount);
      if (!amountNumber || amountNumber <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      if (isEditMode && expenseId) {
        if (isGroupMode && group) {
          let participantIds = selectedParticipantIds;
          if (participantIds.length === 0) participantIds = group.members.map((m) => m._id);
          if (splitType === "equal") {
            await expenseApi.updateExpense(expenseId, {
              name: formData.name,
              description: formData.name,
              amount: amountNumber,
              paidBy: user?.name ?? formData.paidBy,
              paidByUser: user?._id,
              participantIds,
            });
          } else {
            const entries: SplitDetail[] =
              splitType === "percentage"
                ? percentagesToAmounts(participantIds, splitDetails, amountNumber)
                : participantIds.map((id) => ({
                    userId: id,
                    amount: Number(splitDetails[id] || 0),
                  }));
            if (splitType === "unequal") {
              const total = entries.reduce((s, d) => s + d.amount, 0);
              if (Math.abs(total - amountNumber) > 0.02) {
                throw new Error(
                  `Sum of individual shares (${total}) must equal total amount (${amountNumber})`
                );
              }
            }
            await expenseApi.updateExpense(expenseId, {
              name: formData.name,
              description: formData.name,
              amount: amountNumber,
              paidBy: user?.name ?? formData.paidBy,
              paidByUser: user?._id,
              splitType,
              splitDetails: entries,
            });
          }
        } else {
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
          await expenseApi.updateExpense(expenseId, {
            name: formData.name,
            description: formData.name,
            amount: amountNumber,
            paidBy: formData.paidBy,
            participants: participantList,
          });
        }
      } else if (isGroupMode && group && user) {
        let participantIds = selectedParticipantIds;
        if (participantIds.length === 0) {
          participantIds = group.members.map((m) => m._id);
          setSelectedParticipantIds(participantIds);
        }
        if (splitType === "equal") {
          await groupsApi.createGroupExpense({
            name: formData.name,
            amount: amountNumber,
            description: formData.name,
            paidBy: user.name,
            paidByUser: user._id,
            groupId: effectiveGroupId!,
            splitType,
            participantIds,
          });
        } else {
          const entries: SplitDetail[] =
            splitType === "percentage"
              ? percentagesToAmounts(selectedParticipantIds, splitDetails, amountNumber)
              : selectedParticipantIds.map((id) => ({
                  userId: id,
                  amount: Number(splitDetails[id] || 0),
                }));
          if (splitType === "unequal") {
            const total = entries.reduce((s, d) => s + d.amount, 0);
            if (Math.abs(total - amountNumber) > 0.02) {
              throw new Error(
                `Sum of individual shares (${total}) must equal total amount (${amountNumber})`
              );
            }
          }
          await groupsApi.createGroupExpense({
            name: formData.name,
            amount: amountNumber,
            description: formData.name,
            paidBy: user.name,
            paidByUser: user._id,
            groupId: effectiveGroupId!,
            splitType,
            splitDetails: entries,
          });
        }
      } else {
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
        await expenseApi.createExpense({
          name: formData.name,
          amount: Number(formData.amount),
          description: formData.name,
          paidBy: formData.paidBy,
          participants: participantList,
        });
      }
      setSuccess(true);
      setTimeout(() => {
        if (onClose) {
          onClose();
          return;
        }
        if (isGroupMode && effectiveGroupId) router.push(`/groups/${effectiveGroupId}`);
        else router.push("/");
      }, 1500);
    } catch (err: unknown) {
      const msg =
        (err as { message?: string; response?: { data?: { message?: string } } })
          ?.response?.data?.message ||
        (err as { message?: string }).message ||
        (isEditMode ? "Failed to update expense." : "Failed to add expense. Check backend connection.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className={compact ? "" : "animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12"}>
      {!compact && (
        <header className="mb-12">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {isEditMode
              ? "Edit expense"
              : isGroupMode
                ? "Add group expense"
                : "Add new expense"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isEditMode
              ? "Update the expense details below."
              : isGroupMode
                ? "Add an expense that belongs to this group and choose how it should be split."
                : "Split costs instantly with your friends"}
          </p>
        </header>
      )}

      <div className={compact ? "" : "grid gap-10 lg:grid-cols-[280px_1fr]"}>
        {!compact && (
          <aside className="space-y-5">
            <div className="rounded-xl border border-border bg-secondary p-6 shadow-sm transition-smooth">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                Splitting simplified
              </h3>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Smart entry</span>
                    <p className="mt-0.5">Enter the total amount and who paid.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Users size={18} />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Auto-balance</span>
                    <p className="mt-0.5">Tag participants to divide the debt.</p>
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        )}

        <section className={compact ? "" : "relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-smooth before:absolute before:right-2 before:top-2 before:h-20 before:w-20 before:rounded-full before:bg-primary before:opacity-15 before:blur-2xl before:content-[''] after:absolute after:-right-6 after:-top-6 after:h-24 after:w-24 after:rounded-full after:bg-accent after:opacity-10 after:blur-2xl after:content-['']"}>
          <div className={compact ? "" : "relative z-10"}>
          {compact && onClose && (
            <div className="relative z-10 flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {isEditMode ? "Edit expense" : isGroupMode ? "Add group expense" : "Add expense"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-smooth"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm mb-4">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success ? (
            <div className={compact ? "py-8 text-center" : "py-12 text-center"}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={28} />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {isEditMode ? "Expense updated" : "Expense added"}
              </h2>
              <p className="mt-1 text-muted-foreground">Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <FileText size={16} />
                  Title / description
                </label>
                <div className="relative overflow-hidden rounded-lg before:absolute before:right-0 before:top-0 before:h-8 before:w-8 before:rounded-full before:bg-primary before:opacity-25 before:blur-lg before:content-['']">
                <input
                  type="text"
                  className="relative w-full rounded-lg border border-input bg-transparent px-4 py-3 text-foreground outline-none transition-all placeholder:opacity-60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="What was this for?"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <IndianRupee size={16} />
                  Amount
                </label>
                <div className="relative overflow-hidden rounded-lg before:absolute before:right-0 before:top-0 before:h-8 before:w-8 before:rounded-full before:bg-primary before:opacity-25 before:blur-lg before:content-['']">
                <input
                  type="number"
                  className="relative w-full rounded-lg border border-input bg-transparent px-4 py-3 text-foreground outline-none transition-all placeholder:opacity-60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="0.00"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
                </div>
              </div>

              {isGroupMode ? (
                <>
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-muted-foreground">Split type</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "equal", label: "Equal" },
                        { value: "unequal", label: "Unequal" },
                        { value: "percentage", label: "Percentage" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSplitType(opt.value as typeof splitType)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-smooth ${
                            splitType === opt.value
                              ? "border-primary bg-primary/15 text-accent"
                              : "border-input bg-card text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-muted-foreground">Participants</span>
                    <div className="space-y-2 rounded-xl border border-border bg-secondary/60 p-3 max-h-48 overflow-y-auto">
                      {group?.members.map((member) => (
                        <label
                          key={member._id}
                          className="flex items-center justify-between gap-3 rounded-lg bg-card px-3 py-2 text-sm shadow-sm transition-smooth"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                              checked={selectedParticipantIds.includes(member._id)}
                              onChange={(e) => {
                                setSelectedParticipantIds((prev) =>
                                  e.target.checked
                                    ? [...prev, member._id]
                                    : prev.filter((id) => id !== member._id)
                                );
                              }}
                            />
                            <Avatar userId={member._id} name={member.name} size={28} />
                            <span className="font-medium text-foreground">{member.name}</span>
                          </div>
                          {(splitType === "unequal" || splitType === "percentage") && (
                            <input
                              type="number"
                              className="w-24 rounded-lg border border-input px-2 py-1 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                              placeholder={splitType === "percentage" ? "% share" : "Amount"}
                              value={splitDetails[member._id] || ""}
                              onChange={(e) =>
                                setSplitDetails((prev) => ({
                                  ...prev,
                                  [member._id]: e.target.value,
                                }))
                              }
                            />
                          )}
                        </label>
                      ))}
                      {splitType !== "equal" && (
                        <p className="pt-1 text-xs text-muted-foreground">
                          {splitType === "percentage"
                            ? "Enter each person's share as a percentage (e.g. 70, 30). Percentages must add up to 100%."
                            : "Sum of individual shares must equal the total amount."}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <User size={16} />
                      Paid by
                    </label>
                    <div className="relative overflow-hidden rounded-lg before:absolute before:right-0 before:top-0 before:h-8 before:w-8 before:rounded-full before:bg-primary before:opacity-25 before:blur-lg before:content-['']">
                    <input
                      type="text"
                      className="relative w-full rounded-lg border border-input bg-transparent px-4 py-3 text-foreground outline-none transition-all placeholder:opacity-60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Who paid?"
                      required
                      value={formData.paidBy}
                      onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                    />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl bg-secondary/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <User size={16} className="text-primary" />
                      Include payer in participants
                    </span>
                    <label className="relative inline-block h-6 w-11 cursor-pointer">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={includePaidBy}
                        onChange={(e) => setIncludePaidBy(e.target.checked)}
                      />
                      <span className="absolute inset-0 rounded-full bg-input transition-smooth peer-checked:bg-primary"></span>
                      <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"></span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Users size={16} />
                      Other participants
                    </label>
                    <div className="relative overflow-hidden rounded-lg before:absolute before:right-0 before:top-0 before:h-8 before:w-8 before:rounded-full before:bg-primary before:opacity-25 before:blur-lg before:content-['']">
                    <input
                      type="text"
                      className="relative w-full rounded-lg border border-input bg-transparent px-4 py-3 text-foreground outline-none transition-all placeholder:opacity-60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Rahul, Neha (comma-separated)"
                      value={formData.participants}
                      onChange={(e) =>
                        setFormData({ ...formData, participants: e.target.value })
                      }
                    />
                    </div>
                    <p className="text-xs text-muted-foreground">Separate names with commas</p>
                  </div>
                </>
              )}
              <button
                type="submit"
                className="relative z-10 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-smooth hover:opacity-90 hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading
                  ? isEditMode
                    ? "Saving..."
                    : "Adding expense..."
                  : isEditMode
                    ? "Save changes"
                    : "Add expense"}
              </button>
            </form>
          )}
          </div>
        </section>
      </div>
    </div>
  );
}
