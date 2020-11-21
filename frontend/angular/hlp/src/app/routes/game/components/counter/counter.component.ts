import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { first, take } from 'rxjs/operators';
import { AccountService } from 'src/app/services/account.service';
import { GameManagerService } from '../../../../services/game-manager.service';
import { GameSocketService } from '../../../../services/game-socket.service';
import { PlayerIdName } from '../../model/player-join';
import { GameStatus } from '../../utils/gameStatus';
import { rollNumber } from '../../utils/wordAnimation';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  animations: [
  ]
})

export class CounterComponent implements OnInit, OnDestroy {

  counter = 0;
  newCounter: number | boolean = false;
  @Input() user: boolean | undefined;
  name: string | undefined;
  private id: string | undefined;

  private counterSub: Subscription | undefined;
  private gameSub: Subscription | undefined;
  private gameStarted = false;

  constructor(
    private accountService: AccountService,
    private socketService: GameSocketService,
    private gameManagerService: GameManagerService
  ) { }

  ngOnInit(): void {
    this.gameSub = this.gameManagerService.gameStatusObservable.subscribe(nv => {
      if (nv === GameStatus.IDLE) {
        this.counter = 0;
        this.name = undefined;
        this.counterSub?.unsubscribe();
        this.setUp();
      }
    });
    this.setUp();
  }

  private setUp(): void {
    if (this.user === undefined) {
      this.counterSub = this.socketService.userScoreObservable.subscribe(this.updateScore);
    } else if (this.user && this.user === true) {
      this.counterSub = this.socketService.userScoreObservable.subscribe(this.updateScore);
      this.socketService.playerObservable.pipe(take(2)).subscribe(nps => {
        this.addPlayerData(nps);
      });
    } else {
      this.counterSub = this.socketService.gameDataUpdate.subscribe(gd => {
        if (this.id !== undefined) {
          const ID: string = this.id;
          const otherPlayer = gd.users.find(u => u.id.includes(ID));
          if (otherPlayer && otherPlayer.score) {
            this.updateScore(otherPlayer.score);
          }
        }
      });
      this.socketService.opponentsObservable.pipe(first()).subscribe(nps => {
        if (nps.length === 0) { // no one is waiting
          this.socketService.playerObservable.pipe(take(2)).subscribe(np => {
            this.addEnemyData(np);
          });
        } else { // some one is waiting
          nps.forEach(np => {
            this.addEnemyData(np);
          });
        }
      });
    }
  }

  private addEnemyData(p: PlayerIdName): void {
    if (!p.id.includes(this.socketService.socketId)) {
      this.id = p.id;
      this.name = p.name;
    }
  }

  private addPlayerData(p: PlayerIdName): void {
    if (p.id.includes(this.socketService.socketId)) {
      this.id = p.id;
      const playerName = this.accountService.userValue?.username;
      this.name = playerName ? playerName : p.name;
    }
  }

  private updateScore = (newScore: number) => rollNumber(newScore, 600, c => this.counter = c, this.counter);

  ngOnDestroy(): void {
    this.counterSub?.unsubscribe();
    this.gameSub?.unsubscribe();
  }
}
