# TaskFlow — Task Manager Application

A production-ready full-stack Task Management application built with **Node.js + Express**, **MongoDB**, and **React**.

---

## Live URLs

| Service | URL |
|--------|-----|
| Frontend | `https://your-` |
| Backend API | `https://your-` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Frontend | React.js, Vite, Tailwind CSS |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (HTTP-only cookies) |
| Encryption | AES-256-CBC (Node.js crypto) |
| Validation | Zod |
| Deployment | Render (backend), render (frontend) |

---

## Architecture Overview

```
task-manager/
├── backend/                         # Express REST API
│   ├── server.js                    # Entry point, middleware setup
│   └── src/
│       ├── config/db.js             # MongoDB connection
│       ├── models/
│       │   ├── User.model.js        # User schema (bcrypt hashing)
│       │   └── Task.model.js        # Task schema (AES encryption)
│       ├── controllers/
│       │   ├── auth.controller.js   # Register, Login, Logout, GetMe
│       │   └── task.controller.js   # CRUD + pagination + filter + search
│       ├── routes/
│       │   ├── user.router.js       # /api/v1/users
│       │   └── task.router.js       # /api/v1/tasks
│       ├── middleware/
│       │   ├── authMiddleware.js    # JWT cookie verification
│       │   └── errorHandler.js      # Global error handler
│       └── utils/
│           ├── jwt.js               # Sign token, send cookie
│           ├── encryption.js        # AES-256-CBC encrypt/decrypt
│           └── validators.js        # Zod schemas + validate middleware
│

```

---

## Security Implementation

| Feature | Implementation |
|--------|---------------|
| Password hashing | bcryptjs with salt rounds 12 |
| JWT storage | HTTP-only cookie (not localStorage) |
| XSS protection | httpOnly cookie + helmet.js headers |
| CSRF protection | sameSite: "lax" cookie flag |
| NoSQL injection | Mongoose ODM + Zod input sanitization |
| Input validation | Zod schemas on every route |
| Rate limiting | 100 requests / 15 min per IP |
| Sensitive data encryption | AES-256-CBC on task description field |
| Authorization | Every task query scoped to `req.user._id` |
| Secure headers | helmet() middleware |

---

## Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/task-manager.git
cd task-manager
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskmanager
JWT_SECRET=your_super_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your_32_character_encryption_key_here
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev   # starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Fill in `.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

```bash
npm run dev   # starts on http://localhost:5173
```

---

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Auth Routes `/api/v1/users`

---

#### POST `/users/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created successfully!",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error `409`:**
```json
{
  "success": false,
  "message": "Email already registered."
}
```

---

#### POST `/users/login`
Login and receive JWT cookie.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `200`** *(sets HTTP-only `token` cookie)*:
```json
{
  "success": true,
  "message": "Logged in successfully!",
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error `401`:**
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

---

#### POST `/users/logout`
Clear the auth cookie.

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

---

#### GET `/users/me` 🔒
Get current logged-in user. Requires auth cookie.

**Response `200`:**
```json
{
  "success": true,
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### Task Routes `/api/v1/tasks` 🔒
> All task routes require authentication (JWT cookie)

---

#### GET `/tasks`
Get all tasks with pagination, filter, and search.

**Query Parameters:**

| Param | Type | Description | Default |
|-------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Tasks per page (max 50) | 9 |
| `status` | string | Filter: `todo`, `in-progress`, `done` | all |
| `search` | string | Search by title (case-insensitive) | — |

**Example:**
```
GET /tasks?page=1&limit=9&status=todo&search=meeting
```

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "title": "Team meeting notes",
      "description": "Discuss Q4 roadmap",
      "status": "todo",
      "user": "64f1a2b3c4d5e6f7a8b9c0d1",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 9,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### POST `/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "todo"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "todo",
    "user": "64f1a2b3c4d5e6f7a8b9c0d1",
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

#### PUT `/tasks/:id`
Update an existing task.

**Request Body** *(all fields optional)*:
```json
{
  "title": "Buy groceries and fruits",
  "status": "in-progress"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Task updated successfully.",
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
    "title": "Buy groceries and fruits",
    "description": "Milk, eggs, bread",
    "status": "in-progress",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Error `404`:**
```json
{
  "success": false,
  "message": "Task not found."
}
```

---

#### DELETE `/tasks/:id`
Delete a task.

**Response `200`:**
```json
{
  "success": true,
  "message": "Task deleted successfully."
}
```

---

### Common Error Responses

| Status | Meaning |
|--------|---------|
| `400` | Validation failed — check `errors` array |
| `401` | Not authenticated or token expired |
| `404` | Resource not found |
| `409` | Conflict (e.g. email already exists) |
| `429` | Too many requests (rate limited) |
| `500` | Internal server error |

**Validation Error Example `400`:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

---









## Features

- User registration and login with JWT authentication
- Passwords hashed with bcrypt (salt rounds: 12)
- JWT stored in HTTP-only cookie (XSS safe)
- Task description encrypted with AES-256-CBC in database
- Full CRUD for tasks
- Pagination, filter by status, search by title
- Protected frontend routes
- Rate limiting (100 req / 15 min)
- Global error handling with proper HTTP status codes
