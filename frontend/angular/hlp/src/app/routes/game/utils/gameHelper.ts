import { GameData } from '../model/nextguess';
import { NextDuelGuess } from '../model/nextguess';

enum GameType {
  NextGuess,  // next guess, with word update
  Update,     // A guess update with no new word
  EndGame     // All player have lost
}

enum GameMode {
  Arcade = 'arcade',
  Duel = 'duel',
  BattleRoyale = 'royale'
}

function currentGuess(data: GameData): number {
  return Math.min(...data.data.filter(e => e.lost && !e.lost).map(e => e.guesses)) || Math.max(...data.data.map(e => e.guesses));
}

function extractId(ids: string[], myId: string): string | undefined {
  return ids.find(e => e.includes(myId));
}

function getDataFromId(myId: string, data: GameData): NextDuelGuess {
  const myIndex = data.ids.indexOf(extractId(data.ids, myId) || '');
  if (myIndex >= 0) {
    return data.data[myIndex];
  }
  return {} as NextDuelGuess;
}

function havePlayerLost(playerId: string, data: GameData): boolean {
  const player = getDataFromId(playerId, data);
  return player.lost !== undefined && player.lost;
}

function haveLost(guess: NextDuelGuess): boolean {
  return guess.lost !== undefined ? guess.lost : false;
}

function gameIsEnd(data: GameData): boolean {
  return data.data.every(p => p.lost !== undefined && p.lost);
}

function gameDataType(data: GameData, currW2: string | undefined): GameType {
  if (data.data[0].value2 || data.data.every(p => p.lost === true)) {
    return GameType.EndGame;
  }
  if (currW2) {
    return data.data.some(p => p.lost !== undefined && p.password1 === currW2) ? GameType.NextGuess : GameType.Update;
  }
  return data.data.some(p => p.lost !== undefined) ? GameType.NextGuess : GameType.Update;
}

function playerInGame(data: GameData): number {
  if (gameDataType(data, undefined) === GameType.Update) {
    return -1;
  }
  return data.data.filter(p => !haveLost(p)).length;
}

export {
  currentGuess as currentGuessNumber,
  getDataFromId,
  havePlayerLost,
  haveLost,
  gameIsEnd,
  gameDataType,
  playerInGame,
  GameType as GameDataType,
  GameMode,
  extractId,
};
