import { authService } from '../services/authService.js';
import { stateManager } from '../services/stateManager.js';
import { Toast } from '../components/Toast.js';

export function renderReferralView() {
  const user = authService.getCurrentUser();

  return `
    <div class="view-container referral-view">
      <div class="subview-header">
        <div class="subview-header-left">
          <button class="back-btn" id="btn-ref-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <h2 class="subview-title">Refer & Earn Program</h2>
        </div>
        <span class="badge badge-primary">VIP Rewards</span>
      </div>

      <!-- Referral Hero Banner -->
      <div style="margin: 16px; border-radius: var(--radius-xl); overflow: hidden; position: relative; box-shadow: var(--shadow-md); background: linear-gradient(135deg, #31104b 0%, #4c1d95 100%);">
        <img src="assets/images/banner_referral.jpg" style="width: 100%; height: 140px; object-fit: cover;" />
      </div>

      <!-- Referral Code Card -->
      <div style="padding: 0 16px 16px 16px;">
        <div style="background: #ffffff; border: 1.5px solid var(--border-light); border-radius: var(--radius-xl); padding: 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: var(--shadow-sm); text-align: center;">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Your Unique Referral Code</span>
          <div style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: var(--secondary); font-family: var(--font-heading);">
            ${user.referralCode}
          </div>

          <div style="display: flex; gap: 10px;">
            <button class="btn-secondary" id="btn-copy-code-only" style="flex: 1; padding: 10px; font-size: 12.5px;">
              📋 Copy Code
            </button>
            <button class="btn-primary" id="btn-open-share-modal" style="flex: 1.5; padding: 10px; font-size: 12.5px; background: var(--secondary);">
              🎁 Invite Friends
            </button>
          </div>
        </div>
      </div>

      <!-- Referral Stats Grid -->
      <div style="padding: 0 16px 16px 16px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
        <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 14px; text-align: center; box-shadow: var(--shadow-xs);">
          <div style="font-size: 22px; font-weight: 800; color: var(--primary);">${user.stats.referralsCount}</div>
          <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600; margin-top: 2px;">Total Friends Joined</div>
        </div>

        <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 14px; text-align: center; box-shadow: var(--shadow-xs);">
          <div style="font-size: 22px; font-weight: 800; color: var(--success);">$${user.referralEarnings}</div>
          <div style="font-size: 11px; color: var(--text-secondary); font-weight: 600; margin-top: 2px;">Total Earnings Withdrawn</div>
        </div>
      </div>

      <!-- Reward Tiers -->
      <div style="padding: 0 16px 24px 16px;">
        <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 16px; display: flex; flex-direction: column; gap: 12px;">
          <h3 style="font-size: 14px; font-weight: 800;">Milestone Rewards</h3>
          
          ${[
            { title: 'Level 1: 5 Invites', reward: '$10.00 + 100 Diamonds', completed: true },
            { title: 'Level 2: 15 Invites', reward: '$50.00 + 520 Diamonds', completed: true },
            { title: 'Level 3: 30 Invites', reward: '$120.00 + Exclusive Skin', completed: false, progress: '19/30' },
            { title: 'Level 4: 50 Invites', reward: '$250.00 + VIP Pass Lifetime', completed: false, progress: '19/50' }
          ].map(tier => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--bg-card-subtle); border-radius: var(--radius-md);">
              <div>
                <div style="font-size: 12px; font-weight: 700; color: var(--text-main);">${tier.title}</div>
                <div style="font-size: 10.5px; color: var(--text-secondary);">${tier.reward}</div>
              </div>
              <span class="badge ${tier.completed ? 'badge-success' : 'badge-primary'}">
                ${tier.completed ? '✓ Claimed' : tier.progress}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function bindReferralEvents() {
  document.getElementById('btn-ref-back')?.addEventListener('click', () => {
    stateManager.navigate('home');
  });

  document.getElementById('btn-copy-code-only')?.addEventListener('click', () => {
    navigator.clipboard?.writeText('MOBINXVIP');
    Toast.show('Referral Code MOBINXVIP copied!', 'success');
  });

  document.getElementById('btn-open-share-modal')?.addEventListener('click', () => {
    stateManager.openModal('referralShare', {});
  });
}
