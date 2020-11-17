import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InfoComponent } from './info.component';
import { HowToPlayComponent } from './how-to-play/how-to-play.component';

const routes: Routes = [
  { path: 'how-to-play', component: HowToPlayComponent},
  { path: '', component: InfoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InfoRoutingModule { }
