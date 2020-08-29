import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/_services/account.service';

@Component({
  selector: 'app-login-button',
  templateUrl: './login-button.component.html',
  styleUrls: ['./login-button.component.scss']
})
export class LoginButtonComponent implements OnInit {

  userLogged = false;

  constructor(
    private router: Router,
    private accountService: AccountService
  ) {
    this.accountService.user.subscribe(user => {
      this.userLogged = user != null;
    });
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.accountService.logout();
  }
}
