import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PeriodButtonsComponent } from '../_components/period-buttons/period-buttons.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

import { MatButtonModule } from '@angular/material/button';

import { HistoryItemToEndDatePipe } from '../_helper/history-item-to-end-date.pipe';
import { HistoryItemToStartDatePipe } from '../_helper/history-item-to-start-date.pipe';


@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule
  ],
  declarations: [
    PeriodButtonsComponent,
    HistoryItemToEndDatePipe,
    HistoryItemToStartDatePipe
  ],
  providers: [
    HistoryItemToEndDatePipe,
    HistoryItemToStartDatePipe,
    DatePipe
  ],
  exports: [
    PeriodButtonsComponent,
    MatButtonModule,
    MatButtonToggleModule,
    HistoryItemToEndDatePipe,
    HistoryItemToStartDatePipe
  ]
})
export class SharedModule { }
