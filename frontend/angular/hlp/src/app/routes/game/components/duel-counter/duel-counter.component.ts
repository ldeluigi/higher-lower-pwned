import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogLevel } from 'src/app/model/logLevel';
import { GameManagerService } from 'src/app/services/game-manager.service';
import { GameSocketService } from 'src/app/services/game-socket.service';
import { LogService } from 'src/app/services/log.service';
import { DRAW, LOSE, WON } from '../../model/gameDTO';
import { GameStatus } from '../../utils/gameStatus';

@Component({
  selector: 'app-duel-counter',
  templateUrl: './duel-counter.component.html',
  styleUrls: ['./duel-counter.component.scss']
})
export class DuelCounterComponent implements OnInit, OnDestroy {

  @Input() player1Name: string | undefined = undefined;
  @Input() player2Name: string | undefined = undefined;
  @Input() player1Score!: number;
  @Input() player2Score!: number;

  private sub!: Subscription;
  private waitFor: GameStatus = GameStatus.END;
  private userScore = 0;
  private opponentScore = 0;
  userAnimation = 'none';
  opponentAnimation = 'none';

  constructor(
      private socketService: GameSocketService,
      private logService: LogService,
      private gameManagerService: GameManagerService
    ) { }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngOnInit(): void {
    this.sub = this.socketService.gameDataUpdate.subscribe(data => {
      data.users.forEach(u => {
        if (u.id.includes(this.socketService.socketId)) {
          if (u.score) {
            this.userScore = u.score;
          }
        } else {
          if (u.score) {
            this.opponentScore = u.score;
          }
        }
      });
    });

    this.sub.add(
      this.socketService.gameEndObservable
        .subscribe(eg => {
          this.logService.log('Duel-counter call animation NEW', LogLevel.Debug);
          if (eg.gameEndStatus === DRAW) {
            this.logService.log('DRAW', LogLevel.Debug);
            this.userAnimation = 'draw';
            this.opponentAnimation = 'draw';
          } else if (eg.gameEndStatus === WON) {
            this.logService.log('WON', LogLevel.Debug);
            this.userAnimation = 'duelUserWin';
            this.opponentAnimation = 'duelOppLose';
          } else if (eg.gameEndStatus === LOSE) {
            this.logService.log('LOSE', LogLevel.Debug);
            this.userAnimation = 'duelUserLose';
            this.opponentAnimation = 'duelOppWin';
          }
        })
    );

    this.sub.add(
      this.gameManagerService.gameStatusObservable.subscribe(s => {
        if (s === GameStatus.END && this.waitFor === GameStatus.END) {
          this.waitFor = GameStatus.IDLE;
        } else if ((s === GameStatus.IDLE && this.waitFor === GameStatus.IDLE)
          || this.waitFor === GameStatus.WAITING_START) {
          this.waitFor = GameStatus.END;
          this.userScore = 0;
          this.opponentScore = 0;
        } else if (s === GameStatus.PLAYING) {
          this.waitFor = GameStatus.END;
        }
      })
    );
  }
}
