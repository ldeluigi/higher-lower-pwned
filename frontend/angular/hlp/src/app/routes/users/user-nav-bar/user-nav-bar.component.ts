import { Component } from '@angular/core';
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
        return new RegExp('\/info').test(this.router.url);
      case 'stats':
        return new RegExp('\/stats').test(this.router.url);
      case 'score':
        return new RegExp('\/scores').test(this.router.url);
      default:
        return false;
    }
  }

}
