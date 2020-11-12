import { Component, OnInit, Input } from '@angular/core';
import { rollNumber } from '../../utils/wordAnimation';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  animations: [
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
    rollNumber(counter, 600, c => this.counter = c, this.counter);
  }

}
