import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressTimerComponent } from './progress-timer.component';

describe('ProgressTimerComponent', () => {
  let component: ProgressTimerComponent;
  let fixture: ComponentFixture<ProgressTimerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
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
