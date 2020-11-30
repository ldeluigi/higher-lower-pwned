import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {

  @ViewChild('sidenav') sidenav!: MatSidenav;
  private sub: Subscription | undefined;
  userLogged = false;

  constructor(
    private accountService: AccountService
  ) { }

  ngOnInit(): void {
    this.sub = this.accountService.user.subscribe(user => {
      this.userLogged = user !== null;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  logout(): void {
    this.accountService.logout();
  }

  get menuText(): string {
    const userValue =  this.accountService.userValue;
    return userValue === null ? 'Menu' : userValue.username;
  }

  onSwipeRight(): void {
    this.sidenav.toggle(true);
  }

  onSwipeLeft(): void {
    this.sidenav.toggle(false);
  }
}
