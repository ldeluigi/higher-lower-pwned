import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';
import { CardData } from '../_components/word/word.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  word = 'parolona';
  word2 = 'afnojw';
  score = 123;
  nothing = '****';
  id = 10;
  card: CardData = { word: this.word, score: this.score.toString() };
  card2: CardData = { word: 'fjesa', score: '****' };

  loading = false;

  constructor() { }

  ngOnInit(): void {
  }

  up(): void {
    this.loading = true;
  }

  down(): void {
    this.loading = true;
  }

  next(newWord: string, oldScore: number): void {
    this.score = this.score + 1;
    this.card2.score = this.score.toString();
    this.funTime(this.score, 500, n => this.card2.score = n.toString());
    setTimeout(() => {
      this.word = this.word2 + 'a';
      this.word2 = this.word2 + 'aa';
      this.card = this.card2;
      this.card.score = this.score.toString();
      this.card2 = {
        word: this.word2,
        score: '***'
      };
      this.loading = false;
    }, 2000);
  }

  private funTime(end: number, time: number, update: (n: number) => void): void {
    const distance = end;
    const frames = 100;
    let currentFrame = 0;
    const delta = Math.floor(distance / frames);
    const myTimer = setInterval(() => {
      if (currentFrame < frames) {
        update(currentFrame * delta);
      } else {
        update(end);
        clearInterval(myTimer);
      }
      currentFrame++;
    }, Math.floor(time / frames));
  }
}
