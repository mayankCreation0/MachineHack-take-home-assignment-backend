const { Hono } = require('hono');
const { cors } = require('hono/cors');
const dotenv = require('dotenv');
const { z } = require('zod');

// Load environment variables
dotenv.config();

const app = new Hono();

// Configure CORS for Vercel
app.use('*', cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Simple in-memory database for Vercel
let submissions = [];
let nextId = 1;

// Mock database functions
const getDatabase = () => {
  return {
    async run(query, params = []) {
      const id = nextId++;
      submissions.push({
        id,
        username: params[0] || 'unknown',
        score: params[1] || 0,
        feedback: params[2] || 'No feedback',
        file_name: params[3] || 'unknown.csv',
        file_size: params[4] || 0,
        created_at: new Date().toISOString()
      });
      return { lastID: id };
    },
    async get(query, params = []) {
      return submissions.find(s => s.id === parseInt(params[0])) || null;
    },
    async all(query, params = []) {
      return submissions.sort((a, b) => b.score - a.score).slice(0, 10);
    }
  };
};

// Mock AI Service
class AIService {
  constructor() {
    this.mode = process.env.AI_MODE || 'fake';
  }

  async generateFeedback(score, accuracy, f1Score) {
    if (this.mode === 'fake') {
      if (score >= 0.9) return 'Excellent work! Your model shows outstanding performance with high accuracy and precision.';
      if (score >= 0.8) return 'Great job! Your model demonstrates strong performance with good accuracy and reliability.';
      if (score >= 0.7) return 'Good work! Your model shows solid performance with room for improvement.';
      if (score >= 0.6) return 'Decent attempt! Consider tuning your model parameters for better results.';
      return 'Keep trying! Your model needs more work to achieve better performance.';
    }
    
    // Real AI implementation would go here
    return 'AI feedback not available in production mode.';
  }
}

// Mock Scoring Service
class ScoringService {
  validateIrisData(data) {
    const requiredColumns = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'];
    
    if (!Array.isArray(data) || data.length === 0) {
      return { isValid: false, errors: ['No data provided'] };
    }

    const columns = Object.keys(data[0]);
    const missingColumns = requiredColumns.filter(col => !columns.includes(col));
    
    if (missingColumns.length > 0) {
      return { isValid: false, errors: [`Missing required columns: ${missingColumns.join(', ')}`] };
    }

    // Check for numeric values
    for (const row of data) {
      for (const col of requiredColumns) {
        if (isNaN(parseFloat(row[col]))) {
          return { isValid: false, errors: [`Column ${col} contains non-numeric values`] };
        }
        if (parseFloat(row[col]) < 0) {
          return { isValid: false, errors: [`Column ${col} contains negative values`] };
        }
      }
    }

    return { isValid: true, errors: [] };
  }

  async scoreSubmission(csvData, username) {
    try {
      // Parse CSV data
      const lines = csvData.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = parseFloat(values[index]) || 0;
        });
        return row;
      });

      // Validate data
      const validation = this.validateIrisData(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Mock scoring (in real implementation, this would use actual ML models)
      const mockScore = Math.random() * 0.4 + 0.6; // Random score between 0.6 and 1.0
      const accuracy = mockScore + (Math.random() - 0.5) * 0.1;
      const f1Score = mockScore + (Math.random() - 0.5) * 0.1;

      return {
        score: Math.max(0, Math.min(1, mockScore)),
        accuracy: Math.max(0, Math.min(1, accuracy)),
        f1_score: Math.max(0, Math.min(1, f1Score))
      };
    } catch (error) {
      throw new Error(`Scoring failed: ${error.message}`);
    }
  }
}

// Initialize services
const scoringService = new ScoringService();
const aiService = new AIService();

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

// POST /api/submissions - Upload and score a file
app.post('/api/submissions', async (c) => {
  try {
    const formData = await c.req.parseBody();
    const username = formData.username;
    const file = formData.file;

    if (!username || !file) {
      return c.json({
        success: false,
        error: 'Missing username or file'
      }, 400);
    }

    // Read file content
    const csvContent = await file.text();
    
    // Score the submission
    const scoringResult = await scoringService.scoreSubmission(csvContent, username);
    
    // Generate AI feedback
    const feedback = await aiService.generateFeedback(
      scoringResult.score,
      scoringResult.accuracy,
      scoringResult.f1_score
    );

    // Save to database
    const db = getDatabase();
    const result = await db.run(
      'INSERT INTO submissions (username, score, feedback, file_name, file_size, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [username, scoringResult.score, feedback, file.name, file.size, new Date().toISOString()]
    );

    return c.json({
      success: true,
      data: {
        id: result.lastID,
        username,
        score: scoringResult.score,
        accuracy: scoringResult.accuracy,
        f1_score: scoringResult.f1_score,
        feedback,
        file_name: file.name,
        file_size: file.size,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Submission error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to process submission'
    }, 500);
  }
});

// GET /api/leaderboard - Get top 10 submissions
app.get('/api/leaderboard', async (c) => {
  try {
    const db = getDatabase();
    const leaderboard = await db.all('SELECT * FROM submissions ORDER BY score DESC LIMIT 10');
    
    return c.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch leaderboard'
    }, 500);
  }
});

// GET /api/submissions/:id - Get specific submission
app.get('/api/submissions/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db = getDatabase();
    const submission = await db.get('SELECT * FROM submissions WHERE id = ?', [id]);
    
    if (!submission) {
      return c.json({
        success: false,
        error: 'Submission not found'
      }, 404);
    }

    return c.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Get submission error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch submission'
    }, 500);
  }
});

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

// Vercel serverless function handler
module.exports = async function handler(req) {
  return app.fetch(req);
};