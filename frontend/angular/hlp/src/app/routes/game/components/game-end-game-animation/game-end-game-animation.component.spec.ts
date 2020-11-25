import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameEndGameAnimationComponent } from './game-end-game-animation.component';

describe('GameEndGameAnimationComponent', () => {
  let component: GameEndGameAnimationComponent;
  let fixture: ComponentFixture<GameEndGameAnimationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameEndGameAnimationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameEndGameAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
