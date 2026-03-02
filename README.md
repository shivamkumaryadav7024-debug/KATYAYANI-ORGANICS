# Task Management Portal

A full-stack Task Management Portal built with the MERN stack (MongoDB, Express/NestJS, React, Node.js).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript |
| UI | shadcn/ui, Tailwind CSS v4 |
| Backend | NestJS, TypeScript |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT stored in httpOnly cookies |
| Routing | React Router v7 |
| HTTP Client | Axios (`withCredentials: true`) |

---

## Project Structure

```
todo/
├── client/          # React + Vite frontend
├── server/          # NestJS backend
├── test-api.sh      # curl-based API test suite
└── README.md
```

---

## Setup & Run Instructions

### Prerequisites

- Node.js >= 18
- npm >= 9
- A running MongoDB instance (local or Atlas)

### 1. Clone the repo

```bash
git clone <repo-url> todo
cd todo
```

### 2. Configure server environment

Create `server/.env`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/taskmanager
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:5173
```

### 3. Configure client environment

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 5. Run in development

```bash
# Terminal 1 — Backend (port 3000)
cd server && npm run start:dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 6. Run the API test suite

With the server running:

```bash
./test-api.sh
```

All 16 tests should pass.

---

## API Design

> Manually designed — not AI generated.

**Base URL:** `http://localhost:3000/api`

**Authentication:** JWT stored in an `httpOnly` cookie (`access_token`). All protected routes require the cookie to be present.

### Auth Endpoints

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|-------------|----------|
| `POST` | `/auth/register` | No | `{ name, email, password }` | `{ user }` + sets cookie |
| `POST` | `/auth/login` | No | `{ email, password }` | `{ user }` + sets cookie |
| `POST` | `/auth/logout` | No | — | `{ message }` + clears cookie |

### Task Endpoints

| Method | Endpoint | Auth | Request Body / Query | Response |
|--------|----------|------|---------------------|----------|
| `GET` | `/tasks` | ✓ Cookie | `?status=pending\|completed` | `Task[]` |
| `POST` | `/tasks` | ✓ Cookie | `{ title, description? }` | `Task` |
| `PATCH` | `/tasks/:id` | ✓ Cookie | `{ title?, description?, status? }` | `Task` |
| `DELETE` | `/tasks/:id` | ✓ Cookie | — | `{ message }` |

### Task Schema

```typescript
{
  _id:         string       // MongoDB ObjectId
  title:       string       // required
  description: string       // optional, defaults to ""
  status:      "pending" | "completed"   // defaults to "pending"
  userId:      ObjectId     // reference to User, auto-set from JWT
  createdAt:   Date         // auto-generated (Mongoose timestamps)
  updatedAt:   Date         // auto-updated (Mongoose timestamps)
}
```

### Error Responses

```json
// 401 Unauthorized
{ "message": "Unauthorized", "statusCode": 401 }

// 409 Conflict
{ "message": "Email already in use", "error": "Conflict", "statusCode": 409 }

// 404 Not Found
{ "message": "Task not found", "error": "Not Found", "statusCode": 404 }

// 400 Validation Error
{ "message": ["title must be a string"], "error": "Bad Request", "statusCode": 400 }
```

---

## State Management

> Manually designed — not AI generated.

State management is implemented using **React Context + `useReducer`**, without any external library.

### Architecture

```
AuthProvider (context)
  └── useReducer(authReducer, initialState)
        ├── LOGIN  → stores user in localStorage, sets isAuthenticated: true
        └── LOGOUT → clears localStorage, sets isAuthenticated: false
```

### AuthState shape

```typescript
interface AuthState {
  user: { id: string; name: string; email: string } | null;
  isAuthenticated: boolean;
}
```

### How it works

1. **Initial state** is rehydrated from `localStorage` on app load (only non-sensitive user info — no token).
2. **JWT** lives exclusively in an `httpOnly` cookie — never in JS memory or `localStorage`.
3. On `LOGIN` action: user info saved to `localStorage`, `isAuthenticated` becomes `true`.
4. On `LOGOUT` action: `localStorage` cleared, `POST /auth/logout` called to clear the server-side cookie.
5. **`ProtectedRoute`** reads `isAuthenticated` from context — redirects to `/login` if `false`.
6. **Axios** is configured with `withCredentials: true` — the browser automatically sends the cookie on every request.

### Task state

Task fetching and mutations are isolated in a **`useTasks` custom hook** (`src/hooks/useTasks.ts`):

- Holds `tasks[]`, `loading`, and `filter` state locally
- Exposes `addTask`, `toggleStatus`, `removeTask` functions
- **Optimistic updates**: status toggle and delete update UI immediately, then revert on API failure

---

## AI Prompts Used

The following prompts were sent to GitHub Copilot (Claude Sonnet 4.6) during development:

1. *"Analyze the requirement in depth. Explain me in depth plan on how we will implement this project. Also divide this task into multiple phases."*

2. *"We will use shadcn for the frontend."*

3. *"Implement Phase 1"* — project scaffolding, Tailwind, shadcn, MongoDB connection, env files

4. *"Start Phase 2"* — NestJS Auth module (register/login/JWT), Task CRUD API

5. *"Write a script file testing all the routes using Curl"*

6. *"Start Phase 3"* — React auth pages, AuthContext, Axios service, ProtectedRoute, router

7. *"Implement Phase 4"* — Task UI: dashboard, AddTaskDialog, TaskCard, filter tabs, useTasks hook

8. *"Store JWT token in HTTPS Cookie"* — migrated from Bearer token to httpOnly cookie

---

## AI-Generated vs Manually Modified Code

### AI-Generated (via GitHub Copilot)

| File | Notes |
|------|-------|
| `server/src/auth/*` | Full auth module scaffold |
| `server/src/tasks/*` | Full tasks module scaffold |
| `server/src/users/user.schema.ts` | User schema |
| `server/src/main.ts` | NestJS bootstrap with CORS, cookie-parser, ValidationPipe |
| `client/src/context/AuthContext.tsx` | useReducer pattern, localStorage rehydration |
| `client/src/services/api.ts` | Axios instance with `withCredentials` |
| `client/src/hooks/useTasks.ts` | Optimistic update pattern |
| `client/src/pages/LoginPage.tsx` | shadcn form layout |
| `client/src/pages/RegisterPage.tsx` | shadcn form layout |
| `client/src/pages/DashboardPage.tsx` | Tabs, filter, skeleton loading |
| `client/src/components/TaskCard.tsx` | Badge, status toggle UI |
| `client/src/components/AddTaskDialog.tsx` | Dialog form |
| `test-api.sh` | Full curl test suite |

### Manually Written / Reviewed

| Item | Description |
|------|-------------|
| **API Design** | All endpoints, HTTP methods, request/response shapes decided manually (see API Design section above) |
| **State management architecture** | The decision to use `useReducer` + Context (no Redux), the `AuthState` shape, optimistic updates pattern — all designed manually |
| **Cookie security decisions** | `httpOnly`, `secure` in production, `sameSite: 'lax'`, 7-day expiry — manually decided |
| **`.env` configuration** | MongoDB URI, JWT secret, CLIENT_URL — manually configured |
| **Bug fix: `JwtModule.registerAsync`** | Identified and fixed the race condition where `process.env.JWT_SECRET` was read before `ConfigModule` loaded |
| **Bug fix: `findByIdAndUpdate`** | Identified Mongoose `Object.assign` + `save()` enum validation issue and switched to `findByIdAndUpdate` |
| **Code review of all AI output** | Every generated file was reviewed, tested, and adjusted where needed |
