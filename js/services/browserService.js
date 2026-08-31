import { APP_CONFIG_URLS } from '../config/urls.js';

/**
 * Open external website (NoobTopUp, ObinShop) in a high-performance Android Chrome Custom Tab
 * Allows full Google Sign-In, 100% automated payments (bKash, Nagad), and native close button.
 */
export function openExternalStore(url = 'https://noobtopup.com/', toolbarColor = '#0284c7') {
  // 1. Android Native Chrome Custom Tabs Bridge (matching Android Custom Tab UI)
  if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.openCustomTab === 'function') {
    try {
      window.AndroidBridge.openCustomTab(url);
      return;
    } catch (e) {
      console.warn('AndroidBridge.openCustomTab error:', e);
    }
  }

  // 2. Capacitor Browser Plugin (if available in native container)
  if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
    try {
      window.Capacitor.Plugins.Browser.open({
        url: url,
        toolbarColor: toolbarColor,
        presentationStyle: 'fullscreen'
      });
      return;
    } catch (e) {
      console.warn('Capacitor.Plugins.Browser.open error:', e);
    }
  }

  // 3. Fallback for Desktop browser preview
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
