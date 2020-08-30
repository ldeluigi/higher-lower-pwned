import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserDataService } from '../../_services/user-data.service';
import { UserInfo } from 'src/app/_model/userInfo';
import { UserStats } from '../../_model/userStats';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {

  userInfo: UserInfo = {} as UserInfo;
  userStats: UserStats = {} as UserStats;

  constructor(
    private router: Router,
    private usersTools: UserDataService
  ) {
    usersTools.userInfo.subscribe(info => this.userInfo = info);
    usersTools.data.subscribe(data => this.userStats = data);
  }

  ngOnInit(): void {
    this.usersTools.loadUserInfo().subscribe();
    this.usersTools.loadData().subscribe();
  }

  updateUserInfo(): void {
    this.usersTools.loadUserInfo().subscribe();
  }

  updateUserStats(period?: string, limit?: number): void {
    this.usersTools.loadData(period, limit).subscribe();
  }
}
