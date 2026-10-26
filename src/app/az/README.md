# Azerbaijani Pages Architecture (`src/app/az/`)

This directory houses the independent Azerbaijani versions of all page-level components and their feature-specific child components. 

## Architectural Philosophy
1. **Independent Presentation & Layout**:
   - Templates (`.html`) and scoped stylesheets (`.css`) are kept separate from English counterparts so Azerbaijani pages can be customized, rearranged, restyled, or restructured independently without impacting the English experience.
2. **Shared Business & API Logic**:
   - Services (`src/app/core/services/*`), models (`src/app/core/models/*`), utilities (`src/app/core/utils/*`), and pipes (`src/app/shared/pipes/*`) are **STRICTLY SHARED**.
   - No business logic or API calls are duplicated. Both English and Azerbaijani components call the exact same singleton services.
3. **Synchronization Rule**:
   - If a page's business behavior changes (e.g., adding a new form field, updating booking validation rules, or modifying query parameters), the corresponding change **must be made in both the English component (`src/app/features/...`) and the Azerbaijani component (`src/app/az/...`)**.

---

## English / Azerbaijani File Pair Checklist

| Feature | English File (`src/app/features/`) | Azerbaijani File (`src/app/az/`) | Selector | Class Name |
| :--- | :--- | :--- | :--- | :--- |
| **Home Page** | `home/home.ts` | `home/home-az.ts` | `app-home-az` | `HomeAz` |
| | `home/home.html` | `home/home-az.html` | - | - |
| | `home/home.css` | `home/home-az.css` | - | - |
| **Home: Enquiry Bar** | `home/components/enquiry-bar/enquiry-bar.ts` | `home/components/enquiry-bar/enquiry-bar-az.ts` | `app-enquiry-bar-az` | `EnquiryBarAz` |
| | `home/components/enquiry-bar/enquiry-bar.html` | `home/components/enquiry-bar/enquiry-bar-az.html` | - | - |
| | `home/components/enquiry-bar/enquiry-bar.css` | `home/components/enquiry-bar/enquiry-bar-az.css` | - | - |
| **Cars: List Page** | `cars/car-list/car-list.ts` | `cars/car-list/car-list-az.ts` | `app-car-list-az` | `CarListAz` |
| | `cars/car-list/car-list.html` | `cars/car-list/car-list-az.html` | - | - |
| | `cars/car-list/car-list.css` | `cars/car-list/car-list-az.css` | - | - |
| **Cars: List Hero** | `cars/car-list/components/hero/hero.ts` | `cars/car-list/components/hero/hero-az.ts` | `app-car-list-hero-az` | `CarListHeroAz` |
| | `cars/car-list/components/hero/hero.html` | `cars/car-list/components/hero/hero-az.html` | - | - |
| | `cars/car-list/components/hero/hero.css` | `cars/car-list/components/hero/hero-az.css` | - | - |
| **Cars: Detail Page** | `cars/car-detail/car-detail.ts` | `cars/car-detail/car-detail-az.ts` | `app-car-detail-az` | `CarDetailAz` |
| | `cars/car-detail/car-detail.html` | `cars/car-detail/car-detail-az.html` | - | - |
| | `cars/car-detail/car-detail.css` | `cars/car-detail/car-detail-az.css` | - | - |
| **Tours: Page** | `tour-packages/tour-packages-page/tour-packages-page.ts` | `tour-packages/tour-packages-page/tour-packages-page-az.ts` | `app-tour-packages-page-az` | `TourPackagesPageAz` |
| | `tour-packages/tour-packages-page/tour-packages-page.html` | `tour-packages/tour-packages-page/tour-packages-page-az.html` | - | - |
| | `tour-packages/tour-packages-page/tour-packages-page.css` | `tour-packages/tour-packages-page/tour-packages-page-az.css` | - | - |
| **Tours: Package Card** | `tour-packages/components/tour-package-card/tour-package-card.ts` | `tour-packages/components/tour-package-card/tour-package-card-az.ts` | `app-tour-package-card-az` | `TourPackageCardAz` |
| | `tour-packages/components/tour-package-card/tour-package-card.html` | `tour-packages/components/tour-package-card/tour-package-card-az.html` | - | - |
| | `tour-packages/components/tour-package-card/tour-package-card.css` | `tour-packages/components/tour-package-card/tour-package-card-az.css` | - | - |
| **Blog: List Page** | `blog/blog-list/blog-list.ts` | `blog/blog-list/blog-list-az.ts` | `app-blog-list-az` | `BlogListAz` |
| | `blog/blog-list/blog-list.html` | `blog/blog-list/blog-list-az.html` | - | - |
| | `blog/blog-list/blog-list.css` | `blog/blog-list/blog-list-az.css` | - | - |
| **Blog: Detail Page** | `blog/blog-detail/blog-detail.ts` | `blog/blog-detail/blog-detail-az.ts` | `app-blog-detail-az` | `BlogDetailAz` |
| | `blog/blog-detail/blog-detail.html` | `blog/blog-detail/blog-detail-az.html` | - | - |
| | `blog/blog-detail/blog-detail.css` | `blog/blog-detail/blog-detail-az.css` | - | - |
| **About Page** | `static-pages/about/about.ts` | `static-pages/about/about-az.ts` | `app-about-az` | `AboutAz` |
| | `static-pages/about/about.html` | `static-pages/about/about-az.html` | - | - |
| | `static-pages/about/about.css` | `static-pages/about/about-az.css` | - | - |
| **FAQ Page** | `static-pages/faq/faq.ts` | `static-pages/faq/faq-az.ts` | `app-faq-az` | `FaqAz` |
| | `static-pages/faq/faq.html` | `static-pages/faq/faq-az.html` | - | - |
| | `static-pages/faq/faq.css` | `static-pages/faq/faq-az.css` | - | - |
| **Contact Page** | `static-pages/contact/contact.ts` | `static-pages/contact/contact-az.ts` | `app-contact-az` | `ContactAz` |
| | `static-pages/contact/contact.html` | `static-pages/contact/contact-az.html` | - | - |
| | `static-pages/contact/contact.css` | `static-pages/contact/contact-az.css` | - | - |
| **Prices Page** | `static-pages/prices/prices.ts` | `static-pages/prices/prices-az.ts` | `app-prices-az` | `PricesAz` |
| | `static-pages/prices/prices.html` | `static-pages/prices/prices-az.html` | - | - |
| | `static-pages/prices/prices.css` | `static-pages/prices/prices-az.css` | - | - |
| **404 Page** | `static-pages/not-found/not-found.ts` | `static-pages/not-found/not-found-az.ts` | `app-not-found-az` | `NotFoundAz` |
| | `static-pages/not-found/not-found.html` | `static-pages/not-found/not-found-az.html` | - | - |

---

## Shared UI Elements
The following components remain in `src/app/shared/components/` and `src/app/layout/` and are shared by both versions:
- `Nav` (`src/app/layout/nav/`): Global header, responsive drawer, language and currency toggles.
- `Footer` (`src/app/layout/footer/`): Global footer.
- `FloatingContactButtons` (`src/app/layout/floating-contact-buttons/`): Global WhatsApp and call actions.
- `CarCard` (`src/app/shared/components/car-card/`): Used in Car List and Home featured grids.
- `BlogCard` (`src/app/shared/components/blog-card/`): Used in Blog List and Blog Detail related stories.
- `CountryCodeSelect` (`src/app/shared/components/country-code-select/`): Used in booking/enquiry phone inputs.
- `ImagePreviewModal` (`src/app/shared/components/image-preview-modal/`): Lightbox image viewer.
- Icons (`src/app/shared/components/icons/`): `IconPhone`, `IconWhatsapp`.

