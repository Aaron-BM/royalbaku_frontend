export interface TourStop {
  order: number;
  name: string;
  image: string;
  description?: string;
}

export interface TourPackage {
  id: string;
  slug: string;
  title: string;
  subtitle: string; // e.g., "Package I", "Package II"
  tagline?: string;
  transfersIncluded: boolean; // Controls "TRANSFERS & TOUR INCLUDED" badge
  stops: TourStop[];
  whatsapp: string;
  phone: string;
  website: string;
  price?: string;
  priceUsd?: number;
  number_of_persons?: number;
  numberOfPersons?: number;
}

export interface TourPackageStopApi {
  id: number;
  name: string | Record<string, string>;
  description?: string | Record<string, string>;
  image: string | null;
  order: number;
  map_position?: Record<string, any>;
}

export interface TourPackageApi {
  id: number;
  slug: string;
  title: string | Record<string, string>;
  subtitle?: string;
  tagline?: string | Record<string, string>;
  transfersIncluded?: boolean;
  transfers_included?: boolean;
  price?: string;
  price_usd?: number;
  number_of_persons?: number;
  numberOfPersons?: number;
  persons?: number;
  person_count?: number;
  phone?: string;
  whatsapp?: string;
  website?: string;
  order?: number;
  is_active?: boolean;
  stops: TourPackageStopApi[];
}
