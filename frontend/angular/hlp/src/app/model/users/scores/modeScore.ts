export interface UserScores {
  meta: {
    total: number;
    page: number;
    size: number;
  };
  data: [ CoreUserScores ];
}

export interface CoreUserScores {
  score: number;
  guesses: number;
  date: Date;
  duration: number;
}
