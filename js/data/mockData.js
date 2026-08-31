import { APP_CONFIG_URLS } from '../config/urls.js';

/**
 * MOBIN X - Central Data Store (Firebase / Firestore Ready Schema)
 * All UI components consume this structured dataset.
 */

export const appUrls = {
  topup: APP_CONFIG_URLS.TOPUP_URL,
  shop: APP_CONFIG_URLS.SHOP_URL,
  downloads: APP_CONFIG_URLS.BLOG_URL,
  telegram: APP_CONFIG_URLS.TELEGRAM_URL,
  youtube: APP_CONFIG_URLS.YOUTUBE_CHANNEL_URL
};

export const defaultUser = {
  id: "MX-GUEST",
  username: "Guest_Player",
  email: "guest@mobinx.app",
  avatar: "assets/images/avatar_user.jpg",
  role: "Guest Player",
  isAdmin: false,
  level: 1,
  walletBalance: 0,
  referralCode: "MOBINX",
  referralEarnings: 0,
  stats: {
    tournamentsJoined: 0,
    totalDownloads: 0,
    savedSensitivities: 0,
    referralsCount: 0
  }
};

/**
 * Hero Banners (16:9 Aspect Ratio)
 */
export const heroBanners = [
  {
    id: "banner-1",
    badge: "SEASON 17",
    title: "BOOYAH PASS",
    subtitle: "UNLOCK EXCLUSIVE REWARDS!",
    ctaText: "GET IT NOW",
    image: "assets/images/banner_booyah.jpg",
    actionRoute: "topup",
    actionPayload: { url: appUrls.topup }
  },
  {
    id: "banner-2",
    badge: "GRAND FINALS",
    title: "GLOBAL ESPORTS CUP",
    subtitle: "$10,000 PRIZE POOL TOURNAMENT",
    ctaText: "REGISTER SQUAD",
    image: "assets/images/banner_esports.jpg",
    actionRoute: "tournaments",
    actionPayload: { filter: "upcoming" }
  },
  {
    id: "banner-3",
    badge: "COMMUNITY",
    title: "JOIN TELEGRAM CHANNEL",
    subtitle: "DAILY FREE FIRE REDEEM CODES & UPDATES",
    ctaText: "JOIN NOW",
    image: "assets/images/banner_referral.jpg",
    actionRoute: "referral",
    actionPayload: {}
  }
];

/**
 * Quick Service Category Row (Exactly 4 Visible Categories in V1)
 */
export const quickCategories = [
  {
    id: "topup",
    title: "Top Up",
    icon: "diamond",
    color: "#2563eb",
    bgGradient: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    route: "topup",
    url: appUrls.topup
  },
  {
    id: "shop",
    title: "Shop",
    icon: "bag",
    color: "#7c3aed",
    bgGradient: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
    route: "shop",
    url: appUrls.shop
  },
  {
    id: "downloads",
    title: "Downloads",
    icon: "cloud-download",
    color: "#10b981",
    bgGradient: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
    route: "downloads"
  },
  {
    id: "tournaments",
    title: "Tournaments",
    icon: "trophy",
    color: "#f59e0b",
    bgGradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    route: "tournaments"
  }
];

/**
 * Popular Services (3-Column Grid, 1:1 Images, White Labels)
 */
export const popularServices = [
  {
    id: "topup",
    title: "TOP UP",
    image: "assets/images/service_topup.jpg",
    route: "topup",
    accentColor: "#2563eb"
  },
  {
    id: "shop",
    title: "SHOP",
    image: "assets/images/service_shop.jpg",
    route: "shop",
    accentColor: "#7c3aed"
  },
  {
    id: "downloads",
    title: "DOWNLOADS",
    image: "assets/images/service_downloads.jpg",
    route: "downloads",
    accentColor: "#10b981"
  },
  {
    id: "tournaments",
    title: "TOURNAMENTS",
    image: "assets/images/service_tournaments.jpg",
    route: "tournaments",
    accentColor: "#ea580c"
  },
  {
    id: "sensitivity",
    title: "SENSITIVITY MAKER",
    image: "assets/images/service_sensitivity.jpg",
    route: "sensitivity",
    accentColor: "#0284c7"
  },
  {
    id: "profile",
    title: "PROFILE",
    image: "assets/images/service_profile.jpg",
    route: "profile",
    accentColor: "#9333ea"
  }
];

/**
 * Flash Diamond Top Up Products
 */
export const flashSaleProducts = [
  {
    id: "flash-1",
    badge: "100% BONUS",
    badgeColor: "#ec4899",
    diamondAmount: "100 DIAMONDS",
    diamonds: 100,
    price: "৳ 80.00",
    priceNumber: 80.00,
    originalPrice: "৳ 120.00",
    bonus: "+100 Free",
    btnStyle: "gold",
    icon: "💎"
  },
  {
    id: "flash-2",
    badge: "POPULAR",
    badgeColor: "#e11d48",
    diamondAmount: "310 DIAMONDS",
    diamonds: 310,
    price: "৳ 270.00",
    priceNumber: 270.00,
    originalPrice: "৳ 350.00",
    bonus: "+31 Free",
    btnStyle: "navy",
    icon: "💎"
  },
  {
    id: "flash-3",
    badge: "BEST VALUE",
    badgeColor: "#db2777",
    diamondAmount: "520 DIAMONDS",
    diamonds: 520,
    price: "৳ 420.00",
    priceNumber: 420.00,
    originalPrice: "৳ 550.00",
    bonus: "+52 Free",
    btnStyle: "gold",
    icon: "💎"
  },
  {
    id: "flash-4",
    badge: "LIMITED",
    badgeColor: "#dc2626",
    diamondAmount: "1060 DIAMONDS",
    diamonds: 1060,
    price: "৳ 820.00",
    priceNumber: 820.00,
    originalPrice: "৳ 1100.00",
    bonus: "+106 Free",
    btnStyle: "gold",
    icon: "💎"
  },
  {
    id: "flash-5",
    badge: "MEGA DEAL",
    badgeColor: "#7c3aed",
    diamondAmount: "2180 DIAMONDS",
    diamonds: 2180,
    price: "৳ 1650.00",
    priceNumber: 1650.00,
    originalPrice: "৳ 2200.00",
    bonus: "+218 Free",
    btnStyle: "navy",
    icon: "💎"
  },
  {
    id: "flash-6",
    badge: "VIP DEAL",
    badgeColor: "#2563eb",
    diamondAmount: "5600 DIAMONDS",
    diamonds: 5600,
    price: "৳ 4100.00",
    priceNumber: 4100.00,
    originalPrice: "৳ 5400.00",
    bonus: "+560 Free",
    btnStyle: "gold",
    icon: "💎"
  }
];

/**
 * Compact Promotional Mini Banners
 */
export const promoBanners = [
  {
    id: "promo-telegram",
    title: "JOIN OUR TELEGRAM",
    subtitle: "Get Latest Update First",
    bgClass: "promo-telegram-card",
    icon: "telegram",
    actionUrl: appUrls.telegram,
    actionType: "external"
  },
  {
    id: "promo-offers",
    title: "SPECIAL OFFERS",
    subtitle: "Don't Miss Out!",
    bgClass: "promo-offers-card",
    icon: "gift",
    actionRoute: "topup",
    actionType: "internal"
  }
];

/**
 * APK Downloads Catalog (YouTube Video Previews & Dynamic Action Buttons)
 */
export const downloadItems = [
  {
    id: "apk-1",
    title: "Mobin X Proxy Ultra Boost APK (Latest V2.8)",
    description: "High FPS unlocker, anti-lag optimization and network stabilizer for competitive esports matches.",
    category: "Mobin APK",
    version: "v2.8.4",
    size: "28.5 MB",
    downloadsCount: "185.4K",
    rating: 4.9,
    youtubeId: "dQw4w9WgXcQ",
    videoThumbnail: "assets/images/banner_booyah.jpg",
    videoDuration: "08:45",
    actionButtons: [
      { id: "act-1", label: "Proxy APK Download", icon: "download", type: "download", url: "https://mrmobin1m.blogspot.com" },
      { id: "act-2", label: "UID Unlock", icon: "key", type: "action", url: "https://mrmobin1m.blogspot.com" },
      { id: "act-3", label: "BTN Download", icon: "file", type: "download", url: "https://mrmobin1m.blogspot.com" },
      { id: "act-4", label: "Join Telegram", icon: "telegram", type: "external", url: appUrls.telegram }
    ]
  },
  {
    id: "apk-2",
    title: "Free Fire Max VIP Headshot Aim Configuration V4",
    description: "Verified recoil control & touch response calibration file with slow-motion tutorial guide.",
    category: "Tools",
    version: "v4.1.0",
    size: "14.2 MB",
    downloadsCount: "94.2K",
    rating: 4.8,
    youtubeId: "LXb3EKWsInQ",
    videoThumbnail: "assets/images/banner_esports.jpg",
    videoDuration: "12:10",
    actionButtons: [
      { id: "act-1", label: "Config APK Download", icon: "download", type: "download", url: "https://mrmobin1m.blogspot.com" },
      { id: "act-2", label: "UID Bypass Tool", icon: "shield", type: "action", url: "https://mrmobin1m.blogspot.com" },
      { id: "act-3", label: "Get Sound Pack", icon: "volume", type: "download", url: "https://mrmobin1m.blogspot.com" },
      { id: "act-4", label: "Join Telegram", icon: "telegram", type: "external", url: appUrls.telegram }
    ]
  },
  {
    id: "apk-3",
    title: "Mobin X Game Booster Pro Max (Universal Optimizer)",
    description: "Real-time RAM cleaner, GPU performance booster, and 120Hz display refresh lock for all devices.",
    category: "Premium Apps",
    version: "v3.0.2",
    size: "19.8 MB",
    downloadsCount: "230.1K",
    rating: 5.0,
    youtubeId: "5qap5aO4i9A",
    videoThumbnail: "assets/images/banner_referral.jpg",
    videoDuration: "06:30",
    actionButtons: [
      { id: "act-1", label: "Booster APK Download", icon: "download", type: "download", url: "https://mrmobin1m.blogspot.com" },
      { id: "act-2", label: "License Key Gen", icon: "key", type: "action", url: "https://mrmobin1m.blogspot.com" },
      { id: "act-3", label: "Join Telegram", icon: "telegram", type: "external", url: appUrls.telegram }
    ]
  }
];

/**
 * Esports Tournaments List
 */
export const tournamentsList = [
  {
    id: "tourn-1",
    status: "LIVE",
    title: "Mobin X Booyah Cup #44",
    gameMode: "Squad Battle Royale",
    entryFee: "FREE",
    prizePool: "৳ 25,000",
    date: "TODAY",
    time: "08:30 PM",
    slotsTotal: 48,
    slotsFilled: 44,
    map: "Bermuda",
    banner: "assets/images/banner_booyah.jpg",
    rules: "Mobile only (No emulators). Room ID sent 15 mins before start."
  },
  {
    id: "tourn-2",
    status: "UPCOMING",
    title: "All-Stars Clash Squad Championship",
    gameMode: "4v4 Clash Squad",
    entryFee: "50 Diamonds",
    prizePool: "৳ 50,000",
    date: "TOMORROW",
    time: "06:00 PM",
    slotsTotal: 32,
    slotsFilled: 18,
    map: "Kalahari",
    banner: "assets/images/banner_esports.jpg",
    rules: "Best of 7 rounds. Official referee in custom room."
  },
  {
    id: "tourn-3",
    status: "UPCOMING",
    title: "Weekend Solo Headshot Masters",
    gameMode: "Solo Headshot Only",
    entryFee: "FREE",
    prizePool: "৳ 10,000",
    date: "SATURDAY",
    time: "04:00 PM",
    slotsTotal: 50,
    slotsFilled: 22,
    map: "Purgatory",
    banner: "assets/images/banner_referral.jpg",
    rules: "Desert Eagle & M1887 headshots only. Top 3 win cash prizes."
  },
  {
    id: "tourn-4",
    status: "COMPLETED",
    title: "Mobin X Season 16 Grand Final",
    gameMode: "Squad Championship",
    entryFee: "FREE",
    prizePool: "৳ 100,000",
    date: "PAST EVENT",
    time: "09:00 PM",
    slotsTotal: 48,
    slotsFilled: 48,
    winner: "Team Apex Predators",
    map: "Bermuda",
    banner: "assets/images/banner_esports.jpg",
    rules: "Tournament concluded. Prize money dispatched to winner bKash/Nagad."
  }
];

export const notificationsList = [
  {
    id: "notif-1",
    type: "tournament",
    title: "Tournament Starting Soon!",
    desc: "Mobin X Booyah Cup #44 kicks off in 30 minutes. Be in room lobby on time.",
    timeAgo: "10m ago",
    unread: true,
    icon: "trophy",
    color: "#f59e0b"
  },
  {
    id: "notif-2",
    type: "topup",
    title: "Diamond Top Up Successful",
    desc: "520 Diamonds + 52 Bonus have been credited to Player ID 928194881 via noobtopup.com.",
    timeAgo: "2h ago",
    unread: true,
    icon: "diamond",
    color: "#2563eb"
  },
  {
    id: "notif-3",
    type: "download",
    title: "New Update Available",
    desc: "Mobin X Proxy Ultra Boost V2.8 is now available for download.",
    timeAgo: "5h ago",
    unread: true,
    icon: "cloud-download",
    color: "#10b981"
  }
];

export const faqList = [
  {
    q: "How fast is Diamond Top-Up delivered on noobtopup.com?",
    a: "All Diamond top-ups through our integrated noobtopup.com service are 100% automated and instantly credited to your game account in under 30 seconds."
  },
  {
    q: "Are the download files on mrmobin1m.blogspot.com verified?",
    a: "Yes. Every single APK, file, and config resource on mrmobin1m.blogspot.com is scanned and verified for malware, adware, and game security compliance."
  },
  {
    q: "How do I participate in daily tournaments?",
    a: "Navigate to the Tournaments tab, choose a live or upcoming cup, and tap JOIN NOW. You'll receive room ID and password details 15 minutes before the match starts."
  },
  {
    q: "How does the Sensitivity Maker calculate settings?",
    a: "Our algorithm assesses your specific device DPI, screen refresh rate, RAM capacity, and your chosen playstyle to calculate optimal drag headshot settings."
  },
  {
    q: "How do I access the Admin Panel?",
    a: "Log in with your Gmail. The first account logged in is automatically granted Admin Privileges to manage banners, URLs, tournaments, and flash sale items."
  }
];

export const defaultHomeNoticePopup = {
  enabled: false,
  image: "assets/images/banner_booyah.jpg",
  title: "Special Offer / নোটিশ",
  description: "অল্প দামে ১৮ মাসের জন্য Google ai Pro নিতে চাইলে নিচের বাটনে ক্লিক করে আমাদের সাথে যোগাযোগ করুন।",
  buttonText: "ক্লিক করুন",
  buttonUrl: "https://t.me/mrmobin1m",
  actionType: "external", // 'external', 'topup', 'shop', 'tournaments', 'downloads'
  showOncePerSession: true
};

export const defaultAppUpdateConfig = {
  latestVersion: "1.0",
  currentVersion: "1.0",
  updateTitle: "নতুন আপডেট এসেছে! 🚀",
  updateMessage: "Mobin X অ্যাপের নতুন ভার্সন Google Play Store-এ উপলব্ধ। সর্বোচ্চ স্পিড ও নতুন ফিচারের জন্য এখনই আপডেট করুন।",
  updateUrl: "https://play.google.com/store/apps/details?id=com.mobinx.gaming",
  forceUpdate: false
};

