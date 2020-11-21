import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subscription } from 'rxjs';
import { GameManagerService } from 'src/app/services/game-manager.service';
import { GameSocketService } from 'src/app/services/game-socket.service';
import { GameStatus } from '../utils/gameStatus';

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
  progressbarValue = 100;
  timeLeft = 0;
  private timerSub: Subscription | undefined;
  private gameSubs: Subscription | undefined;

  constructor(
    // private gameSocket: ArcadeSocketService,
    private snackBar: MatSnackBar,
    private socketService: GameSocketService,
    private gameManagerService: GameManagerService
  ) { }

  get playing(): boolean {
    const cgs = this.gameManagerService.currentGameStatus;
    return cgs === GameStatus.PLAYING || cgs === GameStatus.WAITING_N_GUESS;
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
    this.gameSubs?.unsubscribe();
    // this.gameSocket.disconnect();
    this.gameManagerService.quit();
  }


  ngOnInit(): void {
    this.setup();
    this.start();

    // console.log('OnInit');
    // this.subscription = this.gameSocket.game.subscribe(
    //   r => {
    //     const ng = r as NextGuess;
    //     const ge = r as GameEnd;
    //     if (ng.timeout) {
    //       if (this.firstWord) {
    //         this.firstWord = false;
    //         this.card = {
    //           word: ng.password1,
    //           score: ng.value1
    //         };
    //         this.card2 = {
    //           word: ng.password2
    //         };
    //         this.wordAnimation.gameSetup({ word1: ng.password1, word2: ng.password2, score1: ng.value1 });
    //       } else {
    //         this.next(ng.password2, ng.value1);
    //       }
    //       this.actualScore = ng.score;
    //       this.setTimer(ng.timeout)
    //         .then(_ => {
    //           this.gameSocket.repeat();
    //         });
    //     } else if (ge.value2) {
    //       // console.log('game end');
    //       this.gameEnd(ge.value2, ge.score);
    //     }
    //   },
    //   _ => {
    //     // console.log(error);
    //     this.gameEnd(-1);
    //   }
    // );
    // this.start();
  }

  replay(): void {
    this.setup();
    this.start();
  }

  private setup(): void {
    this.gameManagerService.quit();
    this.gameSubs = new Subscription();
    this.gameSubs.add(
      this.socketService.timerObservable.subscribe(nt => {
        this.timerSub?.unsubscribe();
        this.setTimer(nt).then(() => this.gameManagerService.repeat());
      })
    );
  }

  start(): void {
    this.gameManagerService.startGame('arcade');
  }

  get inGame(): boolean {
    const cgs = this.gameManagerService.currentGameStatus;
    return cgs !== GameStatus.IDLE;
  }

  // private gameEnd(value2: number, score: number = -1): void {
  //   rollNumber(value2, 800, n => this.card2.score = n);
  //   this.wordAnimation.end({ oldScore: value2 })
  //     .then(() => {
  //       this.log('The game is ended. ' + (score >= 0 ? `Your score is ${score}` : 'With a server error.'));
  //       this.gameSocket.disconnect();
  //       this.sub?.unsubscribe();
  //       this.sub = undefined;
  //     });
  // }

  // response(value: number): void {
  //   this.gameManagerService.answer(value);
  // }

  // private next(newWord: string, oldScore: number): void {
  //   this.wordAnimation.next({ oldScore, newWord })
  //     .then(() => {
  //       setTimeout(() => {
  //         this.card = this.card2;
  //         this.card.score = oldScore;
  //         this.card2 = {
  //           word: newWord
  //         };
  //       }, 200);
  //     });
  // }

  private async setTimer(milliseconds: number): Promise<void> {
    const progressBarMax = 100;
    const frames = 200;
    const delta = progressBarMax / frames;
    const deltaT = Math.floor(milliseconds / frames);
    const timer$ = interval(deltaT);

    this.timerSub?.unsubscribe();

    return new Promise<void>(resolve => {
      this.timerSub = timer$.subscribe((d) => {
        const currentValue = delta * d;
        const currentMillis = deltaT * d;
        this.timeLeft = milliseconds - currentMillis;
        this.progressbarValue = progressBarMax - currentValue;
        if (this.timeLeft <= 0 && this.timerSub !== null) {
          this.timerSub?.unsubscribe();
          this.timerSub = undefined;
          this.progressbarValue = 0;
          this.timeLeft = 0;
          resolve();
        }
      });
    });
  }
}
