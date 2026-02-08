"use client";

import {
  Expense,
  getPaidByName,
  getCreatedByName,
  getSplitDetailUserName,
} from "@/utils/api";
import {
  X,
  IndianRupee,
  User,
  Calendar,
  Tag,
  Users,
  Receipt,
  Clock,
  UserPlus,
} from "lucide-react";
import Avatar from "@/components/Avatar";

interface ExpenseDetailModalProps {
  expense: Expense;
  onClose: () => void;
}

export default function ExpenseDetailModal({ expense, onClose }: ExpenseDetailModalProps) {
  const paidByName = getPaidByName(expense);
  const paidById =
    typeof expense.paidBy === "object" && expense.paidBy?._id
      ? expense.paidBy._id
      : String(expense.paidBy ?? "");
  const createdByName = getCreatedByName(expense);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm animate-in fade-in duration-200"
        aria-hidden
        onClick={onClose}
      />
      
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-detail-title"
        className="fixed inset-x-4 top-1/2 z-50 max-h-[90vh] -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in duration-300 sm:inset-x-auto sm:left-1/2 sm:right-auto sm:w-full sm:max-w-md sm:-translate-x-1/2"
      >
        <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-secondary blur-2xl z-0" />
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">

          <h2 id="expense-detail-title" className="text-lg font-semibold text-foreground">
            Expense details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Receipt size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Description
              </span>
            </div>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {expense.description || "—"}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <IndianRupee size={24} strokeWidth={2.5} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Amount
              </span>
              <p className="text-2xl font-bold text-primary">
                ₹{(expense.amount ?? 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User size={14} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Paid by
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Avatar userId={paidById} name={paidByName} size={32} />
                <span className="font-medium text-foreground">{paidByName}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Date
                </span>
              </div>
              <p className="mt-2 font-medium text-foreground">
                {expense.date
                  ? new Date(expense.date).toLocaleDateString()
                  : expense.createdAt
                    ? new Date(expense.createdAt).toLocaleDateString()
                    : "—"}
              </p>
            </div>
          </div>

          {expense.category && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag size={14} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Category
                </span>
              </div>
              <p className="mt-2 font-medium text-foreground">
                {expense.category}
              </p>
            </div>
          )}

          {expense.splitType && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag size={14} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Split type
                </span>
              </div>
              <p className="mt-2 font-medium capitalize text-foreground">
                {expense.splitType}
              </p>
            </div>
          )}

          {expense.splitDetails && expense.splitDetails.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                <Users size={14} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Split breakdown
                </span>
              </div>
              <ul className="space-y-2 rounded-xl border border-border bg-secondary/30 p-3">
                {expense.splitDetails.map((d, i) => {
                  const uid =
                    typeof d.userId === "object" && d.userId?._id
                      ? d.userId._id
                      : String(d.userId);
                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-card px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar userId={uid} name={getSplitDetailUserName(d)} size={28} />
                        <span className="font-medium text-foreground">
                          {getSplitDetailUserName(d)}
                        </span>
                      </div>
                      <span className="font-semibold text-primary">
                        ₹{d.amount.toLocaleString()}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-2 gap-6">
          {expense.groupId && typeof expense.groupId === "object" && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Group
              </span>
              <p className="mt-1 font-medium text-foreground">
                {expense.groupId.name}
              </p>
            </div>
          )}

          {expense.createdBy && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserPlus size={14} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Created by
                </span>
              </div>
              <p className="mt-2 font-medium text-foreground">
                {createdByName}
              </p>
            </div>
          )}

          {expense.createdAt && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={14} />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Created at
                </span>
              </div>
              <p className="mt-2 font-medium text-foreground">
                {new Date(expense.createdAt).toLocaleString()}
              </p>
            </div>
          )}
          </div>

          {/* {expense._id && (
            <div className="pt-4 border-t border-border">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Expense ID
              </span>
              <p className="mt-1 font-mono text-xs text-muted-foreground break-all">
                {expense._id}
              </p>
            </div>
          )} */}
        </div>
      </div>
    </>
  );
}
