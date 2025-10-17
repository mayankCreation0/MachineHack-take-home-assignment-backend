import { spawn } from 'child_process';
import path from 'path';
import type { ScoringResult, IrisData } from '../types';

export class ScoringService {
  private pythonScriptPath: string;

  constructor() {
    this.pythonScriptPath = path.join(process.cwd(), '..', 'scorer', 'score.py');
  }

  async scoreSubmission(
    filePath: string,
    username: string
  ): Promise<ScoringResult> {
    return new Promise((resolve, reject) => {
      const python = spawn('python3', [this.pythonScriptPath, filePath, username]);
      
      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Python script output: ${error}`));
        }
      });

      python.on('error', (error) => {
        reject(new Error(`Failed to start Python script: ${error.message}`));
      });
    });
  }

  validateIrisData(data: IrisData[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data) || data.length === 0) {
      errors.push('Data must be a non-empty array');
      return { isValid: false, errors };
    }

    const requiredFields = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      for (const field of requiredFields) {
        if (!(field in row)) {
          errors.push(`Row ${i + 1}: Missing required field '${field}'`);
        } else if (typeof row[field as keyof IrisData] !== 'number') {
          errors.push(`Row ${i + 1}: Field '${field}' must be a number`);
        } else if (row[field as keyof IrisData] as number < 0) {
          errors.push(`Row ${i + 1}: Field '${field}' must be non-negative`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
