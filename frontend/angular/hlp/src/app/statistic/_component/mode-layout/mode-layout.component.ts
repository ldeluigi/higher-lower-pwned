import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mode-layout',
  templateUrl: './mode-layout.component.html',
  styleUrls: ['./mode-layout.component.scss']
})
export class ModeLayoutComponent {

  constructor(
    private router: Router
  ) { }

  isSelected(path: string): boolean {
    return this.router.url.endsWith(path);
  }
}
