import React from 'react';

export default function UserList({ users, currentSocketId, typingUsers }) {
  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span style={styles.title}>Collaborators</span>
        <span style={styles.count}>{users.length}</span>
      </div>
      <div style={styles.list}>
        {users.map(user => {
          const isMe = user.id === currentSocketId;
          const isTyping = typingUsers[user.id];
          return (
            <div key={user.id} style={styles.user}>
              <div style={{ ...styles.avatar, background: user.color, boxShadow: `0 0 12px ${user.color}40` }}>
                {user.username[0].toUpperCase()}
              </div>
              <div style={styles.info}>
                <div style={styles.name}>
                  {user.username}
                  {isMe && <span style={styles.youBadge}>you</span>}
                </div>
                <div style={styles.status}>
                  {isTyping ? (
                    <span style={{ ...styles.statusText, color: user.color }}>
                      <TypingDots color={user.color} />
                      typing
                    </span>
                  ) : (
                    <span style={styles.statusText}>
                      <span style={{ ...styles.onlineDot, background: '#00ff88' }} />
                      online
                    </span>
                  )}
                </div>
              </div>
              <div style={{ ...styles.colorBar, background: user.color }} />
            </div>
          );
        })}
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

const styles = {
  panel: {
    display: 'flex', flexDirection: 'column', height: '100%',
    background: 'rgba(8,8,15,0.6)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 16px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  title: { fontSize: 11, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4a4a7a' },
  count: {
    fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
    background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)',
    color: '#00e5ff', padding: '1px 7px', borderRadius: 20,
  },
  list: { flex: 1, overflowY: 'auto', padding: '8px 0' },
  user: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px', position: 'relative',
    transition: 'background 0.15s',
    cursor: 'default',
    borderRadius: 0,
  },
  avatar: {
    width: 32, height: 32, borderRadius: 8, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: '#000', flexShrink: 0,
    fontFamily: 'Syne, sans-serif',
  },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 13, color: '#d0d0f0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  youBadge: {
    fontSize: 9, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase',
    background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)',
    color: '#00e5ff', padding: '1px 5px', borderRadius: 3, letterSpacing: '0.05em', flexShrink: 0,
  },
  status: { marginTop: 2 },
  statusText: { fontSize: 11, color: '#4a4a7a', display: 'flex', alignItems: 'center', gap: 4 },
  onlineDot: { width: 5, height: 5, borderRadius: '50%' },
  colorBar: { width: 2, height: 24, borderRadius: 1, flexShrink: 0, opacity: 0.6 },
};
