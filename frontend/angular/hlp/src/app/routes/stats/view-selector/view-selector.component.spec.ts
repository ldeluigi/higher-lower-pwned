import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ModeSelectorComponent } from '../mode-selector/mode-selector.component';
import { ViewSelectorComponent } from './view-selector.component';


describe('ViewSelectorComponent', () => {
  let component: ViewSelectorComponent;
  let fixture: ComponentFixture<ViewSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      declarations: [ 
        ViewSelectorComponent,
        ModeSelectorComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
