export interface NextGuess {
  password1: string;
  value1: number;
  password2: string;
  timeout: number;
  score: number;
  guesses: number;
  duration: number;
}

export interface DuelGuess {
  password1: string;
  value1: number;
  password2: string;
  timeout?: number;
  score?: number;
  lost?: boolean;
  guesses: number;
  duration: number;
}
