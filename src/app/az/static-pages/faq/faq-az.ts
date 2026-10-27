import { Component, OnInit, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SeoService } from '../../../core/services/seo.service';
import { LanguageService } from '../../../core/services/language.service';

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
  selector: 'app-faq-az',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './faq-az.html',
  styleUrl: './faq-az.css',
})
export class FaqAz implements OnInit {
  private readonly svcSog = inject(SeoService);
  private readonly svcLanguage = inject(LanguageService);
  // Set of currently expanded FAQ item IDs
  protected readonly arrOpenItems = signal<Set<string>>(new Set(['res-1', 'price-1']));

  ngOnInit(): void {
    const isAz = this.svcLanguage.strCurrentLang() === 'az';
    this.svcSog.fnSetSeo({
      title: isAz
        ? 'Tez-Tez Verilən Suallar (FAQ) | Royal Baku Rent A Car'
        : 'Frequently Asked Questions (FAQ) | Royal Baku Car Rental',
      description: isAz
        ? 'Bakıda avtomobil icarəsi haqqında suallarınıza cavab tapın: depozit, sürücülük vəsiqəsi, sığorta, yaş həddi və yürüş məhdudiyyətləri.'
        : 'Find answers to common questions about renting a car in Baku: deposits, driver requirements, insurance, mileage limits, and payment options.',
    });
  }

  protected readonly arrCategories: FaqCategory[] = [
    {
      idCategory: 'booking',
      titleKey: 'faqPage.catBooking',
      items: [
        { id: 'res-1', qKey: 'faqPage.res1Q', aKey: 'faqPage.res1A' },
        { id: 'res-3', qKey: 'faqPage.res3Q', aKey: 'faqPage.res3A' },
        { id: 'res-5', qKey: 'faqPage.res5Q', aKey: 'faqPage.res5A' },
        { id: 'cancel-1', qKey: 'faqPage.cancel1Q', aKey: 'faqPage.cancel1A' },
      ],
    },
    {
      idCategory: 'pricing',
      titleKey: 'faqPage.catPricing',
      items: [
        { id: 'price-1', qKey: 'faqPage.price1Q', aKey: 'faqPage.price1A' },
        { id: 'price-2', qKey: 'faqPage.price2Q', aKey: 'faqPage.price2A' },
        { id: 'price-3', qKey: 'faqPage.price3Q', aKey: 'faqPage.price3A' },
        { id: 'price-7', qKey: 'faqPage.price7Q', aKey: 'faqPage.price7A' },
      ],
    },
    {
      idCategory: 'licence',
      titleKey: 'faqPage.catLicence',
      items: [
        { id: 'lic-1', qKey: 'faqPage.lic1Q', aKey: 'faqPage.lic1A' },
        { id: 'lic-2', qKey: 'faqPage.lic2Q', aKey: 'faqPage.lic2A' },
        { id: 'lic-3', qKey: 'faqPage.lic3Q', aKey: 'faqPage.lic3A' },
        { id: 'ins-1', qKey: 'faqPage.ins1Q', aKey: 'faqPage.ins1A' },
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
