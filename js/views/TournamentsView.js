import { tournamentService } from '../services/tournamentService.js';
import { stateManager } from '../services/stateManager.js';
import { Toast } from '../components/Toast.js';

export function renderTournamentsView() {
  const items = tournamentService.getAll();

  return `
    <div class="view-container tournaments-view" style="background: #f8fafc; min-height: 100%;">
      <!-- Subview Top Header -->
      <div class="subview-header" style="background: #ffffff;">
        <div class="subview-header-left">
          <button class="back-btn" id="btn-tourn-back" title="Back" aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <h2 class="subview-title" style="font-size: 17px; font-weight: 900; letter-spacing: 0.5px;">BR MATCHES & TOURNAMENTS</h2>
        </div>
        <button id="btn-refresh-tournaments" style="color: var(--primary); padding: 6px; border-radius: var(--radius-full); background: none; border: none; cursor: pointer;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
        </button>
      </div>

      <!-- Live Notification Banner for Released Rooms -->
      ${items.some(m => m.isRoomReleased) ? `
        <div style="padding: 10px 14px 2px 14px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; padding: 10px 14px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">⚡</span>
              <div>
                <div style="font-size: 12px; font-weight: 800;">CUSTOM ROOM IS LIVE!</div>
                <div style="font-size: 10px; opacity: 0.95;">Room ID & Password available below. Copy & enter lobby now!</div>
              </div>
            </div>
            <span class="badge" style="background: #ffffff; color: #dc2626; font-size: 9px; font-weight: 800;">LIVE</span>
          </div>
        </div>
      ` : ''}

      <!-- BR Match Cards Feed -->
      <div class="br-matches-feed" style="padding: 12px 14px 28px 14px; display: flex; flex-direction: column; gap: 16px;">
        ${items.length === 0 ? `
          <div class="state-container">
            <div class="state-icon-circle">🎮</div>
            <h3 class="state-title">No BR Matches Scheduled</h3>
            <p class="state-desc">New Battle Royale custom rooms are published daily by Mobin X Admin!</p>
          </div>
        ` : items.map(match => {
          const spotsLeft = Math.max(0, match.slotsTotal - match.slotsFilled);
          const percentFilled = Math.min(100, Math.round((match.slotsFilled / match.slotsTotal) * 100));
          const entryType = match.entryType || match.gameMode || 'Squad (4v4)';
          const matchDate = match.matchDate || (match.date && match.time ? `${match.date} at ${match.time}` : 'TODAY at 08:30 PM');
          const winPrize = match.prizePool || '৳1,500';
          const mapName = match.map || 'Bermuda';
          const isReleased = !!match.isRoomReleased;
          const roomId = match.roomId || 'MX-88942';
          const roomPass = match.roomPass || '1234';
          const startTimestamp = match.startTimestamp || (match.matchTimeIso ? new Date(match.matchTimeIso).getTime() : Date.now() + 3600000);

          return `
            <div class="br-match-card" data-match-id="${match.id}" style="${isReleased ? 'border: 2px solid #ef4444; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.15);' : ''}">
              
              <!-- Match Top Row: Thumb + Title + Match Time -->
              <div class="br-card-header">
                <div class="br-thumb-box" style="position: relative;">
                  <img src="${match.banner || 'assets/images/banner_esports.jpg'}" alt="FF BR" />
                  <span class="badge" style="position: absolute; top: 4px; left: 4px; font-size: 8px; padding: 2px 6px; ${isReleased ? 'background: #ef4444; color: #fff;' : 'background: rgba(0,0,0,0.6); color: #fff;'}">
                    ${isReleased ? '🔴 LIVE ROOM' : 'UPCOMING'}
                  </span>
                </div>
                <div class="br-title-col">
                  <h3 class="br-match-title">${match.title}</h3>
                  <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px;">
                    <span class="br-match-time">${matchDate}</span>
                    <span class="badge badge-primary tourn-live-countdown" data-start-time="${startTimestamp}" style="font-size: 9px; font-weight: 800; background: rgba(37, 99, 235, 0.15); color: #2563eb; padding: 2px 8px; border-radius: 999px;">
                      ⏳ Loading timer...
                    </span>
                  </div>
                </div>
              </div>

              <!-- Match Specs Row 1: WIN PRIZE | ENTRY TYPE | ENTRY FEE -->
              <div class="br-specs-grid">
                <div class="br-spec-item">
                  <span class="br-spec-label">WIN PRIZE</span>
                  <span class="br-spec-value bold" style="color: #10b981;">${winPrize}</span>
                </div>
                <div class="br-spec-item">
                  <span class="br-spec-label">GAME MODE</span>
                  <span class="br-spec-value">${entryType}</span>
                </div>
                <div class="br-spec-item">
                  <span class="br-spec-label">ENTRY FEE</span>
                  <span class="br-spec-value ${match.entryFee && match.entryFee !== 'Free' ? '' : 'free'}">${match.entryFee || 'FREE'}</span>
                </div>
              </div>

              <!-- Match Specs Row 2: MAP | VERSION -->
              <div class="br-specs-grid-2">
                <div class="br-spec-item">
                  <span class="br-spec-label">MAP</span>
                  <span class="br-spec-value">🗺️ ${mapName}</span>
                </div>
                <div class="br-spec-item">
                  <span class="br-spec-label">VERSION</span>
                  <span class="br-spec-value">MOBILE ONLY</span>
                </div>
              </div>

              <!-- Slots Progress Bar & Join Button -->
              <div class="br-slots-join-row">
                <div class="br-progress-wrapper">
                  <div class="br-progress-track">
                    <div class="br-progress-fill" style="width: ${percentFilled}%;"></div>
                  </div>
                  <div class="br-progress-labels">
                    <span class="spots-left-text">${spotsLeft > 0 ? `Only ${spotsLeft} spots left` : 'Match Full'}</span>
                    <span class="spots-count-text">${match.slotsFilled}/${match.slotsTotal}</span>
                  </div>
                </div>

                <button class="br-join-btn btn-join-match" data-id="${match.id}" style="${spotsLeft === 0 ? 'opacity: 0.6; pointer-events: none;' : ''}">
                  ${spotsLeft === 0 ? 'Full' : 'Join'}
                </button>
              </div>

              <!-- Accordion Buttons: Room Details & Total Prize Details -->
              <div class="br-accordions-row">
                <button class="br-accordion-btn btn-toggle-room ${isReleased ? 'highlight-released' : ''}" data-target="room-box-${match.id}" style="${isReleased ? 'background: #fef2f2; border-color: #fecdd3; color: #dc2626; font-weight: 800;' : ''}">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5-2 2 1.5 1.5L12 11l-4 4-2-2-4 4 2 2 4-4 2 2 4-4 1.5 1.5 2-2-1.5-1.5 1.5-1.5z"></path></svg>
                    <span>Room Details ${isReleased ? '🔴 (LIVE)' : ''}</span>
                  </div>
                  <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>

                <button class="br-accordion-btn btn-toggle-prize" data-target="prize-box-${match.id}">
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H7c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-2c-.55 0-1-.45-1-1v-2.34"></path><path d="M18 4H6v7a6 6 0 0 0 12 0V4z"></path></svg>
                    <span>Prize Pool</span>
                  </div>
                  <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>

              <!-- Collapsible Room Details Box -->
              <div class="br-collapsible-box ${isReleased ? 'open' : ''}" id="room-box-${match.id}" style="${isReleased ? 'display: block; background: #fff1f2; border-top: 1.5px solid #fecdd3;' : ''}">
                <div class="room-details-content">
                  ${isReleased ? `
                    <div style="background: #ffffff; border: 1px solid #fecdd3; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
                      
                      <!-- Room ID Row + 1-Tap Copy Button -->
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <div style="font-size: 10px; color: #64748b; font-weight: 700;">CUSTOM ROOM ID</div>
                          <div style="font-size: 16px; font-weight: 900; color: #dc2626; font-family: monospace; letter-spacing: 0.5px;">${roomId}</div>
                        </div>
                        <button class="btn-copy-credential" data-copy-val="${roomId}" data-label="Room ID" style="padding: 6px 12px; background: #fee2e2; border: 1px solid #fecdd3; border-radius: 6px; font-size: 11px; font-weight: 800; color: #dc2626; cursor: pointer;">
                          📋 Copy ID
                        </button>
                      </div>

                      <!-- Room Password Row + 1-Tap Copy Button -->
                      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #fee2e2; padding-top: 6px;">
                        <div>
                          <div style="font-size: 10px; color: #64748b; font-weight: 700;">ROOM PASSWORD</div>
                          <div style="font-size: 16px; font-weight: 900; color: #2563eb; font-family: monospace; letter-spacing: 0.5px;">${roomPass}</div>
                        </div>
                        <button class="btn-copy-credential" data-copy-val="${roomPass}" data-label="Password" style="padding: 6px 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; font-size: 11px; font-weight: 800; color: #2563eb; cursor: pointer;">
                          📋 Copy Pass
                        </button>
                      </div>

                      <div style="font-size: 10px; color: #059669; font-weight: 700; background: #ecfdf5; padding: 6px 8px; border-radius: 6px; text-align: center;">
                        🚀 Open Free Fire -> Custom -> Search Room ID -> Enter Pass!
                      </div>
                    </div>
                  ` : `
                    <div class="room-info-row">
                      <span class="label">Custom Room ID:</span>
                      <span class="val highlight" style="color: #94a3b8;">Pending Admin Release</span>
                    </div>
                    <div class="room-info-row">
                      <span class="label">Password:</span>
                      <span class="val highlight" style="color: #94a3b8;">Pending Admin Release</span>
                    </div>
                    <p class="room-notice">⚡ Admin will release the Custom Room ID & Password 15 minutes before match start time.</p>
                  `}
                </div>
              </div>

              <!-- Collapsible Prize Breakdown Box -->
              <div class="br-collapsible-box" id="prize-box-${match.id}">
                <div class="prize-details-content">
                  <div class="prize-item"><span>🥇 1st Place (Booyah):</span> <span class="prize-val" style="color:#10b981; font-weight:800;">${match.prize1st || match.prizePool || '৳1,000'}</span></div>
                  ${match.prize2nd ? `<div class="prize-item"><span>🥈 2nd Place:</span> <span class="prize-val" style="color:#3b82f6; font-weight:800;">${match.prize2nd}</span></div>` : ''}
                  ${match.prize3rd ? `<div class="prize-item"><span>🥉 3rd Place:</span> <span class="prize-val" style="color:#eab308; font-weight:800;">${match.prize3rd}</span></div>` : ''}
                  ${match.prizeKill ? `<div class="prize-item"><span>🎯 Per Kill / MVP:</span> <span class="prize-val" style="color:#06b6d4; font-weight:800;">${match.prizeKill}</span></div>` : ''}
                  <p class="room-notice">🎁 Cash (bKash/Nagad) or Diamonds credited instantly upon match completion by Mobin X Admin.</p>
                </div>
              </div>

              <!-- Bottom Green Starts In Countdown Bar -->
              <div class="br-starts-in-bar" style="${isReleased ? 'background: #dc2626;' : 'background: #059669;'}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>${isReleased ? 'ROOM IS LIVE NOW - ' : 'STARTS IN - '}</span>
                <span class="br-timer-clock" data-start-time="${startTimestamp}">${isReleased ? 'JOIN LOBBY' : 'Calculating...'}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// Live Countdown Interval
let countdownInterval = null;

export function bindTournamentsEvents() {
  // Clear any existing countdown ticker
  if (countdownInterval) clearInterval(countdownInterval);

  function updateCountdowns() {
    document.querySelectorAll('.tourn-live-countdown, .br-timer-clock').forEach(el => {
      const raw = el.getAttribute('data-start-time');
      if (!raw) return;
      const target = parseInt(raw);
      if (isNaN(target)) return;

      const diff = target - Date.now();
      if (diff <= 0) {
        el.textContent = el.classList.contains('tourn-live-countdown') ? '🔴 LIVE NOW' : 'LOBBY OPEN';
        if (el.classList.contains('tourn-live-countdown')) {
          el.style.background = 'rgba(239, 68, 68, 0.2)';
          el.style.color = '#ef4444';
        }
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (el.classList.contains('tourn-live-countdown')) {
        el.textContent = hours > 24 ? `⏳ ${Math.floor(hours / 24)}d ${hours % 24}h ${mins}m` : `⏳ ${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
      } else {
        el.textContent = `${String(hours).padStart(2, '0')}h:${String(mins).padStart(2, '0')}m:${String(secs).padStart(2, '0')}s`;
      }
    });
  }

  updateCountdowns();
  countdownInterval = setInterval(updateCountdowns, 1000);

  document.getElementById('btn-tourn-back')?.addEventListener('click', () => {
    if (countdownInterval) clearInterval(countdownInterval);
    stateManager.navigate('home');
  });

  document.getElementById('btn-refresh-tournaments')?.addEventListener('click', () => {
    Toast.show('Refreshing live BR Matches...', 'info');
    stateManager.navigate('tournaments');
  });

  // Toggle Accordion Boxes
  document.querySelectorAll('.btn-toggle-room, .btn-toggle-prize').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.getAttribute('data-target');
      const box = document.getElementById(targetId);
      if (box) {
        const isCurrentlyOpen = box.style.display === 'block' || box.classList.contains('open');
        box.style.display = isCurrentlyOpen ? 'none' : 'block';
        box.classList.toggle('open', !isCurrentlyOpen);
        const chevron = btn.querySelector('.chevron-icon');
        if (chevron) {
          chevron.style.transform = isCurrentlyOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        }
      }
    });
  });

  // 1-Tap Copy Credentials (Room ID & Password)
  document.querySelectorAll('.btn-copy-credential').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = btn.getAttribute('data-copy-val');
      const label = btn.getAttribute('data-label') || 'Code';

      if (navigator.clipboard) {
        navigator.clipboard.writeText(val).then(() => {
          Toast.show(`Copied ${label}: ${val}`, 'success');
        }).catch(() => {
          copyFallback(val, label);
        });
      } else {
        copyFallback(val, label);
      }
    });
  });

  function copyFallback(text, label) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    Toast.show(`Copied ${label}: ${text}`, 'success');
  }

  // Join Match Button
  document.querySelectorAll('.btn-join-match').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const match = tournamentService.getById(id);
      if (match) {
        stateManager.openModal('tournamentJoin', match);
      }
    });
  });
}
