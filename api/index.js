const { Hono } = require('hono');
const { cors } = require('hono/cors');
const dotenv = require('dotenv');

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

// Import and mount submission routes
const submissionsRoutes = require('../src/routes/submissions');
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
      const { initializeDatabase } = require('../src/utils/database');
      await initializeDatabase();
      dbInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
};

// Vercel serverless function handler
module.exports = async function handler(req) {
  // Initialize database on first request
  await initDB();
  
  return app.fetch(req);
};
