import { authService } from '../services/authService.js';
import { stateManager } from '../services/stateManager.js';
import { openExternalStore } from '../services/browserService.js';

let carouselTimer = null;
let currentSlideIndex = 0;

export function renderBannerCarousel() {
  const allBanners = authService.getHeroBanners();
  const heroBanners = allBanners.filter(b => b.isActive !== false && b.status !== 'inactive');
  currentSlideIndex = 0;

  if (heroBanners.length === 0) return '';

  return `
    <section class="hero-banner-section">
      <div class="carousel-container" id="hero-carousel-container">
        <div class="carousel-slides-track" id="carousel-slides-track">
          ${heroBanners.map((banner, index) => `
            <div class="carousel-slide" data-index="${index}" data-route="${banner.actionRoute || 'topup'}">
              <img class="carousel-slide-bg" src="${banner.image}" alt="Banner ${index + 1}" loading="lazy" />
            </div>
          `).join('')}
        </div>

        <div class="carousel-pagination-dots">
          ${heroBanners.map((_, i) => `
            <div class="carousel-dot ${i === 0 ? 'active' : ''}" data-dot="${i}"></div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

export function initBannerCarousel() {
  const allBanners = authService.getHeroBanners();
  const heroBanners = allBanners.filter(b => b.isActive !== false && b.status !== 'inactive');
  const track = document.getElementById('carousel-slides-track');
  const dots = document.querySelectorAll('.carousel-dot');
  const slides = document.querySelectorAll('.carousel-slide');

  if (!track || slides.length === 0) return;


  function goToSlide(index) {
    if (heroBanners.length === 0) return;
    currentSlideIndex = (index + heroBanners.length) % heroBanners.length;
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === currentSlideIndex);
    });
  }

  // Clear existing timer
  if (carouselTimer) clearInterval(carouselTimer);

  // Auto-advance slideshow smoothly every 4 seconds
  if (heroBanners.length > 1) {
    carouselTimer = setInterval(() => {
      goToSlide(currentSlideIndex + 1);
    }, 4000);
  }

  // Click on pagination dots
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const dotIndex = parseInt(dot.getAttribute('data-dot'), 10);
      goToSlide(dotIndex);
    });
  });

  // Slide click handler
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
      const banner = heroBanners[i];
      if (banner && banner.actionRoute) {
        const route = banner.actionRoute.trim();
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
        if (route.startsWith('http://') || route.startsWith('https://')) {
          openExternalStore(route, '#0284c7');
        } else {
          stateManager.navigate(route, banner.actionPayload);
        }
      }
    });
  });

  // Touch Swipe Support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 45) {
      goToSlide(currentSlideIndex + 1);
    } else if (touchEndX - touchStartX > 45) {
      goToSlide(currentSlideIndex - 1);
    }
  }, { passive: true });
}

