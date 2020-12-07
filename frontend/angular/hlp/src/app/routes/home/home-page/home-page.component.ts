import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';
import { KeyPressDistributionService } from 'src/app/services/key-press-distribution.service';
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
export class HomePageComponent implements OnInit, OnDestroy {

  private keySub!: Subscription;

  constructor(
    private accountService: AccountService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private keyService: KeyPressDistributionService,
    private router: Router
  ) {
    this.matIconRegistry.addSvgIcon(
      'arcade_menu_icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/menu/arcade.svg'),
    );
    this.matIconRegistry.addSvgIcon(
      'duel_menu_icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/menu/duel.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'royale_menu_icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../assets/menu/battle-royale.svg')
    );


  }

  ngOnInit(): void {
    this.keySub = this.keyService.keyEventObs.subscribe(e => {
      if (e.key === 'Enter' || e.key === ' ') {
        this.router.navigate(['/game/arcade']);
      }
    });
  }

  ngOnDestroy(): void {
    this.keySub.unsubscribe();
  }

  userIsLogged(): boolean {
    return this.accountService.userValue !== null;
  }
}
