"use client";

import { useEffect, useState } from "react";
import { expenseApi } from "@/utils/api";
import { TrendingUp, Info, RefreshCw, ArrowRight, Wallet, UserCircle2 } from "lucide-react";

interface Settlement {
    sender: string;
    receiver: string;
    amount: number;
    statement: string;
}

export default function BalancesSummary() {
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchBalances = async () => {
        try {
            setLoading(true);
            const response = await expenseApi.getBalances();
            if (response && response.data) {
                setSettlements(response.data);
            } else {
                setSettlements([]);
            }
            setError("");
        } catch (err: any) {
            setError("Failed to fetch group balances.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalances();
    }, []);

    return (
        <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Settlements</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Optimal way to settle all group debts</p>
                </div>
                <button
                    onClick={fetchBalances}
                    className="btn-primary"
                    style={{ width: 'auto', display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-warm)', color: 'var(--primary)', border: '1px solid var(--primary)', boxShadow: 'none' }}
                >
                    <RefreshCw size={16} className={loading ? "spin" : ""} />
                    Refresh
                </button>
            </header>

            {error && (
                <div className="card" style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#C53030', marginBottom: '2rem' }}>
                    {error}
                </div>
            )}

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
                                <Wallet size={24} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>Optimized Split</h3>
                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>
                                    Our algorithm calculates the minimum number of transactions needed to settle everyone's balances.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginTop: '1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Info size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Follow these simple transfers to clear all outstanding amounts in the group.
                        </p>
                    </div>
                </aside>

                <section className="balances-list">
                    <h2 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Active Settlements</h2>

                    {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Calculating settlements...</div>}

                    {!loading && settlements.length === 0 && !error && (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No data available. Add some expenses first!</p>
                        </div>
                    )}

                    {settlements.map((item, index) => (
                        <div key={index} className="card" style={{
                            marginBottom: '1rem',
                            padding: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                {/* Sender */}
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                                            <UserCircle2 size={32} />
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>{item.sender}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#EF4444', textTransform: 'uppercase', fontWeight: 600 }}>Debtor</div>
                                </div>

                                {/* Arrow & Amount */}
                                <div style={{ flex: 1.5, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                                        ₹{item.amount.toLocaleString()}
                                    </div>
                                    <div style={{ width: '100%', height: '2px', background: 'rgba(255, 140, 0, 0.1)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ background: 'var(--bg-warm)', padding: '0 8px' }}>
                                            <ArrowRight size={20} color="var(--primary)" />
                                        </div>
                                    </div>
                                </div>

                                {/* Receiver */}
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                                        <UserCircle2 size={32} />
                                    </div>
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>{item.receiver}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#10B981', textTransform: 'uppercase', fontWeight: 600 }}>Creditor</div>
                                </div>
                            </div>

                            <div style={{
                                marginTop: '1.25rem',
                                padding: '0.75rem',
                                background: 'var(--bg-warm)',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                color: 'var(--text-muted)',
                                textAlign: 'center',
                                borderLeft: '4px solid var(--primary)'
                            }}>
                                {item.statement}
                            </div>
                        </div>
                    ))}
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
        @keyframes rotate {
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: rotate 1s linear infinite;
        }
      `}</style>
        </div>
    );
}
