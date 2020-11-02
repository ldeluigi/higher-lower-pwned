import { Component, OnInit } from '@angular/core';
import { AccountService } from 'src/app/_services/account.service';
import { animationTitle1, animationTitle2, animationTitle3, fadeInFast } from './animation';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  animations: [
    animationTitle1(),
    animationTitle2(),
    animationTitle3(),
    fadeInFast()
  ]
})
export class HomePageComponent implements OnInit {

  constructor(
    private accountService: AccountService
  ) { }

  ngOnInit(): void {
  }

  userIsLogged(): boolean {
    return this.accountService.userValue !== null;
  }
}
