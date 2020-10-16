import { ViewChild } from '@angular/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { DuelModeService, Response } from 'src/app/_services/duel-mode.service';
import { WordSpinnerComponent } from '../word-spinner/word-spinner.component';
import { Player } from '../_components/player-list/player-list.component';
import { CardData } from '../_components/word/word.component';
import { DuelGuess } from '../_model/nextGuess';
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

  playerDataSub: Subscription | undefined;
  playerSub: Subscription | undefined;
  gameDataSub: Subscription | undefined;

  isFirst = true;
  actualScore = 0;

  players: Player[] = [];

  playing = false;
  private stillInGame = false;
  private word1 = '';
  private word2 = '';

  progressbarValue = 100;
  timeLeft = 0;
  private subTimer: Subscription | undefined;

  constructor(
    private gameSocket: DuelModeService,
  ) { }

  ngOnInit(): void {
    this.playerSub = this.gameSocket.player.subscribe(pj => {
      if (this.players.find(p => p.id === pj.id) === undefined) {
        this.players.push({
          name: pj.name,
          score: 0,
          id: pj.id,
          haveLost: false
        });
      } else {
        console.log('player already present', pj);
      }
    });
    this.playerDataSub = this.gameSocket.playerData.subscribe(elem => {
      if (elem.timeout && !this.haveLost(elem)) {
        this.setTimer(elem.timeout);
      }
      this.analiseGuess(elem);
    });
    this.gameDataSub = this.gameSocket.gameData.subscribe(data => {
      this.updateGame(data);
    });
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.playerDataSub?.unsubscribe();
    this.playerDataSub = undefined;
    this.playerSub?.unsubscribe();
    this.playerSub = undefined;
  }

  up(): void {
    this.gameSocket.answer(2);
  }

  down(): void {
    this.gameSocket.answer(1);
  }

  start(): void {
    this.disconnect();
    this.isFirst = true;
    this.players = [];
    this.gameSocket.startGame()
      .then(() => {
        this.playing = true;
        this.stillInGame = true;
      })
      .catch(e => this.playing = false);
  }

  disconnect(): void {
    this.stillInGame = false;
    this.playing = false;
    this.players = [];
    this.gameSocket.disconnect();
  }

  repete(): void {
    this.gameSocket.repeat();
  }

  private endGame(data: DuelGuess): void {
    this.subTimer?.unsubscribe();
    this.subTimer = undefined;
    this.progressbarValue = 0;
    console.log('---> LOST!!!');
    this.stillInGame = false;
    this.wordAnimation.end({ oldScore: data.value1 });
  }

  private haveLost(guess: DuelGuess): boolean {
    return guess.lost !== undefined && guess.lost;
  }

  private analiseGuess(guess: DuelGuess): void {
    if (this.isFirst) {
      /** caso start */
      this.gameStarted(guess);
    } else if (this.word2 === guess.password1 && !this.haveLost(guess)) {
      /** caso next guess */
      this.nextGuess(guess);
    } else if (this.stillInGame && this.haveLost(guess)) {
      /** caso sconfitta */
      this.endGame(guess);
    } else {
      /** caso update avversari */
      /** gestito da un'altra coda quindi qui si può non fare niente */
    }
  }

  private gameStarted(guess: DuelGuess): void {
    this.word1 = guess.password1;
    this.word2 = guess.password2;
    this.wordAnimation.gameSetup({
      word1: guess.password1,
      word2: guess.password2,
      score1: guess.value1
    });
    this.isFirst = false;
    this.playing = true;
    this.stillInGame = true;
    this.actualScore = guess.score ? guess.score : 0;
  }

  private nextGuess(guess: DuelGuess): void {
    this.word1 = guess.password1;
    this.word2 = guess.password2;
    this.wordAnimation.next({
      newWord: guess.password2,
      oldScore: guess.value1
    });
    this.actualScore = guess.score ? guess.score : 0;
  }

  private updateGame(data: Response): void {
    data.ids.forEach((id: string, index) => {
      if (id !== this.gameSocket.myId) {
        const p = this.players.find(e => e.id === id);
        if (p) {
          const pData = data.data[index];
          if (pData.lost) {
            p.haveLost = pData.lost;
          }
          if (pData.score) {
            p.score = pData.score;
          }
        }
      }
    });
    this.players.sort((p1, p2) => p1.score < p2.score ? 1 : -1);
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
