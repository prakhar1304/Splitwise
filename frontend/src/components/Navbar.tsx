"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Users,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/Avatar";

const Navbar = () => {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const appLinks = [
    { name: "Dashboard", path: "/", icon: CreditCard },
    { name: "Groups", path: "/groups", icon: Users },
    { name: "Balances", path: "/balances", icon: Users },
  ];

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    if (!userMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [userMenuOpen]);

  return (
    <nav
      className="sticky top-4 z-50 flex items-center justify-between gap-4 rounded-2xl border-2 border-border px-2 py-2 shadow-[0_2px_12px_rgba(5,3,21,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] transition-[box-shadow,transform] duration-200"
      style={{ background: "linear-gradient(135deg, #FABE7A 0%, #F7B86A 40%, #FF8E1C 100%)" }}
    >
      <Link
        href="/"
        className="flex items-center gap-2 rounded-xl px-3 py-2 no-underline text-inherit transition-[box-shadow,transform] duration-200 hover:shadow-[0_2px_8px_rgba(5,3,21,0.1)] active:scale-[0.98]"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/30 text-[#1f1509] shadow-[0_1px_3px_rgba(5,3,21,0.12)]">
          <CreditCard size={18} />
        </div>
        <span className="text-lg font-bold text-[#1f1509]">Splitwise</span>
      </Link>

      <div className="flex items-center gap-1 sm:gap-2">
        {!loading && user && !isAuthPage &&
          appLinks.map(({ name, path, icon: Icon }) => {
            const isActive = pathname === path;
            return (
              <Link
                key={path}
                href={path}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-200 active:scale-[0.98] ${
                  isActive
                    ? "bg-[#faf6f1] text-[#1f1509] shadow-[0_2px_8px_rgba(5,3,21,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]"
                    : "text-[#2d1f0a] hover:bg-white/25 hover:text-[#1f1509] hover:shadow-[0_1px_4px_rgba(5,3,21,0.08)]"
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{name}</span>
              </Link>
            );
          })}
        {!loading && !user && !isAuthPage && (
          <>
            <Link
              href="/login"
              prefetch={false}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[#2d1f0a] transition-[background-color,color,box-shadow] duration-200 hover:bg-white/25 hover:text-[#1f1509] hover:shadow-[0_1px_4px_rgba(5,3,21,0.08)]"
            >
              <LogIn size={18} />
              <span className="hidden sm:inline">Log in</span>
            </Link>
            <Link
              href="/signup"
              prefetch={false}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[#2d1f0a] transition-[background-color,color,box-shadow] duration-200 hover:bg-white/25 hover:text-[#1f1509] hover:shadow-[0_1px_4px_rgba(5,3,21,0.08)]"
            >
              <UserPlus size={18} />
              <span className="hidden sm:inline">Sign up</span>
            </Link>
          </>
        )}
        {!loading && user && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground shadow-[0_2px_8px_rgba(5,3,21,0.08),0_1px_2px_rgba(5,3,21,0.05)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-secondary/80 hover:shadow-[0_2px_10px_rgba(5,3,21,0.08)] active:scale-[0.98]"
              style={{ background: "linear-gradient(180deg, #faf6f1 0%, #f5ebe0 100%)" }}
            >
              <Avatar
                userId={user._id}
                name={user.name}
                size={24}
                className="ring-2 ring-border/60"
              />
              <span className="hidden max-w-[120px] truncate sm:inline">
                {user.name}
              </span>
              <ChevronDown
                size={16}
                className={`text-muted-foreground transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
              />
            </button>
            {userMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-1.5 min-w-[160px] overflow-hidden rounded-xl border border-border bg-card py-1 shadow-[0_8px_24px_rgba(5,3,21,0.12)] animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="border-b border-border px-3 py-2">
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    Signed in as
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.name}
                  </p>
                </div>
                <ul className="py-1">
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:bg-secondary focus:outline-none"
                    >
                      <LogOut size={16} className="text-muted-foreground" />
                      Log out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
