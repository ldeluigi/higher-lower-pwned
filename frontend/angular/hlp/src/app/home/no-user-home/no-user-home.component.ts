import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-user-home',
  templateUrl: './no-user-home.component.html',
  styleUrls: ['./no-user-home.component.scss']
})
export class NoUserHomeComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

}
