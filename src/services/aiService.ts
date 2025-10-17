import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFileSync, appendFileSync, existsSync } from 'fs';
import path from 'path';

interface AIUsageLog {
  timestamp: string;
  prompt: string;
  response: string;
  mode: 'live' | 'fake';
  reasoning: string;
}

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private mode: 'live' | 'fake';

  constructor() {
    this.mode = (process.env.AI_MODE as 'live' | 'fake') || 'fake';
    
    if (this.mode === 'live' && process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  async generateFeedback(
    score: number,
    accuracy?: number,
    f1Score?: number,
    fileInfo?: { name: string; size: number }
  ): Promise<string> {
    const prompt = this.createPrompt(score, accuracy, f1Score, fileInfo);
    
    let response: string;
    let reasoning: string;

    if (this.mode === 'live' && this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        response = result.response.text();
        reasoning = 'Generated using Gemini Pro API';
      } catch (error) {
        console.error('AI API error, falling back to fake mode:', error);
        response = this.generateFakeFeedback(score, accuracy, f1Score);
        reasoning = `AI API failed: ${error}. Used fallback.`;
      }
    } else {
      response = this.generateFakeFeedback(score, accuracy, f1Score);
      reasoning = 'Using fake mode as configured';
    }

    // Log AI usage
    this.logUsage(prompt, response, reasoning);

    return response;
  }

  private createPrompt(
    score: number,
    accuracy?: number,
    f1Score?: number,
    fileInfo?: { name: string; size: number }
  ): string {
    return `You are an AI assistant providing feedback for an Iris classification challenge submission.

Submission Details:
- Score: ${score.toFixed(4)}
- Accuracy: ${accuracy ? accuracy.toFixed(4) : 'N/A'}
- F1 Score: ${f1Score ? f1Score.toFixed(4) : 'N/A'}
- File: ${fileInfo?.name || 'Unknown'} (${fileInfo?.size || 0} bytes)

Please provide constructive feedback in exactly 150 words or less, covering:
1. Correctness: How well the model performed
2. Coverage: Completeness of the solution
3. Formatting: Quality of data presentation

Be specific, encouraging, and actionable. Focus on what the user did well and areas for improvement.`;
  }

  private generateFakeFeedback(
    score: number,
    accuracy?: number,
    f1Score?: number
  ): string {
    const feedbacks = [
      `Your Iris classification model achieved a score of ${score.toFixed(4)}. `,
      `The accuracy of ${accuracy ? accuracy.toFixed(4) : 'N/A'} shows ${score > 0.8 ? 'strong' : score > 0.6 ? 'moderate' : 'room for improvement in'} performance. `,
      `Your F1 score of ${f1Score ? f1Score.toFixed(4) : 'N/A'} indicates ${score > 0.8 ? 'excellent' : 'good'} balance between precision and recall. `,
      `Consider ${score > 0.8 ? 'fine-tuning hyperparameters' : 'exploring different algorithms'} to further improve results. `,
      `The data preprocessing and feature engineering appear ${score > 0.7 ? 'well-executed' : 'could be enhanced'}. `,
      `Keep experimenting with different approaches to achieve even better classification performance!`
    ];

    return feedbacks.join('').substring(0, 150);
  }

  private logUsage(prompt: string, response: string, reasoning: string): void {
    const logEntry: AIUsageLog = {
      timestamp: new Date().toISOString(),
      prompt,
      response,
      mode: this.mode,
      reasoning
    };

    const logPath = path.join(process.cwd(), 'ai_usage_log.md');
    const logContent = `## AI Usage Log Entry - ${logEntry.timestamp}

**Mode:** ${logEntry.mode}
**Reasoning:** ${logEntry.reasoning}

### Prompt:
${logEntry.prompt}

### Response:
${logEntry.response}

---

`;

    if (existsSync(logPath)) {
      appendFileSync(logPath, logContent);
    } else {
      writeFileSync(logPath, logContent);
    }
  }
}
