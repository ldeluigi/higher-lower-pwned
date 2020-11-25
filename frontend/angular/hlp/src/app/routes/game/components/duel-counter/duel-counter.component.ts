import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameManagerService } from 'src/app/services/game-manager.service';
import { GameSocketService } from 'src/app/services/game-socket.service';
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
      this.gameManagerService.gameStatusObservable.subscribe(s => {
        if (s === GameStatus.END && this.waitFor === GameStatus.END) {
          this.waitFor = GameStatus.IDLE;
          if (this.userScore > this.opponentScore) {
            console.log('WIN');
            this.userAnimation = 'duelUserWin';
            this.opponentAnimation = 'duelOppLose';
          } else if (this.userScore < this.opponentScore) {
            console.log('LOSE');
            this.userAnimation = 'duelUserLose';
            this.opponentAnimation = 'duelOppWin';
          } else {
            // TODO draw
            console.log('DRAW');
            this.userAnimation = 'draw';
            this.opponentAnimation = 'draw';
          }
        } else if (s === GameStatus.IDLE && this.waitFor === GameStatus.IDLE
          || this.waitFor === GameStatus.WAITING_START) {
          this.waitFor = GameStatus.END;
          // TODO internal score reset
          this.userScore = 0;
          this.opponentScore = 0;
        } else if (s === GameStatus.PLAYING) {
          this.waitFor = GameStatus.END;
        }
      })
    );
  }
}
