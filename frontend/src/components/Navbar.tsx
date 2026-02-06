"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, PlusCircle, Users } from "lucide-react";

const Navbar = () => {
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", path: "/", icon: <CreditCard size={18} /> },
        { name: "Add Expense", path: "/add", icon: <PlusCircle size={18} /> },
        { name: "Balances", path: "/balances", icon: <Users size={18} /> },
    ];

    return (
        <nav className="nav-container">
            <div className="flex items-center gap-2">
                <div className="icon-box" style={{ width: '32px', height: '32px' }}>
                    <CreditCard size={18} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>Splitwise</span>
            </div>
            <div className="nav-links">
                {links.map((link) => (
                    <Link
                        key={link.path}
                        href={link.path}
                        className={`nav-link ${pathname === link.path ? "active" : ""}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        {link.icon}
                        <span className="nav-text">{link.name}</span>
                    </Link>
                ))}
            </div>

            <style jsx>{`
        @media (max-width: 480px) {
          .nav-text { display: none; }
          .nav-links { gap: 1rem; }
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
