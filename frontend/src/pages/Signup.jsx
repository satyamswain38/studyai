import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success('Account created! Let\'s study 🎓');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: 'var(--accent)', marginBottom: 8 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--accent2)', borderRadius: '50%', marginRight: 8 }} />
            StudyAI
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>Free forever. AI-powered. Built for students.</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>Create account</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Your name</label>
              <input className="input" type="text" placeholder="Rahul Kumar"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account…</> : 'Get started free →'}
            </button>
          </form>
          <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
            Have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, fontSize: 12, color: 'var(--muted)' }}>
          <span>✅ 3 free AI calls/day</span>
          <span>✅ Save all notes</span>
          <span>✅ Quiz history</span>
        </div>
      </div>
    </div>
  );
}
