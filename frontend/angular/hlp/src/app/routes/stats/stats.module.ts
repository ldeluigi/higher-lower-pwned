import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { LayoutComponent } from './layout/layout.component';
import { LeadeboardComponent } from './leaderboard/leadeboard.component';
import { ModeSelectorComponent } from './mode-selector/mode-selector.component';
import { StatisticRoutingModule } from './stats-routing.module';
import { StatsComponent } from './stats/stats.component';
import { ViewSelectorComponent } from './view-selector/view-selector.component';




@NgModule({
  declarations: [
    LeadeboardComponent,
    StatsComponent,
    LayoutComponent,
    ViewSelectorComponent,
    ModeSelectorComponent
  ],
  imports: [
    StatisticRoutingModule,
    SharedModule
  ]
})
export class StatsModule { }
