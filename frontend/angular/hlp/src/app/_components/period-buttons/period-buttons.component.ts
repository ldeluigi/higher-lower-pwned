import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-period-buttons',
  templateUrl: './period-buttons.component.html',
  styleUrls: ['./period-buttons.component.scss']
})
export class PeriodButtonsComponent implements OnInit {

  constructor() { }

  periods = ['day', 'week', 'month', 'year'];
  actualPeriod = 'week';

  @Output() period = new EventEmitter<string>();

  ngOnInit(): void {
  }

  onSelectPeriod(periodValue: string): void {
    this.period.emit(periodValue);
    this.actualPeriod = periodValue;
  }

  checkPeriod(p: string): boolean {
    return p === this.actualPeriod;
  }

}
