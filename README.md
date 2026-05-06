# CollabCode 🚀

> A full-stack real-time collaborative code editor — like VS Code Live Share, but in the browser.

![CollabCode Banner](https://img.shields.io/badge/CollabCode-Real--Time%20Editor-00e5ff?style=for-the-badge&labelColor=040407)
![Socket.io](https://img.shields.io/badge/Socket.io-4.x-white?style=for-the-badge&logo=socket.io&labelColor=040407)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&labelColor=040407)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&labelColor=040407)

---

## Features

- **Real-time code sync** — Changes appear on all clients instantly via Socket.io
- **Multi-user cursors** — See where collaborators are editing (color-coded)
- **Live chat** — Built-in messaging with typing indicators
- **10+ languages** — JavaScript, TypeScript, Python, HTML, CSS, JSON, Java, Rust, C++, SQL
- **Syntax highlighting** — Powered by CodeMirror 6 with custom dark theme
- **Room system** — Create or join rooms with unique IDs
- **User presence** — See who's online with real-time join/leave notifications
- **No accounts needed** — Just enter a name and go

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6 |
| Code Editor | CodeMirror 6 |
| WebSockets | Socket.io Client |
| Backend | Node.js + Express |
| Real-time | Socket.io Server |
| Styling | Custom CSS-in-JS with CSS variables |

---

## Project Structure

```
collabcode/
├── server/
│   ├── index.js          # Express + Socket.io server
│   └── package.json
│
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js                    # Root + routing
│       ├── index.js                  # React entry
│       ├── index.css                 # Global styles + CSS vars
│       ├── components/
│       │   ├── CodeEditor.js         # CodeMirror 6 wrapper
│       │   ├── Toolbar.js            # Top bar: room info, language, actions
│       │   ├── UserList.js           # Online users panel
│       │   └── ChatPanel.js          # Real-time chat
│       ├── pages/
│       │   ├── LandingPage.js        # Home: create/join rooms
│       │   └── EditorRoom.js         # Main editor layout
│       ├── hooks/
│       │   └── useCollabEditor.js    # Socket event management hook
│       ├── context/
│       │   └── SocketContext.js      # Socket.io React context
│       └── utils/
│           └── languages.js          # Language configs + CodeMirror extensions
│
├── package.json          # Root scripts
├── setup.sh              # One-command setup
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### 1. Setup

```bash
# Clone / navigate to project
cd collabcode

# Install all dependencies
chmod +x setup.sh && ./setup.sh

# OR manually:
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 2. Start the Server

```bash
cd server
npm run dev      # With auto-reload (nodemon)
# OR
npm start        # Production
```

Server runs on **http://localhost:3001**

### 3. Start the Client

```bash
cd client
npm start
```

Client runs on **http://localhost:3000**

### 4. Collaborate!

1. Open http://localhost:3000
2. Enter your name → Create a Room
3. Copy the room link → share with collaborators
4. Code together in real time!

---

## Socket.io Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{ roomId, username }` | Join or create a room |
| `code-change` | `{ roomId, code }` | Broadcast code update |
| `language-change` | `{ roomId, language }` | Change editor language |
| `cursor-move` | `{ roomId, cursor }` | Broadcast cursor position |
| `send-message` | `{ roomId, message }` | Send chat message |
| `typing` | `{ roomId, isTyping }` | Typing indicator |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `room-state` | `{ code, language, users }` | Full state on join |
| `code-update` | `{ code, userId }` | Incoming code change |
| `language-update` | `{ language, userId }` | Language changed |
| `cursor-update` | `{ userId, username, color, cursor }` | Remote cursor |
| `user-joined` | `{ user, users }` | Someone joined |
| `user-left` | `{ userId, users }` | Someone left |
| `receive-message` | `{ id, userId, username, color, message, timestamp }` | Chat message |
| `user-typing` | `{ userId, username, color, isTyping }` | Typing indicator |

---

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/rooms` | Create a new room → `{ roomId }` |
| `GET` | `/api/rooms/:roomId` | Room info → `{ exists, language, userCount }` |
| `GET` | `/health` | Health check → `{ status: "ok" }` |

---

## Environment Variables

### Server
```env
PORT=3001
```

### Client
Create `client/.env`:
```env
REACT_APP_SERVER_URL=http://localhost:3001
```

---

## Deployment

### Deploy Server (e.g. Railway, Render, Fly.io)
```bash
cd server
# Set PORT env var on your platform
npm start
```

### Deploy Client (e.g. Vercel, Netlify)
```bash
cd client
REACT_APP_SERVER_URL=https://your-server.railway.app npm run build
# Deploy the build/ folder
```

---

## Extending CollabCode

Ideas for further development:

- **Operational Transformation (OT)** — For true conflict-free merging (see `ot.js` or `ShareDB`)
- **Code execution** — Connect to a sandboxed executor (e.g. Judge0, Piston API)
- **Persistent rooms** — Add PostgreSQL/MongoDB to persist code history
- **Auth** — Add JWT-based user accounts
- **File trees** — Multi-file support
- **Video/voice** — Integrate WebRTC for audio/video
- **Themes** — Multiple editor themes (Dracula, Nord, Monokai)

---

## License

MIT — build anything with it!

---

Made with ❤️ using React + Socket.io + CodeMirror 6
