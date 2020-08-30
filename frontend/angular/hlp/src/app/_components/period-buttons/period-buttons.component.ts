import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-period-buttons',
  templateUrl: './period-buttons.component.html'
})
export class PeriodButtonsComponent implements OnInit {
  public selectedVal = 'week';
  periods = ['day', 'week', 'month', 'year'];

  constructor() { }


  @Output() period = new EventEmitter<string>();

  ngOnInit(): void {
  }

  onSelectPeriod(periodValue: string): void {
    this.period.emit(periodValue);
  }

}
