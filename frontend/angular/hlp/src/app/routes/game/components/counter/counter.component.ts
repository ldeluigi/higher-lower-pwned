import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { Subscription } from 'rxjs';
import { filter, first, take, takeUntil, takeWhile } from 'rxjs/operators';
import { AccountService } from 'src/app/services/account.service';
import { GameManagerService } from '../../../../services/game-manager.service';
import { GameSocketService } from '../../../../services/game-socket.service';
import { PlayerIdName } from '../../model/player-join';
import { GameStatus } from '../../utils/gameStatus';
import { rollNumber, slowDigitWord } from '../../utils/wordAnimation';
import { endGameAnimation } from './counterAnimation';
import { ARCADE, DUEL, ROYALE } from '../../model/const';

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
  @Input() animationState = 'none';
  @Output() animationStateChange = new EventEmitter<string>();
  name: string | undefined;
  private id: string | undefined;

  private counterSub: Subscription | undefined;
  private gameSub: Subscription | undefined;
  currentGameMode = '';

  // Royale
  imWinning = false;

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
    if (this.gameManagerService.currentGameMode === ARCADE) {
      this.currentGameMode = ARCADE;
      this.setupArcadeAnimation();
      this.counterSub = this.socketService.userScoreObservable.subscribe(n => this.updateScore(n));
    } else if (this.gameManagerService.currentGameMode === DUEL) {
      this.currentGameMode = DUEL;
      if (this.user) {
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
    } else if (this.gameManagerService.currentGameMode === ROYALE) {
      this.currentGameMode = ROYALE;
      this.setupRoyaleAnimation();
      this.counterSub = this.socketService.userScoreObservable.subscribe(n => this.updateScore(n));
    }
  }

  private setupRoyaleAnimation(): void {
    if (this.animation === true) {
      this.counterSub?.add(
        this.socketService.gameDataUpdate.subscribe(users => {
            if (users.users[0].score) {
              const scoreMax = Math.max(...users.users.map(e => e.score || 0.5));
              const myScore = users.users.find(p => p.id.includes(this.socketService.socketId))?.score;
              if (myScore) {
                this.imWinning = myScore >= scoreMax;
                console.log(myScore, scoreMax);
              }
            }
          })
      );

      this.gameManagerService.gameStatusObservable
        .pipe(
          filter(x => x === GameStatus.END),
          first()
        )
        .subscribe(ns => {
          if (ns === GameStatus.END) {
            if (this.imWinning) {
              this.animationState = 'win';
            } else {
              this.animationState = 'lose';
            }
            console.log(this.animationState);
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
      this.counterSub?.add(
        slowDigitWord(this.scoreToMessageRoyale(true), 2000, s => this.endGameMessate = s)
      );
      this.startTimeoutReset();
    } else if (event.toState === 'lose') {
      this.counterSub?.add(
        slowDigitWord(this.scoreToMessageRoyale(false), 2000, s => this.endGameMessate = s)
      );
      this.startTimeoutReset();
    }
  }

  private onArcadeEndGameAnimation(event: AnimationEvent): void {
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

  private onDuelEndGameAnimation(event: AnimationEvent): void {
    if (this.gameManagerService.currentGameStatus !== GameStatus.END) {
      return;
    }
    if (event.toState === 'duelUserWin') {
      if (this.user === true) {
        this.counterSub?.add(
          slowDigitWord('YOU WIN!', 2000, s => this.endGameMessate = s)
        );
      }
      this.startTimeoutReset();
    } else if (event.toState === 'duelUserLose') {
      if (this.user === true) {
        // opponent wins
        this.counterSub?.add(
          slowDigitWord('YOU LOSE!', 2000, s => this.endGameMessate = s)
        );
      }
      this.startTimeoutReset();
    } else if (event.toState === 'duelOppWin') {
      if (this.user === false) {
        this.counterSub?.add(
          slowDigitWord('WINNER!', 2000, s => this.endGameMessate = s)
        );
      }
      this.startTimeoutReset();
    } else if (event.toState === 'duelOppLose') {
      if (this.user === false) {
        // this.counterSub?.add(
        //   slowDigitWord('...', 2000, s => this.endGameMessate = s)
        // );
      }
      this.startTimeoutReset();
    } else if (event.toState === 'draw') {
      this.counterSub?.add(
        slowDigitWord('DRAW', 2000, s => this.endGameMessate = s)
      );
      this.startTimeoutReset();
    }
  }

  private startTimeoutReset(value: number = 7000): void {
    this.timeoutValue = setTimeout(() => {
      this.endGameMessate = '';
      this.animationState = 'none';
      this.animationStateChange?.emit('none');
    }, value);
  }

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
