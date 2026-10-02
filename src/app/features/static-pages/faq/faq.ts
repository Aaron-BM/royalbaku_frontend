import { Component, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export interface FaqItem {
  id: string;
  qKey: string;
  aKey: string;
}

export interface FaqCategory {
  idCategory: string;
  titleKey: string;
  items: FaqItem[];
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class Faq {
  // Set of currently expanded FAQ item IDs
  protected readonly arrOpenItems = signal<Set<string>>(new Set(['res-1', 'price-1']));

  protected readonly arrCategories: FaqCategory[] = [
    {
      idCategory: 'booking',
      titleKey: 'faqPage.catBooking',
      items: [
        { id: 'res-1', qKey: 'faqPage.res1Q', aKey: 'faqPage.res1A' },
        { id: 'res-2', qKey: 'faqPage.res2Q', aKey: 'faqPage.res2A' },
        { id: 'res-3', qKey: 'faqPage.res3Q', aKey: 'faqPage.res3A' },
        { id: 'res-4', qKey: 'faqPage.res4Q', aKey: 'faqPage.res4A' },
        { id: 'res-5', qKey: 'faqPage.res5Q', aKey: 'faqPage.res5A' },
        { id: 'res-6', qKey: 'faqPage.res6Q', aKey: 'faqPage.res6A' },
      ],
    },
    {
      idCategory: 'pricing',
      titleKey: 'faqPage.catPricing',
      items: [
        { id: 'price-1', qKey: 'faqPage.price1Q', aKey: 'faqPage.price1A' },
        { id: 'price-2', qKey: 'faqPage.price2Q', aKey: 'faqPage.price2A' },
        { id: 'price-3', qKey: 'faqPage.price3Q', aKey: 'faqPage.price3A' },
        { id: 'price-4', qKey: 'faqPage.price4Q', aKey: 'faqPage.price4A' },
        { id: 'price-5', qKey: 'faqPage.price5Q', aKey: 'faqPage.price5A' },
        { id: 'price-6', qKey: 'faqPage.price6Q', aKey: 'faqPage.price6A' },
        { id: 'price-7', qKey: 'faqPage.price7Q', aKey: 'faqPage.price7A' },
      ],
    },
    {
      idCategory: 'cancellation',
      titleKey: 'faqPage.catCancellation',
      items: [
        { id: 'cancel-1', qKey: 'faqPage.cancel1Q', aKey: 'faqPage.cancel1A' },
        { id: 'cancel-2', qKey: 'faqPage.cancel2Q', aKey: 'faqPage.cancel2A' },
        { id: 'cancel-3', qKey: 'faqPage.cancel3Q', aKey: 'faqPage.cancel3A' },
        { id: 'cancel-4', qKey: 'faqPage.cancel4Q', aKey: 'faqPage.cancel4A' },
      ],
    },
    {
      idCategory: 'licence',
      titleKey: 'faqPage.catLicence',
      items: [
        { id: 'lic-1', qKey: 'faqPage.lic1Q', aKey: 'faqPage.lic1A' },
        { id: 'lic-2', qKey: 'faqPage.lic2Q', aKey: 'faqPage.lic2A' },
        { id: 'lic-3', qKey: 'faqPage.lic3Q', aKey: 'faqPage.lic3A' },
        { id: 'lic-4', qKey: 'faqPage.lic4Q', aKey: 'faqPage.lic4A' },
        { id: 'lic-5', qKey: 'faqPage.lic5Q', aKey: 'faqPage.lic5A' },
        { id: 'lic-6', qKey: 'faqPage.lic6Q', aKey: 'faqPage.lic6A' },
      ],
    },
    {
      idCategory: 'mileage',
      titleKey: 'faqPage.catMileage',
      items: [
        { id: 'mil-1', qKey: 'faqPage.mil1Q', aKey: 'faqPage.mil1A' },
        { id: 'mil-2', qKey: 'faqPage.mil2Q', aKey: 'faqPage.mil2A' },
        { id: 'mil-3', qKey: 'faqPage.mil3Q', aKey: 'faqPage.mil3A' },
        { id: 'mil-4', qKey: 'faqPage.mil4Q', aKey: 'faqPage.mil4A' },
      ],
    },
    {
      idCategory: 'insurance',
      titleKey: 'faqPage.catInsurance',
      items: [
        { id: 'ins-1', qKey: 'faqPage.ins1Q', aKey: 'faqPage.ins1A' },
        { id: 'ins-2', qKey: 'faqPage.ins2Q', aKey: 'faqPage.ins2A' },
        { id: 'ins-3', qKey: 'faqPage.ins3Q', aKey: 'faqPage.ins3A' },
        { id: 'ins-4', qKey: 'faqPage.ins4Q', aKey: 'faqPage.ins4A' },
      ],
    },
  ];

  protected fnToggleItem(id: string): void {
    const current = new Set(this.arrOpenItems());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.arrOpenItems.set(current);
  }

  protected blnIsOpen(id: string): boolean {
    return this.arrOpenItems().has(id);
  }
}
