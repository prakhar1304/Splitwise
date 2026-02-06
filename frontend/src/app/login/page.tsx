"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.push("/");
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Login failed. Check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16 sm:px-8">
      <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-stone-900">Log in</h1>
        <p className="mt-1 text-stone-500">Splitwise Clone</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-600">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border-2 border-stone-200 px-4 py-3 text-base outline-none transition-all focus:border-orange-600 focus:ring-4 focus:ring-orange-600/15"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-600">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border-2 border-stone-200 px-4 py-3 text-base outline-none transition-all focus:border-orange-600 focus:ring-4 focus:ring-orange-600/15"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/40 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-stone-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
