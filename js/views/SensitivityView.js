import { sensitivityService, DEVICE_BRANDS, QUICK_FEATURED_MODELS } from '../services/sensitivityService.js';
import { stateManager } from '../services/stateManager.js';
import { Toast } from '../components/Toast.js';

// View State Management
let currentViewMode = 'brands'; // 'brands' | 'models' | 'result' | 'custom'
let selectedBrand = DEVICE_BRANDS[0];
let selectedDeviceName = 'VIVO Y1';
let currentSensiData = null;
let activePresetIndex = 0;
let isNoDpiMode = false;
let searchQuery = '';

export function renderSensitivityView() {
  if (!currentSensiData) {
    currentSensiData = sensitivityService.generateForDevice(selectedDeviceName, selectedBrand.id);
  }

  return `
    <div class="view-container sensitivity-view">
      
      <!-- Top Navigation Header -->
      <div class="subview-header">
        <div class="subview-header-left">
          ${currentViewMode !== 'brands' ? `
            <button class="back-btn" id="btn-sens-mode-back" title="Back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          ` : `
            <button class="back-btn" id="btn-sens-app-back" title="Home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          `}
          <h2 class="subview-title">
            ${currentViewMode === 'brands' ? '🎯 Sensitivity Maker' : (currentViewMode === 'models' ? `${selectedBrand.name} Devices` : `${selectedDeviceName}`)}
          </h2>
        </div>
        <span class="badge badge-primary">Free Fire OB45 Meta</span>
      </div>

      <!-- VIEW 1: BRAND SELECTION & QUICK SEARCH -->
      ${currentViewMode === 'brands' ? `
        <div class="sens-brand-container">
          
          <!-- Top Prominent Custom Sensitivity Maker Banner -->
          <div id="btn-prominent-custom-sens" style="background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; border-radius: var(--radius-xl); padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3); margin-bottom: 14px; border: 1.5px solid rgba(255, 255, 255, 0.25); transition: transform 0.15s ease;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="width: 44px; height: 44px; border-radius: 14px; background: rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; font-size: 22px;">
                ➕
              </div>
              <div>
                <div style="font-size: 15px; font-weight: 900; letter-spacing: 0.3px;">Custom Sensitivity Maker</div>
                <div style="font-size: 11.5px; opacity: 0.9; margin-top: 2px;">Build by Phone Model, RAM & Storage</div>
              </div>
            </div>
            <div style="background: #ffffff; color: #0284c7; font-size: 12px; font-weight: 800; padding: 6px 12px; border-radius: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
              BUILD →
            </div>
          </div>

          <!-- Search Bar -->
          <div class="sens-search-box">
            <span class="search-icon">🔍</span>
            <input type="text" id="sens-global-search" class="sens-search-input" placeholder="SEARCH YOUR PHONE MODEL (e.g. Y22, A54)..." value="${searchQuery}" />
            ${searchQuery ? `<button id="btn-clear-search" class="clear-search-btn">✕</button>` : ''}
          </div>

          <!-- Quick Featured Devices Bar -->
          <div class="sens-section-label">⚡ QUICK POPULAR DEVICES</div>
          <div class="sens-quick-chips">
            ${QUICK_FEATURED_MODELS.map(m => `
              <button class="sens-chip-btn" data-chip-model="${m.name}" data-chip-brand="${m.brand}">
                <span>📈</span>
                <span>${m.name}</span>
              </button>
            `).join('')}
          </div>

          <!-- Section Label -->
          <div class="sens-section-label" style="margin-top: 14px;">📱 CHOOSE YOUR DEVICE BRAND</div>

          <!-- 2-Column Brand Grid -->
          <div class="sens-brand-grid">
            ${DEVICE_BRANDS.map(b => `
              <div class="sens-brand-card" data-brand-id="${b.id}">
                <div class="brand-left">
                  <span class="brand-badge-icon">${b.icon}</span>
                  <span class="brand-name">${b.name}</span>
                </div>
                <span class="brand-chevron">›</span>
              </div>
            `).join('')}
          </div>

        </div>
      ` : ''}

      <!-- VIEW 4: DEDICATED CUSTOM SENSITIVITY BUILDER -->
      ${currentViewMode === 'custom' ? `
        <div style="padding: 16px; display: flex; flex-direction: column; gap: 16px;">
          
          <div style="background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-xl); padding: 18px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
            <div style="font-size: 16px; font-weight: 900; color: var(--text-main); margin-bottom: 4px;">🛠️ Custom Phone Specification Setup</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">Enter your phone hardware specs to calculate calibrated headshot sensitivity & DPI for Free Fire.</div>

            <div style="display: flex; flex-direction: column; gap: 14px;">
              <div>
                <label style="display: block; font-size: 12px; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">Device Brand *</label>
                <select id="custom-spec-brand" style="width: 100%; padding: 10px 12px; border: 1.5px solid var(--border-light); border-radius: var(--radius-md); font-size: 13px; font-weight: 700; background: #ffffff; outline: none;">
                  <option value="xiaomi">Xiaomi / Redmi / Poco</option>
                  <option value="samsung">Samsung Galaxy</option>
                  <option value="realme">Realme</option>
                  <option value="vivo">Vivo / iQOO</option>
                  <option value="oppo">Oppo</option>
                  <option value="infinix">Infinix</option>
                  <option value="tecno">Tecno</option>
                  <option value="oneplus">OnePlus</option>
                  <option value="apple">Apple iPhone</option>
                  <option value="other">Other Android Device</option>
                </select>
              </div>

              <div>
                <label style="display: block; font-size: 12px; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">Phone Model Name *</label>
                <input type="text" id="custom-spec-model" placeholder="e.g. Note 12 Pro 5G / Y20 / A14" style="width: 100%; padding: 10px 12px; border: 1.5px solid var(--border-light); border-radius: var(--radius-md); font-size: 13px; font-weight: 600; outline: none;" />
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                  <label style="display: block; font-size: 12px; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">RAM *</label>
                  <select id="custom-spec-ram" style="width: 100%; padding: 10px 12px; border: 1.5px solid var(--border-light); border-radius: var(--radius-md); font-size: 13px; font-weight: 700; background: #ffffff; outline: none;">
                    <option value="2">2 GB RAM</option>
                    <option value="3">3 GB RAM</option>
                    <option value="4" selected>4 GB RAM</option>
                    <option value="6">6 GB RAM</option>
                    <option value="8">8 GB RAM</option>
                    <option value="12">12 GB+ RAM</option>
                  </select>
                </div>

                <div>
                  <label style="display: block; font-size: 12px; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">Internal Storage *</label>
                  <select id="custom-spec-storage" style="width: 100%; padding: 10px 12px; border: 1.5px solid var(--border-light); border-radius: var(--radius-md); font-size: 13px; font-weight: 700; background: #ffffff; outline: none;">
                    <option value="32">32 GB</option>
                    <option value="64">64 GB</option>
                    <option value="128" selected>128 GB</option>
                    <option value="256">256 GB</option>
                    <option value="512">512 GB</option>
                  </select>
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 12px; font-weight: 800; color: var(--text-main); margin-bottom: 6px;">Screen Refresh Rate</label>
                <select id="custom-spec-refresh" style="width: 100%; padding: 10px 12px; border: 1.5px solid var(--border-light); border-radius: var(--radius-md); font-size: 13px; font-weight: 700; background: #ffffff; outline: none;">
                  <option value="60">60 Hz Standard Display</option>
                  <option value="90" selected>90 Hz Smooth Display</option>
                  <option value="120">120 Hz Ultra Fast Display</option>
                </select>
              </div>

              <button id="btn-generate-custom-specs-sens" style="margin-top: 8px; width: 100%; height: 50px; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; border: none; border-radius: var(--radius-md); font-size: 14.5px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 6px 18px rgba(37, 99, 235, 0.35);">
                <span>⚡</span>
                <span>CALCULATE CALIBRATED SENSITIVITY</span>
              </button>
            </div>
          </div>

        </div>
      ` : ''}

      <!-- VIEW 2: MODEL LIST FOR SELECTED BRAND -->
      ${currentViewMode === 'models' ? `
        <div class="sens-model-container">
          
          <div class="sens-model-header-box">
            <div class="brand-header-info">
              <span class="brand-large-icon">${selectedBrand.icon}</span>
              <div>
                <h3>${selectedBrand.name} SETTINGS</h3>
                <p>Select your exact model for 100% verified crosshair calibrator</p>
              </div>
            </div>
          </div>

          <!-- Model Search Input -->
          <div class="sens-search-box" style="margin-bottom: 12px;">
            <span class="search-icon">🎯</span>
            <input type="text" id="sens-model-search" class="sens-search-input" placeholder="Search ${selectedBrand.name} model..." />
          </div>

          <div class="sens-model-list" id="sens-model-list-root">
            ${renderModelListItems(selectedBrand.popularModels)}
          </div>

        </div>
      ` : ''}

      <!-- VIEW 3: SENSI RESULT SCREEN (Ref: Screenshot 3) -->
      ${currentViewMode === 'result' ? `
        <div class="sens-result-container">
          
          <!-- Device Header -->
          <div class="sens-device-badge">
            <div class="device-name-row">
              <span class="icon">📱</span>
              <h3>${currentSensiData.deviceName}</h3>
            </div>
            <div class="device-sub-status">
              RECOMMENDED SENSI ${currentSensiData.presets[activePresetIndex].tabName} | 100% HEADSHOT ACCURACY
            </div>
          </div>

          <!-- Presets Selector Tabs (Ref: # 1, # 2, VIP 3, VIP 4) -->
          <div class="sens-presets-bar">
            ${currentSensiData.presets.map((p, idx) => `
              <button class="preset-tab-btn ${activePresetIndex === idx ? 'active' : ''} ${p.isVip ? 'vip' : ''}" data-preset-index="${idx}">
                ${p.isVip ? '<span class="vip-tag">VIP</span>' : ''}
                <span>${p.tabName}</span>
              </button>
            `).join('')}
          </div>

          <!-- Active Preset Description -->
          <div class="preset-desc-pill">
            <strong>${currentSensiData.presets[activePresetIndex].title}</strong>: ${currentSensiData.presets[activePresetIndex].subtitle}
          </div>

          <!-- Sensitivity Sliders Card -->
          <div class="sens-sliders-card">
            
            <!-- General Slider -->
            <div class="sens-slider-group">
              <div class="slider-label-row">
                <span class="slider-title">General</span>
                <span class="slider-value" id="val-general">${isNoDpiMode ? currentSensiData.presets[activePresetIndex].noDpiGeneral : currentSensiData.presets[activePresetIndex].general}</span>
              </div>
              <div class="slider-track-wrap">
                <input type="range" class="sens-range-slider" min="100" max="200" value="${isNoDpiMode ? currentSensiData.presets[activePresetIndex].noDpiGeneral : currentSensiData.presets[activePresetIndex].general}" readonly />
              </div>
            </div>

            <!-- Red Dot Slider -->
            <div class="sens-slider-group">
              <div class="slider-label-row">
                <span class="slider-title">Red Dot</span>
                <span class="slider-value" id="val-reddot">${currentSensiData.presets[activePresetIndex].redDot}</span>
              </div>
              <div class="slider-track-wrap">
                <input type="range" class="sens-range-slider" min="100" max="200" value="${currentSensiData.presets[activePresetIndex].redDot}" readonly />
              </div>
            </div>

            <!-- 2x Scope Slider -->
            <div class="sens-slider-group">
              <div class="slider-label-row">
                <span class="slider-title">2x Scope</span>
                <span class="slider-value" id="val-scope2x">${currentSensiData.presets[activePresetIndex].scope2x}</span>
              </div>
              <div class="slider-track-wrap">
                <input type="range" class="sens-range-slider" min="100" max="200" value="${currentSensiData.presets[activePresetIndex].scope2x}" readonly />
              </div>
            </div>

            <!-- 4x Scope Slider -->
            <div class="sens-slider-group">
              <div class="slider-label-row">
                <span class="slider-title">4x Scope</span>
                <span class="slider-value" id="val-scope4x">${currentSensiData.presets[activePresetIndex].scope4x}</span>
              </div>
              <div class="slider-track-wrap">
                <input type="range" class="sens-range-slider" min="100" max="200" value="${currentSensiData.presets[activePresetIndex].scope4x}" readonly />
              </div>
            </div>

            <!-- Button & DPI Row (Ref: BUTTON: 44%, DPI: 480) -->
            <div class="sens-info-split-row">
              <div class="sens-info-pill">
                <span class="dot-icon">🎯</span>
                <span>BUTTON: <strong style="color:#10b981 !important; font-size:13px; font-weight:900;">${currentSensiData.presets[activePresetIndex].buttonSize || '44%'}</strong></span>
              </div>
              <div class="sens-info-pill ${isNoDpiMode ? 'no-dpi' : ''}">
                <span class="dot-icon">📱</span>
                <span>DPI: <strong style="color:${isNoDpiMode ? '#eab308' : '#38bdf8'} !important; font-size:13px; font-weight:900;">${isNoDpiMode ? 'Default (No DPI)' : (currentSensiData.presets[activePresetIndex].dpi || '480 DPI')}</strong></span>
              </div>
            </div>

          </div>

          <!-- Action Buttons (Ref: SHARE, NO DPI, SAVE) -->
          <div class="sens-action-buttons-row">
            <button class="sens-action-btn" id="btn-sens-share">
              <span>↗️</span>
              <span>SHARE</span>
            </button>
            <button class="sens-action-btn ${isNoDpiMode ? 'active' : ''}" id="btn-sens-nodpi" title="Toggle No DPI Mode">
              <span>✨</span>
              <span>${isNoDpiMode ? 'USE DPI' : 'NO DPI'}</span>
            </button>
            <button class="sens-action-btn" id="btn-sens-save">
              <span>💾</span>
              <span>SAVE</span>
            </button>
          </div>

          <!-- Community Feedback Row (Ref: NOT WORKING / IT WORKS) -->
          <div class="sens-feedback-row">
            <button class="btn-feedback not-working ${currentSensiData.feedback.userVote === 'notWorking' ? 'voted' : ''}" id="btn-vote-not-working">
              <span class="icon">👎</span>
              <div class="text-col">
                <span class="title">NOT WORKING</span>
                <span class="count" id="count-not-working">${currentSensiData.feedback.notWorking}</span>
              </div>
            </button>

            <button class="btn-feedback it-works ${currentSensiData.feedback.userVote === 'itWorks' ? 'voted' : ''}" id="btn-vote-it-works">
              <span class="icon">👍</span>
              <div class="text-col">
                <span class="title">IT WORKS</span>
                <span class="count" id="count-it-works">${currentSensiData.feedback.itWorks}</span>
              </div>
            </button>
          </div>

          <!-- Helper Guides Links (Ref: How To Use? | Where's "Sniper" & "Free Look"?) -->
          <div class="sens-helper-links-row">
            <button class="sens-link-btn" id="btn-guide-how-to-use">
              <span>🏃</span>
              <span>How To Use?</span>
            </button>
            <span class="divider">•</span>
            <button class="sens-link-btn" id="btn-guide-sniper-freelook">
              <span>🎯</span>
              <span>Where's "Sniper" & "Free Look"?</span>
            </button>
          </div>

        </div>
      ` : ''}

    </div>
  `;
}

function renderModelListItems(models) {
  if (!models || models.length === 0) {
    return `<div style="text-align: center; padding: 20px; color: var(--text-muted);">No models found</div>`;
  }
  return models.map(m => `
    <div class="sens-model-item" data-model-name="${m}">
      <span class="model-name">${m}</span>
      <span class="model-select-arrow">📲</span>
    </div>
  `).join('');
}

export function bindSensitivityEvents() {
  // Navigation Back Button
  document.getElementById('btn-sens-app-back')?.addEventListener('click', () => {
    stateManager.navigate('home');
  });

  document.getElementById('btn-sens-mode-back')?.addEventListener('click', () => {
    if (currentViewMode === 'result') {
      currentViewMode = 'models';
    } else if (currentViewMode === 'models' || currentViewMode === 'custom') {
      currentViewMode = 'brands';
    }
    stateManager.notify();
  });

  // Prominent Custom Sens Button
  document.getElementById('btn-prominent-custom-sens')?.addEventListener('click', () => {
    currentViewMode = 'custom';
    stateManager.notify();
  });

  // Calculate Custom Specs Sens
  document.getElementById('btn-generate-custom-specs-sens')?.addEventListener('click', () => {
    const brand = document.getElementById('custom-spec-brand')?.value || 'other';
    const model = (document.getElementById('custom-spec-model')?.value || '').trim() || 'Custom Phone';
    const ram = parseInt(document.getElementById('custom-spec-ram')?.value) || 4;
    const storage = parseInt(document.getElementById('custom-spec-storage')?.value) || 128;
    const refresh = parseInt(document.getElementById('custom-spec-refresh')?.value) || 90;

    selectedDeviceName = `${model} (${ram}GB/${storage}GB)`;
    currentSensiData = sensitivityService.generateForDevice(selectedDeviceName, brand);

    if (ram <= 3) {
      currentSensiData.general = 100;
      currentSensiData.redDot = 98;
      currentSensiData.scope2x = 95;
      currentSensiData.scope4x = 90;
      currentSensiData.dpi = "Default (No DPI)";
      currentSensiData.graphics = "Smooth / High FPS";
    } else if (ram >= 8) {
      currentSensiData.general = 95;
      currentSensiData.redDot = 92;
      currentSensiData.scope2x = 88;
      currentSensiData.scope4x = 84;
      currentSensiData.dpi = (refresh >= 120) ? "440 DPI" : "410 DPI";
      currentSensiData.graphics = "Ultra / High FPS";
    }

    activePresetIndex = 0;
    isNoDpiMode = false;
    currentViewMode = 'result';
    Toast.show(`🔥 Calibrated Sensitivity generated for ${selectedDeviceName}!`, 'success');
    stateManager.notify();
  });

  // Brand click
  document.querySelectorAll('.sens-brand-card').forEach(card => {
    card.addEventListener('click', () => {
      const bId = card.dataset.brandId;
      const found = DEVICE_BRANDS.find(b => b.id === bId);
      if (found) {
        selectedBrand = found;
        currentViewMode = 'models';
        stateManager.notify();
      }
    });
  });

  // Quick chips
  document.querySelectorAll('.sens-chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mName = btn.dataset.chipModel;
      const bId = btn.dataset.chipBrand;
      selectedDeviceName = mName;
      currentSensiData = sensitivityService.generateForDevice(selectedDeviceName, bId);
      activePresetIndex = 0;
      isNoDpiMode = false;
      currentViewMode = 'result';
      stateManager.notify();
    });
  });

  // Model selection
  document.querySelectorAll('.sens-model-item').forEach(item => {
    item.addEventListener('click', () => {
      selectedDeviceName = item.dataset.modelName;
      currentSensiData = sensitivityService.generateForDevice(selectedDeviceName, selectedBrand.id);
      activePresetIndex = 0;
      isNoDpiMode = false;
      currentViewMode = 'result';
      stateManager.notify();
    });
  });

  // Global Search in Brands
  const searchInput = document.getElementById('sens-global-search');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    if (!searchQuery) {
      document.querySelectorAll('.sens-brand-card').forEach(c => c.style.display = 'flex');
      return;
    }
    document.querySelectorAll('.sens-brand-card').forEach(c => {
      const bId = c.dataset.brandId;
      const brand = DEVICE_BRANDS.find(b => b.id === bId);
      const matchesBrand = brand && brand.name.toLowerCase().includes(searchQuery);
      const matchesModel = brand && brand.popularModels.some(m => m.toLowerCase().includes(searchQuery));
      c.style.display = (matchesBrand || matchesModel) ? 'flex' : 'none';
    });
  });

  document.getElementById('btn-clear-search')?.addEventListener('click', () => {
    searchQuery = '';
    stateManager.notify();
  });

  // Model Search within a Brand
  const modelSearch = document.getElementById('sens-model-search');
  modelSearch?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('.sens-model-item').forEach(item => {
      const name = item.dataset.modelName.toLowerCase();
      item.style.display = name.includes(q) ? 'flex' : 'none';
    });
  });

  // Custom Generator button
  document.getElementById('btn-open-custom-gen')?.addEventListener('click', () => {
    selectedDeviceName = 'Custom Gaming Device';
    currentSensiData = sensitivityService.generateForDevice(selectedDeviceName, 'custom');
    activePresetIndex = 0;
    isNoDpiMode = false;
    currentViewMode = 'result';
    stateManager.notify();
  });

  // Presets Selector (#1, #2, VIP 3, VIP 4)
  document.querySelectorAll('.preset-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activePresetIndex = parseInt(btn.dataset.presetIndex) || 0;
      stateManager.notify();
    });
  });

  // NO DPI Toggle Button
  document.getElementById('btn-sens-nodpi')?.addEventListener('click', () => {
    isNoDpiMode = !isNoDpiMode;
    Toast.show(isNoDpiMode ? '✨ No DPI Mode: Use default phone display scaling' : '📱 DPI Mode: Calibrated for Developer Options DPI', 'info');
    stateManager.notify();
  });

  // Share Button
  document.getElementById('btn-sens-share')?.addEventListener('click', async () => {
    const preset = currentSensiData.presets[activePresetIndex];
    const text = `🎯 Free Fire Headshot Sensi for ${currentSensiData.deviceName} (${preset.tabName}):\n• General: ${isNoDpiMode ? preset.noDpiGeneral : preset.general}\n• Red Dot: ${preset.redDot}\n• 2x Scope: ${preset.scope2x}\n• 4x Scope: ${preset.scope4x}\n• Button Size: ${preset.buttonSize}\n• DPI: ${isNoDpiMode ? 'Default (No DPI)' : preset.dpi}\n⚡ Get Mobin X App: https://mobinx-gaming-app.vercel.app/`;
    
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        Toast.show('Sensitivity copied to clipboard! Share with your squad.', 'success');
      } catch (e) {
        Toast.show('Sensitivity config ready!', 'info');
      }
    } else {
      Toast.show('Sensitivity config ready!', 'info');
    }
  });

  // Save Button
  document.getElementById('btn-sens-save')?.addEventListener('click', () => {
    const success = sensitivityService.saveSensitivity({
      deviceName: currentSensiData.deviceName,
      activePreset: currentSensiData.presets[activePresetIndex]
    });
    if (success) {
      Toast.show('Saved to your profile sensitivities!', 'success');
    } else {
      Toast.show('Sensitivity saved locally.', 'info');
    }
  });

  // Feedback Buttons
  document.getElementById('btn-vote-it-works')?.addEventListener('click', () => {
    const updated = sensitivityService.recordFeedback(currentSensiData.deviceName, 'itWorks');
    currentSensiData.feedback = updated;
    Toast.show('Thanks for your feedback! Headshot confirmed. 🎯🔥', 'success');
    stateManager.notify();
  });

  document.getElementById('btn-vote-not-working')?.addEventListener('click', () => {
    const updated = sensitivityService.recordFeedback(currentSensiData.deviceName, 'notWorking');
    currentSensiData.feedback = updated;
    Toast.show('Feedback received. Try Preset #2 or toggle NO DPI mode.', 'warning');
    stateManager.notify();
  });

  // Guide Helper Modals
  document.getElementById('btn-guide-how-to-use')?.addEventListener('click', () => {
    stateManager.openModal({
      type: 'sensitivityGuide',
      data: {
        title: 'How To Apply Sensitivity & Drag',
        content: `
          <div style="font-size: 13px; line-height: 1.6; color: var(--text-main);">
            <p><strong>1. In-Game Settings:</strong> Open Free Fire ➔ Settings ➔ Sensitivity. Enter the exact values displayed for General, Red Dot, 2x, and 4x Scopes.</p>
            <p style="margin-top: 8px;"><strong>2. Fire Button Placement:</strong> Set your fire button size to the recommended percentage (${currentSensiData.presets[activePresetIndex].buttonSize}) and place it slightly lower in your custom HUD to allow longer vertical drag distance.</p>
            <p style="margin-top: 8px;"><strong>3. Safe DPI:</strong> If you use DPI, set Developer Options ➔ Smallest Width to <strong>${currentSensiData.presets[activePresetIndex].dpi}</strong>. Or toggle <em>NO DPI</em> if you prefer default phone settings.</p>
            <p style="margin-top: 8px;"><strong>4. Drag Technique:</strong> For close range, pull down then straight up (J-drag). For medium/long range, drag up smoothly.</p>
          </div>
        `
      }
    });
  });

  document.getElementById('btn-guide-sniper-freelook')?.addEventListener('click', () => {
    stateManager.openModal({
      type: 'sensitivityGuide',
      data: {
        title: 'Where are Sniper & Free Look?',
        content: `
          <div style="font-size: 13px; line-height: 1.6; color: var(--text-main);">
            <p><strong>Sniper Scope (AWM, M82B, Kar98k):</strong> Set to <strong>${currentSensiData.presets[activePresetIndex].sniper}</strong>. In modern esports meta, sniper scope sensitivity should not be higher than 130 to prevent aim shaking when leading moving targets.</p>
            <p style="margin-top: 8px;"><strong>Free Look Eye Button:</strong> Set to <strong>${currentSensiData.presets[activePresetIndex].freeLook}</strong> for quick 360° situational awareness without shifting your aim trajectory.</p>
          </div>
        `
      }
    });
  });
}
