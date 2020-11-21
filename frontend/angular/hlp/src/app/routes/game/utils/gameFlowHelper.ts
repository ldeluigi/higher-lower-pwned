import { GameStatus } from './gameStatus';

export class FlowManager {
  gameIsStarted = false;
  gameIsEnded = false;

  constructor() {}

  /**
   *
   * @param state the new state
   * @returns true only if it's nececary a reset of the data because a new game is ready to start.
   */
  newState(state: GameStatus): boolean {
    if (state === GameStatus.PLAYING && this.gameIsStarted === false) {
      this.gameIsStarted = true;
      return false;
    } else if (state === GameStatus.END || state === GameStatus.LOST && this.gameIsStarted) {
      this.gameIsEnded = true;
    } else if (state === GameStatus.IDLE && this.gameIsEnded) {
      this.gameIsStarted = false;
      this.gameIsEnded = false;
      return true;
    }
    return false;
  }
}
