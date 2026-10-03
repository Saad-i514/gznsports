const materials = {
  fabric: [
    "TEXTURE WITH PRESENCE.",
    "Explore the surface and texture of our everyday layers. Check each product for its specific fabric composition.",
  ],
  fit: [
    "ROOM TO BE YOURSELF.",
    "From relaxed layers to coordinated sets. Choose your size using the fit information on each product.",
  ],
  detail: [
    "THE FINISHING TOUCH.",
    "Look closer at the seams, pockets and closures. Small details bring the whole piece together.",
  ],
};

export function initExperience() {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const menu = document.getElementById("mobile-menu");
  const toggle = document.getElementById("menu-toggle");
  const closeMenu = () => {
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  };
  toggle.addEventListener("click", () => {
    menu.style.top = `${document.getElementById("site-header").getBoundingClientRect().bottom}px`;
    menu.hidden = !menu.hidden;
    toggle.setAttribute("aria-expanded", String(!menu.hidden));
    toggle.setAttribute("aria-label", menu.hidden ? "Open menu" : "Close menu");
  });
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      closeMenu();
      toggle.focus();
    }
  });
  window.addEventListener("resize", () => {
    if (innerWidth > 900) closeMenu();
  });

  const reveal = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove("is-pending");
          reveal.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  if (!reduced.matches) {
    document.documentElement.classList.add("motion-enabled");
    document.querySelectorAll(".reveal").forEach((el) => {
      if (el.getBoundingClientRect().top > innerHeight)
        el.classList.add("is-pending");
      reveal.observe(el);
    });
  }
  reduced.addEventListener("change", () => {
    document.documentElement.classList.toggle(
      "motion-enabled",
      !reduced.matches,
    );
    document
      .querySelectorAll(".is-pending")
      .forEach((el) => el.classList.remove("is-pending"));
  });

  // Scroll reads and writes are coalesced; no scroll-jacking or perpetual animation.
  let frame = 0;
  const hero = document.querySelector(".campaign-hero");
  const art = document.querySelector(".hero-art");
  const motionButton = document.createElement('button');
  motionButton.className = 'hero-motion-toggle';
  motionButton.type = 'button';
  hero.querySelector('.slide-index').replaceWith(motionButton);
  let paused = false;
  let visible = true;
  function updateMotion() {
    hero.classList.toggle('hero-motion-paused', paused || !visible || document.hidden || reduced.matches);
    motionButton.textContent = paused ? '▶ PLAY MOTION' : 'Ⅱ PAUSE MOTION';
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.hidden = reduced.matches;
    if (reduced.matches) art.style.transform = '';
  }
  motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
  const heroObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateMotion();
  });
  heroObserver.observe(hero);
  document.addEventListener('visibilitychange', updateMotion);
  reduced.addEventListener('change', updateMotion);
  updateMotion();
  function onScroll() {
    if (!menu.hidden)
      menu.style.top = `${document.getElementById("site-header").getBoundingClientRect().bottom}px`;
    if (frame || paused || reduced.matches || innerWidth < 601) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0)
        art.style.transform = `translateY(${Math.min(-rect.top * 0.13, 100)}px)`;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  // A small magnetic response on primary actions, limited to a precise pointer.
  document.querySelectorAll(".action-button").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      if (reduced.matches || event.pointerType !== "mouse") return;
      const bounds = button.getBoundingClientRect();
      const x =
        ((event.clientX - bounds.left - bounds.width / 2) / bounds.width) * 5;
      const y =
        ((event.clientY - bounds.top - bounds.height / 2) / bounds.height) * 5;
      button.style.transform = `translate(${x}px, ${y}px)`;
    });
    button.addEventListener(
      "pointerleave",
      () => (button.style.transform = ""),
    );
    button.addEventListener("blur", () => (button.style.transform = ""));
  });

  const stage = document.getElementById("material-studio");
  const photo = stage.querySelector(".studio-fallback");
  const views = {
    fabric: [1, "50% 50%"],
    fit: [1.5, "0% 70%"],
    detail: [1.8, "65% 35%"],
  };
  function showMaterial(name) {
    const [scale, origin] = views[name];
    photo.style.transformOrigin = origin;
    photo.style.transform = `scale(${scale})`;
    document.getElementById("studio-status").textContent =
      `${name.toUpperCase()} / PHOTOGRAPHIC DETAIL`;
  }
  const tabs = [...document.querySelectorAll("[data-material]")];
  tabs.forEach((button, index) => {
    button.addEventListener("click", () => {
      const selectedMaterial = button.dataset.material;
      tabs.forEach((tab) => {
        const active = tab === button;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      const panel = document.getElementById("material-panel");
      panel.setAttribute("aria-labelledby", button.id);
      panel.querySelector("h3").textContent = materials[selectedMaterial][0];
      panel.querySelector("p").textContent = materials[selectedMaterial][1];
      showMaterial(selectedMaterial);
    });
    button.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft")
        next = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        tabs[next].focus();
        tabs[next].click();
      }
    });
  });
  document.getElementById("studio-left").addEventListener("click", () => {
    const index = tabs.findIndex(
      (tab) => tab.getAttribute("aria-selected") === "true",
    );
    tabs[(index + tabs.length - 1) % tabs.length].click();
  });
  document.getElementById("studio-right").addEventListener("click", () => {
    const index = tabs.findIndex(
      (tab) => tab.getAttribute("aria-selected") === "true",
    );
    tabs[(index + 1) % tabs.length].click();
  });
  document
    .getElementById("studio-reset")
    .addEventListener("click", () => tabs[0].click());
  initDialogAccessibility();
  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      reveal.disconnect();
      heroObserver.disconnect();
      document.removeEventListener('visibilitychange', updateMotion);
      reduced.removeEventListener('change', updateMotion);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    });
}

function initDialogAccessibility() {
  const selectors =
    ".modal-overlay, .admin-overlay, .admin-sub-modal, .cart-drawer";
  let active = null;
  let returnFocus = null;
  const focusable =
    'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]';
  const dialogNames = {
    "quick-view-modal": "Product details and order review",
    "search-modal": "Search products",
    "lab-modal": "Craftsmanship",
    "why-genz-modal": "About GNZSPORTS",
    "faq-modal": "Sizing and care",
    "legal-modal": "Store information",
    "gzn-auth-modal": "Your account",
    "gzn-admin-overlay": "Store manager",
    "product-editor-modal": "Product editor",
    "cart-drawer": "Shopping bag",
  };
  function update() {
    const dialogs = [...document.querySelectorAll(selectors)];
    dialogs.forEach((dialog) => {
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-label", dialogNames[dialog.id] || "Dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.inert = !dialog.classList.contains("open");
      dialog.setAttribute("aria-hidden", String(dialog.inert));
    });
    const open = dialogs.filter((dialog) => dialog.classList.contains("open"));
    // Product editor overlays its parent; the cart is underneath any modal.
    const next =
      open.find((dialog) => dialog.matches(".admin-sub-modal")) ||
      open.find((dialog) => dialog.matches(".admin-overlay")) ||
      open.find((dialog) => dialog.matches(".modal-overlay")) ||
      open[0] ||
      null;
    document
      .querySelectorAll(
        "#app > header,#app > nav,#app > main,#app > footer,#app > .announcement,#app > .skip-link",
      )
      .forEach((element) => (element.inert = !!next));
    if (next === active) {
      if (next && !next.contains(document.activeElement))
        requestAnimationFrame(() =>
          next.querySelector(focusable)?.focus({ preventScroll: true }),
        );
      return;
    }
    if (next) {
      if (!active) returnFocus = document.activeElement;
      active = next;
      requestAnimationFrame(() => {
        if (!next.contains(document.activeElement))
          next.querySelector(focusable)?.focus({ preventScroll: true });
      });
    } else {
      active = null;
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
      else
        document
          .getElementById("cart-toggle-btn")
          ?.focus({ preventScroll: true });
      returnFocus = null;
    }
    document.body.style.overflow = next ? "hidden" : "";
  }
  const observer = new MutationObserver(update);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class"],
  });
  update();
  document.addEventListener("keydown", (event) => {
    if (!active) return;
    if (event.key === "Escape") {
      const parent = active;
      if (parent.id === "gzn-admin-overlay")
        window.dispatchEvent(new Event("gnz:close-admin"));
      parent.classList.remove("open");
      if (parent.id === "cart-drawer")
        document.getElementById("cart-overlay").classList.remove("open");
      return;
    }
    if (event.key !== "Tab") return;
    const items = [...active.querySelectorAll(focusable)].filter(
      (el) => el.getClientRects().length && !el.closest("[inert]"),
    );
    if (!items.length) {
      event.preventDefault();
      return;
    }
    const first = items[0],
      last = items.at(-1);
    if (
      event.shiftKey &&
      (document.activeElement === first ||
        !active.contains(document.activeElement))
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last ||
        !active.contains(document.activeElement))
    ) {
      event.preventDefault();
      first.focus();
    }
  });
}
