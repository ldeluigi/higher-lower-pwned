import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter, first, take, takeUntil, takeWhile } from 'rxjs/operators';
import { AccountService } from 'src/app/services/account.service';
import { GameManagerService } from '../../../../services/game-manager.service';
import { GameSocketService } from '../../../../services/game-socket.service';
import { PlayerIdName } from '../../model/player-join';
import { GameStatus } from '../../utils/gameStatus';
import { rollNumber, slowDigitWord } from '../../utils/wordAnimation';
import { endGameAnimation } from './counterAnimation';
import { ARCADE, DUEL, ROYALE } from '../../model/gameModes';
import { DRAW, LOSE, WON } from '../../model/gameDTO';
import { LogService } from 'src/app/services/log.service';
import { LogLevel } from 'src/app/model/logLevel';

import { Counter } from './counterInterface';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  animations: [
    endGameAnimation
  ]
})

export class CounterComponent implements OnInit, OnDestroy, Counter {

  readonly END_GAME_TIMER = 7000;
  readonly WORD_ANIMATION_TIME = 2000;

  counter = 0;
  endGameMessate = '';
  private timeoutValue: number | undefined;
  @Input() user: boolean | undefined;
  @Input() animation: boolean | undefined;
  @Input() animationState = 'none';
  @Output() animationStateChange = new EventEmitter<string>();
  name: string | undefined;

  private subscription: Subscription;
  currentGameMode = '';

  private onDestroy: Subject<boolean>;
  destroyObeservable: Observable<boolean>;

  constructor(
    private logService: LogService,
    private gameManagerService: GameManagerService
  ) {
    this.subscription = new Subscription();
    this.onDestroy = new Subject();
    this.destroyObeservable = this.onDestroy.asObservable().pipe(first());
  }

  ngOnInit(): void {
    // this.gameSub = this.gameManagerService.gameStatusObservable.subscribe(nv => {
    //   if (nv === GameStatus.IDLE) {
    //     this.counter = 0;
    //     this.name = undefined;
    //     this.counterSub?.unsubscribe();
    //     this.setUp();
    //   }
    // });
    // this.setUp();

    // TODO register the component to the manager
    if (this.gameManagerService.currentGameMode === ARCADE) {
      this.gameManagerService.registerCounter(this);
    } else if (this.gameManagerService.currentGameMode === DUEL) {
      if (this.user === true) {
        this.gameManagerService.registerCounter(this);
      } else {
        this.gameManagerService.registerOpponentCounter(this);
      }
    }
  }

  ngOnDestroy(): void {
    this.onDestroy.next(true);
    this.onDestroy.complete();
  }

  clear(): void {
    this.name = '';
    this.counter = 0;
    this.animationState = '';
    this.animationStateChange?.emit('none');
    this.endGameMessate = '';
    this.subscription.unsubscribe();
    this.subscription = new Subscription();
  }

  setUp(mode: string, name: string): void {
    this.counter = 0;
    this.animationState = 'none';
    this.animationStateChange?.emit('none');
    this.endGameMessate = '';
    this.currentGameMode = mode;
    clearTimeout(this.timeoutValue);
    if (this.currentGameMode === ARCADE) {
      // this.setupArcadeAnimation();
      // this.counterSub = this.socketService.userScoreObservable.subscribe(n => this.updateScore(n));
    } else if (this.currentGameMode === DUEL) {
      this.name = name;
      // if (this.user) {
      //   // case scores of the user
      //   this.counterSub = this.socketService.userScoreObservable.subscribe(n => this.updateScore(n));
      //   this.socketService.playerObservable.pipe(take(2)).subscribe(pd => this.addPlayerData(pd));
      // } else {
      //   // case scores of the opponent
      //   this.counterSub = this.socketService.gameDataUpdate.subscribe(gd => {
      //     if (this.id !== undefined) {
      //       const ID: string = this.id;
      //       const otherPlayer = gd.users.find(u => u.id.includes(ID));
      //       if (otherPlayer && otherPlayer.score) {
      //         this.updateScore(otherPlayer.score);
      //       }
      //       if (otherPlayer === undefined) {
      //         // other player is no longer present in the room
      //         this.name = undefined;
      //       }
      //     }
      //   });
      //   this.socketService.opponentsObservable.pipe(first()).subscribe(nps => {
      //     if (nps.length === 0) { // no one is waiting, so I wait for my + enemy data so I take 2
      //       this.socketService.playerObservable.pipe(take(2)).subscribe(ed => this.addEnemyData(ed));
      //     } else { // some one is waiting
      //       nps.forEach(ed => this.addEnemyData(ed));
      //     }
      //   });
      // }
    } else if (this.currentGameMode === ROYALE) {
      this.name = name;
      // this.setupRoyaleAnimation();
      // this.counterSub = this.socketService.userScoreObservable.subscribe(n => this.updateScore(n));
      // this.socketService.playerObservable.pipe(
      //   filter(p => p.id.includes(this.socketService.socketId),
      //   first()
      //   )
      // ).subscribe(ed => this.name = ed.name);
    }
  }

  private arcadeAnimation(): Subscription {
    // if (this.animation === true) {
    //   this.gameManagerService.gameEndObservable
    //     .subscribe(ns => {
    //         this.counter = ns.score;
    //         if (ns.score > 0) {
    //           this.animationState = 'win';
    //         } else {
    //           this.animationState = 'lose';
    //         }
    //     });
    // }
    return new Subscription();
  }

  private duelAnimation(type: string): Subscription {
    // TODO duel animaiton based on type
    return new Subscription();
  }

  private royaleAnimation(type: string): Subscription {
    // if (this.animation === true) {
    //   this.gameManagerService.gameEndObservable
    //     .subscribe(ge => {
    //         if (ge.gameEndStatus === WON) {
    //           this.animationState = 'win';
    //         } else if (ge.gameEndStatus === LOSE) {
    //           this.animationState = 'lose';
    //         } else if (ge.gameEndStatus === DRAW) {
    //           this.animationState = 'royaleDraw';
    //         }
    //         this.logService.log('Set animation to : ' + this.animationState, LogLevel.Debug); // TODO is it a debug?
    //     });
    // }
    return new Subscription();
  }

  // private addEnemyData(p: PlayerIdName): void {
  //   if (!p.id.includes(this.socketService.socketId)) {
  //     this.id = p.id;
  //     this.name = p.name;
  //   }
  // }

  // private addPlayerData(p: PlayerIdName): void {
  //   if (p.id.includes(this.socketService.socketId)) {
  //     this.id = p.id;
  //     const playerName = this.accountService.userValue?.username;
  //     this.name = playerName ? playerName : p.name;
  //   }
  // }

  updateScore(newScore: number): Subscription {

    return rollNumber(newScore, 600, c => this.counter = c, this.counter, undefined);
  }

  endGameAnimation(type?: string): Subscription {
    if (this.currentGameMode === ARCADE) {
      return this.arcadeAnimation();
    } else if (this.currentGameMode === DUEL && type) {
      return this.duelAnimation(type);
    } else if (this.currentGameMode === ROYALE && type) {
      return this.royaleAnimation(type);
    }
    throw new Error('Invalid argument!');
  }

  onAnimationEnd(event: AnimationEvent): void {
    if (this.currentGameMode === ARCADE) {
      this.onArcadeEndGameAnimation(event);
    } else if (this.currentGameMode === DUEL) {
      this.onDuelEndGameAnimation(event);
    } else if (this.currentGameMode === ROYALE) {
      this.onRoyaleEndGameAnimation(event);
    }
  }

  private onRoyaleEndGameAnimation(event: AnimationEvent): void {
    if (this.gameManagerService.currentGameStatus !== GameStatus.END) {
      return;
    }
    if (event.toState === 'win') {
      this.subscription.add(
        slowDigitWord(this.scoreToMessageRoyale(true), this.WORD_ANIMATION_TIME, s => this.endGameMessate = s)
      );
      this.startTimeoutReset();
    } else if (event.toState === 'lose') {
      this.subscription.add(
        slowDigitWord(this.scoreToMessageRoyale(false), this.WORD_ANIMATION_TIME, s => this.endGameMessate = s)
      );
      this.startTimeoutReset();
    } else if (event.toState === 'royaleDraw') {
      this.logService.log('end royaleDraw anim', LogLevel.Debug); // TODO is it a debug?
      this.subscription.add(
        slowDigitWord('DRAW', this.WORD_ANIMATION_TIME, s => this.endGameMessate = s)
      );
      this.startTimeoutReset();
    }
  }

  private onArcadeEndGameAnimation(event: AnimationEvent): void {
    if (this.gameManagerService.currentGameStatus !== GameStatus.END) {
      return;
    }
    if (event.toState === 'win') {
      this.subscription.add(
        slowDigitWord(this.scoreToMessage(), this.WORD_ANIMATION_TIME, s => this.endGameMessate = s)
      );
      this.startTimeoutReset();
    } else if (event.toState === 'lose') {
      this.subscription.add(
        slowDigitWord(this.scoreToMessage(), this.WORD_ANIMATION_TIME, s => this.endGameMessate = s)
      );
      this.startTimeoutReset();
    }
  }

  private onDuelEndGameAnimation(event: AnimationEvent): void {
    if (this.gameManagerService.currentGameStatus !== GameStatus.END) {
      return;
    }
    if (event.toState === 'duelUserWin') {
      if (this.user === true) {
        this.subscription.add(
          slowDigitWord('YOU WIN!', this.WORD_ANIMATION_TIME, s => this.endGameMessate = s)
        );
      }
      this.startTimeoutReset();
    } else if (event.toState === 'duelUserLose') {
      if (this.user === true) {
        // opponent wins
        this.subscription.add(
          slowDigitWord('YOU LOSE!', this.WORD_ANIMATION_TIME, s => this.endGameMessate = s)
        );
      }
      this.startTimeoutReset();
    } else if (event.toState === 'duelOppWin') {
      if (this.user === false) {
        this.subscription.add(
          slowDigitWord('WINNER!', this.WORD_ANIMATION_TIME, s => this.endGameMessate = s)
        );
      }
      this.startTimeoutReset();
    } else if (event.toState === 'duelOppLose') {
      if (this.user === false) {
        // this.subscription.add(
        //   slowDigitWord('...', WORD_ANIMATION_TIME, s => this.endGameMessate = s)
        // );
      }
      this.startTimeoutReset();
    } else if (event.toState === 'draw') {
      this.logService.log('end draw anim', LogLevel.Debug); // TODO is it debug?
      this.subscription.add(
        slowDigitWord('DRAW', this.WORD_ANIMATION_TIME, s => this.endGameMessate = s)
      );
      this.startTimeoutReset();
    }
  }

  private startTimeoutReset(value: number = this.END_GAME_TIMER): void {
    this.timeoutValue = setTimeout(() => {
      this.endGameMessate = '';
      this.animationState = 'none';
      this.animationStateChange?.emit('none');
      this.gameManagerService.quit();
    }, value);
  }

  // End game messages

  private scoreToMessage(): string {
    if (this.counter === 0) {
      return 'Oh no...';
    }
    if (this.counter < 200) {
      return 'Better than nothing...';
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

  private scoreToMessageRoyale(haveWin: boolean): string {
    if (haveWin) {
      if (this.counter === 0) {
        return 'Well...';
      }
      if (this.counter < 500) {
        return 'Lucky dude.';
      }
      if (this.counter < 1000) {
        return 'You win.';
      }
      if (this.counter < 5000) {
        return 'You deserve it!';
      }
      return 'WOOOOOOHOOOOO!!!';
    } else {
      if (this.counter === 0) {
        return 'Oh no...';
      }
      if (this.counter < 500) {
        return 'Not enough...';
      }
      if (this.counter < 1000) {
        return 'Unluky.';
      }
      if (this.counter < 5000) {
        return 'How they do that?';
      }
      return 'WOOOOOOHOOOOO!!!';
    }
  }
}
