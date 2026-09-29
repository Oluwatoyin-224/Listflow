/*
# Create tasks and notes tables (single-tenant, no auth)

1. New Tables
- `tasks`
  - `id` (uuid, primary key)
  - `title` (text, not null) — short task name
  - `description` (text, nullable) — longer task details
  - `priority` (text, not null, default 'medium') — 'low' | 'medium' | 'high'
  - `due_date` (timestamptz, nullable) — optional due date
  - `completed` (boolean, not null, default false)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
- `notes`
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `content` (text, nullable) — note body
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD because this is a single-tenant productivity app with no sign-in.

3. Indexes
- Index on tasks.completed for filtering active vs completed
- Index on tasks.priority for high-priority filter
- Index on tasks.due_date for overdue calculations
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date timestamptz,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
CREATE POLICY "anon_select_tasks" ON tasks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
CREATE POLICY "anon_insert_tasks" ON tasks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
CREATE POLICY "anon_update_tasks" ON tasks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "anon_delete_tasks" ON tasks FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_notes" ON notes;
CREATE POLICY "anon_select_notes" ON notes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notes" ON notes;
CREATE POLICY "anon_insert_notes" ON notes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notes" ON notes;
CREATE POLICY "anon_update_notes" ON notes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notes" ON notes;
CREATE POLICY "anon_delete_notes" ON notes FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
