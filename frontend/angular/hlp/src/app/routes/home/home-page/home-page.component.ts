import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AccountService } from 'src/app/services/account.service';
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
  ],
})
export class HomePageComponent implements OnInit {

  constructor(
    private accountService: AccountService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'double_sword',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/duel-samurai.svg'),
      );
    this.matIconRegistry.addSvgIcon(
      'royal_crown',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/crown.svg')
      );
    this.matIconRegistry.addSvgIcon(
      'single_sword',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/arcade.svg')
      );
  }

  ngOnInit(): void {
  }

  userIsLogged(): boolean {
    return this.accountService.userValue !== null;
  }
}
