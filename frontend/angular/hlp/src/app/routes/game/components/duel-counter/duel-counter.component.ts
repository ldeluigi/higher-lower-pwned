import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameManagerService } from 'src/app/services/game-manager.service';
import { GameSocketService } from 'src/app/services/game-socket.service';
import { GameStatus } from '../../utils/gameStatus';

@Component({
  selector: 'app-duel-counter',
  templateUrl: './duel-counter.component.html',
  styleUrls: ['./duel-counter.component.scss']
})
export class DuelCounterComponent implements OnInit {

  @Input() player1Name: string | undefined = undefined;
  @Input() player2Name: string | undefined = undefined;
  @Input() player1Score!: number;
  @Input() player2Score!: number;

  private waitFor: GameStatus = GameStatus.END;
  private userScore = 0;
  private opponentScore = 0;
  private gameSub: Subscription | undefined;
  userAnimation = 'none';
  opponentAnimation = 'none';

  constructor(
      private socketService: GameSocketService,
      private gameManagerService: GameManagerService
    ) { }

  ngOnInit(): void {
    this.setupAnimation();
  }

  private setupAnimation(): void {
    this.socketService.gameDataUpdate.subscribe(data => {
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

    this.gameManagerService.gameStatusObservable.subscribe(s => {
      // verificare lo stato e resettare gli score quando una partita nuova comincia
      if (s === GameStatus.END && this.waitFor === GameStatus.END) {
        this.waitFor = GameStatus.IDLE;
        // TODO end game animation
        if (this.userScore > this.opponentScore) {
          // TODO user wins
          this.userAnimation = 'duelWin';
          this.opponentAnimation = 'duelLose';
        } else if (this.userScore < this.opponentScore) {
          // TODO oppoenent wins
          this.userAnimation = 'duelLose';
          this.opponentAnimation = 'duelWin';
        } else {
          // TODO draw
        }
      } else if (s === GameStatus.IDLE && this.waitFor === GameStatus.IDLE) {
        this.waitFor = GameStatus.END;
        // TODO internal score reset
        this.userScore = 0;
        this.opponentScore = 0;
        this.gameSub?.unsubscribe();
      }
    });
  }
}
