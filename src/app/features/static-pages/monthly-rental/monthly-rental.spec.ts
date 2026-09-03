import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonthlyRental } from './monthly-rental';

describe('MonthlyRental', () => {
  let component: MonthlyRental;
  let fixture: ComponentFixture<MonthlyRental>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyRental],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthlyRental);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
