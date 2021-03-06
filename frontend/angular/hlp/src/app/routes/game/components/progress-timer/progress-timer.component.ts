import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-timer',
  templateUrl: './progress-timer.component.html',
  styleUrls: ['./progress-timer.component.scss']
})
export class ProgressTimerComponent implements OnInit {

  @Input() progressbarValue = 100;
  @Input() timeLeft = 0;

  constructor() { }

  ngOnInit(): void {
  }

}
