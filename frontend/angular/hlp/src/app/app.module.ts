import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ErrorInterceptor } from './_helper/interceptor/error.interceptor';
import { JWTInterceptor } from './_helper/interceptor/jwt.interceptor';
import { AccountModule } from './routes/account/account.module';
import { UsersModule } from './routes/users/users.module';
import { GameModule } from './routes/game/game.module';

import { SharedModule } from './shared/shared.module';
import { StatsModule } from './routes/stats/stats.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HomeModule } from './routes/home/home.module';
import { LayoutComponent } from './layout/layout.component';

import { NavBarComponent } from './layout/nav-bar/nav-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    NavBarComponent
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
    BrowserAnimationsModule,
    HomeModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JWTInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
