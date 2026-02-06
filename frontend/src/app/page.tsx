"use client";

import { useEffect, useState } from "react";
import { expenseApi, Expense } from "@/utils/api";
import { Trash2, User, Users, Calendar, IndianRupee, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseApi.getAllExpenses();
      setExpenses(response.data);
      setError("");
    } catch (err: any) {
      setError("Failed to fetch expenses. Make sure the backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage your group expenses with ease</p>
        </div>
        <button
          onClick={fetchExpenses}
          className="btn-primary"
          style={{ width: 'auto', display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg-warm)', color: 'var(--primary)', border: '1px solid var(--primary)', boxShadow: 'none' }}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="card" style={{ background: '#FFF5F5', border: '1px solid #FED7D7', color: '#C53030' }}>
          {error}
        </div>
      )}

      <div className="grid-layout">
        <aside className="stats-sidebar">
          <div className="card" style={{ background: 'linear-gradient(135deg, #FFF 0%, var(--bg-warm) 100%)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Total Group Spending</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>
              <IndianRupee size={32} />
              {expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Across {expenses.length} recent transactions</p>
          </div>

          <div className="card" style={{ border: '1px dashed var(--primary)', background: 'transparent' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Real-time Sync</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dashboard is now connected to your MongoDB database for persistence.</p>
          </div>
        </aside>

        <section className="expenses-list">
          <h2 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Recent Expenses</h2>

          {loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading expenses...</div>}

          {!loading && expenses.length === 0 && !error && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No expenses found. Start by adding one!</p>
            </div>
          )}

          {expenses.map((expense) => (
            <div key={expense._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{expense.name || expense.description}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Calendar size={14} />
                    <span>{new Date(expense.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--primary)'
                  }}>
                    <IndianRupee size={20} strokeWidth={3} />
                    {expense.amount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Paid By</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255, 140, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={12} color="var(--primary)" />
                    </div>
                    {expense.paidBy}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Participants</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                    <Users size={16} color="var(--text-muted)" />
                    <span>{expense.participants.map(p => typeof p === 'string' ? p : p.name).join(', ')}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-delete" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Trash2 size={16} />
                  Delete
                </button>
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
        .spin {
          animation: rotate 1s linear infinite;
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
