interface HistoryItem {
  // it's depend on the request, period can be dayOfTheYear, weekOfTheYear, month, year
  periodNumber: number;
  year: number;
  avgScore: number;
  avgGuesses: number;
  // fraction (number of games / number of day in that period)
  avgPlaysPerDay: number;
  // duration in millisecond
  avgDuration: number;
  maxScore: number;
  maxGuesses: number;
  // max duration in milliseconds
  maxDuration: number;
}

export interface UserStats {
  id: number;
  history: HistoryItem[];
}
