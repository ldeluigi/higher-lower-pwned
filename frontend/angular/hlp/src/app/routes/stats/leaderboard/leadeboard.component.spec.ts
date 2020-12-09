import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LeadeboardComponent } from './leadeboard.component';
import { MatSelectModule } from '@angular/material/select';
import { PeriodButtonsComponent } from 'src/app/shared/period-buttons/period-buttons.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ModeSelectorComponent } from '../mode-selector/mode-selector.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

describe('LeadeboardComponent', () => {
  let component: LeadeboardComponent;
  let fixture: ComponentFixture<LeadeboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        MatSelectModule,
        MatPaginatorModule,
        MatButtonToggleModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatTableModule,
        MatButtonModule,
      ],
      declarations: [
        LeadeboardComponent,
        PeriodButtonsComponent,
        ModeSelectorComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadeboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
