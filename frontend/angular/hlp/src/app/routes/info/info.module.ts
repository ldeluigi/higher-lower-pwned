import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InfoRoutingModule } from './info-routing.module';
import { InfoComponent } from './info.component';
import { HowToPlayComponent } from './how-to-play/how-to-play.component';


@NgModule({
  declarations: [InfoComponent, HowToPlayComponent],
  imports: [
    CommonModule,
    InfoRoutingModule
  ]
})
export class InfoModule { }
