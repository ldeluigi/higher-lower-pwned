import { Component, OnInit, Type, OnDestroy, AfterViewInit } from '@angular/core';
import { GameSocketService } from '../../_services/game-socket.service';
import { CardData } from '../_components/word/word.component';
import { GameEnd } from '../_model/gameEnd';
import { NextGuess } from '../_model/nextGuess';
import { Observable, interval, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
  card: CardData = { word: '', score: 0 };
  card2: CardData = { word: '' };
  actualScore = 0;

  progressbarValue = 100;
  timeLeft = 0;
  private sub: Subscription | null = null;
  private numberSubscription: Subscription | null = null;

  loading = true;
  playing = false;
  private firstWord = true;

  private subscription: Subscription | null = null;

  constructor(
    private gameSocket: GameSocketService,
    private snackBar: MatSnackBar
  ) { }

  ngOnDestroy(): void {
    // console.log('OnDestry', this.subscription);
    this.playing = false;
    if (this.subscription !== null) {
      this.subscription.unsubscribe();
    }
    this.gameSocket.disconnect();
  }

  private log(message: string): void {
    this.snackBar.open(message, 'ok', {duration: 3000});
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
      error => {
        // console.log(error);
        this.gameEnd(-1);
      }
    );
    this.start();
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
    this.rollNumber(value2, 800, n => this.card2.score = n);
    this.log('The game is ended. ' + (score >= 0 ?  `Your score is ${score}` : 'With a server error.'));
    this.gameSocket.disconnect();
    this.sub?.unsubscribe();
    this.sub = null;
    this.playing = false;
    this.loading = false;
  }

  response(value: number): void {
    this.loading = true;
    this.gameSocket.answer(value);
  }

  private next(newWord: string, oldScore: number): void {
    this.rollNumber(oldScore, 600, n => this.card2.score = n)
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

  private rollNumber(end: number, time: number, update: (n: number) => void): Promise<void> {
    const frames = 100;
    const delta = Math.floor(end / frames);
    const deltaT = Math.floor(time / frames);

    if (this.numberSubscription !== null) {
      this.numberSubscription.unsubscribe();
    }

    const timer$ = interval(deltaT);
    return new Promise<void>(resolve => {
      this.numberSubscription = timer$.subscribe(tic => {
        const newValue = delta * tic;
        update(newValue);
        if (newValue >= end) {
          update(end);
          this.numberSubscription?.unsubscribe();
          resolve();
        }
      });
    });
  }

  private async setTimer(milliseconds: number): Promise<void> {
    const progressBarMax = 100;
    const frames = 200;
    const delta = progressBarMax / frames;
    const deltaT = Math.floor(milliseconds / frames);
    const timer$ = interval(deltaT);

    if (this.sub !== null) {
      this.sub.unsubscribe();
    }

    return new Promise<void>(resolve => {
      this.sub = timer$.subscribe((d) => {
        const currentValue = delta * d;
        const currentMillis = deltaT * d;
        this.timeLeft = milliseconds - currentMillis;
        this.progressbarValue = progressBarMax - currentValue;
        if (this.timeLeft <= 0 && this.sub !== null) {
          this.sub.unsubscribe();
          this.sub = null;
          this.progressbarValue = 0;
          this.timeLeft = 0;
          resolve();
        }
      });
    });

  }
}
