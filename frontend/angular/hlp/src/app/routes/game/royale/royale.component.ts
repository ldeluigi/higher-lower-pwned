import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { LogLevel } from 'src/app/model/logLevel';
import { GameManagerService } from 'src/app/services/game-manager.service';
import { GameSocketService } from 'src/app/services/game-socket.service';
import { LogService } from 'src/app/services/log.service';
import { ROYALE } from '../model/gameModes';
import { GameStatus } from '../utils/gameStatus';
import { ProgressBarHelper } from '../utils/progressBarHelper';

@Component({
  selector: 'app-battle',
  templateUrl: './royale.component.html',
  styleUrls: ['./royale.component.scss']
})
export class RoyaleComponent extends ProgressBarHelper implements OnInit, OnDestroy {

  gameSub: Subscription | undefined;

  myName: string | undefined;

  constructor(
    private snackBar: MatSnackBar,
    private socketService: GameSocketService,
    private logService: LogService,
    private gameManagerService: GameManagerService
  ) {
    super();
    gameManagerService.setCurrentGameMode(ROYALE);
  }

  ngOnInit(): void {
    this.gameSub = new Subscription();
    this.gameSub.add(this.socketService.timerObservable.subscribe(timer => {
      this.setProgressBarTimer(timer);
    }));

    this.gameSub.add(this.gameManagerService.gameStatusObservable.subscribe(ns => {
      if (ns !== GameStatus.PLAYING) {
        this.subTimer?.unsubscribe();
      }
    }));
    // TODO find a good way to manage errors
    this.gameSub.add(this.socketService.errorObservable.subscribe(err => this.log(`code:[${err.code}] desc:[${err.description}]`)));
  }

  get displayTimer(): boolean {
    return this.gameManagerService.currentGameStatus === GameStatus.PLAYING;
  }

  get isWaitingStart(): boolean {
    return this.gameManagerService.currentGameStatus === GameStatus.WAITING_START;
  }

  get canExit(): boolean {
    return this.gameManagerService.currentGameStatus === GameStatus.LOST
      || this.gameManagerService.currentGameStatus === GameStatus.END;
  }

  get canRestart(): boolean {
    return this.gameManagerService.currentGameStatus === GameStatus.END
      || this.gameManagerService.currentGameStatus === GameStatus.LOST;
  }

  get canStartANewGame(): boolean {
    return this.gameManagerService.currentGameStatus === GameStatus.IDLE;
  }

  get inGame(): boolean {
    const cgs = this.gameManagerService.currentGameStatus;
    return cgs !== GameStatus.IDLE;
  }

  log(message: string, type: string = 'OK'): void {
    this.snackBar.open(message, type, { duration: 5000 });
  }

  ngOnDestroy(): void {
    this.quit();
    this.gameSub?.unsubscribe();
    this.gameManagerService.disconnect();
    this.subTimer?.unsubscribe();
  }

  start(): void {
    this.gameManagerService.startGame(ROYALE)
      .subscribe(isStart => {
        if (!isStart) {
          this.gameManagerService.quit();
          this.logService.log('game not started!', LogLevel.Error); // TODO check if Error
        }
      });
  }

  quit(): void {
    this.gameManagerService.quit();
    this.subTimer?.unsubscribe();
  }

  repeat(): void {
    this.gameManagerService.repeat();
  }

  isInGame(): boolean {
    const cgs = this.gameManagerService.currentGameStatus;
    return cgs === GameStatus.PLAYING || cgs === GameStatus.WAITING_N_GUESS;
  }
}
