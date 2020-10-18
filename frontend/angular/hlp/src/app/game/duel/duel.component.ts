import { ViewChild } from '@angular/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { DuelModeService, GameData } from 'src/app/_services/duel-mode.service';
import { WordSpinnerComponent } from '../word-spinner/word-spinner.component';
import { Player } from '../_components/player-list/player-list.component';
import { CardData } from '../_components/word/word.component';
import { NextDuelGuess } from '../_model/nextGuess';
import { currentGuessNumber, getDataFromId, evaluatePlayerId, haveLost, GameDataType, gameDataType, GameMode } from '../_utils/gameHelper';
import { PlayerJoin } from '../_model/player-join';
import Utils from '../_utils/wordAnimation';

@Component({
  selector: 'app-duel',
  templateUrl: './duel.component.html',
  styleUrls: ['./duel.component.scss']
})
export class DuelComponent implements OnInit, OnDestroy {

  @ViewChild(WordSpinnerComponent)
  private wordAnimation!: WordSpinnerComponent;

  playersSub: Subscription | undefined;
  gameDataSub: Subscription | undefined;
  playerDataSub: Subscription | undefined;

  players: Player[] = [];

  actualScore = 0;
  playing = false;
  alreadyLost = false;
  stillInGame = false;

  myName: string | undefined;

  private timeoutValue: number | undefined;
  private word2: string | undefined = undefined;

  progressbarValue = 100;
  timeLeft = 0;
  private subTimer: Subscription | undefined;

  constructor(
    private gameSocket: DuelModeService,
  ) { }

  ngOnInit(): void {
    this.playersSub = this.gameSocket.players.subscribe(pj => {
      if (pj.id === evaluatePlayerId(this.gameSocket.myId, GameMode.Duel)) {
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

    this.gameDataSub = this.gameSocket.gameData.subscribe(data => this.analiseGuess(data));
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.playerDataSub?.unsubscribe();
    this.playerDataSub = undefined;
    this.playersSub?.unsubscribe();
    this.playersSub = undefined;
  }

  up(): void {
    this.gameSocket.answer(2);
  }

  down(): void {
    this.gameSocket.answer(1);
  }

  start(): void {
    this.disconnect();
    this.alreadyLost = false;
    this.stillInGame = false;
    this.players = [];
    this.gameSocket.startGame()
      .then(() => {
        this.playing = true;
      })
      .catch(e => this.playing = false);
  }

  disconnect(): void {
    this.myName = undefined;
    this.stillInGame = false;
    this.playing = false;
    this.players = [];
    this.gameSocket.disconnect();
  }

  repete(): void {
    this.gameSocket.repeat();
  }

  private endGame(data: NextDuelGuess): void {
    this.subTimer?.unsubscribe();
    this.subTimer = undefined;
    this.stillInGame = false;
    this.wordAnimation.end({ oldScore: data.value1 });
    console.log('---> LOST!!!');
  }

  private haveLost(guess: NextDuelGuess): boolean {
    return this.alreadyLost || (guess.lost !== undefined ? guess.lost : false);
  }

  private analiseGuess(data: GameData): void {
    const guessType: GameDataType = gameDataType(data, this.word2);
    const myGuess: NextDuelGuess = getDataFromId(this.gameSocket.myId, data);
    const minTimeout = Math.min(...data.data.filter(e => e.lost !== false).map(e => e.timeout || 0));
    if (myGuess.guesses > currentGuessNumber(data) && !this.alreadyLost) {
      if (minTimeout > 0) {
        if (this.timeoutValue) {
          clearTimeout(this.timeoutValue);
        }
        this.timeoutValue = setTimeout(() => {
          console.log(myGuess.timeout);
          this.repete();
          this.timeoutValue = undefined;
        }, minTimeout + 100);
      }
    }
    if (guessType === GameDataType.NextGuess) {
      const startMyTimeout: () => void = () => {
        if (myGuess.timeout) {
          this.setTimer(myGuess.timeout)
            .then(() => this.repete());
        }
      };
      if (!this.stillInGame && !this.alreadyLost) { /* start */
        this.gameStarted(myGuess);
        startMyTimeout();
      } else if (this.stillInGame && this.haveLost(myGuess)) { /* have lost */
        this.endGame(myGuess);
      } else if (!this.haveLost(myGuess)) { /* have not lost, go next */
        this.nextGuess(myGuess);
        startMyTimeout();
      }
      /* else if (this.alreadyLost) I've already lost */
    }
    /* else if (this.guessType === GameDataType.Update) this.updateGuessNumber(data) */
    this.updateGame(data);
    this.updateGuessNumber(data);
  }

  private gameStarted(guess: NextDuelGuess): void {
    this.word2 = guess.password2;
    this.wordAnimation.gameSetup({
      word1: guess.password1,
      word2: guess.password2,
      score1: guess.value1
    });
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
    });
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
    this.players.sort((p1, p2) => p1.score < p2.score ? 1 : -1);
  }

  private updateGuessNumber(data: GameData): void {
    data.ids.forEach((id: string, index) => {
      const player = this.players.find(e => e.id === id);
      if (player) {
        const pData = data.data[index];
        player.guesses = pData.guesses;
      }
    });
  }

  private async setTimer(milliseconds: number): Promise<void> {
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
