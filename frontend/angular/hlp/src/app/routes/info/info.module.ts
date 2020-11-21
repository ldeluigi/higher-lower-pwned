import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HowToPlayComponent } from './how-to-play/how-to-play.component';
import { InfoRoutingModule } from './info-routing.module';
import { InfoComponent } from './info.component';



@NgModule({
  declarations: [InfoComponent, HowToPlayComponent],
  imports: [
    CommonModule,
    InfoRoutingModule
  ]
})
export class InfoModule { }
