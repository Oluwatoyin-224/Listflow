import { execSync } from 'child_process';
import { mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const testDbDir = join(process.cwd(), 'prisma', 'test-db');
const testDbPath = join(testDbDir, 'test.db');

// Set test DATABASE_URL before importing anything that touches Prisma
process.env.DATABASE_URL = `file:${testDbPath}`;
process.env.NODE_ENV = 'test';

// Recreate the test database from scratch each run
rmSync(testDbDir, { recursive: true, force: true });
mkdirSync(testDbDir, { recursive: true });

execSync('npx prisma db push --force-reset --skip-generate', {
  stdio: 'pipe',
  env: { ...process.env },
});
