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

interface NextMultiplayerGuess extends CompleteGuess {
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
  data: NextMultiplayerGuess[];
}

interface GameEnd {
  guesses: number;
  password1: string;
  password2: string;
  score: number;
  duration: number;
  value1: number;
  value2: number;
}

export {
  Guess,
  CompleteGuess as UpdateGuesses,
  NextGuess,
  NextMultiplayerGuess,
  GameUpdate as MultiplayerGameUpdate,
  UpdatePlayersInfo,
  GameData,
  GameEnd
};
