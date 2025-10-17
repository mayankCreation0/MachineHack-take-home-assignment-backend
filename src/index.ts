import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import { initializeDatabase } from './utils/database';
import submissionsRoutes from './routes/submissions';

// Load environment variables
dotenv.config();

const app = new Hono();

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'MachineHack Backend API'
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

const port = parseInt(process.env.PORT || '3001');

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    serve({
      fetch: app.fetch,
      port,
    });

    console.log(`🚀 Backend server running on http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`📁 API endpoints: http://localhost:${port}/api/*`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
