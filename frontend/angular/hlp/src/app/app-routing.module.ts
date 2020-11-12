import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './_helper/guards/auth.guard';
import { HomePageComponent } from './home/home-page/home-page.component';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const usersModule = () => import('./users/users.module').then(x => x.UsersModule);
const gameModule = () => import('./routes/game/game.module').then(x => x.GameModule);
const statsModule = () => import('./stats/stats.module').then(x => x.StatsModule);

const routes: Routes = [
  { path: 'home', component: HomePageComponent },
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
