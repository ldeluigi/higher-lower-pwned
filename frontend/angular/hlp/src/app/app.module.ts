import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ErrorInterceptor } from './_helper/interceptor/error.interceptor';
import { JWTInterceptor } from './_helper/interceptor/jwt.interceptor';
import { AccountModule } from './account/account.module';
import { UsersModule } from './users/users.module';
import { GameModule } from './routes/game/game.module';

import { LayoutComponent } from './home/layout/layout.component';
import { LinksComponent } from './home/links/links.component';
import { SharedModule } from './shared/shared.module';
import { StatsModule } from './stats/stats.module';

import { HomePageComponent } from './home/home-page/home-page.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NavBarComponent } from './home/nav-bar/nav-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    LinksComponent,
    HomePageComponent,
    NavBarComponent,
  ],
  imports: [
    AppRoutingModule,
    HttpClientModule,
    AccountModule,
    UsersModule,
    SharedModule,
    GameModule,
    StatsModule,
    BrowserModule,
    BrowserAnimationsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JWTInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
