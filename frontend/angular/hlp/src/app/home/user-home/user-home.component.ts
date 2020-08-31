import { Component, OnInit } from '@angular/core';
import { AccountService } from 'src/app/_services/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss']
})
export class UserHomeComponent implements OnInit {

  name = '';

  constructor(
    private router: Router,
    private accountService: AccountService
  ) { }

  ngOnInit(): void {
    this.accountService.user.subscribe(u => {
      if (u !== null) {
        this.name = u.username;
      }
    });
  }


}
