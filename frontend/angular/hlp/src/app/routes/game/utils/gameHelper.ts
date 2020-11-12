import { Observable, Subject } from 'rxjs';
import { GameData } from '../../../services/battle-model.service';
import { GameStatus } from './gameStatus';
import { NextDuelGuess, NextGuess } from '../model/nextguess';

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

type Card = { word1: string; word2: string; score1: number; score2?: number; };

class Game {
  private currentStatus: GameStatus;
  private history: Card[] = [] as Card[];

  private nextGuessSubject: Subject<Card> = new Subject<Card>();
  private timerSubject: Subject<number> = new Subject<number>();
  /** the last guess the make current player lost, it's present only if player have lost */
  myLastGuess: Card | undefined;

  nextGuessObservable: Observable<Card> = this.nextGuessSubject.asObservable();
  timerObservable: Observable<number> = this.timerSubject.asObservable();

  constructor() {
    this.currentStatus = GameStatus.WAITING_START;
  }

  reset(): void {
    this.currentStatus = GameStatus.WAITING_START;
    this.history = [];
    this.myLastGuess = undefined;
  }

  get status(): GameStatus {
    return this.currentStatus;
  }

  get currentGuess(): Card | undefined {
    return this.lastCard;
  }

  next(guess: NextDuelGuess, guessType: GameType): void {
    this.analiseGuess(guess, guessType);
  }

  private startGame(myGuess: NextDuelGuess): void {
    /**
     * 1. set current status to PLAYING
     * 2. call next guess
     */
    this.currentStatus = GameStatus.PLAYING;
    this.nextGuess(myGuess);
  }

  private nextGuess(myGuess: NextDuelGuess): void {
    /**
     * 1. update history
     * 2. start timer
     * 3. public new guess (with publicData)
     * 4. public new timer (with publicData)
     */
    const newCard = this.cardFromGuess(myGuess);
    if (myGuess.timeout) { this.publicNewTimer(myGuess.timeout); }
    this.appendNewCard(newCard);
    this.nextGuessSubject.next(newCard);
    this.timerSubject.next(myGuess.timeout);
  }

  private endGame(myGuess: NextDuelGuess): void {
    /**
     * 1. Check lost
     * 2. updade currento status to LOST
     * 3. public spectator data (with publicData)
     */
    if (myGuess.lost && myGuess.lost === true) {
      const nextGuess = this.cardFromGuess(myGuess);
      if (this.lastCard) {
        this.myLastGuess = this.lastCard;
        if (this.lastCard.word1 === myGuess.password1) {
          this.myLastGuess.score2 = nextGuess.score2;
          this.nextGuessSubject.next(this.myLastGuess);
        } else {
          this.myLastGuess.score2 = nextGuess.score1;
          this.appendNewCard(nextGuess);
          this.nextGuessSubject.next(nextGuess);
        }
      } else {
        throw new Error('No value present in history.');
      }
    }
  }

  private publicNewTimer(time: number): void {
    this.timerSubject.next(time);
  }

  private appendNewCard(newCard: Card): void {
    if (this.lastCard && this.lastCard.word2 !== newCard.word1) {
      throw new Error(`Words are not aligned ${this.lastCard.word2} it's not equal to ${newCard.word1}`);
    }
    this.history.push(newCard);
  }

  private analiseGuess(myGuess: NextDuelGuess, guessType: GameType): void {
    if (guessType === GameType.NextGuess) {
      if (this.currentStatus === GameStatus.WAITING_START) { /* start */
        this.startGame(myGuess);
        this.currentStatus = GameStatus.PLAYING;
      } else if (this.isInGame() && haveLost(myGuess)) { /* lost */
        this.currentStatus = GameStatus.SPECTATORE;
        this.endGame(myGuess);
      } else {
        this.nextGuess(myGuess);
      }
    } else if (guessType === GameType.EndGame) { /* value2 is present and the game is over */
      this.currentStatus = GameStatus.END;
      this.endGame(myGuess);
    } else if (guessType === GameType.Update) {
      /** I don't care of game update */
    }
  }

  private isInGame(): boolean {
    return this.currentStatus === GameStatus.PLAYING;
  }

  private get lastCard(): Card | undefined {
    return this.history.length > 0 ?
      this.history[this.history.length - 1] :
      undefined;
  }

  private cardFromGuess(guess: NextDuelGuess): Card {
    return {
      word1: guess.password1,
      word2: guess.password2,
      score1: guess.value1,
      score2: guess.value2
    } as Card;
  }
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
  Game
};
