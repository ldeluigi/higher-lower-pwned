import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { first, takeWhile } from 'rxjs/operators';
import { GameManagerService } from 'src/app/services/game-manager.service';
import { GameSocketService } from 'src/app/services/game-socket.service';
import { MultiplayerGameUpdate } from '../../model/nextguess';
import { PlayerIdName } from '../../model/player-join';
import { GameStatus } from '../../utils/gameStatus';

export interface Player {
  name: string;
  id: string;
  score: number;
  haveLost: boolean;
  timeout: number;
  guesses: number;
}

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent implements OnInit, OnDestroy {

  dataSource = new MatTableDataSource<Player>([]);
  displayedColumns = ['Rank', 'Name'];
  private dataSub: Subscription | undefined;

  constructor(
    private socketService: GameSocketService,
    private gameManagerService: GameManagerService
  ) { }

  ngOnInit(): void {
    this.dataSub = this.socketService.playerObservable.subscribe(np => {
      // add new player to the list
      this.addPlayer(np);
    });
    this.dataSub.add(
      this.socketService.gameDataUpdate.subscribe(gd => {
        // update users score
        this.updateData(gd);
      })
    );
    this.setup();
  }

  private setup(): void {
    this.dataSource.data = [];
    this.socketService.opponentsObservable.pipe(first()).subscribe(ps => {
      // add all players already in the room
      ps.forEach(p => this.addPlayer(p));
    });
    this.gameManagerService.gameStatusObservable.pipe(takeWhile(v => v === GameStatus.END))
      .subscribe(s => {
        if (s === GameStatus.END) {
          this.setup();
        }
      });

  }

  private addPlayer(np: PlayerIdName): void {
    const pl = this.dataSource.data;
    if (pl.every(p => !p.id.includes(np.id))) {
      const newPlayer: Player = {
        id: np.id,
        name: np.name,
        score: 0,
        guesses: 0,
        haveLost: false,
        timeout: 0
      };
      pl.push(newPlayer);
      this.dataSource.data = pl;
    }
  }

  private updateData(data: MultiplayerGameUpdate): void {
    const list = this.dataSource.data;
    data.users.forEach(user => {
      const localUser = list.find(u => u.id === user.id);
      if (localUser) {
        localUser.haveLost = user.lost;
        if (user.score) {
          localUser.score = user.score;
        }
        localUser.guesses = user.guesses;
      }
    });
    this.dataSource.data = list.sort((p1, p2) => {
      if (p1.score === p2.score) {
        if (p1.guesses === p2.guesses) {
          if (p1.timeout === p2.timeout) {
            return p1.id > p2.id ? 1 : -1;
          } else {
            return p1.timeout - p2.timeout;
          }
        } else {
          return p2.guesses - p1.guesses;
        }
      } else {
        return p2.score - p1.score;
      }
    });
  }

  ngOnDestroy(): void {
    // close all
  }

  // based on player name
  removePlayer(player: Player): void {
    this.dataSource.data = this.dataSource.data.filter(p => p.name !== player.name);
  }

  set list(players: Player[]) {
    this.dataSource.data = players;
  }
  get list(): Player[] {
    return this.dataSource.data;
  }

  clear(): void {
    this.dataSource.data = [];
  }

  playerStatus(player: Player): string {
    if (player.haveLost) {
      return 'lost';
    } else if (this.dataSource.data.filter(p => !p.haveLost).some(p => p.guesses > player.guesses)) {
      return 'behind';
    } else {
      return 'in-game';
    }
  }
}
