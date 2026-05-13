import React, { useEffect, useState } from 'react';
import { quiz as quizApi, notes } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SUBJECTS = [
  { tag: 'DSA', name: 'Data Structures & Algo', pct: 81, color: 'var(--accent3)' },
  { tag: 'OS', name: 'Operating Systems', pct: 72, color: 'var(--accent)' },
  { tag: 'CN', name: 'Computer Networks', pct: 55, color: 'var(--accent2)' },
  { tag: 'DBMS', name: 'Database Management', pct: 38, color: '#e24b4a' },
];

export default function Progress() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [notesList, setNotesList] = useState([]);

  useEffect(() => {
    quizApi.getAll().then(r => setQuizzes(r.data.quizzes || [])).catch(() => {});
    notes.getAll().then(r => setNotesList(r.data.notes || [])).catch(() => {});
  }, []);

  const completedQuizzes = quizzes.filter(q => q.score !== null);
  const avgScore = completedQuizzes.length
    ? Math.round(completedQuizzes.reduce((a, b) => a + b.score, 0) / completedQuizzes.length)
    : 0;

  const weakest = SUBJECTS.slice().sort((a, b) => a.pct - b.pct)[0];

  return (
    <div>
      <div className="page-header">
        <h1>Your Progress</h1>
        <p>See how far you've come — and where to focus next.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card stat-purple">
          <div className="stat-num">{notesList.length}</div>
          <div className="stat-lbl">Notes saved</div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-num">{avgScore}%</div>
          <div className="stat-lbl">Avg quiz score</div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-num">{user?.streak || 0}</div>
          <div className="stat-lbl">Day streak 🔥</div>
        </div>
      </div>

      <div className="card">
        <div className="section-label">Subject-wise progress</div>
        {SUBJECTS.map(s => (
          <div key={s.tag} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span className="tag">{s.tag}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{s.name}</span>
            <div className="progress-bar" style={{ width: 160 }}>
              <div className="progress-fill" style={{ width: `${s.pct}%`, background: s.color }} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--muted)', width: 36, textAlign: 'right' }}>{s.pct}%</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-label">AI recommendation</div>
        <div className="ai-output" style={{ marginTop: 0 }}>
          📌 Focus on <strong>{weakest.name}</strong> this week — you're at only {weakest.pct}%.{'\n\n'}
          💡 Strategy: Start with the fundamentals, then do 10 practice questions daily on this topic.{'\n'}
          🎯 Target: Reach 60% in 7 days by spending 1.5 extra hours on {weakest.tag}.{'\n\n'}
          ✅ Your strongest subject is <strong>{SUBJECTS[0].name}</strong> at {SUBJECTS[0].pct}% — take a 2-day break from it.
        </div>
      </div>

      {quizzes.length > 0 && (
        <div className="card">
          <div className="section-label">Recent quizzes</div>
          {quizzes.slice(0, 6).map(q => (
            <div key={q._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span style={{ flex: 1, fontWeight: 500 }}>{q.topic}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{q.totalQuestions} Qs</span>
              {q.score !== null
                ? <span style={{
                    fontWeight: 700, fontSize: 13,
                    color: q.score >= 80 ? 'var(--accent3)' : q.score >= 50 ? 'var(--accent2)' : '#e24b4a'
                  }}>{q.score}%</span>
                : <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>}
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>{new Date(q.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
