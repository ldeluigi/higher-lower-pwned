import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-period-buttons',
  templateUrl: './period-buttons.component.html',
  styleUrls: ['./period-buttons.component.scss'],
})
export class PeriodButtonsComponent implements OnInit {
  public selectedVal = 'week';
  periods = ['day', 'week', 'month', 'year', 'always'];

  constructor() { }

  @Output() period = new EventEmitter<string>();

  convertPeriod(periodValue: string): string {
    if (this.periods.includes(periodValue)){
      if (periodValue === 'always') {
        return 'forever'
      }
      return periodValue;
    } else {
      return this.selectedVal;
    }
  }

  ngOnInit(): void {
  }

  onSelectPeriod(periodValue: string): void {
    this.period.emit(this.convertPeriod(periodValue));
  }

}
