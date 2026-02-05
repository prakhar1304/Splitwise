"use client";

import { useEffect, useState } from "react";
import { expenseApi } from "@/utils/api";
import { TrendingUp, Info, RefreshCw, ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";

export default function BalancesSummary() {
    const [balances, setBalances] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchBalances = async () => {
        try {
            setLoading(true);
            const response = await expenseApi.getBalances();
            // FIX: The backend now returns an ApiResponse object, so we need response.data
            if (response && response.data) {
                setBalances(response.data);
            } else {
                setBalances([]);
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

    // Helper to parse the new "Simple Balance" strings from backend
    const parseStatus = (text: string) => {
        if (text.includes("owes")) {
            const [name, amount] = text.split(" owes ₹");
            return { name, amount, type: 'owe' };
        } else {
            const [name, amount] = text.split(" should receive ₹");
            return { name, amount, type: 'receive' };
        }
    };

    return (
        <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Net Balances</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Overall status of each group member</p>
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
                                <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>Individual Status</h3>
                                <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>
                                    This shows the total net amount each person is owed or owes to the group.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginTop: '1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Info size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Positive balance means you spent more than your share. Negative means you owe the group.
                        </p>
                    </div>
                </aside>

                <section className="balances-list">
                    <h2 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Group Standings</h2>

                    {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Calculating standings...</div>}

                    {!loading && balances.length === 0 && !error && (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No data available. Add some expenses first!</p>
                        </div>
                    )}

                    {balances.map((text, index) => {
                        const { name, amount, type } = parseStatus(text);
                        const isOwe = type === 'owe';

                        return (
                            <div key={index} className="card" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1rem',
                                borderLeft: `6px solid ${isOwe ? '#EF4444' : '#10B981'}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: isOwe ? '#FEF2F2' : '#ECFDF5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isOwe ? '#EF4444' : '#10B981'
                                    }}>
                                        {isOwe ? <ArrowDownCircle size={24} /> : <ArrowUpCircle size={24} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {isOwe ? 'Owes the group' : 'Should receive'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontSize: '1.4rem',
                                        fontWeight: 800,
                                        color: isOwe ? '#EF4444' : '#10B981'
                                    }}>
                                        ₹{parseFloat(amount).toLocaleString()}
                                    </div>
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
        @keyframes rotate {
          from { transform: rotate(0deg); } }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: rotate 1s linear infinite;
        }
      `}</style>
        </div>
    );
}
