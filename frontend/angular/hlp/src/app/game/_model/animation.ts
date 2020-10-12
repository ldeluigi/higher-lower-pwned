interface GameSetup {
  word1: string;
  word2: string;
  score1: number;
}

interface NextCard {
  oldScore: number;
  newWord: string;
}

interface EndGame {
  oldScore: number;
}

export {
  GameSetup,
  NextCard,
  EndGame
};
