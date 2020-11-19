import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { SocketArcade } from '../routes/game/SocketArcade';
import { SocketDuel } from '../routes/game/SocketDuel';
import { SocketRoyale } from '../routes/game/SocketRoyale';
import { GameStatus } from '../routes/game/utils/gameStatus';
import { ApiURLService } from './api-url.service';
import { GameSocketService } from './game-socket.service';
import { ARCADE, DUEL, ROYALE } from '../routes/game/model/const';
import { Guess } from '../routes/game/model/nextguess';

@Injectable({
  providedIn: 'root'
})
export class GameManagerService {

  private currentGameMode: string | undefined;
  private gameSub: Subscription | undefined;
  private gameStatusSubject: BehaviorSubject<GameStatus> = new BehaviorSubject<GameStatus>(GameStatus.IDLE);
  gameStatusObservable: Observable<GameStatus> = this.gameStatusSubject.asObservable();

  private nextGuessSubject: Subject<Guess> = new Subject<Guess>();
  nextGuessObservable = this.nextGuessSubject.asObservable();

  constructor(
    private socketService: GameSocketService,
    private apiURL: ApiURLService
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

  // start game
  async startGame(gameMode: string): Promise<void> {
    this.resetGame();
    this.gameStatusSubject.next(GameStatus.IDLE);
    let socket: Socket;
    this.currentGameMode = gameMode;
    switch (gameMode) {
      case ARCADE:
        socket = new SocketArcade(this.apiURL.socketApiUrl);
        break;
      case DUEL:
        socket = new SocketDuel(this.apiURL.socketApiUrl);
        break;
      case ROYALE:
        socket = new SocketRoyale(this.apiURL.socketApiUrl);
        break;
      default:
        throw new Error(`Illegal argument [${gameMode}]`);
    }
    await this.socketService.setup(socket)
      .then(() => {
        this.setupGameSubscription();
        this.socketService.startGame();
        return;
      });
  }

  private resetGame(): void {
    this.gameSub?.unsubscribe();
    this.currentGameMode = undefined;
    this.disconnect();
  }

  repeat(): void {
    this.socketService.repeat();
  }

  private setupGameSubscription(): void {
    this.gameSub?.unsubscribe();
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
          this.gameStatusSubject.next(GameStatus.END);
          this.disconnect();
        })
      );
    } else {                                            // DUEL and ROYALE mode
      this.gameStatusSubject.next(GameStatus.WAITING_START);

      this.gameSub.add(
        this.socketService.nextBattleGuessObservable.subscribe(ng => {
          if (this.currentGameStatus === GameStatus.WAITING_N_GUESS) {
              if (ng.lost && ng.lost) {
                this.gameStatusSubject.next(GameStatus.LOST);
              } else if (ng.score) {
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
