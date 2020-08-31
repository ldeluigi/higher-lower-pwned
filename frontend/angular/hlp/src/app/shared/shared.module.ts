import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PeriodButtonsComponent } from '../_components/period-buttons/period-buttons.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

import { MatButtonModule } from '@angular/material/button';


@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule
  ],
  declarations: [
    PeriodButtonsComponent
  ],
  exports: [
    PeriodButtonsComponent,
    MatButtonModule,
    MatButtonToggleModule
  ]
})
export class SharedModule { }
