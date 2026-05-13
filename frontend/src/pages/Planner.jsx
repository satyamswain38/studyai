import React, { useState } from 'react';
import { ai } from '../utils/api';
import toast from 'react-hot-toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const today = new Date().getDay(); // 0=Sun, adjust to Mon=0
const todayIdx = today === 0 ? 6 : today - 1;

export default function Planner() {
  const [desc, setDesc] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const TEMPLATES = [
    'Exams in 2 weeks. Subjects: DBMS, OS, CN, DSA. Study 4 hrs/day. DBMS is weakest.',
    'Board exams in 1 month. Physics, Chemistry, Maths. 6 hrs/day. Maths needs most work.',
    'Gate exam in 3 months. All CS subjects. 8 hrs/day. Strong in algorithms, weak in OS.',
  ];

  const generate = async () => {
    if (!desc.trim()) return toast.error('Describe your study situation first');
    setLoading(true);
    setPlan('');
    try {
      const res = await ai.studyPlan(desc);
      setPlan(res.data.plan);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate plan');
      if (err.response?.data?.upgradeRequired) toast('Upgrade to Pro!', { icon: '⭐' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>AI Study Planner</h1>
        <p>Describe your situation — get a personalized, day-by-day study plan.</p>
      </div>

      <div className="card">
        <label className="label">Your situation</label>
        <textarea className="input" value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="Tell me about your exam date, subjects, daily study hours, weak areas…"
          style={{ minHeight: 100 }} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
          {TEMPLATES.map((t, i) => (
            <button key={i} className="chip" onClick={() => setDesc(t)} style={{ fontSize: 11 }}>
              Template {i + 1}
            </button>
          ))}
        </div>
        <button className="btn" onClick={generate} disabled={loading}>
          {loading ? <><span className="dot-pulse"><span /><span /><span /></span> Building your plan…</> : '📅 Generate AI Plan'}
        </button>
      </div>

      {plan && (
        <div className="card">
          <div className="section-label">Your personalized study plan</div>
          <div className="ai-output">{plan}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(plan); toast.success('Copied!'); }}>
              📋 Copy plan
            </button>
            <button className="btn btn-ghost btn-sm" onClick={generate}>🔄 Regenerate</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-label">This week</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginTop: 8 }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{
              background: i === todayIdx ? 'rgba(108,71,255,0.08)' : 'var(--surface)',
              border: `1px solid ${i === todayIdx ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 10, padding: '10px 6px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: i === todayIdx ? 'var(--accent)' : 'var(--ink2)', marginBottom: 6 }}>{d}</div>
              {i <= todayIdx && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                  {Array.from({ length: i === todayIdx ? 3 : Math.floor(Math.random() * 3) }).map((_, j) => (
                    <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: ['var(--accent)', 'var(--accent2)', 'var(--accent3)'][j % 3] }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginRight: 4 }} />Sessions</span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent2)', marginRight: 4 }} />Quizzes</span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent3)', marginRight: 4 }} />Summaries</span>
        </div>
      </div>
    </div>
  );
}
