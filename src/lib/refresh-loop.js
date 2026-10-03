// Serialize refreshes: a burst during a request produces one trailing refresh.
export function coalesceRefresh(task) {
  let pending = null;
  let again = false;
  return function refresh() {
    if (pending) { again = true; return pending; }
    pending = (async () => {
      do { again = false; await task(); } while (again);
    })().finally(() => { pending = null; });
    return pending;
  };
}

export function startRefreshLoop(refresh, interval = 15000) {
  const run = () => {
    if (!document.hidden && navigator.onLine !== false) void refresh();
  };
  const timer = setInterval(run, interval);
  window.addEventListener('online', run);
  window.addEventListener('focus', run);
  document.addEventListener('visibilitychange', run);
  return () => {
    clearInterval(timer);
    window.removeEventListener('online', run);
    window.removeEventListener('focus', run);
    document.removeEventListener('visibilitychange', run);
  };
}
