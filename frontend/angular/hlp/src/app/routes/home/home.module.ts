import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
/** Material */
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
/** Component declaration */
import { HomePageComponent } from './home-page/home-page.component';
import { LinksComponent } from './links/links.component';





@NgModule({
  declarations: [
    HomePageComponent,
    LinksComponent
  ],
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    BrowserAnimationsModule,
    MatTooltipModule
  ],
})
export class HomeModule { }
