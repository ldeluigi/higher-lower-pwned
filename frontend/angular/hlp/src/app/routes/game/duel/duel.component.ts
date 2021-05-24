import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { LogLevel } from 'src/app/model/logLevel';
import { AccountService } from 'src/app/services/account.service';
import { GameManagerService } from 'src/app/services/game-manager.service';
import { GameSocketService } from 'src/app/services/game-socket.service';
import { LogService } from 'src/app/services/log.service';
import { errorToString } from '../model/error';
import { DUEL } from '../model/gameModes';
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
    private logService: LogService,
    private accountService: AccountService,
    private gameSocket: GameSocketService,
    private gameManager: GameManagerService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super(30000);
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
        this.resetProgressBarValue();
      }
    }));

    this.gameSub.add(this.gameSocket.errorObservable.subscribe(err => {
      this.logService.errorSnackBar(err);
      this.logService.log(errorToString(err), LogLevel.Error);
    }));

    this.route.data.pipe(first()).subscribe(elem => {
      if (elem.start) {
        this.start();
      }
    });
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

  get canRestart(): boolean {
    return this.gameManager.currentGameStatus === GameStatus.END
      || this.gameManager.currentGameStatus === GameStatus.LOST;
  }

  ngOnDestroy(): void {
    this.quit();
    this.gameSub?.unsubscribe();
  }

  start(): void {
    this.gameManager.startGame(DUEL)
      .subscribe(isStart => {
        if (!isStart) {
          this.gameManager.quit();
          this.logService.log('game not started!', LogLevel.Error);
          this.logService.errorSnackBar('Can\'t start the game.');
        }
      });
  }

  restart(): void {
    this.quit();
    setTimeout(() => {
      this.start();
    }, 100);
  }

  quit(): void {
    this.gameManager.quit();
    this.subTimer?.unsubscribe();
  }

  repeat(): void {
    this.gameManager.repeat();
  }
}
