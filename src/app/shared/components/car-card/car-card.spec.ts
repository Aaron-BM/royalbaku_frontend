import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { CarCard } from './car-card';

describe('CarCard', () => {
  let component: CarCard;
  let fixture: ComponentFixture<CarCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarCard],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideTranslateService(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CarCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('objCar', {
      idCar: '1',
      strTitle: 'Test Car',
      strSlug: 'test-car',
      strImagePath: '/assets/images/cars/mercedes-g63.png',
      blnIsOffer: false,
      numDailyPrice: 1000,
      strCurrency: 'AED',
      strWeeklyPriceValue: 'AED 6000',
      strMonthlyPriceValue: 'AED 20000',
      arrCategorySlugs: ['luxury'],
      strBrandSlug: 'mercedes-benz',
      arrGalleryImages: ['/assets/images/cars/mercedes-g63.png'],
      objSpecs: {
        strDepositValue: 'No Deposit',
        numMileageLimitKm: 250,
        strExtraMileageRate: '15 AED/Km',
        strColor: 'Black',
        strTransmission: 'Automatic',
        strCarType: 'Luxury',
        strEngine: 'V8',
        numSeats: 5,
        numDoors: 4,
        numLuggageCount: 2,
        strAcceleration0To100: '4.0s',
        strDriveTrain: 'AWD',
        strFuelType: 'Petrol',
      },
    });
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
