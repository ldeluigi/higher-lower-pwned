import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ArcadeSocketService } from '../../_services/arcade-socket.service';
import { GameEnd } from '../_model/gameEnd';
import { NextGuess } from '../_model/nextguess';
import { interval, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WordSpinnerComponent } from '../_components/word-spinner/word-spinner.component';
import { rollNumber } from '../_utils/wordAnimation';

export interface CardData {
  word: string;
  score?: number;
}

@Component({
  selector: 'app-arcade',
  templateUrl: './arcade.component.html',
  styleUrls: ['./arcade.component.scss']
})
export class ArcadeComponent implements OnInit, OnDestroy {

  @ViewChild(WordSpinnerComponent)
  private wordAnimation!: WordSpinnerComponent;

  card: CardData = { word: '', score: 0 };
  card2: CardData = { word: '' };
  actualScore = 0;

  progressbarValue = 100;
  timeLeft = 0;
  private sub: Subscription | undefined;
  private subscription: Subscription | undefined;

  loading = true;
  playing = false;
  private firstWord = true;


  constructor(
    private gameSocket: ArcadeSocketService,
    private snackBar: MatSnackBar
  ) { }

  ngOnDestroy(): void {
    this.playing = false;
    this.sub?.unsubscribe();
    this.subscription?.unsubscribe();
    this.gameSocket.disconnect();
  }

  private log(message: string): void {
    this.snackBar.open(message, 'ok', { duration: 3000 });
  }

  ngOnInit(): void {
    // console.log('OnInit');
    this.subscription = this.gameSocket.game.subscribe(
      r => {
        const ng = r as NextGuess;
        const ge = r as GameEnd;
        if (ng.timeout) {
          if (this.firstWord) {
            this.firstWord = false;
            this.card = {
              word: ng.password1,
              score: ng.value1
            };
            this.card2 = {
              word: ng.password2
            };
            this.wordAnimation.gameSetup({ word1: ng.password1, word2: ng.password2, score1: ng.value1 });
          } else {
            this.next(ng.password2, ng.value1);
          }
          this.actualScore = ng.score;
          this.setTimer(ng.timeout)
            .then(_ => {
              this.gameSocket.repeat();
            });
        } else if (ge.value2) {
          // console.log('game end');
          this.gameEnd(ge.value2, ge.score);
        }
      },
      _ => {
        // console.log(error);
        this.gameEnd(-1);
      }
    );
    this.start();
  }

  buttonState(): string {
    if (!this.playing) {
      return 'lost';
    }
    if (!this.loading) {
      return '';
    }
    return 'waiting';
  }

  start(): void {
    this.gameSocket.startGame()
      .then(() => {
        this.actualScore = 0;
        this.playing = true;
        this.loading = false;
        this.firstWord = true;
      });
  }

  private gameEnd(value2: number, score: number = -1): void {
    rollNumber(value2, 800, n => this.card2.score = n);
    this.wordAnimation.end({ oldScore: value2 })
      .then(() => {
        this.log('The game is ended. ' + (score >= 0 ? `Your score is ${score}` : 'With a server error.'));
        this.gameSocket.disconnect();
        this.sub?.unsubscribe();
        this.sub = undefined;
        this.playing = false;
        this.loading = false;
      });
  }

  response(value: number): void {
    this.loading = true;
    this.gameSocket.answer(value);
  }

  private next(newWord: string, oldScore: number): void {
    this.wordAnimation.next({ oldScore, newWord })
      .then(() => {
        setTimeout(() => {
          // console.log('Timeout ended');
          this.card = this.card2;
          this.card.score = oldScore;
          this.card2 = {
            word: newWord
          };
          this.loading = false;
        }, 200);
      });
  }

  private async setTimer(milliseconds: number): Promise<void> {
    const progressBarMax = 100;
    const frames = 200;
    const delta = progressBarMax / frames;
    const deltaT = Math.floor(milliseconds / frames);
    const timer$ = interval(deltaT);

    this.sub?.unsubscribe();

    return new Promise<void>(resolve => {
      this.sub = timer$.subscribe((d) => {
        const currentValue = delta * d;
        const currentMillis = deltaT * d;
        this.timeLeft = milliseconds - currentMillis;
        this.progressbarValue = progressBarMax - currentValue;
        if (this.timeLeft <= 0 && this.sub !== null) {
          this.sub?.unsubscribe();
          this.sub = undefined;
          this.progressbarValue = 0;
          this.timeLeft = 0;
          resolve();
        }
      });
    });
  }
}
