import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ChartsModule } from 'ng2-charts';
import { PeriodButtonsComponent } from 'src/app/shared/period-buttons/period-buttons.component';
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
        MatFormFieldModule,
        MatOptionModule,
        MatSelectModule,
        MatButtonToggleModule,
        BrowserAnimationsModule,
        MatIconModule,
        MatProgressSpinnerModule,
        ChartsModule
      ],
      declarations: [
        UserStatsComponent,
        HistoryItemToEndDatePipe,
        HistoryItemToStartDatePipe,
        DatePipe,
        PeriodButtonsComponent
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
