import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProgressTimerComponent } from './progress-timer.component';

describe('ProgressTimerComponent', () => {
  let component: ProgressTimerComponent;
  let fixture: ComponentFixture<ProgressTimerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatProgressBarModule
      ],
      declarations: [ ProgressTimerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
