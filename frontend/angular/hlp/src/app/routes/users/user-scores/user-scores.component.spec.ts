import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserScoresComponent } from './user-scores.component';

describe('UserScoresComponent', () => {
  let component: UserScoresComponent;
  let fixture: ComponentFixture<UserScoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserScoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserScoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
