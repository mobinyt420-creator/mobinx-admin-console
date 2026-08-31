import { appUrls } from '../data/mockData.js';
import { stateManager } from '../services/stateManager.js';
import { authService } from '../services/authService.js';
import { openExternalStore } from '../services/browserService.js';

export function renderPromoBanners() {
  return `
    <section class="promo-banners-section">
      <div class="promo-banners-grid">
        <!-- Telegram Card -->
        <div class="promo-banner-card promo-telegram-card" id="btn-promo-telegram">
          <div class="promo-banner-texts">
            <span class="promo-tag-text">JOIN OUR</span>
            <h3 class="promo-title-text">TELEGRAM</h3>
            <p class="promo-sub-text">Get Latest Update First</p>
          </div>
          <div class="promo-icon-badge telegram-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.06-.06-.15-.04-.22-.02-.1.02-1.63 1.04-4.61 3.05-.44.3-.83.45-1.19.44-.39-.01-1.15-.22-1.71-.4-.69-.22-1.24-.34-1.19-.72.03-.2.3-.4.82-.62 3.23-1.41 5.39-2.34 6.49-2.8 3.09-1.3 3.73-1.53 4.15-1.53.09 0 .3.02.43.13.11.09.14.22.16.31-.01.07.01.22 0 .34z"/>
            </svg>
          </div>
        </div>

        <!-- Special Offers Card -->
        <div class="promo-banner-card promo-offers-card" id="btn-promo-offers">
          <div class="promo-banner-texts">
            <span class="promo-tag-text gold">SPECIAL</span>
            <h3 class="promo-title-text">OFFERS</h3>
            <p class="promo-sub-text">Don't Miss Out!</p>
          </div>
          <div class="promo-icon-badge gift-badge">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="8" width="18" height="13" rx="2.5" fill="url(#promoGiftGrad)" stroke="#f59e0b" stroke-width="1.2"/>
              <rect x="2" y="5" width="20" height="4.5" rx="1.5" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
              <path d="M12 5V21" stroke="#fef08a" stroke-width="2.5"/>
              <path d="M12 5C12 5 9 1.5 6.5 2.5C4.5 3.5 6.5 7 12 5Z" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
              <path d="M12 5C12 5 15 1.5 17.5 2.5C19.5 3.5 17.5 7 12 5Z" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
              <defs>
                <linearGradient id="promoGiftGrad" x1="3" y1="8" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#f59e0b"/>
                  <stop offset="1" stop-color="#b45309"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function bindPromoBannersEvents() {
  document.getElementById('btn-promo-telegram')?.addEventListener('click', () => {
    window.open(appUrls.telegram, '_blank');
  });

  document.getElementById('btn-promo-offers')?.addEventListener('click', () => {
    const urls = authService.getUrls();
    openExternalStore(urls.topup || 'https://noobtopup.com/', '#0284c7');
  });
}
