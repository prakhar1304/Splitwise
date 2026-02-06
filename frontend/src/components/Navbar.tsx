"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  PlusCircle,
  Users,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const appLinks = [
    { name: "Dashboard", path: "/", icon: CreditCard },
    { name: "Add Expense", path: "/add", icon: PlusCircle },
    { name: "Balances", path: "/balances", icon: Users },
  ];

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <nav className="sticky top-4 z-50 flex items-center justify-between gap-4 rounded-xl border border-stone-200/80 bg-white/90 px-6 py-3.5 shadow-sm backdrop-blur-xl">
      <Link
        href="/"
        className="flex items-center gap-2 no-underline text-inherit"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <CreditCard size={18} />
        </div>
        <span className="text-lg font-bold text-orange-600">Splitwise</span>
      </Link>
      <div className="flex items-center gap-4">
        {!loading && user && !isAuthPage &&
          appLinks.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                pathname === path
                  ? "text-orange-600"
                  : "text-stone-500 hover:text-orange-600"
              }`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{name}</span>
            </Link>
          ))}
        {!loading && !user && !isAuthPage && (
          <>
            <Link href="/login" className="flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-orange-600">
              <LogIn size={18} />
              <span className="hidden sm:inline">Log in</span>
            </Link>
            <Link href="/signup" className="flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-orange-600">
              <UserPlus size={18} />
              <span className="hidden sm:inline">Sign up</span>
            </Link>
          </>
        )}
        {!loading && user && (
          <span className="flex items-center gap-2 text-sm text-stone-500">
            <span className="hidden sm:inline font-medium text-stone-700">
              {user.name}
            </span>
            <button
              type="button"
              onClick={() => logout()}
              className="flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-orange-600 border-0 bg-transparent cursor-pointer p-0"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
