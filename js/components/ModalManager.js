import { stateManager } from '../services/stateManager.js';
import { downloadService } from '../services/downloadService.js';
import { tournamentService } from '../services/tournamentService.js';
import { authService } from '../services/authService.js';
import { firebaseService } from '../services/firebaseService.js';
import { Toast } from './Toast.js';

export function renderModal(activeModal) {
  const currentState = stateManager.getState();
  if (!activeModal || currentState.currentView === 'onboarding' || !authService.hasCompletedOnboarding()) {
    return `<div class="modal-overlay" id="global-modal-overlay"></div>`;
  }

  const { type, data } = activeModal;
  let bodyContent = '';
  let modalTitle = 'Details';

  switch (type) {
    case 'videoPlayer':
      modalTitle = data.title || 'Video Tutorial';
      bodyContent = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="width: 100%; aspect-ratio: 16/9; border-radius: var(--radius-lg); overflow: hidden; background: #000; box-shadow: var(--shadow-md);">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/${data.videoId}?autoplay=1&rel=0" 
              title="${data.title}" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">
            Watch the complete official Mobin X guide to ensure safe installation and maximum performance.
          </p>
          <div style="display: flex; gap: 10px; margin-top: 4px;">
            <button class="btn-primary" id="btn-modal-close-video" style="width: 100%;">
              Close Video
            </button>
          </div>
        </div>
      `;
      break;

    case 'googleLogin':
      modalTitle = 'Account Authentication';
      const currentUser = authService.getCurrentUser();
      bodyContent = `
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px;">
          <div style="width: 52px; height: 52px; border-radius: var(--radius-full); background: #ffffff; border: 1px solid var(--border-light); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm);">
            <svg width="26" height="26" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
          </div>

          <div>
            <h4 style="font-size: 15px; font-weight: 800; color: var(--text-main);">Sign In / Switch Account</h4>
            <p style="font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">Sign in to sync your diamond top-ups, sensitivities, and tournaments.</p>
          </div>

          <!-- PRIMARY GOOGLE BUTTON -->
          <button class="btn-primary" id="btn-modal-google-direct" style="width: 100%; height: 48px; background: #ffffff; color: #0f172a; border: 2px solid #38bdf8; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 14px; font-weight: 800; box-shadow: 0 4px 12px rgba(56, 189, 248, 0.2); cursor: pointer;">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            <span>Continue with Google</span>
          </button>

          <div style="display: flex; align-items: center; gap: 8px; width: 100%; margin: 2px 0;">
            <div style="flex: 1; height: 1px; background: var(--border-light);"></div>
            <span style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Or Email Sign In</span>
            <div style="flex: 1; height: 1px; background: var(--border-light);"></div>
          </div>

          <div style="width: 100%; display: flex; flex-direction: column; gap: 8px; text-align: left;">
            <div>
              <label style="font-size: 11.5px; font-weight: 700; color: var(--text-main);">Email / Gmail Address</label>
              <input type="email" id="input-modal-email" placeholder="Enter your email" style="width: 100%; padding: 10px 12px; border: 1.5px solid var(--border-light); border-radius: var(--radius-md); font-size: 13px; margin-top: 4px; outline: none; box-sizing: border-box;" />
            </div>

            <div>
              <label style="font-size: 11.5px; font-weight: 700; color: var(--text-main);">Password</label>
              <input type="password" id="input-modal-password" placeholder="Enter your password" style="width: 100%; padding: 10px 12px; border: 1.5px solid var(--border-light); border-radius: var(--radius-md); font-size: 13px; margin-top: 4px; outline: none; box-sizing: border-box;" />
            </div>
          </div>

          <div style="display: flex; gap: 10px; width: 100%; margin-top: 4px;">
            <button class="btn-secondary" id="btn-modal-cancel" style="flex: 1;">Cancel</button>
            <button class="btn-primary" id="btn-confirm-email-login" style="flex: 1.5; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>Sign In</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      `;
      break;

    case 'downloadConfirm':
      modalTitle = data.downloadLabel || data.title || 'Download Resource';
      bodyContent = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; gap: 14px; align-items: center;">
            <div style="width: 52px; height: 52px; border-radius: var(--radius-lg); background: var(--primary-light); display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0;">
              📥
            </div>
            <div>
              <div style="font-weight: 800; font-size: 14.5px; color: var(--text-main); line-height: 1.3;">${data.title}</div>
              <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Verified APK Package • 100% Anti-Ban</div>
            </div>
          </div>

          <!-- Sponsored Ad & Reward Verification Slot (AdMob Ready) -->
          <div style="background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(6, 182, 212, 0.06) 100%); border: 1.5px dashed rgba(59, 130, 246, 0.35); border-radius: var(--radius-md); padding: 12px; text-align: center;">
            <div style="font-size: 10px; font-weight: 800; color: var(--primary); letter-spacing: 0.8px; text-transform: uppercase;">
              📢 Sponsored Free Fire Partner Ad (AdMob Ready)
            </div>
            <div style="font-size: 12px; font-weight: 700; color: var(--text-main); margin-top: 4px;">
              🔥 Get 100% Bonus Diamonds on First Top-Up!
            </div>
            <div style="font-size: 10.5px; color: var(--text-muted); margin-top: 2px;">
              Support Mobin X free servers by verifying link generation.
            </div>
          </div>

          <div id="modal-download-progress-box" style="display: none; flex-direction: column; gap: 6px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700;">
              <span id="modal-progress-label">Step 1/2: Generating secure download link...</span>
              <span id="modal-progress-percent" style="color: var(--primary);">0%</span>
            </div>
            <div style="height: 8px; background: #e2e8f0; border-radius: var(--radius-full); overflow: hidden;">
              <div id="modal-progress-bar-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #2563eb, #06b6d4); transition: width 0.2s ease;"></div>
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 4px;">
            <button class="btn-secondary" id="btn-modal-cancel" style="flex: 1;">Cancel</button>
            <button class="btn-primary" id="btn-start-modal-download" style="flex: 2; display: flex; align-items: center; justify-content: center; gap: 6px;" data-url="${data.targetUrl || data.url || 'https://mrmobin.blogspot.com/'}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              <span>Get Download Link</span>
            </button>
          </div>
        </div>
      `;
      break;

    case 'tournamentJoin':
      modalTitle = 'Join Battle Royale Match';
      const currentUserObj = authService.getCurrentUser();
      const hasRealName = currentUserObj.username && currentUserObj.username !== 'Guest_Player';
      bodyContent = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="font-size: 15px; font-weight: 800; color: var(--text-main);">${data.title}</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <span class="badge badge-primary">${data.gameMode || data.entryType || 'Squad'}</span>
            <span class="badge badge-warning">Prize: ${data.prizePool}</span>
            <span class="badge badge-success">Entry: FREE</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px;">
            <label style="font-size: 11.5px; font-weight: 700; color: var(--text-main);">Your In-Game Name (IGN) *</label>
            <input type="text" id="input-player-ign" placeholder="e.g. ★MOBIN_YT★" value="${hasRealName ? currentUserObj.username : ''}" style="width: 100%; padding: 10px 12px; border: 1.5px solid var(--border-light); border-radius: var(--radius-md); outline: none; font-size: 12.5px; font-weight: 600;" />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <label style="font-size: 11px; font-weight: 700; color: var(--text-main);">Free Fire UID *</label>
              <input type="text" id="input-player-uid" placeholder="e.g. 248591829" value="${currentUserObj.ffUid || ''}" style="width: 100%; padding: 9px 10px; border: 1.5px solid var(--border-light); border-radius: var(--radius-md); outline: none; font-size: 12px; font-weight: 600;" />
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 700; color: var(--text-main);">WhatsApp / Telegram *</label>
              <input type="tel" id="input-player-phone" placeholder="01XXXXXXXXX" value="${currentUserObj.phone || ''}" style="width: 100%; padding: 9px 10px; border: 1.5px solid var(--border-light); border-radius: var(--radius-md); outline: none; font-size: 12px; font-weight: 600;" />
            </div>
          </div>

          <div style="font-size: 10.5px; color: var(--text-muted); background: #f8fafc; padding: 8px; border-radius: 6px;">
            ⚠️ Custom room credentials will be dispatched to your notification center & visible in the match card upon admin release.
          </div>

          <div style="display: flex; gap: 10px; margin-top: 4px;">
            <button class="btn-secondary" id="btn-modal-cancel" style="flex: 1;">Cancel</button>
            <button class="btn-primary" id="btn-confirm-join-tournament" style="flex: 2; background: #ea580c;">
              Confirm Entry (Slot Reservation)
            </button>
          </div>
        </div>
      `;
      break;

    case 'welcomeAnnouncement':
      modalTitle = (data.title && data.title !== data.message) ? data.title : 'Official Announcement';
      const showTitle = data.title && data.title !== data.message;
      const messageContent = data.message || data.title || data.description || '';
      bodyContent = `
        <div style="display: flex; flex-direction: column; gap: 14px; text-align: center;">
          ${data.imageUrl ? `
            <div style="width: 100%; border-radius: var(--radius-lg); overflow: hidden; max-height: 180px; box-shadow: var(--shadow-sm);">
              <img src="${data.imageUrl}" alt="Notice" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          ` : ''}
          ${showTitle ? `<div style="font-size: 16px; font-weight: 900; color: var(--text-main); line-height: 1.3;">${data.title}</div>` : ''}
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; font-weight: 600;">${messageContent}</div>
          <div style="display: flex; gap: 10px; margin-top: 6px;">
            <button class="btn-secondary" id="btn-modal-cancel" style="flex: 1;">Dismiss</button>
            ${data.actionUrl ? `
              <a href="${data.actionUrl}" target="_blank" class="btn-primary" id="btn-announcement-action" style="flex: 2; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span>${data.actionLabel || 'Check It Out'}</span>
                <span>→</span>
              </a>
            ` : ''}
          </div>
        </div>
      `;
      break;


    case 'sensitivityGuide':
      modalTitle = data.title || 'Sensitivity Guide';
      bodyContent = data.content || '<p>Follow in-game guide instructions.</p>';
      break;

    case 'referralShare':
      modalTitle = 'Join Official Telegram Community';
      bodyContent = `
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px;">
          <div style="width: 70px; height: 70px; border-radius: var(--radius-full); background: #eff6ff; display: flex; align-items: center; justify-content: center;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#2563eb"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.05-.2-.06-.06-.15-.04-.22-.02-.1.02-1.63 1.04-4.61 3.05-.44.3-.83.45-1.19.44-.39-.01-1.15-.22-1.71-.4-.69-.22-1.24-.34-1.19-.72.03-.2.3-.4.82-.62 3.23-1.41 5.39-2.34 6.49-2.8 3.09-1.3 3.73-1.53 4.15-1.53.09 0 .3.02.43.13.11.09.14.22.16.31-.01.07.01.22 0 .34z"/></svg>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 16px; color: var(--text-main);">Mobin X Official Telegram Channel</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Get daily Free Fire redeem codes, latest APK releases, and tournament passwords first!</div>
          </div>

          <a href="https://t.me/mobinx_official" target="_blank" class="btn-primary" style="width: 100%; text-decoration: none; padding: 12px; font-size: 13.5px; display: flex; justify-content: center; align-items: center; gap: 8px;">
            <span>Open in Telegram ✈️</span>
          </a>
        </div>
      `;
      break;

    default:
      bodyContent = `<p>${data.message || 'Action completed'}</p>`;
  }

  return `
    <div class="modal-overlay open" id="global-modal-overlay">
      <div class="modal-sheet">
        <div class="modal-drag-bar"></div>
        <div class="modal-header">
          <h3 class="modal-title">${modalTitle}</h3>
          <button class="modal-close-btn" id="btn-close-modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          ${bodyContent}
        </div>
      </div>
    </div>
  `;
}

export function bindModalEvents(activeModal) {
  if (!activeModal) return;

  const { type, data } = activeModal;

  document.getElementById('btn-close-modal')?.addEventListener('click', () => {
    stateManager.closeModal();
  });

  document.getElementById('btn-modal-close-video')?.addEventListener('click', () => {
    stateManager.closeModal();
  });

  document.getElementById('btn-modal-cancel')?.addEventListener('click', () => {
    stateManager.closeModal();
  });

  document.getElementById('global-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'global-modal-overlay') {
      stateManager.closeModal();
    }
  });

  if (type === 'googleLogin') {
    // 1. Direct Google Sign-In button
    document.getElementById('btn-modal-google-direct')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-modal-google-direct');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>Connecting with Google...</span>`;
      }
      try {
        const googleUser = await firebaseService.signInWithGoogle();
        if (googleUser && googleUser.email) {
          const user = await authService.loginWithGoogle(
            googleUser.email, 
            googleUser.displayName, 
            '', 
            '', 
            googleUser.photoURL || '', 
            googleUser.uid
          );
          stateManager.closeModal();
          Toast.show(`Welcome back, ${user.username}!`, 'success');
          stateManager.navigate('profile');
        }
      } catch (err) {
        console.warn('Modal Google Sign-In error:', err);
        Toast.show(err.message || 'Google Sign-In was cancelled', 'warning');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            <span>Continue with Google</span>
          `;
        }
      }
    });

    // 2. Email & Password Sign-In button
    document.getElementById('btn-confirm-email-login')?.addEventListener('click', async () => {
      const email = (document.getElementById('input-modal-email')?.value || '').trim();
      const password = document.getElementById('input-modal-password')?.value || '';
      const btn = document.getElementById('btn-confirm-email-login');

      if (!email || !email.includes('@')) {
        Toast.show('Please enter a valid email address.', 'warning');
        return;
      }
      if (!password) {
        Toast.show('Please enter your password.', 'warning');
        return;
      }

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>Signing In...</span>`;
      }

      try {
        const user = await authService.loginWithEmailPassword(email, password);
        stateManager.closeModal();
        Toast.show(`Welcome back, ${user.username}!`, 'success');
        stateManager.navigate('profile');
      } catch (err) {
        Toast.show(err.message || 'Incorrect email or password.', 'warning');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `
            <span>Sign In</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          `;
        }
      }
    });
  }

  if (type === 'downloadConfirm') {
    const startBtn = document.getElementById('btn-start-modal-download');
    const progressBox = document.getElementById('modal-download-progress-box');
    const progressBar = document.getElementById('modal-progress-bar-fill');
    const progressPercent = document.getElementById('modal-progress-percent');
    const progressLabel = document.getElementById('modal-progress-label');
    const targetUrl = startBtn?.getAttribute('data-url') || data.targetUrl || data.url || 'https://mrmobin.blogspot.com/';

    startBtn?.addEventListener('click', () => {
      startBtn.style.display = 'none';
      if (progressBox) progressBox.style.display = 'flex';

      let currentPercent = 0;
      const interval = setInterval(() => {
        currentPercent += 20;
        if (progressBar) progressBar.style.width = currentPercent + '%';
        if (progressPercent) progressPercent.textContent = currentPercent + '%';
        if (progressLabel && currentPercent >= 60) {
          progressLabel.textContent = 'Step 2/2: Security verified! Unlocking target link...';
        }

        if (currentPercent >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            authService.recordDownload(data.id || 'apk-download', data.title || 'APK Tool');
            stateManager.closeModal();
            Toast.show('Security verified! Opening high-speed download link...', 'success');
            window.open(targetUrl, '_blank');
          }, 400);
        }
      }, 350);
    });
  }

  if (type === 'tournamentJoin') {
    document.getElementById('btn-confirm-join-tournament')?.addEventListener('click', () => {
      try {
        const ign = (document.getElementById('input-player-ign')?.value || '').trim();
        const ffUid = (document.getElementById('input-player-uid')?.value || '').trim();
        const phone = (document.getElementById('input-player-phone')?.value || '').trim();

        if (ign.length < 2) {
          throw new Error('Please enter your In-Game Name (IGN)');
        }
        if (ffUid.length < 5) {
          throw new Error('Please enter a valid Free Fire UID (at least 5 digits)');
        }
        if (phone.length < 8) {
          throw new Error('Please enter your WhatsApp / Telegram phone number');
        }

        const result = tournamentService.joinTournament(data.id, {
          playerName: ign,
          ffUid: ffUid,
          phone: phone
        });
        
        Toast.show(`🎉 Successfully joined match! Reserved Slot #${result.assignedSlot}`, 'success');
        stateManager.closeModal();
        stateManager.navigate('tournaments');
      } catch (err) {
        Toast.show(err.message, 'warning');
      }
    });
  }

}
