import { Component, OnInit, Input, SimpleChange, OnChanges } from '@angular/core';
import { trigger, state, style, animate, transition, AnimationEvent, AnimationTriggerMetadata } from '@angular/animations';

export interface CardData {
  word: string;
  score?: number;
}

@Component({
  selector: 'app-word',
  templateUrl: './word.component.html',
  styleUrls: ['./word.component.scss'],
  animations: [
    anim(),
    anim2(),
  ]
})
export class WordComponent implements OnInit {

  card: CardData = {} as CardData;
  newCard: CardData | boolean = false;
  dataNewCard: CardData = {} as CardData;

  emptyScore = '******';

  @Input('card')
  set onCardChange(card: CardData) {
    this.newCard = card;
    this.dataNewCard = card;
  }

  constructor() { }

  ngOnInit(): void {
  }

  getCard(card: CardData | boolean): CardData {
    return typeof card !== 'boolean' ? card : {
      word: ''
    };
  }

  onAnimationDone(event: AnimationEvent): void {
    if (this.newCard !== false) {
      // console.log('1=>', this.newCard, event);
      this.card = this.newCard as CardData;
      this.newCard = false;
      // this.dataNewCard = {} as CardData;
    }
  }
  onAnimation2Done(event: AnimationEvent): void {
    // console.log('2=>', this.newCard, event);
  }

}

const DURATION = '0.3s';

export function anim(): AnimationTriggerMetadata {
  return trigger('testAnim', [
     transition(':enter', [
       style({
          opacity: 0,
          transform: 'translateY(100%)'
        }),
        animate('0.5s', style({
          opacity: 0.9,
          transform: 'translateY(-100%)'
        }))
      ])
    ]);
}

export function anim2(): AnimationTriggerMetadata {
  return trigger('testAnim2', [
     transition('false => *', [
        animate('0.5s', style({
          opacity: 0,
          transform: 'translateY(-200%)'
        }))
      ])
    ]);
}

