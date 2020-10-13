import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  mode = 'arcade';

  @Input('mode')
  set onCardChange(mode: string) {
    this.mode = mode;
  }

  constructor(
    private route: ActivatedRoute
  ) {
    route.data.subscribe(elem => this.mode = elem.mode);
  }

  ngOnInit(): void {
  }

}
