import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodButtonsComponent } from './period-buttons.component';

describe('PeriodButtonsComponent', () => {
  let component: PeriodButtonsComponent;
  let fixture: ComponentFixture<PeriodButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
