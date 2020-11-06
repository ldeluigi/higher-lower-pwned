import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from '../stats/layout/layout.component';
import { LeadeboardComponent } from '../stats/leaderboard/leadeboard.component';
import { StatsComponent } from '../stats/stats/stats.component';
import { ViewSelectorComponent } from '../stats/mode-layout/view-selector.component';

const routes: Routes = [
  {
    path: '', component: LayoutComponent,
    children: [
      {
        path: 'statistics', component: ViewSelectorComponent, data: { mode: 'statistics' },
        children: [
          { path: 'global', component: StatsComponent, data: { mode: '' } },
          { path: 'arcade', component: StatsComponent, data: { mode: 'arcade' } },
          { path: 'duel', component: StatsComponent, data: { mode: 'duel' } },
          { path: 'royale', component: StatsComponent, data: { mode: 'royale' } },
          { path: '**', redirectTo: 'arcade' }
        ]
      },
      {
        path: 'leaderboard', component: ViewSelectorComponent, data: { mode: 'leaderboard' },
        children: [
          { path: 'arcade', component: LeadeboardComponent, data: { mode: 'arcade' } },
          { path: 'duel', component: LeadeboardComponent, data: { mode: 'duel' } },
          { path: 'royale', component: LeadeboardComponent, data: { mode: 'royale' } },
          { path: '**', redirectTo: 'arcade' }
        ]
      },
      {
        path: '**', redirectTo: '/stats/leaderboard/arcade', pathMatch: 'full'
      }
      // {
      //   path: 'global', component: StatsComponent, data: { mode: '' }
      // },
      // {
      //   path: 'arcade', component: LayoutComponent,
      //   children: [
      //     { path: 'leaderboard', component: LeadeboardComponent, data: { mode: 'arcade' } },
      //     { path: 'statistic', component: StatsComponent, data: {mode: 'arcade'} },
      //     { path: '**', redirectTo: '/stats/arcade/leaderboard', pathMatch: 'full'},
      //   ]
      // },
      // {
      //   path: 'duel', component: LayoutComponent,
      //   children: [
      //     { path: 'leaderboard', component: LeadeboardComponent, data: { mode: 'duel' } },
      //     { path: 'statistic', component: StatsComponent, data: {mode: 'duel'} },
      //     { path: '**', redirectTo: '/stats/duel/leaderboard', pathMatch: 'full'},
      //   ]
      // },
      // {
      //   path: 'battle', component: LayoutComponent,
      //   children: [
      //     { path: 'leaderboard', component: LeadeboardComponent, data: { mode: 'royale' } },
      //     { path: 'statistic', component: StatsComponent, data: {mode: 'royale'} },
      //     { path: '**', redirectTo: '/stats/battle/leaderboard', pathMatch: 'full'},
      //   ]
      // },
    ],
  },
  { path: '**', redirectTo: 'global' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StatisticRoutingModule { }
