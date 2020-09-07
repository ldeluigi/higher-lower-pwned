import { Component, OnInit, Input } from '@angular/core';
import { AnimationTriggerMetadata, trigger, transition, style, AnimationEvent, animate } from '@angular/animations';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  animations: [
    anim(),
    anim2()
  ]
})
export class CounterComponent implements OnInit {
  counter = 0;
  newCounter: number | boolean = false;

  constructor() { }

  ngOnInit(): void {
  }
  @Input('counter')
  set onCounterChange(counter: number) {
    if (this.counter !== counter) {
      this.newCounter = counter;
    }
  }

  onAnimationDone(event: AnimationEvent): void {
    // if (event.fromState === 'void') {
    if (this.newCounter !== false) {
      // console.log('1=>', this.newCounter, event);
      this.counter = this.newCounter as number;
      this.newCounter = false;
    }
    // this.cd.detectChanges();
  }

  onAnimation2Done(event: AnimationEvent): void {
      // console.log('2=>', this.newCounter, event);
  }
}

const DURATION = '0.3s';

export function anim(): AnimationTriggerMetadata {
  return trigger('testAnim', [

     transition(':enter', [
       style({
          opacity: 0,
          position: 'absolute',
          bottom: '-100%',
        }),
        animate('0.3s', style({
          opacity: 0.9,
          bottom: '0%'
        }))
      ])
    ]);
}

export function anim2(): AnimationTriggerMetadata {
  return trigger('testAnim2', [

     transition('false => *', [
        animate('0.3s', style({
          opacity: 0,
          bottom: '100%'
        }))
      ])
    ]);
}
