import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quiz, notes } from '../utils/api';

const SUBJECTS = [
  { tag: 'OS', name: 'Operating Systems', pct: 72, color: 'var(--accent)' },
  { tag: 'CN', name: 'Computer Networks', pct: 55, color: 'var(--accent2)' },
  { tag: 'DBMS', name: 'Database Management', pct: 38, color: '#e24b4a' },
  { tag: 'DSA', name: 'Data Structures & Algo', pct: 81, color: 'var(--accent3)' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizCount, setQuizCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);

  useEffect(() => {
    quiz.getAll().then(r => setQuizCount(r.data.quizzes?.length || 0)).catch(() => {});
    notes.getAll().then(r => setNoteCount(r.data.notes?.length || 0)).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <div className="page-header">
        <h1>{greeting}, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Ready to crush your studies today? You've got this.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card stat-purple">
          <div className="stat-num">{noteCount}</div>
          <div className="stat-lbl">Notes saved</div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-num">{quizCount}</div>
          <div className="stat-lbl">Quizzes taken</div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-num">{user?.streak || 0}</div>
          <div className="stat-lbl">Day streak 🔥</div>
        </div>
      </div>

      <div className="card">
        <div className="section-label">Subject progress</div>
        {SUBJECTS.map(s => (
          <div key={s.tag} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span className="tag">{s.tag}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{s.name}</span>
            <div className="progress-bar" style={{ width: 120 }}>
              <div className="progress-fill" style={{ width: `${s.pct}%`, background: s.color }} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--muted)', width: 36, textAlign: 'right' }}>{s.pct}%</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-label">Quick actions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => navigate('/summarizer')}>📄 Summarize notes</button>
          <button className="btn btn-ghost" onClick={() => navigate('/chatbot')}>💬 Ask a doubt</button>
          <button className="btn btn-ghost" onClick={() => navigate('/quiz')}>🧪 Take a quiz</button>
          <button className="btn btn-ghost" onClick={() => navigate('/planner')}>📅 Plan my study</button>
        </div>
      </div>

      {user?.plan === 'free' && (
        <div style={{ background: 'linear-gradient(135deg, rgba(108,71,255,0.08) 0%, rgba(255,107,53,0.08) 100%)', border: '1px solid rgba(108,71,255,0.2)', borderRadius: 'var(--radius)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Upgrade to Pro 🚀</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Unlimited AI calls · PDF upload · Advanced quizzes · Priority support</div>
          </div>
          <button className="btn" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>₹99/month →</button>
        </div>
      )}
    </div>
  );
}
