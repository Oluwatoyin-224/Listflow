# Listflow — Full-Stack To-Do & Productivity App

A modern, full-stack productivity application built for the HNG Internship task. Manage tasks with priorities and due dates, take notes, and track your productivity with a dashboard.

## Features

### Task Management
- Create, edit, delete, and complete tasks
- Task title, description, priority (Low / Medium / High), and due date
- Search tasks by title or description
- Filter by All / Active / Completed / High Priority
- Sort by created date, due date, priority, or title
- Visual overdue indicators

### Notes
- Create, edit, delete, view, and search notes
- Grid layout with content preview

### Productivity Dashboard
- Total, completed, active, high-priority, and overdue task counts
- Completion percentage with animated progress ring

### UI/UX
- Clean, modern, responsive design (mobile-first)
- Responsive sidebar navigation
- Loading, empty, error, and success states
- Toast notifications for all actions
- Accessible forms with labels and ARIA attributes
- Smooth animations and micro-interactions
- No horizontal scrolling on any device size

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite + Prisma ORM |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library |
| Data (hosted) | Supabase (PostgreSQL) |

## Project Structure

```
listflow/
├── src/                        # Frontend source
│   ├── components/             # React components
│   │   ├── Layout.tsx          # Sidebar nav + layout shell
│   │   ├── Dashboard.tsx       # Productivity dashboard
│   │   ├── TasksView.tsx       # Task list with search/filter/sort
│   │   ├── TaskForm.tsx        # Create/edit task modal
│   │   ├── NotesView.tsx       # Notes grid with search
│   │   └── NoteForm.tsx        # Create/edit note modal
│   ├── context/                # React context providers
│   │   └── ToastContext.tsx    # Toast notification system
│   ├── lib/                    # API client + Supabase setup
│   │   ├── api.ts              # CRUD functions (Supabase or REST)
│   │   └── supabase.ts         # Supabase client singleton
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts
│   ├── test/                   # Frontend tests
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind + custom styles
├── server/                     # Backend source
│   ├── src/
│   │   ├── routes/             # Express route handlers
│   │   │   ├── tasks.ts        # Task CRUD endpoints
│   │   │   ├── notes.ts        # Note CRUD endpoints
│   │   │   └── dashboard.ts    # Dashboard stats endpoint
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── validation.ts       # Zod validation schemas
│   │   ├── index.ts            # Express app entry
│   │   └── test/               # Backend tests
│   ├── prisma/
│   │   └── schema.prisma       # Prisma schema (Task, Note models)
│   ├── package.json
│   └── tsconfig.json
├── index.html
├── package.json                # Frontend dependencies
├── vite.config.ts
├── vitest.config.ts            # Frontend test config
├── tailwind.config.js
├── .env.example
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+
- npm

### Frontend Setup
```bash
npm install
npm run dev
```
The frontend runs on `http://localhost:5173`.

### Backend Setup
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev
```
The backend runs on `http://localhost:3001`.

### Environment Variables
Copy `.env.example` to `.env` and fill in the values:
```bash
cp .env.example .env
```

The frontend works in two modes:
1. **Supabase mode** (default): Uses the Supabase client directly. Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. **REST API mode**: Uses the Express backend. Set `VITE_API_URL` to point to the backend URL.

## Development

### Frontend
```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run typecheck # Type-check with tsc
npm run lint      # Run ESLint
npm run test      # Run frontend tests
```

### Backend
```bash
cd server
npm run dev       # Start dev server with hot reload
npm run build     # Compile TypeScript
npm start         # Run compiled server
npm run test      # Run backend tests
npm run db:push   # Push schema changes to SQLite
```

## Testing

### Frontend Tests
Tests use Vitest + React Testing Library and cover:
- Task rendering and empty states
- Task creation, completion toggle, deletion
- Task search filtering
- Note rendering and CRUD operations
- Note search filtering

```bash
npm run test
```

### Backend Tests
Tests use Vitest + Supertest and cover:
- Task API: create, read, update, delete with validation
- Note API: create, read, update, delete with validation
- Dashboard stats calculation
- Input validation (missing title, invalid priority)
- HTTP status codes (200, 201, 204, 400, 404)
- Health check endpoint

```bash
cd server
npm run test
```

## API Endpoints

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/:id` | Get a single task |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | List all notes |
| GET | `/api/notes/:id` | Get a single note |
| POST | `/api/notes` | Create a note |
| PUT | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get productivity stats |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

## Deployment

### Frontend (Vercel)
1. Push the repository to GitHub
2. Import the project in Vercel
3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (for Supabase mode)
   - Or `VITE_API_URL` pointing to the deployed backend URL
4. Deploy — Vercel auto-detects Vite

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the root directory to `server/`
4. Build command: `npm install && npx prisma generate && npx prisma db push && npm run build`
5. Start command: `npm start`
6. Set environment variables:
   - `DATABASE_URL` — Render disk path for SQLite
   - `PORT` — Render assigns this
   - `NODE_ENV` — `production`

## License
MIT
