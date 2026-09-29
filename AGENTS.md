# AGENTS.md — Listflow Project Guide

## Project Overview

Listflow is a full-stack productivity application for managing tasks and notes. It features a dashboard with productivity stats, full CRUD for tasks (with priority, due dates, search, filter, sort) and notes (with search), toast notifications, and a responsive mobile-first design.

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Lucide React
- **Backend:** Node.js + Express + TypeScript + Zod validation
- **Database:** SQLite + Prisma ORM (backend), Supabase/PostgreSQL (hosted frontend)
- **Testing:** Vitest + React Testing Library (frontend), Vitest + Supertest (backend)

## Project Structure

```
src/                         # Frontend
├── components/              # UI components (Layout, Dashboard, TasksView, NotesView, forms)
├── context/ToastContext.tsx # Toast notification provider
├── lib/api.ts              # API client — auto-switches between Supabase and REST
├── lib/supabase.ts         # Supabase client
├── types/index.ts          # Shared TypeScript types
├── test/                   # Frontend tests (TasksView, NotesView)
└── App.tsx                 # Root with view routing

server/                      # Backend
├── src/
│   ├── routes/             # Express routers (tasks, notes, dashboard)
│   ├── prisma.ts           # Prisma client
│   ├── validation.ts       # Zod schemas for input validation
│   ├── index.ts            # Express app + server
│   └── test/               # API tests
├── prisma/schema.prisma    # Prisma schema (Task, Note models)
└── package.json
```

## Setup Instructions

### Frontend
```bash
npm install
npm run dev          # http://localhost:5173
```

### Backend
```bash
cd server
npm install
npx prisma generate
npx prisma db push   # Creates SQLite database
npm run dev          # http://localhost:3001
```

### Environment
Copy `.env.example` to `.env`. The frontend supports two data modes:
- **Supabase** (default): Set `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- **REST API**: Set `VITE_API_URL` to the backend URL (overrides Supabase)

## Development Commands

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |
| `npm run test` | Run Vitest tests |

### Backend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload (tsx watch) |
| `npm run build` | Compile to dist/ |
| `npm start` | Run compiled server |
| `npm run test` | Run API tests |
| `npm run db:push` | Sync Prisma schema to SQLite |

## Testing Instructions

### Frontend Tests
Located in `src/test/`. Tests mock the API layer and verify:
- Component rendering and empty states
- Task CRUD: create, toggle complete, delete with confirmation
- Note CRUD: create, delete with confirmation
- Search filtering for both tasks and notes

```bash
npm run test
```

### Backend Tests
Located in `server/src/test/`. Tests use a fresh SQLite database per run:
- POST/GET/PUT/DELETE for tasks and notes
- Input validation (missing title, invalid priority)
- Correct HTTP status codes (200, 201, 204, 400, 404)
- Dashboard stats accuracy
- Health check endpoint

```bash
cd server && npm run test
```

## API Endpoints

### Tasks
- `GET    /api/tasks`       — List all tasks
- `GET    /api/tasks/:id`   — Get one task
- `POST   /api/tasks`       — Create (title required, priority optional)
- `PUT    /api/tasks/:id`   — Update any field
- `DELETE /api/tasks/:id`   — Delete (returns 204)

### Notes
- `GET    /api/notes`       — List all notes
- `GET    /api/notes/:id`   — Get one note
- `POST   /api/notes`       — Create (title required)
- `PUT    /api/notes/:id`   — Update any field
- `DELETE /api/notes/:id`   — Delete (returns 204)

### Dashboard
- `GET    /api/dashboard`   — Stats: total, completed, active, highPriority, overdue, completionRate

## Architecture Notes

### Data Layer Dual Mode
The frontend `src/lib/api.ts` checks for `VITE_API_URL`. If set, all CRUD operations go through the Express REST API. If not set, they use the Supabase JS client directly. This allows the app to work both as a standalone frontend (Supabase) and as a full-stack app (Express + SQLite).

### Validation
Backend uses Zod schemas (`server/src/validation.ts`) to validate all request bodies. Invalid input returns HTTP 400 with a descriptive error message. Non-existent resources return 404.

### RLS (Supabase)
The Supabase database has RLS enabled with `anon, authenticated` policies allowing public CRUD — this is a single-tenant app with no authentication.

## Deployment

### Frontend → Vercel
1. Import the GitHub repo in Vercel
2. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (or `VITE_API_URL`)
3. Vercel auto-detects Vite and builds

### Backend → Render
1. Create a Web Service, set root to `server/`
2. Build: `npm install && npx prisma generate && npx prisma db push && npm run build`
3. Start: `npm start`
4. Set `DATABASE_URL` to a persistent disk path
