import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/summarizer', icon: '📄', label: 'AI Summary' },
  { to: '/chatbot', icon: '💬', label: 'Doubt Solver' },
  { to: '/quiz', icon: '🧪', label: 'Quiz Generator' },
  { to: '/planner', icon: '📅', label: 'Study Planner' },
  { to: '/progress', icon: '📊', label: 'Progress' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out!');
    navigate('/login');
  };

  const dailyLimit = user?.plan === 'pro' ? 999 : 3;
  const creditsLeft = Math.max(0, dailyLimit - (user?.aiCreditsUsed || 0));
  const creditPct = (creditsLeft / dailyLimit) * 100;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--card)', borderRight: '1px solid var(--border)',
        padding: '24px 16px', display: 'flex', flexDirection: 'column',
        gap: 4, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ fontFamily: 'Syne', fontSize: 19, fontWeight: 800, color: 'var(--accent)', marginBottom: 20, padding: '0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, background: 'var(--accent2)', borderRadius: '50%' }} />
          StudyAI
        </div>

        <div style={{ fontSize: 11, color: 'var(--muted)', padding: '8px 8px 4px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Learn</div>

        {navItems.slice(0, 4).map(item => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            fontSize: 14, fontWeight: isActive ? 500 : 400,
            color: isActive ? 'var(--accent)' : 'var(--muted)',
            background: isActive ? 'rgba(108,71,255,0.08)' : 'transparent',
            textDecoration: 'none', transition: 'all 0.15s'
          })}>
            <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div style={{ fontSize: 11, color: 'var(--muted)', padding: '12px 8px 4px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Plan</div>

        {navItems.slice(4).map(item => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            fontSize: 14, fontWeight: isActive ? 500 : 400,
            color: isActive ? 'var(--accent)' : 'var(--muted)',
            background: isActive ? 'rgba(108,71,255,0.08)' : 'transparent',
            textDecoration: 'none', transition: 'all 0.15s'
          })}>
            <span style={{ fontSize: 15, width: 20, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div style={{ flex: 1 }} />

        {/* Credits & Plan */}
        <div style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 600, color: 'var(--ink2)', fontSize: 13 }}>{user?.name?.split(' ')[0]}</span>
            <span className={`badge badge-${user?.plan}`}>{user?.plan}</span>
          </div>
          <div style={{ marginBottom: 4 }}>
            {user?.plan === 'free' ? `${creditsLeft}/3 AI credits today` : 'Unlimited AI credits'}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${creditPct}%`, background: creditsLeft > 1 ? 'var(--accent)' : 'var(--accent2)' }} />
          </div>
          {user?.plan === 'free' && (
            <div style={{ marginTop: 10, color: 'var(--accent)', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
              Upgrade to Pro ₹99/mo →
            </div>
          )}
          <button onClick={handleLogout} style={{ marginTop: 10, background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', padding: 0 }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', maxWidth: 900 }}>
        <Outlet />
      </main>
    </div>
  );
}
