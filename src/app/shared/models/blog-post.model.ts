/**
 * Block schemas for dynamic structured article content.
 */
export interface BlogHeadingBlock {
  type: 'heading';
  level: number;
  text: string;
}

export interface BlogParagraphBlock {
  type: 'paragraph';
  text: string;
}

export interface BlogListItem {
  title: string;
  description: string;
}

export interface BlogListBlock {
  type: 'list';
  style: 'bullet' | 'numbered';
  items: BlogListItem[];
}

export interface BlogQuoteBlock {
  type: 'quote';
  text: string;
  author: string;
}

export interface BlogCtaBlock {
  type: 'cta';
  heading: string;
  text: string;
  button_text: string;
  button_link: string;
}

export interface BlogImageBlock {
  type: 'image';
  image_url: string;
  caption: string;
  alt: string;
}

export type BlogBlock =
  | BlogHeadingBlock
  | BlogParagraphBlock
  | BlogListBlock
  | BlogQuoteBlock
  | BlogCtaBlock
  | BlogImageBlock;

/**
 * DRF raw response model for a blog post.
 */
export interface DRFBlogPost {
  id: number;
  slug: string;
  slug_en?: string;
  slug_az?: string;
  title: string | Record<string, string>;
  excerpt: string | Record<string, string>;
  content?: string | Record<string, string>;
  blocks?: any[];
  cover_image: string | null;
  category: string | { id: number; slug: string; name: string | Record<string, string> } | null;
  author: string | null;
  published_at: string | null; // ISO 8601 date string
  reading_time: number | null; // minutes
  meta_title: string | Record<string, string> | null;
  meta_description: string | Record<string, string> | null;
  is_active?: boolean;
}

/**
 * DRF paginated response wrapper — same shape as used in car.service.ts.
 */
export interface DRFBlogPaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: DRFBlogPost[];
}

/**
 * Frontend-facing blog post model.
 * All localized fields are pre-resolved to clean strings and structured typed blocks.
 */
export interface BlogPost {
  idPost: string;
  strSlug: string;
  strSlugEn: string;
  strSlugAz: string;
  strTitle: string;
  strExcerpt: string;
  strContent?: string;
  arrBlocks: BlogBlock[];
  strCoverImage: string;
  strCategory: string;
  strAuthor: string;
  strPublishedAt: string; // ISO date string
  numReadingTime: number; // minutes
  strMetaTitle: string;
  strMetaDescription: string;
}
