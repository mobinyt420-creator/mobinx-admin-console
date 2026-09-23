import { firebaseService } from './firebaseService.js';
import { tournamentService } from './tournamentService.js';
import { downloadService } from './downloadService.js';
import { authService } from './authService.js';
import { notificationService } from './notificationService.js';
import { stateManager } from './stateManager.js';
import { Toast } from '../components/Toast.js';

class RealtimeSyncManager {
  constructor() {
    this.isInitialized = false;
    this.unsubscribers = [];
    this.debounceTimers = {};
    this.processedBroadcastIds = new Set();
    this.isNotificationListenerReady = false;
  }

  showFloatingPushBanner(title, message, notif = {}) {
    if (typeof document === 'undefined') return;

    const existing = document.getElementById('floating-push-banner');
    if (existing) existing.remove();

    if (!document.getElementById('floating-push-banner-styles')) {
      const style = document.createElement('style');
      style.id = 'floating-push-banner-styles';
      style.textContent = `
        @keyframes pushBannerSlideIn {
          from { opacity: 0; transform: translate(-50%, -24px) scale(0.96); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        @keyframes pushBannerSlideOut {
          from { opacity: 1; transform: translate(-50%, 0) scale(1); }
          to { opacity: 0; transform: translate(-50%, -30px) scale(0.95); }
        }
        @keyframes pushPulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.35); }
        }
      `;
      document.head.appendChild(style);
    }

    const typeIcons = {
      tournament: '🏆',
      topup: '💎',
      download: '📥',
      system: '⚡',
      general: '🔔'
    };
    const icon = typeIcons[notif.type] || '🔔';
    const actionUrl = notif.actionUrl || notif.targetUrl || notif.extraUrl || '';

    const banner = document.createElement('div');
    banner.id = 'floating-push-banner';
    banner.style.cssText = `
      position: fixed;
      top: 14px;
      left: 50%;
      transform: translate(-50%, 0);
      width: calc(100% - 24px);
      max-width: 420px;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(10, 15, 29, 0.99) 100%);
      border: 1.5px solid rgba(56, 189, 248, 0.45);
      border-radius: 18px;
      padding: 12px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 999999;
      box-shadow: 0 16px 40px rgba(0,0,0,0.7), 0 0 25px rgba(56, 189, 248, 0.2);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      animation: pushBannerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      color: #ffffff;
      box-sizing: border-box;
      cursor: pointer;
    `;

    banner.innerHTML = `
      <div style="width: 44px; height: 44px; border-radius: 14px; background: rgba(56, 189, 248, 0.15); border: 1.5px solid rgba(56, 189, 248, 0.35); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; box-shadow: 0 0 15px rgba(56, 189, 248, 0.25);">
        ${icon}
      </div>
      <div style="flex: 1; min-width: 0;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: #38bdf8; display: inline-block; animation: pushPulseGlow 1.5s infinite;"></span>
          <span style="font-size: 10px; font-weight: 800; color: #38bdf8; letter-spacing: 0.8px; text-transform: uppercase;">OBIN PUSH • JUST NOW</span>
        </div>
        <div style="font-size: 13.5px; font-weight: 800; color: #ffffff; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${title}</div>
        <div style="font-size: 11.5px; color: #cbd5e1; line-height: 1.35; margin-top: 1px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${message}</div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
        ${actionUrl ? `
          <div style="background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; padding: 6px 12px; border-radius: 10px; font-size: 11.5px; font-weight: 800; box-shadow: 0 2px 8px rgba(37,99,235,0.4);">
            Open →
          </div>
        ` : ''}
        <button id="btn-dismiss-push-banner" style="width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.1); border: none; color: #94a3b8; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; cursor: pointer;">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(banner);

    let dismissTimer = null;
    const dismiss = () => {
      if (dismissTimer) clearTimeout(dismissTimer);
      banner.style.animation = 'pushBannerSlideOut 0.25s ease-in forwards';
      setTimeout(() => banner.remove(), 260);
    };

    banner.addEventListener('click', (e) => {
      if (e.target.id === 'btn-dismiss-push-banner' || e.target.closest('#btn-dismiss-push-banner')) {
        e.stopPropagation();
        dismiss();
        return;
      }
      dismiss();
      if (actionUrl) {
        if (typeof window.handleNotificationClick === 'function') {
          window.handleNotificationClick(actionUrl);
        } else if (actionUrl.startsWith('http')) {
          window.open(actionUrl, '_blank');
        } else {
          stateManager.navigate(actionUrl.replace('/', ''));
        }
      } else {
        stateManager.navigate('notifications');
      }
    });

    dismissTimer = setTimeout(dismiss, 6500);
  }

  handleIncomingPushNotification(notif, forceAlert = false) {
    if (!notif || notif.active === false) return;
    const notifMsg = notif.message || notif.desc || '';
    if (!notifMsg) return;

    const notifTitle = notif.title || 'MOBIN X GAMING';
    const notifId = notif.id || `notif_${notif.timestamp || Date.now()}`;
    const broadcastId = notif.broadcastId || `${notifId}_${notif.timestamp || Date.now()}`;

    // Deduplicate: Don't show the exact same broadcast twice in this session
    if (this.processedBroadcastIds.has(broadcastId)) {
      return;
    }
    this.processedBroadcastIds.add(broadcastId);

    const lastShown = localStorage.getItem('mobinx_last_shown_broadcast');
    const isNewBroadcast = lastShown !== broadcastId;
    const isRecent = notif.timestamp ? (Date.now() - notif.timestamp < 1000 * 60 * 60 * 6) : true;

    // Show if it's a fresh broadcast or listener is ready
    if (!this.isNotificationListenerReady && !isNewBroadcast && !forceAlert) {
      return;
    }

    if (isNewBroadcast) {
      try {
        localStorage.setItem('mobinx_last_shown_broadcast', broadcastId);
      } catch(e) {}
    }

    // 1. Trigger Floating In-App Heads-Up Banner
    this.showFloatingPushBanner(notifTitle, notifMsg, notif);
    Toast.show(`📢 ${notifTitle}: ${notifMsg}`, 'info');

    // 2. Trigger Native Android Status Bar Notification (Heads-Up Banner)
    try {
      if (typeof window !== 'undefined' && window.AndroidBridge) {
        if (typeof window.AndroidBridge.showNativeNotificationWithAction === 'function') {
          window.AndroidBridge.showNativeNotificationWithAction(
            notifTitle,
            notifMsg,
            notif.type || 'general',
            notif.actionUrl || notif.targetUrl || notif.extraUrl || ''
          );
        } else if (typeof window.AndroidBridge.showNativeNotification === 'function') {
          window.AndroidBridge.showNativeNotification(notifTitle, notifMsg);
        }
      }
    } catch(e) {
      console.warn('Native notification bridge notice:', e);
    }

    // 3. Web Notification API Fallback (for mobile Chrome / PWA)
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notifTitle, {
          body: notifMsg,
          icon: '/assets/icons/icon-192.png',
          badge: '/assets/icons/icon-192.png',
          vibrate: [200, 100, 200],
          tag: broadcastId
        });
      }
    } catch(e) {}

    // Add to In-App Notification Center
    try {
      notificationService.addNotification({
        id: notifId,
        title: notifTitle,
        desc: notifMsg,
        time: 'Just now',
        type: notif.type || 'system',
        unread: true,
        actionUrl: notif.actionUrl || notif.targetUrl || notif.extraUrl || '',
        imageUrl: notif.imageUrl || notif.extraUrl || ''
      });
      this.triggerViewUpdate('notifications');
      this.triggerViewUpdate('header');
    } catch(e) {}
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // 1. Cross-tab / Local BroadcastChannel listener (Instant <10ms sync)
    firebaseService.onBroadcastMessage((msg) => {
      if (msg.type === 'PUSH_NOTIFICATION_SENT' && msg.payload) {
        this.handleIncomingPushNotification(msg.payload, true);
      } else {
        this.handleIncomingSync(msg.type, msg.payload, true);
      }
    });

    // 2. Storage event listener (Fallback cross-tab sync)
    window.addEventListener('storage', (e) => {
      if (!e.key) return;
      if (e.key === 'mobinx_tournaments_data') {
        tournamentService.reloadFromStorage();
        this.triggerViewUpdate('tournaments');
      } else if (e.key === 'mobinx_downloads_catalog') {
        downloadService.reloadFromStorage();
        this.triggerViewUpdate('downloads');
      } else if (e.key === 'mobinx_hero_banners' || e.key === 'mobinx_flash_deals' || e.key === 'mobinx_popular_services' || e.key === 'mobinx_home_shop_products' || e.key === 'mobinx_promo_banners') {
        this.triggerViewUpdate('home');
      }
    });

    // 3. Connect to Firestore Live Listeners (onSnapshot)
    this.initFirestoreRealtimeListeners();
  }

  async initFirestoreRealtimeListeners() {
    try {
      const fb = await firebaseService.init();
      if (!fb || !fb.db) return;

      console.log('⚡ Mobin X App: Connected to Real-Time Cloud Firestore Sync');

      // Live Tournaments Listener (Handles additions, updates, and deletions immediately)
      const unsubTournaments = await firebaseService.subscribeCollection('tournaments', (items) => {
        if (items) {
          tournamentService.setAll(items);
          this.triggerViewUpdate('tournaments');
        }
      });
      if (unsubTournaments) this.unsubscribers.push(unsubTournaments);

      // Live Downloads Listener
      const unsubDownloads = await firebaseService.subscribeCollection('downloads', (items) => {
        if (items) {
          downloadService.setCatalog(items);
          this.triggerViewUpdate('downloads');
        }
      });
      if (unsubDownloads) this.unsubscribers.push(unsubDownloads);

      // Live Banners Listener
      const unsubBanners = await firebaseService.subscribeCollection('banners', (items) => {
        if (items) {
          authService.saveHeroBanners(items);
          this.triggerViewUpdate('home');
        }
      });
      if (unsubBanners) this.unsubscribers.push(unsubBanners);

      // Live Flash Deals Listener
      const unsubDeals = await firebaseService.subscribeCollection('flashDeals', (items) => {
        if (items) {
          authService.saveFlashDeals(items);
          this.triggerViewUpdate('home');
        }
      });
      if (unsubDeals) this.unsubscribers.push(unsubDeals);

      // Live System Config & URLs
      const unsubConfig = await firebaseService.subscribeDocument('config', 'system', (data) => {
        if (data && data.urls) {
          authService.updateUrls(data.urls);
        }
      });
      if (unsubConfig) this.unsubscribers.push(unsubConfig);

      // Live Push Notifications / Global Notices
      const unsubNotices = await firebaseService.subscribeDocument('config', 'notices', (data) => {
        const notif = data?.pushNotification;
        if (notif) {
          this.handleIncomingPushNotification(notif);
        }
        this.isNotificationListenerReady = true;
      });
      if (unsubNotices) this.unsubscribers.push(unsubNotices);

      // Live Flash Broadcast Listener
      const unsubFlash = await firebaseService.subscribeDocument('config', 'flash_broadcast', (notif) => {
        if (notif) {
          this.handleIncomingPushNotification({ ...notif, type: 'flash' });
        }
      });
      if (unsubFlash) this.unsubscribers.push(unsubFlash);

      // Live Full Notifications Collection Listener
      const unsubNotificationsCollection = await firebaseService.subscribeCollection('notifications', (items) => {
        if (items && items.length > 0) {
          items.sort((a, b) => (b.timestamp || b.createdAt || 0) - (a.timestamp || a.createdAt || 0));
          const latest = items[0];
          if (latest) {
            this.handleIncomingPushNotification(latest);
          }
        }
        this.isNotificationListenerReady = true;
      });
      if (unsubNotificationsCollection) this.unsubscribers.push(unsubNotificationsCollection);

      // Live Auth Settings & Feature Flags Listener
      const unsubAuthSettings = await firebaseService.subscribeDocument('config', 'auth_settings', (data) => {
        if (data) {
          const prevJson = JSON.stringify(authService.getAuthSettings());
          const nextJson = JSON.stringify({ ...authService.getAuthSettings(), ...data });
          authService.applyAuthSettings(data);
          if (prevJson !== nextJson) {
            this.triggerViewUpdate('onboarding');
            this.triggerViewUpdate('home');
          }
        }
      });
      if (unsubAuthSettings) this.unsubscribers.push(unsubAuthSettings);

      // Live Home Promotional / Notice Popup Listener
      const unsubHomePopup = await firebaseService.subscribeDocument('config', 'home_popup', (data) => {
        if (data) {
          const prevJson = JSON.stringify(authService.getHomeNoticePopup());
          const nextJson = JSON.stringify({ ...authService.getHomeNoticePopup(), ...data });
          authService.applyHomeNoticePopup(data);
          if (prevJson !== nextJson) {
            this.triggerViewUpdate('home');
          }
        }
      });
      if (unsubHomePopup) this.unsubscribers.push(unsubHomePopup);

      // Live Google Play Store App Update Listener
      const unsubAppUpdate = await firebaseService.subscribeDocument('config', 'app_update', (data) => {
        if (data) {
          const prevJson = JSON.stringify(authService.getAppUpdateConfig());
          const nextJson = JSON.stringify({ ...authService.getAppUpdateConfig(), ...data });
          authService.applyAppUpdateConfig(data);
          if (prevJson !== nextJson) {
            this.triggerViewUpdate('home');
          }
        }
      });
      if (unsubAppUpdate) this.unsubscribers.push(unsubAppUpdate);

      // Live Dynamic Products Listener
      const unsubDynamicProducts = await firebaseService.subscribeDocument('config', 'dynamic_products', (data) => {
        const prodList = (data && Array.isArray(data.products)) ? data.products : ((data && Array.isArray(data.list)) ? data.list : null);
        if (prodList) {
          const prevJson = JSON.stringify(authService.getDynamicProducts());
          const nextJson = JSON.stringify(prodList);
          authService.applyDynamicProducts(prodList);
          if (prevJson !== nextJson) {
            this.triggerViewUpdate('home');
          }
        }
      });
      if (unsubDynamicProducts) this.unsubscribers.push(unsubDynamicProducts);

      // Live Home Shop Products Listener (2 Cards below Flash Sale)
      const unsubShopProducts = await firebaseService.subscribeDocument('config', 'shop_products', (data) => {
        if (data && Array.isArray(data.products)) {
          const prevJson = JSON.stringify(authService.getHomeShopProducts());
          const nextJson = JSON.stringify(data.products);
          authService.applyHomeShopProducts(data.products);
          if (prevJson !== nextJson) {
            this.triggerViewUpdate('home');
          }
        }
      });
      if (unsubShopProducts) this.unsubscribers.push(unsubShopProducts);

    } catch (e) {
      console.warn('Real-time Firestore listener notice:', e.message);
    }
  }

  handleIncomingSync(type, payload, showNotice = false) {
    const currentView = stateManager.getState().currentView;

    switch (type) {
      case 'AUTH_SETTINGS_UPDATED':
        if (payload) {
          authService.applyAuthSettings(payload);
          this.triggerViewUpdate('onboarding');
          this.triggerViewUpdate('home');
        }
        break;

      case 'DYNAMIC_PRODUCTS_UPDATED':
        if (payload && Array.isArray(payload)) {
          authService.applyDynamicProducts(payload);
          this.triggerViewUpdate('home');
        }
        break;

      case 'SHOP_PRODUCTS_UPDATED':
        if (payload && Array.isArray(payload)) {
          authService.applyHomeShopProducts(payload);
          this.triggerViewUpdate('home');
        }
        break;

      case 'APP_UPDATE_CONFIG_UPDATED':
        if (payload) {
          authService.applyAppUpdateConfig(payload);
          this.triggerViewUpdate('home');
        }
        break;

      case 'HOME_POPUP_UPDATED':
        if (payload) {
          authService.applyHomeNoticePopup(payload);
          this.triggerViewUpdate('home');
        }
        break;

      case 'TOURNAMENTS_UPDATED':
        if (payload && payload.deletedId) {
          tournamentService.deleteTournament(payload.deletedId);
        } else {
          tournamentService.reloadFromStorage();
        }
        this.triggerViewUpdate('tournaments');
        this.triggerViewUpdate('home');
        break;

      case 'ROOM_RELEASED':
        tournamentService.reloadFromStorage();
        if (showNotice && type === 'ROOM_RELEASED') {
          Toast.show(`🔥 Room ID & Password released for: ${payload?.title || 'Tournament'}!`, 'success');
        }
        this.triggerViewUpdate('tournaments');
        this.triggerViewUpdate('home');
        break;

      case 'DOWNLOADS_UPDATED':
        downloadService.reloadFromStorage();
        this.triggerViewUpdate('downloads');
        break;

      case 'BANNERS_UPDATED':
      case 'FLASH_DEALS_UPDATED':
      case 'SERVICES_UPDATED':
        this.triggerViewUpdate('home');
        break;

      case 'PUSH_NOTIFICATION_SENT':
        if (payload) {
          const notifTitle = payload.title || 'MOBIN X GAMING';
          const notifMsg = payload.message || payload.desc || '';
          Toast.show(`📢 ${notifMsg}`, 'info');
          try {
            if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.showNativeNotification === 'function') {
              window.AndroidBridge.showNativeNotification(notifTitle, notifMsg);
            }
          } catch(e) {}
        }
        break;

      case 'URLS_UPDATED':
        if (payload) authService.updateUrls(payload);
        break;

      default:
        break;
    }
  }

  triggerViewUpdate(targetView) {
    const currentView = stateManager.getState().currentView;
    if (currentView === targetView || (targetView === 'home' && currentView === 'home')) {
      // Debounce the re-render by 120ms to prevent screen flicker and micro-jumps
      if (this.debounceTimers[targetView]) {
        clearTimeout(this.debounceTimers[targetView]);
      }
      this.debounceTimers[targetView] = setTimeout(() => {
        const activeState = stateManager.getState();
        if (activeState.currentView === currentView) {
          stateManager.setState({ currentView });
        }
      }, 120);
    }
  }
}

export const realtimeSyncManager = new RealtimeSyncManager();

