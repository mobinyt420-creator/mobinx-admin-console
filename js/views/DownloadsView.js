import { downloadService } from '../services/downloadService.js';
import { stateManager } from '../services/stateManager.js';
import { Toast } from '../components/Toast.js';

let activeCategory = 'All';

export function renderDownloadsView() {
  const categories = ['All', 'Mobin APK', 'Tools', 'Premium Apps'];
  const items = downloadService.getByCategory(activeCategory);

  return `
    <div class="view-container downloads-view">
      <!-- Subview Top Header -->
      <div class="subview-header">
        <div class="subview-header-left">
          <button class="back-btn" id="btn-dl-back" title="Back to Home" aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <h2 class="subview-title">APK & Tool Downloads</h2>
        </div>
        <span class="badge badge-success">🛡️ Verified</span>
      </div>

      <!-- Categories Filter Tabs -->
      <div class="filter-tabs-scroll">
        ${categories.map(cat => `
          <button class="filter-tab-pill ${activeCategory === cat ? 'active' : ''}" data-cat="${cat}">
            ${cat}
          </button>
        `).join('')}
      </div>

      <!-- Downloads APK Video Cards List -->
      <div class="apk-downloads-feed">
        ${items.length === 0 ? `
          <div class="state-container">
            <div class="state-icon-circle">📂</div>
            <h3 class="state-title">No downloads found</h3>
            <p class="state-desc">Try selecting another category or check back later for new releases.</p>
          </div>
        ` : items.map(item => `
          <div class="apk-card" data-apk-id="${item.id}">
            <!-- 1. 16:9 YouTube Video Preview with Center Play Button -->
            <div class="apk-video-preview-wrapper" data-video-id="${item.youtubeId}" data-title="${item.title}">
              <img class="apk-video-thumb" src="${item.videoThumbnail}" alt="${item.title}" loading="lazy" />
              <div class="apk-video-overlay">
                <div class="apk-play-button-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#ffffff">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
                <span class="apk-video-duration">${item.videoDuration}</span>
                <span class="apk-category-tag">${item.category}</span>
              </div>
            </div>

            <!-- APK Details Body -->
            <div class="apk-card-body">
              <!-- 2. Single-line Video Title (No cluttered MB/Version line) -->
              <h3 class="apk-card-title" title="${item.title}">${item.title}</h3>

              <!-- 3. Watch Video Button -->
              <button class="apk-watch-video-btn" data-watch-id="${item.youtubeId}" data-title="${item.title}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#ffffff"></polygon>
                </svg>
                <span>Watch Video Tutorial</span>
              </button>

              <!-- 4. Data-Driven Dynamic Action Buttons Grid -->
              <div class="apk-actions-grid">
                ${item.actionButtons.map(act => `
                  <button class="apk-action-pill-btn ${act.type === 'external' ? 'action-telegram' : ''}" 
                          data-act-id="${act.id}" 
                          data-act-type="${act.type}" 
                          data-act-url="${act.url}" 
                          data-act-label="${act.label}"
                          data-item-id="${item.id}">
                    ${getActionIcon(act.icon)}
                    <span>${act.label}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function getActionIcon(iconName) {
  switch (iconName) {
    case 'download':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
    case 'key':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5-2 2 1.5 1.5L12 11l-4 4-2-2-4 4 2 2 4-4 2 2 4-4 1.5 1.5 2-2-1.5-1.5 1.5-1.5z"></path></svg>`;
    case 'file':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
    case 'telegram':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.06-.06-.15-.04-.22-.02-.1.02-1.63 1.04-4.61 3.05-.44.3-.83.45-1.19.44-.39-.01-1.15-.22-1.71-.4-.69-.22-1.24-.34-1.19-.72.03-.2.3-.4.82-.62 3.23-1.41 5.39-2.34 6.49-2.8 3.09-1.3 3.73-1.53 4.15-1.53.09 0 .3.02.43.13.11.09.14.22.16.31-.01.07.01.22 0 .34z"/></svg>`;
    case 'shield':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;
    case 'volume':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
    default:
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
  }
}

export function bindDownloadsEvents() {
  document.getElementById('btn-dl-back')?.addEventListener('click', () => {
    stateManager.navigate('home');
  });

  // Filter tabs
  document.querySelectorAll('.filter-tab-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      activeCategory = pill.getAttribute('data-cat') || 'All';
      stateManager.navigate('downloads');
    });
  });

  // Video play click
  document.querySelectorAll('.apk-video-preview-wrapper, .apk-watch-video-btn').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const videoId = el.getAttribute('data-video-id') || el.getAttribute('data-watch-id') || 'dQw4w9WgXcQ';
      const title = el.getAttribute('data-title') || 'Video Preview';
      stateManager.openModal('videoPlayer', { videoId, title });
    });
  });

  // Dynamic action buttons
  document.querySelectorAll('.apk-action-pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const actType = btn.getAttribute('data-act-type');
      const actUrl = btn.getAttribute('data-act-url');
      const actLabel = btn.getAttribute('data-act-label');
      const itemId = btn.getAttribute('data-item-id');
      const item = downloadService.getById(itemId);

      if (item) {
        stateManager.openModal('downloadConfirm', { 
          ...item, 
          title: `${item.title} (${actLabel})`,
          downloadLabel: actLabel, 
          targetUrl: actUrl || 'https://mrmobin.blogspot.com/'
        });
      } else if (actUrl) {
        window.open(actUrl, '_blank');
      }
    });
  });
}

