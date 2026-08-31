import { downloadItems } from '../data/mockData.js';
import { authService } from './authService.js';

class DownloadService {
  constructor() {
    this.catalog = this.loadCatalog();
    this.activeDownloads = new Map();
    this.listeners = new Set();
  }

  loadCatalog() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('mobinx_downloads_catalog');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return [...downloadItems];
  }

  saveCatalog() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobinx_downloads_catalog', JSON.stringify(this.catalog));
    }
  }

  getAll() {
    return this.catalog.filter(item => item.isActive !== false && item.status !== 'inactive');
  }

  setCatalog(items) {
    if (Array.isArray(items)) {
      this.catalog = items;
      this.saveCatalog();
      this.notify({ type: 'catalog_updated' });
    }
  }

  reloadFromStorage() {
    this.catalog = this.loadCatalog();
    this.notify({ type: 'catalog_updated' });
  }

  getByCategory(category) {
    const active = this.getAll();
    if (!category || category === 'All') return active;
    return active.filter(item => item.category && item.category.toLowerCase() === category.toLowerCase());
  }


  getById(id) {
    return this.catalog.find(item => item.id === id);
  }

  /**
   * Prepend new APK/Video item dynamically
   */
  addItem(newItem) {
    this.catalog.unshift({
      id: `apk-${Date.now()}`,
      rating: 5.0,
      downloadsCount: "1.2K",
      icon: "https://img.youtube.com/vi/" + (newItem.videoId || 'dQw4w9WgXcQ') + "/hqdefault.jpg",
      ...newItem
    });
    this.saveCatalog();
    this.notify({ type: 'catalog_updated' });
  }

  updateItem(id, updatedData) {
    const idx = this.catalog.findIndex(item => item.id === id);
    if (idx !== -1) {
      this.catalog[idx] = { ...this.catalog[idx], ...updatedData };
      if (updatedData.videoId) {
        this.catalog[idx].icon = "https://img.youtube.com/vi/" + updatedData.videoId + "/hqdefault.jpg";
      }
      this.saveCatalog();
      this.notify({ type: 'catalog_updated' });
    }
  }

  deleteItem(id) {
    this.catalog = this.catalog.filter(item => item.id !== id);
    this.saveCatalog();
    this.notify({ type: 'catalog_updated' });
  }

  startDownload(itemId, onProgress, onComplete) {
    const item = this.getById(itemId);
    if (!item) return;

    if (this.activeDownloads.has(itemId)) {
      clearInterval(this.activeDownloads.get(itemId).timer);
    }

    let progress = 0;
    const downloadState = {
      id: itemId,
      item,
      progress: 0,
      status: 'downloading'
    };

    const timer = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 12;
      if (progress >= 100) {
        progress = 100;
        clearInterval(timer);
        downloadState.status = 'completed';
        downloadState.progress = 100;
        authService.recordDownload(itemId);
        if (onComplete) onComplete(item);
      } else {
        downloadState.progress = progress;
        if (onProgress) onProgress(progress);
      }
      this.notify(downloadState);
    }, 250);

    downloadState.timer = timer;
    this.activeDownloads.set(itemId, downloadState);
    return downloadState;
  }

  cancelDownload(itemId) {
    if (this.activeDownloads.has(itemId)) {
      clearInterval(this.activeDownloads.get(itemId).timer);
      this.activeDownloads.delete(itemId);
      this.notify({ id: itemId, status: 'cancelled', progress: 0 });
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(state) {
    for (const listener of this.listeners) {
      listener(state);
    }
  }
}

export const downloadService = new DownloadService();
