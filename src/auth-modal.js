import { auth } from "./lib/supabase.js";
import { escapeHTML as e, icon } from "./ui.js";
import { openPasswordRecovery } from "./password-recovery.js";
let currentUser = null;
let mode = "signin";
export function initAuthModal() {
  const modal = document.createElement("div");
  modal.id = "gzn-auth-modal";
  modal.className = "modal-overlay auth-modal-overlay";
  document.body.append(modal);
  auth
    .getSession()
    .then((session) => updateUser(session?.user))
    .catch(() => {});
  auth.onAuthStateChange((event, session) => {
    updateUser(session?.user);
    if (event === "PASSWORD_RECOVERY")
      setTimeout(() => openPasswordRecovery(true), 0);
  });
}
function updateUser(user) {
  currentUser = user || null;
  const button = document.getElementById("header-account-btn");
  button.innerHTML = icon("user");
  button.title = user ? `Signed in as ${user.email}` : "Your account";
  button.classList.toggle("is-signed-in", !!user);
}
export function closeAuthModal() {
  document.getElementById("gzn-auth-modal").classList.remove("open");
}
export function openAuthModal(nextMode = "signin") {
  mode = nextMode;
  const modal = document.getElementById("gzn-auth-modal");
  const signIn = mode === "signin";
  modal.innerHTML = `<div class="auth-modal-card"><button class="modal-close-btn" id="close-auth-modal-btn" aria-label="Close account">✕</button><div class="auth-modal-header"><p class="eyebrow">GNZSPORTS / YOUR SPACE</p><h2 class="auth-title">${currentUser ? "WELCOME BACK." : signIn ? "BACK IN YOUR CORNER." : "MAKE YOURSELF AT HOME."}</h2><p class="auth-subhead">${currentUser ? e(currentUser.email) : signIn ? "Sign in to your GNZSPORTS account." : "Create your GNZSPORTS account."}</p></div>${currentUser ? '<button id="sign-out-btn" class="action-button dark-button">Sign out ↗</button><p id="auth-error-msg" role="status"></p>' : `<form id="auth-form" class="auth-form">${signIn ? "" : '<div class="form-group"><label for="auth-name">FULL NAME</label><input class="auth-input" id="auth-name" autocomplete="name" required maxlength="120" /></div>'}<div class="form-group"><label for="auth-email">EMAIL ADDRESS</label><input class="auth-input" type="email" id="auth-email" autocomplete="email" required /></div><div class="form-group"><label for="auth-password">PASSWORD</label><input class="auth-input" type="password" id="auth-password" autocomplete="${signIn ? "current-password" : "new-password"}" minlength="6" required /></div><p id="auth-error-msg" role="status" class="auth-subhead"></p><button class="action-button dark-button auth-submit-btn" id="auth-submit-btn" type="submit">${signIn ? "Sign in" : "Create account"} ↗</button></form><div class="auth-modal-footer">${signIn ? "New here?" : "Already have an account?"} <button id="auth-switch" class="auth-toggle-link">${signIn ? "Create an account" : "Sign in"}</button></div>`}</div>`;
  modal.classList.add("open");
  if (!currentUser && signIn) {
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "auth-toggle-link";
    reset.textContent = "Forgot password?";
    reset.onclick = () =>
      openPasswordRecovery(false, document.getElementById("auth-email").value);
    modal.querySelector(".auth-modal-footer").append(reset);
  }
  document.getElementById("close-auth-modal-btn").onclick = closeAuthModal;
  document
    .getElementById("auth-switch")
    ?.addEventListener("click", () =>
      openAuthModal(signIn ? "signup" : "signin"),
    );
  document
    .getElementById("sign-out-btn")
    ?.addEventListener("click", async () => {
      try {
        await auth.signOut();
        closeAuthModal();
      } catch (error) {
        document.getElementById("auth-error-msg").textContent = error.message;
      }
    });
  document
    .getElementById("auth-form")
    ?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = document.getElementById("auth-submit-btn");
      const feedback = document.getElementById("auth-error-msg");
      const email = document.getElementById("auth-email").value.trim();
      const password = document.getElementById("auth-password").value;
      button.disabled = true;
      button.textContent = signIn ? "Signing in…" : "Creating your account…";
      feedback.textContent = "";
      try {
        if (signIn) {
          await auth.signIn(email, password);
          openAuthModal();
        } else {
          await auth.signUp(email, password, {
            full_name: document.getElementById("auth-name").value.trim(),
          });
          feedback.textContent =
            "Check your email to confirm your account, then sign in.";
        }
      } catch (error) {
        feedback.textContent =
          error.message || "Unable to sign in. Please try again.";
      } finally {
        button.disabled = false;
        button.textContent = signIn ? "Sign in ↗" : "Create account ↗";
      }
    });
}
