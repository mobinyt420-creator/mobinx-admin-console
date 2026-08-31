/**
 * Global State Manager & Event Bus (Observer Pattern)
 */

class StateManager {
  constructor() {
    const isOnboarded = typeof localStorage !== 'undefined' && !!localStorage.getItem('mobinx_onboarded');
    this.state = {
      currentView: isOnboarded ? 'home' : 'onboarding',
      viewParams: {},
      drawerOpen: false,
      activeModal: null,
      unreadNotifCount: 3,
      deviceFrameMode: true // Phone Bezel Preview
    };
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  setState(partialState) {
    this.state = { ...this.state, ...partialState };
    this.notify();
  }

  navigate(viewName, params = {}) {
    this.setState({
      currentView: viewName,
      viewParams: params,
      drawerOpen: false,
      activeModal: null
    });
    // Scroll content container to top
    if (typeof document !== 'undefined') {
      const mainContent = document.getElementById('app-main-content');
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
    }
  }

  toggleDrawer(forceState) {
    const newState = typeof forceState === 'boolean' ? forceState : !this.state.drawerOpen;
    this.setState({ drawerOpen: newState });
  }

  openModal(modalType, data = {}) {
    const isOnboarded = typeof localStorage !== 'undefined' && !!localStorage.getItem('mobinx_onboarded');
    // Suppress welcome and notice popups during onboarding/welcome view
    if ((this.state.currentView === 'onboarding' || !isOnboarded) && (modalType === 'welcomeAnnouncement' || modalType === 'notice')) {
      return;
    }
    this.setState({
      activeModal: { type: modalType, data }
    });
  }

  closeModal() {
    this.setState({ activeModal: null });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export const stateManager = new StateManager();
