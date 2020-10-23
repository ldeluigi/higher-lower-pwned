import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
  { path: 'arcade', component: LayoutComponent, data: { mode: 'arcade'}, },
  { path: 'duel', component: LayoutComponent, data: { mode: 'duel'}, },
  { path: 'arcade', component: LayoutComponent, data: { mode: 'arcade'}, },
  { path: '**', redirectTo: 'arcade' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GameRoutingModule { }
