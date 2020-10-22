interface Guess {
  password1: string;
  value1: number;
  password2: string;
  guesses: number;
  duration: number;
}

interface NextGuess extends Guess {
  timeout: number;
  score: number;
}

interface NextDuelGuess extends Guess {
  timeout?: number;
  score?: number;
  lost?: boolean;
  value2?: number;
}

export {
  Guess,
  NextGuess,
  NextDuelGuess
};
