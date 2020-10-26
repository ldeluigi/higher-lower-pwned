import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeLayoutComponent } from './mode-layout.component';

describe('ModeLayoutComponent', () => {
  let component: ModeLayoutComponent;
  let fixture: ComponentFixture<ModeLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModeLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModeLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
