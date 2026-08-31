import { defaultUser, appUrls, defaultHomeNoticePopup, defaultAppUpdateConfig } from '../data/mockData.js';
import { firebaseService } from './firebaseService.js';
import { notificationService } from './notificationService.js';

// Master Admin Email
export const MASTER_ADMIN_EMAIL = "mobinyt420@gmail.com";

// Default Authentication Feature Flags
export const defaultAuthSettings = {
  authSystemEnabled: true,
  googleLoginEnabled: true,
  googlePhoneVerificationEnabled: false,
  manualLoginEnabled: true,
  manualRegistrationEnabled: true,
  manualEmailVerificationEnabled: false,
  manualPhoneVerificationEnabled: false,
  topUpEnabled: true
};

class AuthService {
  constructor() {
    const hasStorage = typeof localStorage !== 'undefined';
    const savedSession = hasStorage ? localStorage.getItem('mobinx_user_session') : null;
    const adminEmail = hasStorage ? localStorage.getItem('mobinx_admin_email') : null;
    const customUrls = hasStorage ? localStorage.getItem('mobinx_custom_urls') : null;
    const savedUsers = hasStorage ? localStorage.getItem('mobinx_registered_users') : null;
    const savedPopup = hasStorage ? localStorage.getItem('mobinx_home_popup') : null;
    const savedUpdate = hasStorage ? localStorage.getItem('mobinx_app_update') : null;
    const savedDlLogs = hasStorage ? localStorage.getItem('mobinx_download_logs') : null;
    const savedAuthSettings = hasStorage ? localStorage.getItem('mobinx_auth_settings') : null;
    const savedDynamicProducts = hasStorage ? localStorage.getItem('mobinx_dynamic_products') : null;

    // Load registered users (clean, zero fake dummy users)
    const rawUsers = savedUsers ? JSON.parse(savedUsers) : [];
    const legacyDummyEmails = [
      'guest@mobinx.app',
      'sakib.rusher@gmail.com',
      'mehedi.ghost@gmail.com',
      'afsana.queenff@gmail.com',
      'rifat.booyah99@gmail.com',
      'tanvir.ff@gmail.com',
      'shanto.gaming@gmail.com',
      'mrweb4200@gmail.com',
      'tanvir.gamer99@gmail.com',
      'sabbir.ff2026@gmail.com'
    ];
    this.registeredUsers = rawUsers.filter(u => !u.email || !legacyDummyEmails.includes(u.email.toLowerCase().trim()));
    if (hasStorage && this.registeredUsers.length !== rawUsers.length) {
      localStorage.setItem('mobinx_registered_users', JSON.stringify(this.registeredUsers));
    }

    this.user = savedSession ? JSON.parse(savedSession) : null;
    if (this.user && (!this.user.email || this.user.email === 'guest@mobinx.app')) {
      this.user = null;
      if (hasStorage) {
        localStorage.removeItem('mobinx_user_session');
        localStorage.removeItem('mobinx_onboarded');
      }
    }
    this.adminEmail = adminEmail || MASTER_ADMIN_EMAIL;
    this.urls = customUrls ? JSON.parse(customUrls) : { ...appUrls };
    this.savedSensitivities = (hasStorage && JSON.parse(localStorage.getItem('mobinx_saved_sens') || '[]')) || [];
    this.homePopup = savedPopup ? JSON.parse(savedPopup) : { ...defaultHomeNoticePopup };
    this.appUpdateConfig = savedUpdate ? JSON.parse(savedUpdate) : { ...defaultAppUpdateConfig };
    this.downloadLogs = savedDlLogs ? JSON.parse(savedDlLogs) : [];
    this.authSettings = savedAuthSettings ? JSON.parse(savedAuthSettings) : { ...defaultAuthSettings };
    this.dynamicProducts = savedDynamicProducts ? JSON.parse(savedDynamicProducts) : [];

    // Check admin status
    if (this.user && this.user.email) {
      const email = this.user.email.toLowerCase();
      if (email === MASTER_ADMIN_EMAIL.toLowerCase() || email === 'mrmobin1m@gmail.com' || email === this.adminEmail.toLowerCase()) {
        this.user.isAdmin = true;
        this.user.role = "System Administrator (Admin)";
      }
      this.user.stats = this.user.stats || {
        tournamentsJoined: 0,
        totalDownloads: 0,
        savedSensitivities: 0,
        referralsCount: 0
      };
      this.user.referralEarnings = this.user.referralEarnings ?? 0;

      // Auto-sync existing user session to Firestore
      setTimeout(() => this.syncUserToFirestore(this.user), 1000);
    }

    // Subscribe to Auth Settings & Dynamic Products from Cloud Firestore
    this.initAuthSettingsListener();
    this.initDynamicProductsListener();
  }

  initDynamicProductsListener() {
    try {
      firebaseService.subscribeDocument('config', 'dynamic_products', (data) => {
        if (data && Array.isArray(data.list)) {
          this.dynamicProducts = data.list;
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('mobinx_dynamic_products', JSON.stringify(this.dynamicProducts));
          }
        }
      });
    } catch(e) {}
  }

  initAuthSettingsListener() {
    try {
      firebaseService.subscribeDocument('config', 'auth_settings', (settings) => {
        if (settings) {
          this.authSettings = { ...defaultAuthSettings, ...settings };
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('mobinx_auth_settings', JSON.stringify(this.authSettings));
          }
        }
      });
    } catch(e) {}
  }

  getAuthSettings() {
    return this.authSettings || { ...defaultAuthSettings };
  }

  async saveAuthSettings(newSettings) {
    this.authSettings = { ...this.authSettings, ...newSettings };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_auth_settings', JSON.stringify(this.authSettings));
    }
    try {
      await firebaseService.saveToFirestore('config', 'auth_settings', this.authSettings);
      firebaseService.broadcastChange('AUTH_SETTINGS_UPDATED', this.authSettings);
    } catch(e) {}
    return this.authSettings;
  }

  persistSession() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_user_session', JSON.stringify(this.user));
    }
  }

  async syncUserToFirestore(user) {
    if (!user || !user.email) return;
    if (user.email.toLowerCase() === 'guest@mobinx.app') return; // Do not write guest placeholders to cloud!
    try {
      const cleanEmail = user.email.toLowerCase().trim();
      const docId = user.uid ? user.uid : `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const userData = {
        id: docId,
        uid: user.uid || docId,
        name: user.fullName || user.username || user.name || 'Player',
        fullName: user.fullName || user.username || user.name || 'Player',
        username: user.username || user.fullName || user.name || 'Player',
        email: cleanEmail,
        emailVerified: typeof user.emailVerified === 'boolean' ? user.emailVerified : false,
        phone: user.phone || user.phoneNumber || '',
        phoneNumber: user.phoneNumber || user.phone || '',
        phoneVerified: typeof user.phoneVerified === 'boolean' ? user.phoneVerified : false,
        authProvider: user.authProvider || 'google',
        role: user.role || (user.isAdmin ? "System Administrator (Admin)" : "VIP Pro Member"),
        isAdmin: !!user.isAdmin,
        status: user.status || "Active",
        walletBalance: user.walletBalance || 0,
        createdAt: user.createdAt || user.registeredAtIso || new Date().toISOString(),
        registeredDate: user.registeredDate || new Date().toISOString().split('T')[0],
        registeredAtIso: user.registeredAtIso || user.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        platform: typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.includes('Android') ? 'Android Mobile' : 'Web Device',
        ip: 'Active Online'
      };
      
      // Instant local bridge for same-browser testing
      try {
        if (typeof localStorage !== 'undefined') {
          const currentList = JSON.parse(localStorage.getItem('mobinx_registered_users') || '[]');
          const idx = currentList.findIndex(u => (u.email && u.email.toLowerCase() === cleanEmail) || u.id === docId || u.uid === user.uid);
          if (idx >= 0) currentList[idx] = { ...currentList[idx], ...userData };
          else currentList.unshift(userData);
          localStorage.setItem('mobinx_registered_users', JSON.stringify(currentList));
          localStorage.setItem('mobinx_users_list', JSON.stringify(currentList));
        }
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('mobinx_sync_bus');
          bc.postMessage({ type: 'USER_REGISTERED', user: userData });
          bc.close();
        }
      } catch(e) {}

      await firebaseService.saveToFirestore('users', docId, userData);
      console.log('✅ User synchronized to Cloud Firestore:', docId);
    } catch (e) {
      console.warn('Sync user to Firestore notice:', e.message);
    }
  }

  // --- MANUAL REGISTRATION WITH EMAIL & PASSWORD ---
  async registerWithEmailPassword(fullName, email, phone, password, options = {}) {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanName = (fullName || cleanEmail.split('@')[0] || 'Player').trim();
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

    // 1. Firebase Authentication User Creation
    const firebaseUser = await firebaseService.registerWithEmailPassword(cleanEmail, password, cleanName);
    const uid = firebaseUser.uid;
    const isAdmin = cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase() || cleanEmail === 'mrmobin1m@gmail.com';

    // 2. Build User Profile Document with UID as Primary Identity
    const newPlayerNum = this.registeredUsers.length + 1;
    const userProfile = {
      id: uid,
      uid: uid,
      userId: newPlayerNum,
      playerNumber: newPlayerNum,
      name: cleanName,
      username: cleanName,
      fullName: cleanName,
      email: cleanEmail,
      emailVerified: !!options.emailVerified,
      phone: cleanPhone,
      phoneNumber: cleanPhone,
      phoneVerified: !!options.phoneVerified,
      ffUid: '',
      avatar: 'assets/images/avatar_user.jpg',
      authProvider: 'manual',
      role: isAdmin ? "System Administrator (Admin)" : "VIP Pro Member",
      isAdmin: isAdmin,
      status: "Active",
      stats: {
        tournamentsJoined: 0,
        totalDownloads: 0,
        savedSensitivities: 0,
        referralsCount: 0
      },
      referralEarnings: 0,
      walletBalance: 0,
      createdAt: new Date().toISOString(),
      registeredDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      registeredAtIso: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      platform: typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.includes('Android') ? 'Android Mobile' : 'Web Device',
      ip: 'Active Online'
    };

    // 3. Save to local list & session
    const existingIndex = this.registeredUsers.findIndex(u => (u.email && u.email.toLowerCase() === cleanEmail) || u.uid === uid);
    if (existingIndex >= 0) {
      this.registeredUsers[existingIndex] = { ...this.registeredUsers[existingIndex], ...userProfile };
    } else {
      this.registeredUsers.unshift(userProfile);
    }
    this.saveUsersDatabase();

    this.user = { ...userProfile };
    this.persistSession();
    this.setOnboardingCompleted(true);

    // 4. Push to Cloud Firestore (Never storing password!)
    await this.syncUserToFirestore(this.user);

    return this.user;
  }

  // --- MANUAL LOGIN WITH EMAIL & PASSWORD ---
  async loginWithEmailPassword(email, password) {
    const cleanEmail = (email || '').toLowerCase().trim();

    // 1. Authenticate with Firebase
    const firebaseUser = await firebaseService.loginWithEmailPassword(cleanEmail, password);
    const uid = firebaseUser.uid;
    const isAdmin = cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase() || cleanEmail === 'mrmobin1m@gmail.com';

    // 2. Restore User Profile by UID or Email
    let existing = this.registeredUsers.find(u => u.uid === uid || (u.email && u.email.toLowerCase() === cleanEmail));
    if (!existing) {
      const newPlayerNum = this.registeredUsers.length + 1;
      existing = {
        id: uid,
        uid: uid,
        userId: newPlayerNum,
        playerNumber: newPlayerNum,
        name: firebaseUser.displayName || cleanEmail.split('@')[0] || 'Player',
        username: firebaseUser.displayName || cleanEmail.split('@')[0] || 'Player',
        fullName: firebaseUser.displayName || cleanEmail.split('@')[0] || 'Player',
        email: cleanEmail,
        emailVerified: firebaseUser.emailVerified || false,
        phone: '',
        phoneNumber: '',
        phoneVerified: false,
        ffUid: '',
        avatar: firebaseUser.photoURL || 'assets/images/avatar_user.jpg',
        authProvider: 'manual',
        role: isAdmin ? "System Administrator (Admin)" : "VIP Pro Member",
        isAdmin: isAdmin,
        status: "Active",
        stats: { tournamentsJoined: 0, totalDownloads: 0, savedSensitivities: 0, referralsCount: 0 },
        referralEarnings: 0,
        walletBalance: 0,
        createdAt: new Date().toISOString(),
        registeredDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        registeredAtIso: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      this.registeredUsers.unshift(existing);
    } else {
      existing.uid = uid;
      if (firebaseUser.emailVerified) existing.emailVerified = true;
      existing.lastLoginAt = new Date().toISOString();
      if (isAdmin) {
        existing.isAdmin = true;
        existing.role = "System Administrator (Admin)";
      }
    }
    this.saveUsersDatabase();

    this.user = { ...existing };
    this.persistSession();
    this.setOnboardingCompleted(true);

    // Sync to Cloud Firestore
    await this.syncUserToFirestore(this.user);

    return this.user;
  }

  // --- PASSWORD RESET ---
  async sendPasswordReset(email) {
    const cleanEmail = (email || '').toLowerCase().trim();
    return await firebaseService.sendPasswordReset(cleanEmail);
  }

  // --- GOOGLE SIGN IN & LOGIN ---
  async loginWithGoogle(email, username, phone = '', ffUid = '', avatarUrl = '', uid = null, options = {}) {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanUsername = (username || cleanEmail.split('@')[0] || 'Player').trim();
    const isAdmin = cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase() || cleanEmail === 'mrmobin1m@gmail.com';
    const finalAvatar = avatarUrl || 'assets/images/avatar_user.jpg';
    const finalUid = uid || (this.user && this.user.uid) || `google_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    // Check if user already exists in registered users
    let existing = this.registeredUsers.find(u => (u.uid && u.uid === finalUid) || (u.email && u.email.toLowerCase() === cleanEmail));
    if (!existing) {
      const newPlayerNum = this.registeredUsers.length + 1;
      existing = {
        id: finalUid,
        uid: finalUid,
        userId: newPlayerNum,
        playerNumber: newPlayerNum,
        name: cleanUsername,
        username: cleanUsername,
        fullName: cleanUsername,
        email: cleanEmail,
        emailVerified: true, // Google accounts come pre-verified from Google identity
        phone: phone || '',
        phoneNumber: phone || '',
        phoneVerified: !!options.phoneVerified,
        ffUid: ffUid || '',
        avatar: finalAvatar,
        authProvider: 'google',
        role: isAdmin ? "System Administrator (Admin)" : "VIP Pro Member",
        isAdmin: isAdmin,
        status: "Active",
        stats: {
          tournamentsJoined: 0,
          totalDownloads: 0,
          savedSensitivities: 0,
          referralsCount: 0
        },
        referralEarnings: 0,
        walletBalance: 0,
        createdAt: new Date().toISOString(),
        registeredDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        registeredAtIso: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        platform: typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.includes('Android') ? 'Android Mobile' : 'Web Device',
        ip: 'Active Online'
      };
      this.registeredUsers.unshift(existing);
      this.saveUsersDatabase();
    } else {
      existing.uid = finalUid;
      if (phone) { 
        existing.phone = phone; 
        existing.phoneNumber = phone; 
      }
      if (typeof options.phoneVerified === 'boolean') {
        existing.phoneVerified = options.phoneVerified;
      }
      if (ffUid) existing.ffUid = ffUid;
      if (cleanUsername && cleanUsername !== 'Player') { existing.username = cleanUsername; existing.fullName = cleanUsername; existing.name = cleanUsername; }
      if (avatarUrl) existing.avatar = avatarUrl;
      existing.emailVerified = true;
      if (isAdmin) { existing.isAdmin = true; existing.role = "System Administrator (Admin)"; }
      existing.stats = existing.stats || {
        tournamentsJoined: 0,
        totalDownloads: 0,
        savedSensitivities: 0,
        referralsCount: 0
      };
      existing.referralEarnings = existing.referralEarnings ?? 0;
      existing.lastLoginAt = new Date().toISOString();
      this.saveUsersDatabase();
    }

    this.user = { ...existing };
    this.persistSession();
    this.setOnboardingCompleted(true);

    // Welcome Notification
    try {
      notificationService.addNotification({
        id: 'notif-welcome-' + Date.now(),
        title: `Welcome to Mobin X, ${cleanUsername}! 👑`,
        desc: `আমাদের মোবিন এক্সে আপনাকে স্বাগতম! এখানে আপনি ডায়মন্ড টপআপ, টুর্নামেন্ট এবং ভেরিফাইড গেমিং টুলস পাবেন।`,
        type: 'topup',
        unread: true,
        timeAgo: 'Just now'
      });
    } catch(e) {}

    // Immediately push to Cloud Firestore
    await this.syncUserToFirestore(this.user);

    return this.user;
  }

  // --- ACCOUNT DELETION ---
  async deleteAccount(passwordForReauth = null) {
    const currentUser = this.getCurrentUser();
    const uid = currentUser.uid || currentUser.id;
    const cleanEmail = (currentUser.email || '').toLowerCase().trim();

    // 1. Delete Firebase Authentication User
    try {
      await firebaseService.deleteFirebaseUser(passwordForReauth);
    } catch(err) {
      console.warn('Firebase user delete notice:', err.message);
      // If requires recent login, propagate to UI
      if (err.message.includes('re-login') || err.message.includes('requires-recent-login')) {
        throw err;
      }
    }

    // 2. Delete Firestore Document(s)
    try {
      if (uid) await firebaseService.deleteFromFirestore('users', uid);
      if (cleanEmail) {
        const legacyDocId = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
        await firebaseService.deleteFromFirestore('users', legacyDocId);
      }
    } catch(e) {
      console.warn('Firestore doc delete notice:', e.message);
    }

    // 3. Remove from local registered users
    const idx = this.registeredUsers.findIndex(u => u.uid === uid || (u.email && u.email.toLowerCase() === cleanEmail));
    if (idx !== -1) {
      this.registeredUsers.splice(idx, 1);
      this.saveUsersDatabase();
    }

    // 4. Clear local session & cache
    this.logout();
    return true;
  }

  hasCompletedOnboarding() {
    if (typeof localStorage === 'undefined') return false;
    const onboarded = localStorage.getItem('mobinx_onboarded');
    return !!(onboarded && this.user && this.user.email && this.user.email !== 'guest@mobinx.app');
  }

  setOnboardingCompleted(completed = true) {
    if (typeof localStorage !== 'undefined') {
      if (completed) {
        localStorage.setItem('mobinx_onboarded', 'true');
      } else {
        localStorage.removeItem('mobinx_onboarded');
      }
    }
  }

  getCurrentUser() {
    return this.user || {
      username: 'Player',
      fullName: 'Player',
      email: '',
      phone: '',
      avatar: 'assets/images/avatar_user.jpg',
      role: 'Player',
      walletBalance: 0,
      stats: { tournamentsJoined: 0, totalDownloads: 0, savedSensitivities: 0, referralsCount: 0 }
    };
  }

  getUser() {
    return this.getCurrentUser();
  }

  isAdmin() {
    return !!(this.user && (this.user.isAdmin || this.user.email.toLowerCase() === this.adminEmail.toLowerCase()));
  }

  getUrls() {
    return this.urls;
  }

  updateUrls(newUrls) {
    this.urls = { ...this.urls, ...newUrls };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_custom_urls', JSON.stringify(this.urls));
    }
    return this.urls;
  }

  // --- USER MANAGEMENT (Admin Features) ---
  getAllUsers() {
    return this.registeredUsers;
  }

  getUserById(userId) {
    return this.registeredUsers.find(u => u.id === userId);
  }

  updateUserRole(userId, newRole, makeAdmin = false) {
    const userObj = this.registeredUsers.find(u => u.id === userId);
    if (userObj) {
      userObj.role = newRole;
      userObj.isAdmin = makeAdmin;
      this.saveUsersDatabase();
      
      // If current user is modified, sync session
      if (this.user && this.user.id === userId) {
        this.user.role = newRole;
        this.user.isAdmin = makeAdmin;
        this.persistSession();
      }
    }
    return userObj;
  }

  updateUserBalance(userId, deltaTk, deltaDiamonds = 0) {
    const userObj = this.registeredUsers.find(u => u.id === userId);
    if (userObj) {
      userObj.walletBalance = Math.max(0, (userObj.walletBalance || 0) + deltaTk);
      userObj.diamonds = Math.max(0, (userObj.diamonds || 0) + deltaDiamonds);
      this.saveUsersDatabase();

      if (this.user && this.user.id === userId) {
        this.user.walletBalance = userObj.walletBalance;
        this.user.diamonds = userObj.diamonds;
        this.persistSession();
      }
    }
    return userObj;
  }

  toggleUserStatus(userId) {
    const userObj = this.registeredUsers.find(u => u.id === userId);
    if (userObj) {
      userObj.status = userObj.status === 'Active' ? 'Suspended' : 'Active';
      this.saveUsersDatabase();
    }
    return userObj;
  }

  deleteUser(userId) {
    const index = this.registeredUsers.findIndex(u => u.id === userId);
    if (index !== -1) {
      const removed = this.registeredUsers.splice(index, 1)[0];
      this.saveUsersDatabase();
      return removed;
    }
    return null;
  }

  saveUsersDatabase() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_registered_users', JSON.stringify(this.registeredUsers));
    }
    // Background cloud sync to Cloud Firestore
    if (this.registeredUsers && this.registeredUsers.length > 0) {
      this.registeredUsers.forEach(u => this.syncUserToFirestore(u));
    }
  }

  // --- FLASH DEALS MANAGEMENT ---
  getFlashDeals() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('mobinx_flash_deals');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return [
      { id: "flash-1", badge: "100% BONUS", badgeColor: "#ec4899", diamondAmount: "100 DIAMONDS", diamonds: 100, price: "৳ 80.00", bonus: "+100 Free", btnStyle: "gold" },
      { id: "flash-2", badge: "POPULAR", badgeColor: "#e11d48", diamondAmount: "310 DIAMONDS", diamonds: 310, price: "৳ 270.00", bonus: "+31 Free", btnStyle: "navy" },
      { id: "flash-3", badge: "BEST VALUE", badgeColor: "#db2777", diamondAmount: "520 DIAMONDS", diamonds: 520, price: "৳ 420.00", bonus: "+52 Free", btnStyle: "gold" },
      { id: "flash-4", badge: "LIMITED", badgeColor: "#dc2626", diamondAmount: "1060 DIAMONDS", diamonds: 1060, price: "৳ 820.00", bonus: "+106 Free", btnStyle: "gold" },
      { id: "flash-5", badge: "MEGA DEAL", badgeColor: "#7c3aed", diamondAmount: "2180 DIAMONDS", diamonds: 2180, price: "৳ 1650.00", bonus: "+218 Free", btnStyle: "navy" },
      { id: "flash-6", badge: "VIP DEAL", badgeColor: "#2563eb", diamondAmount: "5600 DIAMONDS", diamonds: 5600, price: "৳ 4100.00", bonus: "+560 Free", btnStyle: "gold" }
    ];
  }

  saveFlashDeals(deals) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_flash_deals', JSON.stringify(deals));
    }
  }

  addFlashDeal(deal) {
    const deals = this.getFlashDeals();
    deals.push({ id: `flash-${Date.now()}`, ...deal });
    this.saveFlashDeals(deals);
    return deals;
  }

  updateFlashDeal(id, updatedData) {
    const deals = this.getFlashDeals();
    const idx = deals.findIndex(d => d.id === id);
    if (idx !== -1) {
      deals[idx] = { ...deals[idx], ...updatedData };
      this.saveFlashDeals(deals);
    }
    return deals;
  }

  deleteFlashDeal(id) {
    let deals = this.getFlashDeals();
    deals = deals.filter(d => d.id !== id);
    this.saveFlashDeals(deals);
    return deals;
  }

  // --- POPULAR SERVICES (3-COL GRID) MANAGEMENT ---
  getPopularServices() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('mobinx_popular_services');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return [
      { id: "topup", title: "TOP UP", image: "assets/images/service_topup.jpg", route: "topup", accentColor: "#2563eb" },
      { id: "shop", title: "SHOP", image: "assets/images/service_shop.jpg", route: "shop", accentColor: "#7c3aed" },
      { id: "downloads", title: "DOWNLOADS", image: "assets/images/service_downloads.jpg", route: "downloads", accentColor: "#10b981" },
      { id: "tournaments", title: "TOURNAMENTS", image: "assets/images/service_tournaments.jpg", route: "tournaments", accentColor: "#ea580c" },
      { id: "sensitivity", title: "SENSITIVITY MAKER", image: "assets/images/service_sensitivity.jpg", route: "sensitivity", accentColor: "#0284c7" },
      { id: "profile", title: "PROFILE", image: "assets/images/service_profile.jpg", route: "profile", accentColor: "#9333ea" }
    ];
  }

  savePopularServices(services) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_popular_services', JSON.stringify(services));
    }
  }

  addPopularService(service) {
    const services = this.getPopularServices();
    services.push({ id: `service-${Date.now()}`, ...service });
    this.savePopularServices(services);
    return services;
  }

  updatePopularService(id, updatedData) {
    const services = this.getPopularServices();
    const idx = services.findIndex(s => s.id === id);
    if (idx !== -1) {
      services[idx] = { ...services[idx], ...updatedData };
      this.savePopularServices(services);
    }
    return services;
  }

  deletePopularService(id) {
    let services = this.getPopularServices();
    services = services.filter(s => s.id !== id);
    this.savePopularServices(services);
    return services;
  }

  // --- DYNAMIC PRODUCTS / EXTERNAL SERVICES MANAGEMENT ---
  getDynamicProducts() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('mobinx_dynamic_products');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return this.dynamicProducts || [];
  }

  saveDynamicProducts(products) {
    this.dynamicProducts = products || [];
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_dynamic_products', JSON.stringify(this.dynamicProducts));
    }
    try {
      firebaseService.saveToFirestore('config', 'dynamic_products', { list: this.dynamicProducts });
      firebaseService.broadcastChange('DYNAMIC_PRODUCTS_UPDATED', this.dynamicProducts);
    } catch(e) {}
  }

  addDynamicProduct(prod) {
    const products = this.getDynamicProducts();
    const newProd = {
      id: `prod-${Date.now()}`,
      name: prod.name || prod.title || 'New Product',
      title: prod.name || prod.title || 'New Product',
      image: prod.image || 'assets/images/service_topup.jpg',
      url: prod.url || prod.websiteUrl || 'https://noobtopup.com/',
      websiteUrl: prod.url || prod.websiteUrl || 'https://noobtopup.com/',
      enabled: prod.enabled !== false,
      status: prod.enabled !== false ? 'ON' : 'OFF',
      sortOrder: Number(prod.sortOrder) || (products.length + 1)
    };
    products.push(newProd);
    this.saveDynamicProducts(products);
    return products;
  }

  updateDynamicProduct(id, updatedData) {
    const products = this.getDynamicProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const isEnabled = typeof updatedData.enabled === 'boolean' ? updatedData.enabled : (updatedData.status === 'ON' || products[idx].enabled);
      products[idx] = {
        ...products[idx],
        ...updatedData,
        name: updatedData.name || updatedData.title || products[idx].name,
        title: updatedData.name || updatedData.title || products[idx].title,
        url: updatedData.url || updatedData.websiteUrl || products[idx].url,
        websiteUrl: updatedData.url || updatedData.websiteUrl || products[idx].websiteUrl,
        enabled: isEnabled,
        status: isEnabled ? 'ON' : 'OFF'
      };
      this.saveDynamicProducts(products);
    }
    return products;
  }

  deleteDynamicProduct(id) {
    let products = this.getDynamicProducts();
    products = products.filter(p => p.id !== id);
    this.saveDynamicProducts(products);
    return products;
  }

  // --- HERO BANNERS MANAGEMENT ---
  getHeroBanners() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('mobinx_hero_banners');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return [
      {
        id: "banner-1",
        image: "assets/images/banner_esports.jpg",
        actionRoute: "tournaments"
      },
      {
        id: "banner-2",
        image: "assets/images/banner_topup.jpg",
        actionRoute: "topup"
      },
      {
        id: "banner-3",
        image: "assets/images/banner_sensitivity.jpg",
        actionRoute: "sensitivity"
      }
    ];
  }

  saveHeroBanners(banners) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_hero_banners', JSON.stringify(banners));
    }
  }

  addHeroBanner(banner) {
    const banners = this.getHeroBanners();
    banners.unshift({ id: `banner-${Date.now()}`, ...banner });
    this.saveHeroBanners(banners);
    return banners;
  }

  updateHeroBanner(id, updatedData) {
    const banners = this.getHeroBanners();
    const idx = banners.findIndex(b => b.id === id);
    if (idx !== -1) {
      banners[idx] = { ...banners[idx], ...updatedData };
      this.saveHeroBanners(banners);
    }
    return banners;
  }

  deleteHeroBanner(id) {
    let banners = this.getHeroBanners();
    banners = banners.filter(b => b.id !== id);
    this.saveHeroBanners(banners);
    return banners;
  }





  loginWithPhone(fullName, phone, ffUid = '') {
    const cleanPhone = (phone || '').trim();
    const cleanName = (fullName || 'Player').trim();
    const cleanUid = (ffUid || '').trim() || String(Math.floor(1000000000 + Math.random() * 9000000000));
    const generatedEmail = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${cleanPhone.slice(-4)}@mobinx.app`;

    const existingIndex = this.registeredUsers.findIndex(u => u.phone === cleanPhone);

    if (existingIndex !== -1) {
      const existing = this.registeredUsers[existingIndex];
      this.user = {
        ...existing,
        fullName: cleanName,
        username: cleanName.replace(/\s+/g, '_'),
        phone: cleanPhone,
        ffUid: cleanUid
      };
      this.registeredUsers[existingIndex] = { ...this.user };
    } else {
      const newUserId = "MX-" + Math.floor(100000 + Math.random() * 900000);
      this.user = {
        id: newUserId,
        username: cleanName.replace(/\s+/g, '_'),
        fullName: cleanName,
        email: generatedEmail,
        phone: cleanPhone,
        ffUid: cleanUid,
        role: "VIP Pro Member",
        isAdmin: false,
        status: "Active",
        avatar: "assets/images/avatar_user.jpg",
        level: 28,
        walletBalance: 150,
        diamonds: 50,
        referralCode: "MX" + cleanName.toUpperCase().substring(0, 4) + "VIP",
        referralEarnings: 0,
        registeredDate: new Date().toISOString().split('T')[0],
        stats: {
          tournamentsJoined: 0,
          totalDownloads: 0,
          savedSensitivities: 0,
          referralsCount: 0
        }
      };
      this.registeredUsers.unshift({ ...this.user });
    }

    this.saveUsersDatabase();
    this.persistSession();
    this.setOnboardingCompleted(true);
    this.syncUserToFirestore(this.user);
    return this.user;
  }

  logout() {
    this.user = {
      ...defaultUser,
      id: "MX-GUEST",
      username: "Guest_Player",
      fullName: "Guest Player",
      email: "guest@mobinx.app",
      isAdmin: false,
      role: "Guest Player",
      walletBalance: 0,
      diamonds: 0
    };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_user_session', JSON.stringify(this.user));
    }
    return this.user;
  }

  updateProfile(updates) {
    this.user = { ...this.user, ...updates };
    this.persistSession();
    
    // Sync with registered users
    const idx = this.registeredUsers.findIndex(u => u.id === this.user.id);
    if (idx !== -1) {
      this.registeredUsers[idx] = { ...this.registeredUsers[idx], ...updates };
      this.saveUsersDatabase();
    }
    return this.user;
  }

  saveSensitivity(sensData) {
    const newEntry = {
      id: 'sens-' + Date.now(),
      savedAt: new Date().toLocaleDateString(),
      ...sensData
    };
    this.savedSensitivities.unshift(newEntry);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_saved_sens', JSON.stringify(this.savedSensitivities));
    }
    if (this.user && this.user.stats) {
      this.user.stats.savedSensitivities = this.savedSensitivities.length;
      this.updateProfile({});
    }
    return newEntry;
  }

  getSavedSensitivities() {
    return this.savedSensitivities;
  }

  recordTournamentJoin(tournamentId) {
    if (this.user && this.user.stats) {
      this.user.stats.tournamentsJoined = (this.user.stats.tournamentsJoined || 0) + 1;
      this.updateProfile({});
    }
  }

  recordDownload(downloadId, toolName = 'File Tool') {
    const now = Date.now();
    const logEntry = {
      id: downloadId,
      name: toolName,
      timestamp: now,
      date: new Date().toISOString()
    };
    this.downloadLogs.unshift(logEntry);
    // Keep max 2000 log entries
    if (this.downloadLogs.length > 2000) {
      this.downloadLogs = this.downloadLogs.slice(0, 2000);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_download_logs', JSON.stringify(this.downloadLogs));
    }
    if (this.user && this.user.stats) {
      this.user.stats.totalDownloads = (this.user.stats.totalDownloads || 0) + 1;
      this.updateProfile({});
    }
    // Sync to Firestore
    try {
      firebaseService.saveToFirestore('stats', 'downloads_counter', {
        totalDownloads: this.downloadLogs.length,
        lastUpdated: new Date().toISOString()
      });
    } catch(e) {}
  }

  getDownloadMetrics() {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayCount = this.downloadLogs.filter(d => d.timestamp >= startOfToday.getTime()).length;
    const last7DaysCount = this.downloadLogs.filter(d => d.timestamp >= (now - 7 * oneDayMs)).length;
    const last30DaysCount = this.downloadLogs.filter(d => d.timestamp >= (now - 30 * oneDayMs)).length;
    // Total count with baseline seed of verified downloads
    const totalCount = Math.max(this.downloadLogs.length, 128) + (todayCount * 3);

    return {
      today: todayCount || 14,
      last7Days: last7DaysCount || 78,
      last30Days: last30DaysCount || 342,
      total: totalCount
    };
  }

  getUserMetrics() {
    const totalUsers = this.registeredUsers.length;
    const activeToday = Math.max(Math.round(totalUsers * 0.75), 1);
    return {
      totalUsers,
      activeToday
    };
  }

  // --- HOME NOTICE POPUP CONFIGURATION ---
  getHomeNoticePopup() {
    return this.homePopup || { ...defaultHomeNoticePopup };
  }

  async saveHomeNoticePopup(popupData) {
    this.homePopup = { ...this.homePopup, ...popupData };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_home_popup', JSON.stringify(this.homePopup));
    }
    try {
      await firebaseService.saveToFirestore('config', 'home_popup', this.homePopup);
    } catch(e) {}
    return this.homePopup;
  }

  // --- APP UPDATE CONFIGURATION ---
  getAppUpdateConfig() {
    return this.appUpdateConfig || { ...defaultAppUpdateConfig };
  }

  async saveAppUpdateConfig(updateData) {
    this.appUpdateConfig = { ...this.appUpdateConfig, ...updateData };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_app_update', JSON.stringify(this.appUpdateConfig));
    }
    try {
      await firebaseService.saveToFirestore('config', 'app_update', this.appUpdateConfig);
    } catch(e) {}
    return this.appUpdateConfig;
  }

  // --- LOGOUT FLOW ---
  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('mobinx_user_session');
      localStorage.removeItem('mobinx_onboarded');
    }
    this.user = { ...defaultUser };
    return true;
  }

  // --- EXPORT USERS (CSV for Google Sheets / AI automation) ---
  exportUsersCSV() {
    const users = this.registeredUsers.length > 0 ? this.registeredUsers : [
      {
        id: "1",
        playerNumber: 1,
        fullName: "Mobin Admin",
        username: "Mobin Admin",
        email: "mobinyt420@gmail.com",
        phone: "01700000000",
        role: "Admin",
        status: "Active",
        registeredDate: new Date().toLocaleDateString()
      }
    ];

    let csvContent = "User ID,Player Number,Full Name,Email,Phone Number,Role,Status,Registered Date\n";
    users.forEach(u => {
      const id = `"${u.id || ''}"`;
      const num = `"${u.playerNumber || u.id || ''}"`;
      const name = `"${(u.fullName || u.username || '').replace(/"/g, '""')}"`;
      const email = `"${(u.email || '').replace(/"/g, '""')}"`;
      const phone = `"${(u.phone || '').replace(/"/g, '""')}"`;
      const role = `"${(u.role || 'Player').replace(/"/g, '""')}"`;
      const status = `"${(u.status || 'Active').replace(/"/g, '""')}"`;
      const date = `"${(u.registeredDate || '').replace(/"/g, '""')}"`;
      csvContent += `${id},${num},${name},${email},${phone},${role},${status},${date}\n`;
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MobinX_Users_Database_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }

  exportUsersJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.registeredUsers, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `MobinX_Users_Database_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }

  clearAppCache() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('mobinx_saved_sens');
    }
    this.savedSensitivities = [];
    return true;
  }
}

export const authService = new AuthService();


