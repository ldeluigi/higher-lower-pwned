import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CounterComponent } from '../components/counter/counter.component';
import { WordSpinnerComponent } from '../components/word-spinner/word-spinner.component';
import { ArcadeComponent } from './arcade.component';


describe('ArcadeComponent', () => {
  let component: ArcadeComponent;
  let fixture: ComponentFixture<ArcadeComponent>;

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
        ArcadeComponent,
        CounterComponent,
        WordSpinnerComponent
       ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArcadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
