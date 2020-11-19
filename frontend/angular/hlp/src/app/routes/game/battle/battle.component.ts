import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameStatus } from '../utils/gameStatus';
import { GameManagerService } from 'src/app/services/game-manager.service';
import { GameSocketService } from 'src/app/services/game-socket.service';
import { ROYALE } from '../model/const';
import { ProgressBarHelper } from '../utils/progressBarHelper';

@Component({
  selector: 'app-battle',
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.scss']
})
export class BattleComponent extends ProgressBarHelper implements OnInit, OnDestroy {

  gameSub: Subscription | undefined;

  myName: string | undefined;

  constructor(
    private snackBar: MatSnackBar,
    private socketService: GameSocketService,
    private gameManagerService: GameManagerService
  ) {
    super();
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

  get canStartANewGame(): boolean {
    return this.gameManagerService.currentGameStatus === GameStatus.IDLE;
  }

  get inGame(): boolean {
    const cgs = this.gameManagerService.currentGameStatus;
    return cgs !== GameStatus.IDLE;
  }

  log(message: string, type: string = 'ok'): void {
    this.snackBar.open(message, type, { duration: 5000 });
  }

  ngOnDestroy(): void {
    this.quit();
    this.gameSub?.unsubscribe();
    this.gameManagerService.disconnect();
  }

  start(): void {
    this.gameManagerService.startGame(ROYALE);
  }

  quit(): void {
    this.gameManagerService.quit();
  }

  repeat(): void {
    this.gameManagerService.repeat();
  }

  isInGame(): boolean {
    const cgs = this.gameManagerService.currentGameStatus;
    return cgs === GameStatus.PLAYING || cgs === GameStatus.WAITING_N_GUESS;
  }
}
