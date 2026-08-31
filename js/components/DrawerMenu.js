import { stateManager } from '../services/stateManager.js';
import { authService } from '../services/authService.js';
import { resetOnboardingStep } from '../views/OnboardingView.js';
import { openExternalStore } from '../services/browserService.js';

export function renderDrawerMenu(isOpen = false, currentView = 'home') {
  const user = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  const authSettings = authService.getAuthSettings();

  const menuItems = [
    { id: 'home', label: 'Home', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>' },
    ...(authSettings.topUpEnabled !== false ? [{ id: 'topup', label: 'Top Up (noobtopup.com)', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="6 3 18 3 22 9 12 22 2 9 6 3"></polygon></svg>' }] : []),
    { id: 'shop', label: 'Shop (obinshop.com)', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>' },
    { id: 'downloads', label: 'Downloads (mrmobin1m)', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' },
    { id: 'tournaments', label: 'Tournaments & Cups', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-2c-.55 0-1-.45-1-1v-2.34"></path><path d="M18 4H6v7a6 6 0 0 0 12 0V4z"></path></svg>' },
    { id: 'sensitivity', label: 'Sensitivity Maker', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>' },
    { id: 'referral', label: 'Refer & Earn', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>' },
    { id: 'notifications', label: 'Notification Center', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>' },
    { id: 'onboarding', label: 'Welcome / Onboarding', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>' },
    { divider: true },
    { id: 'settings', label: 'Settings', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>' },
    { id: 'help', label: 'Help & Support', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>' },
    { id: 'about', label: 'About Mobin X', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>' }
  ];



  return `
    <div class="drawer-overlay ${isOpen ? 'open' : ''}" id="drawer-backdrop">
      <div class="drawer-menu" id="drawer-container">
        <div class="drawer-header">
          <button class="drawer-close-btn" id="btn-close-drawer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div class="drawer-user-info" id="drawer-user-card" style="cursor: pointer;">
            <div class="drawer-avatar">
              <img src="${user.avatar && !user.avatar.includes('dicebear') ? user.avatar : 'data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 64 64\'><circle cx=\'32\' cy=\'32\' r=\'32\' fill=\'%231e293b\'/><circle cx=\'32\' cy=\'24\' r=\'12\' fill=\'%233b82f6\'/><path d=\'M14 52c0-10 8-18 18-18s18 8 18 18\' fill=\'%232563eb\'/></svg>'}" alt="${user.username || 'Player'}" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 64 64\'><circle cx=\'32\' cy=\'32\' r=\'32\' fill=\'%231e293b\'/><circle cx=\'32\' cy=\'24\' r=\'12\' fill=\'%233b82f6\'/><path d=\'M14 52c0-10 8-18 18-18s18 8 18 18\' fill=\'%232563eb\'/></svg>';" />
            </div>
            <div>
              <div class="drawer-user-name">${user.username}</div>
              <div class="drawer-user-id">${user.email} • ${isAdmin ? '👑 ADMIN' : user.role}</div>
            </div>
          </div>
        </div>

        <div class="drawer-body">
          ${menuItems.map(item => {
            if (item.divider) return `<div class="drawer-divider"></div>`;
            return `
              <button class="drawer-item ${currentView === item.id ? 'active' : ''}" data-route="${item.id}" style="${item.special ? 'background: #fee2e2; color: #b91c1c; font-weight: 800;' : ''}">
                ${item.icon}
                <span>${item.label}</span>
              </button>
            `;
          }).join('')}
        </div>

        <div class="drawer-footer">
          <span>Mobin X • V1.0.0</span>
          <span style="color: var(--success); font-weight: 700;">Online ●</span>
        </div>
      </div>
    </div>
  `;
}

export function bindDrawerEvents() {
  document.getElementById('btn-close-drawer')?.addEventListener('click', () => {
    stateManager.toggleDrawer(false);
  });

  document.getElementById('drawer-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'drawer-backdrop') {
      stateManager.toggleDrawer(false);
    }
  });

  document.getElementById('drawer-user-card')?.addEventListener('click', () => {
    stateManager.navigate('profile');
  });

  document.querySelectorAll('.drawer-item').forEach(button => {
    button.addEventListener('click', (e) => {
      const route = e.currentTarget.getAttribute('data-route');
      stateManager.toggleDrawer(false);
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
        if (route === 'onboarding') {
          resetOnboardingStep();
        }
        stateManager.navigate(route);
      }
    });
  });
}
