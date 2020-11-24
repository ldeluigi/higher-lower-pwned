import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game-end-game-animation',
  templateUrl: './game-end-game-animation.component.html',
  styleUrls: ['./game-end-game-animation.component.scss']
})
export class GameEndGameAnimationComponent implements OnInit {

  @Input() show = false;
  @Input('newText')
  set setText(newText: string) {
    this.printText(newText);
  }
  text = '';

  constructor() { }

  ngOnInit(): void {
  }

  printText(text: string): void {
    this.text = text;
  }
}
