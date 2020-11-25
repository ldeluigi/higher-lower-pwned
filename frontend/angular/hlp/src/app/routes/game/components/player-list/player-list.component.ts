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
  isPlayer: boolean;
  name: string;
  id: string;
  score: number;
  haveLost: boolean;
  timeout: number;
  guesses: number;
  arrow: string | undefined;
  position: number;
}

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent implements OnInit, OnDestroy {

  readonly ARROW_UP = 'keyboard_arrow_up';
  readonly ARROW_DOWN = 'keyboard_arrow_down';
  readonly ARROW_RIGHT = undefined;

  tempData: Player[] = [];
  displayedColumns = ['Rank', 'Name'];
  private dataSub: Subscription | undefined;
  items: Player[] = [];

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
    this.tempData = [];
    this.items = this.tempData;
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
    const pl = this.tempData;
    if (pl.every(p => !p.id.includes(np.id))) {
      const newPlayer: Player = {
        id: np.id,
        name: np.name,
        score: 0,
        guesses: 0,
        haveLost: false,
        timeout: 0,
        arrow: undefined,
        position: -1,
        isPlayer: np.id.includes(this.socketService.socketId)
      };
      pl.push(newPlayer);
      this.tempData = pl;
      this.items = this.tempData;
    }
  }

  private updateData(data: MultiplayerGameUpdate): void {
    data.users.forEach(user => {
      const localUser = this.tempData.find(u => u.id === user.id);
      if (localUser) {
        localUser.haveLost = user.lost;
        if (user.score) {
          localUser.score = user.score;
        }
        localUser.guesses = user.guesses;
      }
    });
    this.updateItems([...this.tempData].sort((p1, p2) => {
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
    }));
  }

  ngOnDestroy(): void {
    // close all
  }

  // based on player name
  removePlayer(player: Player): void {
    this.tempData = this.tempData.filter(p => p.name !== player.name);
    this.updateItems(this.tempData);
  }

  set list(players: Player[]) {
    this.tempData = players;
  }
  get list(): Player[] {
    return this.tempData;
  }

  clear(): void {
    this.tempData = [];
    this.items = this.tempData;
  }

  playerStatus(player: Player): string {
    if (player.haveLost) {
      return 'lost';
    } else if (this.tempData.filter(p => !p.haveLost).some(p => p.guesses > player.guesses)) {
      return 'behind';
    } else {
      return 'in-game';
    }
  }

  private updateItems(newList: Player[]): void {
    // console.log(newList, this.items);
    this.items.forEach((e, index) => e.position = index);
    newList.forEach((elem, index) => {
      const old = this.items.find(e => e.id === elem.id);
      // console.log(elem, old);
      if (old) {
        elem.arrow = old.position === index ? this.ARROW_RIGHT :
        (old.position < index ? this.ARROW_DOWN : this.ARROW_UP);
      }
      elem.position = index;
    });
    this.items = newList;
  }
}
