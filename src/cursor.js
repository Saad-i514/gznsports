// GZN Tactical Cursor Engine (Hardware-Accelerated Dual Layer)
export function initCursor() {
  const reticle = document.getElementById('cursor-reticle');
  const aura = document.getElementById('cursor-aura');
  const label = document.getElementById('cursor-label');

  if (!reticle || !aura) return;

  // Disable on touch screens
  if (window.matchMedia('(pointer: coarse)').matches) {
    reticle.style.display = 'none';
    aura.style.display = 'none';
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let auraX = mouseX;
  let auraY = mouseY;
  const lerp = 0.15;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Instant update for reticle
    reticle.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
  }, { passive: true });

  function updateAura() {
    auraX += (mouseX - auraX) * lerp;
    auraY += (mouseY - auraY) * lerp;

    aura.style.transform = `translate3d(${auraX}px, ${auraY}px, 0)`;
    requestAnimationFrame(updateAura);
  }
  requestAnimationFrame(updateAura);

  // Attach hover state handlers
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    
    // 3D Canvas
    if (target.closest('.canvas-3d-target')) {
      aura.classList.add('is-drag');
      if (label) label.textContent = '◄ DRAG ►';
      return;
    }

    // Buttons and interactive triggers
    if (target.closest('button, .interactive-btn, a, .filter-tab, .size-pill')) {
      aura.classList.add('is-hover');
      if (label) label.textContent = '';
      return;
    }

    // Product cards
    if (target.closest('.gzn-product-card')) {
      aura.classList.add('is-card');
      if (label) label.textContent = 'VIEW SPEC';
      return;
    }

    // Media trigger
    if (target.closest('.media-trigger')) {
      aura.classList.add('is-media');
      if (label) label.textContent = 'PLAY';
      return;
    }

    // Default
    aura.classList.remove('is-hover', 'is-drag', 'is-card', 'is-media');
    if (label) label.textContent = '';
  });

  document.addEventListener('mouseleave', () => {
    aura.style.opacity = '0';
    reticle.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    aura.style.opacity = '1';
    reticle.style.opacity = '1';
  });
}
