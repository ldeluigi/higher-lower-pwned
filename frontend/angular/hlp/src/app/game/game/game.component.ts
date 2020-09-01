import { Component, OnInit, Type, OnDestroy } from '@angular/core';
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

  progressbarValue = 100;
  private sub: Subscription | null = null;
  private numberSubscription: Subscription | null = null;

  loading = true;
  playing = false;

  private subscription: Subscription | null = null;

  constructor(
    private gameSocket: GameSocketService,
    private snackBar: MatSnackBar
  ) { }

  ngOnDestroy(): void {
    console.log('OnDestry', this.subscription);
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
        if (this.card.word === '') {
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
        this.setProgressBar(ng.timeout);
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
    this.gameSocket.startGame();
    this.playing = true;
    this.loading = false;
  }

  private gameEnd(value2: number, score: number = -1): void {
    this.rollNumber(value2, 800, n => this.card2.score = n);
    this.log('The game is ended. ' + (score >= 0 ?  `Your score is ${score}` : 'With a server error.'));
    this.sub?.unsubscribe();
    this.sub = null;
    this.playing = false;
  }

  response(value: number): void {
    this.loading = true;
    this.gameSocket.answer(value);
  }

  private next(newWord: string, oldScore: number): void {
    // this.score = this.score + 1;
    // this.card2.score = oldScore.toString();
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
    const distance = end;
    const frames = 100;
    const delta = Math.floor(distance / frames);
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

  private setProgressBar(milliseconds: number): void {
    const time = milliseconds;
    const timer$ = interval(50);

    if (this.sub !== null) {
      this.sub.unsubscribe();
    }

    this.sub = timer$.subscribe((per) => {
      this.progressbarValue = 100 - (per * 50) * 100 / milliseconds;
      if (per * 50 >= milliseconds && this.sub !== null) {
        this.sub.unsubscribe();
        this.sub = null;
      }
    });
  }
}
