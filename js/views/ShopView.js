import { APP_CONFIG_URLS } from '../config/urls.js';
import { stateManager } from '../services/stateManager.js';
import { authService } from '../services/authService.js';
import { openExternalStore } from '../services/browserService.js';

export function renderShopView() {
  const urls = authService.getUrls();
  const targetUrl = urls.shop || APP_CONFIG_URLS.SHOP_URL || 'https://www.obinshop.com/';
  // Trigger immediate seamless redirect
  openExternalStore(targetUrl, '#7c3aed');
  setTimeout(() => {
    stateManager.navigate('home');
  }, 100);
  return `<div class="view-container" style="background: transparent;"></div>`;
}

export function bindShopEvents() {
  const urls = authService.getUrls();
  const targetUrl = urls.shop || APP_CONFIG_URLS.SHOP_URL || 'https://www.obinshop.com/';
  openExternalStore(targetUrl, '#7c3aed');
  stateManager.navigate('home');
}
