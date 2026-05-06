import React, { useState } from 'react';
import { LANGUAGES, getLanguageInfo } from '../utils/languages';

export default function Toolbar({ language, onLanguageChange, roomId, userCount, isConnected, onRun }) {
  const [copied, setCopied] = useState(false);
  const [showLangs, setShowLangs] = useState(false);
  const langInfo = getLanguageInfo(language);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.toolbar}>
      {/* Left: Logo + Room info */}
      <div style={styles.left}>
        <div style={styles.logo}>
          <span style={styles.logoText}>{'</>'}</span>
          <span style={styles.logoName}>Code Crafter</span>
        </div>

        <div style={styles.divider} />

        <div style={styles.roomInfo}>
          <div style={styles.roomChip}>
            <span style={styles.roomLabel}>ROOM</span>
            <span style={styles.roomId}>{roomId}</span>
          </div>
          <button style={styles.copyBtn} onClick={copyRoomId} title="Copy Room ID">
            {copied ? '✓' : '⎘'}
          </button>
          <button style={styles.shareBtn} onClick={copyLink}>
            Share Link
          </button>
        </div>
      </div>

      {/* Center: Users + connection */}
      <div style={styles.center}>
        <div style={styles.connStatus}>
          <span style={{ ...styles.connDot, background: isConnected ? '#00ff88' : '#ff4db8' }} />
          <span style={styles.connLabel}>{isConnected ? 'Live' : 'Reconnecting'}</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.userCount}>
          <span style={styles.userIcon}>👥</span>
          <span style={styles.userNum}>{userCount}</span>
          <span style={styles.userLabel}>online</span>
        </div>
      </div>

      {/* Right: Language + actions */}
      <div style={styles.right}>
        {/* Language selector */}
        <div style={styles.langWrapper}>
          <button
            style={styles.langBtn}
            onClick={() => setShowLangs(v => !v)}
          >
            <span style={{ ...styles.langDot, background: langInfo.color }} />
            <span style={styles.langName}>{langInfo.label}</span>
            <span style={styles.langCaret}>{showLangs ? '▲' : '▼'}</span>
          </button>
          {showLangs && (
            <div style={styles.langDropdown}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.id}
                  style={{
                    ...styles.langOption,
                    background: lang.id === language ? 'rgba(0,229,255,0.08)' : 'transparent',
                    color: lang.id === language ? '#00e5ff' : '#9090c0',
                  }}
                  onClick={() => { onLanguageChange(lang.id); setShowLangs(false); }}
                >
                  <span style={{ ...styles.langDot, background: lang.color }} />
                  {lang.label}
                  {lang.id === language && <span style={styles.checkmark}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={styles.divider} />

        <button style={styles.actionBtn} onClick={onRun} title="Format/Run Code">
          <span>▶</span> Run
        </button>
      </div>

      {/* Backdrop for dropdown */}
      {showLangs && (
        <div style={styles.backdrop} onClick={() => setShowLangs(false)} />
      )}
    </div>
  );
}

const styles = {
  toolbar: {
    height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', gap: 16, position: 'relative', zIndex: 100,
  },
  left: { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 },
  center: { display: 'flex', alignItems: 'center', gap: 12, position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  right: { display: 'flex', alignItems: 'center', gap: 10 },

  logo: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  logoText: {
    fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: '#00e5ff',
    background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)',
    padding: '2px 7px', borderRadius: 5,
  },
  logoName: { fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#f0f0ff' },

  divider: { width: 1, height: 20, background: 'rgba(255,255,255,0.08)', flexShrink: 0 },

  roomInfo: { display: 'flex', alignItems: 'center', gap: 8 },
  roomChip: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    padding: '4px 10px', borderRadius: 6,
  },
  roomLabel: { fontSize: 9, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4a4a7a' },
  roomId: { fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: '#d0d0f0', letterSpacing: '0.05em' },
  copyBtn: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#9090c0', width: 28, height: 28, borderRadius: 6, fontSize: 12,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  },
  shareBtn: {
    background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)',
    color: '#00e5ff', padding: '4px 12px', borderRadius: 6, fontSize: 12,
    fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', transition: 'all 0.15s',
  },

  connStatus: { display: 'flex', alignItems: 'center', gap: 6 },
  connDot: { width: 6, height: 6, borderRadius: '50%', animation: 'pulse 2s ease-in-out infinite' },
  connLabel: { fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#6b6b9f' },

  userCount: { display: 'flex', alignItems: 'center', gap: 5 },
  userIcon: { fontSize: 13 },
  userNum: { fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: '#00e5ff', fontWeight: 700 },
  userLabel: { fontSize: 11, color: '#4a4a7a', fontFamily: 'JetBrains Mono, monospace' },

  langWrapper: { position: 'relative' },
  langBtn: {
    display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6, color: '#d0d0f0', fontSize: 13, cursor: 'pointer',
    fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.15s',
  },
  langDot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  langName: { fontSize: 12 },
  langCaret: { fontSize: 8, color: '#6b6b9f' },
  langDropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
    background: '#111120', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: 6, minWidth: 150,
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    zIndex: 200, animation: 'slideUp 0.15s ease',
  },
  langOption: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 12px', borderRadius: 6, border: 'none', fontSize: 13,
    fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', transition: 'all 0.1s',
    textAlign: 'left',
  },
  checkmark: { marginLeft: 'auto', color: '#00e5ff', fontSize: 11 },

  actionBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
    background: 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,200,100,0.1))',
    border: '1px solid rgba(0,255,136,0.25)', borderRadius: 6,
    color: '#00ff88', fontSize: 12, fontFamily: 'JetBrains Mono, monospace',
    cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s',
  },
  backdrop: { position: 'fixed', inset: 0, zIndex: 150 },
};
