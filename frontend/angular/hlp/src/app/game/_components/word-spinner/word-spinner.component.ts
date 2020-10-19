import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CardData } from '../../_components/word/word.component';
import { interval, Subscription } from 'rxjs';
import { trigger, state, style, animate, transition, AnimationEvent, AnimationTriggerMetadata } from '@angular/animations';
import { reduce } from 'rxjs/operators';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';
import Utils from '../../_utils/wordAnimation';
import { cardAnimation, vsAnimation, wordAnimation } from './animation';
import { GameSetup, EndGame, NextCard } from '../../_model/animation';

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
    vsAnimation(),
    wordAnimation(),
    cardAnimation(),
  ]
})
export class WordSpinnerComponent {
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
  ) {
  }


  private rollVS(): void {
    this.rotateVs = !this.rotateVs;
  }

  async gameSetup(setup: GameSetup): Promise<void> {
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
    return new Promise<void>(r => {
      this.nextPromise = r;
      Utils.rollNumber(next.oldScore, 600, (n) => this.element2.score = n.toString())
        .then(() => {
          this.rollVS();
          this.newElement = {
            word: next.newWord,
            score: this.emptyScore,
            status: 'second'
          };
          this.element2.score = next.oldScore.toString();
          this.element2.status = 'first';
          this.element1.status = 'out';
        });

    });
  }

  async end(end: EndGame): Promise<void> {
    return new Promise<void>(r => {
      this.endPromise = r;
      Utils.rollNumber(end.oldScore, 600, (n) => this.element2.score = n.toString())
        .then(() => {
          if (this.endPromise) {
            this.endPromise();
            this.endPromise = undefined;
          }
          /** qui si possono mettere effetti di fine partita, come su mobile */
        });
    });
  }

  onAnimationListDone(event: AnimationEvent): void {
    if (event.toState === 'out') {
      this.element1.score  = this.element2.score;
      this.element1.word = this.element2.word;
      this.element1.status = 'first';
      this.element2.status = 'second';
      Utils.rollWord(this.newElement.word, 600, w => this.element2.word = w);
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
  }
}
