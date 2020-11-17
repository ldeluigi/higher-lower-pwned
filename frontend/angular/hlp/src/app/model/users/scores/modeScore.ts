export interface UserScores {
  meta: {
    total: number,
    page: number,
    size: number
  };
  data: [
    {
        score: number,
        guesses: number,
        date: Date,
        duration: number
    }
  ];
}
