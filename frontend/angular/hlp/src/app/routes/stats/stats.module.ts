import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeadeboardComponent } from './leaderboard/leadeboard.component';
import { StatsComponent } from './stats/stats.component';

import { StatisticRoutingModule } from './stats-routing.module';

import { SharedModule } from '../../shared/shared.module';
import { LayoutComponent } from './layout/layout.component';
import { ViewSelectorComponent } from './mode-layout/view-selector.component';
import { ModeSelectorComponent } from './mode-selector/mode-selector.component';

@NgModule({
  declarations: [
    LeadeboardComponent,
    StatsComponent,
    LayoutComponent,
    ViewSelectorComponent,
    ModeSelectorComponent
  ],
  imports: [
    CommonModule,
    StatisticRoutingModule,
    SharedModule
  ]
})
export class StatsModule { }
