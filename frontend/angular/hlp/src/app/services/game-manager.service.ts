import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, pipe, Subject, Subscription } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { ARCADE, DUEL, ROYALE } from '../routes/game/model/gameModes';
import { Guess } from '../routes/game/model/gameDTO';
import { GameStatus } from '../routes/game/utils/gameStatus';
import { ApiURLService } from './api-url.service';
import { GameSocketService } from './game-socket.service';
import { LogService } from './log.service';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class GameManagerService {

  currentGameMode: string | undefined;
  private gameSub: Subscription | undefined;
  private gameStatusSubject: BehaviorSubject<GameStatus> = new BehaviorSubject<GameStatus>(GameStatus.IDLE);
  gameStatusObservable: Observable<GameStatus> = this.gameStatusSubject.asObservable();

  private nextGuessSubject: Subject<Guess> = new Subject<Guess>();
  nextGuessObservable = this.nextGuessSubject.asObservable();

  constructor(
    private socketService: GameSocketService,
    private accountService: AccountService,
    private logService: LogService,
  ) { }

  get currentGameStatus(): GameStatus {
    return this.gameStatusSubject.value;
  }

  answer(answer: number): void {
    if (this.currentGameStatus === GameStatus.PLAYING) {
      this.socketService.answer(answer);
      this.gameStatusSubject.next(GameStatus.WAITING_N_GUESS);
    }
  }

  quit(): void {
    this.disconnect();
    this.gameStatusSubject.next(GameStatus.IDLE);
  }

  disconnect(): void {
    this.socketService.disconnect();
  }

  setCurrentGameMode(gameMode: string): void {
    this.currentGameMode = gameMode;
  }

  // start game
  startGame(gameMode: string): Observable<boolean> {
    this.resetGame();
    this.gameStatusSubject.next(GameStatus.IDLE);
    this.currentGameMode = gameMode;
    return this.socketService.setup(gameMode)
      .pipe(first())
      .pipe(map(res => {
        if (res) {
          this.setupGameSubscription();
          this.socketService.startGame();
        }
        return res;
      }));
  }

  private resetGame(): void {
    this.gameSub?.unsubscribe();
    this.disconnect();
  }

  repeat(): void {
    this.socketService.repeat();
  }

  private setupGameSubscription(): void {
    this.gameSub = new Subscription();
    if (this.currentGameMode === ARCADE) {              // ARCADE mode
      this.gameStatusSubject.next(GameStatus.PLAYING);
      this.gameSub.add(
        this.socketService.simpleNextGuessObservable.subscribe(ng => {
          if (this.currentGameStatus === GameStatus.WAITING_N_GUESS) {
            this.gameStatusSubject.next(GameStatus.PLAYING);
          }
          this.nextGuessSubject.next(ng);
        })
      );
      this.gameSub.add(
        this.socketService.gameEndObservable.subscribe(ge => { // game is ended I have lost
          if (this.accountService.userValue === null && ge.guesses <= 1 && this.currentGameMode === ARCADE) {
            this.logService.recommendALink('Do you want to learn how to play?', '/info/how-to-play');
          } else {
            console.log(this.accountService.userValue, ge.score, this.currentGameMode);
          }
          this.gameStatusSubject.next(GameStatus.END);
          this.disconnect();
        })
      );
    } else {                                            // DUEL and ROYALE mode
      this.gameStatusSubject.next(GameStatus.WAITING_START);
      this.gameSub.add(
        this.socketService.nextBattleGuessObservable.subscribe(ng => {
          if (ng.lost && ng.lost) {
            this.gameStatusSubject.next(GameStatus.LOST);
          } else if (this.currentGameStatus === GameStatus.WAITING_N_GUESS) {
            if (ng.score) {
              this.gameStatusSubject.next(GameStatus.PLAYING);
            }
          } else if (this.currentGameStatus === GameStatus.WAITING_START) {
            this.gameStatusSubject.next(GameStatus.PLAYING);
          }
          this.nextGuessSubject.next(ng);
        })
      );

      this.gameSub.add(
        this.socketService.gameEndObservable.subscribe(ge => { // game is ended I have lost
          this.gameStatusSubject.next(GameStatus.END);
          this.disconnect();
        })
      );
    }
  }
}
