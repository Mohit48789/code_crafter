import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function ChatPanel({ messages, onSend, onTyping, currentSocketId, typingUsers }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
    onTyping(false);
    clearTimeout(typingTimeout.current);
  }, [input, onSend, onTyping]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    onTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => onTyping(false), 2000);
  };

  const typingList = Object.values(typingUsers).filter(u => true);

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.title}>Chat</span>
        {messages.length > 0 && <span style={styles.badge}>{messages.length}</span>}
      </div>

      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>💬</span>
            <span>No messages yet</span>
            <span style={styles.emptyHint}>Say hello to your collaborators!</span>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.userId === currentSocketId;
          return (
            <div key={msg.id} style={{ ...styles.message, flexDirection: isMe ? 'row-reverse' : 'row' }}>
              <div style={{ ...styles.msgAvatar, background: msg.color }}>
                {msg.username[0].toUpperCase()}
              </div>
              <div style={{ ...styles.bubble, ...(isMe ? styles.bubbleMe : styles.bubbleThem) }}>
                {!isMe && <div style={{ ...styles.msgName, color: msg.color }}>{msg.username}</div>}
                <div style={styles.msgText}>{msg.message}</div>
                <div style={styles.msgTime}>{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          );
        })}
        {typingList.length > 0 && (
          <div style={styles.typingRow}>
            {typingList.map(u => (
              <span key={u.username} style={{ ...styles.typingUser, color: u.color }}>
                <TypingDots color={u.color} /> {u.username} is typing
              </span>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputArea}>
        <input
          style={styles.input}
          placeholder="Message..."
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={500}
        />
        <button
          style={{ ...styles.sendBtn, opacity: input.trim() ? 1 : 0.4 }}
          onClick={handleSend}
          disabled={!input.trim()}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

function TypingDots({ color }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, marginRight: 4 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 3, height: 3, borderRadius: '50%', background: color,
          animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          display: 'inline-block',
        }} />
      ))}
    </span>
  );
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = {
  panel: {
    display: 'flex', flexDirection: 'column', height: '100%',
    background: 'rgba(8,8,15,0.6)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)',
    flexShrink: 0,
  },
  title: { fontSize: 11, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4a4a7a' },
  badge: {
    fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
    background: 'rgba(156,64,255,0.15)', border: '1px solid rgba(156,64,255,0.3)',
    color: '#9c40ff', padding: '1px 7px', borderRadius: 20,
  },
  messages: { flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 6, flex: 1, color: '#4a4a7a', fontSize: 13,
    marginTop: 40,
  },
  emptyIcon: { fontSize: 28, marginBottom: 4 },
  emptyHint: { fontSize: 11, color: '#2e2e52', fontFamily: 'JetBrains Mono, monospace' },
  message: { display: 'flex', gap: 8, alignItems: 'flex-end' },
  msgAvatar: {
    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 700, color: '#000',
  },
  bubble: { maxWidth: '75%', borderRadius: 10, padding: '8px 12px' },
  bubbleThem: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderBottomLeftRadius: 2 },
  bubbleMe: { background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.15)', borderBottomRightRadius: 2 },
  msgName: { fontSize: 10, fontWeight: 600, marginBottom: 3, fontFamily: 'JetBrains Mono, monospace' },
  msgText: { fontSize: 13, color: '#d0d0f0', lineHeight: 1.4, wordBreak: 'break-word' },
  msgTime: { fontSize: 10, color: '#4a4a7a', marginTop: 4, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' },
  typingRow: { display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 0' },
  typingUser: { fontSize: 11, display: 'flex', alignItems: 'center', fontFamily: 'JetBrains Mono, monospace' },
  inputArea: {
    padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', gap: 8, flexShrink: 0,
  },
  input: {
    flex: 1, padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8, color: '#f0f0ff', fontSize: 13,
    fontFamily: 'Inter, sans-serif', outline: 'none',
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 8,
    background: 'linear-gradient(135deg, #00e5ff, #0080ff)',
    border: 'none', color: '#040407', fontSize: 16, fontWeight: 700,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.2s, transform 0.15s', flexShrink: 0,
  },
};
