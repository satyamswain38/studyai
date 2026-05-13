import React, { useState, useRef, useEffect } from 'react';
import { ai } from '../utils/api';
import toast from 'react-hot-toast';

const CHIPS = [
  'Explain the OSI model simply',
  'What is deadlock in OS?',
  'Explain normalization in DBMS',
  'TCP vs UDP difference',
  'What is Big O notation?',
  'Explain virtual memory',
  'What is SQL JOIN?',
  'Explain recursion with example',
];

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI study buddy 🎓 Ask me anything — concepts, doubts, or "explain like I\'m 5". I\'m here 24/7 to help you ace your exams!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (msgText) => {
    const text = (msgText || input).trim();
    if (!text || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Build history (exclude initial greeting, only real conversation)
      const history = newMessages
        .slice(1) // skip initial greeting
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await ai.chat(text, chatId, history.slice(0, -1));
      setChatId(res.data.chatId);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Something went wrong';
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errMsg}` }]);
      if (err.response?.data?.upgradeRequired) {
        toast('Upgrade to Pro for unlimited doubts!', { icon: '⭐' });
      }
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Chat cleared! Ask me anything 😊' }]);
    setChatId(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 700 }}>Doubt Solver AI</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>Your personal AI teacher — available 24/7.</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={clearChat}>🗑️ Clear chat</button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 560 }}>
        {/* Quick chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          {CHIPS.map(c => (
            <button key={c} className="chip" onClick={() => send(c)}>{c}</button>
          ))}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600,
                background: m.role === 'user' ? 'rgba(255,107,53,0.1)' : 'rgba(108,71,255,0.1)',
                color: m.role === 'user' ? 'var(--accent2)' : 'var(--accent)'
              }}>
                {m.role === 'user' ? 'You' : 'AI'}
              </div>
              <div style={{
                padding: '10px 14px', borderRadius: 14, maxWidth: '78%', fontSize: 14, lineHeight: 1.65,
                whiteSpace: 'pre-wrap',
                ...(m.role === 'user'
                  ? { background: 'var(--accent)', color: '#fff', borderBottomRightRadius: 4 }
                  : { background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--ink2)', borderBottomLeftRadius: 4 })
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(108,71,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>AI</div>
              <div style={{ padding: '12px 16px', borderRadius: 14, borderBottomLeftRadius: 4, background: 'var(--card)', border: '1px solid var(--border)' }}>
                <span className="dot-pulse"><span /><span /><span /></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <input className="input" style={{ flex: 1 }} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask a doubt… (Enter to send)" disabled={loading} />
          <button className="btn" onClick={() => send()} disabled={loading || !input.trim()}>
            Send ↗
          </button>
        </div>
      </div>
    </div>
  );
}
