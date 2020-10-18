import { Component, Input, OnInit } from '@angular/core';

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

  @Input() players!: Player[];

  constructor() { }


  playerStatus(player: Player): string {
    if (player.haveLost) {
      return 'lost';
    } else if (this.players.filter(p => !p.haveLost).some(p => p.guesses > player.guesses)) {
      return 'behind';
    } else {
      return '';
    }
  }
}
