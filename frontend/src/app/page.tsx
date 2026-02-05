"use client";

import { staticData } from "@/constants/data";
import { Trash2, User, Users, Calendar, IndianRupee } from "lucide-react";

export default function Dashboard() {
  const { expenses } = staticData;

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Manage your group expenses with ease</p>
      </header>

      <div className="grid-layout">
        <aside className="stats-sidebar">
          <div className="card" style={{ background: 'linear-gradient(135deg, #FFF 0%, var(--bg-warm) 100%)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Total Group Spending</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>
              <IndianRupee size={32} />
              {expenses.reduce((acc, curr) => acc + curr.amount, 0)}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>Across {expenses.length} recent transactions</p>
          </div>

          <div className="card" style={{ border: '1px dashed var(--primary)', background: 'transparent' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Quick Tip</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hover over expense cards to see actions like delete and edit.</p>
          </div>
        </aside>

        <section className="expenses-list">
          <h2 style={{ fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Recent Expenses</h2>
          {expenses.map((expense) => (
            <div key={expense.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{expense.description}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Calendar size={14} />
                    <span>{expense.date}</span>
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
                    {expense.amount}
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
                    <span>{expense.participants.join(', ')}</span>
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
      `}</style>
    </div>
  );
}
