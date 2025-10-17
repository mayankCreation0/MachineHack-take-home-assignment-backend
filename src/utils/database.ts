// Simple in-memory database for now
interface Submission {
  id: number;
  username: string;
  score: number;
  feedback: string;
  file_name: string;
  file_size: number;
  created_at: string;
}

let submissions: Submission[] = [];
let nextId = 1;

export async function getDatabase() {
  return {
    async run(query: string, params: any[] = []) {
      // Simple mock implementation
      return { lastID: nextId++ };
    },
    async get(query: string, params: any[] = []) {
      // Simple mock implementation
      return submissions[0];
    },
    async all(query: string, params: any[] = []) {
      // Simple mock implementation
      return submissions;
    }
  };
}

// Initialize database schema
export async function initializeDatabase() {
  try {
    console.log('Database initialized successfully (in-memory)');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export { submissions };
