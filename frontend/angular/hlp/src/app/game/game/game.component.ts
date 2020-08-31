import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  word: string[] = ['parola1', 'parola2'];
  score: number[] = [0, 1];
  show: boolean[] = [true, false];

  constructor() { }

  ngOnInit(): void {
  }

  up(): void {
    this.score[0] += 1;
    this.score[1] += 1;
    this.show= this.show.map(t => !t);
  }

  down(): void {
    this.score[0] -= 1;
    this.score[1] -= 1;
    this.show = this.show.map(t => !t);
  }
}
