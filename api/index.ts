import { Hono } from 'hono';
import { cors } from 'hono/cors';
import dotenv from 'dotenv';
import { initializeDatabase } from '../src/utils/database';
import submissionsRoutes from '../src/routes/submissions';

// Load environment variables
dotenv.config();

const app = new Hono();

// Configure CORS for Vercel
app.use('*', cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'MachineHack Backend API',
    environment: process.env.NODE_ENV || 'production'
  });
});

// Mount submission routes
app.route('/api', submissionsRoutes);

// Global error handler
app.onError((err, c) => {
  console.error('Global error:', err);
  return c.json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not found',
    message: 'The requested resource was not found'
  }, 404);
});

// Initialize database on cold start
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
};

// Vercel serverless function handler
export default async function handler(req: Request) {
  // Initialize database on first request
  await initDB();
  
  return app.fetch(req);
}
