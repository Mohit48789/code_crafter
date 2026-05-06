import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import LandingPage from './pages/LandingPage';
import EditorRoom from './pages/EditorRoom';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

export default function App() {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    s.on('connect', () => {
      setIsConnected(true);
      console.log('[Code Crafter] Connected:', s.id);
    });
    s.on('disconnect', () => setIsConnected(false));
    s.on('connect_error', (err) => console.warn('[Code Crafter] Connection error:', err.message));

    socketRef.current = s;
    setSocket(s);

    return () => s.disconnect();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage socket={socket} />} />
      <Route path="/room/:roomId" element={<EditorRoom socket={socket} isConnected={isConnected} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
