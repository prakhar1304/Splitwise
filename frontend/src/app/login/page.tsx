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
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-secondary p-8 shadow-lg transition-smooth before:absolute before:right-2 before:top-2 before:h-24 before:w-24 before:rounded-full before:bg-primary before:opacity-20 before:blur-2xl before:content-[''] after:absolute after:-right-4 after:-top-4 after:h-32 after:w-32 after:rounded-full after:bg-accent after:opacity-10 after:blur-2xl after:content-['']">
        <div className="relative z-10 animate-slide-up">
          <h1 className="text-2xl font-bold text-foreground">Log in</h1>
          <p className="mt-1 text-muted-foreground">Splitwise Clone</p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-muted-foreground">Email</label>
              <div className="relative overflow-hidden rounded-lg before:absolute before:right-0 before:top-0 before:h-8 before:w-8 before:rounded-full before:bg-primary before:opacity-30 before:blur-lg before:content-['']">
                <input
                  type="email"
                  className="relative w-full rounded-lg border border-input bg-transparent px-4 py-3 text-foreground outline-none transition-all placeholder:opacity-60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-muted-foreground">Password</label>
              <div className="relative overflow-hidden rounded-lg before:absolute before:right-0 before:top-0 before:h-8 before:w-8 before:rounded-full before:bg-primary before:opacity-30 before:blur-lg before:content-['']">
                <input
                  type="password"
                  className="relative w-full rounded-lg border border-input bg-transparent px-4 py-3 text-foreground outline-none transition-all placeholder:opacity-60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-accent hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
