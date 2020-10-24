import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {

  constructor(
    private router: Router
  ) { }

  isSelected(path: string): boolean {
    return this.router.url.endsWith(path);
  }
}
