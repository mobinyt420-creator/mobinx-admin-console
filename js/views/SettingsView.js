import { authService } from '../services/authService.js';
import { stateManager } from '../services/stateManager.js';
import { Toast } from '../components/Toast.js';
import { openExternalStore } from '../services/browserService.js';

export function renderSettingsView() {
  const user = authService.getCurrentUser();

  return `
    <div class="view-container settings-view">
      <div class="subview-header">
        <div class="subview-header-left">
          <button class="back-btn" id="btn-settings-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <h2 class="subview-title">Settings</h2>
        </div>
      </div>

      <div style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
        <!-- Account Card -->
        <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 14px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="${user.avatar}" style="width: 44px; height: 44px; border-radius: var(--radius-full); object-fit: cover;" />
            <div>
              <div style="font-weight: 800; font-size: 14px;">${user.username}</div>
              <div style="font-size: 11px; color: var(--text-secondary);">${user.email}</div>
            </div>
          </div>
          <button class="btn-secondary" id="btn-edit-profile-sim" style="padding: 6px 12px; font-size: 11.5px;">Edit</button>
        </div>

        <!-- Preferences Group -->
        <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 6px 14px; display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-light);">
            <div>
              <div style="font-weight: 700; font-size: 13px;">Push Notifications</div>
              <div style="font-size: 10.5px; color: var(--text-secondary);">Match alerts and flash offers</div>
            </div>
            <input type="checkbox" checked style="width: 20px; height: 20px; accent-color: var(--primary);" />
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-light);">
            <div>
              <div style="font-weight: 700; font-size: 13px;">Tournament Reminders</div>
              <div style="font-size: 10.5px; color: var(--text-secondary);">Lobby room ID notification 15m prior</div>
            </div>
            <input type="checkbox" checked style="width: 20px; height: 20px; accent-color: var(--primary);" />
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0;">
            <div>
              <div style="font-weight: 700; font-size: 13px;">App Language</div>
              <div style="font-size: 10.5px; color: var(--text-secondary);">Select preferred display language</div>
            </div>
            <select id="select-app-lang" style="padding: 6px 10px; border: 1px solid var(--border-light); border-radius: var(--radius-md); font-size: 12px; font-weight: 600; background: #ffffff;">
              <option>English</option>
              <option>বাংলা (Bengali)</option>
              <option>हिन्दी (Hindi)</option>
              <option>Español</option>
            </select>
          </div>
        </div>

        <!-- Storage & System -->
        <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 14px; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700; font-size: 13px;">Local Cache Size</div>
              <div style="font-size: 11px; color: var(--text-secondary);">Temporary resources: 14.8 MB</div>
            </div>
            <button class="btn-secondary" id="btn-clear-cache-action" style="padding: 8px 12px; font-size: 11.5px; color: var(--danger);">
              🗑️ Clear Cache
            </button>
          </div>
        </div>

        <!-- Legal & About Links -->
        <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 4px 14px; display: flex; flex-direction: column;">
          <div class="settings-link-row" id="link-privacy-policy" style="padding: 12px 0; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; cursor: pointer;">
            <span style="font-size: 13px; font-weight: 600;">Privacy Policy</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="settings-link-row" id="link-terms-service" style="padding: 12px 0; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; cursor: pointer;">
            <span style="font-size: 13px; font-weight: 600;">Terms of Service</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="settings-link-row" id="link-delete-account" style="padding: 12px 0; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; cursor: pointer;">
            <span style="font-size: 13px; font-weight: 600; color: var(--danger);">Request Account & Data Deletion</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
          <div class="settings-link-row" id="link-about-app" style="padding: 12px 0; display: flex; justify-content: space-between; cursor: pointer;">
            <span style="font-size: 13px; font-weight: 600;">About Mobin X (V1.0.0)</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function bindSettingsEvents() {
  document.getElementById('btn-settings-back')?.addEventListener('click', () => {
    stateManager.navigate('home');
  });

  document.getElementById('btn-edit-profile-sim')?.addEventListener('click', () => {
    Toast.show('Profile edit modal ready for Firebase auth connection', 'info');
  });

  document.getElementById('select-app-lang')?.addEventListener('change', (e) => {
    Toast.show(`Language switched to ${e.target.value}`, 'success');
  });

  document.getElementById('btn-clear-cache-action')?.addEventListener('click', () => {
    authService.clearAppCache();
    Toast.show('Cache cleared! 14.8 MB freed successfully.', 'success');
  });

  document.getElementById('link-privacy-policy')?.addEventListener('click', () => {
    openExternalStore('https://mobinx-admin-console.vercel.app/privacy-policy.html', '#0284c7');
  });

  document.getElementById('link-terms-service')?.addEventListener('click', () => {
    openExternalStore('https://mobinx-admin-console.vercel.app/privacy-policy.html', '#0284c7');
  });

  document.getElementById('link-delete-account')?.addEventListener('click', () => {
    openExternalStore('https://mobinx-admin-console.vercel.app/delete-account.html', '#ef4444');
  });

  document.getElementById('link-about-app')?.addEventListener('click', () => {
    stateManager.navigate('about');
  });
}
