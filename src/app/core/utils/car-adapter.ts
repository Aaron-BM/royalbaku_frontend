import { CarDetailItem, PriceTableItem, CarCategory, CarBrand } from '../models/car.model';
import { environment } from '../../../environments/environment';

export interface DRFBrand {
  id: number;
  name: any;
  slug: string;
  logo: string | null;
  is_active?: boolean;
}

export interface DRFCategory {
  id: number;
  name: any;
  slug: string;
  icon?: string;
  is_active?: boolean;
}

export interface DRFCarModel {
  id: number;
  name: any;
  slug: string;
  brand_details?: DRFBrand;
  category_details?: DRFCategory;
}

export interface DRFCarImage {
  id: number;
  car: number;
  image: string;
  image_type?: string;
  is_primary?: boolean;
  display_order?: number;
}

export interface DRFFeature {
  id: number;
  name: any;
  icon?: string;
  slug: string;
}

export interface DRFCar {
  id: number;
  name: any;
  slug: string;
  description?: any;
  car_model?: any;
  car_model_name?: any;
  brand?: DRFBrand;
  category?: DRFCategory;
  transmission?: string;
  fuel_type?: string;
  seating_capacity?: number;
  door_count?: number;
  luggage_capacity?: number;
  price_daily: string | number;
  price_weekly?: string | number | null;
  price_monthly?: string | number | null;
  is_active?: boolean;
  is_featured?: boolean;
  is_offer?: boolean;
  primary_image?: string | null;
  images?: DRFCarImage[];
  features?: DRFFeature[];
  specs?: any;
  created_at?: string;
  updated_at?: string;
}

export interface DRFPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DRFMinimalLookupItem {
  id: number;
  name: any;
  slug: string;
  image?: string | null;
  brand?: number;
  car_category?: number;
}

export interface CatalogLookupResponse {
  brands?: DRFMinimalLookupItem[];
  categories?: DRFMinimalLookupItem[];
  cars?: DRFMinimalLookupItem[];
  models?: DRFMinimalLookupItem[];
  features?: DRFMinimalLookupItem[];
}

/**
 * Safely parses multilingual JSON/String fields from DRF API
 */
export function parseI18nString(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') {
    const strTrimmed = val.trim();
    if (strTrimmed.startsWith('{') && strTrimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(strTrimmed.replace(/'/g, '"'));
        return parsed['en'] || parsed['az'] || parsed['ar'] || Object.values(parsed)[0] || val;
      } catch {
        return val;
      }
    }
    return val;
  }
  if (typeof val === 'object') {
    return val['en'] || val['az'] || val['ar'] || Object.values(val)[0] || '';
  }
  return String(val);
}

/**
 * Helper to safely extract image URL string from string or image object
 */
export function extractImageUrl(img: any): string | null {
  if (!img) return null;
  if (typeof img === 'string') return img;
  if (typeof img === 'object') {
    return img.thumbnail || img.detail || img.image || img.url || null;
  }
  return null;
}

/**
 * Maps DRF CarCategory model to frontend CarCategory model
 */
export function mapDRFCategoryToItem(cat: DRFCategory): CarCategory {
  const strRawImg = (cat as any).image || cat.icon;
  const strParsedImg = parseMediaUrl(strRawImg);
  return {
    idCategory: String(cat.id),
    strNameKey: parseI18nString(cat.name),
    strSlug: cat.slug,
    strImagePath: strParsedImg || `/assets/images/home/cat-${cat.slug}.png`,
  };
}

/**
 * Helper to ensure media URLs (like logos and images) are absolute URLs
 */
export function parseMediaUrl(urlStr: any): string | undefined {
  if (!urlStr) return undefined;
  if (typeof urlStr === 'object') {
    urlStr = extractImageUrl(urlStr);
  }
  if (typeof urlStr !== 'string' || !urlStr) return undefined;
  if (urlStr.startsWith('http://') || urlStr.startsWith('https://') || urlStr.startsWith('data:')) {
    return urlStr;
  }
  const baseUrl = environment.apiBaseUrl.replace(/\/api\/?$/, '');
  return `${baseUrl}${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
}

/**
 * Maps DRF Brand model to frontend CarBrand model
 */
export function mapDRFBrandToItem(brand: DRFBrand): CarBrand {
  return {
    idBrand: String(brand.id),
    strName: parseI18nString(brand.name),
    strSlug: brand.slug,
    strIconSvg: parseMediaUrl(brand.logo),
  };
}

/**
 * Maps DRF Minimal Lookup item to frontend CarBrand model
 */
export function mapMinimalLookupToBrand(item: DRFMinimalLookupItem): CarBrand {
  return {
    idBrand: String(item.id),
    strName: parseI18nString(item.name),
    strSlug: item.slug,
    strIconSvg: parseMediaUrl(item.image),
  };
}

/**
 * Maps DRF Minimal Lookup item to frontend CarCategory model
 */
export function mapMinimalLookupToCategory(item: DRFMinimalLookupItem): CarCategory {
  return {
    idCategory: String(item.id),
    strNameKey: parseI18nString(item.name),
    strSlug: item.slug,
  };
}

/**
 * Maps DRF Car backend model to frontend CarDetailItem model
 */
export function mapDRFCarToCarDetailItem(car: DRFCar): CarDetailItem {
  const strTitle =
    parseI18nString(car.name) ||
    (car.car_model_name ? parseI18nString(car.car_model_name) : `Car #${car.id}`);

  const numDailyPrice =
    typeof car.price_daily === 'number' ? car.price_daily : parseFloat(car.price_daily) || 0;

  const arrRawImages: string[] = [];

  const strPrimary = extractImageUrl(car.primary_image);
  if (strPrimary) {
    arrRawImages.push(strPrimary);
  }

  if (car.images && Array.isArray(car.images)) {
    car.images.forEach((imgObj) => {
      const strImg = extractImageUrl(imgObj) || (imgObj && extractImageUrl(imgObj.image));
      if (strImg) {
        arrRawImages.push(strImg);
      }
    });
  }

  const arrGalleryImages: string[] = [];
  arrRawImages.forEach((img) => {
    const strNormalized = parseMediaUrl(img) || img;
    if (strNormalized && !arrGalleryImages.includes(strNormalized)) {
      arrGalleryImages.push(strNormalized);
    }
  });

  const strCategorySlug = car.category?.slug || '';
  const strBrandSlug = car.brand?.slug || car.car_model?.brand_details?.slug || '';

  return {
    idCar: String(car.id),
    strTitle: strTitle,
    strSlug: car.slug || `car-${car.id}`,
    strImagePath: arrGalleryImages[0] || '',
    blnIsOffer: Boolean(car.is_offer),
    numDailyPrice: numDailyPrice,
    strCurrency: 'AED',
    strWeeklyPriceValue: car.price_weekly ? `AED ${car.price_weekly}` : '',
    strMonthlyPriceValue: car.price_monthly ? `AED ${car.price_monthly}` : '',
    strDescriptionKey: parseI18nString(car.description),
    arrCategorySlugs: strCategorySlug ? [strCategorySlug] : [],
    strBrandSlug: strBrandSlug,
    arrGalleryImages: arrGalleryImages,
    objSpecs: {
      strDepositValue: car.specs?.deposit || '',
      numMileageLimitKm: car.specs?.mileage_limit || 0,
      strExtraMileageRate: car.specs?.extra_mileage_rate || '',
      strColor: car.specs?.color || '',
      strTransmission: car.transmission
        ? car.transmission.charAt(0) + car.transmission.slice(1).toLowerCase()
        : '',
      strCarType: car.category ? parseI18nString(car.category.name) : '',
      strEngine: car.specs?.engine || '',
      numSeats: car.seating_capacity || 0,
      numDoors: car.door_count || 0,
      numLuggageCount: car.luggage_capacity || 0,
      strAcceleration0To100: car.specs?.acceleration_0_100 || car.specs?.['0-60'] || '',
      strDriveTrain: car.specs?.drivetrain || '',
      strFuelType: car.fuel_type
        ? car.fuel_type.charAt(0) + car.fuel_type.slice(1).toLowerCase()
        : '',
    },
  };
}

/**
 * Maps DRF Car backend model to frontend PriceTableItem model
 */
export function mapDRFCarToPriceTableItem(car: DRFCar): PriceTableItem {
  const strCarName =
    parseI18nString(car.name) ||
    (car.car_model_name ? parseI18nString(car.car_model_name) : `Car #${car.id}`);

  const numDailyPrice =
    typeof car.price_daily === 'number' ? car.price_daily : parseFloat(car.price_daily) || 0;
  const numWeeklyPrice =
    car.price_weekly != null ? (typeof car.price_weekly === 'number' ? car.price_weekly : parseFloat(car.price_weekly) || undefined) : undefined;
  const numMonthlyPrice =
    car.price_monthly != null ? (typeof car.price_monthly === 'number' ? car.price_monthly : parseFloat(car.price_monthly) || undefined) : undefined;
  const numDepositUsd =
    car.specs?.deposit != null ? parseFloat(car.specs.deposit) || undefined : undefined;

  const arrRawImages: string[] = [];
  const strPrimary = extractImageUrl(car.primary_image);
  if (strPrimary) {
    arrRawImages.push(strPrimary);
  }
  if (car.images && Array.isArray(car.images)) {
    car.images.forEach((imgObj) => {
      const strImg = extractImageUrl(imgObj) || (imgObj && extractImageUrl(imgObj.image));
      if (strImg) {
        arrRawImages.push(strImg);
      }
    });
  }

  const arrGalleryImages: string[] = [];
  arrRawImages.forEach((img) => {
    const strNormalized = parseMediaUrl(img) || img;
    if (strNormalized && !arrGalleryImages.includes(strNormalized)) {
      arrGalleryImages.push(strNormalized);
    }
  });

  const strBrandSlug = car.brand?.slug || car.car_model?.brand_details?.slug || '';
  const strBrandName = car.brand
    ? parseI18nString(car.brand.name)
    : car.car_model?.brand_details?.name
    ? parseI18nString(car.car_model.brand_details.name)
    : '';

  const strCategoryName = car.category
    ? parseI18nString(car.category.name)
    : car.car_model?.car_category_details?.name
    ? parseI18nString(car.car_model.car_category_details.name)
    : '';

  const rawImg = arrGalleryImages[0];
  const strImagePath = rawImg ? parseMediaUrl(rawImg) || rawImg : '';

  return {
    idCar: String(car.id),
    strCarName: strCarName,
    strSlug: car.slug || `car-${car.id}`,
    strBrandSlug: strBrandSlug,
    strBrandName: strBrandName,
    strCategoryName: strCategoryName,
    strImagePath: strImagePath,
    numDailyPrice: numDailyPrice,
    numWeeklyPrice: numWeeklyPrice,
    numMonthlyPrice: numMonthlyPrice,
    numDepositUsd: numDepositUsd,
    strCurrency: 'USD',
    strWeeklyPriceValue: car.price_weekly ? String(car.price_weekly) : '',
    strMonthlyPriceValue: car.price_monthly ? String(car.price_monthly) : '',
    strDepositValue: car.specs?.deposit ? String(car.specs.deposit) : '0',
  };
}

