import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from '../statistic/layout/layout.component';
import { ArcadeLayoutComponent } from './arcade/arcade-layout/arcade-layout.component';
import { LeadeboardComponent } from './_component/leaderboard/leadeboard.component';
import { StatsComponent } from './arcade/stats/stats.component';
import { GlobalStatisticComponent } from './global-statistic/global-statistic.component';

const routes: Routes = [
  {
    path: '', component: LayoutComponent,
    children: [
      {
        path: 'global', component: StatsComponent
      },
      {
        path: 'arcade',
        children: [
          { path: 'leaderboard', component: LeadeboardComponent, data: { mode: 'arcade' } },
          { path: '**', redirectTo: '/stats/arcade/leaderboard', pathMatch: 'full'},
        ]
      },
      {
        path: 'duel',
        children: [
          { path: 'leaderboard', component: LeadeboardComponent, data: { mode: 'duel' } },
          { path: '**', redirectTo: '/stats/duel/leaderboard', pathMatch: 'full'},
        ]
      },      {
        path: 'battle',
        children: [
          { path: 'leaderboard', component: LeadeboardComponent, data: { mode: 'royale' } },
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
