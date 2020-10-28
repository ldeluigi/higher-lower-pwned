import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeadeboardComponent } from './_component/leaderboard/leadeboard.component';
import { StatsComponent } from './_component/stats/stats.component';

import { StatisticRoutingModule } from './statistic-routing.module';

import { SharedModule } from '../shared/shared.module';
import { LayoutComponent } from './layout/layout.component';
import { ViewSelectorComponent } from './_component/mode-layout/view-selector.component';
import { ModeSelectorComponent } from './_component/mode-selector/mode-selector.component';


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
export class StatisticModule { }
