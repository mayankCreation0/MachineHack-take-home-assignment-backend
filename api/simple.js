const { Hono } = require('hono');
const { cors } = require('hono/cors');

const app = new Hono();

// Configure CORS
app.use('*', cors({
  origin: '*',
  credentials: true,
}));

// Simple in-memory storage
let submissions = [];
let nextId = 1;

// Health check
app.get('/', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'Iris Classifier Backend API',
    timestamp: new Date().toISOString()
  });
});

// Get leaderboard
app.get('/api/leaderboard', (c) => {
  try {
    const leaderboard = submissions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((sub, index) => ({
        id: sub.id,
        username: sub.username,
        score: sub.score,
        feedback: sub.feedback,
        file_name: sub.file_name,
        created_at: sub.created_at,
        rank: index + 1
      }));

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

// Submit file
app.post('/api/submissions', async (c) => {
  try {
    const formData = await c.req.parseBody();
    const username = formData.username;
    const file = formData.file;

    if (!username || !file) {
      return c.json({
        success: false,
        error: 'Username and file are required'
      }, 400);
    }

    // Mock scoring (replace with real scoring later)
    const mockScore = Math.random() * 0.4 + 0.6; // Random score between 0.6-1.0
    const mockFeedback = `Great job! Your model achieved a score of ${(mockScore * 100).toFixed(1)}%. Keep up the excellent work!`;

    // Create submission
    const submission = {
      id: nextId++,
      username: username.toString(),
      score: mockScore,
      feedback: mockFeedback,
      file_name: file.name || 'submission.csv',
      file_size: file.size || 0,
      created_at: new Date().toISOString()
    };

    submissions.push(submission);

    return c.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Submission error:', error);
    return c.json({
      success: false,
      error: 'Failed to process submission'
    }, 500);
  }
});

// Get specific submission
app.get('/api/submissions/:id', (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const submission = submissions.find(s => s.id === id);

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

module.exports = app;
