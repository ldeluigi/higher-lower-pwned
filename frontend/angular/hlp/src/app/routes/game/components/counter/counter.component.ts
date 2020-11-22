import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { Subscription } from 'rxjs';
import { filter, first, take, takeUntil, takeWhile } from 'rxjs/operators';
import { AccountService } from 'src/app/services/account.service';
import { GameManagerService } from '../../../../services/game-manager.service';
import { GameSocketService } from '../../../../services/game-socket.service';
import { PlayerIdName } from '../../model/player-join';
import { GameStatus } from '../../utils/gameStatus';
import { rollNumber, slowDigitWord } from '../../utils/wordAnimation';
import { endGameAnimation } from './arcadeAnimation';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  animations: [
    endGameAnimation
  ]
})

export class CounterComponent implements OnInit, OnDestroy {

  counter = 0;
  endGameMessate = '';
  private timeoutValue: number | undefined;
  @Input() user: boolean | undefined;
  @Input() animation: boolean | undefined;
  animationState = 'none';
  name: string | undefined;
  private id: string | undefined;

  private counterSub: Subscription | undefined;
  private gameSub: Subscription | undefined;
  private gameStarted = false;

  constructor(
    private accountService: AccountService,
    private socketService: GameSocketService,
    private gameManagerService: GameManagerService
  ) { }

  ngOnInit(): void {
    this.gameSub = this.gameManagerService.gameStatusObservable.subscribe(nv => {
      if (nv === GameStatus.IDLE) {
        this.counter = 0;
        this.name = undefined;
        this.counterSub?.unsubscribe();
        this.setUp();
      }
    });
    this.setUp();
  }

  private setUp(): void {
    this.animationState = 'none';
    this.endGameMessate = '';
    clearTimeout(this.timeoutValue);
    if (this.user === undefined) {
      this.setupArcadeAnimation();
      this.counterSub = this.socketService.userScoreObservable.subscribe(n => this.updateScore(n));
    } else if (this.user && this.user === true) {
      this.counterSub = this.socketService.userScoreObservable.subscribe(n => this.updateScore(n));
      this.socketService.playerObservable.pipe(take(2)).subscribe(pd => this.addPlayerData(pd));
    } else {
      this.counterSub = this.socketService.gameDataUpdate.subscribe(gd => {
        if (this.id !== undefined) {
          const ID: string = this.id;
          const otherPlayer = gd.users.find(u => u.id.includes(ID));
          if (otherPlayer && otherPlayer.score) {
            this.updateScore(otherPlayer.score);
          }
        }
      });
      this.socketService.opponentsObservable.pipe(first()).subscribe(nps => {
        if (nps.length === 0) { // no one is waiting
          this.socketService.playerObservable.pipe(take(2)).subscribe(ed => this.addEnemyData(ed));
        } else { // some one is waiting
          nps.forEach(ed => this.addEnemyData(ed));
        }
      });
    }
  }

  private setupArcadeAnimation(): void {
    if (this.animation === true) {
      this.gameManagerService.gameStatusObservable
        .pipe(
          filter(x => x === GameStatus.END),
          first()
        )
        .subscribe(ns => {
          console.log(ns);
          if (ns === GameStatus.END) {
            if (this.counter > 0) {
              this.animationState = 'win';
            } else {
              this.animationState = 'lose';
            }
          }
        });
    }
  }

  private addEnemyData(p: PlayerIdName): void {
    if (!p.id.includes(this.socketService.socketId)) {
      this.id = p.id;
      this.name = p.name;
    }
  }

  private addPlayerData(p: PlayerIdName): void {
    if (p.id.includes(this.socketService.socketId)) {
      this.id = p.id;
      const playerName = this.accountService.userValue?.username;
      this.name = playerName ? playerName : p.name;
    }
  }

  private updateScore(newScore: number): void {
    rollNumber(newScore, 600, c => this.counter = c, this.counter);
  }

  ngOnDestroy(): void {
    this.counterSub?.unsubscribe();
    this.gameSub?.unsubscribe();
  }

  onArcadeEndGameAnimation(event: AnimationEvent): void {
    if (this.gameManagerService.currentGameStatus !== GameStatus.END) {
      return;
    }
    if (event.toState === 'win') {
      this.counterSub?.add(
        slowDigitWord(this.scoreToMessage(), 2000, s => this.endGameMessate = s)
      );
      this.startTimeoutReset();
    } else if (event.toState === 'lose') {
      this.counterSub?.add(
        slowDigitWord(this.scoreToMessage(), 2000, s => this.endGameMessate = s)
      );
      this.startTimeoutReset();
    }
  }

  private startTimeoutReset(value: number = 7000): void {
    this.timeoutValue = setTimeout(() => {
      this.endGameMessate = '';
      this.animationState = 'none';
    }, value);
  }

  private scoreToMessage(): string {
    if (this.counter === 0) {
      return 'Oh no...';
    }
    if (this.counter < 200) {
      return 'Better than nothing';
    }
    if (this.counter < 1000) {
      return 'Pretty good.';
    }
    if (this.counter < 1500) {
      return 'Nice score!';
    }
    if (this.counter < 2000) {
      return 'Good job!';
    }
    if (this.counter < 5000) {
      return 'Awesome!';
    }
    if (this.counter < 7500) {
      return 'Amazing!';
    }
    if (this.counter < 10000) {
      return 'Damn son!';
    }
    if (this.counter < 15000) {
      return 'How did you do that?';
    }
    return 'WOOOOOOHOOOOO!!!';
  }
}
