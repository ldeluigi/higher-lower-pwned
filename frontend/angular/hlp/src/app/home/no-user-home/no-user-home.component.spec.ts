import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoUserHomeComponent } from './no-user-home.component';

describe('NoUserHomeComponent', () => {
  let component: NoUserHomeComponent;
  let fixture: ComponentFixture<NoUserHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoUserHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoUserHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
