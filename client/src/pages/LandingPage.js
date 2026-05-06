import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  speed: Math.random() * 0.3 + 0.1,
  opacity: Math.random() * 0.4 + 0.1,
}));

const CODE_LINES = [
  { text: 'const collab = new Editor({ realtime: true });', color: '#00e5ff' },
  { text: 'socket.on("code-change", sync);', color: '#9c40ff' },
  { text: '// 3 users editing simultaneously...', color: '#4a4a7a' },
  { text: 'function merge(delta, state) {', color: '#00ff88' },
  { text: '  return applyOT(state, delta);', color: '#d0d0f0' },
  { text: '}', color: '#d0d0f0' },
];

export default function LandingPage({ socket }) {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [mode, setMode] = useState('home'); // home | join | create
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [codeIdx, setCodeIdx] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCodeIdx(i => (i + 1) % CODE_LINES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mode !== 'home' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mode]);

  async function createRoom() {
    if (!username.trim()) { setError('Enter your name first'); return; }
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      socket.emit('join-room', { roomId: data.roomId, username: username.trim() });
      navigate(`/room/${data.roomId}`, { state: { username: username.trim() } });
    } catch {
      setError('Failed to create room. Is the server running?');
      setCreating(false);
    }
  }

  function joinRoom() {
    if (!username.trim()) { setError('Enter your name first'); return; }
    if (!roomId.trim()) { setError('Enter a room ID'); return; }
    setError('');
    socket.emit('join-room', { roomId: roomId.trim().toUpperCase(), username: username.trim() });
    navigate(`/room/${roomId.trim().toUpperCase()}`, { state: { username: username.trim() } });
  }

  return (
    <div style={styles.page}>
      {/* Animated background */}
      <div style={styles.bg}>
        <div style={styles.gradientOrb1} />
        <div style={styles.gradientOrb2} />
        <div style={styles.grid} />
        <svg style={styles.particles} viewBox="0 0 100 100" preserveAspectRatio="none">
          {PARTICLES.map(p => (
            <circle key={p.id} cx={p.x} cy={p.y} r={p.size * 0.1} fill="#00e5ff" opacity={p.opacity} />
          ))}
        </svg>
      </div>

      {/* Floating code preview */}
      <div style={styles.codePreview}>
        <div style={styles.codeBar}>
          <span style={{ ...styles.dot, background: '#ff5f56' }} />
          <span style={{ ...styles.dot, background: '#ffbd2e' }} />
          <span style={{ ...styles.dot, background: '#27c93f' }} />
          <span style={styles.fileName}>main.js — Code Crafter</span>
        </div>
        <div style={styles.codeBody}>
          {CODE_LINES.map((line, i) => (
            <div key={i} style={{
              ...styles.codeLine,
              opacity: i === codeIdx ? 1 : 0.3,
              transform: `translateX(${i === codeIdx ? 0 : -4}px)`,
              transition: 'all 0.4s ease',
              color: line.color,
            }}>
              <span style={styles.lineNum}>{String(i + 1).padStart(2, '0')}</span>
              {line.text}
            </div>
          ))}
        </div>
        <div style={styles.liveDot}>
          <span style={styles.livePulse} />
          LIVE
        </div>
      </div>

      {/* Main content */}
      <div style={styles.center}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>{'</>'}</span>
          <span style={styles.logoText}>Code Crafter</span>
        </div>

        <h1 style={styles.headline}>
          Code Together,<br />
          <span style={styles.headlineAccent}>In Real Time.</span>
        </h1>

        <p style={styles.sub}>
          A multiplayer code editor with live cursors, instant sync, and built-in chat.
          No accounts. No setup. Just share a link.
        </p>

        {/* Stats */}
        <div style={styles.stats}>
          {[
            ['< 50ms', 'Sync Latency'],
            ['∞', 'Collaborators'],
            ['10+', 'Languages'],
          ].map(([val, label]) => (
            <div key={label} style={styles.stat}>
              <span style={styles.statVal}>{val}</span>
              <span style={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>

        {/* Action panel */}
        {mode === 'home' && (
          <div style={styles.actionPanel}>
            <div style={styles.nameRow}>
              <input
                style={styles.input}
                placeholder="Your display name..."
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && createRoom()}
              />
            </div>
            <div style={styles.btnRow}>
              <button style={styles.btnPrimary} onClick={() => { if (!username.trim()) { setError('Enter your name first'); return; } setMode('create'); }}>
                <span style={styles.btnIcon}>+</span> New Room
              </button>
              <button style={styles.btnSecondary} onClick={() => { if (!username.trim()) { setError('Enter your name first'); return; } setMode('join'); }}>
                <span style={styles.btnIcon}>→</span> Join Room
              </button>
            </div>
            {error && <p style={styles.error}>{error}</p>}
          </div>
        )}

        {mode === 'create' && (
          <div style={styles.actionPanel}>
            <div style={styles.panelHeader}>
              <button style={styles.backBtn} onClick={() => { setMode('home'); setError(''); }}>← Back</button>
              <span style={styles.panelTitle}>Create a Room</span>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Your Name</label>
              <input style={styles.input} value={username} onChange={e => setUsername(e.target.value)} ref={inputRef} />
            </div>
            <button style={{ ...styles.btnPrimary, width: '100%' }} onClick={createRoom} disabled={creating}>
              {creating ? <span style={styles.spinner} /> : '🚀 Create & Enter Room'}
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </div>
        )}

        {mode === 'join' && (
          <div style={styles.actionPanel}>
            <div style={styles.panelHeader}>
              <button style={styles.backBtn} onClick={() => { setMode('home'); setError(''); }}>← Back</button>
              <span style={styles.panelTitle}>Join a Room</span>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Your Name</label>
              <input style={styles.input} value={username} onChange={e => setUsername(e.target.value)} ref={inputRef} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Room ID</label>
              <input
                style={{ ...styles.input, letterSpacing: '0.2em', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}
                placeholder="e.g. A1B2C3"
                value={roomId}
                onChange={e => { setRoomId(e.target.value.toUpperCase()); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && joinRoom()}
              />
            </div>
            <button style={{ ...styles.btnPrimary, width: '100%' }} onClick={joinRoom}>
              → Enter Room
            </button>
            {error && <p style={styles.error}>{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    position: 'relative', overflowX: 'hidden', overflowY: 'auto', background: '#040407',
    padding: '24px 0 40px',
  },
  bg: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  gradientOrb1: {
    position: 'absolute', width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)',
    top: '10%', left: '10%', filter: 'blur(40px)',
    animation: 'float 8s ease-in-out infinite',
  },
  gradientOrb2: {
    position: 'absolute', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(156,64,255,0.08) 0%, transparent 70%)',
    bottom: '10%', right: '10%', filter: 'blur(40px)',
    animation: 'float 10s ease-in-out infinite reverse',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
  },
  particles: { position: 'absolute', inset: 0, width: '100%', height: '100%' },

  // Floating code
  codePreview: {
    position: 'absolute', right: '5%', top: '15%', width: 340,
    background: 'rgba(13,13,26,0.9)', border: '1px solid rgba(0,229,255,0.15)',
    borderRadius: 12, overflow: 'hidden', backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,229,255,0.05)',
    animation: 'slideRight 0.8s ease 0.5s both',
    '@media(max-width: 900px)': { display: 'none' },
  },
  codeBar: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
    background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  dot: { width: 10, height: 10, borderRadius: '50%' },
  fileName: { marginLeft: 8, fontSize: 11, color: '#6b6b9f', fontFamily: 'JetBrains Mono, monospace' },
  codeBody: { padding: '16px 0' },
  codeLine: {
    padding: '3px 16px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
    display: 'flex', gap: 12, whiteSpace: 'nowrap',
  },
  lineNum: { color: '#2e2e52', minWidth: 16, userSelect: 'none', fontSize: 11 },
  liveDot: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: 10,
    color: '#00e5ff', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
  },
  livePulse: {
    width: 6, height: 6, borderRadius: '50%', background: '#00e5ff',
    animation: 'pulse 1.5s ease-in-out infinite',
  },

  // Center content
  center: {
    position: 'relative', zIndex: 10, textAlign: 'center',
    animation: 'slideUp 0.7s ease both',
    padding: '0 24px', maxWidth: 520, width: '100%',
  },
  logo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 },
  logoIcon: {
    fontSize: 20, fontFamily: 'JetBrains Mono, monospace', color: '#00e5ff',
    background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.25)',
    padding: '4px 10px', borderRadius: 6,
  },
  logoText: { fontSize: 18, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#f0f0ff', letterSpacing: '-0.02em' },
  headline: {
    fontSize: 'clamp(32px, 8vw, 56px)', fontFamily: 'Syne, sans-serif', fontWeight: 800,
    lineHeight: 1.1, letterSpacing: '-0.03em', color: '#f0f0ff', marginBottom: 20,
  },
  headlineAccent: {
    background: 'linear-gradient(135deg, #00e5ff, #9c40ff)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  sub: { fontSize: 'clamp(14px, 3vw, 16px)', color: '#6b6b9f', lineHeight: 1.7, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' },
  stats: { display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statVal: { fontSize: 22, fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#00e5ff' },
  statLabel: { fontSize: 11, color: '#4a4a7a', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em' },

  // Panel
  actionPanel: {
    background: 'rgba(13,13,26,0.8)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16, padding: 24, backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    animation: 'slideUp 0.3s ease',
  },
  panelHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  backBtn: {
    background: 'none', border: 'none', color: '#6b6b9f', cursor: 'pointer',
    fontSize: 13, fontFamily: 'JetBrains Mono, monospace', padding: '4px 8px',
    borderRadius: 6, transition: 'color 0.2s',
  },
  panelTitle: { fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#d0d0f0' },
  nameRow: { marginBottom: 16 },
  inputGroup: { marginBottom: 14, textAlign: 'left' },
  label: { display: 'block', fontSize: 11, color: '#4a4a7a', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 },
  input: {
    width: '100%', padding: '12px 14px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: '#f0f0ff', fontSize: 14,
    fontFamily: 'Inter, sans-serif', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },
  btnRow: { display: 'flex', gap: 12 },
  btnPrimary: {
    flex: 1, padding: '13px 20px',
    background: 'linear-gradient(135deg, rgba(0,229,255,0.9), rgba(0,180,255,0.9))',
    border: 'none', borderRadius: 8, color: '#040407', fontSize: 14, fontWeight: 700,
    fontFamily: 'Syne, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8, transition: 'transform 0.15s, box-shadow 0.15s',
    boxShadow: '0 4px 20px rgba(0,229,255,0.3)',
  },
  btnSecondary: {
    flex: 1, padding: '13px 20px',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8, color: '#d0d0f0', fontSize: 14, fontWeight: 600,
    fontFamily: 'Syne, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 8, transition: 'all 0.15s',
  },
  btnIcon: { fontSize: 16 },
  error: { marginTop: 12, fontSize: 13, color: '#ff4db8', fontFamily: 'JetBrains Mono, monospace' },
  spinner: {
    width: 16, height: 16, border: '2px solid rgba(4,4,7,0.3)',
    borderTopColor: '#040407', borderRadius: '50%',
    display: 'inline-block', animation: 'spin 0.8s linear infinite',
  },
};
