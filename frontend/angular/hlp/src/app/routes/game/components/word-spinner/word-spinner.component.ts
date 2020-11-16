import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import { rollNumber, rollWord } from '../../utils/wordAnimation';
import { cardAnimation, vsAnimation, wordAnimation } from './animation';
import { GameSetup, EndGame, NextCard } from '../../model/animation';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export interface Card {
  word: string;
  score: string;
  status: string;
}

@Component({
  selector: 'app-word-spinner',
  templateUrl: './word-spinner.component.html',
  styleUrls: ['./word-spinner.component.scss'],
  animations: [
    vsAnimation,
    wordAnimation,
    cardAnimation,
  ]
})
export class WordSpinnerComponent {
  @Output() answerEmitter = new EventEmitter<number>();
  @Input() buttonEnable = true;

  private loading = false;
  moving = false;

  emptyScore = '******';
  element1: Card = {
    word: 'w1',
    score: '0',
    status: 'void'
  };
  element2: Card = {
    word: 'w2',
    score: '0',
    status: 'void'
  };
  newElement: Card = {
    word: 'w2',
    score: '0',
    status: 'void'
  };
  rotateVs = true;

  startPromise: undefined | ((value?: void | PromiseLike<void> | undefined) => void);
  nextPromise: undefined | ((value?: void | PromiseLike<void> | undefined) => void);
  endPromise: undefined | ((value?: void | PromiseLike<void> | undefined) => void);

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'punch_vs',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/recycle.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'arrows',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/double-arrow.svg')
    );
  }

  answer(wn: number): void {
    if (!this.loading && this.buttonEnable) {
      this.loading = true;
      this.answerEmitter.emit(wn);
    }
  }

  private rollVS(): void {
    this.rotateVs = !this.rotateVs;
  }

  async gameSetup(setup: GameSetup): Promise<void> {
    this.loading = false;
    this.moving = false;
    this.element1 = {
      word: setup.word1,
      score: setup.score1.toString(),
      status: 'start1'
    };
    this.element2 = {
      word: setup.word2,
      score: this.emptyScore,
      status: 'start2'
    };
    return new Promise<void>(r => this.startPromise = r);
  }

  async next(next: NextCard): Promise<void> {
    this.loading = false;
    this.moving = true;
    return new Promise<void>(r => {
      this.nextPromise = r;
      rollNumber(next.oldScore, 600, (n) => this.element2.score = n.toString())
        .then(() => {
          this.rollVS();
          this.newElement = {
            word: next.newWord,
            score: this.emptyScore,
            status: 'second'
          };

          this.element2.score = next.oldScore.toString();
          this.element2.status = 'first';
          console.log(this.element2.status);
          this.element1.status = 'out';
        });

    });
  }

  async end(end: EndGame): Promise<void> {
    this.moving = false;
    // console.log('moving' + this.moving);
    return new Promise<void>(r => {
      this.endPromise = r;
      rollNumber(end.oldScore, 600, (n) => this.element2.score = n.toString())
        .then(() => {
          if (this.endPromise) {
            this.endPromise();
            this.endPromise = undefined;
          }
          /** qui si possono mettere effetti di fine partita, come su mobile */

          this.element1.status = 'dummy';
          this.element2.status = 'dummy';
        });
    });
  }

  onAnimationListDone(event: AnimationEvent): void {
    // console.log(event);
    this.moving = false;
    // console.log(this.moving);
    if (event.toState === 'out') {
      this.element1.score = this.element2.score;
      this.element1.word = this.element2.word;
      this.element1.status = 'first';
      this.element2.status = 'second';
      console.log(this.element2.status);
      this.element2.score = this.emptyScore;
      if (this.nextPromise) {
        this.nextPromise();
        this.nextPromise = undefined;
      }
    } else if (event.toState === 'start1') {
      if (this.startPromise) {
        this.startPromise();
        this.startPromise = undefined;
      }
    }
    if (event.fromState === 'first' && event.toState === 'second') {
      this.loading = false;
      rollWord(this.newElement.word, 300, w => this.element2.word = w);
    }
  }
}
