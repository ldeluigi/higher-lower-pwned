import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-nav-bar',
  templateUrl: './user-nav-bar.component.html',
  styleUrls: ['./user-nav-bar.component.scss']
})
export class UserNavBarComponent {
  
  constructor(
    private router: Router
  ) { }

  isSelected(mode: string): boolean {
    switch (mode) {
      case 'info':
        return new RegExp('\/arcade').test(this.router.url);
      case 'stats':
        return new RegExp('\/duel').test(this.router.url);
      case 'score':
        return new RegExp('\/royale').test(this.router.url);
      default:
        return new RegExp('\/global').test(this.router.url);
    }
  }

}
