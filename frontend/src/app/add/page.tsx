"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AddExpenseForm from "@/components/AddExpenseForm";

function AddExpenseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-stone-500">
        Loading...
      </div>
    );
  }

  return <AddExpenseForm groupId={groupId} />;
}

export default function AddExpensePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-stone-500">
          Loading...
        </div>
      }
    >
      <AddExpenseContent />
    </Suspense>
  );
}
