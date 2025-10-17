import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { ScoringService } from '../services/scoringService';
import { AIService } from '../services/aiService';
import { getDatabase, submissions } from '../utils/database';
import type { ApiResponse, Submission, LeaderboardEntry } from '../types';
import path from 'path';
import fs from 'fs';

const app = new Hono();

// Configure CORS
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

const scoringService = new ScoringService();
const aiService = new AIService();

// POST /api/submissions - Upload and score a file
app.post('/submissions', async (c) => {
  try {
    const formData = await c.req.parseBody();
    const username = formData.username as string;
    const file = formData.file as File;

    if (!username || !file) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Username and file are required'
      }, 400);
    }

    if (file.size === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'File cannot be empty'
      }, 400);
    }

    // Save uploaded file temporarily
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    try {
      // Score the submission
      const scoringResult = await scoringService.scoreSubmission(filePath, username);
      
      // Generate AI feedback
      const feedback = await aiService.generateFeedback(
        scoringResult.score,
        scoringResult.accuracy,
        scoringResult.f1_score,
        { name: file.name, size: file.size }
      );

      // Store in database
      const submission = {
        id: submissions.length + 1,
        username,
        score: scoringResult.score,
        feedback,
        file_name: file.name,
        file_size: file.size,
        created_at: new Date().toISOString()
      };
      submissions.push(submission);

      // Clean up temporary file
      fs.unlinkSync(filePath);

      return c.json<ApiResponse<Submission>>({
        success: true,
        data: submission,
        message: 'Submission scored successfully'
      });

    } catch (error) {
      // Clean up temporary file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }

  } catch (error) {
    console.error('Submission error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, 500);
  }
});

// GET /api/leaderboard - Get top 10 scores
app.get('/leaderboard', async (c) => {
  try {
    const topSubmissions = submissions
      .sort((a, b) => b.score - a.score || new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(0, 10);

    const leaderboard: LeaderboardEntry[] = topSubmissions.map((sub, index) => ({
      username: sub.username,
      score: sub.score,
      created_at: sub.created_at,
      rank: index + 1
    }));

    return c.json<ApiResponse<LeaderboardEntry[]>>({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch leaderboard'
    }, 500);
  }
});

// GET /api/submissions/:id - Get specific submission
app.get('/submissions/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Invalid submission ID'
      }, 400);
    }

    const submission = submissions.find(sub => sub.id === id);

    if (!submission) {
      return c.json<ApiResponse>({
        success: false,
        error: 'Submission not found'
      }, 404);
    }

    return c.json<ApiResponse<Submission>>({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Get submission error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'Failed to fetch submission'
    }, 500);
  }
});

export default app;
