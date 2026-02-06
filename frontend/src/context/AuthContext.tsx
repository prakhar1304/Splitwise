"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi, User } from "@/utils/api";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadStoredAuth = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("accessToken");
    const stored = localStorage.getItem("user");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as User;
        setUser(parsed);
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
      }
    } else {
      try {
        const res = await authApi.getMe();
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch {
        localStorage.removeItem("accessToken");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  useEffect(() => {
    const onLogout = () => {
      setUser(null);
      router.push("/login");
    };
    window.addEventListener("auth-logout", onLogout);
    return () => window.removeEventListener("auth-logout", onLogout);
  }, [router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      const payload = res.data as { user: User; accessToken: string };
      if (payload?.accessToken) {
        localStorage.setItem("accessToken", payload.accessToken);
        if (payload.user) {
          localStorage.setItem("user", JSON.stringify(payload.user));
          setUser(payload.user);
        }
        router.push("/");
      }
    },
    [router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await authApi.register(name, email, password);
      const payload = res.data as { user: User; accessToken: string };
      if (payload?.accessToken) {
        localStorage.setItem("accessToken", payload.accessToken);
        if (payload.user) {
          localStorage.setItem("user", JSON.stringify(payload.user));
          setUser(payload.user);
        }
        router.push("/");
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
