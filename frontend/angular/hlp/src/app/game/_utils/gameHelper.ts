import { GameData } from '../../_services/duel-mode.service';
import { NextDuelGuess } from '../_model/nextGuess';

enum GameType {
  NextGuess,
  Update
}

enum GameMode {
  Arcade = 'arcade',
  Duel = 'duel',
  BattleRoyale = 'battle-royale'
}

function currentGuess(data: GameData): number {
  return Math.min(...data.data.filter(e => e.lost && !e.lost).map(e => e.guesses)) || Math.max(...data.data.map(e => e.guesses));
}

function getId(myId: string, mode: GameMode): string {
  switch (mode) {
    case GameMode.Duel:
      return '/duel#' + myId;
    default:
      return myId;
  }
}

function getDataFromId(myId: string, data: GameData, mode: GameMode = GameMode.Duel): NextDuelGuess {
  const myIndex = data.ids.indexOf(getId(myId, mode));
  if (myIndex >= 0) {
    return data.data[myIndex];
  }
  return {} as NextDuelGuess;
}

function havePlayerLost(playerId: string, data: GameData, mode: GameMode = GameMode.Duel): boolean {
  const player = getDataFromId(playerId, data, mode);
  return player.lost !== undefined && player.lost;
}

function haveLost(guess: NextDuelGuess): boolean {
  return guess.lost !== undefined ? guess.lost : false;
}

function gameIsEnd(data: GameData): boolean {
  return data.data.every(p => p.lost !== undefined && p.lost);
}

function gameDataType(data: GameData, currW2: string | undefined): GameType {
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
  getId as evaluatePlayerId
};
