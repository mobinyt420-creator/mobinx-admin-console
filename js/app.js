import { stateManager } from './services/stateManager.js';
import { authService } from './services/authService.js';
import { renderHeader, bindHeaderEvents } from './components/Header.js';
import { renderBottomNav, bindBottomNavEvents } from './components/BottomNav.js';
import { renderDrawerMenu, bindDrawerEvents } from './components/DrawerMenu.js';
import { renderModal, bindModalEvents } from './components/ModalManager.js';

// Views
import { renderOnboardingView, bindOnboardingEvents } from './views/OnboardingView.js';
import { renderHomeView, bindHomeEvents } from './views/HomeView.js';
import { renderTopUpView, bindTopUpEvents } from './views/TopUpView.js';
import { renderShopView, bindShopEvents } from './views/ShopView.js';
import { renderDownloadsView, bindDownloadsEvents } from './views/DownloadsView.js';
import { renderTournamentsView, bindTournamentsEvents } from './views/TournamentsView.js';
import { renderSensitivityView, bindSensitivityEvents } from './views/SensitivityView.js';
import { renderProfileView, bindProfileEvents } from './views/ProfileView.js';
import { renderNotificationsView, bindNotificationsEvents } from './views/NotificationsView.js';
import { renderSearchView, bindSearchEvents } from './views/SearchView.js';
import { renderReferralView, bindReferralEvents } from './views/ReferralView.js';
import { renderSettingsView, bindSettingsEvents } from './views/SettingsView.js';
import { renderHelpView, bindHelpEvents } from './views/HelpView.js';
import { renderAboutView, bindAboutEvents } from './views/AboutView.js';
import { realtimeSyncManager } from './services/realtimeSyncManager.js';
import { openExternalStore } from './services/browserService.js';

class App {
  constructor() {
    this.init();
  }

  init() {
    // Check if user has completed first-time onboarding
    if (!authService.hasCompletedOnboarding()) {
      stateManager.setState({ currentView: 'onboarding', activeModal: null });
    }

    // Initialize real-time synchronization with Admin Panel & Firebase
    realtimeSyncManager.init();

    // Start live clock for status bar
    this.startLiveClock();

    // Subscribe to state changes
    stateManager.subscribe((state) => {
      this.render(state);
    });

    // Native Android hardware Back button handler
    window.handleNativeBackPressed = () => {
      const state = stateManager.getState();
      if (state.activeModal) {
        stateManager.closeModal();
        return;
      }
      if (state.drawerOpen) {
        stateManager.toggleDrawer(false);
        return;
      }
      if (state.currentView !== 'home' && state.currentView !== 'onboarding') {
        stateManager.navigate('home');
        return;
      }
      if (typeof window !== 'undefined' && window.AndroidBridge && typeof window.AndroidBridge.exitApp === 'function') {
        window.AndroidBridge.exitApp();
      } else if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.exitApp();
      }
    };

    // Initial render
    this.render(stateManager.getState());

    // Bind desktop frame toggles
    this.bindDesktopControls();
  }

  startLiveClock() {
    const updateTime = () => {
      const el = document.getElementById('status-bar-time');
      if (el) {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        el.textContent = `${hrs}:${mins}`;
      }
    };
    updateTime();
    setInterval(updateTime, 10000);
  }

  bindDesktopControls() {
    const btnFrame = document.getElementById('btn-toggle-frame');
    const btnFull = document.getElementById('btn-toggle-full');
    const container = document.getElementById('app-shell-container');

    btnFrame?.addEventListener('click', () => {
      container?.classList.remove('full-width-mode');
      btnFrame.classList.add('active');
      btnFull?.classList.remove('active');
    });

    btnFull?.addEventListener('click', () => {
      container?.classList.add('full-width-mode');
      btnFull.classList.add('active');
      btnFrame?.classList.remove('active');
    });
  }

  render(state) {
    const { currentView, drawerOpen, activeModal } = state;
    const isOnboarding = (currentView === 'onboarding');

    // 0. Status Bar Theme (keep standard clean look, only custom if needed)
    const statusBar = document.querySelector('.status-bar');
    if (statusBar) {
      statusBar.classList.remove('status-bar-cct-mode');
    }

    // 1. Render Main App Header (Hidden on Onboarding, TopUp, and Shop which have integrated in-app browser bars)
    const headerRoot = document.getElementById('header-root');
    const hideHeader = isOnboarding || currentView === 'topup' || currentView === 'shop';
    if (headerRoot) {
      if (hideHeader) {
        headerRoot.innerHTML = '';
        headerRoot.style.display = 'none';
      } else {
        headerRoot.style.display = 'block';
        headerRoot.innerHTML = renderHeader();
        bindHeaderEvents();
      }
    }

    // 2. Render Main View
    const mainContent = document.getElementById('app-main-content');
    const appContainer = document.getElementById('app-shell-container');
    const deviceViewport = document.querySelector('.device-viewport');
    if (mainContent) {
      if (isOnboarding) {
        mainContent.classList.add('onboarding-mode');
        appContainer?.classList.add('onboarding-active');
        deviceViewport?.classList.add('onboarding-active');
      } else {
        mainContent.classList.remove('onboarding-mode');
        appContainer?.classList.remove('onboarding-active');
        deviceViewport?.classList.remove('onboarding-active');
      }

      // In webviews, prevent outer container double-scroll
      if (currentView === 'topup' || currentView === 'shop') {
        mainContent.classList.add('fullscreen-webview-mode');
      } else {
        mainContent.classList.remove('fullscreen-webview-mode');
      }

      switch (currentView) {
        case 'onboarding':
          mainContent.innerHTML = renderOnboardingView();
          bindOnboardingEvents();
          break;
        case 'home':
          mainContent.innerHTML = renderHomeView();
          bindHomeEvents();
          break;
        case 'topup': {
          const urls = authService.getUrls();
          openExternalStore(urls.topup || 'https://noobtopup.com/', '#0284c7');
          stateManager.setState({ currentView: 'home' });
          break;
        }
        case 'shop': {
          const urls = authService.getUrls();
          openExternalStore(urls.shop || 'https://www.obinshop.com/', '#7c3aed');
          stateManager.setState({ currentView: 'home' });
          break;
        }
        case 'downloads':
          mainContent.innerHTML = renderDownloadsView();
          bindDownloadsEvents();
          break;
        case 'tournaments':
          mainContent.innerHTML = renderTournamentsView();
          bindTournamentsEvents();
          break;
        case 'sensitivity':
          mainContent.innerHTML = renderSensitivityView();
          bindSensitivityEvents();
          break;
        case 'profile':
          mainContent.innerHTML = renderProfileView();
          bindProfileEvents();
          break;
        case 'notifications':
          mainContent.innerHTML = renderNotificationsView();
          bindNotificationsEvents();
          break;
        case 'search':
          mainContent.innerHTML = renderSearchView();
          bindSearchEvents();
          break;
        case 'referral':
          mainContent.innerHTML = renderReferralView();
          bindReferralEvents();
          break;
        case 'settings':
          mainContent.innerHTML = renderSettingsView();
          bindSettingsEvents();
          break;
        case 'help':
          mainContent.innerHTML = renderHelpView();
          bindHelpEvents();
          break;
        case 'about':
          mainContent.innerHTML = renderAboutView();
          bindAboutEvents();
          break;
        default:
          mainContent.innerHTML = renderHomeView();
          bindHomeEvents();
      }
    }

    // 3. Render Bottom Navigation (Hidden on Onboarding, TopUp, and Shop for seamless in-app webview)
    const navRoot = document.getElementById('bottom-nav-root');
    if (navRoot) {
      if (isOnboarding || currentView === 'topup' || currentView === 'shop') {
        navRoot.innerHTML = '';
        navRoot.style.display = 'none';
      } else {
        navRoot.style.display = 'flex';
        navRoot.innerHTML = renderBottomNav(currentView);
        bindBottomNavEvents();
      }
    }

    // 4. Render Drawer Menu
    const drawerRoot = document.getElementById('drawer-root');
    if (drawerRoot) {
      drawerRoot.innerHTML = renderDrawerMenu(drawerOpen, currentView);
      bindDrawerEvents();
    }

    // 5. Render Modal
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot) {
      modalRoot.innerHTML = renderModal(activeModal);
      bindModalEvents(activeModal);
    }
  }
}

// Robust bootstrap check (DOM ready or immediately if already loaded)
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new App();
    });
  } else {
    new App();
  }
}

