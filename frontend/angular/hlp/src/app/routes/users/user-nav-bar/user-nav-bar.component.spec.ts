import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserNavBarComponent } from './user-nav-bar.component';

describe('UserNavBarComponent', () => {
  let component: UserNavBarComponent;
  let fixture: ComponentFixture<UserNavBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserNavBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
