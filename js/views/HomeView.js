import { renderBannerCarousel, initBannerCarousel } from '../components/BannerCarousel.js';
import { renderCategorySlider, bindCategoryEvents } from '../components/CategorySlider.js';
import { renderPopularServicesGrid, bindPopularServicesEvents } from '../components/PopularServicesGrid.js';
import { renderFlashSaleSection, initFlashSaleCountdown } from '../components/FlashSaleSection.js';
import { renderPromoBanners, bindPromoBannersEvents } from '../components/PromoBanners.js';
import { renderHomeNoticePopup, bindHomeNoticePopupEvents } from '../components/HomeNoticePopup.js';
import { stateManager } from '../services/stateManager.js';

export function renderHomeView() {
  return `
    <div class="view-container home-view">
      <!-- 1. Hero 16:9 Banner Slider -->
      ${renderBannerCarousel()}

      <!-- 2. Quick 4-Category Shortcuts (Auto-scroll) -->
      ${renderCategorySlider()}

      <!-- 3. Popular Services Grid (3-Column 1:1 Images) -->
      ${renderPopularServicesGrid()}

      <!-- 4. Flash Diamond Top Up Section with Countdown & Products -->
      ${renderFlashSaleSection()}

      <!-- 5. Mini Promotional Banners (Telegram & Special Offers) -->
      ${renderPromoBanners()}

      <!-- 6. Home Notice / Play Store Update Modal Popup (Admin Controlled) -->
      ${renderHomeNoticePopup()}
    </div>
  `;
}

export function bindHomeEvents() {
  initBannerCarousel();
  bindCategoryEvents();
  bindPopularServicesEvents();
  initFlashSaleCountdown();
  bindPromoBannersEvents();
  bindHomeNoticePopupEvents();
}
