"use client";

import { CreditCard, IndianRupee, User, Users, FileText } from "lucide-react";

export default function AddExpense() {
    return (
        <div className="fade-in">
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ margin: 0 }}>Add New Expense</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Split costs instantly with your friends</p>
            </header>

            <div className="grid-layout">
                <aside>
                    <div className="card" style={{ background: 'rgba(255, 140, 0, 0.03)', border: '1px solid rgba(255, 140, 0, 0.1)' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Splitting Simplified</h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <div className="icon-box" style={{ width: '36px', height: '36px', flexShrink: 0 }}><CreditCard size={16} /></div>
                                <div>
                                    <strong style={{ display: 'block', color: 'var(--text-main)' }}>Smart Entry</strong>
                                    <span>Enter the total amount and name of the payer.</span>
                                </div>
                            </li>
                            <li style={{ display: 'flex', gap: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <div className="icon-box" style={{ width: '36px', height: '36px', flexShrink: 0 }}><Users size={16} /></div>
                                <div>
                                    <strong style={{ display: 'block', color: 'var(--text-main)' }}>Auto-Balance</strong>
                                    <span>Tag participants to divide the debt instantly.</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </aside>

                <section className="card" style={{ margin: 0 }}>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                            <label className="form-label">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FileText size={16} />
                                    Description
                                </div>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="What was this for?"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <IndianRupee size={16} />
                                    Amount
                                </div>
                            </label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <User size={16} />
                                    Paid By
                                </div>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Name of the person who paid"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Users size={16} />
                                    Participants
                                </div>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Amit, Rahul, Neha"
                            />
                            <p style={{ fontSize: '0.75rem', color: '#AAA', marginTop: '4px' }}>Separate names with commas</p>
                        </div>

                        <button className="btn-primary" style={{ marginTop: '1rem' }}>
                            Add Expense
                        </button>
                    </form>
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
