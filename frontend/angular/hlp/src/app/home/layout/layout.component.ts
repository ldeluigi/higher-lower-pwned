import { Component, OnInit } from '@angular/core';
import { AccountService } from 'src/app/_services/account.service';
import { fadeInFast, animationTitle1, animationTitle2, animationTitle3 } from './animation';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  animations: [
    animationTitle1(),
    animationTitle2(),
    animationTitle3(),
    fadeInFast()
  ]
})
export class LayoutComponent implements OnInit {

  constructor(
    private accountService: AccountService
  ) { }

  ngOnInit(): void {
  }

  userIsLogged(): boolean {
    return this.accountService.userValue !== null;
  }
}
