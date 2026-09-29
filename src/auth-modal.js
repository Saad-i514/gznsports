// GZNSPORTS // SUPABASE CUSTOMER AUTHENTICATION MODAL
import { auth, supabase } from './lib/supabase.js';
import { playMetallicClick, playPunchImpact } from './audio.js';

let isAuthModalOpen = false;
let authMode = 'signin'; // 'signin' | 'signup'

export function initAuthModal() {
  renderAuthModalContainer();
  attachAuthListeners();
  checkCurrentSession();
}

function attachAuthListeners() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isAuthModalOpen) {
      closeAuthModal();
    }
  });
}

function renderAuthModalContainer() {
  let modal = document.getElementById('gzn-auth-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'gzn-auth-modal';
    modal.className = 'modal-overlay auth-modal-overlay';
    document.body.appendChild(modal);
  }
}

export function openAuthModal(mode = 'signin') {
  authMode = mode;
  isAuthModalOpen = true;
  playMetallicClick();
  const modal = document.getElementById('gzn-auth-modal');
  if (modal) {
    modal.classList.add('open');
    renderAuthModalContent();
  }
}

export function closeAuthModal() {
  isAuthModalOpen = false;
  playMetallicClick();
  const modal = document.getElementById('gzn-auth-modal');
  if (modal) {
    modal.classList.remove('open');
  }
}

async function checkCurrentSession() {
  try {
    const session = await auth.getSession();
    updateHeaderAccountUI(session?.user || null);

    auth.onAuthStateChange((event, newSession) => {
      console.log('⚡ [Auth] State change event:', event);
      updateHeaderAccountUI(newSession?.user || null);
    });
  } catch (e) {
    console.warn('[Auth] Session check failed:', e);
  }
}

function updateHeaderAccountUI(user) {
  const accountBtn = document.getElementById('header-account-btn');
  if (!accountBtn) return;

  if (user) {
    accountBtn.title = `Athlete: ${user.email}`;
    accountBtn.innerHTML = `
      <span style="font-size:0.75rem; font-family:var(--font-mono); font-weight:700; color:var(--gzn-gold-seal); display:flex; align-items:center; gap:4px;">
        👤 ${user.user_metadata?.full_name || user.email.split('@')[0]}
      </span>
    `;
  } else {
    accountBtn.title = 'Account / Sign In';
    accountBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    `;
  }
}

function renderAuthModalContent() {
  const modal = document.getElementById('gzn-auth-modal');
  if (!modal) return;

  const isSignIn = authMode === 'signin';

  modal.innerHTML = `
    <div class="auth-modal-card">
      <button class="modal-close-btn" id="close-auth-modal-btn" title="Close">✕</button>

      <div class="auth-modal-header">
        <span class="mono-tag" style="background:#f1f5f9; color:#b45309; border:1px solid #e2e8f0; font-weight:700;">[ GENZ SPORTS VIP ACCESS ]</span>
        <h3 class="auth-title">${isSignIn ? 'SIGN IN TO YOUR ACCOUNT' : 'CREATE YOUR VIP ACCOUNT'}</h3>
        <p class="auth-subhead">
          ${isSignIn 
            ? 'Sign in to access your championship orders, exclusive belt drops, and member concierge.' 
            : 'Join the GENZ VIP registry for 365-day warranty coverage, private vault access, and expedited global dispatch.'}
        </p>
      </div>

      <form id="auth-form" class="auth-form">
        ${!isSignIn ? `
          <div class="form-group full-width">
            <label for="auth-name">FULL NAME</label>
            <input type="text" id="auth-name" class="auth-input" placeholder="e.g. Saad Champion" required />
          </div>
        ` : ''}

        <div class="form-group full-width">
          <label for="auth-email">EMAIL ADDRESS</label>
          <input type="email" id="auth-email" class="auth-input" placeholder="champion@gznsports.com" required />
        </div>

        <div class="form-group full-width">
          <label for="auth-password">PASSWORD</label>
          <input type="password" id="auth-password" class="auth-input" placeholder="••••••••••••" minlength="6" required />
        </div>

        <div id="auth-error-msg" class="auth-error-msg" style="display:none;"></div>

        <button type="submit" class="btn-primary auth-submit-btn" id="auth-submit-btn" style="width: 100%; margin-top: 0.5rem; padding: 0.95rem;">
          <span>${isSignIn ? 'SIGN IN TO ACCOUNT' : 'CREATE VIP ACCOUNT'}</span>
        </button>

        ${isSignIn ? `
          <div class="demo-login-box">
            <button type="button" id="demo-quick-login-btn" class="btn-demo-quick">
              ⚡ 1-Click Demo Login (Saad Executive)
            </button>
          </div>
        ` : ''}
      </form>

      <div class="auth-modal-footer">
        ${isSignIn ? `
          <span>Need VIP membership? <a href="#" id="toggle-to-signup" class="auth-toggle-link">Join GENZ VIP →</a></span>
        ` : `
          <span>Already a VIP member? <a href="#" id="toggle-to-signin" class="auth-toggle-link">Sign In Here →</a></span>
        `}
      </div>
    </div>
  `;

  document.getElementById('close-auth-modal-btn')?.addEventListener('click', closeAuthModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeAuthModal();
  });

  document.getElementById('toggle-to-signup')?.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal('signup');
  });

  document.getElementById('toggle-to-signin')?.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal('signin');
  });

  // 1-Click Demo Login Helper
  document.getElementById('demo-quick-login-btn')?.addEventListener('click', async () => {
    const emailInput = document.getElementById('auth-email');
    const passInput = document.getElementById('auth-password');
    if (emailInput && passInput) {
      emailInput.value = 'saad@gznsports.com';
      passInput.value = 'Championship2026!';
      playMetallicClick();
      
      // Auto-submit
      const submitBtn = document.getElementById('auth-submit-btn');
      if (submitBtn) submitBtn.click();
    }
  });

  // Submit Handler
  const form = document.getElementById('auth-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error-msg');
    const submitBtn = document.getElementById('auth-submit-btn');

    errorEl.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>VERIFYING CREDENTIALS...</span>`;

    try {
      if (isSignIn) {
        await auth.signIn(email, password);
        playPunchImpact();
        closeAuthModal();
        alert(`⚡ WELCOME BACK\nSigned in as ${email}`);
      } else {
        const fullName = document.getElementById('auth-name').value.trim();
        await auth.signUp(email, password, { full_name: fullName });
        playPunchImpact();
        closeAuthModal();
        alert(`⚡ VIP REGISTRATION COMPLETE\nWelcome to GENZ SPORTS, ${fullName}! Check your email or sign in.`);
      }
    } catch (err) {
      errorEl.textContent = err.message || 'Authentication error';
      errorEl.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>${isSignIn ? 'SIGN IN TO ACCOUNT' : 'CREATE VIP ACCOUNT'}</span>`;
    }
  });
}
