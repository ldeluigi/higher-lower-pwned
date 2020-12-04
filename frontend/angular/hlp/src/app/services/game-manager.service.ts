import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { first, map, take } from 'rxjs/operators';
import { ARCADE, DUEL, ROYALE } from '../routes/game/model/gameModes';
import { GameEnd, Guess } from '../routes/game/model/gameDTO';
import { GameStatus } from '../routes/game/utils/gameStatus';
import { GameSocketService } from './game-socket.service';
import { LogService } from './log.service';
import { LogLevel } from '../model/logLevel';
import { Counter } from '../routes/game/components/counter/counterInterface';
import { PlayerIdName } from '../routes/game/model/player-join';

@Injectable({
  providedIn: 'root'
})
export class GameManagerService {

  currentGameMode: string | undefined;
  private loadedGameMode: string | undefined;

  private gameSub: Subscription | undefined;

  private gameStatusSubject: BehaviorSubject<GameStatus>;
  gameStatusObservable: Observable<GameStatus>;

  private nextGuessSubject: Subject<Guess>;
  nextGuessObservable: Observable<Guess>;

  private gameEndSubject: Subject<GameEnd>;
  gameEndObservable: Observable<GameEnd>;

  private counter: Counter | undefined;
  private oppCounter: Counter | undefined;

  constructor(
    private socketService: GameSocketService,
    private logService: LogService
  ) {
    this.gameStatusSubject = new BehaviorSubject<GameStatus>(GameStatus.IDLE);
    this.gameStatusObservable = this.gameStatusSubject.asObservable().pipe(map(data => {
      this.logService.log('Log status', LogLevel.Debug, data);
      return data;
    }));

    this.nextGuessSubject = new Subject<Guess>();
    this.nextGuessObservable = this.nextGuessSubject.asObservable();

    this.gameEndSubject = new Subject<GameEnd>();
    this.gameEndObservable = this.gameEndSubject.asObservable();
  }

  get currentGameStatus(): GameStatus {
    return this.gameStatusSubject.value;
  }

  answer(answer: number): void {
    if (this.currentGameStatus === GameStatus.PLAYING) {
      this.gameStatusSubject.next(GameStatus.WAITING_N_GUESS);
      this.socketService.answer(answer);
      this.logService.log('Emit answer', LogLevel.Info);
    } else {
      this.logService.log('GM can\'t emit answer current mode is ' + this.currentGameStatus, LogLevel.Error);
    }
  }

  quit(): void {
    this.socketService.quit();
    this.logService.log('GM Quit', LogLevel.Info);
  }

  disconnect(): void {
    this.socketService.disconnect();
    this.gameStatusSubject.next(GameStatus.IDLE);
  }

  setCurrentGameMode(gameMode: string): void {
    this.currentGameMode = gameMode;
    this.setupGameSubscription();
  }

  // start game
  startGame(gameMode: string): Observable<boolean> {
    // this.resetGame();
    this.gameStatusSubject.next(GameStatus.IDLE);
    return this.socketService.setup(gameMode)
      .pipe(first())
      .pipe(map(res => {
        if (res) {
          this.socketService.startGame();
          if (this.currentGameMode === ARCADE) {
            this.gameStatusSubject.next(GameStatus.PLAYING);
          } else {
            this.gameStatusSubject.next(GameStatus.WAITING_START);
          }
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
    if (this.loadedGameMode === this.currentGameMode) {
      return;
    }
    this.logService.log('Start a setup in game-manager', LogLevel.Info);
    this.gameSub?.unsubscribe();
    this.gameSub = new Subscription();
    if (this.currentGameMode === ARCADE) {              // ARCADE mode
      this.gameSub.add(
        this.socketService.simpleNextGuessObservable.subscribe(ng => {
          if (this.currentGameStatus === GameStatus.WAITING_N_GUESS) {
            this.gameStatusSubject.next(GameStatus.PLAYING);
          }
          this.nextGuessSubject.next(ng);
        })
      );
      this.gameSub.add(
        this.socketService.gameEndObservable.subscribe(_ => { // game is ended I have lost
          this.gameStatusSubject.next(GameStatus.END);
        })
      );
    } else {

      if (this.currentGameMode === DUEL) {                                 // DUEL mode

        this.gameSub.add(
          this.socketService.gameDataUpdate.subscribe(gd => {
            const ID: string = this.socketService.socketId;
            // two players, the one that is not the user is the opponent
            const otherPlayer = gd.users.find(u => !u.id.includes(ID));
            if (otherPlayer && otherPlayer.score) {
              this.oppCounter?.updateScore(otherPlayer.score);
            }
            if (otherPlayer === undefined) {
              // other player is no longer present in the room
              this.oppCounter?.clear();
            }
            const userData = gd.users.find(u => u.id.includes(ID));
            if (userData && userData.score) {
              this.counter?.updateScore(userData.score);
            }
            if (userData === undefined) {
              this.counter?.clear();
            }
          })
        );
        this.gameSub.add(
          this.socketService.playerObservable.subscribe(ed => {
            this.addDuelPlayerData(ed);
          })
        );
        this.gameSub.add(
          this.socketService.opponentsObservable.pipe(first()).subscribe(nps => {
            nps.forEach(ed => this.addDuelPlayerData(ed));
          })
        );
        this.gameSub.add(
          this.gameStatusObservable.subscribe(gs => {
            if (gs === GameStatus.IDLE) {
              this.counter?.clear();
              this.oppCounter?.clear();
            }
          })
        );


      } else if (this.currentGameMode === ROYALE) { // ROYALE MODE

      }

      // DUEL and ROYALE mode

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
          console.log('Next guess from game manager');
        })
      );

      this.gameSub.add(
        this.socketService.gameEndObservable.subscribe(ge => { // game is ended
          if (this.currentGameStatus !== GameStatus.END) {
            this.logService.log('End game emit by gameManager', LogLevel.Info);
            this.gameStatusSubject.next(GameStatus.END);
            this.gameEndSubject.next(ge);
          }
        })
      );
    }
  }

  registerCounter(counter: Counter): void {
    console.log('register counter');
    this.counter = counter;
  }

  registerOpponentCounter(counter: Counter): void {

    console.log('register counter opp');
    this.oppCounter = counter;
  }

  private addDuelPlayerData(p: PlayerIdName): void {
    if (!p.id.includes(this.socketService.socketId)) {
      this.oppCounter?.setUp(DUEL, p.name);
      console.log('register counter opp name');
    } else if (p.id.includes(this.socketService.socketId)) {
      console.log('register counter name');
      this.counter?.setUp(DUEL, p.name);
    }
  }
}
