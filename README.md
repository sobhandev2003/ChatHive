# 💬 Realtime Chat Application

A **modern full-stack real-time chat platform** built with **Node.js**, **Express**, **WebSockets**, **MongoDB**, and **React**.  
It provides **secure user authentication**, **instant one-to-one messaging**, and **offline message delivery** — similar to WhatsApp Web.

---

## 🏗️ Project Overview

This application combines REST APIs with WebSocket connections for real-time communication.  
It supports **user authentication**, **live messaging**, **read receipts**, and **typing indicators** while maintaining message persistence in MongoDB.

---

## 🚀 Features

### 🔐 Authentication
- Signup and Login using **JWT** and **bcrypt**.
- Protected routes via middleware.
- Token-based WebSocket authentication.

### 💬 Realtime Chat
- **One-to-one** instant messaging.
- **Typing**, **delivered**, and **read** indicators.
- **Offline delivery**: messages are stored and delivered when the recipient reconnects.
- Multi-device connection support (same user connected on multiple sockets).

### 📦 Persistent Storage
- MongoDB for user and message data.
- Indexed schema for efficient query performance.

### 🧠 Smart Search
- Search users by **name** or **email**.
- Recent contacts list with **last message preview**.

### 🖼️ Profile & Uploads
- Upload avatars and media files.
- Auto-generated avatar fallback for new users.

### 🎨 Modern UI
- Built with **React + Tailwind CSS** (Dark theme).
- WhatsApp-style responsive chat interface.
- Message bubbles, smooth scrolling, and online status indicators.

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React, Redux, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Realtime | WebSocket (`ws` library) |
| Auth | JWT, bcrypt |
| Security | Helmet, CORS |
| Deployment | Render / Vercel / MongoDB Atlas |

---

## 📂 Folder Structure

ChatHive/
│
├── CLIENT/
│   │
│   ├── node_modules/
│   ├── public/
│   │
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Chat.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── messageService.js
│   │   │   └── socketService.js
│   │   │
│   │   ├── store/
│   │   │   ├── authSlice.js
│   │   │   ├── chatSlice.js
│   │   │   └── index.js
│   │   │
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── vite.config.js
│
├── SERVER/
│   │
│   ├── node_modules/
│   │
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   │
│   │   ├── models/
│   │   │   ├── Message.js
│   │   │   └── User.js
│   │   │
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── messages.js
│   │       ├── upload.js
│   │       └── index.js
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   ├── PLANING.MD
│   └── README.md
│
└── README.md

---

## ⚙️ Backend Details

### 🧱 `index.js`
Main server file that:
- Connects to MongoDB.
- Sets up Express API routes.
- Launches WebSocket server for real-time communication.
- Manages `userSockets` (mapping each connected user to their sockets).
- Handles:
  - **`direct_message`** → Send/receive text or media.
  - **`typing`** → Notify recipient when user is typing.
  - **`read`** → Update read receipts.
  - **`ping/pong`** → Keep-alive heartbeat.

---

### 🔑 `auth.js`
Handles signup, login, and user session management.

**Endpoints**
| Method | Route | Description |
|--------|--------|-------------|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Authenticate and return JWT |
| GET | `/auth/logout` | Clear token cookie |
| GET | `/auth` | Get logged-in user details |
| GET | `/auth/search?q=` | Search users by name/email |
| GET | `/auth/connect` | Returns WebSocket connection URL |


