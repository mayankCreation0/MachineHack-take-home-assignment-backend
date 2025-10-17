export interface Submission {
  id: number;
  username: string;
  score: number;
  feedback: string;
  file_name: string;
  file_size: number;
  created_at: string;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  created_at: string;
  rank: number;
}

export interface IrisData {
  sepal_length: number;
  sepal_width: number;
  petal_length: number;
  petal_width: number;
  species?: string; // Optional for predictions
}

export interface ScoringResult {
  score: number;
  feedback: string;
  accuracy?: number;
  f1_score?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
