import { quickCategories } from '../data/mockData.js';
import { stateManager } from '../services/stateManager.js';
import { authService } from '../services/authService.js';
import { openExternalStore } from '../services/browserService.js';

export function renderCategorySlider() {
  const iconSvgs = {
    diamond: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M6 3H18L22 9L12 22L2 9L6 3Z" fill="url(#catDiamondGrad)" stroke="#2563eb" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M2 9H22M12 22L7 9M12 22L17 9M6 3L8.5 9M18 3L15.5 9" stroke="#93c5fd" stroke-width="1.2" stroke-linejoin="round"/>
        <defs>
          <linearGradient id="catDiamondGrad" x1="2" y1="3" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stop-color="#38bdf8"/>
            <stop offset="1" stop-color="#1d4ed8"/>
          </linearGradient>
        </defs>
      </svg>`,
    bag: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M6 8V6C6 3.79086 7.79086 2 10 2H14C16.2091 2 18 3.79086 18 6V8" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/>
        <rect x="3" y="8" width="18" height="14" rx="4" fill="url(#catBagGrad)" stroke="#6d28d9" stroke-width="1.5"/>
        <path d="M9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
        <defs>
          <linearGradient id="catBagGrad" x1="3" y1="8" x2="21" y2="22" gradientUnits="userSpaceOnUse">
            <stop stop-color="#a855f7"/>
            <stop offset="1" stop-color="#6d28d9"/>
          </linearGradient>
        </defs>
      </svg>`,
    'cloud-download': `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="url(#catDlGrad)"/>
        <path d="M12 7V15M12 15L9 12M12 15L15 12" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 17H16" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
        <defs>
          <linearGradient id="catDlGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stop-color="#34d399"/>
            <stop offset="1" stop-color="#059669"/>
          </linearGradient>
        </defs>
      </svg>`,
    trophy: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M6 4H18V10C18 13.3137 15.3137 16 12 16C8.68629 16 6 13.3137 6 10V4Z" fill="url(#catTrophyGrad)" stroke="#d97706" stroke-width="1.5"/>
        <path d="M6 6H3C2.44772 6 2 6.44772 2 7V8C2 9.65685 3.34315 11 5 11H6" stroke="#d97706" stroke-width="1.8"/>
        <path d="M18 6H21C21.5523 6 22 6.44772 22 7V8C22 9.65685 20.6569 11 19 11H18" stroke="#d97706" stroke-width="1.8"/>
        <path d="M12 16V19M8 22H16" stroke="#d97706" stroke-width="2" stroke-linecap="round"/>
        <defs>
          <linearGradient id="catTrophyGrad" x1="6" y1="4" x2="18" y2="16" gradientUnits="userSpaceOnUse">
            <stop stop-color="#fbbf24"/>
            <stop offset="1" stop-color="#d97706"/>
          </linearGradient>
        </defs>
      </svg>`
  };

  const authSettings = authService.getAuthSettings();
  const activeCategories = quickCategories.filter(cat => {
    if (cat.route === 'topup' && authSettings.topUpEnabled === false) return false;
    return true;
  });

  // Duplicate set to create seamless infinite loop animation
  const duplicatedList = [...activeCategories, ...activeCategories, ...activeCategories];

  return `
    <section class="category-section">
      <div class="category-marquee-container" id="category-track-container">
        <div class="category-marquee-track infinite-glide-track" id="category-scroll-track">
          ${duplicatedList.map((cat, idx) => `
            <div class="category-shortcut-card" data-category="${cat.route}" id="cat-btn-${cat.id}-${idx}">
              <div class="category-icon-box" style="background: ${cat.bgGradient};">
                ${iconSvgs[cat.icon]}
              </div>
              <span class="category-shortcut-label">${cat.title}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

export function bindCategoryEvents() {
  document.querySelectorAll('.category-shortcut-card').forEach(card => {
    card.addEventListener('click', () => {
      const route = card.getAttribute('data-category');
      if (route === 'topup') {
        const urls = authService.getUrls();
        openExternalStore(urls.topup || 'https://noobtopup.com/', '#0284c7');
        return;
      }
      if (route === 'shop') {
        const urls = authService.getUrls();
        openExternalStore(urls.shop || 'https://www.obinshop.com/', '#7c3aed');
        return;
      }
      if (route) {
        stateManager.navigate(route);
      }
    });
  });
}
