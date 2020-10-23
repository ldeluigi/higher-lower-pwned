import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountModule } from './account/account.module';
import { AuthGuard } from './_helper/auth.guard';
import { LayoutComponent } from './home/layout/layout.component';
import { GameModule } from './game/game.module';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const usersModule = () => import('./users/users.module').then(x => x.UsersModule);
const gameModule = () => import('./game/game.module').then(x => x.GameModule);
const statsModule = () => import('./statistic/statistic.module').then(x => x.StatisticModule);

const routes: Routes = [
  { path: 'home', component: LayoutComponent },
  { path: 'account', loadChildren: accountModule },
  { path: 'users', loadChildren: usersModule, canActivate: [AuthGuard] },
  { path: 'game', loadChildren: gameModule},
  { path: 'stats', loadChildren: statsModule},
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
