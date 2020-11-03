import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mode-selector',
  templateUrl: './mode-selector.component.html',
  styleUrls: ['./mode-selector.component.scss']
})
export class ModeSelectorComponent {

  constructor(
    private router: Router
  ) { }

  isSelected(mode: string): boolean {
    switch (mode) {
      case 'arcade':
        return new RegExp('\/arcade\/').test(this.router.url);
      case 'duel':
        return new RegExp('\/duel\/').test(this.router.url);
      case 'battle':
        return new RegExp('\/battle\/').test(this.router.url);
      default:
        return new RegExp('\/global').test(this.router.url);
    }
  }

  getRouterLink(mode: string): string {
    if (mode === 'global') {
      return mode;
    }
    const url = this.router.url;
    if (url.endsWith('statistic')) {
      return `${mode}/statistic`;
    } else if (url.endsWith('leaderboard')) {
      return `${mode}/leaderboard`;
    }
    return mode;
  }

}
