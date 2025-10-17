import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Hono } from 'hono';
import submissionsRoutes from '../routes/submissions';
import { initializeDatabase, submissions } from '../utils/database';
import fs from 'fs';
import path from 'path';

// Mock the services
vi.mock('../services/scoringService', () => ({
  ScoringService: vi.fn().mockImplementation(() => ({
    scoreSubmission: vi.fn().mockResolvedValue({
      score: 0.85,
      accuracy: 0.87,
      f1_score: 0.83
    }),
    validateIrisData: vi.fn().mockReturnValue({
      isValid: true,
      errors: []
    })
  }))
}));

vi.mock('../services/aiService', () => ({
  AIService: vi.fn().mockImplementation(() => ({
    generateFeedback: vi.fn().mockResolvedValue('Great job! Your model shows excellent performance.')
  }))
}));

describe('Submissions API', () => {
  let app: Hono;

  beforeEach(async () => {
    app = new Hono();
    app.route('/api', submissionsRoutes);
    await initializeDatabase();
    // Clear submissions array for each test
    submissions.length = 0;
  });

  afterEach(() => {
    // Clean up any test files
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(uploadDir, file));
      });
    }
  });

  describe('POST /api/submissions', () => {
    it('should return 400 for missing username', async () => {
      const formData = new FormData();
      formData.append('file', new File(['test'], 'test.csv', { type: 'text/csv' }));

      const res = await app.request('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Username and file are required');
    });

    it('should return 400 for missing file', async () => {
      const formData = new FormData();
      formData.append('username', 'test-user');

      const res = await app.request('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Username and file are required');
    });

    it('should return 400 for empty file', async () => {
      const formData = new FormData();
      formData.append('username', 'test-user');
      formData.append('file', new File([], 'empty.csv', { type: 'text/csv' }));

      const res = await app.request('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('File cannot be empty');
    });

    it('should successfully process a valid submission', async () => {
      const csvContent = 'sepal_length,sepal_width,petal_length,petal_width\n5.1,3.5,1.4,0.2\n4.9,3.0,1.4,0.2';
      const formData = new FormData();
      formData.append('username', 'test-user');
      formData.append('file', new File([csvContent], 'test.csv', { type: 'text/csv' }));

      const res = await app.request('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.username).toBe('test-user');
      expect(data.data.score).toBe(0.85);
      expect(data.data.feedback).toBe('Great job! Your model shows excellent performance.');
    });
  });

  describe('GET /api/leaderboard', () => {
    it('should return empty leaderboard initially', async () => {
      const res = await app.request('/api/leaderboard');
      
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should return leaderboard with submissions', async () => {
      // First, create a submission
      const csvContent = 'sepal_length,sepal_width,petal_length,petal_width\n5.1,3.5,1.4,0.2';
      const formData = new FormData();
      formData.append('username', 'test-user');
      formData.append('file', new File([csvContent], 'test.csv', { type: 'text/csv' }));

      await app.request('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      // Then check leaderboard
      const res = await app.request('/api/leaderboard');
      
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].username).toBe('test-user');
      expect(data.data[0].rank).toBe(1);
    });
  });

  describe('GET /api/submissions/:id', () => {
    it('should return 400 for invalid submission ID', async () => {
      const res = await app.request('/api/submissions/invalid');
      
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid submission ID');
    });

    it('should return 404 for non-existent submission', async () => {
      const res = await app.request('/api/submissions/999');
      
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Submission not found');
    });

    it('should return submission details for valid ID', async () => {
      // First, create a submission
      const csvContent = 'sepal_length,sepal_width,petal_length,petal_width\n5.1,3.5,1.4,0.2';
      const formData = new FormData();
      formData.append('username', 'test-user');
      formData.append('file', new File([csvContent], 'test.csv', { type: 'text/csv' }));

      const submitRes = await app.request('/api/submissions', {
        method: 'POST',
        body: formData
      });

      const submitData = await submitRes.json();
      const submissionId = submitData.data.id;

      // Then fetch the submission
      const res = await app.request(`/api/submissions/${submissionId}`);
      
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(submissionId);
      expect(data.data.username).toBe('test-user');
    });
  });
});
