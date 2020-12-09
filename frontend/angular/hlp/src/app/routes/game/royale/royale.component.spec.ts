import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { RoyaleComponent } from './royale.component';
import { CounterComponent } from '../components/counter/counter.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WordSpinnerComponent } from '../components/word-spinner/word-spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { PlayerListComponent } from '../components/player-list/player-list.component';

describe('RoyaleComponent', () => {
  let component: RoyaleComponent;
  let fixture: ComponentFixture<RoyaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        BrowserAnimationsModule,
        MatIconModule,
      ],
      declarations: [
        RoyaleComponent,
        CounterComponent,
        WordSpinnerComponent,
        PlayerListComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoyaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
