import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { HistoryItemToEndDatePipe } from 'src/app/shared/pipes/history-item-to-end-date.pipe';
import { HistoryItemToStartDatePipe } from 'src/app/shared/pipes/history-item-to-start-date.pipe';
import { UserStatsComponent } from './user-stats.component';


describe('UserStatsComponent', () => {
  let component: UserStatsComponent;
  let fixture: ComponentFixture<UserStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule,
        MatDialogModule,
      ],
      declarations: [
        UserStatsComponent,
        HistoryItemToEndDatePipe,
        HistoryItemToStartDatePipe,
        DatePipe
      ],
      providers: [
        HistoryItemToEndDatePipe,
        HistoryItemToStartDatePipe,
        DatePipe
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
