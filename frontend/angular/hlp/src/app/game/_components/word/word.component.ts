import { Component, OnInit, Input, SimpleChange, OnChanges } from '@angular/core';

@Component({
  selector: 'app-word',
  templateUrl: './word.component.html',
  styleUrls: ['./word.component.scss']
})
export class WordComponent implements OnInit, OnChanges {

  @Input() word = '';
  @Input() score = 0;
  @Input() showScore = false;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    for (const propName of Object.keys(changes)) {
      const changedProp = changes[propName];
      const to = JSON.stringify(changedProp.currentValue);
      if (changedProp.isFirstChange()) {
        console.log(to);
      } else {
        const from = JSON.stringify(changedProp.previousValue);
        console.log(from);
      }
    }
  }

}
