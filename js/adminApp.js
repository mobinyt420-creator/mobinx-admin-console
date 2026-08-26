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
// 2. DATA STORES (Tournaments, Downloads, etc.)
// ==========================================
const defaultTournaments = [
  {
    id: "tourn-1",
    title: "Battle Royale Squad Cup #44",
    mode: "Squad (4v4)",
    map: "Bermuda Remastered",
    matchTime: "09:30 PM Today",
    prizePool: "৳1,500",
    entryFee: "Free",
    status: "UPCOMING",
    slotsTotal: 48,
    slotsFilled: 24,
    banner: "assets/images/banner_esports.jpg",
    isRoomReleased: true,
    roomId: "MX-88942",
    roomPass: "1234",
    participants: [
      { playerName: "Mobin_Gamer99", ffUid: "2894192841", phone: "01812345678", slot: 1 },
      { playerName: "Tanvir_Sniper", ffUid: "1092837482", phone: "01799887766", slot: 2 },
      { playerName: "Shanto_Headshot", ffUid: "9283746152", phone: "01611223344", slot: 3 },
      { playerName: "Rifat_Booyah", ffUid: "4829104829", phone: "01933445566", slot: 4 }
    ]
  },
  {
    id: "tourn-2",
    title: "Clash Squad Pro League Final",
    mode: "CS 4v4",
    map: "Kalahari",
    matchTime: "10:30 PM Tonight",
    prizePool: "৳2,500",
    entryFee: "৳50",
    status: "UPCOMING",
    slotsTotal: 8,
    slotsFilled: 6,
    banner: "assets/images/banner_esports.jpg",
    isRoomReleased: false,
    roomId: "",
    roomPass: "",
    participants: [
      { playerName: "Sakib_Rusher", ffUid: "3392810485", phone: "01522334455", slot: 1 },
      { playerName: "Mehedi_Ghost", ffUid: "8829104928", phone: "01344556677", slot: 2 }
    ]
  }
];

const defaultDownloads = [
  {
    id: "apk-1",
    title: "Mobin VIP Sensitivity Regedit Pro",
    category: "Mobin APK",
    version: "v4.2.0",
    downloadsCount: "2.4K",
    rating: 5.0,
    videoId: "w7ejDZ8SWv8",
    icon: "https://img.youtube.com/vi/w7ejDZ8SWv8/hqdefault.jpg",
    actionButtons: [
      { label: "Download APK File", url: "https://mrmobin.blogspot.com/" },
      { label: "Join Telegram VIP", url: "https://t.me/mrmobin1m" }
    ]
  },
  {
    id: "apk-2",
    title: "Anti-Lag 120 FPS Fast Game Booster",
    category: "Tools",
    version: "v2.1.8",
    downloadsCount: "1.8K",
    rating: 4.9,
    videoId: "dQw4w9WgXcQ",
    icon: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    actionButtons: [
      { label: "Download APK", url: "https://mrmobin.blogspot.com/" }
    ]
  }
];

const defaultFlashDeals = [
  { id: "flash-1", badge: "100% BONUS", diamondAmount: "100 DIAMONDS", price: "৳ 80.00", bonus: "+100 Free" },
  { id: "flash-2", badge: "POPULAR", diamondAmount: "310 DIAMONDS", price: "৳ 270.00", bonus: "+31 Free" },
  { id: "flash-3", badge: "BEST VALUE", diamondAmount: "520 DIAMONDS", price: "৳ 420.00", bonus: "+52 Free" },
  { id: "flash-4", badge: "LIMITED", diamondAmount: "1060 DIAMONDS", price: "৳ 820.00", bonus: "+106 Free" },
  { id: "flash-5", badge: "MEGA DEAL", diamondAmount: "2180 DIAMONDS", price: "৳ 1650.00", bonus: "+218 Free" }
];

const defaultHeroBanners = [
  { id: "banner-1", title: "Free Fire Esports Tournament Season 4", image: "assets/images/banner_esports.jpg", actionRoute: "tournaments" },
  { id: "banner-2", title: "Diamond Top-Up 2x Instant Delivery", image: "assets/images/banner_topup.jpg", actionRoute: "topup" },
  { id: "banner-3", title: "Pro Sensitivity Maker & DPI Calculator", image: "assets/images/banner_sensitivity.jpg", actionRoute: "sensitivity" }
];

const defaultUrls = {
  topupWebview: "https://shop.garena.my/app",
  shopWebview: "https://shop2game.com/",
  telegram: "https://t.me/mrmobin1m",
  whatsappSupport: "https://wa.me/8801812345678",
  youtubeChannel: "https://youtube.com/@MrMobinYT"
};

const defaultUsers = [
  { id: "MX-884920", username: "Mobin_Admin", fullName: "Mr. Mobin (Admin)", email: "mobinyt420@gmail.com", phone: "01812345678", ffUid: "2894192841", role: "ADMIN", status: "Active", walletBalance: 2500 },
  { id: "MX-392810", username: "Tanvir_Sniper", fullName: "Tanvir Hossain", email: "tanvir.ff@gmail.com", phone: "01799887766", ffUid: "1092837482", role: "VIP MEMBER", status: "Active", walletBalance: 450 },
  { id: "MX-748291", username: "Shanto_Headshot", fullName: "Nazmul Shanto", email: "shanto.gaming@gmail.com", phone: "01611223344", ffUid: "9283746152", role: "VIP MEMBER", status: "Active", walletBalance: 820 },
  { id: "MX-551928", username: "Rifat_Booyah", fullName: "Rifat Ahmed", email: "rifat.booyah99@gmail.com", phone: "01933445566", ffUid: "4829104829", role: "MEMBER", status: "Active", walletBalance: 120 }
];

// Helper to load or persist
function getStorage(key, defaultVal) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}
function setStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

let state = {
  activeTab: 'overview',
  tournaments: getStorage('mobinx_tournaments_data', defaultTournaments),
  downloads: getStorage('mobinx_downloads_catalog', defaultDownloads),
  flashDeals: getStorage('mobinx_flash_deals', defaultFlashDeals),
  heroBanners: getStorage('mobinx_hero_banners', defaultHeroBanners),
  systemUrls: getStorage('mobinx_custom_urls', defaultUrls),
  users: getStorage('mobinx_registered_users', defaultUsers),
  noticeTicker: getStorage('mobinx_marquee_notice', '⚡ Welcome to Mobin X Gaming Ecosystem! Top up diamonds safely and join daily custom tournaments! 🏆')
};

// Toast notification helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'danger' ? '❌' : 'ℹ️'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================
// 3. TAB RENDERERS
// ==========================================

// Tab: Overview
function renderOverview() {
  const totalUsers = state.users.length;
  const totalTournaments = state.tournaments.length;
  const totalJoined = state.tournaments.reduce((acc, t) => acc + (t.slotsFilled || (t.participants ? t.participants.length : 0)), 0);
  const totalWallet = state.users.reduce((acc, u) => acc + (u.walletBalance || 0), 0);

  return `
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-label">Total Players / Users</div>
          <div class="stat-val">${totalUsers}</div>
          <div class="stat-trend up">↑ 14 active today</div>
        </div>
        <div class="stat-icon-wrapper" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa;">👥</div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-label">Active Tournaments</div>
          <div class="stat-val">${totalTournaments}</div>
          <div class="stat-trend up">${totalJoined} Joined Players</div>
        </div>
        <div class="stat-icon-wrapper" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">🏆</div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-label">Published APKs</div>
          <div class="stat-val">${state.downloads.length}</div>
          <div class="stat-trend neutral">4.2K+ Total Downloads</div>
        </div>
        <div class="stat-icon-wrapper" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">📥</div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <div class="stat-label">User Wallet Pool</div>
          <div class="stat-val">৳${totalWallet}</div>
          <div class="stat-trend up">Live Available Balance</div>
        </div>
        <div class="stat-icon-wrapper" style="background: rgba(139, 92, 246, 0.15); color: #a78bfa;">💎</div>
      </div>
    </div>

    <!-- Quick Actions Banner -->
    <div class="card" style="border-left: 4px solid var(--cyan);">
      <div class="card-header">
        <div>
          <div class="card-title">⚡ Instant App Live Synchronization</div>
          <div class="card-subtitle">Every change made here pushes instantly to your Mobin X App within milliseconds via Firebase Realtime & Broadcast bus.</div>
        </div>
        <button class="btn btn-primary" id="btn-quick-schedule-tourn">➕ Schedule Tournament</button>
      </div>
    </div>
  `;
}

// Tab: Tournaments & Custom Rooms
function renderTournaments() {
  return `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">🏆 Schedule & Publish Match</div>
          <div class="card-subtitle">New tournaments appear immediately in the Mobin X App Tournaments tab.</div>
        </div>
      </div>

      <form id="form-add-tournament">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Tournament Title</label>
            <input type="text" id="new-t-title" class="form-control" placeholder="e.g. BR Squad Championship #45" required />
          </div>
          <div class="form-group">
            <label class="form-label">Game Mode</label>
            <input type="text" id="new-t-mode" class="form-control" placeholder="Squad (4v4) / Solo / Duo" value="Squad (4v4)" required />
          </div>
          <div class="form-group">
            <label class="form-label">Map</label>
            <input type="text" id="new-t-map" class="form-control" placeholder="Bermuda / Purgatory" value="Bermuda Remastered" required />
          </div>
          <div class="form-group">
            <label class="form-label">Match Time</label>
            <input type="text" id="new-t-time" class="form-control" placeholder="e.g. 09:30 PM Today" value="09:30 PM Today" required />
          </div>
          <div class="form-group">
            <label class="form-label">Prize Pool</label>
            <input type="text" id="new-t-prize" class="form-control" placeholder="e.g. ৳1,500" value="৳1,500" required />
          </div>
          <div class="form-group">
            <label class="form-label">Entry Fee</label>
            <input type="text" id="new-t-entry" class="form-control" placeholder="Free or ৳50" value="Free" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary">🚀 Publish Tournament to App</button>
      </form>
    </div>

    <!-- Active Tournaments List -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">🎮 Active Tournaments & Room Credential Releaser</div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${state.tournaments.map(t => {
          const participants = t.participants || [];
          return `
            <div style="background: var(--bg-card-hover); border: 1px solid ${t.isRoomReleased ? 'var(--success)' : 'var(--border-color)'}; border-radius: var(--radius-md); padding: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div>
                  <h3 style="font-size: 15px; font-weight: 800; color: #ffffff;">${t.title}</h3>
                  <p style="font-size: 12px; color: var(--text-muted);">${t.mode} • ${t.map} • Time: <strong>${t.matchTime}</strong> • Prize: <strong>${t.prizePool}</strong></p>
                </div>
                <span style="padding: 4px 10px; border-radius: var(--radius-full); font-size: 11px; font-weight: 800; ${t.isRoomReleased ? 'background: rgba(16, 185, 129, 0.2); color: #34d399;' : 'background: rgba(245, 158, 11, 0.2); color: #fbbf24;'}">
                  ${t.isRoomReleased ? '🟢 ROOM ID RELEASED' : '⏳ WAITING FOR ROOM'}
                </span>
              </div>

              <!-- Registered Players Details -->
              <details style="margin: 10px 0; background: var(--bg-card); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 12px;">
                <summary style="font-weight: 700; color: var(--cyan); cursor: pointer;">
                  👥 Registered Players (${participants.length} / ${t.slotsTotal || 48})
                </summary>
                <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 6px;">
                  ${participants.length === 0 ? '<div style="color: var(--text-sub);">No players registered yet.</div>' : ''}
                  ${participants.map((p, idx) => `
                    <div style="display: flex; justify-content: space-between; padding: 6px 10px; background: var(--bg-input); border-radius: 4px; font-size: 11.5px;">
                      <span><strong>#${p.slot || idx + 1}</strong> ${p.playerName || 'Player'}</span>
                      <span style="color: var(--text-muted);">UID: <strong>${p.ffUid || 'N/A'}</strong> | Phone: ${p.phone || 'N/A'}</span>
                    </div>
                  `).join('')}
                </div>
              </details>

              <!-- Real-time Custom Room Releaser -->
              <div class="room-releaser-box">
                <div style="font-size: 12.5px; font-weight: 800; color: #34d399; margin-bottom: 8px;">🔑 Real-Time Room ID & Password Release</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
                  <input type="text" class="form-control room-id-input" data-id="${t.id}" placeholder="Room ID (e.g. 884920)" value="${t.roomId || ''}" />
                  <input type="text" class="form-control room-pass-input" data-id="${t.id}" placeholder="Password (e.g. 1234)" value="${t.roomPass || ''}" />
                </div>
                <button class="btn btn-success btn-release-room-now" data-id="${t.id}" style="width: 100%;">
                  ⚡ Release Credentials to Players Now
                </button>
              </div>

              <div style="text-align: right; margin-top: 10px;">
                <button class="btn btn-danger btn-delete-tourn" data-id="${t.id}" style="padding: 6px 12px; font-size: 11.5px;">
                  🗑️ Delete Match
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// Tab: APK Downloads
function renderDownloads() {
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title">📥 Add New APK / Config Download</div>
      </div>

      <form id="form-add-download">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">APK / Title Name</label>
            <input type="text" id="new-d-title" class="form-control" placeholder="e.g. Mobin VIP Auto Headshot Macro APK" required />
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select id="new-d-category" class="form-control">
              <option value="Mobin APK">Mobin APK</option>
              <option value="Tools">Gaming Tools</option>
              <option value="Proxy Booster">Proxy Booster</option>
              <option value="Config">Sensitivity Config</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">YouTube Video ID / URL</label>
            <input type="text" id="new-d-videoid" class="form-control" placeholder="e.g. w7ejDZ8SWv8 or full URL" />
          </div>
          <div class="form-group">
            <label class="form-label">Download Target Link</label>
            <input type="url" id="new-d-url" class="form-control" placeholder="https://mrmobin.blogspot.com/" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary">🚀 Publish Download File</button>
      </form>
    </div>

    <!-- Catalog List -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">📱 Published Download Catalog</div>
      </div>
      <div>
        ${state.downloads.map(item => `
          <div class="item-card">
            <img src="${item.icon || 'https://img.youtube.com/vi/' + (item.videoId || 'dQw4w9WgXcQ') + '/hqdefault.jpg'}" alt="${item.title}" style="width: 70px; height: 50px; border-radius: var(--radius-sm); object-fit: cover;" />
            <div style="flex: 1;">
              <h4 style="font-size: 13.5px; font-weight: 700; color: #ffffff;">${item.title}</h4>
              <p style="font-size: 11px; color: var(--text-muted);">${item.category} • ${item.downloadsCount || '1K+'} Downloads</p>
            </div>
            <button class="btn btn-danger btn-delete-download" data-id="${item.id}">🗑️</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Tab: Flash Deals
function renderFlashDeals() {
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title">⚡ Flash Diamond Deals (Home Ticker)</div>
      </div>

      <form id="form-add-flash">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Diamond Amount</label>
            <input type="text" id="new-f-diamonds" class="form-control" placeholder="520 DIAMONDS" required />
          </div>
          <div class="form-group">
            <label class="form-label">Price (BDT)</label>
            <input type="text" id="new-f-price" class="form-control" placeholder="৳ 420.00" required />
          </div>
          <div class="form-group">
            <label class="form-label">Badge Label</label>
            <input type="text" id="new-f-badge" class="form-control" placeholder="BEST VALUE / POPULAR" value="POPULAR" />
          </div>
          <div class="form-group">
            <label class="form-label">Bonus Label</label>
            <input type="text" id="new-f-bonus" class="form-control" placeholder="+52 Free" value="+50 Free" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary">➕ Add Flash Deal</button>
      </form>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">💎 Active Deals in App</div>
      </div>
      <div>
        ${state.flashDeals.map(d => `
          <div class="item-card">
            <div>
              <span style="font-size: 14px; font-weight: 800; color: #ffffff;">💎 ${d.diamondAmount}</span>
              <span style="background: rgba(236, 72, 153, 0.2); color: #f472b6; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">${d.badge}</span>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Price: <strong>${d.price}</strong> | Bonus: ${d.bonus}</div>
            </div>
            <button class="btn btn-danger btn-delete-flash" data-id="${d.id}">🗑️</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Tab: Hero Banners
function renderBanners() {
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title">🖼️ Add / Update Hero Banners (16:9 Slider)</div>
      </div>

      <form id="form-add-banner">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Banner Title</label>
            <input type="text" id="new-b-title" class="form-control" placeholder="Special Season 4 Championship" required />
          </div>
          <div class="form-group">
            <label class="form-label">Image URL</label>
            <input type="text" id="new-b-image" class="form-control" placeholder="assets/images/banner_esports.jpg or https://..." required />
          </div>
          <div class="form-group">
            <label class="form-label">Action Route</label>
            <select id="new-b-route" class="form-control">
              <option value="tournaments">Tournaments</option>
              <option value="topup">Diamond Top-Up</option>
              <option value="sensitivity">Sensitivity Maker</option>
              <option value="shop">Gaming Shop</option>
            </select>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">➕ Publish Banner</button>
      </form>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Active Banners on Home Screen</div>
      </div>
      <div>
        ${state.heroBanners.map(b => `
          <div class="item-card">
            <img src="${b.image}" alt="${b.title || 'Banner'}" style="width: 100px; height: 56px; border-radius: var(--radius-sm); object-fit: cover;" onerror="this.src='https://placehold.co/600x338/0f172a/3b82f6?text=Mobin+X';" />
            <div style="flex: 1;">
              <h4 style="font-size: 13.5px; font-weight: 700; color: #ffffff;">${b.title || 'Hero Banner'}</h4>
              <p style="font-size: 11px; color: var(--cyan);">Route: ${b.actionRoute || 'tournaments'}</p>
            </div>
            <button class="btn btn-danger btn-delete-banner" data-id="${b.id}">🗑️</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Tab: System URLs & Notice Marquee
function renderSystemUrls() {
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title">📢 Notice Marquee Ticker (Top Notice)</div>
      </div>
      <form id="form-update-notice">
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label">Scrolling Text on App Top Banner</label>
          <textarea id="input-notice-ticker" class="form-control">${state.noticeTicker}</textarea>
        </div>
        <button type="submit" class="btn btn-primary">⚡ Push Live Notice Update</button>
      </form>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">🌐 External URLs & Support Gateways</div>
      </div>
      <form id="form-update-urls">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Diamond Top-Up Webview URL</label>
            <input type="url" id="url-topup" class="form-control" value="${state.systemUrls.topupWebview || ''}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Gaming Shop Webview URL</label>
            <input type="url" id="url-shop" class="form-control" value="${state.systemUrls.shopWebview || ''}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Official Telegram Channel</label>
            <input type="url" id="url-telegram" class="form-control" value="${state.systemUrls.telegram || ''}" required />
          </div>
          <div class="form-group">
            <label class="form-label">WhatsApp 24/7 Support URL</label>
            <input type="url" id="url-whatsapp" class="form-control" value="${state.systemUrls.whatsappSupport || ''}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Official YouTube Channel</label>
            <input type="url" id="url-youtube" class="form-control" value="${state.systemUrls.youtubeChannel || ''}" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary">💾 Save URLs & Sync to App</button>
      </form>
    </div>
  `;
}

// Tab: Users & Players
function renderUsers() {
  return `
    <div class="card">
      <div class="card-header">
        <div class="card-title">➕ Quick Register User / Inject Balance</div>
      </div>
      <form id="form-add-user">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Player Full Name</label>
            <input type="text" id="new-u-name" class="form-control" placeholder="Shanto Ahmed" required />
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number</label>
            <input type="text" id="new-u-phone" class="form-control" placeholder="01711223344" required />
          </div>
          <div class="form-group">
            <label class="form-label">Free Fire UID</label>
            <input type="text" id="new-u-uid" class="form-control" placeholder="198273918" required />
          </div>
          <div class="form-group">
            <label class="form-label">Initial Balance (৳)</label>
            <input type="number" id="new-u-balance" class="form-control" placeholder="100" value="100" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary">➕ Register Player</button>
      </form>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">👥 Registered Players List (${state.users.length})</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${state.users.map(u => `
          <div class="item-card">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 800; color: #ffffff;">${u.fullName || u.username}</span>
                <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); ${u.role === 'ADMIN' ? 'background: rgba(239, 68, 68, 0.2); color: #f87171;' : 'background: rgba(59, 130, 246, 0.2); color: #60a5fa;'}">${u.role}</span>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                UID: <strong>${u.ffUid || 'N/A'}</strong> | Phone: ${u.phone || 'N/A'} | Balance: <strong style="color:#34d399;">৳${u.walletBalance || 0}</strong>
              </div>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-add-user-bal" data-id="${u.id}" style="padding: 4px 8px; font-size: 11px;">+৳100</button>
              <button class="btn btn-danger btn-delete-user" data-id="${u.id}" style="padding: 4px 8px; font-size: 11px;">🗑️</button>
            </div>
          </div>
        `).join('')}
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
      if (title) title.textContent = 'Hero Banners (Slider)';
      content.innerHTML = renderBanners();
      break;
    case 'urls':
      if (title) title.textContent = 'Notice Ticker & System URLs';
      content.innerHTML = renderSystemUrls();
      break;
    case 'users':
      if (title) title.textContent = 'Players & Users Management';
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

      // Mobile auto-close sidebar
      const sidebar = document.getElementById('admin-sidebar');
      if (sidebar && window.innerWidth <= 900) {
        sidebar.classList.remove('open');
      }
    });
  });

  // Mobile hamburger toggle
  document.getElementById('mobile-toggle-btn')?.addEventListener('click', () => {
    const sidebar = document.getElementById('admin-sidebar');
    sidebar?.classList.toggle('open');
  });
}

function bindCurrentTabEvents() {
  // Overview: Quick schedule button
  document.getElementById('btn-quick-schedule-tourn')?.addEventListener('click', () => {
    document.querySelector('.nav-item[data-tab="tournaments"]')?.click();
  });

  // Tournaments: Add new match
  const formTourn = document.getElementById('form-add-tournament');
  formTourn?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newT = {
      id: 'tourn-' + Date.now(),
      title: document.getElementById('new-t-title').value.trim(),
      mode: document.getElementById('new-t-mode').value.trim(),
      map: document.getElementById('new-t-map').value.trim(),
      matchTime: document.getElementById('new-t-time').value.trim(),
      prizePool: document.getElementById('new-t-prize').value.trim(),
      entryFee: document.getElementById('new-t-entry').value.trim(),
      status: 'UPCOMING',
      slotsTotal: 48,
      slotsFilled: 0,
      banner: 'assets/images/banner_esports.jpg',
      isRoomReleased: false,
      roomId: '',
      roomPass: '',
      participants: []
    };

    state.tournaments.unshift(newT);
    setStorage('mobinx_tournaments_data', state.tournaments);
    await syncToFirestore('tournaments', newT.id, newT);

    broadcastSync('TOURNAMENTS_UPDATED', newT);
    showToast('Tournament scheduled and pushed to App in real time!', 'success');
    renderCurrentTab();
  });

  // Tournaments: Release Room ID & Password
  document.querySelectorAll('.btn-release-room-now').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tournId = btn.dataset.id;
      const idInput = document.querySelector(`.room-id-input[data-id="${tournId}"]`);
      const passInput = document.querySelector(`.room-pass-input[data-id="${tournId}"]`);

      const roomId = idInput?.value.trim();
      const roomPass = passInput?.value.trim();

      if (!roomId || !roomPass) {
        showToast('Please provide both Room ID and Password!', 'danger');
        return;
      }

      const match = state.tournaments.find(t => t.id === tournId);
      if (match) {
        match.isRoomReleased = true;
        match.roomId = roomId;
        match.roomPass = roomPass;
        setStorage('mobinx_tournaments_data', state.tournaments);

        await syncToFirestore('tournaments', match.id, match);
        broadcastSync('ROOM_RELEASED', { id: match.id, title: match.title, roomId, roomPass });

        showToast(`🔑 Room ID ${roomId} released to app players!`, 'success');
        renderCurrentTab();
      }
    });
  });

  // Tournaments: Delete
  document.querySelectorAll('.btn-delete-tourn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tournId = btn.dataset.id;
      state.tournaments = state.tournaments.filter(t => t.id !== tournId);
      setStorage('mobinx_tournaments_data', state.tournaments);
      await deleteFromFirestore('tournaments', tournId);
      broadcastSync('TOURNAMENTS_UPDATED', {});
      showToast('Tournament deleted.', 'warning');
      renderCurrentTab();
    });
  });

  // Downloads: Add
  document.getElementById('form-add-download')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('new-d-title').value.trim();
    const category = document.getElementById('new-d-category').value;
    const rawVideo = document.getElementById('new-d-videoid').value.trim();
    const url = document.getElementById('new-d-url').value.trim();

    let videoId = rawVideo;
    if (videoId.includes('watch?v=')) videoId = videoId.split('watch?v=')[1].split('&')[0];
    else if (videoId.includes('youtu.be/')) videoId = videoId.split('youtu.be/')[1].split('?')[0];

    const newItem = {
      id: 'apk-' + Date.now(),
      title,
      category,
      videoId,
      icon: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      downloadsCount: '1.0K',
      rating: 5.0,
      actionButtons: [
        { label: 'Download APK File', url }
      ]
    };

    state.downloads.unshift(newItem);
    setStorage('mobinx_downloads_catalog', state.downloads);
    await syncToFirestore('downloads', newItem.id, newItem);
    broadcastSync('DOWNLOADS_UPDATED', newItem);
    showToast('Download APK published to app!', 'success');
    renderCurrentTab();
  });

  // Downloads: Delete
  document.querySelectorAll('.btn-delete-download').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      state.downloads = state.downloads.filter(d => d.id !== id);
      setStorage('mobinx_downloads_catalog', state.downloads);
      await deleteFromFirestore('downloads', id);
      broadcastSync('DOWNLOADS_UPDATED', {});
      showToast('Download item removed.', 'warning');
      renderCurrentTab();
    });
  });

  // Flash Deals: Add
  document.getElementById('form-add-flash')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newDeal = {
      id: 'flash-' + Date.now(),
      diamondAmount: document.getElementById('new-f-diamonds').value.trim(),
      price: document.getElementById('new-f-price').value.trim(),
      badge: document.getElementById('new-f-badge').value.trim() || 'POPULAR',
      bonus: document.getElementById('new-f-bonus').value.trim()
    };
    state.flashDeals.push(newDeal);
    setStorage('mobinx_flash_deals', state.flashDeals);
    await syncToFirestore('flashDeals', newDeal.id, newDeal);
    broadcastSync('FLASH_DEALS_UPDATED', newDeal);
    showToast('Flash deal added to app!', 'success');
    renderCurrentTab();
  });

  // Flash Deals: Delete
  document.querySelectorAll('.btn-delete-flash').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      state.flashDeals = state.flashDeals.filter(d => d.id !== id);
      setStorage('mobinx_flash_deals', state.flashDeals);
      await deleteFromFirestore('flashDeals', id);
      broadcastSync('FLASH_DEALS_UPDATED', {});
      showToast('Flash deal removed.', 'warning');
      renderCurrentTab();
    });
  });

  // Banners: Add
  document.getElementById('form-add-banner')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newBanner = {
      id: 'banner-' + Date.now(),
      title: document.getElementById('new-b-title').value.trim(),
      image: document.getElementById('new-b-image').value.trim(),
      actionRoute: document.getElementById('new-b-route').value
    };
    state.heroBanners.unshift(newBanner);
    setStorage('mobinx_hero_banners', state.heroBanners);
    await syncToFirestore('banners', newBanner.id, newBanner);
    broadcastSync('BANNERS_UPDATED', newBanner);
    showToast('Hero banner published to app slider!', 'success');
    renderCurrentTab();
  });

  // Banners: Delete
  document.querySelectorAll('.btn-delete-banner').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      state.heroBanners = state.heroBanners.filter(b => b.id !== id);
      setStorage('mobinx_hero_banners', state.heroBanners);
      await deleteFromFirestore('banners', id);
      broadcastSync('BANNERS_UPDATED', {});
      showToast('Banner removed.', 'warning');
      renderCurrentTab();
    });
  });

  // Notice Ticker
  document.getElementById('form-update-notice')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ticker = document.getElementById('input-notice-ticker').value.trim();
    state.noticeTicker = ticker;
    setStorage('mobinx_marquee_notice', ticker);
    await syncToFirestore('config', 'system', { marquee: ticker });
    broadcastSync('NOTICE_UPDATED', { marquee: ticker });
    showToast('Scrolling notice pushed to app!', 'success');
  });

  // System URLs
  document.getElementById('form-update-urls')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const urls = {
      topupWebview: document.getElementById('url-topup').value.trim(),
      shopWebview: document.getElementById('url-shop').value.trim(),
      telegram: document.getElementById('url-telegram').value.trim(),
      whatsappSupport: document.getElementById('url-whatsapp').value.trim(),
      youtubeChannel: document.getElementById('url-youtube').value.trim()
    };
    state.systemUrls = urls;
    setStorage('mobinx_custom_urls', urls);
    await syncToFirestore('config', 'system', { urls });
    broadcastSync('URLS_UPDATED', urls);
    showToast('System URLs saved and synced across entire ecosystem!', 'success');
  });

  // Users: Add User
  document.getElementById('form-add-user')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newUser = {
      id: 'MX-' + Math.floor(100000 + Math.random() * 900000),
      username: document.getElementById('new-u-name').value.trim().replace(/\s+/g, '_'),
      fullName: document.getElementById('new-u-name').value.trim(),
      phone: document.getElementById('new-u-phone').value.trim(),
      ffUid: document.getElementById('new-u-uid').value.trim(),
      walletBalance: Number(document.getElementById('new-u-balance').value) || 0,
      role: 'MEMBER',
      status: 'Active'
    };
    state.users.unshift(newUser);
    setStorage('mobinx_registered_users', state.users);
    await syncToFirestore('users', newUser.id, newUser);
    showToast('Player registered and balance credited!', 'success');
    renderCurrentTab();
  });

  // Users: Add +৳100
  document.querySelectorAll('.btn-add-user-bal').forEach(btn => {
    btn.addEventListener('click', async () => {
      const u = state.users.find(x => x.id === btn.dataset.id);
      if (u) {
        u.walletBalance = (u.walletBalance || 0) + 100;
        setStorage('mobinx_registered_users', state.users);
        await syncToFirestore('users', u.id, u);
        showToast(`৳100 added to ${u.fullName || u.username}'s wallet!`, 'success');
        renderCurrentTab();
      }
    });
  });

  // Users: Delete
  document.querySelectorAll('.btn-delete-user').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      state.users = state.users.filter(u => u.id !== id);
      setStorage('mobinx_registered_users', state.users);
      await deleteFromFirestore('users', id);
      showToast('User removed.', 'warning');
      renderCurrentTab();
    });
  });
}

// Robust Bootstrap (Runs immediately if DOM is already parsed)
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

