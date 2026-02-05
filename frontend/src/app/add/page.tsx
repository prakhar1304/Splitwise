"use client";

import { useState } from "react";
import { expenseApi } from "@/utils/api";
import { useRouter } from "next/navigation";
import { CreditCard, IndianRupee, User, Users, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function AddExpense() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        paidBy: "",
        participants: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const payload = {
                name: formData.name,
                amount: Number(formData.amount),
                description: formData.name, // using name as description for simplicity
                paidBy: formData.paidBy,
                participants: formData.participants.split(",").map(p => p.trim()).filter(p => p !== "")
            };

            await expenseApi.createExpense(payload);
            setSuccess(true);
            setTimeout(() => router.push("/"), 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to add expense. Check backend connection.");
        } finally {
            setLoading(false);
        }
    };

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

                    {error && (
                        <div className="card" style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#C53030', marginTop: '1.5rem', display: 'flex', gap: '10px' }}>
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}
                </aside>

                <section className="card" style={{ margin: 0 }}>
                    {success ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ width: '60px', height: '60px', background: '#DEF7EC', color: '#03543F', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <CheckCircle2 size={32} />
                            </div>
                            <h2 style={{ marginBottom: '0.5rem' }}>Expense Added!</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Redirecting to dashboard...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FileText size={16} />
                                        Title / Description
                                    </div>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="What was this for?"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                    required
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
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
                                    placeholder="Who paid for this?"
                                    required
                                    value={formData.paidBy}
                                    onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
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
                                    required
                                    value={formData.participants}
                                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                                />
                                <p style={{ fontSize: '0.75rem', color: '#AAA', marginTop: '4px' }}>Separate names with commas</p>
                            </div>

                            <button className="btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                                {loading ? "Adding Expense..." : "Add Expense"}
                            </button>
                        </form>
                    )}
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
