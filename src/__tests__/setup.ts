import { beforeAll, afterAll } from 'vitest';
import { initializeDatabase } from '../utils/database';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'sqlite:./test.db';
process.env.AI_MODE = 'fake';
process.env.GEMINI_API_KEY = 'test-key';

beforeAll(async () => {
  // Initialize test database
  await initializeDatabase();
});

afterAll(async () => {
  // Clean up test database if needed
  // This could include dropping test tables or cleaning up files
});
