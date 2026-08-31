import { faqList } from '../data/mockData.js';
import { stateManager } from '../services/stateManager.js';
import { Toast } from '../components/Toast.js';

export function renderHelpView() {
  return `
    <div class="view-container help-view">
      <div class="subview-header">
        <div class="subview-header-left">
          <button class="back-btn" id="btn-help-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <h2 class="subview-title">Help & Support 24/7</h2>
        </div>
        <span class="badge badge-success">Online ●</span>
      </div>

      <div style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
        <!-- Fast Support Channels -->
        <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 14px; display: flex; flex-direction: column; gap: 10px;">
          <h3 style="font-size: 13.5px; font-weight: 800;">Instant Contact Channels</h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <button class="btn-secondary btn-contact-channel" data-ch="WhatsApp" style="padding: 10px 4px; font-size: 11px; flex-direction: column; gap: 4px;">
              <span style="font-size: 20px;">💬</span>
              <span>WhatsApp</span>
            </button>
            <button class="btn-secondary btn-contact-channel" data-ch="Telegram" style="padding: 10px 4px; font-size: 11px; flex-direction: column; gap: 4px;">
              <span style="font-size: 20px;">✈️</span>
              <span>Telegram</span>
            </button>
            <button class="btn-secondary btn-contact-channel" data-ch="Live Ticket" style="padding: 10px 4px; font-size: 11px; flex-direction: column; gap: 4px;">
              <span style="font-size: 20px;">🎫</span>
              <span>Live Ticket</span>
            </button>
          </div>
        </div>

        <!-- FAQ Accordion -->
        <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 14px; display: flex; flex-direction: column; gap: 10px;">
          <h3 style="font-size: 13.5px; font-weight: 800;">Frequently Asked Questions</h3>
          
          ${faqList.map((faq, index) => `
            <div class="faq-item" style="border: 1px solid var(--border-light); border-radius: var(--radius-md); overflow: hidden;">
              <div class="faq-question-row" data-faq="${index}" style="padding: 12px 14px; background: var(--bg-card-subtle); display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-size: 12.5px; font-weight: 700;">
                <span>${faq.q}</span>
                <span class="faq-toggle-icon" id="faq-icon-${index}">+</span>
              </div>
              <div class="faq-answer-box" id="faq-ans-${index}" style="display: none; padding: 12px 14px; font-size: 12px; color: var(--text-secondary); line-height: 1.4; background: #ffffff;">
                ${faq.a}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function bindHelpEvents() {
  document.getElementById('btn-help-back')?.addEventListener('click', () => {
    stateManager.navigate('home');
  });

  document.querySelectorAll('.faq-question-row').forEach(row => {
    row.addEventListener('click', () => {
      const idx = row.getAttribute('data-faq');
      const ans = document.getElementById(`faq-ans-${idx}`);
      const icon = document.getElementById(`faq-icon-${idx}`);
      if (ans) {
        const isOpen = ans.style.display === 'block';
        ans.style.display = isOpen ? 'none' : 'block';
        if (icon) icon.textContent = isOpen ? '+' : '−';
      }
    });
  });

  document.querySelectorAll('.btn-contact-channel').forEach(btn => {
    btn.addEventListener('click', () => {
      const ch = btn.getAttribute('data-ch');
      Toast.show(`Connecting to official 24/7 ${ch} support...`, 'info');
    });
  });
}
