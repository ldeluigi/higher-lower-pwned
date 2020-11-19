/**
 * Used as last guess for Arcade, Duel and Royale mode.
 */
export interface GameEnd {
  guesses: number;
  password1: string;
  password2: string;
  score: number;
  duration: number;
  value1: number;
  value2: number;
}
