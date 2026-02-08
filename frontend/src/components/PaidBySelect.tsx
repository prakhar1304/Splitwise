"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import Avatar from "@/components/Avatar";
import type { User } from "@/utils/api";

interface PaidBySelectProps {
  users: User[];
  value: string;
  onChange: (userId: string) => void;
  currentUserId?: string;
  label?: string;
  hint?: string;
}

export default function PaidBySelect({
  users,
  value,
  onChange,
  currentUserId,
  label = "Paid by",
  hint,
}: PaidBySelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = users.find((u) => u._id === value);

  return (
    <div className="space-y-2" ref={ref}>
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between gap-3 rounded-lg border border-input bg-transparent px-4 py-3 text-left outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={label}
        >
          <span className="flex items-center gap-2 text-foreground">
            {selected ? (
              <>
                <Avatar userId={selected._id} name={selected.name} size={28} />
                <span className="font-medium">
                  {selected.name}
                  {selected._id === currentUserId ? " (you)" : ""}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">Select who paid</span>
            )}
          </span>
          <ChevronDown
            size={18}
            className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 w-full overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-card py-1 shadow-lg"
          >
            {users.map((u) => (
              <li key={u._id} role="option" aria-selected={u._id === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(u._id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-secondary ${
                    u._id === value ? "bg-primary/10" : ""
                  }`}
                >
                  <Avatar userId={u._id} name={u.name} size={32} />
                  <span className="font-medium text-foreground">
                    {u.name}
                    {u._id === currentUserId ? " (you)" : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
