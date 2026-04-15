/* ============================================================
   MAIN.JS
   All page interactivity for index.html.

   Sections (in order):
   1. DATA          — static data arrays (quotes, sold IDs)
   2. UTILS         — shared helpers (bindTap)
   3. WEF CAROUSEL  — quote rotator with prev/next/dots
   4. MAILING FORM  — email sign-up with success state
   5. PROTOCOL CIRCLE — orbit item hover/tap + flip card
   6. SHOWCASE MODAL  — legacy NFT wallets modal (mobile)
   7. WALLET MODAL  — founder wallet claim modal
   8. SHOWCASE ACCORDION — legacy accordion (if present)
   9. PARALLAX      — subtle scroll parallax on data-parallax elements
   10. FOUNDER BOARD — 800-tile grid, sold state, stats
   11. REVEAL        — IntersectionObserver scroll-reveal
   12. CURSOR GLOW   — pointer-tracking glow (desktop)
   13. DEPTH LAYERS  — hero 3D depth on pointer move
   14. SECTION INDEX — active-link highlight for .section-index nav
   15. SCROLL SCENES — hero progress + protocol scroll-scrub
   16. STICKY SHOWCASE CARDS — scroll-driven card activation
   17. NFT ACCORDION — accordion in the showcase section
   ============================================================ */


/* ── 0. SITE INTRO ────────────────────────────────────────────── */
(function () {
  const intro = document.getElementById("siteIntro");
  if (!intro) return;

  intro.style.display = "flex";

  // Start the progress bar fill after the tagline appears
  setTimeout(() => {
    const fill = document.getElementById("siteIntroFill");
    if (fill) fill.classList.add("is-filling");
  }, 1300);

  // Exit: scale + fade out, then remove
  setTimeout(() => {
    intro.classList.add("is-exiting");
    setTimeout(() => { intro.style.display = "none"; }, 800);
  }, 2500);
}());


/* ── 1. DATA ──────────────────────────────────────────────────── */

/** Wallet IDs that are already claimed. Update this array to mark new sales. */
const SOLD_IDS = new Set([1, 2, 3, 4, 5, 6, 8, 10, 11, 16, 18, 21, 25, 67, 87, 90, 100, 22, 667, 211, 500]);

/** WEF Davos 2026 quotes for the carousel. */
const quotes = [
  {
    text: "Tokenization and stable coins might be the name of the game really this year.",
    meta: "Francois Villeroy de Galhau - WEF Davos 2026",
  },
  {
    text: "Tokenisation is at an 'inflection point' and 'eventually all things will settle in digitised form.'",
    meta: "Bill Winters - WEF Davos 2026",
  },
  {
    text: "The pace of adoption will be heavily influenced by regulation, but this will not change the direction of travel.",
    meta: "Bill Winters - WEF Davos 2026",
  },
  {
    text: "We're seeing use grow in cross-border trade settlement.",
    meta: "Jeremy Allaire - WEF Davos 2026",
  },
  {
    text: "Tokens are going to be used for two things: they'll be used as a medium of exchange... and they'll be used as a store of value.",
    meta: "Bill Winters - WEF Davos 2026",
  },
  {
    text: "With a smartphone, you have access to stablecoin.",
    meta: "Vera Songwe - WEF Davos 2026",
  },
  {
    text: "As stablecoins create the potential for additional uptake, that creates a competitive pressure on those countries themselves.",
    meta: "Dan Katz - WEF Davos 2026",
  },
  {
    text: "We've seen a dramatic explosion in the use of stablecoin.",
    meta: "Gerard Baker - WEF Davos 2026",
  },
];


/* ── 2. UTILS ─────────────────────────────────────────────────── */

/**
 * bindTap — attach a handler to both touchend and click,
 * preventing the ~300ms click delay on touch devices.
 */
const bindTap = (element, handler) => {
  let lastTouchTime = 0;

  const onTouchEnd = (event) => {
    lastTouchTime = Date.now();
    if (event.cancelable) event.preventDefault();
    handler(event);
  };

  const onClick = (event) => {
    if (Date.now() - lastTouchTime < 500) {
      event.preventDefault();
      return;
    }
    handler(event);
  };

  element.addEventListener("touchend", onTouchEnd, { passive: false });
  element.addEventListener("click", onClick);
};


/* ── 3. WEF CAROUSEL ──────────────────────────────────────────── */
const wefText    = document.getElementById("wefText");
const wefAuthor  = document.getElementById("wefAuthor");
const wefDotsEl  = document.getElementById("wefDots");
const wefPrevBtn = document.getElementById("wefPrev");
const wefNextBtn = document.getElementById("wefNext");
const wefFrame   = document.getElementById("wefFrame");

if (wefText && wefAuthor && wefDotsEl) {
  let wefIdx   = 0;
  let wefTimer = null;

  // Build dot buttons
  quotes.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "wef-dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Quote ${i + 1}`);
    dot.type = "button";
    dot.addEventListener("click", () => wefGoTo(i));
    wefDotsEl.appendChild(dot);
  });

  const wefDots = Array.from(wefDotsEl.querySelectorAll(".wef-dot"));

  const wefGoTo = (idx) => {
    wefIdx = ((idx % quotes.length) + quotes.length) % quotes.length;
    if (wefFrame) wefFrame.classList.add("is-fading");
    clearTimeout(wefTimer);

    setTimeout(() => {
      const q = quotes[wefIdx];
      wefText.textContent   = `"${q.text}"`;
      wefAuthor.textContent = q.meta;
      wefDots.forEach((d, i) => d.classList.toggle("is-active", i === wefIdx));
      if (wefFrame) wefFrame.classList.remove("is-fading");
    }, 280);

    wefTimer = setTimeout(() => wefGoTo(wefIdx + 1), 5200);
  };

  // Set initial state
  wefText.textContent   = `"${quotes[0].text}"`;
  wefAuthor.textContent = quotes[0].meta;

  if (wefPrevBtn) bindTap(wefPrevBtn, () => wefGoTo(wefIdx - 1));
  if (wefNextBtn) bindTap(wefNextBtn, () => wefGoTo(wefIdx + 1));

  wefTimer = setTimeout(() => wefGoTo(1), 5200);
}


/* ── 4. PROTOCOL CIRCLE ───────────────────────────────────────── */
const circleFlip          = document.getElementById("circleFlip");
const circleBackTitle     = document.getElementById("circleBackTitle");
const circleBackText      = document.getElementById("circleBackText");
const circleBackQuote     = document.getElementById("circleBackQuote");
const circleBackQuoteMeta = document.getElementById("circleBackQuoteMeta");
const circleItems         = document.querySelectorAll(".circle-item");

if (circleFlip && circleBackTitle && circleBackText && circleBackQuote && circleBackQuoteMeta && circleItems.length) {
  const defaultQuote     = "The key is to harness the benefits while managing the risks.";
  const defaultQuoteMeta = "Christine Lagarde - IMF 2018";

  const canHover  = window.matchMedia("(hover: hover)").matches;
  let   activeItem = null;

  const isTouch  = () => window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const useModal = () => isTouch() || window.matchMedia("(max-width: 900px)").matches;

  // Circle modal (mobile)
  const circleModal      = document.querySelector("[data-circle-modal]");
  const circleModalClose = document.querySelector("[data-circle-modal-close]");
  const circleModalTitle = document.getElementById("circleModalTitle");
  const circleModalText  = document.getElementById("circleModalText");
  const circleModalQuote = document.getElementById("circleModalQuote");
  const circleModalMeta  = document.getElementById("circleModalMeta");

  const getItemContent = (item) => ({
    title: item.dataset.title    || "Protocol",
    text:  item.dataset.text     || "A discreet layer in the Dynk architecture.",
    quote: item.dataset.quote    || defaultQuote,
    meta:  item.dataset.quoteMeta || defaultQuoteMeta,
  });

  const applyToBack = (content) => {
    circleBackTitle.textContent     = content.title;
    circleBackText.textContent      = content.text;
    circleBackQuote.textContent     = `"${content.quote}"`;
    circleBackQuoteMeta.textContent = content.meta;
  };

  const applyToModal = (content) => {
    if (!circleModalTitle || !circleModalText || !circleModalQuote || !circleModalMeta) return;
    circleModalTitle.textContent = content.title;
    circleModalText.textContent  = content.text;
    circleModalQuote.textContent = `"${content.quote}"`;
    circleModalMeta.textContent  = content.meta;
  };

  const openItem = (item) => {
    applyToBack(getItemContent(item));
    circleFlip.classList.add("is-flipped");
    activeItem = item;
  };

  const closeItem = () => {
    circleFlip.classList.remove("is-flipped");
    activeItem = null;
  };

  circleItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      if (!canHover) return;
      openItem(item);
    });

    item.addEventListener("mouseleave", () => {
      if (!canHover) return;
      closeItem();
    });

    bindTap(item, (event) => {
      event.preventDefault();

      if (useModal() && circleModal) {
        applyToModal(getItemContent(item));
        circleFlip.classList.remove("is-flipped");
        circleModal.classList.add("is-open");
        circleModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        if (circleModalClose) circleModalClose.focus();
        return;
      }

      if (activeItem === item) {
        closeItem();
        return;
      }
      openItem(item);
    });
  });

  // Close when clicking outside the circle
  document.addEventListener("click", (event) => {
    if (event.target.closest(".circle-item") || event.target.closest("#circleFlip")) return;
    closeItem();
  });

  // Circle modal events
  if (circleModal) {
    const closeCircleModal = () => {
      circleModal.classList.remove("is-open");
      circleModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    if (circleModalClose) {
      bindTap(circleModalClose, (event) => {
        event.preventDefault();
        closeCircleModal();
      });
    }

    circleModal.addEventListener("click", (event) => {
      if (event.target === circleModal) closeCircleModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && circleModal.classList.contains("is-open")) closeCircleModal();
    });

    window.addEventListener("resize", () => {
      if (!useModal() && circleModal.classList.contains("is-open")) closeCircleModal();
      if (useModal()) circleFlip.classList.remove("is-flipped");
    });
  }
}


/* ── 6. SHOWCASE MODAL (mobile NFT wallets) ───────────────────── */
const showcaseModalTrigger = document.querySelector("[data-showcase-modal]");
const showcaseModal        = document.querySelector("[data-modal]");
const showcaseModalClose   = document.querySelector("[data-modal-close]");

if (showcaseModalTrigger && showcaseModal && showcaseModalClose) {
  const isMobile = () => window.matchMedia("(max-width: 700px)").matches;

  const openModal = () => {
    showcaseModal.classList.add("is-open");
    showcaseModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    showcaseModalClose.focus();
  };

  const closeModal = () => {
    showcaseModal.classList.remove("is-open");
    showcaseModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  bindTap(showcaseModalTrigger, (event) => {
    if (!isMobile()) return;
    event.preventDefault();
    openModal();
  });

  bindTap(showcaseModalClose, (event) => {
    event.preventDefault();
    closeModal();
  });

  showcaseModal.addEventListener("click", (event) => {
    if (event.target === showcaseModal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && showcaseModal.classList.contains("is-open")) closeModal();
  });

  window.addEventListener("resize", () => {
    if (!isMobile() && showcaseModal.classList.contains("is-open")) closeModal();
  });
}


/* ── 7. WALLET MODAL ──────────────────────────────────────────── */
const walletModalTriggers = Array.from(document.querySelectorAll("[data-wallet-modal]"));
const walletModal         = document.querySelector("[data-wallet-modal-dialog]");
const walletModalClose    = document.querySelector("[data-wallet-modal-close]");

if (walletModalTriggers.length && walletModal && walletModalClose) {
  const openWalletModal = () => {
    walletModal.classList.add("is-open");
    walletModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    walletModalClose.focus();
  };

  const closeWalletModal = () => {
    walletModal.classList.remove("is-open");
    walletModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  walletModalTriggers.forEach((trigger) => {
    bindTap(trigger, (event) => {
      event.preventDefault();
      openWalletModal();
    });
  });

  bindTap(walletModalClose, (event) => {
    event.preventDefault();
    closeWalletModal();
  });

  walletModal.addEventListener("click", (event) => {
    if (event.target === walletModal) closeWalletModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && walletModal.classList.contains("is-open")) closeWalletModal();
  });
}


/* ── 8. SHOWCASE ACCORDION (legacy .showcase-accordion) ──────── */
const showcaseAccordion = document.querySelector("[data-showcase-accordion]");
const showcaseCopy      = document.querySelector(".showcase-copy");

if (showcaseAccordion) {
  const items  = Array.from(showcaseAccordion.querySelectorAll(".showcase-item"));
  const panels = items.map((item) => item.querySelector(".showcase-panel")).filter(Boolean);

  const getPanelHeight = (panel) => {
    const item    = panel.closest(".showcase-item");
    if (!item) return panel.scrollHeight;

    const wasOpen = item.classList.contains("is-open");
    if (!wasOpen) item.classList.add("is-open");

    const styles  = window.getComputedStyle(panel);
    const padding = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const margin  = parseFloat(styles.marginTop)  + parseFloat(styles.marginBottom);
    const border  = parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
    const height  = panel.scrollHeight + padding + margin + border;

    if (!wasOpen) item.classList.remove("is-open");
    return height;
  };

  const updatePanelHeights = () => {
    showcaseAccordion.classList.add("is-measuring");
    panels.forEach((panel) => {
      panel.style.setProperty("--panel-height", `${getPanelHeight(panel)}px`);
    });

    if (showcaseCopy && panels.length) {
      const openItems = items.filter((item) => item.classList.contains("is-open"));
      openItems.forEach((item) => setClosed(item));
      showcaseCopy.style.minHeight = "";

      const baseHeight     = showcaseCopy.getBoundingClientRect().height;
      openItems.forEach((item) => setOpen(item));
      const maxPanelHeight = Math.max(...panels.map((panel) => parseFloat(panel.style.getPropertyValue("--panel-height")) || 0));
      showcaseCopy.style.minHeight = `${Math.ceil(baseHeight + maxPanelHeight)}px`;
    }

    showcaseAccordion.classList.remove("is-measuring");
  };

  const setClosed = (item) => {
    const toggle = item.querySelector(".showcase-toggle");
    const panel  = item.querySelector(".showcase-panel");
    if (!toggle || !panel) return;
    item.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
  };

  const setOpen = (item) => {
    const toggle = item.querySelector(".showcase-toggle");
    const panel  = item.querySelector(".showcase-panel");
    if (!toggle || !panel) return;
    item.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
  };

  items.forEach((item) => {
    const toggle = item.querySelector(".showcase-toggle");
    const panel  = item.querySelector(".showcase-panel");
    if (!toggle || !panel) return;

    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");

    toggle.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      items.forEach((other) => setClosed(other));
      if (!isOpen) setOpen(item);
    });
  });

  updatePanelHeights();
  window.addEventListener("resize", updatePanelHeights);
}


/* ── 9. PARALLAX ──────────────────────────────────────────────── */
const parallaxItems  = Array.from(document.querySelectorAll("[data-parallax]"));
const reducedMotion  = window.matchMedia("(prefers-reduced-motion: reduce)");

if (parallaxItems.length && !reducedMotion.matches) {
  let ticking = false;
  const baseOffsets = new Map();

  parallaxItems.forEach((item) => {
    baseOffsets.set(item, item.getBoundingClientRect().top + window.scrollY);
  });

  const updateParallax = () => {
    const scrollY    = window.scrollY;
    const viewportH  = window.innerHeight;

    parallaxItems.forEach((item) => {
      const speed     = parseFloat(item.dataset.speed || "0.08");
      const base      = baseOffsets.get(item) || 0;
      const progress  = (scrollY + viewportH * 0.5 - base) / viewportH;
      const translate = Math.max(Math.min(progress * 40 * speed, 32), -32);
      item.style.transform = `translate3d(0, ${translate}px, 0)`;
    });

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    baseOffsets.clear();
    parallaxItems.forEach((item) => {
      baseOffsets.set(item, item.getBoundingClientRect().top + window.scrollY);
    });
    onScroll();
  });

  onScroll();
}


/* ── 10. FOUNDER BOARD ────────────────────────────────────────── */
const boardGridStatic    = document.getElementById("boardGridStatic");
const boardSoldCountEl   = document.getElementById("boardSoldCount");
const boardAvailCountEl  = document.getElementById("boardAvailCount");
const boardProgressFill  = document.getElementById("boardProgressFill");
const boardProgressLabel = document.getElementById("boardProgressLabel");

if (boardGridStatic) {
  const WALLET_COUNT = 800;

  // Build tiles
  const frag = document.createDocumentFragment();
  for (let i = 1; i <= WALLET_COUNT; i++) {
    const tile   = document.createElement("div");
    const isSold = SOLD_IDS.has(i);
    tile.className = "board-tile-static" + (isSold ? " is-sold" : "");
    tile.setAttribute("data-num", `#${String(i).padStart(4, "0")}`);

    if (!isSold) {
      tile.style.cursor = "pointer";
      tile.setAttribute("title", `Select Wallet #${String(i).padStart(4, "0")}`);
      tile.addEventListener("click", () => {
        localStorage.setItem("dynk_selected_wallet", String(i).padStart(4, "0"));
        window.location.href = "founder-wallets.html";
      });
    }

    frag.appendChild(tile);
  }
  boardGridStatic.appendChild(frag);

  // Update stats
  const soldCount  = SOLD_IDS.size;
  const availCount = WALLET_COUNT - soldCount;
  const pct        = ((soldCount / WALLET_COUNT) * 100).toFixed(1);

  if (boardSoldCountEl)   boardSoldCountEl.textContent  = soldCount;
  if (boardAvailCountEl)  boardAvailCountEl.textContent = availCount;
  if (boardProgressFill)  boardProgressFill.style.width = `${pct}%`;
  if (boardProgressLabel) boardProgressLabel.textContent = `${soldCount} of ${WALLET_COUNT} claimed`;

  /**
   * DynkBoard — public API for updating sold/available tiles at runtime.
   * Usage: window.DynkBoard.setSold([1, 2, 3])
   */
  window.DynkBoard = {
    setSold(ids) {
      if (!Array.isArray(ids)) return;
      ids.forEach((id) => {
        SOLD_IDS.add(id);
        const tile = boardGridStatic.children[id - 1];
        if (tile) tile.classList.add("is-sold");
      });
    },
    setAvailable(ids) {
      if (!Array.isArray(ids)) return;
      ids.forEach((id) => {
        SOLD_IDS.delete(id);
        const tile = boardGridStatic.children[id - 1];
        if (tile) tile.classList.remove("is-sold");
      });
    },
  };
}


/* ── 11. REVEAL ON SCROLL ─────────────────────────────────────── */
const revealEls = document.querySelectorAll(".reveal");

if (revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );
  revealEls.forEach((el) => observer.observe(el));
}


/* ── 12. CURSOR GLOW ──────────────────────────────────────────── */
const cursorGlow = document.querySelector("[data-cursor-glow]");

if (cursorGlow && !reducedMotion.matches) {
  const moveGlow = (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top  = `${event.clientY}px`;
  };
  window.addEventListener("pointermove", moveGlow, { passive: true });
}


/* ── 13. DEPTH LAYERS ─────────────────────────────────────────── */
const heroStage   = document.querySelector("[data-hero-stage]");
const depthLayers = Array.from(document.querySelectorAll("[data-depth]"));

if (heroStage && depthLayers.length && !reducedMotion.matches) {
  const updateDepth = (event) => {
    const rect = heroStage.getBoundingClientRect();
    const px   = ((event.clientX - rect.left) / rect.width  - 0.5) * 2;
    const py   = ((event.clientY - rect.top)  / rect.height - 0.5) * 2;

    depthLayers.forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth || "0");
      layer.style.transform = `translate3d(${px * depth * 48}px, ${py * depth * 48}px, 0)`;
    });
  };

  const resetDepth = () => depthLayers.forEach((layer) => (layer.style.transform = ""));

  heroStage.addEventListener("pointermove", updateDepth);
  heroStage.addEventListener("pointerleave", resetDepth);
}


/* ── 14. SECTION INDEX NAV ────────────────────────────────────── */
const sectionLinks        = Array.from(document.querySelectorAll(".section-index a"));
const immersiveSections   = Array.from(document.querySelectorAll(".immersive-section[id]"));

if (sectionLinks.length && immersiveSections.length) {
  const activateSection = (id) => {
    sectionLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) activateSection(visible.target.id);
    },
    { threshold: [0.2, 0.4, 0.65], rootMargin: "-20% 0px -35% 0px" },
  );

  immersiveSections.forEach((section) => sectionObserver.observe(section));
}


/* ── 15. SCROLL SCENES ────────────────────────────────────────── */
// hero progress section + protocol scroll-scrub
const heroProgressSection = document.querySelector("[data-hero-progress]");
const protocolSection     = document.querySelector("[data-protocol-section]");
const protocolItems       = Array.from(document.querySelectorAll(".circle-item"));

if (!reducedMotion.matches) {
  let scrollFrame = null;

  const setProtocolItem = (item) => {
    if (!item) return;

    protocolItems.forEach((entry) => {
      entry.classList.toggle("is-scrolled-active", entry === item);
    });

    if (circleFlip && circleBackTitle && circleBackText && circleBackQuote && circleBackQuoteMeta) {
      circleBackTitle.textContent     = item.dataset.title || "Protocol";
      circleBackText.textContent      = item.dataset.text  || "A discreet layer in the Dynk architecture.";
      circleBackQuote.textContent     = `"${item.dataset.quote || ""}"`;
      circleBackQuoteMeta.textContent = item.dataset.quoteMeta || "";
      circleFlip.classList.add("is-flipped");
    }
  };

  const updateScrollScenes = () => {
    if (heroProgressSection) {
      const rect     = heroProgressSection.getBoundingClientRect();
      const span     = Math.max(rect.height - window.innerHeight, 1);
      const progress = Math.min(Math.max(-rect.top / span, 0), 1);
      heroProgressSection.style.setProperty("--hero-progress", progress.toFixed(3));
    }

    if (protocolSection && protocolItems.length) {
      const rect      = protocolSection.getBoundingClientRect();
      const span      = Math.max(rect.height - window.innerHeight, 1);
      const progress  = Math.min(Math.max(-rect.top / span, 0), 1);
      const stepIndex = Math.min(protocolItems.length - 1, Math.floor(progress * protocolItems.length));
      setProtocolItem(protocolItems[stepIndex]);
    }

    scrollFrame = null;
  };

  const onSceneScroll = () => {
    if (scrollFrame !== null) return;
    scrollFrame = window.requestAnimationFrame(updateScrollScenes);
  };

  window.addEventListener("scroll", onSceneScroll, { passive: true });
  window.addEventListener("resize", onSceneScroll);
  onSceneScroll();
}


/* ── 16. STICKY SHOWCASE CARDS ────────────────────────────────── */
const showcaseOuter = document.querySelector("[data-showcase-scroll]");
const showcaseCards = Array.from(document.querySelectorAll("[data-showcase-step]"));

if (showcaseOuter && showcaseCards.length && !reducedMotion.matches) {
  const updateShowcase = () => {
    const rect     = showcaseOuter.getBoundingClientRect();
    const vh       = window.innerHeight;
    const scrolled = Math.max(0, -rect.top);
    const total    = Math.max(showcaseOuter.offsetHeight - vh, 1);
    const progress = Math.min(scrolled / total, 1);

    if (progress <= 0) {
      showcaseCards.forEach((c) => c.classList.remove("is-scroll-active"));
      return;
    }

    const idx = Math.min(showcaseCards.length - 1, Math.floor(progress * showcaseCards.length));
    showcaseCards.forEach((c, i) => c.classList.toggle("is-scroll-active", i === idx));
  };

  window.addEventListener("scroll", updateShowcase, { passive: true });
  window.addEventListener("resize", updateShowcase);
  updateShowcase();
}


/* ── 17. NFT ACCORDION ────────────────────────────────────────── */
const nftAccordion = document.querySelector("[data-nft-accordion]");

if (nftAccordion) {
  const nftItems = Array.from(nftAccordion.querySelectorAll(".nft-item"));

  nftItems.forEach((item) => {
    const toggle = item.querySelector(".nft-toggle");
    const panel  = item.querySelector(".nft-panel");
    if (!toggle || !panel) return;

    toggle.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // Close all items
      nftItems.forEach((other) => {
        const t = other.querySelector(".nft-toggle");
        const p = other.querySelector(".nft-panel");
        other.classList.remove("is-open");
        if (t) t.setAttribute("aria-expanded", "false");
        if (p) p.setAttribute("aria-hidden", "true");
      });

      // Open clicked item if it was closed
      if (!isOpen) {
        item.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        panel.setAttribute("aria-hidden", "false");
      }
    });
  });
}
