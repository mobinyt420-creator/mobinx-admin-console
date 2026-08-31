import { authService } from '../services/authService.js';
import { stateManager } from '../services/stateManager.js';
import { firebaseService } from '../services/firebaseService.js';
import { Toast } from '../components/Toast.js';
import { openExternalStore } from '../services/browserService.js';

// View state
let activeAuthMode = 'welcome'; // 'welcome' | 'auth-select'
let pendingGoogleUser = null;
let pendingPhoneAuth = null;
let otpCountdownTimer = null;
let otpTimeRemaining = 60;

export function renderOnboardingView() {
  if (activeAuthMode === 'auth-select') {
    return renderAuthSelectionView();
  }
  return renderWelcomeStep();
}

/**
 * Screen 1: Welcome / Intro Flow
 */
function renderWelcomeStep() {
  return `
    <div class="view-container onboarding-view onboarding-step-1" style="min-height: 100%; height: 100%; box-sizing: border-box; background: radial-gradient(circle at 50% 25%, #061e4f 0%, #030d24 60%, #010614 100%); color: #ffffff; padding: 24px 20px calc(24px + var(--safe-bottom)) 20px; display: flex; flex-direction: column; justify-content: space-between; overflow-y: auto;">
      
      <!-- Top Branding -->
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-top: 6px;">
        <div style="width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(37, 99, 235, 0.45); margin-bottom: 10px; border: 1.5px solid rgba(56, 189, 248, 0.4);">
          <img src="assets/images/mobinx_icon_512.png" alt="Mobin X" style="width: 46px; height: 46px; border-radius: 12px; object-fit: cover;" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'white\\'><path d=\\'M4 5L12 13L20 5V19H16V10L12 14L8 10V19H4V5Z\\'/></svg>';" />
        </div>

        <span style="font-size: 13.5px; font-weight: 600; color: #cbd5e1; letter-spacing: 0.2px;">Welcome to</span>
        <h1 style="font-size: 32px; font-weight: 900; color: #38bdf8; margin: 2px 0 4px 0; font-family: var(--font-heading); letter-spacing: -0.5px; text-shadow: 0 0 20px rgba(56, 189, 248, 0.4);">
          Mobin X
        </h1>
        <p style="font-size: 13px; color: #94a3b8; margin: 0; font-weight: 500;">
          Your Ultimate Gaming Hub
        </p>
      </div>

      <!-- Center 3D Controller Pedestal Art -->
      <div style="display: flex; justify-content: center; align-items: center; margin: 12px 0; position: relative;">
        <div style="position: absolute; width: 220px; height: 220px; background: radial-gradient(circle, rgba(2, 132, 199, 0.3) 0%, rgba(2, 132, 199, 0) 70%); border-radius: 50%; filter: blur(20px); pointer-events: none;"></div>
        <img 
          src="assets/images/onboarding_controller.jpg" 
          alt="Mobin X Gaming Controller" 
          style="width: 180px; height: 180px; object-fit: cover; border-radius: 26px; border: 1.5px solid rgba(56, 189, 248, 0.3); box-shadow: 0 12px 35px rgba(2, 132, 199, 0.35); position: relative; z-index: 2;"
        />
      </div>

      <!-- 3 Feature Highlight Cards -->
      <div style="display: flex; flex-direction: column; gap: 9px; margin-bottom: 16px;">
        
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.22); backdrop-filter: blur(10px); border-radius: 14px; padding: 10px 14px; display: flex; align-items: center; gap: 14px;">
          <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.25); display: flex; align-items: center; justify-content: center; font-size: 19px; flex-shrink: 0;">
            💎
          </div>
          <div>
            <div style="font-size: 13.5px; font-weight: 800; color: #ffffff; letter-spacing: 0.2px;">Top Up & Diamonds</div>
            <div style="font-size: 11.5px; color: #94a3b8; font-weight: 500;">Fast & secure instant top up</div>
          </div>
        </div>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(245, 158, 11, 0.22); backdrop-filter: blur(10px); border-radius: 14px; padding: 10px 14px; display: flex; align-items: center; gap: 14px;">
          <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.25); display: flex; align-items: center; justify-content: center; font-size: 19px; flex-shrink: 0;">
            🏆
          </div>
          <div>
            <div style="font-size: 13.5px; font-weight: 800; color: #ffffff; letter-spacing: 0.2px;">Tournaments</div>
            <div style="font-size: 11.5px; color: #94a3b8; font-weight: 500;">Join daily exciting battles</div>
          </div>
        </div>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(168, 85, 247, 0.22); backdrop-filter: blur(10px); border-radius: 14px; padding: 10px 14px; display: flex; align-items: center; gap: 14px;">
          <div style="width: 38px; height: 38px; border-radius: 10px; background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.25); display: flex; align-items: center; justify-content: center; font-size: 19px; flex-shrink: 0;">
            🎁
          </div>
          <div>
            <div style="font-size: 13.5px; font-weight: 800; color: #ffffff; letter-spacing: 0.2px;">Rewards & Pro Tools</div>
            <div style="font-size: 11.5px; color: #94a3b8; font-weight: 500;">Custom sensitivity & downloads</div>
          </div>
        </div>

      </div>

      <!-- Bottom Action Button -->
      <div style="display: flex; flex-direction: column; gap: 10px; align-items: center; width: 100%;">
        <button id="btn-onboard-start" style="width: 100%; height: 50px; background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%); color: #ffffff; border: none; border-radius: 14px; font-size: 15px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 8px 24px rgba(0, 102, 255, 0.45); transition: transform 0.15s ease;">
          <span>Let's Get Started</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

    </div>
  `;
}

/**
 * Screen 2: Clean, Minimal Authentication Selection Screen (Two Compact Cards)
 */
function renderAuthSelectionView() {
  const authSettings = authService.getAuthSettings();
  const isGoogleEnabled = authSettings.googleLoginEnabled !== false;
  const isManualEnabled = authSettings.manualLoginEnabled !== false;

  return `
    <div class="view-container onboarding-view onboarding-auth-select" style="min-height: 100%; height: 100%; box-sizing: border-box; background: #060b18; color: #ffffff; padding: 24px 18px calc(20px + var(--safe-bottom)) 18px; display: flex; flex-direction: column; justify-content: space-between; overflow-y: auto; position: relative;">
      
      <!-- Top Ambient Glow -->
      <div style="position: absolute; top: -40px; left: 50%; transform: translateX(-50%); width: 280px; height: 160px; background: radial-gradient(circle, rgba(2, 132, 199, 0.22) 0%, rgba(2, 132, 199, 0) 70%); border-radius: 50%; pointer-events: none;"></div>

      <div style="position: relative; z-index: 2; width: 100%;">
        
        <!-- Header Branding -->
        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; margin-top: 10px; margin-bottom: 24px;">
          <div style="width: 54px; height: 54px; border-radius: 16px; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 22px rgba(37, 99, 235, 0.4); margin-bottom: 10px; border: 1.5px solid rgba(56, 189, 248, 0.4);">
            <img src="assets/images/mobinx_icon_512.png" alt="Mobin X" style="width: 44px; height: 44px; border-radius: 12px; object-fit: cover;" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'white\\'><path d=\\'M4 5L12 13L20 5V19H16V10L12 14L8 10V19H4V5Z\\'/></svg>';" />
          </div>
          <h2 style="font-size: 22px; font-weight: 900; color: #ffffff; margin: 0; letter-spacing: 0.5px; font-family: var(--font-heading);">MOBIN X</h2>
          <span style="font-size: 11px; font-weight: 800; color: #38bdf8; letter-spacing: 1.2px; text-transform: uppercase; margin-top: 2px;">Sign In to Continue</span>
        </div>

        <!-- Inline Error Alert Box (Hidden by default) -->
        <div id="auth-error-box" style="display: none; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 12px; padding: 10px 14px; margin-bottom: 18px; font-size: 12.5px; color: #fca5a5; font-weight: 600; line-height: 1.4; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">⚠️</span>
          <span id="auth-error-text" style="flex: 1;">Authentication notice</span>
        </div>

        <!-- 2 COMPACT CARDS CONTAINER (EQUAL SIZE & WEIGHT) -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">
          
          <!-- CARD 1: MANUAL LOGIN (Dark/Neon Mobin X Language) -->
          <div 
            id="card-manual-login" 
            role="button"
            tabindex="0"
            style="background: #0f172a; border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 16px; padding: 16px 12px; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: space-between; min-height: 130px; cursor: pointer; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4); transition: transform 0.15s ease, border-color 0.15s ease; ${!isManualEnabled ? 'opacity: 0.5; pointer-events: none;' : ''}"
          >
            <div style="width: 42px; height: 42px; border-radius: 12px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <div>
              <div style="font-size: 13.5px; font-weight: 800; color: #ffffff; margin-bottom: 2px;">Manual Login</div>
              <div style="font-size: 11px; color: #94a3b8; font-weight: 500;">Email & Password</div>
            </div>
            <div style="font-size: 10.5px; font-weight: 700; color: #38bdf8; margin-top: 6px;">
              ${isManualEnabled ? 'Sign In →' : 'Unavailable'}
            </div>
          </div>

          <!-- CARD 2: GOOGLE LOGIN (Clean White Surface with Official G Logo) -->
          <div 
            id="card-google-login" 
            role="button"
            tabindex="0"
            style="background: #ffffff; border: 1.5px solid #ffffff; border-radius: 16px; padding: 16px 12px; display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: space-between; min-height: 130px; cursor: pointer; box-shadow: 0 8px 24px rgba(56, 189, 248, 0.3); transition: transform 0.15s ease; ${!isGoogleEnabled ? 'opacity: 0.5; pointer-events: none;' : ''}"
          >
            <div style="width: 42px; height: 42px; border-radius: 12px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <div style="font-size: 13.5px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">Google Login</div>
              <div style="font-size: 11px; color: #64748b; font-weight: 600;">Fast & Direct</div>
            </div>
            <div style="font-size: 10.5px; font-weight: 800; color: #2563eb; margin-top: 6px;">
              ${isGoogleEnabled ? 'Continue →' : 'Unavailable'}
            </div>
          </div>

        </div>

        <!-- Quick Help Note / Fallback Tip -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; padding: 12px 14px; text-align: center;">
          <div style="font-size: 12px; color: #cbd5e1; font-weight: 500;">
            👑 <strong style="color: #38bdf8;">Google Login</strong> is the recommended instant login method. If unavailable, use <strong style="color: #38bdf8;">Manual Login</strong>.
          </div>
        </div>

      </div>

      <!-- Bottom Privacy Policy & Terms Link -->
      <div style="position: relative; z-index: 2; margin-top: 16px; text-align: center;">
        <span style="font-size: 11px; color: #64748b;">By continuing, you agree to our </span>
        <a href="javascript:void(0)" id="link-auth-privacy" style="font-size: 11px; font-weight: 700; color: #38bdf8; text-decoration: underline;">Privacy Policy</a>
      </div>

    </div>

    <!-- 1. GOOGLE COMPLETE PROFILE MODAL -->
    <div id="modal-google-profile" style="display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.82); backdrop-filter: blur(8px); z-index: 9999; align-items: center; justify-content: center; padding: 18px;">
      <div style="background: #0f172a; border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 22px; padding: 22px 18px; width: 100%; max-width: 360px; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6); color: #ffffff;">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); display: flex; align-items: center; justify-content: center; font-size: 22px; margin: 0 auto 8px auto;">
            👤
          </div>
          <h3 style="font-size: 17px; font-weight: 800; color: #ffffff; margin: 0 0 2px 0;">Complete Your Profile</h3>
          <p style="font-size: 11.5px; color: #94a3b8; margin: 0;">Authenticated with <span id="gp-email-badge" style="color: #38bdf8; font-weight: 700;">Google</span></p>
        </div>

        <form id="form-google-profile" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">Full Name *</label>
            <div style="display: flex; align-items: center; border: 1.5px solid rgba(56, 189, 248, 0.3); border-radius: 12px; background: rgba(2, 6, 23, 0.6); padding: 0 12px; height: 44px;">
              <input type="text" id="gp-fullname" placeholder="Your full name" style="border: none; outline: none; background: transparent; width: 100%; height: 100%; font-size: 13.5px; color: #ffffff; font-weight: 600;" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">Phone Number *</label>
            <div style="display: flex; align-items: center; border: 1.5px solid rgba(56, 189, 248, 0.3); border-radius: 12px; background: rgba(2, 6, 23, 0.6); padding: 0 12px; height: 44px;">
              <input type="tel" id="gp-phone" placeholder="01XXXXXXXXX (11 digits)" maxlength="14" style="border: none; outline: none; background: transparent; width: 100%; height: 100%; font-size: 13.5px; color: #ffffff; font-weight: 600;" />
            </div>
          </div>

          <div id="gp-error-msg" style="display: none; font-size: 11.5px; color: #fca5a5; background: rgba(239, 68, 68, 0.2); padding: 8px 10px; border-radius: 8px; font-weight: 600;"></div>

          <div style="display: flex; gap: 10px; margin-top: 4px;">
            <button type="button" id="btn-gp-cancel" style="flex: 1; height: 44px; background: rgba(255, 255, 255, 0.1); border: none; border-radius: 12px; font-size: 13px; font-weight: 700; color: #cbd5e1; cursor: pointer;">
              Cancel
            </button>
            <button type="button" id="btn-gp-submit" style="flex: 1.5; height: 44px; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); border: none; border-radius: 12px; font-size: 13.5px; font-weight: 800; color: #ffffff; cursor: pointer; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 2. MANUAL LOGIN MODAL -->
    <div id="modal-manual-login" style="display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.82); backdrop-filter: blur(8px); z-index: 9999; align-items: center; justify-content: center; padding: 18px;">
      <div style="background: #0f172a; border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 22px; padding: 22px 18px; width: 100%; max-width: 360px; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6); color: #ffffff;">
        <div style="text-align: center; margin-bottom: 14px;">
          <div style="width: 46px; height: 46px; border-radius: 14px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); display: flex; align-items: center; justify-content: center; font-size: 20px; margin: 0 auto 8px auto;">
            🔑
          </div>
          <h3 style="font-size: 17px; font-weight: 800; color: #ffffff; margin: 0 0 2px 0;">Manual Login</h3>
          <span style="font-size: 11.5px; color: #94a3b8;">Enter email and password</span>
        </div>

        <form id="form-manual-signin" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 11px;">
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">Email / Gmail *</label>
            <div style="display: flex; align-items: center; border: 1.5px solid rgba(56, 189, 248, 0.3); border-radius: 12px; background: rgba(2, 6, 23, 0.6); padding: 0 12px; height: 44px;">
              <input type="email" id="ml-email" placeholder="gamer@gmail.com" autocomplete="email" style="border: none; outline: none; background: transparent; width: 100%; height: 100%; font-size: 13px; color: #ffffff; font-weight: 600;" />
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label style="font-size: 12px; font-weight: 700; color: #cbd5e1;">Password *</label>
              <a href="javascript:void(0)" id="ml-link-forgot" style="font-size: 11px; font-weight: 700; color: #38bdf8; text-decoration: none;">Forgot Password?</a>
            </div>
            <div style="display: flex; align-items: center; border: 1.5px solid rgba(56, 189, 248, 0.3); border-radius: 12px; background: rgba(2, 6, 23, 0.6); padding: 0 12px; height: 44px;">
              <input type="password" id="ml-password" placeholder="Enter password" autocomplete="current-password" style="border: none; outline: none; background: transparent; width: 100%; height: 100%; font-size: 13px; color: #ffffff; font-weight: 600;" />
            </div>
          </div>

          <div id="ml-error-msg" style="display: none; font-size: 11.5px; color: #fca5a5; background: rgba(239, 68, 68, 0.2); padding: 8px 10px; border-radius: 8px; font-weight: 600;"></div>

          <div style="display: flex; gap: 10px; margin-top: 4px;">
            <button type="button" id="btn-ml-cancel" style="flex: 1; height: 44px; background: rgba(255, 255, 255, 0.1); border: none; border-radius: 12px; font-size: 13px; font-weight: 700; color: #cbd5e1; cursor: pointer;">
              Cancel
            </button>
            <button type="button" id="btn-ml-submit" style="flex: 1.5; height: 44px; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); border: none; border-radius: 12px; font-size: 13.5px; font-weight: 800; color: #ffffff; cursor: pointer; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
              Login
            </button>
          </div>

          <div style="text-align: center; margin-top: 6px;">
            <span style="font-size: 11.5px; color: #94a3b8;">Don't have an account? </span>
            <a href="javascript:void(0)" id="ml-link-create" style="font-size: 11.5px; font-weight: 800; color: #38bdf8; text-decoration: none;">Create Account</a>
          </div>
        </form>
      </div>
    </div>

    <!-- 3. MANUAL CREATE ACCOUNT MODAL -->
    <div id="modal-manual-register" style="display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.82); backdrop-filter: blur(8px); z-index: 9999; align-items: center; justify-content: center; padding: 18px;">
      <div style="background: #0f172a; border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 22px; padding: 20px 18px; width: 100%; max-width: 360px; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6); color: #ffffff;">
        <div style="text-align: center; margin-bottom: 12px;">
          <h3 style="font-size: 17px; font-weight: 800; color: #ffffff; margin: 0 0 2px 0;">Create Account</h3>
          <span style="font-size: 11.5px; color: #94a3b8;">Fill details to register</span>
        </div>

        <form id="form-manual-register" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 9px;">
          <div>
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #cbd5e1; margin-bottom: 3px;">Full Name *</label>
            <div style="display: flex; align-items: center; border: 1.5px solid rgba(56, 189, 248, 0.25); border-radius: 10px; background: rgba(2, 6, 23, 0.6); padding: 0 10px; height: 40px;">
              <input type="text" id="mr-fullname" placeholder="Full name" style="border: none; outline: none; background: transparent; width: 100%; height: 100%; font-size: 12.5px; color: #ffffff; font-weight: 600;" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #cbd5e1; margin-bottom: 3px;">Email / Gmail *</label>
            <div style="display: flex; align-items: center; border: 1.5px solid rgba(56, 189, 248, 0.25); border-radius: 10px; background: rgba(2, 6, 23, 0.6); padding: 0 10px; height: 40px;">
              <input type="email" id="mr-email" placeholder="gamer@gmail.com" style="border: none; outline: none; background: transparent; width: 100%; height: 100%; font-size: 12.5px; color: #ffffff; font-weight: 600;" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #cbd5e1; margin-bottom: 3px;">Phone Number *</label>
            <div style="display: flex; align-items: center; border: 1.5px solid rgba(56, 189, 248, 0.25); border-radius: 10px; background: rgba(2, 6, 23, 0.6); padding: 0 10px; height: 40px;">
              <input type="tel" id="mr-phone" placeholder="01XXXXXXXXX" maxlength="14" style="border: none; outline: none; background: transparent; width: 100%; height: 100%; font-size: 12.5px; color: #ffffff; font-weight: 600;" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #cbd5e1; margin-bottom: 3px;">Password *</label>
            <div style="display: flex; align-items: center; border: 1.5px solid rgba(56, 189, 248, 0.25); border-radius: 10px; background: rgba(2, 6, 23, 0.6); padding: 0 10px; height: 40px;">
              <input type="password" id="mr-password" placeholder="Min. 6 chars" style="border: none; outline: none; background: transparent; width: 100%; height: 100%; font-size: 12.5px; color: #ffffff; font-weight: 600;" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 11.5px; font-weight: 700; color: #cbd5e1; margin-bottom: 3px;">Confirm Password *</label>
            <div style="display: flex; align-items: center; border: 1.5px solid rgba(56, 189, 248, 0.25); border-radius: 10px; background: rgba(2, 6, 23, 0.6); padding: 0 10px; height: 40px;">
              <input type="password" id="mr-cpassword" placeholder="Re-enter password" style="border: none; outline: none; background: transparent; width: 100%; height: 100%; font-size: 12.5px; color: #ffffff; font-weight: 600;" />
            </div>
          </div>

          <div id="mr-error-msg" style="display: none; font-size: 11px; color: #fca5a5; background: rgba(239, 68, 68, 0.2); padding: 6px 10px; border-radius: 8px; font-weight: 600;"></div>

          <div style="display: flex; gap: 8px; margin-top: 4px;">
            <button type="button" id="btn-mr-cancel" style="flex: 1; height: 42px; background: rgba(255, 255, 255, 0.1); border: none; border-radius: 10px; font-size: 12.5px; font-weight: 700; color: #cbd5e1; cursor: pointer;">
              Cancel
            </button>
            <button type="button" id="btn-mr-submit" style="flex: 1.5; height: 42px; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); border: none; border-radius: 10px; font-size: 13px; font-weight: 800; color: #ffffff; cursor: pointer; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
              Create Account
            </button>
          </div>

          <div style="text-align: center; margin-top: 4px;">
            <span style="font-size: 11px; color: #94a3b8;">Already have an account? </span>
            <a href="javascript:void(0)" id="mr-link-signin" style="font-size: 11px; font-weight: 800; color: #38bdf8; text-decoration: none;">Sign In</a>
          </div>
        </form>
      </div>
    </div>

    <!-- 4. PHONE OTP VERIFICATION MODAL -->
    <div id="modal-phone-otp" style="display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(8px); z-index: 9999; align-items: center; justify-content: center; padding: 18px;">
      <div style="background: #0f172a; border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 22px; padding: 22px 18px; width: 100%; max-width: 360px; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6); color: #ffffff; text-align: center;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); display: flex; align-items: center; justify-content: center; font-size: 22px; margin: 0 auto 10px auto;">
          📱
        </div>
        <h3 style="font-size: 17px; font-weight: 800; color: #ffffff; margin: 0 0 4px 0;">Verify Phone</h3>
        <p style="font-size: 12px; color: #94a3b8; margin: 0 0 16px 0;">
          Enter the 6-digit code sent to <span id="otp-phone-display" style="color: #38bdf8; font-weight: 700;">+8801...</span>
        </p>

        <!-- 6-digit OTP Inputs -->
        <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 16px;">
          <input type="tel" maxlength="1" class="otp-digit-input" data-index="0" style="width: 42px; height: 48px; text-align: center; font-size: 20px; font-weight: 800; color: #ffffff; background: rgba(2, 6, 23, 0.8); border: 1.5px solid rgba(56, 189, 248, 0.4); border-radius: 10px; outline: none;" />
          <input type="tel" maxlength="1" class="otp-digit-input" data-index="1" style="width: 42px; height: 48px; text-align: center; font-size: 20px; font-weight: 800; color: #ffffff; background: rgba(2, 6, 23, 0.8); border: 1.5px solid rgba(56, 189, 248, 0.4); border-radius: 10px; outline: none;" />
          <input type="tel" maxlength="1" class="otp-digit-input" data-index="2" style="width: 42px; height: 48px; text-align: center; font-size: 20px; font-weight: 800; color: #ffffff; background: rgba(2, 6, 23, 0.8); border: 1.5px solid rgba(56, 189, 248, 0.4); border-radius: 10px; outline: none;" />
          <input type="tel" maxlength="1" class="otp-digit-input" data-index="3" style="width: 42px; height: 48px; text-align: center; font-size: 20px; font-weight: 800; color: #ffffff; background: rgba(2, 6, 23, 0.8); border: 1.5px solid rgba(56, 189, 248, 0.4); border-radius: 10px; outline: none;" />
          <input type="tel" maxlength="1" class="otp-digit-input" data-index="4" style="width: 42px; height: 48px; text-align: center; font-size: 20px; font-weight: 800; color: #ffffff; background: rgba(2, 6, 23, 0.8); border: 1.5px solid rgba(56, 189, 248, 0.4); border-radius: 10px; outline: none;" />
          <input type="tel" maxlength="1" class="otp-digit-input" data-index="5" style="width: 42px; height: 48px; text-align: center; font-size: 20px; font-weight: 800; color: #ffffff; background: rgba(2, 6, 23, 0.8); border: 1.5px solid rgba(56, 189, 248, 0.4); border-radius: 10px; outline: none;" />
        </div>

        <div id="otp-error-msg" style="display: none; font-size: 11.5px; color: #fca5a5; background: rgba(239, 68, 68, 0.2); padding: 8px 10px; border-radius: 8px; margin-bottom: 12px; font-weight: 600;"></div>

        <button type="button" id="btn-otp-verify" style="width: 100%; height: 46px; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); border: none; border-radius: 12px; font-size: 14px; font-weight: 800; color: #ffffff; cursor: pointer; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); margin-bottom: 12px;">
          Verify Code
        </button>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
          <button type="button" id="btn-otp-cancel" style="background: none; border: none; color: #94a3b8; font-weight: 600; cursor: pointer;">
            Cancel
          </button>
          <div>
            <button type="button" id="btn-otp-resend" style="background: none; border: none; color: #38bdf8; font-weight: 700; cursor: pointer; display: none;">
              Resend OTP
            </button>
            <span id="otp-timer-display" style="color: #64748b; font-weight: 600;">Resend in 60s</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. FORGOT PASSWORD MODAL -->
    <div id="modal-forgot-password" style="display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.82); backdrop-filter: blur(8px); z-index: 9999; align-items: center; justify-content: center; padding: 18px;">
      <div style="background: #0f172a; border: 1.5px solid rgba(56, 189, 248, 0.35); border-radius: 22px; padding: 22px 18px; width: 100%; max-width: 360px; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6); text-align: center; color: #ffffff;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); display: flex; align-items: center; justify-content: center; font-size: 22px; margin: 0 auto 10px auto;">
          🔐
        </div>
        <h3 style="font-size: 17px; font-weight: 800; color: #ffffff; margin: 0 0 4px 0;">Reset Password</h3>
        <p style="font-size: 12px; color: #94a3b8; margin: 0 0 16px 0;">
          Enter your registered email to receive a password reset link.
        </p>

        <div style="text-align: left; margin-bottom: 14px;">
          <label style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">Registered Email Address</label>
          <div style="display: flex; align-items: center; border: 1.5px solid rgba(56, 189, 248, 0.3); border-radius: 12px; background: rgba(2, 6, 23, 0.6); padding: 0 12px; height: 44px;">
            <input type="email" id="input-forgot-email" placeholder="gamer@gmail.com" style="border: none; outline: none; background: transparent; width: 100%; height: 100%; font-size: 13px; color: #ffffff; font-weight: 600;" />
          </div>
        </div>

        <div id="forgot-status-msg" style="display: none; font-size: 11.5px; padding: 8px; border-radius: 8px; margin-bottom: 12px; font-weight: 600;"></div>

        <div style="display: flex; gap: 10px;">
          <button type="button" id="btn-forgot-cancel" style="flex: 1; height: 44px; background: rgba(255, 255, 255, 0.1); border: none; border-radius: 12px; font-size: 13px; font-weight: 700; color: #cbd5e1; cursor: pointer;">
            Cancel
          </button>
          <button type="button" id="btn-forgot-submit" style="flex: 1.4; height: 44px; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); border: none; border-radius: 12px; font-size: 13px; font-weight: 800; color: #ffffff; cursor: pointer; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
            Send Link
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Event Bindings
 */
export function bindOnboardingEvents() {
  // Screen 1: Start Button
  document.getElementById('btn-onboard-start')?.addEventListener('click', () => {
    activeAuthMode = 'auth-select';
    stateManager.navigate('onboarding');
  });

  // Privacy Policy Link
  document.getElementById('link-auth-privacy')?.addEventListener('click', () => {
    openExternalStore('https://mobinx-admin-console.vercel.app/privacy.html', '#0284c7');
  });

  // CARD 1: MANUAL LOGIN CLICK
  document.getElementById('card-manual-login')?.addEventListener('click', () => {
    const authSettings = authService.getAuthSettings();
    if (authSettings.manualLoginEnabled === false) {
      showError('Manual login is currently disabled by administrator.');
      return;
    }
    hideError();
    openModal('modal-manual-login');
  });

  // CARD 2: GOOGLE LOGIN CLICK
  document.getElementById('card-google-login')?.addEventListener('click', async () => {
    const authSettings = authService.getAuthSettings();
    if (authSettings.googleLoginEnabled === false) {
      showError('Google sign-in is temporarily unavailable. Please use Manual Login.');
      return;
    }

    hideError();
    const card = document.getElementById('card-google-login');
    if (card) {
      card.style.opacity = '0.7';
      card.style.pointerEvents = 'none';
    }

    try {
      const googleUser = await firebaseService.signInWithGoogle();
      if (googleUser && googleUser.email) {
        const email = googleUser.email.toLowerCase().trim();
        const displayName = googleUser.displayName || email.split('@')[0];
        const avatar = googleUser.photoURL || 'assets/images/avatar_user.jpg';
        const uid = googleUser.uid;

        // Check if user already exists
        const existingUsers = authService.getAllUsers();
        const existing = existingUsers.find(u => (u.uid && u.uid === uid) || (u.email && u.email.toLowerCase() === email));

        if (existing && existing.phoneNumber) {
          // Returning Google user with phone -> Direct login
          const user = await authService.loginWithGoogle(email, displayName, existing.phoneNumber, existing.ffUid, avatar, uid, { phoneVerified: existing.phoneVerified });
          Toast.show(`🎉 Welcome back, ${user.username}!`, 'success');
          stateManager.navigate('home');
          return;
        }

        // First-time Google user -> Open Profile Completion
        pendingGoogleUser = {
          email,
          displayName,
          avatar,
          uid
        };

        const emailBadge = document.getElementById('gp-email-badge');
        if (emailBadge) emailBadge.textContent = email;
        const nameInput = document.getElementById('gp-fullname');
        if (nameInput) nameInput.value = displayName;

        openModal('modal-google-profile');
      }
    } catch (err) {
      console.warn('Google Sign-In notice:', err.message);
      showError('Google sign-in was cancelled or unavailable. You can also use Manual Login.');
    } finally {
      if (card) {
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
      }
    }
  });

  // --- GOOGLE PROFILE SUBMIT ---
  document.getElementById('btn-gp-cancel')?.addEventListener('click', () => {
    closeModal('modal-google-profile');
    pendingGoogleUser = null;
  });

  document.getElementById('btn-gp-submit')?.addEventListener('click', async () => {
    if (!pendingGoogleUser) return;
    const nameInput = document.getElementById('gp-fullname');
    const phoneInput = document.getElementById('gp-phone');
    const errorBox = document.getElementById('gp-error-msg');

    const fullName = (nameInput?.value || '').trim();
    const phone = (phoneInput?.value || '').trim();
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (errorBox) errorBox.style.display = 'none';

    if (fullName.length < 2) {
      if (errorBox) {
        errorBox.textContent = 'Please enter your full name.';
        errorBox.style.display = 'block';
      }
      nameInput?.focus();
      return;
    }

    if (cleanPhone.length < 10) {
      if (errorBox) {
        errorBox.textContent = 'Please enter a valid 11-digit phone number.';
        errorBox.style.display = 'block';
      }
      phoneInput?.focus();
      return;
    }

    const authSettings = authService.getAuthSettings();
    const isGooglePhoneVerificationOn = authSettings.googlePhoneVerificationEnabled === true;

    if (isGooglePhoneVerificationOn) {
      // Trigger Phone OTP
      closeModal('modal-google-profile');
      startPhoneOtpFlow(cleanPhone, async () => {
        // Upon OTP success
        const user = await authService.loginWithGoogle(
          pendingGoogleUser.email,
          fullName,
          cleanPhone,
          '',
          pendingGoogleUser.avatar,
          pendingGoogleUser.uid,
          { phoneVerified: true }
        );
        pendingGoogleUser = null;
        Toast.show(`🎉 Welcome to Mobin X, ${user.username}!`, 'success');
        stateManager.navigate('home');
      });
    } else {
      // Direct completion with phoneVerified: false
      const user = await authService.loginWithGoogle(
        pendingGoogleUser.email,
        fullName,
        cleanPhone,
        '',
        pendingGoogleUser.avatar,
        pendingGoogleUser.uid,
        { phoneVerified: false }
      );
      closeModal('modal-google-profile');
      pendingGoogleUser = null;
      Toast.show(`🎉 Welcome to Mobin X, ${user.username}!`, 'success');
      stateManager.navigate('home');
    }
  });

  // --- MANUAL LOGIN MODAL EVENTS ---
  document.getElementById('btn-ml-cancel')?.addEventListener('click', () => {
    closeModal('modal-manual-login');
  });

  document.getElementById('ml-link-create')?.addEventListener('click', () => {
    closeModal('modal-manual-login');
    openModal('modal-manual-register');
  });

  document.getElementById('ml-link-forgot')?.addEventListener('click', () => {
    closeModal('modal-manual-login');
    const emailVal = document.getElementById('ml-email')?.value?.trim();
    const forgotInput = document.getElementById('input-forgot-email');
    if (forgotInput && emailVal) forgotInput.value = emailVal;
    openModal('modal-forgot-password');
  });

  document.getElementById('btn-ml-submit')?.addEventListener('click', async () => {
    const emailInput = document.getElementById('ml-email');
    const passInput = document.getElementById('ml-password');
    const errorBox = document.getElementById('ml-error-msg');
    const btn = document.getElementById('btn-ml-submit');

    const email = (emailInput?.value || '').trim();
    const password = passInput?.value || '';

    if (errorBox) errorBox.style.display = 'none';

    if (!email || !email.includes('@')) {
      if (errorBox) { errorBox.textContent = 'Please enter a valid email address.'; errorBox.style.display = 'block'; }
      emailInput?.focus();
      return;
    }
    if (!password) {
      if (errorBox) { errorBox.textContent = 'Please enter your password.'; errorBox.style.display = 'block'; }
      passInput?.focus();
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Signing in...';
    }

    try {
      const user = await authService.loginWithEmailPassword(email, password);
      closeModal('modal-manual-login');
      Toast.show(`🎉 Welcome back, ${user.username}!`, 'success');
      stateManager.navigate('home');
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message || 'Incorrect email or password.';
        errorBox.style.display = 'block';
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Login';
      }
    }
  });

  // --- MANUAL REGISTER MODAL EVENTS ---
  document.getElementById('btn-mr-cancel')?.addEventListener('click', () => {
    closeModal('modal-manual-register');
  });

  document.getElementById('mr-link-signin')?.addEventListener('click', () => {
    closeModal('modal-manual-register');
    openModal('modal-manual-login');
  });

  document.getElementById('btn-mr-submit')?.addEventListener('click', async () => {
    const nameInput = document.getElementById('mr-fullname');
    const emailInput = document.getElementById('mr-email');
    const phoneInput = document.getElementById('mr-phone');
    const passInput = document.getElementById('mr-password');
    const cpassInput = document.getElementById('mr-cpassword');
    const errorBox = document.getElementById('mr-error-msg');
    const btn = document.getElementById('btn-mr-submit');

    const fullName = (nameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const phone = (phoneInput?.value || '').trim();
    const password = passInput?.value || '';
    const confirmPassword = cpassInput?.value || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (errorBox) errorBox.style.display = 'none';

    if (fullName.length < 2) {
      if (errorBox) { errorBox.textContent = 'Please enter your full name.'; errorBox.style.display = 'block'; }
      nameInput?.focus();
      return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      if (errorBox) { errorBox.textContent = 'Please enter a valid email address.'; errorBox.style.display = 'block'; }
      emailInput?.focus();
      return;
    }
    if (cleanPhone.length < 10) {
      if (errorBox) { errorBox.textContent = 'Please enter a valid 11-digit phone number.'; errorBox.style.display = 'block'; }
      phoneInput?.focus();
      return;
    }
    if (password.length < 6) {
      if (errorBox) { errorBox.textContent = 'Password must be at least 6 characters.'; errorBox.style.display = 'block'; }
      passInput?.focus();
      return;
    }
    if (password !== confirmPassword) {
      if (errorBox) { errorBox.textContent = 'Passwords do not match.'; errorBox.style.display = 'block'; }
      cpassInput?.focus();
      return;
    }

    const authSettings = authService.getAuthSettings();
    const isPhoneVerificationOn = authSettings.manualPhoneVerificationEnabled === true;
    const isEmailVerificationOn = authSettings.manualEmailVerificationEnabled === true;

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Creating...';
    }

    try {
      if (isPhoneVerificationOn) {
        closeModal('modal-manual-register');
        startPhoneOtpFlow(cleanPhone, async () => {
          const user = await authService.registerWithEmailPassword(fullName, email, cleanPhone, password, {
            phoneVerified: true,
            emailVerified: isEmailVerificationOn ? false : false
          });
          if (isEmailVerificationOn) {
            try { await firebaseService.sendEmailVerification(); } catch (e) {}
          }
          Toast.show(`🎉 Welcome to Mobin X, ${user.username}!`, 'success');
          stateManager.navigate('home');
        });
      } else {
        const user = await authService.registerWithEmailPassword(fullName, email, cleanPhone, password, {
          phoneVerified: false,
          emailVerified: false
        });
        if (isEmailVerificationOn) {
          try { await firebaseService.sendEmailVerification(); } catch (e) {}
        }
        closeModal('modal-manual-register');
        Toast.show(`🎉 Welcome to Mobin X, ${user.username}!`, 'success');
        stateManager.navigate('home');
      }
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message || 'Unable to create account. Please verify details.';
        errorBox.style.display = 'block';
      }
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Create Account';
      }
    }
  });

  // --- PHONE OTP MODAL EVENTS ---
  setupOtpDigitInputs();

  document.getElementById('btn-otp-cancel')?.addEventListener('click', () => {
    closeModal('modal-phone-otp');
    stopOtpCountdown();
    pendingPhoneAuth = null;
  });

  document.getElementById('btn-otp-resend')?.addEventListener('click', async () => {
    if (!pendingPhoneAuth || !pendingPhoneAuth.phone) return;
    try {
      Toast.show('Resending verification code...', 'info');
      await firebaseService.sendPhoneOtp(pendingPhoneAuth.phone);
      startOtpCountdown();
      Toast.show('Verification code resent!', 'success');
    } catch (e) {
      Toast.show(e.message || 'Could not resend OTP.', 'warning');
    }
  });

  document.getElementById('btn-otp-verify')?.addEventListener('click', async () => {
    const digits = Array.from(document.querySelectorAll('.otp-digit-input')).map(i => i.value).join('');
    const errorBox = document.getElementById('otp-error-msg');
    const btn = document.getElementById('btn-otp-verify');

    if (errorBox) errorBox.style.display = 'none';

    if (digits.length < 6) {
      if (errorBox) {
        errorBox.textContent = 'Please enter all 6 digits.';
        errorBox.style.display = 'block';
      }
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Verifying...';
    }

    try {
      await firebaseService.verifyPhoneOtp(digits);
      closeModal('modal-phone-otp');
      stopOtpCountdown();
      if (pendingPhoneAuth && typeof pendingPhoneAuth.onSuccess === 'function') {
        pendingPhoneAuth.onSuccess();
      }
      pendingPhoneAuth = null;
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message || 'Invalid verification code.';
        errorBox.style.display = 'block';
      }
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Verify Code';
      }
    }
  });

  // --- FORGOT PASSWORD MODAL EVENTS ---
  document.getElementById('btn-forgot-cancel')?.addEventListener('click', () => {
    closeModal('modal-forgot-password');
  });

  document.getElementById('btn-forgot-submit')?.addEventListener('click', async () => {
    const emailInput = document.getElementById('input-forgot-email');
    const statusMsg = document.getElementById('forgot-status-msg');
    const submitBtn = document.getElementById('btn-forgot-submit');
    const email = (emailInput?.value || '').trim();

    if (!email || !email.includes('@')) {
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'rgba(239, 68, 68, 0.2)';
        statusMsg.style.color = '#fca5a5';
        statusMsg.textContent = 'Please enter a valid email address.';
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      await authService.sendPasswordReset(email);
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'rgba(16, 185, 129, 0.2)';
        statusMsg.style.color = '#6ee7b7';
        statusMsg.textContent = '✅ Password reset link sent! Check your inbox.';
      }
      setTimeout(() => {
        closeModal('modal-forgot-password');
        Toast.show('Password reset link sent to your email.', 'success');
      }, 2000);
    } catch (err) {
      if (statusMsg) {
        statusMsg.style.display = 'block';
        statusMsg.style.background = 'rgba(239, 68, 68, 0.2)';
        statusMsg.style.color = '#fca5a5';
        statusMsg.textContent = err.message || 'Unable to send reset link.';
      }
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Link';
      }
    }
  });
}

function startPhoneOtpFlow(phoneNumber, onSuccess) {
  pendingPhoneAuth = { phone: phoneNumber, onSuccess };
  const phoneDisplay = document.getElementById('otp-phone-display');
  if (phoneDisplay) phoneDisplay.textContent = phoneNumber;

  // Clear digits
  document.querySelectorAll('.otp-digit-input').forEach(input => input.value = '');
  const firstInput = document.querySelector('.otp-digit-input[data-index="0"]');
  if (firstInput) firstInput.focus();

  openModal('modal-phone-otp');
  startOtpCountdown();

  // Trigger dispatch in background
  firebaseService.sendPhoneOtp(phoneNumber).catch(e => console.warn('OTP background notice:', e));
}

function setupOtpDigitInputs() {
  const inputs = document.querySelectorAll('.otp-digit-input');
  inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    // Paste support
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text').trim();
      if (/^\d{6}$/.test(text)) {
        text.split('').forEach((char, i) => {
          if (inputs[i]) inputs[i].value = char;
        });
        if (inputs[5]) inputs[5].focus();
      }
    });
  });
}

function startOtpCountdown() {
  stopOtpCountdown();
  otpTimeRemaining = 60;
  const resendBtn = document.getElementById('btn-otp-resend');
  const timerDisplay = document.getElementById('otp-timer-display');

  if (resendBtn) resendBtn.style.display = 'none';
  if (timerDisplay) {
    timerDisplay.style.display = 'inline';
    timerDisplay.textContent = `Resend in ${otpTimeRemaining}s`;
  }

  otpCountdownTimer = setInterval(() => {
    otpTimeRemaining--;
    if (timerDisplay) timerDisplay.textContent = `Resend in ${otpTimeRemaining}s`;
    if (otpTimeRemaining <= 0) {
      stopOtpCountdown();
      if (timerDisplay) timerDisplay.style.display = 'none';
      if (resendBtn) resendBtn.style.display = 'inline';
    }
  }, 1000);
}

function stopOtpCountdown() {
  if (otpCountdownTimer) {
    clearInterval(otpCountdownTimer);
    otpCountdownTimer = null;
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

function showError(msg) {
  const box = document.getElementById('auth-error-box');
  const text = document.getElementById('auth-error-text');
  if (box && text) {
    text.textContent = msg;
    box.style.display = 'flex';
  }
}

function hideError() {
  const box = document.getElementById('auth-error-box');
  if (box) box.style.display = 'none';
}

export function resetOnboardingStep(mode = 'welcome') {
  if (mode === 2 || mode === 'auth-select' || mode === 'auth-hub') {
    activeAuthMode = 'auth-select';
  } else {
    activeAuthMode = 'welcome';
  }
}
