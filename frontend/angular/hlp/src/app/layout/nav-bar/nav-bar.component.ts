import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';
import { AccountService } from 'src/app/_services/account.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {

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

}
