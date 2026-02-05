"use client";

import { staticData } from "@/constants/data";
import { ArrowRight, TrendingUp, HandCoins, Info } from "lucide-react";

export default function BalancesSummary() {
    const { balances } = staticData;

    const parseBalance = (text: string) => {
        const parts = text.split(" owes ");
        const debtor = parts[0];
        const rest = parts[1].split(" ₹");
        const creditor = rest[0];
        const amount = rest[1];
        return { debtor, creditor, amount };
    };

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ margin: 0 }}>Balances</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Settle up and track shared debts</p>
            </header>

            <div className="grid-layout">
                <aside>
                    <div className="card" style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                        color: 'white',
                        border: 'none',
                        height: 'fit-content'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>Smart Split</h3>
                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>
                                    Our algorithm minimizes the total number of transfers needed to settle all debts.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginTop: '1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Info size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Balances are calculated in real-time based on all group transactions.
                        </p>
                    </div>
                </aside>

                <section className="balances-list">
                    <h2 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Outstanding Debts</h2>
                    {balances.map((balance, index) => {
                        const { debtor, creditor, amount } = parseBalance(balance);
                        return (
                            <div key={index} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <div style={{ textAlign: 'center', minWidth: '70px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{debtor}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Debtor</div>
                                    </div>

                                    <div style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <div style={{ height: '2px', background: 'rgba(255,140,0,0.1)', width: '100%', position: 'absolute' }}></div>
                                        <div style={{
                                            background: 'white',
                                            padding: '0 10px',
                                            zIndex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: 700 }}>
                                                ₹{amount}
                                            </div>
                                            <ArrowRight size={18} color="var(--primary)" />
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'center', minWidth: '70px' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--primary)' }}>{creditor}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Creditor</div>
                                    </div>
                                </div>

                                <div className="icon-box" style={{ marginLeft: '1rem', opacity: 0.5 }}>
                                    <HandCoins size={18} />
                                </div>
                            </div>
                        );
                    })}
                </section>
            </div>

            <style jsx>{`
        .fade-in {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
