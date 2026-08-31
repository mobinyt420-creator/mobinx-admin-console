import { stateManager } from '../services/stateManager.js';
import { authService } from '../services/authService.js';
import { openExternalStore } from '../services/browserService.js';

export function renderBottomNav(currentView = 'home') {
  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9.5L12 2.5L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" ${currentView === 'home' ? 'fill="url(#navHomeGrad)" stroke="#2563eb"' : 'stroke="currentColor" stroke-width="2"'}/>
          <path d="M9 21V12H15V21" ${currentView === 'home' ? 'stroke="#ffffff" stroke-width="2"' : 'stroke="currentColor" stroke-width="2"'}/>
          <defs>
            <linearGradient id="navHomeGrad" x1="3" y1="2.5" x2="21" y2="21" gradientUnits="userSpaceOnUse">
              <stop stop-color="#3b82f6"/>
              <stop offset="1" stop-color="#1d4ed8"/>
            </linearGradient>
          </defs>
        </svg>`
    },
    {
      id: 'topup',
      label: 'Top Up',
      icon: `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="6 3 18 3 22 9 12 22 2 9 6 3" ${currentView === 'topup' ? 'fill="#dbeafe" stroke="#2563eb"' : ''}></polygon>
        </svg>`
    },
    {
      id: 'shop',
      label: 'Shop',
      icon: `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" ${currentView === 'shop' ? 'stroke="#2563eb"' : ''}></path>
        </svg>`
    },
    {
      id: 'downloads',
      label: 'Downloads',
      icon: `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>`
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" ${currentView === 'profile' ? 'stroke="#2563eb"' : ''}></path>
          <circle cx="12" cy="7" r="4" ${currentView === 'profile' ? 'fill="#dbeafe" stroke="#2563eb"' : ''}></circle>
        </svg>`
    }
  ];

  return `
    <nav class="bottom-nav">
      ${tabs.map(tab => `
        <button class="nav-tab ${currentView === tab.id ? 'active' : ''}" data-nav="${tab.id}" id="nav-btn-${tab.id}" aria-label="${tab.label}">
          ${tab.icon}
          <span class="nav-tab-label">${tab.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

export function bindBottomNavEvents() {
  document.querySelectorAll('.nav-tab').forEach(button => {
    button.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-nav');
      if (target === 'topup') {
        const urls = authService.getUrls();
        openExternalStore(urls.topup || 'https://noobtopup.com/', '#0284c7');
        return;
      }
      if (target === 'shop') {
        const urls = authService.getUrls();
        openExternalStore(urls.shop || 'https://www.obinshop.com/', '#7c3aed');
        return;
      }
      if (target) {
        stateManager.navigate(target);
      }
    });
  });
}
