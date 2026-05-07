const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Code Crafter Server is running!",
    endpoints: {
      health: "/health",
      rooms: "/api/rooms",
      createRoom: "POST /api/rooms"
    },
    websocket: "ws://localhost or wss:// for secure connection"
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// In-memory store
const rooms = new Map(); // roomId -> { code, language, users, history }
const userColors = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98FB98", "#F0E68C", "#87CEEB", "#FFB347",
];

function getRoomData(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      code: "// Start coding here...\n// This is a real-time collaborative editor\n// Multiple users can edit simultaneously!\n",
      language: "javascript",
      users: new Map(),
      cursors: new Map(),
      history: [],
      createdAt: Date.now(),
    });
  }
  return rooms.get(roomId);
}

function getUserColor(roomId, userId) {
  const room = getRoomData(roomId);
  let index = 0;
  let i = 0;
  for (const uid of room.users.keys()) {
    if (uid === userId) { index = i; break; }
    i++;
  }
  return userColors[index % userColors.length];
}

// REST API
app.get("/api/rooms/:roomId", (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  if (!room) return res.json({ exists: false });
  res.json({
    exists: true,
    language: room.language,
    userCount: room.users.size,
    createdAt: room.createdAt,
  });
});

app.post("/api/rooms", (req, res) => {
  const roomId = uuidv4().split("-")[0].toUpperCase();
  getRoomData(roomId);
  res.json({ roomId });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Socket.io
io.on("connection", (socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    socket.currentRoom = roomId;
    socket.username = username || `User_${socket.id.slice(0, 4)}`;

    const room = getRoomData(roomId);
    const color = userColors[room.users.size % userColors.length];

    room.users.set(socket.id, {
      id: socket.id,
      username: socket.username,
      color,
      joinedAt: Date.now(),
    });

    // Send current state to new user
    socket.emit("room-state", {
      code: room.code,
      language: room.language,
      users: Array.from(room.users.values()),
    });

    // Notify others
    socket.to(roomId).emit("user-joined", {
      user: room.users.get(socket.id),
      users: Array.from(room.users.values()),
    });

    console.log(`[ROOM ${roomId}] ${socket.username} joined (${room.users.size} users)`);
  });

  socket.on("code-change", ({ roomId, code, delta }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.code = code;
    room.history.push({ userId: socket.id, delta, timestamp: Date.now() });
    if (room.history.length > 100) room.history.shift();

    socket.to(roomId).emit("code-update", { code, userId: socket.id });
  });

  socket.on("language-change", ({ roomId, language }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.language = language;
    io.to(roomId).emit("language-update", { language, userId: socket.id });
  });

  socket.on("cursor-move", ({ roomId, cursor }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const user = room.users.get(socket.id);
    if (!user) return;
    socket.to(roomId).emit("cursor-update", {
      userId: socket.id,
      username: user.username,
      color: user.color,
      cursor,
    });
  });

  socket.on("send-message", ({ roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const user = room.users.get(socket.id);
    if (!user) return;
    const msg = {
      id: uuidv4(),
      userId: socket.id,
      username: user.username,
      color: user.color,
      message,
      timestamp: Date.now(),
    };
    io.to(roomId).emit("receive-message", msg);
  });

  socket.on("typing", ({ roomId, isTyping }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const user = room.users.get(socket.id);
    if (!user) return;
    socket.to(roomId).emit("user-typing", {
      userId: socket.id,
      username: user.username,
      color: user.color,
      isTyping,
    });
  });

  socket.on("disconnect", () => {
    const roomId = socket.currentRoom;
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;
    room.users.delete(socket.id);
    io.to(roomId).emit("user-left", {
      userId: socket.id,
      users: Array.from(room.users.values()),
    });
    console.log(`[-] ${socket.username} left room ${roomId} (${room.users.size} remaining)`);
    if (room.users.size === 0) {
      // Keep room alive for 1hr after last user leaves
      setTimeout(() => {
        if (rooms.has(roomId) && rooms.get(roomId).users.size === 0) {
          rooms.delete(roomId);
          console.log(`[CLEANUP] Room ${roomId} deleted`);
        }
      }, 3600000);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Code Crafter Server running on port ${PORT}`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log(`   REST API:  http://localhost:${PORT}/api\n`);
});