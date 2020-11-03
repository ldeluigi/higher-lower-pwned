import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LeadeboardComponent } from './leaderboard/leadeboard.component';
import { StatsComponent } from './stats/stats.component';
import { ViewSelectorComponent } from './mode-layout/view-selector.component';

const routes: Routes = [
  {
    path: '', component: LayoutComponent,
    children: [
      {
        path: 'global', component: StatsComponent, data: { mode: '' }
      },
      {
        path: 'arcade', component: ViewSelectorComponent,
        children: [
          { path: 'leaderboard', component: LeadeboardComponent, data: { mode: 'arcade' } },
          { path: 'statistic', component: StatsComponent, data: {mode: 'arcade'} },
          { path: '**', redirectTo: '/stats/arcade/leaderboard', pathMatch: 'full'},
        ]
      },
      {
        path: 'duel', component: ViewSelectorComponent,
        children: [
          { path: 'leaderboard', component: LeadeboardComponent, data: { mode: 'duel' } },
          { path: 'statistic', component: StatsComponent, data: {mode: 'duel'} },
          { path: '**', redirectTo: '/stats/duel/leaderboard', pathMatch: 'full'},
        ]
      },
      {
        path: 'battle', component: ViewSelectorComponent,
        children: [
          { path: 'leaderboard', component: LeadeboardComponent, data: { mode: 'royale' } },
          { path: 'statistic', component: StatsComponent, data: {mode: 'royale'} },
          { path: '**', redirectTo: '/stats/battle/leaderboard', pathMatch: 'full'},
        ]
      },
    ],
  },
  { path: '**', redirectTo: 'global' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatisticRoutingModule { }
