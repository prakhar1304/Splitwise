"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AddExpenseForm from "./AddExpenseForm";

export default function AddExpenseFab() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const showFab = !loading && !!user && !isAuthPage;

  if (!showFab) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition-smooth hover:opacity-90 hover:scale-105 hover:shadow-xl hover:shadow-primary/50 active:scale-95"
        aria-label="Add expense"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm animate-in fade-in duration-200"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-4 bottom-4 top-auto z-50 max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300 sm:inset-x-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:bottom-auto sm:max-h-[90vh] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2"
          >
            <div className="p-4 sm:p-6">
              <AddExpenseForm
                compact
                onClose={() => setOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
