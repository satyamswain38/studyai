import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ai, notes } from '../utils/api';
import toast from 'react-hot-toast';

export default function Summarizer() {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('General');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedNotes, setSavedNotes] = useState([]);
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  const loadNotes = async () => {
    if (notesLoaded) return;
    try {
      const res = await notes.getAll();
      setSavedNotes(res.data.notes || []);
      setNotesLoaded(true);
    } catch {}
  };

  const handleSummarize = async () => {
    if (!text.trim() || text.trim().length < 20) return toast.error('Please enter at least 20 characters of notes.');
    setLoading(true);
    setSummary('');
    try {
      const res = await ai.summarize(text, title || 'Untitled Note', subject);
      setSummary(res.data.summary);
      toast.success('Summary saved to your notes!');
      setNotesLoaded(false);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to summarize';
      toast.error(msg);
      if (err.response?.data?.upgradeRequired) {
        toast('Upgrade to Pro for unlimited summaries', { icon: '⭐' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfLoading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('subject', subject);
      const res = await ai.summarizePDF(formData);
      setSummary(res.data.summary);
      setTitle(file.name.replace('.pdf', ''));
      toast.success(`PDF processed (${Math.round(res.data.extractedLength / 1000)}k chars extracted)`);
      setNotesLoaded(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'PDF processing failed');
    } finally {
      setPdfLoading(false);
      e.target.value = '';
    }
  };

  const SUBJECTS = ['General', 'OS', 'DBMS', 'CN', 'DSA', 'Maths', 'Physics', 'Chemistry', 'Biology', 'English'];

  return (
    <div>
      <div className="page-header">
        <h1>AI Note Summarizer</h1>
        <p>Paste notes or upload a PDF — get clean, exam-focused bullet points.</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="label">Title (optional)</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. OSI Model Notes" />
          </div>
          <div style={{ minWidth: 140 }}>
            <label className="label">Subject</label>
            <select className="input" value={subject} onChange={e => setSubject(e.target.value)}>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <label className="label">Your notes</label>
        <textarea className="input" value={text} onChange={e => setText(e.target.value)}
          placeholder="Paste your notes here… the more detail, the better the summary."
          style={{ minHeight: 160 }} />

        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn" onClick={handleSummarize} disabled={loading || pdfLoading}>
            {loading ? <><span className="dot-pulse"><span /><span /><span /></span> Summarizing…</> : '✨ Summarize with AI'}
          </button>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>or</span>
          <button className="btn btn-ghost" onClick={() => fileRef.current.click()} disabled={pdfLoading || loading}>
            {pdfLoading ? 'Processing PDF…' : '📎 Upload PDF'}
          </button>
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handlePDF} />
        </div>
      </div>

      {summary && (
        <div className="card">
          <div className="section-label">AI Summary</div>
          <div className="ai-output">{summary}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/quiz', { state: { topic: title || subject } })}>
              🧪 Generate quiz from this
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(summary); toast.success('Copied!'); }}>
              📋 Copy summary
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="section-label" style={{ marginBottom: 0 }}>Saved notes</div>
          <button className="btn btn-ghost btn-sm" onClick={loadNotes}>Load notes</button>
        </div>
        {notesLoaded && savedNotes.length === 0 && (
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>No saved notes yet. Summarize something to get started!</p>
        )}
        {savedNotes.map(n => (
          <div key={n._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span className="tag">{n.subject}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{n.title}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(n.updatedAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
