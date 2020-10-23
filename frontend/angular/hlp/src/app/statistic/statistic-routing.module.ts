import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from '../statistic/layout/layout.component';
import { ArcadeLayoutComponent } from './arcade/arcade-layout/arcade-layout.component';
import { LeadeboardComponent } from './arcade/leaderboard/leadeboard.component';
import { StatsComponent } from './arcade/stats/stats.component';
import { GlobalStatisticComponent } from './global-statistic/global-statistic.component';

const routes: Routes = [
  {
    path: '', component: LayoutComponent,
    children: [
      {
        path: 'global', component: GlobalStatisticComponent
      },
      {
        path: 'arcade', component: ArcadeLayoutComponent,
        children: [
          { path: 'statistic', component: StatsComponent },
          { path: 'leaderboard', component: LeadeboardComponent },
          { path: '**', redirectTo: '/stats/arcade/leaderboard', pathMatch: 'full'},
        ]
      },
      // {
      //   path: 'duel', component: DuelStatsComponent,
      //   children: [
      //     { path: 'statistic', component: DuelStatsComponent },
      //     { path: 'leaderboard', component: DuelLeaderboardComponent }
      //   ]
      // }
      // {
      //   path: 'battle', component: BattleStatsComponent,
      //   children: [
      //     { path: 'statistic', component: BattleStatsComponent },
      //     { path: 'leaderboard', component: BattleLeaderboardComponent }
      //   ]
      // }
    ],
  },
  { path: '**', redirectTo: 'global' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatisticRoutingModule { }
