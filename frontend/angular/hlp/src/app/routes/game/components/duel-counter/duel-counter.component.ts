import { Component, Input, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
  }

}
