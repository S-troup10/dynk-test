
const SOLD_IDS = new Set([1, 2, 3, 4, 5,  6, 8, 10, 11, 16, 18, 21, 25, 67, 87, 90, 100, 22, 667, 211, 500, ]);

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

const bindTap = (element, handler) => {
  let lastTouchTime = 0;

  const onTouchEnd = (event) => {
    lastTouchTime = Date.now();
    if (event.cancelable) {
      event.preventDefault();
    }
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

// ── WEF Carousel ──────────────────────────────────────────────────────────
const wefText = document.getElementById("wefText");
const wefAuthor = document.getElementById("wefAuthor");
const wefDotsEl = document.getElementById("wefDots");
const wefPrevBtn = document.getElementById("wefPrev");
const wefNextBtn = document.getElementById("wefNext");
const wefFrame = document.getElementById("wefFrame");

if (wefText && wefAuthor && wefDotsEl) {
  let wefIdx = 0;
  let wefTimer = null;

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
      wefText.textContent = `"${q.text}"`;
      wefAuthor.textContent = q.meta;
      wefDots.forEach((d, i) => d.classList.toggle("is-active", i === wefIdx));
      if (wefFrame) wefFrame.classList.remove("is-fading");
    }, 280);
    wefTimer = setTimeout(() => wefGoTo(wefIdx + 1), 5200);
  };

  const q0 = quotes[0];
  wefText.textContent = `"${q0.text}"`;
  wefAuthor.textContent = q0.meta;

  if (wefPrevBtn) bindTap(wefPrevBtn, () => wefGoTo(wefIdx - 1));
  if (wefNextBtn) bindTap(wefNextBtn, () => wefGoTo(wefIdx + 1));

  wefTimer = setTimeout(() => wefGoTo(1), 5200);
}
// ──────────────────────────────────────────────────────────────────────────

const circleFlip = document.getElementById("circleFlip");
const circleBackTitle = document.getElementById("circleBackTitle");
const circleBackText = document.getElementById("circleBackText");
const circleBackQuote = document.getElementById("circleBackQuote");
const circleBackQuoteMeta = document.getElementById("circleBackQuoteMeta");
const circleItems = document.querySelectorAll(".circle-item");

if (
  circleFlip &&
  circleBackTitle &&
  circleBackText &&
  circleBackQuote &&
  circleBackQuoteMeta &&
  circleItems.length
) {
  const defaultQuote =
    "The key is to harness the benefits while managing the risks.";
  const defaultQuoteMeta = "Christine Lagarde - IMF 2018";
  const canHover = window.matchMedia("(hover: hover)").matches;
  let activeItem = null;
  const isTouch = () =>
    window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const useModal = () =>
    isTouch() || window.matchMedia("(max-width: 900px)").matches;
  const circleModal = document.querySelector("[data-circle-modal]");
  const circleModalClose = document.querySelector("[data-circle-modal-close]");
  const circleModalTitle = document.getElementById("circleModalTitle");
  const circleModalText = document.getElementById("circleModalText");
  const circleModalQuote = document.getElementById("circleModalQuote");
  const circleModalMeta = document.getElementById("circleModalMeta");

  const getItemContent = (item) => ({
    title: item.dataset.title || "Protocol",
    text: item.dataset.text || "A discreet layer in the Dynk architecture.",
    quote: item.dataset.quote || defaultQuote,
    meta: item.dataset.quoteMeta || defaultQuoteMeta,
  });

  const applyToBack = (content) => {
    circleBackTitle.textContent = content.title;
    circleBackText.textContent = content.text;
    circleBackQuote.textContent = `"${content.quote}"`;
    circleBackQuoteMeta.textContent = content.meta;
  };

  const applyToModal = (content) => {
    if (
      !circleModalTitle ||
      !circleModalText ||
      !circleModalQuote ||
      !circleModalMeta
    ) {
      return;
    }
    circleModalTitle.textContent = content.title;
    circleModalText.textContent = content.text;
    circleModalQuote.textContent = `"${content.quote}"`;
    circleModalMeta.textContent = content.meta;
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
      if (!canHover) {
        return;
      }
      openItem(item);
    });

    item.addEventListener("mouseleave", () => {
      if (!canHover) {
        return;
      }
      closeItem();
    });

    bindTap(item, (event) => {
      event.preventDefault();
      if (useModal() && circleModal) {
        const content = getItemContent(item);
        applyToModal(content);
        circleFlip.classList.remove("is-flipped");
        circleModal.classList.add("is-open");
        circleModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        if (circleModalClose) {
          circleModalClose.focus();
        }
        return;
      }
      if (activeItem === item) {
        closeItem();
        return;
      }
      openItem(item);
    });
  });

  document.addEventListener("click", (event) => {
    if (
      event.target.closest(".circle-item") ||
      event.target.closest("#circleFlip")
    ) {
      return;
    }
    closeItem();
  });

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
      if (event.target === circleModal) {
        closeCircleModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && circleModal.classList.contains("is-open")) {
        closeCircleModal();
      }
    });

    window.addEventListener("resize", () => {
      if (!useModal() && circleModal.classList.contains("is-open")) {
        closeCircleModal();
      }
      if (useModal()) {
        circleFlip.classList.remove("is-flipped");
      }
    });
  }
}

const showcaseModalTrigger = document.querySelector("[data-showcase-modal]");
const showcaseModal = document.querySelector("[data-modal]");
const showcaseModalClose = document.querySelector("[data-modal-close]");

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
    if (!isMobile()) {
      return;
    }
    event.preventDefault();
    openModal();
  });

  bindTap(showcaseModalClose, (event) => {
    event.preventDefault();
    closeModal();
  });

  showcaseModal.addEventListener("click", (event) => {
    if (event.target === showcaseModal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && showcaseModal.classList.contains("is-open")) {
      closeModal();
    }
  });

  window.addEventListener("resize", () => {
    if (!isMobile() && showcaseModal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

const walletModalTriggers = Array.from(
  document.querySelectorAll("[data-wallet-modal]"),
);
const walletModal = document.querySelector("[data-wallet-modal-dialog]");
const walletModalClose = document.querySelector("[data-wallet-modal-close]");

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
    if (event.target === walletModal) {
      closeWalletModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && walletModal.classList.contains("is-open")) {
      closeWalletModal();
    }
  });
}

const showcaseAccordion = document.querySelector("[data-showcase-accordion]");
const showcaseCopy = document.querySelector(".showcase-copy");

if (showcaseAccordion) {
  const items = Array.from(
    showcaseAccordion.querySelectorAll(".showcase-item"),
  );
  const panels = items
    .map((item) => item.querySelector(".showcase-panel"))
    .filter(Boolean);
  const getPanelHeight = (panel) => {
    const item = panel.closest(".showcase-item");
    if (!item) {
      return panel.scrollHeight;
    }
    const wasOpen = item.classList.contains("is-open");
    if (!wasOpen) {
      item.classList.add("is-open");
    }
    const styles = window.getComputedStyle(panel);
    const padding =
      parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const margin =
      parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
    const border =
      parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
    const height = panel.scrollHeight + padding + margin + border;
    if (!wasOpen) {
      item.classList.remove("is-open");
    }
    return height;
  };

  const updatePanelHeights = () => {
    showcaseAccordion.classList.add("is-measuring");
    panels.forEach((panel) => {
      const panelHeight = getPanelHeight(panel);
      panel.style.setProperty("--panel-height", `${panelHeight}px`);
    });

    if (showcaseCopy && panels.length) {
      const openItems = items.filter((item) =>
        item.classList.contains("is-open"),
      );
      openItems.forEach((item) => setClosed(item));
      showcaseCopy.style.minHeight = "";
      const baseHeight = showcaseCopy.getBoundingClientRect().height;
      openItems.forEach((item) => setOpen(item));
      const maxPanelHeight = Math.max(
        ...panels.map(
          (panel) =>
            parseFloat(panel.style.getPropertyValue("--panel-height")) || 0,
        ),
      );
      showcaseCopy.style.minHeight = `${Math.ceil(
        baseHeight + maxPanelHeight,
      )}px`;
    }
    showcaseAccordion.classList.remove("is-measuring");
  };

  const setClosed = (item) => {
    const toggle = item.querySelector(".showcase-toggle");
    const panel = item.querySelector(".showcase-panel");
    if (!toggle || !panel) {
      return;
    }
    item.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
  };

  const setOpen = (item) => {
    const toggle = item.querySelector(".showcase-toggle");
    const panel = item.querySelector(".showcase-panel");
    if (!toggle || !panel) {
      return;
    }
    item.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
  };

  items.forEach((item) => {
    const toggle = item.querySelector(".showcase-toggle");
    const panel = item.querySelector(".showcase-panel");
    if (!toggle || !panel) {
      return;
    }

    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");

    toggle.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      items.forEach((other) => setClosed(other));
      if (!isOpen) {
        setOpen(item);
      }
    });
  });
  updatePanelHeights();
  window.addEventListener("resize", updatePanelHeights);
}

const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (parallaxItems.length && !reducedMotion.matches) {
  let ticking = false;
  const baseOffsets = new Map();

  parallaxItems.forEach((item) => {
    baseOffsets.set(item, item.getBoundingClientRect().top + window.scrollY);
  });

  const updateParallax = () => {
    const scrollY = window.scrollY;
    const viewportH = window.innerHeight;

    parallaxItems.forEach((item) => {
      const speed = parseFloat(item.dataset.speed || "0.08");
      const base = baseOffsets.get(item) || 0;
      const progress = (scrollY + viewportH * 0.5 - base) / viewportH;
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

const boardGridStatic = document.getElementById("boardGridStatic");
const boardSoldCountEl = document.getElementById("boardSoldCount");
const boardAvailCountEl = document.getElementById("boardAvailCount");
const boardProgressFill = document.getElementById("boardProgressFill");
const boardProgressLabel = document.getElementById("boardProgressLabel");

if (boardGridStatic) {
  const WALLET_COUNT = 800;
  // Add sold wallet IDs here
  

  const frag = document.createDocumentFragment();
  for (let i = 1; i <= WALLET_COUNT; i++) {
    const tile = document.createElement("div");
    tile.className = "board-tile-static" + (SOLD_IDS.has(i) ? " is-sold" : "");
    tile.setAttribute("data-num", `#${String(i).padStart(3, "0")}`);
    frag.appendChild(tile);
  }
  boardGridStatic.appendChild(frag);

  const soldCount = SOLD_IDS.size;
  const availCount = WALLET_COUNT - soldCount;
  const pct = ((soldCount / WALLET_COUNT) * 100).toFixed(1);

  if (boardSoldCountEl) boardSoldCountEl.textContent = soldCount;
  if (boardAvailCountEl) boardAvailCountEl.textContent = availCount;
  if (boardProgressFill) boardProgressFill.style.width = `${pct}%`;
  if (boardProgressLabel) boardProgressLabel.textContent = `${soldCount} of ${WALLET_COUNT} claimed`;

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

const cursorGlow = document.querySelector("[data-cursor-glow]");
const heroStage = document.querySelector("[data-hero-stage]");
const depthLayers = Array.from(document.querySelectorAll("[data-depth]"));
const sectionLinks = Array.from(document.querySelectorAll(".section-index a"));
const immersiveSections = Array.from(
  document.querySelectorAll(".immersive-section[id]"),
);

if (cursorGlow && !reducedMotion.matches) {
  const moveGlow = (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  };

  window.addEventListener("pointermove", moveGlow, { passive: true });
}

if (heroStage && depthLayers.length && !reducedMotion.matches) {
  const updateDepth = (event) => {
    const rect = heroStage.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const py = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    depthLayers.forEach((layer) => {
      const depth = parseFloat(layer.dataset.depth || "0");
      const x = px * depth * 48;
      const y = py * depth * 48;
      layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  };

  const resetDepth = () => {
    depthLayers.forEach((layer) => {
      layer.style.transform = "";
    });
  };

  heroStage.addEventListener("pointermove", updateDepth);
  heroStage.addEventListener("pointerleave", resetDepth);
}

if (sectionLinks.length && immersiveSections.length) {
  const activateSection = (id) => {
    sectionLinks.forEach((link) => {
      const isMatch = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isMatch);
    });
  };

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visibleEntry?.target?.id) {
        activateSection(visibleEntry.target.id);
      }
    },
    {
      threshold: [0.2, 0.4, 0.65],
      rootMargin: "-20% 0px -35% 0px",
    },
  );

  immersiveSections.forEach((section) => sectionObserver.observe(section));
}

const heroProgressSection = document.querySelector("[data-hero-progress]");
const protocolSection = document.querySelector("[data-protocol-section]");
const protocolItems = Array.from(document.querySelectorAll(".circle-item"));

// ── Sticky showcase cards ────────────────────────────────────────────────
const showcaseOuter = document.querySelector("[data-showcase-scroll]");
const showcaseCards = Array.from(document.querySelectorAll("[data-showcase-step]"));

if (showcaseOuter && showcaseCards.length && !reducedMotion.matches) {
  const updateShowcase = () => {
    const rect = showcaseOuter.getBoundingClientRect();
    const vh = window.innerHeight;
    const scrolled = Math.max(0, -rect.top);
    const total = Math.max(showcaseOuter.offsetHeight - vh, 1);
    const progress = Math.min(scrolled / total, 1);

    if (progress <= 0) {
      showcaseCards.forEach(c => c.classList.remove("is-scroll-active"));
      return;
    }
    const idx = Math.min(showcaseCards.length - 1, Math.floor(progress * showcaseCards.length));
    showcaseCards.forEach((c, i) => c.classList.toggle("is-scroll-active", i === idx));
  };

  window.addEventListener("scroll", updateShowcase, { passive: true });
  window.addEventListener("resize", updateShowcase);
  updateShowcase();
}
// ─────────────────────────────────────────────────────────────────────────

if (!reducedMotion.matches) {
  let scrollFrame = null;

  const setProtocolItem = (item) => {
    if (!item) return;

    protocolItems.forEach((entry) => {
      entry.classList.toggle("is-scrolled-active", entry === item);
    });

    if (
      circleFlip &&
      circleBackTitle &&
      circleBackText &&
      circleBackQuote &&
      circleBackQuoteMeta
    ) {
      circleBackTitle.textContent = item.dataset.title || "Protocol";
      circleBackText.textContent =
        item.dataset.text || "A discreet layer in the Dynk architecture.";
      circleBackQuote.textContent = `"${item.dataset.quote || ""}"`;
      circleBackQuoteMeta.textContent = item.dataset.quoteMeta || "";
      circleFlip.classList.add("is-flipped");
    }
  };

  const updateScrollScenes = () => {
    if (heroProgressSection) {
      const rect = heroProgressSection.getBoundingClientRect();
      const span = Math.max(rect.height - window.innerHeight, 1);
      const progress = Math.min(Math.max(-rect.top / span, 0), 1);
      heroProgressSection.style.setProperty("--hero-progress", progress.toFixed(3));
    }

    if (protocolSection && protocolItems.length) {
      const rect = protocolSection.getBoundingClientRect();
      const span = Math.max(rect.height - window.innerHeight, 1);
      const progress = Math.min(Math.max(-rect.top / span, 0), 1);
      const stepIndex = Math.min(
        protocolItems.length - 1,
        Math.floor(progress * protocolItems.length),
      );
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

// ── AI Agent — static frame scrub ────────────────────────────────────────
// Frames were pre-extracted via ffmpeg: media/frames/agent/frame_0001.jpg … frame_0120.jpg
const agentOuter  = document.querySelector("[data-agent-scroll]");
const agentCanvas = document.getElementById("agentCanvas");
const agentPhase1 = document.getElementById("agentPhase1");
const agentPhase2 = document.getElementById("agentPhase2");
const agentFill   = document.getElementById("agentProgressFill");

if (agentOuter && agentCanvas && !reducedMotion.matches) {
  const agentCtx = agentCanvas.getContext("2d");
  const FRAME_COUNT = 120;
  const frames = [];
  let loadedCount = 0;

  // Pre-load all frames immediately — browser caches them in parallel
  for (let i = 0; i < FRAME_COUNT; i++) {
    const n = String(i + 1).padStart(4, "0");
    const img = new Image();
    img.src = `media/frames/agent/frame_${n}.jpg`;
    img.onload = () => {
      loadedCount++;
      // Size canvas once from first loaded frame
      if (loadedCount === 1) {
        agentCanvas.width  = img.naturalWidth;
        agentCanvas.height = img.naturalHeight;
        drawAgentFrame(); // show first frame immediately
      }
    };
    frames.push(img);
  }

  // ── Progress calculation ─────────────────────────────────────────────────
  const getAgentProgress = () => {
    const rect    = agentOuter.getBoundingClientRect();
    const scrolled = Math.max(0, -rect.top);
    const total    = Math.max(agentOuter.offsetHeight - window.innerHeight, 1);
    return Math.min(scrolled / total, 1);
  };

  const drawAgentFrame = () => {
    const progress = getAgentProgress();
    const idx = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
    const img = frames[idx];

    if (img && img.complete && img.naturalWidth && agentCanvas.width) {
      agentCtx.drawImage(img, 0, 0, agentCanvas.width, agentCanvas.height);
    }

    if (agentFill) agentFill.style.width = `${progress * 100}%`;

    if (agentPhase1 && agentPhase2) {
      const showPhase2 = progress >= 0.5;
      agentPhase1.classList.toggle("is-hidden", showPhase2);
      agentPhase2.classList.toggle("is-hidden", !showPhase2);
    }
  };

  window.addEventListener("scroll", drawAgentFrame, { passive: true });
  window.addEventListener("resize", drawAgentFrame);
  drawAgentFrame();
}
// ─────────────────────────────────────────────────────────────────────────
