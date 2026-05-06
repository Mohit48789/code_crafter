import { useState, useEffect, useCallback, useRef } from 'react';

export function useCollabEditor(socket, roomId) {
  const [code, setCode] = useState('// Loading...');
  const [language, setLanguage] = useState('javascript');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [cursors, setCursors] = useState({});
  const [isReady, setIsReady] = useState(false);
  const suppressUpdateRef = useRef(false);
  const typingTimeoutRef = useRef({});

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.on('room-state', ({ code: c, language: l, users: u }) => {
      setCode(c);
      setLanguage(l);
      setUsers(u);
      setIsReady(true);
    });

    socket.on('code-update', ({ code: c, userId }) => {
      if (userId !== socket.id) {
        suppressUpdateRef.current = true;
        setCode(c);
        setTimeout(() => { suppressUpdateRef.current = false; }, 50);
      }
    });

    socket.on('language-update', ({ language: l }) => setLanguage(l));

    socket.on('user-joined', ({ users: u }) => setUsers(u));
    socket.on('user-left', ({ users: u }) => setUsers(u));

    socket.on('receive-message', (msg) => {
      setMessages(prev => [...prev.slice(-99), msg]);
    });

    socket.on('user-typing', ({ userId, username, color, isTyping }) => {
      setTypingUsers(prev => {
        if (!isTyping) {
          const next = { ...prev };
          delete next[userId];
          return next;
        }
        return { ...prev, [userId]: { username, color } };
      });

      if (isTyping) {
        clearTimeout(typingTimeoutRef.current[userId]);
        typingTimeoutRef.current[userId] = setTimeout(() => {
          setTypingUsers(prev => {
            const next = { ...prev };
            delete next[userId];
            return next;
          });
        }, 3000);
      }
    });

    socket.on('cursor-update', ({ userId, username, color, cursor }) => {
      setCursors(prev => ({ ...prev, [userId]: { username, color, cursor } }));
    });

    return () => {
      socket.off('room-state');
      socket.off('code-update');
      socket.off('language-update');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('receive-message');
      socket.off('user-typing');
      socket.off('cursor-update');
    };
  }, [socket, roomId]);

  const emitCodeChange = useCallback((newCode) => {
    if (!suppressUpdateRef.current && socket && roomId) {
      socket.emit('code-change', { roomId, code: newCode });
    }
    setCode(newCode);
  }, [socket, roomId]);

  const emitLanguageChange = useCallback((lang) => {
    if (socket && roomId) {
      socket.emit('language-change', { roomId, language: lang });
    }
    setLanguage(lang);
  }, [socket, roomId]);

  const emitMessage = useCallback((message) => {
    if (socket && roomId && message.trim()) {
      socket.emit('send-message', { roomId, message });
    }
  }, [socket, roomId]);

  const emitTyping = useCallback((isTyping) => {
    if (socket && roomId) {
      socket.emit('typing', { roomId, isTyping });
    }
  }, [socket, roomId]);

  const emitCursor = useCallback((cursor) => {
    if (socket && roomId) {
      socket.emit('cursor-move', { roomId, cursor });
    }
  }, [socket, roomId]);

  return {
    code, language, users, messages, typingUsers, cursors, isReady,
    emitCodeChange, emitLanguageChange, emitMessage, emitTyping, emitCursor,
  };
}
