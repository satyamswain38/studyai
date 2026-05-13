import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ai, quiz as quizApi } from '../utils/api';
import toast from 'react-hot-toast';

export default function QuizPage() {
  const location = useLocation();
  const [topic, setTopic] = useState(location.state?.topic || '');
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizId, setQuizId] = useState(null);
  const [score, setScore] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    quizApi.getAll().then(r => setHistory(r.data.quizzes || [])).catch(() => {});
  }, []);

  const generate = async () => {
    if (!topic.trim()) return toast.error('Please enter a topic');
    setLoading(true);
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    try {
      const res = await ai.generateQuiz(topic, count);
      setQuestions(res.data.questions);
      // Save quiz to DB
      const saved = await quizApi.save(topic, res.data.questions);
      setQuizId(saved.data.quiz._id);
      toast.success(`${res.data.questions.length} questions generated!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate quiz');
      if (err.response?.data?.upgradeRequired) {
        toast('Upgrade to Pro for unlimited quizzes!', { icon: '⭐' });
      }
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (qIdx, letter) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIdx]: letter }));
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length < questions.length) {
      return toast.error('Answer all questions before submitting');
    }
    setSubmitted(true);
    const correct = questions.filter((q, i) => answers[i] === q.correctAnswer).length;
    const s = Math.round((correct / questions.length) * 100);
    setScore(s);
    if (quizId) {
      try { await quizApi.submit(quizId, s); } catch {}
    }
    if (s >= 80) toast.success(`Amazing! ${s}% — You're crushing it! 🔥`);
    else if (s >= 50) toast(`Good effort! ${s}% — Review the wrong ones`, { icon: '💪' });
    else toast(`${s}% — Keep practicing, you'll get there!`, { icon: '📚' });
  };

  const SUGGESTED = ['OSI Model', 'OS Scheduling', 'SQL Joins', 'Dijkstra\'s Algorithm', 'TCP/IP', 'Normalization'];

  return (
    <div>
      <div className="page-header">
        <h1>Quiz Generator</h1>
        <p>Enter any topic — AI builds a custom MCQ test instantly.</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="label">Topic</label>
            <input className="input" value={topic} onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generate()}
              placeholder="e.g. Operating System Scheduling Algorithms" />
          </div>
          <div style={{ minWidth: 90 }}>
            <label className="label">Questions</label>
            <select className="input" value={count} onChange={e => setCount(Number(e.target.value))}>
              {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <button className="btn" onClick={generate} disabled={loading}>
              {loading ? <><span className="dot-pulse"><span /><span /><span /></span> Generating…</> : 'Generate Quiz ✨'}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SUGGESTED.map(s => (
            <button key={s} className="chip" onClick={() => setTopic(s)}>{s}</button>
          ))}
        </div>
      </div>

      {questions.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div className="section-label" style={{ marginBottom: 0 }}>Quiz: {topic}</div>
            {submitted && score !== null && (
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: score >= 80 ? 'var(--accent3)' : score >= 50 ? 'var(--accent2)' : '#e24b4a' }}>
                {score}% {score >= 80 ? '🔥' : score >= 50 ? '💪' : '📚'}
              </div>
            )}
          </div>

          {questions.map((q, i) => (
            <div key={i} style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 12, lineHeight: 1.5 }}>
                {i + 1}. {q.question}
              </div>
              {q.options.map(opt => {
                const letter = opt[0];
                const isSelected = answers[i] === letter;
                const isCorrect = submitted && letter === q.correctAnswer;
                const isWrong = submitted && isSelected && letter !== q.correctAnswer;
                return (
                  <div key={letter} onClick={() => selectAnswer(i, letter)} style={{
                    padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 8,
                    border: `1px solid ${isCorrect ? 'var(--accent3)' : isWrong ? '#e24b4a' : isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    background: isCorrect ? 'rgba(0,200,150,0.08)' : isWrong ? 'rgba(226,75,74,0.08)' : isSelected ? 'rgba(108,71,255,0.06)' : 'transparent',
                    cursor: submitted ? 'default' : 'pointer', fontSize: 14,
                    color: isCorrect ? '#0a7c5e' : isWrong ? '#a32d2d' : 'var(--ink2)',
                    transition: 'all 0.15s'
                  }}>
                    {opt}
                    {isCorrect && ' ✅'}
                    {isWrong && ' ❌'}
                  </div>
                );
              })}
              {submitted && q.explanation && (
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, padding: '8px 12px', background: 'var(--surface)', borderRadius: 8, lineHeight: 1.6 }}>
                  💡 {q.explanation}
                </div>
              )}
            </div>
          ))}

          {!submitted ? (
            <button className="btn" onClick={submitQuiz}>
              Submit Quiz ({Object.keys(answers).length}/{questions.length} answered)
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" onClick={generate}>🔄 New quiz on same topic</button>
              <button className="btn btn-ghost" onClick={() => { setTopic(''); setQuestions([]); }}>Try different topic</button>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="card">
          <div className="section-label">Quiz history</div>
          {history.slice(0, 5).map(q => (
            <div key={q._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span style={{ flex: 1, fontWeight: 500 }}>{q.topic}</span>
              {q.score !== null
                ? <span style={{ color: q.score >= 80 ? 'var(--accent3)' : q.score >= 50 ? 'var(--accent2)' : '#e24b4a', fontWeight: 600 }}>{q.score}%</span>
                : <span style={{ color: 'var(--muted)' }}>Not submitted</span>}
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{new Date(q.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
