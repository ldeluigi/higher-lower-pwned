import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PeriodButtonsComponent } from '../_components/period-buttons/period-buttons.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

import { MatButtonModule } from '@angular/material/button';

import { HistoryItemToEndDatePipe } from '../_helper/history-item-to-end-date.pipe';
import { HistoryItemToStartDatePipe } from '../_helper/history-item-to-start-date.pipe';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTableModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatCardModule,
    MatInputModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule
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
    HistoryItemToStartDatePipe,
    MatTableModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatCardModule,
    MatInputModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule
  ]
})
export class SharedModule { }
