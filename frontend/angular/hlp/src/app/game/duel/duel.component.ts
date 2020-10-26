import { ViewChild } from '@angular/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { DuelModeService, GameData } from 'src/app/_services/duel-mode.service';
import { WordSpinnerComponent } from '../_components/word-spinner/word-spinner.component';
import { Player } from '../_components/player-list/player-list.component';
import { NextDuelGuess } from '../_model/nextGuess';
import { currentGuessNumber, getDataFromId, evaluatePlayerId, haveLost, GameDataType, gameDataType, GameMode } from '../_utils/gameHelper';
import { PlayerJoin } from '../_model/player-join';
import { rollNumber, rollWord } from '../_utils/wordAnimation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { SocketDuel } from '../SocketDuel';
import { SocketRoyale } from '../SocketRoyale';

@Component({
  selector: 'app-duel',
  templateUrl: './duel.component.html',
  styleUrls: ['./duel.component.scss']
})
export class DuelComponent implements OnInit, OnDestroy {

  @ViewChild(WordSpinnerComponent)
  private wordAnimation!: WordSpinnerComponent;
  private modeSub: Subscription;
  mode = 'duel';
  gameMode: GameMode = GameMode.Duel;

  playersSub: Subscription | undefined;
  gameDataSub: Subscription | undefined;

  players: Player[] = [];

  actualScore = 0;
  playing = false;
  alreadyLost = false;
  stillInGame = false;
  imBehind = false;

  myName: string | undefined;

  private timeoutValue: number | undefined;
  private word2: string | undefined = undefined;

  progressbarValue = 100;
  timeLeft = 0;
  private subTimer: Subscription | undefined;
  private errorSub: Subscription | undefined;

  constructor(
    private gameSocket: DuelModeService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
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
    this.playersSub = this.gameSocket.players.subscribe(pj => {
      console.log('duelcomp-playerSub', pj);
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
      } else {
        console.log('player already present', pj);
      }
    });

    this.gameDataSub = this.gameSocket.gameData.subscribe(data => {
      this.analiseGuess(data);

      console.log('duelcomp-data', data);
    });

    this.errorSub = this.gameSocket.errors.subscribe(err => this.log(`code:[${err.code}] desc:[${err.description}]`));
  }

  private log(message: string, type: string = 'ok'): void {
    this.snackBar.open(message, type, {duration: 5000});
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
    this.imBehind = false;
    this.subTimer?.unsubscribe();
    this.subTimer = undefined;
  }

  start(): void {
    this.imBehind = false;
    this.alreadyLost = false;
    this.stillInGame = false;
    this.players = [];
    this.gameSocket.startGame(this.socket(this.mode))
      .then(() => {
        this.playing = true;
        this.word2 = undefined;
      })
      .catch(e => this.playing = false);
  }

  private onEnd(): void {
    if (!this.alreadyLost) {
      if (this.timeoutValue) {
        clearTimeout(this.timeoutValue);
      }
      this.subTimer?.unsubscribe();
      this.subTimer = undefined;
      this.stillInGame = false;
      this.alreadyLost = true;
    }
  }

  quit(): void {
    this.onEnd();
    this.myName = undefined;
    this.stillInGame = false;
    this.playing = false;
    this.players = [];
    this.gameSocket.endGame();
  }

  disconnect(): void {
    this.onEnd();
    this.myName = undefined;
    this.stillInGame = false;
    this.playing = false;
    this.players = [];
    this.gameSocket.disconnect();
  }

  repeat(): void {
    this.gameSocket.repeat();
  }

  private endGame(value2: number): void {
    this.onEnd();
    this.wordAnimation.end({ oldScore: value2 });
    console.log('---> LOST!!!');
  }

  private haveGuessLost(guess: NextDuelGuess): boolean {
    return this.alreadyLost || (haveLost(guess));
  }

  private analiseGuess(data: GameData): void {
    const guessType: GameDataType = gameDataType(data, this.word2);
    const myGuess: NextDuelGuess = getDataFromId(this.gameSocket.myId, data, this.gameMode);
    console.log(guessType, myGuess);
    if (guessType === GameDataType.NextGuess) {
      const startMyTimeout: () => void = () => {
        if (myGuess.timeout) {
          this.setProgressBarTimer(myGuess.timeout);
        }
      };
      if (!this.stillInGame && !this.alreadyLost) { /* start */
        this.gameStarted(myGuess);
        startMyTimeout();
      } else if (this.stillInGame && this.haveGuessLost(myGuess)) { /* have lost */
        this.endGame(myGuess.value1);
      } else if (!this.haveGuessLost(myGuess)) { /* have not lost, go next */
        this.nextGuess(myGuess);
        startMyTimeout();
      }
      /* else if (this.alreadyLost) I've already lost */
    } else if (guessType === GameDataType.EndGame && !this.alreadyLost) { /* value2 is present and the game is over */
      if (myGuess.value2) {
        this.endGame(myGuess.value2);
      } else {
        this.log('Error, the game is over but the secondo word score is not present');
      }
    }
    /* else if (guessType === GameDataType.Update) this.updateGuessNumber(data) */
    this.updateGame(data);
    this.updateGuessNumber(data);
  }

  private gameStarted(guess: NextDuelGuess): void {
    this.word2 = guess.password2;
    this.wordAnimation.gameSetup({
      word1: guess.password1,
      word2: guess.password2,
      score1: guess.value1
    }).then(() => this.imBehind = true);
    this.playing = true;
    this.stillInGame = true;
    this.alreadyLost = false;
    this.actualScore = guess.score ? guess.score : 0;
  }

  private nextGuess(guess: NextDuelGuess): void {
    this.word2 = guess.password2;
    this.wordAnimation.next({
      newWord: guess.password2,
      oldScore: guess.value1
    }).then(() => this.imBehind = true);
    this.actualScore = guess.score ? guess.score : 0;
  }

  private updateGame(data: GameData): void {
    console.log('update');
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
    this.players
    .sort((p1, p2) =>
      p1.score === p2.score ?
      (p1.guesses < p2.guesses ? 1 : -1) :
      (p1.score < p2.score ? 1 : -1));
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

  buttonState(): string {
    if (this.alreadyLost) {
      return 'lost';
    }
    if (this.imBehind) {
      return '';
    }
    return 'waiting';
  }
}
