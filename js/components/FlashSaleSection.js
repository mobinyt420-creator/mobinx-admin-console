import { authService } from '../services/authService.js';
import { stateManager } from '../services/stateManager.js';
import { Toast } from './Toast.js';
import { openExternalStore } from '../services/browserService.js';

let countdownTimer = null;
let remainingSeconds = 2 * 3600 + 35 * 60 + 48; // 02:35:48

export function renderFlashSaleSection() {
  const authSettings = authService.getAuthSettings();
  if (authSettings.topUpEnabled === false) return '';

  const storedProducts = authService.getFlashDeals();
  const rawProducts = (storedProducts && storedProducts.length > 0) ? storedProducts : [
    { id: "flash-1", diamondAmount: "100 DIAMONDS", price: "৳ 80.00", badge: "100% BONUS", badgeColor: "#ea580c", isActive: true },
    { id: "flash-2", diamondAmount: "310 DIAMONDS", price: "৳ 270.00", badge: "POPULAR", badgeColor: "#2563eb", isActive: true },
    { id: "flash-3", diamondAmount: "520 DIAMONDS", price: "৳ 420.00", badge: "BEST VALUE", badgeColor: "#16a34a", isActive: true },
    { id: "flash-4", diamondAmount: "1060 DIAMONDS", price: "৳ 820.00", badge: "VIP BONUS", badgeColor: "#9333ea", isActive: true }
  ];

  const baseProducts = rawProducts.filter(p => p.isActive !== false && p.status !== 'inactive');
  if (baseProducts.length === 0) return '';

  // Repeat for continuous seamless infinite glide
  const duplicatedProducts = [...baseProducts, ...baseProducts, ...baseProducts, ...baseProducts];


  return `
    <section class="flash-diamond-section">
      <!-- Dark Gaming Header Banner -->
      <div class="flash-header-banner">
        <div class="flash-header-left">
          <svg class="flash-bolt-icon" width="18" height="18" viewBox="0 0 24 24" fill="#facc15">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span class="flash-header-title">FLASH</span>
          <span class="flash-header-title-light">DIAMOND TOP UP</span>
        </div>

        <div class="flash-countdown-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span class="flash-ends-text">Ends In</span>
          <span class="flash-timer-digits" id="flash-countdown-digits">02 : 35 : 48</span>
        </div>
      </div>

      <!-- Horizontal Seamless Infinite Auto-Scrolling Diamond Marquee -->
      <div class="flash-products-carousel" id="flash-products-track-container">
        <div class="flash-products-track infinite-flash-track" id="flash-products-track">
          ${duplicatedProducts.map((prod, idx) => `
            <div class="flash-diamond-card" data-product-id="${prod.id}">
              <div class="flash-card-badge" style="background: ${prod.badgeColor || (idx % 2 === 0 ? '#ea580c' : '#2563eb')}; color: #ffffff;">
                ${prod.badge || 'FLASH DEAL'}
              </div>

              <div class="flash-card-diamond-graphic">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
                  <path d="M6 3H18L22 9L12 22L2 9L6 3Z" fill="url(#flashDiamGrad-${prod.id}-${idx})" stroke="#38bdf8" stroke-width="1.2" stroke-linejoin="round"/>
                  <path d="M2 9H22M12 22L7 9M12 22L17 9M6 3L8.5 9M18 3L15.5 9" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round" opacity="0.9"/>
                  <defs>
                    <linearGradient id="flashDiamGrad-${prod.id}-${idx}" x1="2" y1="3" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#38bdf8"/>
                      <stop offset="0.5" stop-color="#0284c7"/>
                      <stop offset="1" stop-color="#1e40af"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div class="flash-card-details">
                <div class="flash-diamond-qty">${prod.diamondAmount}</div>
                <div class="flash-diamond-price">${prod.price}</div>
              </div>

              <button class="flash-buy-btn btn-gold" data-buy-id="${prod.id}" data-amount="${prod.diamondAmount}" data-price="${prod.price}">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span>Buy Now</span>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

export function initFlashSaleCountdown() {
  const digitsEl = document.getElementById('flash-countdown-digits');

  if (countdownTimer) clearInterval(countdownTimer);

  function formatTime(totalSec) {
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    return `${hrs} : ${mins} : ${secs}`;
  }

  countdownTimer = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      if (digitsEl) digitsEl.textContent = formatTime(remainingSeconds);
    }
  }, 1000);

  // Buy Now click interactions
  document.querySelectorAll('.flash-buy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const amount = btn.dataset.amount || 'Diamonds';
      const price = btn.dataset.price || '';
      Toast.show(`Opening Top Up for ${amount} (${price})...`, 'info');
      const urls = authService.getUrls();
      openExternalStore(urls.topup || 'https://noobtopup.com/', '#0284c7');
    });
  });
}
