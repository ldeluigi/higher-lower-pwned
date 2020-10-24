import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeadeboardComponent } from './_component/leaderboard/leadeboard.component';
import { StatsComponent } from './arcade/stats/stats.component';

import { StatisticRoutingModule } from './statistic-routing.module';

import { SharedModule } from '../shared/shared.module';
import { LayoutComponent } from './layout/layout.component';
import { ArcadeLayoutComponent } from './arcade/arcade-layout/arcade-layout.component';
import { GlobalStatisticComponent } from './global-statistic/global-statistic.component';


@NgModule({
  declarations: [
    LeadeboardComponent,
    StatsComponent,
    LayoutComponent,
    ArcadeLayoutComponent,
    GlobalStatisticComponent
  ],
  imports: [
    CommonModule,
    StatisticRoutingModule,
    SharedModule
  ]
})
export class StatisticModule { }
