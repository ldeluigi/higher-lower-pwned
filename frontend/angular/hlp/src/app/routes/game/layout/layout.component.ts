import { Component, HostListener } from '@angular/core';
import { KeyPressDistributionService } from '../../../services/key-press-distribution.service';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {

  private readonly ARROW_UP = 'ArrowUp';
  private readonly ARROW_DOWN = 'ArrowDown';

  // private readonly S = 's'; // start the game
  // private readonly R = 'r'; // replay the game
  // private readonly H = 'h'; // Home

  private readonly validKey: string[] = [
    this.ARROW_UP,
    this.ARROW_DOWN,
    // this.S,
    // this.R,
    // this.H,
  ];

  constructor(
    private keyService: KeyPressDistributionService
  ) {
  }

  @HostListener('window:keyup', ['$event'])
  public onKeyUp(eventData: KeyboardEvent): void {
    if (this.validKey.some(k => k === eventData.key)) {
      this.keyService.distributeKeyPress(eventData);
    }
  }
}
