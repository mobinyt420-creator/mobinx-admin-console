import { APP_CONFIG_URLS } from '../config/urls.js';
import { stateManager } from '../services/stateManager.js';
import { authService } from '../services/authService.js';
import { openExternalStore } from '../services/browserService.js';

export function renderTopUpView() {
  const urls = authService.getUrls();
  const targetUrl = urls.topup || APP_CONFIG_URLS.TOPUP_URL || 'https://noobtopup.com/';
  // Trigger immediate seamless redirect
  openExternalStore(targetUrl, '#0284c7');
  setTimeout(() => {
    stateManager.navigate('home');
  }, 100);
  return `<div class="view-container" style="background: transparent;"></div>`;
}

export function bindTopUpEvents() {
  const urls = authService.getUrls();
  const targetUrl = urls.topup || APP_CONFIG_URLS.TOPUP_URL || 'https://noobtopup.com/';
  openExternalStore(targetUrl, '#0284c7');
  stateManager.navigate('home');
}
