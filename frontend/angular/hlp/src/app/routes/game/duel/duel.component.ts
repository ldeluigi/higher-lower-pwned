import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';
import { GameManagerService } from 'src/app/services/game-manager.service';
import { GameSocketService } from 'src/app/services/game-socket.service';
import { DUEL } from '../model/const';
import { GameStatus } from '../utils/gameStatus';
import { ProgressBarHelper } from '../utils/progressBarHelper';

@Component({
  selector: 'app-duel',
  templateUrl: './duel.component.html',
  styleUrls: ['./duel.component.scss']
})
export class DuelComponent extends ProgressBarHelper implements OnInit, OnDestroy {

  gameSub: Subscription | undefined;

  name = 'YOU';
  opponentScore = 0;
  opponentName = 'OPPONENT';
  opponentLost = false;
  constructor(
    private snackBar: MatSnackBar,
    private accountService: AccountService,
    private gameSocket: GameSocketService,
    private gameManager: GameManagerService
  ) {
    super();
    this.name = this.accountService.userValue?.username || 'YOU';
    gameManager.setCurrentGameMode(DUEL);
  }

  ngOnInit(): void {
    this.gameSub = new Subscription();

    this.gameSub.add(this.gameSocket.timerObservable.subscribe(timer => {
      this.setProgressBarTimer(timer);
    }));

    this.gameSub.add(this.gameManager.gameStatusObservable.subscribe(ns => {
      if (ns !== GameStatus.PLAYING) {
        this.subTimer?.unsubscribe();
      }
      if (ns === GameStatus.LOST) {
        this.progressBarMax = 0;
      }
    }));

    this.gameSub.add(this.gameSocket.errorObservable.subscribe(err => this.log(`code:[${err.code}] desc:[${err.description}]`)));
  }

  get inGame(): boolean {
    return this.gameManager.currentGameStatus !== GameStatus.IDLE;
  }

  get displayTimer(): boolean {
    return this.gameManager.currentGameStatus === GameStatus.PLAYING;
  }

  get canStart(): boolean {
    return this.gameManager.currentGameStatus === GameStatus.IDLE;
  }

  get canQuit(): boolean {
    return this.gameManager.currentGameStatus === GameStatus.END
      || this.gameManager.currentGameStatus === GameStatus.LOST
      || this.gameManager.currentGameStatus === GameStatus.WAITING_START;
  }

  log(message: string, type: string = 'OK'): void {
    this.snackBar.open(message, type, { duration: 5000 });
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.gameSub?.unsubscribe();
  }

  start(): void {
    this.gameManager.startGame(DUEL)
      .subscribe(isStart => {
        if (!isStart) {
          this.gameManager.quit();
          // TODO Log game not started
          console.log('game not started!');
        }
      });
  }

  disconnect(): void {
    this.gameManager.quit();
    this.subTimer?.unsubscribe();
  }

  repeat(): void {
    this.gameManager.repeat();
  }
}
