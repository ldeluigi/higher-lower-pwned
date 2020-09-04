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
export class GameComponent implements OnInit, OnDestroy, AfterViewInit {
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

  ngAfterViewInit(): void {
    this.start();
  }

  ngOnDestroy(): void {
    // console.log('OnDestry', this.subscription);
    if (this.subscription !== null) {
      this.subscription.unsubscribe();
    }
    this.gameSocket.disconnect();
  }

  private log(message: string): void {
    this.snackBar.open(message, 'ok', {duration: 3000});
  }

  ngOnInit(): void {
    console.log('OnInit');
    this.subscription = this.gameSocket.game.subscribe(r => {
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
        this.setProgressBar(ng.timeout)
          .then(_ => {
            this.gameSocket.repeat();
          });
      } else if (ge.value2) {
        console.log('game end');
        this.gameEnd(ge.value2, ge.score);
      }
    },
      error => {
        console.log(error);
        this.gameEnd(-1);
      }
    );
  }

  start(): void {
    this.actualScore = 0;
    this.playing = true;
    this.loading = false;
    this.firstWord = true;
    this.gameSocket.startGame();
  }

  private gameEnd(value2: number, score: number = -1): void {
    this.rollNumber(value2, 800, n => this.card2.score = n);
    this.log('The game is ended. ' + (score >= 0 ?  `Your score is ${score}` : 'With a server error.'));
    this.gameSocket.disconnect();
    this.sub?.unsubscribe();
    this.sub = null;
    this.playing = false;
  }

  response(value: number): void {
    this.loading = true;
    this.gameSocket.answer(value);
  }

  private next(newWord: string, oldScore: number): void {
    this.rollNumber(oldScore, 600, n => this.card2.score = n);
    console.log('Timeout started');
    setTimeout(() => {
      console.log('Timeout ended');
      this.card = this.card2;
      this.card.score = oldScore;
      this.card2 = {
        word: newWord
      };
      this.loading = false;
    }, 800);
  }

  private rollNumber(end: number, time: number, update: (n: number) => void): void {
    const frames = 100;
    const delta = Math.floor(end / frames);
    const deltaT = Math.floor(time / frames);

    if (this.numberSubscription !== null) {
      this.numberSubscription.unsubscribe();
    }

    const timer$ = interval(deltaT);

    this.numberSubscription = timer$.subscribe(tic => {
      const newValue = delta * tic;
      update(newValue);
      if (newValue >= end) {
        update(end);
        this.numberSubscription?.unsubscribe();
      }
    });
  }

  private async setProgressBar(milliseconds: number): Promise<void> {
    const progressBarMax = 100;
    const frames = 100;
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
        if (currentValue >= frames && this.sub !== null) {
          this.sub.unsubscribe();
          this.sub = null;
          resolve();
        }
      });
    });

  }
}
