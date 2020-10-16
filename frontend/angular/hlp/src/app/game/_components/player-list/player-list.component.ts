import { Component, Input, OnInit } from '@angular/core';

export interface Player {
  name: string;
  id: string;
  score: number;
  haveLost: boolean;
}

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent {

  @Input() players!: Player[];

  constructor() { }
}
