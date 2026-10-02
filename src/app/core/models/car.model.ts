export interface CarCategory {
  idCategory: string;
  strNameKey: string;
  strSlug: string;
  strImagePath?: string;
}

export interface CarBrand {
  idBrand: string;
  strName: string;
  strSlug: string;
  strBadgeColor?: string;
  strIconSvg?: string;
}

export interface CarItem {
  idCar: string;
  strTitle: string;
  strSlug: string;
  strImagePath: string;
  blnIsOffer?: boolean;
  strOfferTextKey?: string;
  strDepositInfoKey?: string;
  numDailyPrice: number;
  strCurrency: string;
  strWeeklyPriceKey?: string;
  strMonthlyPriceKey?: string;
  strWhatsappNumber?: string;
}

export interface CarSpecification {
  strDepositKey?: string;
  strDepositValue?: string;
  numMileageLimitKm?: number;
  strExtraMileageRate?: string;
  strPaymentMethodsKey?: string;
  strColor?: string;
  strTransmission?: string;
  strCarType?: string;
  strEngine?: string;
  numSeats?: number;
  numDoors?: number;
  strAcceleration0To100?: string;
  strDriveTrain?: string;
  strFuelType?: string;
  numLuggageCount?: number;
}

export interface CarDetailItem extends CarItem {
  arrGalleryImages?: string[];
  objSpecs?: CarSpecification;
  strWeeklyPriceValue?: string;
  strMonthlyPriceValue?: string;
  strDescriptionKey?: string;
  arrCategorySlugs?: string[];
  strBrandSlug?: string;
}

export interface CarCategoryMeta {
  strSlug: string;
  strCategoryKey: string;
  strBadgeKey: string;
  strTitleKey: string;
  strDescKey: string;
  strHeroBgImage: string;
}

export interface PriceTableItem {
  idCar: string;
  strCarName: string;
  strSlug: string;
  strBrandSlug: string;
  strBrandName?: string;
  strCategoryName?: string;
  strImagePath?: string;
  numDailyPrice: number;
  numWeeklyPrice?: number;
  numMonthlyPrice?: number;
  numDepositUsd?: number;
  strCurrency: string;
  strWeeklyPriceValue: string;
  strMonthlyPriceValue: string;
  strDepositValue: string;
}


