import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


/** Material */
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
    RouterModule
  ],
})
export class HomeModule { }
