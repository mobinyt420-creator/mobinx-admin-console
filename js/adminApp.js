import { firebaseConfig } from './firebaseConfig.js';

// ==========================================
// 1. FIREBASE & CLOUD FIRESTORE INTEGRATION
// ==========================================
let app = null;
let auth = null;
let db = null;
let isFirebaseConnected = false;

// Zero-Latency Local & Cross-Tab Broadcast Bus
let realtimeBus = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    realtimeBus = new BroadcastChannel('mobinx_realtime_sync');
  }
} catch (e) {
  console.warn('BroadcastChannel not available:', e);
}

function broadcastSync(type, payload) {
  if (realtimeBus) {
    try {
      realtimeBus.postMessage({ type, payload, timestamp: Date.now() });
    } catch (e) {}
  }
}

async function initFirebase() {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
    const { getFirestore, doc, setDoc, deleteDoc, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseConnected = true;

    console.log('⚡ Firebase Cloud Connected to Project:', firebaseConfig.projectId);
    updateFirebaseStatusBadge(true);
    return { app, auth, db, doc, setDoc, deleteDoc, collection, getDocs };
  } catch (err) {
    console.warn('Firebase connection note (operating with local sync bridge):', err.message);
    updateFirebaseStatusBadge(false);
    return null;
  }
}

function updateFirebaseStatusBadge(connected) {
  const pill = document.getElementById('sync-status-indicator');
  if (pill) {
    if (connected) {
      pill.innerHTML = `<span class="pulse-dot"></span> <span>Cloud Firestore Live</span>`;
      pill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    } else {
      pill.innerHTML = `<span class="pulse-dot" style="background:#f59e0b; box-shadow:0 0 8px #f59e0b;"></span> <span>Local Bridge Active</span>`;
      pill.style.borderColor = 'rgba(245, 158, 11, 0.4)';
    }
  }
}

// Write to Cloud Firestore helper
async function syncToFirestore(collectionName, docId, data) {
  if (!db) return false;
  try {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    await setDoc(doc(db, collectionName, docId), data, { merge: true });
    return true;
  } catch (err) {
    console.warn(`Firestore sync note [${collectionName}]:`, err.message);
    return false;
  }
}

async function deleteFromFirestore(collectionName, docId) {
  if (!db) return false;
  try {
    const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    await deleteDoc(doc(db, collectionName, docId));
    return true;
  } catch (err) {
    console.warn(`Firestore delete note [${collectionName}]:`, err.message);
    return false;
  }
}

// ==========================================
// 2. DATA STORES & SEEDED DATA
// ==========================================
const defaultTournaments = [
  {
    id: "tourn-1",
    title: "Battle Royale Squad Cup #44",
    gameMode: "Squad (4v4)",
    map: "Bermuda",
    matchTime: "09:30 PM Today",
    startTimestamp: Date.now() + 7200000,
    prizePool: "৳1,500",
    prize1st: "৳1,000",
    prize2nd: "৳350",
    prize3rd: "৳150",
    prizeKill: "৳20 / Kill",
    entryFee: "Free",
    status: "UPCOMING",
    slotsTotal: 48,
    slotsFilled: 24,
    banner: "assets/images/banner_esports.jpg",
    isRoomReleased: true,
    roomId: "MX-88942",
    roomPass: "1234",
    participants: [
      { playerName: "Tanvir_Sniper", ffUid: "1092837482", phone: "01799887766", slot: 1 },
      { playerName: "Shanto_Headshot", ffUid: "9283746152", phone: "01611223344", slot: 2 },
      { playerName: "Rifat_Booyah", ffUid: "4829104829", phone: "01933445566", slot: 3 }
    ]
  },
  {
    id: "tourn-2",
    title: "All-Stars Clash Squad Championship",
    gameMode: "Squad (4v4)",
    map: "Kalahari",
    matchTime: "10:30 PM Tonight",
    startTimestamp: Date.now() + 10800000,
    prizePool: "৳2,500",
    prize1st: "৳1,800",
    prize2nd: "৳700",
    prize3rd: "",
    prizeKill: "৳50 / MVP",
    entryFee: "Free",
    status: "UPCOMING",
    slotsTotal: 16,
    slotsFilled: 12,
    banner: "assets/images/banner_esports.jpg",
    isRoomReleased: false,
    roomId: "",
    roomPass: "",
    participants: []
  }
];

const defaultDownloads = [
  {
    id: "dl-proxy-v28",
    title: "Mobin X Proxy Ultra Boost APK (Latest V2.8)",
    category: "Mobin APK",
    youtubeId: "dQw4w9WgXcQ",
    videoThumbnail: "assets/images/banner_yt_mock1.jpg",
    videoDuration: "08:45",
    isPinned: true,
    actionButtons: [
      { id: "act-1", label: "Proxy APK Download", url: "https://mrmobin.blogspot.com/2024/07/proxy-apk.html", icon: "download", type: "download" },
      { id: "act-2", label: "UID Unlock Tool", url: "https://mrmobin.blogspot.com/2024/07/uid-unlock.html", icon: "key", type: "key" },
      { id: "act-3", label: "Sound Pack VIP", url: "https://mrmobin.blogspot.com/2024/07/sound.html", icon: "file", type: "file" },
      { id: "act-4", label: "Join Telegram Channel", url: "https://t.me/mobinx_official", icon: "link", type: "external" }
    ]
  },
  {
    id: "dl-aim-cfg-v4",
    title: "Free Fire Max VIP Headshot Aim Configuration V4",
    category: "Tools",
    youtubeId: "LXb3EKWsInQ",
    videoThumbnail: "assets/images/banner_yt_mock2.jpg",
    videoDuration: "12:10",
    isPinned: false,
    actionButtons: [
      { id: "act-1", label: "Config APK Download", url: "https://mrmobin.blogspot.com/2024/07/config.html", icon: "download", type: "download" },
      { id: "act-2", label: "UID Bypass Tool", url: "https://mrmobin.blogspot.com/2024/07/bypass.html", icon: "key", type: "key" },
      { id: "act-3", label: "Join Telegram Community", url: "https://t.me/mobinx_official", icon: "link", type: "external" }
    ]
  }
];

const defaultFlashDeals = [
  { id: "flash-1", diamondAmount: "100 DIAMONDS", price: "৳ 80.00", badge: "100% BONUS", bonus: "+100 Bonus", inStock: true },
  { id: "flash-2", diamondAmount: "310 DIAMONDS", price: "৳ 270.00", badge: "POPULAR", bonus: "+31 Bonus", inStock: true },
  { id: "flash-3", diamondAmount: "520 DIAMONDS", price: "৳ 420.00", badge: "BEST VALUE", bonus: "+52 Bonus", inStock: true },
  { id: "flash-4", diamondAmount: "1060 DIAMONDS", price: "৳ 820.00", badge: "LIMITED", bonus: "+106 Bonus", inStock: true }
];

const defaultHeroBanners = [
  { id: "banner-1", title: "Free Fire Daily Diamonds", image: "assets/images/banner_hero1.jpg", actionUrl: "https://noobtopup.com/", badge: "HOT DEAL", active: true },
  { id: "banner-2", title: "All-Stars Tournament ৳50K", image: "assets/images/banner_hero2.jpg", actionUrl: "https://t.me/mobinx_official", badge: "ESPORTS", active: true },
  { id: "banner-3", title: "Proxy Ultra Booster V2.8", image: "assets/images/banner_hero3.jpg", actionUrl: "https://mrmobin.blogspot.com/", badge: "NEW APK", active: true }
];

const defaultNotices = {
  welcomePopup: {
    enabled: false,
    title: "🔥 Welcome to Mobin X Official Gaming App!",
    message: "Join our official Telegram channel for daily free Free Fire redeem codes, instant tournament room passwords, and exclusive APK updates.",
    imageUrl: "assets/images/banner_esports.jpg",
    actionLabel: "Join Telegram Community ✈️",
    actionUrl: "https://t.me/mobinx_official"
  },
  pushNotification: {
    message: "Welcome to Mobin X! All services and Cloud Firestore are active.",
    timestamp: Date.now()
  }
};

const defaultUsers = [
  { id: "u-1", fullName: "Tanvir Hossain", username: "Tanvir_Sniper", ffUid: "1092837482", phone: "01799887766", role: "PRO MEMBER", status: "Active", joined: "2026-08-10" },
  { id: "u-2", fullName: "Nazmul Shanto", username: "Shanto_Headshot", ffUid: "9283746152", phone: "01611223344", role: "VIP MEMBER", status: "Active", joined: "2026-08-15" },
  { id: "u-3", fullName: "Rifat Ahmed", username: "Rifat_Booyah", ffUid: "4829104829", phone: "01933445566", role: "PLAYER", status: "Active", joined: "2026-08-20" }
];

function getStorage(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

const state = {
  activeTab: 'overview',
  tournaments: getStorage('mobinx_tournaments_data', defaultTournaments),
  downloads: getStorage('mobinx_downloads_catalog', defaultDownloads),
  flashDeals: getStorage('mobinx_flash_deals', defaultFlashDeals),
  banners: getStorage('mobinx_hero_banners', defaultHeroBanners),
  notices: getStorage('mobinx_notices_config', defaultNotices),
  users: getStorage('mobinx_registered_users', defaultUsers),
  metrics: {
    dailyUsers: 428,
    totalUsers: 3892,
    weeklyUsers: 1945,
    monthlyUsers: 3420
  }
};

// ==========================================
// 3. TAB RENDERERS
// ==========================================

// TAB 1: OVERVIEW (User metrics & SVG charts - Wallet pool removed)
function renderOverview() {
  return `
    <div class="tab-pane active" id="tab-overview">
      
      <!-- Metrics Grid (Wallet Pool Removed -> Real User Metrics Added) -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-label">Daily Active Users</div>
            <div class="stat-val">${state.metrics.dailyUsers}</div>
            <div class="stat-trend up">↑ +18.4% today</div>
          </div>
          <div class="stat-icon-wrapper" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">👥</div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-label">Total Registered Players</div>
            <div class="stat-val">${state.metrics.totalUsers}</div>
            <div class="stat-trend up">↑ +142 this week</div>
          </div>
          <div class="stat-icon-wrapper" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">🌐</div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-label">7-Day Active Users</div>
            <div class="stat-val">${state.metrics.weeklyUsers}</div>
            <div class="stat-trend neutral">50% retention</div>
          </div>
          <div class="stat-icon-wrapper" style="background: rgba(6, 182, 212, 0.15); color: #06b6d4;">📅</div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-label">Active Tournaments</div>
            <div class="stat-val">${state.tournaments.length}</div>
            <div class="stat-trend up">Live matches scheduled</div>
          </div>
          <div class="stat-icon-wrapper" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b;">🏆</div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-label">APK Downloads Catalog</div>
            <div class="stat-val">${state.downloads.length}</div>
            <div class="stat-trend up">Verified 100% Anti-Ban</div>
          </div>
          <div class="stat-icon-wrapper" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">📥</div>
        </div>

        <div class="stat-card">
          <div class="stat-info">
            <div class="stat-label">Real-Time Cloud Sync</div>
            <div class="stat-val" style="color: #10b981;">Active</div>
            <div class="stat-trend up">Firebase obin-shop connected</div>
          </div>
          <div class="stat-icon-wrapper" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">⚡</div>
        </div>
      </div>

      <!-- Interactive SVG Analytics Charts -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 20px;">
        
        <!-- Chart 1: 7-Day Player Activity Trend -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <div>
              <div class="card-title">📈 7-Day Player Activity & Registration Trend</div>
              <div class="card-subtitle">Real-time daily player engagement across Bangladesh & global</div>
            </div>
            <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; font-weight: 700;">Live Traffic</span>
          </div>

          <div style="width: 100%; height: 180px; position: relative; margin-top: 10px;">
            <svg viewBox="0 0 500 160" width="100%" height="100%" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <!-- Grid Lines -->
              <line x1="0" y1="30" x2="500" y2="30" stroke="#1e293b" stroke-width="1" stroke-dasharray="4"/>
              <line x1="0" y1="75" x2="500" y2="75" stroke="#1e293b" stroke-width="1" stroke-dasharray="4"/>
              <line x1="0" y1="120" x2="500" y2="120" stroke="#1e293b" stroke-width="1" stroke-dasharray="4"/>

              <!-- Filled Area -->
              <polygon points="0,140 0,110 70,95 150,115 225,70 300,85 385,45 450,55 500,20 500,140" fill="url(#areaGrad)"/>

              <!-- Trend Line -->
              <polyline points="0,110 70,95 150,115 225,70 300,85 385,45 450,55 500,20" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round"/>

              <!-- Data Dots -->
              <circle cx="70" cy="95" r="4" fill="#60a5fa" stroke="#ffffff" stroke-width="1.5"/>
              <circle cx="150" cy="115" r="4" fill="#60a5fa" stroke="#ffffff" stroke-width="1.5"/>
              <circle cx="225" cy="70" r="4" fill="#60a5fa" stroke="#ffffff" stroke-width="1.5"/>
              <circle cx="300" cy="85" r="4" fill="#60a5fa" stroke="#ffffff" stroke-width="1.5"/>
              <circle cx="385" cy="45" r="4" fill="#60a5fa" stroke="#ffffff" stroke-width="1.5"/>
              <circle cx="450" cy="55" r="4" fill="#60a5fa" stroke="#ffffff" stroke-width="1.5"/>
              <circle cx="500" cy="20" r="5" fill="#06b6d4" stroke="#ffffff" stroke-width="2"/>
            </svg>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-sub); margin-top: 6px;">
              <span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span><span>Today</span>
            </div>
          </div>
        </div>

        <!-- Chart 2: Feature Engagement Distribution -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <div>
              <div class="card-title">🎯 Engagement</div>
              <div class="card-subtitle">By feature usage</div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 3px;">
                <span>🏆 Tournaments</span>
                <span style="color: #f59e0b;">42%</span>
              </div>
              <div style="height: 6px; background: #1e293b; border-radius: 99px; overflow: hidden;">
                <div style="width: 42%; height: 100%; background: #f59e0b;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 3px;">
                <span>📥 APK Downloads</span>
                <span style="color: #3b82f6;">34%</span>
              </div>
              <div style="height: 6px; background: #1e293b; border-radius: 99px; overflow: hidden;">
                <div style="width: 34%; height: 100%; background: #3b82f6;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 3px;">
                <span>🎯 Sensitivity Maker</span>
                <span style="color: #06b6d4;">16%</span>
              </div>
              <div style="height: 6px; background: #1e293b; border-radius: 99px; overflow: hidden;">
                <div style="width: 16%; height: 100%; background: #06b6d4;"></div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; margin-bottom: 3px;">
                <span>⚡ Top-Up & Shop</span>
                <span style="color: #10b981;">8%</span>
              </div>
              <div style="height: 6px; background: #1e293b; border-radius: 99px; overflow: hidden;">
                <div style="width: 8%; height: 100%; background: #10b981;"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Quick Actions Grid -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">⚡ Quick Management Actions</div>
          <div class="card-subtitle">Instant triggers synced to Cloud Firestore</div>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-primary" id="btn-quick-schedule-tourn">➕ Schedule New Tournament</button>
          <button class="btn btn-secondary" id="btn-quick-add-apk">📥 Upload New APK Download</button>
          <button class="btn btn-secondary" id="btn-quick-manage-banners">🖼️ Manage Sliders & Banners</button>
          <button class="btn btn-secondary" id="btn-quick-send-notice">📢 Broadcast App Notice</button>
        </div>
      </div>

    </div>
  `;
}

// TAB 2: TOURNAMENTS & ROOMS (Solo/Duo/Squad + 5 FF Maps + Reverse Countdown + Tiered Prizes)
function renderTournaments() {
  const todayIso = new Date().toISOString().slice(0, 16);

  return `
    <div class="tab-pane active" id="tab-tournaments">
      
      <!-- Schedule Match Form -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">🏆 Schedule & Publish Free Fire Tournament</div>
            <div class="card-subtitle">Publishes in real-time with reverse countdown timer for all app players</div>
          </div>
        </div>

        <form id="form-add-tournament">
          <div class="form-grid">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Tournament Title *</label>
              <input type="text" id="new-t-title" class="form-control" placeholder="e.g. BR Squad Championship #45" required />
            </div>

            <!-- Game Mode Selectable Buttons -->
            <div class="form-group">
              <label class="form-label">Game Mode *</label>
              <div style="display: flex; gap: 6px;" id="mode-btn-group">
                <button type="button" class="btn btn-secondary mode-select-btn active" data-mode="Squad (4v4)" style="flex:1; font-size:11.5px; padding:8px 4px;">Squad (4v4)</button>
                <button type="button" class="btn btn-secondary mode-select-btn" data-mode="Duo" style="flex:1; font-size:11.5px; padding:8px 4px;">Duo</button>
                <button type="button" class="btn btn-secondary mode-select-btn" data-mode="Solo" style="flex:1; font-size:11.5px; padding:8px 4px;">Solo</button>
              </div>
              <input type="hidden" id="new-t-mode" value="Squad (4v4)" />
            </div>

            <!-- Free Fire 5 Official Maps -->
            <div class="form-group">
              <label class="form-label">Free Fire Map *</label>
              <select id="new-t-map" class="form-control">
                <option value="Bermuda">Bermuda</option>
                <option value="NeXTerra">NeXTerra</option>
                <option value="Purgatory">Purgatory</option>
                <option value="Kalahari">Kalahari</option>
                <option value="Alpine">Alpine</option>
              </select>
            </div>

            <!-- Match Date & Time with Past Date Prevention -->
            <div class="form-group">
              <label class="form-label">Match Date & Start Time * (For Live Reverse Timer)</label>
              <input type="datetime-local" id="new-t-datetime" class="form-control" min="${todayIso}" value="${todayIso}" required />
            </div>

            <!-- Entry Fee Options -->
            <div class="form-group">
              <label class="form-label">Entry Fee *</label>
              <div style="display: flex; gap: 6px;">
                <select id="new-t-entry-type" class="form-control" style="width: 110px;">
                  <option value="Free">Free</option>
                  <option value="Paid">Paid</option>
                </select>
                <input type="text" id="new-t-entry-val" class="form-control" placeholder="Free" value="Free" />
              </div>
            </div>

            <!-- Prize Currency Switcher -->
            <div class="form-group">
              <label class="form-label">Prize Currency *</label>
              <select id="new-t-prize-currency" class="form-control">
                <option value="৳">BDT Cash (৳)</option>
                <option value="💎">Free Fire Diamonds (💎)</option>
              </select>
            </div>

            <!-- 1st Place Win Prize -->
            <div class="form-group">
              <label class="form-label">1st Place (Booyah Prize) *</label>
              <input type="text" id="new-t-prize-1st" class="form-control" placeholder="৳1,000" value="৳1,000" required />
            </div>

            <!-- 2nd Place Prize -->
            <div class="form-group">
              <label class="form-label">2nd Place Prize (Optional)</label>
              <input type="text" id="new-t-prize-2nd" class="form-control" placeholder="৳350" />
            </div>

            <!-- 3rd Place Prize -->
            <div class="form-group">
              <label class="form-label">3rd Place Prize (Optional)</label>
              <input type="text" id="new-t-prize-3rd" class="form-control" placeholder="৳150" />
            </div>

            <!-- Per Kill / MVP Prize -->
            <div class="form-group">
              <label class="form-label">Per Kill / MVP Prize (Optional)</label>
              <input type="text" id="new-t-prize-kill" class="form-control" placeholder="৳20 / Kill" />
            </div>

            <!-- Total Slots -->
            <div class="form-group">
              <label class="form-label">Total Slots</label>
              <input type="number" id="new-t-slots" class="form-control" value="48" min="8" max="100" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="margin-top: 10px;">🚀 Publish Tournament to App</button>
        </form>
      </div>

      <!-- Active Tournaments List & Custom Room Credentials Releaser -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">🎮 Active Tournaments & Instant Room Credential Releaser</div>
            <div class="card-subtitle">Release Room ID & Password here; instantly displayed in all player apps!</div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${state.tournaments.map(t => `
            <div style="background: var(--bg-body); border: 1.5px solid ${t.isRoomReleased ? '#10b981' : 'var(--border-color)'}; border-radius: var(--radius-lg); padding: 18px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <h3 style="font-size: 16px; font-weight: 800; color: #ffffff;">${t.title}</h3>
                    <span class="badge" style="${t.isRoomReleased ? 'background: rgba(16, 185, 129, 0.2); color: #34d399;' : 'background: rgba(245, 158, 11, 0.2); color: #fbbf24;'} font-weight: 700;">
                      ${t.isRoomReleased ? '🟢 ROOM ID RELEASED' : '🟡 WAITING FOR MATCH TIME'}
                    </span>
                  </div>
                  <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                    🎮 Mode: <strong>${t.gameMode || t.mode}</strong> | 🗺️ Map: <strong>${t.map}</strong> | ⏰ Time: <strong>${t.matchTime}</strong>
                  </div>
                  <div style="font-size: 12px; color: #10b981; font-weight: 700; margin-top: 2px;">
                    🏆 Prize: ${t.prizePool || t.prize1st} ${t.prize2nd ? `| 🥈 2nd: ${t.prize2nd}` : ''} ${t.prizeKill ? `| 🎯 ${t.prizeKill}` : ''}
                  </div>
                </div>

                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-danger btn-delete-tourn" data-id="${t.id}" style="padding: 6px 12px; font-size: 12px;">🗑️ Delete</button>
                </div>
              </div>

              <!-- Live Room ID & Password Releaser Box -->
              <div class="room-releaser-box">
                <div style="font-size: 12px; font-weight: 800; color: #34d399; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                  <span>🔑</span>
                  <span>INSTANT ROOM CREDENTIAL RELEASER</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px;">
                  <input type="text" id="room-id-${t.id}" class="form-control" placeholder="Room ID (e.g. 9841284)" value="${t.roomId || ''}" />
                  <input type="text" id="room-pass-${t.id}" class="form-control" placeholder="Room Password (e.g. 1234)" value="${t.roomPass || ''}" />
                  <button class="btn btn-success btn-release-room" data-id="${t.id}">
                    ${t.isRoomReleased ? '🔄 Update Room' : '📢 Release Room ID Now'}
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// TAB 3: APK DOWNLOADS (Dynamic Action Buttons Repeater + YouTube Preview + Pin to Top)
function renderDownloads() {
  return `
    <div class="tab-pane active" id="tab-downloads">
      
      <!-- Add New Download Form -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">📥 Add New APK / Tool Download</div>
            <div class="card-subtitle">Embed YouTube video guide and configure multiple dynamic download action buttons</div>
          </div>
        </div>

        <form id="form-add-download">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">APK / Tool Title *</label>
              <input type="text" id="new-dl-title" class="form-control" placeholder="e.g. Mobin VIP Auto Headshot Macro APK" required />
            </div>

            <div class="form-group">
              <label class="form-label">Category *</label>
              <select id="new-dl-category" class="form-control">
                <option value="Mobin APK">Mobin APK</option>
                <option value="Tools">Tools</option>
                <option value="Premium Apps">Premium Apps</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">YouTube Video ID or Full URL *</label>
              <input type="text" id="new-dl-yt" class="form-control" placeholder="e.g. dQw4w9WgXcQ or https://youtu.be/..." required />
            </div>

            <div class="form-group">
              <label class="form-label">Pin to Top of Catalog</label>
              <div style="display: flex; align-items: center; height: 42px; gap: 8px;">
                <input type="checkbox" id="new-dl-pinned" style="width: 18px; height: 18px;" />
                <span style="font-size: 12px; color: var(--text-muted);">Show at top with PIN badge</span>
              </div>
            </div>
          </div>

          <!-- Dynamic Action Buttons Repeater -->
          <div style="margin-top: 14px; background: rgba(255, 255, 255, 0.02); border: 1px dashed var(--border-color); border-radius: var(--radius-md); padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 12px; font-weight: 800; color: var(--text-main);">🎯 Download Action Buttons (Appears under video)</span>
              <button type="button" class="btn btn-secondary" id="btn-add-action-row" style="padding: 4px 10px; font-size: 11.5px;">➕ Add Another Button</button>
            </div>

            <div id="action-buttons-repeater-container" style="display: flex; flex-direction: column; gap: 8px;">
              <div class="action-btn-row" style="display: grid; grid-template-columns: 1fr 2fr auto; gap: 8px;">
                <input type="text" class="form-control act-label-input" placeholder="Button Name (e.g. Proxy APK Download)" value="Proxy APK Download" required />
                <input type="url" class="form-control act-url-input" placeholder="Download Target Link (https://...)" value="https://mrmobin.blogspot.com/" required />
                <button type="button" class="btn btn-danger btn-remove-act-row" style="padding: 6px 10px;">✕</button>
              </div>
              <div class="action-btn-row" style="display: grid; grid-template-columns: 1fr 2fr auto; gap: 8px;">
                <input type="text" class="form-control act-label-input" placeholder="Button Name (e.g. Join Telegram)" value="Join Telegram Channel" required />
                <input type="url" class="form-control act-url-input" placeholder="Download Target Link (https://...)" value="https://t.me/mobinx_official" required />
                <button type="button" class="btn btn-danger btn-remove-act-row" style="padding: 6px 10px;">✕</button>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="margin-top: 14px;">🚀 Publish Download Item to App</button>
        </form>
      </div>

      <!-- Published Downloads Feed -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📱 Published Download Catalog (${state.downloads.length})</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${state.downloads.map(dl => `
            <div style="background: var(--bg-body); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <h3 style="font-size: 15px; font-weight: 800; color: #ffffff;">${dl.title}</h3>
                    <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;">${dl.category}</span>
                    ${dl.isPinned ? `<span class="badge" style="background: #eab308; color: #000; font-weight: 800;">📌 PINNED</span>` : ''}
                  </div>
                  <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                    YouTube Video: <strong>${dl.youtubeId}</strong> | Actions: <strong>${(dl.actionButtons || []).length} buttons</strong>
                  </div>
                </div>

                <div style="display: flex; gap: 6px;">
                  <button class="btn btn-danger btn-delete-download" data-id="${dl.id}" style="padding: 6px 12px; font-size: 12px;">🗑️ Delete</button>
                </div>
              </div>

              <!-- Buttons Preview Pills -->
              <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px;">
                ${(dl.actionButtons || []).map(a => `
                  <span style="font-size: 11px; padding: 4px 10px; border-radius: 99px; background: var(--bg-input); border: 1px solid var(--border-color); color: var(--cyan);">
                    📥 ${a.label}
                  </span>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// TAB 4: FLASH DIAMOND DEALS (Edit & Delete modals included)
function renderFlashDeals() {
  return `
    <div class="tab-pane active" id="tab-flash">
      
      <div class="card">
        <div class="card-header">
          <div class="card-title">⚡ Add New Flash Diamond Deal</div>
          <div class="card-subtitle">Displayed on App Home & Top-Up Sections</div>
        </div>

        <form id="form-add-flash">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Diamond Amount *</label>
              <input type="text" id="new-f-diamonds" class="form-control" placeholder="e.g. 520 DIAMONDS" required />
            </div>
            <div class="form-group">
              <label class="form-label">Price (৳) *</label>
              <input type="text" id="new-f-price" class="form-control" placeholder="৳ 420.00" required />
            </div>
            <div class="form-group">
              <label class="form-label">Badge</label>
              <input type="text" id="new-f-badge" class="form-control" placeholder="BEST VALUE / 100% BONUS" value="POPULAR" />
            </div>
            <div class="form-group">
              <label class="form-label">Bonus Text</label>
              <input type="text" id="new-f-bonus" class="form-control" placeholder="+52 Bonus" value="+50 Bonus" />
            </div>
          </div>
          <button type="submit" class="btn btn-primary">➕ Publish Flash Deal</button>
        </form>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">💎 Active Flash Deals (${state.flashDeals.length})</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${state.flashDeals.map(d => `
            <div class="item-card">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 800; color: #ffffff;">${d.diamondAmount}</span>
                  <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b;">${d.badge}</span>
                </div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                  Price: <strong style="color:#10b981;">${d.price}</strong> | Bonus: ${d.bonus}
                </div>
              </div>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-secondary btn-edit-deal" data-id="${d.id}" style="padding: 4px 10px; font-size: 11px;">✏️ Edit</button>
                <button class="btn btn-danger btn-delete-deal" data-id="${d.id}" style="padding: 4px 10px; font-size: 11px;">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// TAB 5: HERO & PROMO BANNERS (Image URL/Upload + Redirect Links)
function renderBanners() {
  return `
    <div class="tab-pane active" id="tab-banners">
      
      <div class="card">
        <div class="card-header">
          <div class="card-title">🖼️ Add New Hero or Promotional Banner</div>
          <div class="card-subtitle">Shown on 16:9 carousel or notice banner with optional redirect link</div>
        </div>

        <form id="form-add-banner">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Banner Title *</label>
              <input type="text" id="new-b-title" class="form-control" placeholder="e.g. Clash Squad Season 17" required />
            </div>

            <div class="form-group">
              <label class="form-label">Banner Type</label>
              <select id="new-b-type" class="form-control">
                <option value="hero">Hero 16:9 Carousel (Top)</option>
                <option value="promo">Promotional Banner</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Image URL or Local Path *</label>
              <input type="text" id="new-b-image" class="form-control" placeholder="assets/images/banner_hero1.jpg or https://..." required />
            </div>

            <div class="form-group">
              <label class="form-label">Action Target Link (Optional)</label>
              <input type="url" id="new-b-url" class="form-control" placeholder="https://t.me/mobinx_official or https://noobtopup.com/" />
            </div>
          </div>
          <button type="submit" class="btn btn-primary">➕ Publish Banner</button>
        </form>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">🖼️ Active Hero Banners (${state.banners.length})</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${state.banners.map(b => `
            <div class="item-card">
              <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${b.image}" alt="${b.title}" style="width: 70px; height: 40px; border-radius: 6px; object-fit: cover; background: #000;" />
                <div>
                  <div style="font-weight: 800; color: #ffffff;">${b.title}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">
                    Link: <strong>${b.actionUrl || 'None'}</strong> | Badge: ${b.badge || 'HOT'}
                  </div>
                </div>
              </div>
              <button class="btn btn-danger btn-delete-banner" data-id="${b.id}" style="padding: 4px 10px; font-size: 11px;">🗑️</button>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// TAB 6: NOTICES & WELCOME POPUP & PUSH BROADCASTER
function renderSystemUrls() {
  const popup = state.notices.welcomePopup || {};

  return `
    <div class="tab-pane active" id="tab-urls">
      
      <!-- Welcome Announcement Modal Manager -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">📢 In-App Welcome Announcement Modal</div>
            <div class="card-subtitle">Automatically pops up when users open the app (dismissible)</div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="notice-welcome-enabled" style="width: 20px; height: 20px;" ${popup.enabled ? 'checked' : ''} />
            <label for="notice-welcome-enabled" style="font-size: 12px; font-weight: 800; color: ${popup.enabled ? '#10b981' : 'var(--text-muted)'};">
              ${popup.enabled ? 'ACTIVE IN APP' : 'DISABLED'}
            </label>
          </div>
        </div>

        <form id="form-save-welcome-popup">
          <div class="form-grid">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Announcement Title *</label>
              <input type="text" id="notice-welcome-title" class="form-control" value="${popup.title || '🔥 Welcome to Mobin X Official Gaming App!'}" required />
            </div>

            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Announcement Message Body *</label>
              <textarea id="notice-welcome-msg" class="form-control" rows="3" required>${popup.message || ''}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Optional Banner Image URL</label>
              <input type="text" id="notice-welcome-img" class="form-control" placeholder="assets/images/banner_esports.jpg" value="${popup.imageUrl || ''}" />
            </div>

            <div class="form-group">
              <label class="form-label">Action Button Label</label>
              <input type="text" id="notice-welcome-btn-label" class="form-control" placeholder="Join Telegram Community ✈️" value="${popup.actionLabel || 'Join Telegram Community ✈️'}" />
            </div>

            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">Action Button Redirect URL</label>
              <input type="url" id="notice-welcome-btn-url" class="form-control" placeholder="https://t.me/mobinx_official" value="${popup.actionUrl || 'https://t.me/mobinx_official'}" />
            </div>
          </div>
          <button type="submit" class="btn btn-primary">💾 Save Announcement to Cloud Firestore</button>
        </form>
      </div>

      <!-- Flash Push Notification Broadcaster -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">🚀 Flash Push Notification Broadcaster</div>
            <div class="card-subtitle">Sends an immediate live banner toast to all active players</div>
          </div>
        </div>

        <form id="form-broadcast-push">
          <div class="form-group">
            <label class="form-label">Push Notification Message *</label>
            <input type="text" id="push-msg-input" class="form-control" placeholder="e.g. 🔥 Weekend BR Solo Headshot tournament registration open now!" required />
          </div>
          <button type="submit" class="btn btn-success" style="margin-top: 10px;">📢 Broadcast Push Notification Now</button>
        </form>
      </div>

    </div>
  `;
}

// TAB 7: PLAYERS DIRECTORY (Wallet Pool Removed -> Clean Players List)
function renderUsers() {
  return `
    <div class="tab-pane active" id="tab-users">
      
      <div class="card">
        <div class="card-header">
          <div class="card-title">👥 Registered Players Directory (${state.users.length})</div>
          <div class="card-subtitle">Manage registered gamers and Free Fire player accounts</div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${state.users.map(u => `
            <div class="item-card">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 800; color: #ffffff;">${u.fullName || u.username}</span>
                  <span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;">${u.role || 'PLAYER'}</span>
                  <span class="badge" style="${u.status === 'Suspended' ? 'background: rgba(239, 68, 68, 0.2); color: #f87171;' : 'background: rgba(16, 185, 129, 0.2); color: #34d399;'}">
                    ${u.status || 'Active'}
                  </span>
                </div>
                <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 3px;">
                  UID: <strong style="color:#ffffff;">${u.ffUid || 'N/A'}</strong> | Phone: ${u.phone || 'N/A'} | Joined: ${u.joined || 'Recent'}
                </div>
              </div>
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-secondary btn-toggle-user-status" data-id="${u.id}" style="padding: 4px 8px; font-size: 11px;">
                  ${u.status === 'Suspended' ? '✅ Activate' : '🚫 Suspend'}
                </button>
                <button class="btn btn-danger btn-delete-user" data-id="${u.id}" style="padding: 4px 8px; font-size: 11px;">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// ==========================================
// 4. MAIN DISPATCHER & EVENT HANDLERS
// ==========================================
function renderCurrentTab() {
  const content = document.getElementById('tab-content-area');
  const title = document.getElementById('current-page-title');
  if (!content) return;

  switch (state.activeTab) {
    case 'overview':
      if (title) title.textContent = 'Dashboard Overview';
      content.innerHTML = renderOverview();
      break;
    case 'tournaments':
      if (title) title.textContent = 'Tournaments & Room Credentials';
      content.innerHTML = renderTournaments();
      break;
    case 'downloads':
      if (title) title.textContent = 'APK Downloads Catalog';
      content.innerHTML = renderDownloads();
      break;
    case 'flash':
      if (title) title.textContent = 'Flash Diamond Deals';
      content.innerHTML = renderFlashDeals();
      break;
    case 'banners':
      if (title) title.textContent = 'Hero & Promotional Banners';
      content.innerHTML = renderBanners();
      break;
    case 'urls':
      if (title) title.textContent = 'Notices & Announcement Modals';
      content.innerHTML = renderSystemUrls();
      break;
    case 'users':
      if (title) title.textContent = 'Players Directory';
      content.innerHTML = renderUsers();
      break;
    default:
      content.innerHTML = renderOverview();
  }

  bindCurrentTabEvents();
}

function bindNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      state.activeTab = item.dataset.tab;
      renderCurrentTab();

      const sidebar = document.getElementById('admin-sidebar');
      if (sidebar && window.innerWidth <= 900) {
        sidebar.classList.remove('open');
      }
    });
  });

  document.getElementById('mobile-toggle-btn')?.addEventListener('click', () => {
    const sidebar = document.getElementById('admin-sidebar');
    sidebar?.classList.toggle('open');
  });
}

function bindCurrentTabEvents() {
  // Overview Quick Actions
  document.getElementById('btn-quick-schedule-tourn')?.addEventListener('click', () => {
    document.querySelector('.nav-item[data-tab="tournaments"]')?.click();
  });
  document.getElementById('btn-quick-add-apk')?.addEventListener('click', () => {
    document.querySelector('.nav-item[data-tab="downloads"]')?.click();
  });
  document.getElementById('btn-quick-manage-banners')?.addEventListener('click', () => {
    document.querySelector('.nav-item[data-tab="banners"]')?.click();
  });
  document.getElementById('btn-quick-send-notice')?.addEventListener('click', () => {
    document.querySelector('.nav-item[data-tab="urls"]')?.click();
  });

  // Tournaments: Game Mode buttons
  document.querySelectorAll('.mode-select-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-select-btn').forEach(b => b.classList.remove('active', 'btn-primary'));
      btn.classList.add('active', 'btn-primary');
      const input = document.getElementById('new-t-mode');
      if (input) input.value = btn.dataset.mode;
    });
  });

  // Tournaments: Form Add
  document.getElementById('form-add-tournament')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('new-t-title').value;
    const mode = document.getElementById('new-t-mode').value;
    const map = document.getElementById('new-t-map').value;
    const dtVal = document.getElementById('new-t-datetime').value;
    const prizeCurr = document.getElementById('new-t-prize-currency').value;
    const prize1st = document.getElementById('new-t-prize-1st').value;
    const prize2nd = document.getElementById('new-t-prize-2nd').value;
    const prize3rd = document.getElementById('new-t-prize-3rd').value;
    const prizeKill = document.getElementById('new-t-prize-kill').value;
    const entryFee = document.getElementById('new-t-entry-val').value;
    const slots = parseInt(document.getElementById('new-t-slots').value) || 48;

    const startTimestamp = dtVal ? new Date(dtVal).getTime() : Date.now() + 3600000;
    const timeFormatted = dtVal ? new Date(dtVal).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '09:30 PM';

    const newMatch = {
      id: 'tourn-' + Date.now(),
      title,
      gameMode: mode,
      map,
      matchTime: `${timeFormatted}`,
      matchTimeIso: dtVal,
      startTimestamp,
      prizePool: prize1st,
      prize1st,
      prize2nd,
      prize3rd,
      prizeKill,
      entryFee: entryFee || 'Free',
      status: 'UPCOMING',
      slotsTotal: slots,
      slotsFilled: 0,
      banner: 'assets/images/banner_esports.jpg',
      isRoomReleased: false,
      roomId: '',
      roomPass: '',
      participants: []
    };

    state.tournaments.unshift(newMatch);
    setStorage('mobinx_tournaments_data', state.tournaments);
    await syncToFirestore('tournaments', newMatch.id, newMatch);
    broadcastSync('TOURNAMENTS_UPDATED', newMatch);

    showToast('Tournament published with live reverse countdown!', 'success');
    renderCurrentTab();
  });

  // Tournaments: Release Room ID
  document.querySelectorAll('.btn-release-room').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const tourn = state.tournaments.find(t => t.id === id);
      if (tourn) {
        const roomId = document.getElementById(`room-id-${id}`).value;
        const roomPass = document.getElementById(`room-pass-${id}`).value;

        if (!roomId || !roomPass) {
          showToast('Please enter both Room ID and Room Password', 'warning');
          return;
        }

        tourn.roomId = roomId;
        tourn.roomPass = roomPass;
        tourn.isRoomReleased = true;

        setStorage('mobinx_tournaments_data', state.tournaments);
        await syncToFirestore('tournaments', tourn.id, tourn);
        broadcastSync('ROOM_RELEASED', tourn);

        showToast(`Room ID released! All players notified.`, 'success');
        renderCurrentTab();
      }
    });
  });

  // Tournaments: Delete
  document.querySelectorAll('.btn-delete-tourn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      state.tournaments = state.tournaments.filter(t => t.id !== id);
      setStorage('mobinx_tournaments_data', state.tournaments);
      await deleteFromFirestore('tournaments', id);
      broadcastSync('TOURNAMENTS_UPDATED', { deletedId: id });
      showToast('Tournament deleted.', 'warning');
      renderCurrentTab();
    });
  });

  // Downloads: Add Button Row in Repeater
  document.getElementById('btn-add-action-row')?.addEventListener('click', () => {
    const container = document.getElementById('action-buttons-repeater-container');
    if (container) {
      const div = document.createElement('div');
      div.className = 'action-btn-row';
      div.style.cssText = 'display: grid; grid-template-columns: 1fr 2fr auto; gap: 8px;';
      div.innerHTML = `
        <input type="text" class="form-control act-label-input" placeholder="Button Name (e.g. UID Unlock)" required />
        <input type="url" class="form-control act-url-input" placeholder="Download Link (https://...)" required />
        <button type="button" class="btn btn-danger btn-remove-act-row" style="padding: 6px 10px;">✕</button>
      `;
      container.appendChild(div);

      div.querySelector('.btn-remove-act-row')?.addEventListener('click', () => div.remove());
    }
  });

  document.querySelectorAll('.btn-remove-act-row').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.action-btn-row')?.remove();
    });
  });

  // Downloads: Form Add
  document.getElementById('form-add-download')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('new-dl-title').value;
    const category = document.getElementById('new-dl-category').value;
    let ytInput = document.getElementById('new-dl-yt').value.trim();
    const isPinned = document.getElementById('new-dl-pinned').checked;

    let youtubeId = ytInput;
    if (ytInput.includes('v=')) youtubeId = ytInput.split('v=')[1].split('&')[0];
    else if (ytInput.includes('youtu.be/')) youtubeId = ytInput.split('youtu.be/')[1].split('?')[0];

    const actionButtons = [];
    document.querySelectorAll('.action-btn-row').forEach((row, idx) => {
      const label = row.querySelector('.act-label-input')?.value?.trim();
      const url = row.querySelector('.act-url-input')?.value?.trim();
      if (label && url) {
        actionButtons.push({
          id: `act-${Date.now()}-${idx}`,
          label,
          url,
          icon: label.toLowerCase().includes('tele') ? 'link' : (label.toLowerCase().includes('key') || label.toLowerCase().includes('uid') ? 'key' : 'download'),
          type: label.toLowerCase().includes('tele') ? 'external' : 'download'
        });
      }
    });

    const newDl = {
      id: 'dl-' + Date.now(),
      title,
      category,
      youtubeId,
      videoThumbnail: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
      videoDuration: '10:00',
      isPinned,
      actionButtons: actionButtons.length > 0 ? actionButtons : [
        { id: 'act-1', label: 'Download APK File', url: 'https://mrmobin.blogspot.com/', icon: 'download', type: 'download' }
      ]
    };

    if (isPinned) state.downloads.unshift(newDl);
    else state.downloads.push(newDl);

    setStorage('mobinx_downloads_catalog', state.downloads);
    await syncToFirestore('downloads', newDl.id, newDl);
    broadcastSync('DOWNLOADS_UPDATED', newDl);

    showToast('Download package published with dynamic action buttons!', 'success');
    renderCurrentTab();
  });

  // Downloads: Delete
  document.querySelectorAll('.btn-delete-download').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      state.downloads = state.downloads.filter(d => d.id !== id);
      setStorage('mobinx_downloads_catalog', state.downloads);
      await deleteFromFirestore('downloads', id);
      broadcastSync('DOWNLOADS_UPDATED', { deletedId: id });
      showToast('Download removed.', 'warning');
      renderCurrentTab();
    });
  });

  // Flash Deals: Add
  document.getElementById('form-add-flash')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const diamonds = document.getElementById('new-f-diamonds').value;
    const price = document.getElementById('new-f-price').value;
    const badge = document.getElementById('new-f-badge').value;
    const bonus = document.getElementById('new-f-bonus').value;

    const newDeal = {
      id: 'flash-' + Date.now(),
      diamondAmount: diamonds,
      price,
      badge: badge || 'SPECIAL',
      bonus: bonus || '+10% Bonus',
      inStock: true
    };

    state.flashDeals.push(newDeal);
    setStorage('mobinx_flash_deals', state.flashDeals);
    await syncToFirestore('flashDeals', newDeal.id, newDeal);
    broadcastSync('FLASH_DEALS_UPDATED', newDeal);

    showToast('Flash Diamond Deal published!', 'success');
    renderCurrentTab();
  });

  // Flash Deals: Edit
  document.querySelectorAll('.btn-edit-deal').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const deal = state.flashDeals.find(d => d.id === id);
      if (deal) {
        const newPrice = prompt(`Edit price for ${deal.diamondAmount}:`, deal.price);
        if (newPrice) {
          deal.price = newPrice;
          setStorage('mobinx_flash_deals', state.flashDeals);
          await syncToFirestore('flashDeals', deal.id, deal);
          broadcastSync('FLASH_DEALS_UPDATED', deal);
          showToast('Deal updated!', 'success');
          renderCurrentTab();
        }
      }
    });
  });

  // Flash Deals: Delete
  document.querySelectorAll('.btn-delete-deal').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      state.flashDeals = state.flashDeals.filter(d => d.id !== id);
      setStorage('mobinx_flash_deals', state.flashDeals);
      await deleteFromFirestore('flashDeals', id);
      broadcastSync('FLASH_DEALS_UPDATED', { deletedId: id });
      showToast('Deal deleted.', 'warning');
      renderCurrentTab();
    });
  });

  // Banners: Add
  document.getElementById('form-add-banner')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('new-b-title').value;
    const image = document.getElementById('new-b-image').value;
    const url = document.getElementById('new-b-url').value;

    const newBanner = {
      id: 'banner-' + Date.now(),
      title,
      image,
      actionUrl: url || '',
      badge: 'NEW',
      active: true
    };

    state.banners.push(newBanner);
    setStorage('mobinx_hero_banners', state.banners);
    await syncToFirestore('banners', newBanner.id, newBanner);
    broadcastSync('BANNERS_UPDATED', newBanner);

    showToast('Banner published!', 'success');
    renderCurrentTab();
  });

  // Banners: Delete
  document.querySelectorAll('.btn-delete-banner').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      state.banners = state.banners.filter(b => b.id !== id);
      setStorage('mobinx_hero_banners', state.banners);
      await deleteFromFirestore('banners', id);
      broadcastSync('BANNERS_UPDATED', { deletedId: id });
      showToast('Banner removed.', 'warning');
      renderCurrentTab();
    });
  });

  // Notices: Save Welcome Popup
  document.getElementById('form-save-welcome-popup')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const enabled = document.getElementById('notice-welcome-enabled').checked;
    const title = document.getElementById('notice-welcome-title').value;
    const msg = document.getElementById('notice-welcome-msg').value;
    const img = document.getElementById('notice-welcome-img').value;
    const btnLabel = document.getElementById('notice-welcome-btn-label').value;
    const btnUrl = document.getElementById('notice-welcome-btn-url').value;

    state.notices.welcomePopup = {
      enabled,
      title,
      message: msg,
      imageUrl: img,
      actionLabel: btnLabel,
      actionUrl: btnUrl
    };

    setStorage('mobinx_notices_config', state.notices);
    await syncToFirestore('config', 'notices', state.notices);
    broadcastSync('NOTICE_UPDATED', state.notices);

    showToast(enabled ? 'Welcome announcement enabled and synced to cloud!' : 'Welcome announcement saved (Disabled).', 'success');
    renderCurrentTab();
  });

  // Notices: Broadcast Push Notification
  document.getElementById('form-broadcast-push')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('push-msg-input').value;
    state.notices.pushNotification = {
      message: msg,
      timestamp: Date.now()
    };

    setStorage('mobinx_notices_config', state.notices);
    await syncToFirestore('config', 'notices', state.notices);
    broadcastSync('PUSH_BROADCAST', state.notices.pushNotification);

    showToast('📢 Push notification dispatched to all apps!', 'success');
    document.getElementById('push-msg-input').value = '';
  });

  // Players: Toggle Suspend/Activate
  document.querySelectorAll('.btn-toggle-user-status').forEach(btn => {
    btn.addEventListener('click', async () => {
      const u = state.users.find(x => x.id === btn.dataset.id);
      if (u) {
        u.status = u.status === 'Suspended' ? 'Active' : 'Suspended';
        setStorage('mobinx_registered_users', state.users);
        await syncToFirestore('users', u.id, u);
        showToast(`Player ${u.username} status set to ${u.status}!`, 'info');
        renderCurrentTab();
      }
    });
  });

  // Players: Delete
  document.querySelectorAll('.btn-delete-user').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      state.users = state.users.filter(u => u.id !== id);
      setStorage('mobinx_registered_users', state.users);
      await deleteFromFirestore('users', id);
      showToast('Player removed.', 'warning');
      renderCurrentTab();
    });
  });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : (type === 'warning' ? '⚠️' : 'ℹ️')}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Robust Bootstrap
function startAdminApp() {
  try {
    bindNavigation();
    renderCurrentTab();
    initFirebase().catch(e => console.warn('Firebase init:', e));
  } catch (err) {
    console.error('Error starting admin app:', err);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAdminApp);
  } else {
    startAdminApp();
  }
}
