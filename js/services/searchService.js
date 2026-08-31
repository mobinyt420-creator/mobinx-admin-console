import { popularServices, downloadItems, tournamentsList, flashSaleProducts } from '../data/mockData.js';

class SearchService {
  constructor() {
    const hasStorage = typeof localStorage !== 'undefined';
    this.recentSearches = hasStorage ? JSON.parse(localStorage.getItem('mobinx_recent_searches') || '["Free Fire Diamonds", "Booster APK", "Headshot Sensitivity", "Squad Tournament"]') : ["Free Fire Diamonds", "Booster APK", "Headshot Sensitivity", "Squad Tournament"];
  }

  getRecentSearches() {
    return this.recentSearches;
  }

  addRecentSearch(query) {
    if (!query || !query.trim()) return;
    const clean = query.trim();
    this.recentSearches = [clean, ...this.recentSearches.filter(q => q.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_recent_searches', JSON.stringify(this.recentSearches));
    }
  }

  clearRecentSearches() {
    this.recentSearches = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('mobinx_recent_searches');
    }
  }

  search(query) {
    if (!query || !query.trim()) {
      return {
        services: [],
        downloads: [],
        tournaments: [],
        flashSales: [],
        total: 0
      };
    }

    const q = query.toLowerCase().trim();
    this.addRecentSearch(query);

    const services = (popularServices || []).filter(s =>
      (s.title && s.title.toLowerCase().includes(q))
    );

    const downloads = (downloadItems || []).filter(d =>
      (d.title && d.title.toLowerCase().includes(q)) ||
      (d.description && d.description.toLowerCase().includes(q)) ||
      (d.category && d.category.toLowerCase().includes(q))
    );

    const tournaments = (tournamentsList || []).filter(t =>
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.gameMode && t.gameMode.toLowerCase().includes(q)) ||
      (t.rules && t.rules.toLowerCase().includes(q))
    );

    const flashSales = (flashSaleProducts || []).filter(f =>
      (f.diamondAmount && f.diamondAmount.toLowerCase().includes(q)) ||
      (f.price && f.price.toLowerCase().includes(q)) ||
      (f.badge && f.badge.toLowerCase().includes(q))
    );

    return {
      services,
      downloads,
      tournaments,
      flashSales,
      total: services.length + downloads.length + tournaments.length + flashSales.length
    };
  }
}

export const searchService = new SearchService();
