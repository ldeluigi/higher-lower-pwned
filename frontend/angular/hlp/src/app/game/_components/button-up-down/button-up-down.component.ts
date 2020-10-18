import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-button-up-down',
  templateUrl: './button-up-down.component.html',
  styleUrls: ['./button-up-down.component.scss']
})
export class ButtonUpDownComponent {

  @Output() upEmitter = new EventEmitter<void>();
  @Output() downEmitter = new EventEmitter<void>();
  /**
   * Available state:
   * inGame = ''
   * lost = 'lost'
   * waiting = 'waiting'
   */
  @Input() state = 'waiting';

  constructor() { }

  up(): void {
    this.upEmitter.emit();
  }

  down(): void {
    this.downEmitter.emit();
  }
}
