import { searchService } from '../services/searchService.js';
import { stateManager } from '../services/stateManager.js';

let currentQuery = '';

export function renderSearchView() {
  const recent = searchService.getRecentSearches();
  const results = searchService.search(currentQuery);

  return `
    <div class="view-container search-view">
      <!-- Search Input Bar -->
      <div class="search-bar-wrapper">
        <button class="back-btn" id="btn-search-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

        <div class="search-input-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="color: var(--text-muted);"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="input-global-search" placeholder="Search services, APK, tournaments..." value="${currentQuery}" autofocus />
          ${currentQuery ? `
            <button id="btn-clear-search" style="font-size: 14px; color: var(--text-muted); padding: 2px 6px;">✕</button>
          ` : ''}
        </div>
      </div>

      <!-- Recent Searches (if query is empty) -->
      ${!currentQuery ? `
        <div style="padding: 12px 16px 4px 16px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12.5px; font-weight: 700; color: var(--text-main);">Recent Searches</span>
          <button id="btn-clear-recent" style="font-size: 11px; font-weight: 600; color: var(--text-muted);">Clear All</button>
        </div>
        <div class="recent-search-chips">
          ${recent.map(q => `
            <div class="search-chip" data-query="${q}">
              <span>🔍 ${q}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Search Results -->
      ${currentQuery ? `
        <div style="padding: 14px 16px; display: flex; flex-direction: column; gap: 16px;">
          ${results.total === 0 ? `
            <div class="state-container">
              <div class="state-icon-circle">🔍</div>
              <h3 class="state-title">No matching results</h3>
              <p class="state-desc">We couldn't find anything matching "${currentQuery}". Try searching for diamonds, APK, or tournaments.</p>
            </div>
          ` : `
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">
              Found ${results.total} results for "${currentQuery}"
            </div>

            <!-- Services -->
            ${results.services.length > 0 ? `
              <div>
                <h4 style="font-size: 13.5px; font-weight: 800; margin-bottom: 8px;">Services</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                  ${results.services.map(s => `
                    <div class="service-search-item" data-route="${s.route}" style="background: #fff; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 10px; display: flex; align-items: center; gap: 10px; cursor: pointer;">
                      <img src="${s.image}" style="width: 38px; height: 38px; border-radius: var(--radius-sm); object-fit: cover;" />
                      <div>
                        <div style="font-size: 12px; font-weight: 800;">${s.title}</div>
                        <div style="font-size: 10px; color: var(--text-muted);">${s.subtitle}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Downloads -->
            ${results.downloads.length > 0 ? `
              <div>
                <h4 style="font-size: 13.5px; font-weight: 800; margin-bottom: 8px;">Downloads & Tools</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${results.downloads.map(d => `
                    <div class="dl-search-item" data-id="${d.id}" style="background: #fff; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                      <div>
                        <div style="font-size: 12.5px; font-weight: 700;">${d.title}</div>
                        <div style="font-size: 10.5px; color: var(--text-muted);">${d.category} • ${d.size}</div>
                      </div>
                      <span class="badge badge-primary">Download</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Tournaments -->
            ${results.tournaments.length > 0 ? `
              <div>
                <h4 style="font-size: 13.5px; font-weight: 800; margin-bottom: 8px;">Tournaments</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${results.tournaments.map(t => `
                    <div class="t-search-item" data-id="${t.id}" style="background: #fff; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                      <div>
                        <div style="font-size: 12.5px; font-weight: 700;">${t.title}</div>
                        <div style="font-size: 10.5px; color: var(--text-muted);">${t.gameMode} • Prize: ${t.prizePool}</div>
                      </div>
                      <span class="badge badge-warning">View</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          `}
        </div>
      ` : ''}
    </div>
  `;
}

export function bindSearchEvents() {
  document.getElementById('btn-search-back')?.addEventListener('click', () => {
    currentQuery = '';
    stateManager.navigate('home');
  });

  const input = document.getElementById('input-global-search');
  input?.addEventListener('input', (e) => {
    currentQuery = e.target.value;
    stateManager.navigate('search');
    // keep focus on search
    setTimeout(() => {
      const el = document.getElementById('input-global-search');
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }, 50);
  });

  document.getElementById('btn-clear-search')?.addEventListener('click', () => {
    currentQuery = '';
    stateManager.navigate('search');
  });

  document.getElementById('btn-clear-recent')?.addEventListener('click', () => {
    searchService.clearRecentSearches();
    stateManager.navigate('search');
  });

  document.querySelectorAll('.search-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      currentQuery = chip.getAttribute('data-query') || '';
      stateManager.navigate('search');
    });
  });

  document.querySelectorAll('.service-search-item').forEach(item => {
    item.addEventListener('click', () => {
      const route = item.getAttribute('data-route');
      if (route) stateManager.navigate(route);
    });
  });

  document.querySelectorAll('.dl-search-item').forEach(item => {
    item.addEventListener('click', () => {
      stateManager.navigate('downloads');
    });
  });

  document.querySelectorAll('.t-search-item').forEach(item => {
    item.addEventListener('click', () => {
      stateManager.navigate('tournaments');
    });
  });
}
