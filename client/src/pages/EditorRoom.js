import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useCollabEditor } from '../hooks/useCollabEditor';
import CodeEditor from '../components/CodeEditor';
import UserList from '../components/UserList';
import ChatPanel from '../components/ChatPanel';
import Toolbar from '../components/Toolbar';

const PANEL_USERS = 'users';
const PANEL_CHAT = 'chat';

export default function EditorRoom({ socket, isConnected }) {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username || `Guest_${Math.random().toString(36).slice(2, 6)}`;

  const {
    code, language, users, messages, typingUsers, cursors, isReady,
    emitCodeChange, emitLanguageChange, emitMessage, emitTyping, emitCursor,
  } = useCollabEditor(socket, roomId);

  const [activePanel, setActivePanel] = useState(PANEL_USERS);
  const [notification, setNotification] = useState(null);
  const [prevUserCount, setPrevUserCount] = useState(0);

  // Join room on mount
  useEffect(() => {
    if (!socket) return;
    socket.emit('join-room', { roomId, username });
  }, [socket, roomId, username]);

  // User join/leave notifications
  useEffect(() => {
    if (users.length > prevUserCount && prevUserCount > 0) {
      const newUser = users[users.length - 1];
      if (newUser?.id !== socket?.id) {
        showNotif(`${newUser?.username} joined`, '#00ff88');
      }
    } else if (users.length < prevUserCount) {
      showNotif('A user left the room', '#ff6b6b');
    }
    setPrevUserCount(users.length);
  }, [users]); // eslint-disable-line

  // New chat message notification when chat not active
  useEffect(() => {
    if (messages.length > 0 && activePanel !== PANEL_CHAT) {
      const last = messages[messages.length - 1];
      if (last?.userId !== socket?.id) {
        showNotif(`${last?.username}: ${last?.message.slice(0, 30)}${last?.message.length > 30 ? '…' : ''}`, last?.color);
        setActivePanel(PANEL_CHAT);
      }
    }
  }, [messages]); // eslint-disable-line

  function showNotif(text, color = '#00e5ff') {
    setNotification({ text, color, id: Date.now() });
    setTimeout(() => setNotification(null), 3000);
  }

  const handleRun = useCallback(() => {
    showNotif('Run feature: connect to your own executor! 🚀', '#ffd166');
  }, []);

  if (!socket) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Connecting to server...</p>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      {/* Toolbar */}
      <div style={styles.toolbarRow}>
        <Toolbar
          language={language}
          onLanguageChange={emitLanguageChange}
          roomId={roomId}
          userCount={users.length}
          isConnected={isConnected}
          onRun={handleRun}
        />
      </div>

      {/* Main layout */}
      <div style={styles.main}>
        {/* Editor */}
        <div style={styles.editorArea}>
          {!isReady && (
            <div style={styles.editorLoading}>
              <div style={styles.miniSpinner} />
              <span>Syncing room state...</span>
            </div>
          )}
          {isReady && (
            <CodeEditor
              code={code}
              language={language}
              onChange={emitCodeChange}
              onCursor={emitCursor}
            />
          )}

          {/* Status bar */}
          <div style={styles.statusBar}>
            <div style={styles.statusLeft}>
              <span style={styles.statusItem}>
                <span style={styles.statusDot} />
                {language}
              </span>
              <span style={styles.statusItem}>Ln {1} · Col {1}</span>
            </div>
            <div style={styles.statusRight}>
              {Object.keys(typingUsers).length > 0 && (
                <span style={styles.typingStatus}>
                  {Object.values(typingUsers).map(u => u.username).join(', ')} typing...
                </span>
              )}
              <span style={styles.statusItem}>{code.split('\n').length} lines</span>
              <span style={styles.statusItem}>{code.length} chars</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Panel tabs */}
          <div style={styles.sideTabs}>
            <button
              style={{ ...styles.sideTab, ...(activePanel === PANEL_USERS ? styles.sideTabActive : {}) }}
              onClick={() => setActivePanel(PANEL_USERS)}
            >
              <span>👥</span>
              <span>Users ({users.length})</span>
            </button>
            <button
              style={{ ...styles.sideTab, ...(activePanel === PANEL_CHAT ? styles.sideTabActive : {}) }}
              onClick={() => setActivePanel(PANEL_CHAT)}
            >
              <span>💬</span>
              <span>Chat</span>
              {messages.length > 0 && activePanel !== PANEL_CHAT && (
                <span style={styles.msgBadge}>{messages.length > 9 ? '9+' : messages.length}</span>
              )}
            </button>
          </div>

          {/* Panel content */}
          <div style={styles.panelContent}>
            {activePanel === PANEL_USERS && (
              <UserList
                users={users}
                currentSocketId={socket?.id}
                typingUsers={typingUsers}
              />
            )}
            {activePanel === PANEL_CHAT && (
              <ChatPanel
                messages={messages}
                onSend={emitMessage}
                onTyping={emitTyping}
                currentSocketId={socket?.id}
                typingUsers={typingUsers}
              />
            )}
          </div>

          {/* Back to home */}
          <button style={styles.leaveBtn} onClick={() => navigate('/')}>
            ← Leave Room
          </button>
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div key={notification.id} style={{ ...styles.toast, borderColor: notification.color }}>
          <span style={{ ...styles.toastDot, background: notification.color }} />
          <span style={styles.toastText}>{notification.text}</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  root: {
    display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw',
    background: 'var(--bg-void)', overflow: 'hidden',
  },
  toolbarRow: {
    height: 52, flexShrink: 0,
    background: 'rgba(8,8,15,0.9)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
  },
  main: { flex: 1, display: 'flex', minHeight: 0 },

  editorArea: {
    flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0,
    position: 'relative',
  },
  editorLoading: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 12, color: '#4a4a7a', fontSize: 13, fontFamily: 'JetBrains Mono, monospace',
  },
  miniSpinner: {
    width: 20, height: 20, border: '2px solid rgba(0,229,255,0.15)',
    borderTopColor: '#00e5ff', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  statusBar: {
    height: 28, flexShrink: 0, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '0 16px',
    background: 'rgba(4,4,7,0.8)', borderTop: '1px solid rgba(255,255,255,0.04)',
  },
  statusLeft: { display: 'flex', gap: 16, alignItems: 'center' },
  statusRight: { display: 'flex', gap: 16, alignItems: 'center' },
  statusItem: { fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#4a4a7a' },
  statusDot: { width: 5, height: 5, borderRadius: '50%', background: '#00e5ff', display: 'inline-block', marginRight: 5 },
  typingStatus: { fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#9c40ff', animation: 'pulse 1.5s ease infinite' },

  sidebar: {
    width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column',
    borderLeft: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(8,8,15,0.8)',
  },
  sideTabs: {
    display: 'flex', flexShrink: 0,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  sideTab: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 5, padding: '12px 8px', background: 'none', border: 'none',
    color: '#4a4a7a', fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
    cursor: 'pointer', transition: 'all 0.15s', position: 'relative',
    borderBottom: '2px solid transparent',
  },
  sideTabActive: {
    color: '#00e5ff', borderBottomColor: '#00e5ff',
    background: 'rgba(0,229,255,0.04)',
  },
  msgBadge: {
    background: '#9c40ff', color: '#fff', fontSize: 9, padding: '1px 5px',
    borderRadius: 10, fontWeight: 700,
  },
  panelContent: { flex: 1, minHeight: 0, overflow: 'hidden' },
  leaveBtn: {
    margin: '8px 12px 12px', padding: '8px 12px', borderRadius: 7, flexShrink: 0,
    background: 'rgba(255,75,184,0.08)', border: '1px solid rgba(255,75,184,0.15)',
    color: '#ff4db8', fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
    cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
  },

  // Loading / error states
  loading: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '100vh', gap: 16, color: '#4a4a7a',
  },
  spinner: {
    width: 32, height: 32, border: '2px solid rgba(0,229,255,0.15)',
    borderTopColor: '#00e5ff', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: { fontSize: 14, fontFamily: 'JetBrains Mono, monospace' },

  // Toast
  toast: {
    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(13,13,26,0.95)', border: '1px solid',
    borderRadius: 10, padding: '10px 18px',
    backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    animation: 'slideUp 0.3s ease',
    zIndex: 9999, maxWidth: 400,
  },
  toastDot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  toastText: { fontSize: 13, color: '#d0d0f0', fontFamily: 'Inter, sans-serif' },
};
