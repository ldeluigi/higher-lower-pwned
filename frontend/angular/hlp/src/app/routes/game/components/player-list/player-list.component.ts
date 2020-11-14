import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

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
export class PlayerListComponent {

  dataSource = new MatTableDataSource<Player>([]);
  displayedColumns = ['Rank', 'Name'];

  constructor() { }

  addPlayer(player: Player): void {
    if (!this.dataSource.data.some(p => p.name === player.name)) {
      this.dataSource.data.push(player);
      this.dataSource.data = this.dataSource.data; // To update the view
    }
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
