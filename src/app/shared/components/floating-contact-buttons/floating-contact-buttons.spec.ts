import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloatingContactButtons } from './floating-contact-buttons';

describe('FloatingContactButtons', () => {
  let component: FloatingContactButtons;
  let fixture: ComponentFixture<FloatingContactButtons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingContactButtons],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingContactButtons);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
