"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { groupsApi, Group, isNetworkError, API_BASE_URL } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { Users, PlusCircle, ArrowRight } from "lucide-react";

export default function GroupsDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGroups = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await groupsApi.getGroups();
      const list = (res as { data?: Group[] }).data ?? [];
      setGroups(Array.isArray(list) ? list : []);
      setError("");
    } catch (err: unknown) {
      const isNetwork = isNetworkError(err);
      setError(
        isNetwork
          ? `Cannot reach the backend. Start it with "npm run dev" in the backend folder (default: ${API_BASE_URL.replace(
              "/api",
              ""
            )}).`
          : "Failed to fetch groups. Make sure you're logged in and the backend is running."
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
    if (user) fetchGroups();
  }, [user, authLoading]);

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Groups
          </h1>
          <p className="mt-1 text-muted-foreground">
            Organise expenses by group and see optimized settlements.
          </p>
        </div>
        <Link
          href="/groups/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-smooth hover:opacity-90 hover:shadow-xl active:scale-[0.98]"
        >
          <PlusCircle size={18} />
          New group
        </Link>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading groups...</div>
      ) : groups.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
          <p className="text-muted-foreground">
            You don&apos;t have any groups yet. Create one to start splitting.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {groups.map((group) => (
            <Link
              key={group._id}
              href={`/groups/${group._id}`}
              className="relative isolate overflow-hidden flex flex-col justify-between rounded-xl border border-border bg-card/95 p-5 shadow-sm transition-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
            >
              {/* back glow */}
              {/* <div className="pointer-events-none absolute -top-20 right-50 h-56 w-56 rounded-full bg-secondary blur-3xl z-0" /> */}
              {/* front glow */}
              <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-secondary blur-2xl z-0" />


              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {group.name}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {group.members?.length ?? 0} member
                    {(group.members?.length ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Created by{" "}
                  <span className="font-medium text-foreground">
                    {group.createdBy?.name}
                  </span>
                </span>
                <span className="relative cursor-pointer opacity-90 hover:opacity-100 transition-opacity p-[2px] bg-black rounded-[16px] bg-gradient-to-t from-[#edac80] to-[#b06617] active:scale-95" >

                <span className="w-full h-full flex items-center gap-2 px-8 py-3 bg-[#f3bd5f] text-white rounded-[14px] bg-gradient-to-t from-[#edac80] to-[#b06617]">
                  View details
                  <ArrowRight size={14} />
                </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

