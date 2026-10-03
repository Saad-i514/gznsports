// Content updates happen in place. New application bundles need a safe reload.
export function startReleaseUpdates() {
  if (!import.meta.env.PROD) return () => {};
  let checking = false;
  let typingUntil = 0;
  const typing = () => { typingUntil = Date.now() + 60000; };
  document.addEventListener('input', typing);
  const timer = setInterval(async () => {
    if (checking || document.hidden || !navigator.onLine) return;
    checking = true;
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) return;
      const { release } = await response.json();
      const editing = document.querySelector('.modal-overlay.open,.admin-overlay.open,.admin-sub-modal.open,.cart-drawer.open')
        || document.activeElement?.matches('input,textarea,select,[contenteditable="true"]');
      if (typeof release === 'string' && release !== __GNZ_RELEASE__ && !editing && Date.now() > typingUntil)
        location.reload();
    } catch { /* An unavailable manifest must never interrupt shopping. */ }
    finally { checking = false; }
  }, 60000);
  return () => { clearInterval(timer); document.removeEventListener('input', typing); };
}
