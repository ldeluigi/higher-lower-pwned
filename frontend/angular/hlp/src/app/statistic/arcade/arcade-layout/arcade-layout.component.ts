import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-arcade-layout',
  templateUrl: './arcade-layout.component.html',
  styleUrls: ['./arcade-layout.component.scss']
})
export class ArcadeLayoutComponent {

  constructor(
    private router: Router
  ) { }

  isSelected(path: string): boolean {
    return this.router.url.endsWith(path);
  }
}
