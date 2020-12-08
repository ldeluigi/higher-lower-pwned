import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subscription } from 'rxjs';
import { LogLevel } from 'src/app/model/logLevel';
import { GameManagerService } from 'src/app/services/game-manager.service';
import { GameSocketService } from 'src/app/services/game-socket.service';
import { KeyPressDistributionService } from 'src/app/services/key-press-distribution.service';
import { LogService } from 'src/app/services/log.service';
import { ARCADE } from '../model/gameModes';
import { GameStatus } from '../utils/gameStatus';
import { ProgressBarHelper } from '../utils/progressBarHelper';

export interface CardData {
  word: string;
  score?: number;
}

@Component({
  selector: 'app-arcade',
  templateUrl: './arcade.component.html',
  styleUrls: ['./arcade.component.scss']
})
export class ArcadeComponent extends ProgressBarHelper implements OnInit, OnDestroy {

  private gameSubs: Subscription | undefined;
  private keySub!: Subscription;

  constructor(
    private socketService: GameSocketService,
    private logService: LogService,
    private gameManagerService: GameManagerService,
    private keyService: KeyPressDistributionService
  ) {
    super(undefined);
    gameManagerService.setCurrentGameMode(ARCADE);
  }

  get playing(): boolean {
    const cgs = this.gameManagerService.currentGameStatus;
    return cgs === GameStatus.PLAYING || cgs === GameStatus.WAITING_N_GUESS;
  }

  ngOnDestroy(): void {
    this.subTimer?.unsubscribe();
    this.gameSubs?.unsubscribe();
    // this.gameSocket.disconnect();
    this.gameManagerService.quit();
    this.keySub.unsubscribe();
  }

  ngOnInit(): void {
    this.setup();
    this.start();
    this.keySub = this.keyService.keyEventObs.subscribe(e => {
      if (!this.playing) {
        if (e.key === ' ' || e.key === 'Enter') {
          this.replay();
        }
      }
    });
  }

  replay(): void {
    this.setup();
    this.start();
  }

  private setup(): void {
    this.gameManagerService.quit();
    this.gameSubs?.unsubscribe();
    this.gameSubs = this.socketService.timerObservable.subscribe(nt => {
      this.subTimer?.unsubscribe();
      this.setProgressBarTimer(nt).then(() => this.gameManagerService.repeat());
    });
  }

  start(): void {
    this.resetProgressBarValue();
    this.gameManagerService.startGame(ARCADE)
      .subscribe(isStart => {
        if (!isStart) {
          this.gameManagerService.quit();
          this.logService.errorSnackBar('Can\'t start the game');
        }
      });
  }

  get inGame(): boolean {
    const cgs = this.gameManagerService.currentGameStatus;
    return cgs !== GameStatus.IDLE;
  }

  // private async setTimer(milliseconds: number): Promise<void> {
  //   const progressBarMax = 100;
  //   const frames = 200;
  //   const delta = progressBarMax / frames;
  //   const deltaT = Math.floor(milliseconds / frames);
  //   const timer$ = interval(deltaT);

  //   this.timerSub?.unsubscribe();

  //   return new Promise<void>(resolve => {
  //     this.timerSub = timer$.subscribe((d) => {
  //       const currentValue = delta * d;
  //       const currentMillis = deltaT * d;
  //       this.timeLeft = milliseconds - currentMillis;
  //       this.progressbarValue = progressBarMax - currentValue;
  //       if (this.timeLeft <= 0 && this.timerSub !== null) {
  //         this.timerSub?.unsubscribe();
  //         this.timerSub = undefined;
  //         this.progressbarValue = 0;
  //         this.timeLeft = 0;
  //         resolve();
  //       }
  //     });
  //   });
  // }
}
