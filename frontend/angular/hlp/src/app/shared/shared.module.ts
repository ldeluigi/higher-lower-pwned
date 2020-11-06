import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PeriodButtonsComponent } from './period-buttons/period-buttons.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { LoginButtonComponent } from './login-button/login-button.component';

import { MatButtonModule } from '@angular/material/button';

import { HistoryItemToEndDatePipe } from './pipe/history-item-to-end-date.pipe';
import { HistoryItemToStartDatePipe } from './pipe/history-item-to-start-date.pipe';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InputDialogComponent } from './input-dialog/input-dialog.component';

import { MatIconModule } from '@angular/material/icon';

import { MatSidenavModule } from '@angular/material/sidenav';
import {MatTooltipModule} from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


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
    MatIconModule,
    MatSidenavModule,
    MatTooltipModule,
    BrowserAnimationsModule
  ],
  declarations: [
    PeriodButtonsComponent,
    HistoryItemToEndDatePipe,
    HistoryItemToStartDatePipe,
    InputDialogComponent,
    LoginButtonComponent,
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
    MatIconModule,
    LoginButtonComponent,
    InputDialogComponent,
    MatSidenavModule,
    MatTooltipModule,
    BrowserAnimationsModule
  ]
})
export class SharedModule { }
