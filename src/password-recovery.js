import { auth } from "./lib/supabase.js";

export function openPasswordRecovery(recovering = false, email = "") {
  document.getElementById("gzn-admin-overlay")?.classList.remove("open");
  const modal = document.getElementById("gzn-auth-modal");
  modal.innerHTML = `<div class="auth-modal-card"><button class="modal-close-btn" aria-label="Close password recovery">✕</button><p class="eyebrow">GNZSPORTS / ACCOUNT ACCESS</p><h2>${recovering ? "SET YOUR PASSWORD." : "RESET YOUR PASSWORD."}</h2><form class="auth-form"><label for="recovery-value">${recovering ? "New password (12 characters minimum)" : "Account email"}</label><input class="auth-input" id="recovery-value" type="${recovering ? "password" : "email"}" autocomplete="${recovering ? "new-password" : "email"}" ${recovering ? 'minlength="12"' : ""} required><p role="status"></p><button class="action-button dark-button" type="submit">${recovering ? "Save password" : "Send reset link"}</button></form></div>`;
  modal.classList.add("open");
  const input = modal.querySelector("input");
  if (!recovering) input.value = email;
  modal.querySelector(".modal-close-btn").onclick = () =>
    modal.classList.remove("open");
  modal.querySelector("form").onsubmit = async (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector("button");
    const feedback = event.currentTarget.querySelector('[role="status"]');
    button.disabled = true;
    try {
      if (recovering) await auth.updatePassword(input.value);
      else await auth.resetPassword(input.value.trim());
      feedback.textContent = recovering
        ? "Password saved. You can now sign in to Store manager."
        : "If this account is registered, check its email for a reset link.";
      input.value = "";
    } catch (error) {
      feedback.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  };
}
