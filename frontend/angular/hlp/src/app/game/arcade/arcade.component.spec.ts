import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArcadeComponent } from './arcade.component';

describe('GameComponent', () => {
  let component: ArcadeComponent;
  let fixture: ComponentFixture<ArcadeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArcadeComponent ]
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
