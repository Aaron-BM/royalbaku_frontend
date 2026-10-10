export type LocalizedString = Record<string, string> | string;

export interface AboutFeatureItem {
  idFeature?: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  icon: string;
}

export interface AboutSocialLink {
  platform: string;
  label: LocalizedString;
  url: string;
  color?: string;
}

export interface AboutHeroSection {
  badge: LocalizedString;
  main_title: LocalizedString;
  descriptions: LocalizedString[];
  logo_image?: string;
}

export interface AboutWhySection {
  title: LocalizedString;
  description: LocalizedString;
  google_reviews: {
    rating: number;
    count_text: LocalizedString;
  };
  features: AboutFeatureItem[];
}

export interface AboutCompanySection {
  tag: LocalizedString;
  title: LocalizedString;
  descriptions: LocalizedString[];
  bullets: LocalizedString[];
  showroom_image?: string;
  social_links?: AboutSocialLink[];
}

export interface AboutCeoSection {
  tag: LocalizedString;
  name: string;
  title: LocalizedString;
  descriptions: LocalizedString[];
  image?: string;
  social_links?: AboutSocialLink[];
}

export interface AboutTabsSection {
  mission: LocalizedString;
  vision: LocalizedString;
  fleet: LocalizedString;
  backdrop_image?: string;
}

export interface AboutExtraSection {
  id: string;
  type: string;
  title: LocalizedString;
  subtitle?: LocalizedString;
  descriptions?: LocalizedString[];
  image?: string;
  bullets?: LocalizedString[];
  order?: number;
}

export interface AboutPageData {
  hero: AboutHeroSection;
  why_us: AboutWhySection;
  company: AboutCompanySection;
  ceo: AboutCeoSection;
  tabs: AboutTabsSection;
  extra_sections?: AboutExtraSection[];
}
