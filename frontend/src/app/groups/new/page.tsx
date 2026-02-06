"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  groupsApi,
  usersApi,
  User,
  isNetworkError,
  API_BASE_URL,
} from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { Users, CheckCircle2, AlertCircle, UserPlus } from "lucide-react";
import Avatar from "@/components/Avatar";

export default function CreateGroupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        const res = await usersApi.getAllUsers();
        const list = (res as { data?: User[] }).data ?? [];
        setAllUsers(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, [user]);

  const availableToAdd = allUsers.filter(
    (u) => !selectedMemberIds.includes(u._id) && u._id !== user?._id
  );

  const addMember = (userId: string) => {
    if (!selectedMemberIds.includes(userId)) {
      setSelectedMemberIds((prev) => [...prev, userId]);
      setDropdownOpen(false);
    }
  };

  const removeMember = (userId: string) => {
    setSelectedMemberIds((prev) => prev.filter((id) => id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setLoading(true);
      setError("");
      const res = await groupsApi.createGroup(name.trim(), selectedMemberIds);
      const created = (res as { data?: { _id?: string } }).data;
      setSuccess(true);
      setTimeout(() => {
        if (created?._id) {
          router.push(`/groups/${created._id}`);
        } else {
          router.push("/groups");
        }
      }, 1200);
    } catch (err: unknown) {
      const isNetwork = isNetworkError(err);
      setError(
        isNetwork
          ? `Cannot reach the backend. Start it with \"npm run dev\" in the backend folder (default: ${API_BASE_URL.replace(
              "/api",
              ""
            )}).`
          : "Failed to create group. Try again."
      );
      console.error(err);
    } finally {
      setLoading(false);
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
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Create group
        </h1>
        <p className="mt-1 text-muted-foreground">
          A simple group with you as the first member. You can use it to track
          shared expenses.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-secondary p-5 shadow-sm transition-smooth">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              How groups work
            </h3>
            <p className="text-sm text-foreground/90">
              A group lets you attach expenses to a specific set of people and
              see balances and settlement suggestions just for that group.
            </p>
          </div>
        </aside>

        <section className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-smooth before:absolute before:right-2 before:top-2 before:h-20 before:w-20 before:rounded-full before:bg-primary before:opacity-15 before:blur-2xl before:content-[''] after:absolute after:-right-6 after:-top-6 after:h-24 after:w-24 after:rounded-full after:bg-accent after:opacity-10 after:blur-2xl after:content-['']">
          <div className="relative z-10">
          {success ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={28} />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Group created
              </h2>
              <p className="mt-1 text-muted-foreground">
                Redirecting you to the group...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Users size={16} />
                  Group name
                </label>
                <div className="relative overflow-hidden rounded-lg before:absolute before:right-0 before:top-0 before:h-8 before:w-8 before:rounded-full before:bg-primary before:opacity-25 before:blur-lg before:content-['']">
                <input
                  type="text"
                  className="relative w-full rounded-lg border border-input bg-transparent px-4 py-3 text-foreground outline-none transition-all placeholder:opacity-60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Goa trip, Roommates, Office lunch..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <UserPlus size={16} />
                  Add members
                </label>
                <p className="text-xs text-muted-foreground">
                  Select users to add. You&apos;re automatically included.
                </p>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-4 py-3 text-left text-base outline-none transition-smooth hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <span className="text-muted-foreground">
                      {availableToAdd.length === 0
                        ? "No more users to add"
                        : "Choose a user to add..."}
                    </span>
                    <svg
                      className={`h-5 w-5 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
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
                  {dropdownOpen && availableToAdd.length > 0 && (
                    <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-border bg-card py-1 shadow-lg">
                      {availableToAdd.map((u) => (
                        <li key={u._id}>
                          <button
                            type="button"
                            onClick={() => addMember(u._id)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-smooth hover:bg-secondary"
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
                {selectedMemberIds.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedMemberIds.map((id) => {
                      const u = allUsers.find((x) => x._id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-sm font-medium text-accent"
                        >
                          {u ? <Avatar userId={u._id} name={u.name} size={24} /> : null}
                          {u?.name ?? id}
                          <button
                            type="button"
                            onClick={() => removeMember(id)}
                            className="rounded-full p-0.5 hover:bg-primary/25 transition-smooth"
                            aria-label={`Remove ${u?.name}`}
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-smooth hover:opacity-90 hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create group"}
              </button>
            </form>
          )}
          </div>
        </section>
      </div>
    </div>
  );
}

