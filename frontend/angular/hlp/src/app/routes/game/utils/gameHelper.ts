import { GameData, NextMultiplayerGuess } from '../model/gameDTO';

function currentGuess(data: GameData): number {
  return Math.min(...data.data.filter(e => e.lost && !e.lost).map(e => e.guesses)) || Math.max(...data.data.map(e => e.guesses));
}

function extractId(ids: string[], myId: string): string | undefined {
  return ids.find(e => e.includes(myId));
}

function getDataFromId(myId: string, data: GameData): NextMultiplayerGuess {
  const myIndex = data.ids.indexOf(extractId(data.ids, myId) || '');
  if (myIndex >= 0) {
    return data.data[myIndex];
  }
  return {} as NextMultiplayerGuess;
}

function havePlayerLost(playerId: string, data: GameData): boolean {
  const player = getDataFromId(playerId, data);
  return player.lost !== undefined && player.lost;
}

function multiplayerGameIsEnd(data: GameData): boolean {
  return data.data.every(p => p.lost !== undefined && p.lost);
}

export {
  currentGuess as currentGuessNumber,
  getDataFromId,
  havePlayerLost,
  multiplayerGameIsEnd as gameIsEnd,
  extractId,
};
