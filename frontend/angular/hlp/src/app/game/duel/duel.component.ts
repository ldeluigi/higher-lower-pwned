import { ViewChild } from '@angular/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { DuelModeService, GameData } from 'src/app/_services/duel-mode.service';
import { WordSpinnerComponent } from '../_components/word-spinner/word-spinner.component';
import { Player } from '../_components/player-list/player-list.component';
import { NextDuelGuess } from '../_model/nextguess';
import { getDataFromId, evaluatePlayerId, haveLost, GameDataType, gameDataType, GameMode, Game, gameIsEnd } from '../_utils/gameHelper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { SocketDuel } from '../SocketDuel';
import { SocketRoyale } from '../SocketRoyale';
import { GameStatus } from '../_utils/GameStatus';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-duel',
  templateUrl: './duel.component.html',
  styleUrls: ['./duel.component.scss']
})
export class DuelComponent implements OnInit, OnDestroy {

  @ViewChild(WordSpinnerComponent)
  private wordAnimation!: WordSpinnerComponent;
  private modeSub: Subscription;

  private game: Game = new Game();

  mode = 'duel';
  gameMode: GameMode = GameMode.Duel;

  playersSub: Subscription | undefined;
  gameDataSub: Subscription | undefined;

  players: Player[] = [];

  actualScore = 0;
  gameStatus = GameStatus.IDLE;
  status = GameStatus;

  myName: string | undefined;

  private timeoutValue: number | undefined;

  progressbarValue = 100;
  timeLeft = 0;
  private subTimer: Subscription | undefined;
  private errorSub: Subscription | undefined;

  constructor(
    private gameSocket: DuelModeService,
    private snackBar: MatSnackBar,
    route: ActivatedRoute
  ) {
    this.modeSub = route.data.subscribe(elem => {
      this.mode = elem.mode;
      this.gameMode = elem.mode === 'duel' ? GameMode.Duel : GameMode.BattleRoyale;
    });
  }

  private socket(mode: string): Socket {
    if (mode === 'duel') {
      return new SocketDuel();
    } else if (mode === 'royale') {
      return new SocketRoyale();
    }
    throw new Error('Invalid mode');
  }

  ngOnInit(): void {
    this.game = new Game();
    this.game.nextGuessObservable.subscribe(card => {
      if (this.gameStatus === GameStatus.WAITING_START) { // game start
        this.wordAnimation.gameSetup(card)
          .then(() => {
            this.gameStatus = GameStatus.PLAYING;
          });
      } else if (this.isInGame() && this.game.status === GameStatus.PLAYING) { // in game
        this.wordAnimation.next({ oldScore: card.score1, newWord: card.word2 })
          .then(() => {
            this.gameStatus = GameStatus.PLAYING;
          });
      } else if (this.isInGame() && this.game.status === GameStatus.SPECTATORE) { // have lost now
        this.gameStatus = GameStatus.LOST;
        this.log('You have lost');
        this.endGame(card.score1);  // take the old value
      } else if (this.game.status === GameStatus.SPECTATORE && this.gameStatus === GameStatus.SPECTATORE) { // spectatore mode
        this.wordAnimation.next({ oldScore: card.score1, newWord: card.word2 });
      } else if (this.game.status === GameStatus.END) {
        if (this.isInGame() || this.gameStatus === GameStatus.SPECTATORE) {
          this.endGame(this.game.myLastGuess?.score2 || 0);
        }
        if (this.gameStatus !== GameStatus.END) {
          this.log('This game is ended');
        }
        this.gameStatus = GameStatus.END;
      }
    });

    this.game.timerObservable.subscribe(timer => {
      if (this.isInGame() || this.gameStatus === GameStatus.WAITING_START) {
        this.setProgressBarTimer(timer);
      }
    });

    this.playersSub = this.gameSocket.players.subscribe(pj => {
      if (pj.id === evaluatePlayerId(this.gameSocket.myId, this.gameMode)) {
        this.myName = pj.name;
      }
      if (this.players.find(p => p.id === pj.id) === undefined) {
        this.players.push({
          name: pj.name,
          score: 0,
          id: pj.id,
          haveLost: false,
          timeout: 0,
          guesses: 0
        });
      }
    });

    this.gameDataSub = this.gameSocket.gameData.subscribe(data => {
      this.analiseGuess(data);
    });

    this.errorSub = this.gameSocket.errors.subscribe(err => this.log(`code:[${err.code}] desc:[${err.description}]`));
  }

  log(message: string, type: string = 'ok'): void {
    this.snackBar.open(message, type, { duration: 5000 });
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.gameSocket.disconnect();
    this.gameDataSub?.unsubscribe();
    this.gameDataSub = undefined;
    this.playersSub?.unsubscribe();
    this.playersSub = undefined;
    this.errorSub?.unsubscribe();
    this.errorSub = undefined;
    this.modeSub.unsubscribe();
  }

  answer(value: number): void {
    this.gameSocket.answer(value);
    this.subTimer?.unsubscribe();
    this.subTimer = undefined;
    this.gameStatus = GameStatus.WAITING_N_GUESS;
  }

  start(): void {
    this.game.reset();
    this.players = [];
    this.actualScore = 0;
    this.gameSocket.startGame(this.socket(this.mode))
      .then(() => {
        this.gameStatus = GameStatus.WAITING_START;
      })
      .catch(() => {
        this.log('Impossible start a new game');
        this.gameStatus = GameStatus.IDLE;
      });
  }

  private onEnd(): void {
    if (this.gameStatus === GameStatus.PLAYING || this.gameStatus === GameStatus.WAITING_N_GUESS) {
      this.gameStatus = GameStatus.LOST;
      if (this.timeoutValue) {
        clearTimeout(this.timeoutValue);
      }
      this.subTimer?.unsubscribe();
      this.subTimer = undefined;
    }
  }

  quit(): void {
    this.onEnd();
    this.gameSocket.endGame();
  }

  disconnect(): void {
    this.onEnd();
    this.gameStatus = GameStatus.IDLE;
    this.myName = undefined;
    this.players = [];
    this.gameSocket.disconnect();
  }

  spectatoreMode(): void {
    if (this.gameStatus === GameStatus.LOST) {
      this.gameStatus = GameStatus.SPECTATORE;
      const lastCard = this.game.currentGuess;
      if (lastCard) {
        if (this.wordAnimation.element1.word === lastCard?.word1) {
          /** nothing */
        } else if (this.wordAnimation.element2.word === lastCard?.word1) {
          this.wordAnimation.next({ oldScore: lastCard.score1, newWord: lastCard.word2 });
        } else {
          this.wordAnimation.gameSetup(lastCard);
        }
      }
    }
  }

  repeat(): void {
    this.gameSocket.repeat();
  }

  private endGame(value2: number): void {
    this.onEnd();
    this.wordAnimation.end({ oldScore: value2 });
  }

  isInGame(): boolean {
    return this.gameStatus === GameStatus.PLAYING || this.gameStatus === GameStatus.WAITING_N_GUESS;
  }

  private analiseGuess(data: GameData): void {
    const myGuess: NextDuelGuess = getDataFromId(this.gameSocket.myId, data, this.gameMode);
    const gameType: GameDataType = gameDataType(data, this.game.currentGuess?.word2);
    this.game.next(myGuess, gameType);

    this.updateGame(data);
    this.updateGuessNumber(data);

    if (gameIsEnd(data)) { /** everybody have lost */
      this.gameStatus = GameStatus.END;
    }
  }

  private updateGame(data: GameData): void {
    data.ids.forEach((id: string, index) => {
      const player = this.players.find(e => e.id === id);
      if (player) {
        const playerData = data.data[index];
        if (playerData.lost !== undefined) {
          player.haveLost = playerData.lost;
        }
        if (playerData.score) {
          player.score = playerData.score;
        }
        if (playerData.timeout) {
          player.timeout = playerData.timeout;
        }
      }
    });
    this.players.sort((p1, p2) => {
        if (p1.score === p2.score) {
          if (p1.guesses === p2.guesses) {
            if (p1.timeout === p2.timeout) {
              return p1.id > p2.id ? 1 : -1;
            } else {
              return p1.timeout - p2.timeout;
            }
          } else {
            return p2.guesses - p1.guesses;
          }
        } else {
          return p2.score - p1.score;
        }
      });
  }

  private updateGuessNumber(data: GameData): void {
    data.ids.forEach((id: string, index) => {
      const player = this.players.find(e => e.id === id);
      if (player) {
        const pData = data.data[index];
        player.guesses = pData.guesses;
      }
    });
    const disconnectedPlayer: Player[] = [];
    this.players.forEach(p => {
      if (data.ids.find(e => e === p.id) === undefined) {
        disconnectedPlayer.push(p);
      }
    });
    this.players = this.players.filter(p => !disconnectedPlayer.some(p2 => p.id === p2.id));
  }

  private async setProgressBarTimer(milliseconds: number): Promise<void> {
    const progressBarMax = 100;
    const frames = 200;
    const delta = progressBarMax / frames;
    const deltaT = Math.floor(milliseconds / frames);
    const timer$ = interval(deltaT);

    if (this.subTimer) {
      this.subTimer.unsubscribe();
    }

    return new Promise<void>(resolve => {
      this.subTimer = timer$.subscribe((d) => {
        const currentValue = delta * d;
        const currentMillis = deltaT * d;
        this.timeLeft = milliseconds - currentMillis;
        this.progressbarValue = progressBarMax - currentValue;
        if (this.timeLeft <= 0 && this.subTimer) {
          this.subTimer.unsubscribe();
          this.subTimer = undefined;
          this.progressbarValue = 0;
          this.timeLeft = 0;
          resolve();
        }
      });
    });
  }
}
