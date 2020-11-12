import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-selector',
  templateUrl: './view-selector.component.html',
  styleUrls: ['./view-selector.component.scss']
})
export class ViewSelectorComponent {

  constructor(
    private router: Router
  ) { }

  isSelected(path: string): boolean {
    return this.router.url.endsWith(path);
  }
}
