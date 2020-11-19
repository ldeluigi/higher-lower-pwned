interface Guess {
  password1: string;
  value1: number;
  password2: string;
}

interface GuessData {
  guesses: number;
  duration: number;
}

interface CompleteGuess extends Guess, GuessData { }

interface NextGuess extends CompleteGuess {
  timeout: number;
  score: number;
}

interface NextDuelGuess extends CompleteGuess {
  timeout?: number;
  score?: number;
  lost?: boolean;
  value2?: number;
}

interface UpdatePlayersInfo {
  id: string;
  guesses: number;
  lost: boolean; // Default a false
  score?: number;
}

interface GameUpdate {
  users: UpdatePlayersInfo[];
}

interface GameData {
  ids: string[];
  data: NextDuelGuess[];
}

export {
  Guess,
  CompleteGuess as UpdateGuesses,
  NextGuess,
  NextDuelGuess,
  GameUpdate as MultiplayerGameUpdate,
  UpdatePlayersInfo,
  GameData
};
