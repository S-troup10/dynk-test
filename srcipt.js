/* Reveal on scroll */
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

reveals.forEach(el => revealObserver.observe(el));

/* Animated counters */
function animateCounter(el) {
  const target = Number.parseFloat(el.dataset.target);
  const decimals = Number.parseInt(el.dataset.decimals ?? '0', 10);

  // Skip animation on mobile — prevents layout-flicker from rapid textContent changes
  if (window.innerWidth <= 900) {
    el.textContent = target.toFixed(decimals);
    return;
  }

  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (target * eased).toFixed(decimals);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toFixed(decimals);
    }
  }

  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);

document.querySelectorAll('.estat-num').forEach(el => {
  counterObserver.observe(el);
});

/* Walkthrough tabs */
const stepBtns = Array.from(document.querySelectorAll('.step-btn'));
const stepPanels = Array.from(document.querySelectorAll('.step-panel'));
const AUTO_DELAY = 5000;
let autoTimer = null;
let currentStep = Math.max(
  stepBtns.findIndex(btn => btn.classList.contains('active')),
  0
);

function goToStep(index) {
  if (!stepBtns.length) return;

  index = ((index % stepBtns.length) + stepBtns.length) % stepBtns.length;

  stepBtns.forEach((btn, i) => {
    const active = i === index;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
    btn.tabIndex = active ? 0 : -1;

    const bar = btn.querySelector('.step-progress');
    if (bar && active) {
      const clone = bar.cloneNode(true);
      bar.parentNode.replaceChild(clone, bar);
    }
  });

  stepPanels.forEach((panel, i) => {
    const active = i === index;
    panel.classList.toggle('active', active);
    panel.hidden = !active;
  });

  currentStep = index;
}

function startAuto() {
  if (stepBtns.length < 2) return;
  clearInterval(autoTimer);
  autoTimer = setInterval(() => {
    goToStep(currentStep + 1);
  }, AUTO_DELAY);
}

function stopAuto() {
  clearInterval(autoTimer);
}

stepBtns.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    goToStep(i);
    startAuto();
  });

  btn.addEventListener('keydown', event => {
    let nextIndex = null;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = i + 1;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      nextIndex = i - 1;
    }

    if (event.key === 'Home') {
      nextIndex = 0;
    }

    if (event.key === 'End') {
      nextIndex = stepBtns.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    goToStep(nextIndex);
    stepBtns[currentStep]?.focus();
    startAuto();
  });
});

const walkthroughEl = document.querySelector('.walkthrough-section');
if (walkthroughEl && stepBtns.length) {
  goToStep(currentStep);
  startAuto();

  const autoObserver = new IntersectionObserver(
    entries => {
      if (entries[0]?.isIntersecting) {
        startAuto();
      } else {
        stopAuto();
      }
    },
    { threshold: 0.35 }
  );

  autoObserver.observe(walkthroughEl);
}

/* ─── Scroll-scrubbed frame animation ───────────────────────────────── */
(function () {
  const FRAME_COUNT = 192;          // extracted frame count (24fps × 8s)
  const FRAME_DIR   = 'media/frames/hand/';
  const FRAME_EXT   = '.jpg';
  const PRELOAD_RADIUS = 8;

  const section = document.getElementById('scrubSection');
  const canvas  = document.getElementById('scrubCanvas');
  if (!section || !canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });

  // Loaded HTMLImageElement per frame index (null = not yet loaded)
  const frames = new Array(FRAME_COUNT).fill(null);
  const framePromises = new Array(FRAME_COUNT).fill(null);

  let pendingIndex  = 0;   // frame to draw on next RAF
  let renderedIndex = -1;  // last frame actually drawn
  let rafId         = null;
  let hasStarted    = false;

  // ── Sizing ───────────────────────────────────────────────────────────
  // After the first frame loads we know the video's intrinsic dimensions.
  // We set the canvas draw buffer to native size and CSS size to fit the
  // viewport, preserving aspect ratio on every window resize.
  let nativeW = 0;
  let nativeH = 0;

  function applyCanvasSize() {
    if (!nativeW) return;
    const isMobile = window.innerWidth <= 900;
    const canvasSide = section.querySelector('.scrub-canvas-side');
    let maxW, maxH;
    if (isMobile) {
      maxW = canvasSide ? canvasSide.clientWidth : window.innerWidth * 0.92;
      maxH = window.innerHeight * 0.47;
    } else {
      maxW = canvasSide
        ? Math.min(canvasSide.clientWidth - 16, window.innerWidth * 0.46)
        : window.innerWidth * 0.46;
      maxH = window.innerHeight * 0.60;
    }
    const scale = Math.min(maxW / nativeW, maxH / nativeH);
    canvas.style.width  = Math.round(nativeW * scale) + 'px';
    canvas.style.height = Math.round(nativeH * scale) + 'px';
  }

  // ── Phase switching ───────────────────────────────────────────────────
  const scrubSticky = section.querySelector('.scrub-sticky');
  let currentPhase  = -1;

  function updatePhase(progress) {
    const phase = progress >= 0.45 ? 1 : 0;
    if (phase === currentPhase) return;
    currentPhase = phase;

    section.querySelectorAll('.scrub-phase').forEach(el => {
      el.classList.toggle('active', Number(el.dataset.phase) === phase);
    });

    section.querySelectorAll('.scrub-track-step').forEach(el => {
      el.classList.toggle('active', Number(el.dataset.step) === phase);
    });

    if (scrubSticky) scrubSticky.classList.toggle('is-phase-agents', phase === 1);
  }

  function updateProgressBar(progress) {
    const fill = document.getElementById('scrubStepFill');
    if (!fill) return;
    // Fill the bar across phase 0 (0 → 0.45), then hold at 100%
    fill.style.width = Math.min(progress / 0.45, 1) * 100 + '%';
  }

  function initCanvas(img) {
    nativeW = img.naturalWidth;
    nativeH = img.naturalHeight;
    // Draw-buffer stays at native resolution for crisp rendering
    canvas.width  = nativeW;
    canvas.height = nativeH;
    applyCanvasSize();
  }

  window.addEventListener('resize', applyCanvasSize, { passive: true });

  // ── Frame loading ─────────────────────────────────────────────────────
  function pad(i) {
    // frames on disk are 1-indexed: frame_0001.jpg … frame_0151.jpg
    return String(i + 1).padStart(4, '0');
  }

  function loadFrame(i) {
    if (i < 0 || i >= FRAME_COUNT) return Promise.resolve(null);
    if (frames[i]) return Promise.resolve(frames[i]);
    if (framePromises[i]) return framePromises[i];

    framePromises[i] = new Promise(resolve => {
      const img = new Image();
      img.decoding = 'async';
      img.onload  = () => {
        frames[i] = img;
        framePromises[i] = null;
        resolve(img);
      };
      img.onerror = () => {
        framePromises[i] = null;
        resolve(null);
      };
      img.src = `${FRAME_DIR}frame_${pad(i)}${FRAME_EXT}`;
    });

    return framePromises[i];
  }

  function preloadAround(index, radius = PRELOAD_RADIUS) {
    const start = Math.max(0, index - radius);
    const end = Math.min(FRAME_COUNT - 1, index + radius);
    for (let i = start; i <= end; i++) {
      void loadFrame(i);
    }
  }

  function getNearestLoaded(index) {
    if (frames[index]) return frames[index];
    for (let offset = 1; offset < FRAME_COUNT; offset++) {
      const prev = index - offset;
      const next = index + offset;
      if (prev >= 0 && frames[prev]) return frames[prev];
      if (next < FRAME_COUNT && frames[next]) return frames[next];
    }
    return null;
  }

  async function startSequence() {
    if (hasStarted) return;
    hasStarted = true;

    // Load frame 0 when the section gets close, instead of during initial page load.
    const first = await loadFrame(0);
    if (!first) return;

    initCanvas(first);
    drawImmediate(0);
    canvas.classList.add('is-ready');
    updatePhase(0);
    updateProgressBar(0);

    preloadAround(0, 4);
    onScroll();
  }

  // ── Rendering ─────────────────────────────────────────────────────────
  function drawImmediate(index) {
    const img = frames[index];
    if (!img) return;
    ctx.drawImage(img, 0, 0, nativeW, nativeH);
    renderedIndex = index;
  }

  function scheduleRender(index) {
    pendingIndex = index;
    preloadAround(index);
    if (!frames[index]) {
      void loadFrame(index).then(img => {
        if (!img) return;
        scheduleRender(index);
      });
    }
    if (rafId !== null) return;          // already scheduled, just update target
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (pendingIndex !== renderedIndex && frames[pendingIndex]) {
        drawImmediate(pendingIndex);
      } else if (!frames[pendingIndex]) {
        const fallback = getNearestLoaded(pendingIndex);
        if (fallback) {
          ctx.drawImage(fallback, 0, 0, nativeW, nativeH);
        }
      }
    });
  }

  // ── Scroll mapping ────────────────────────────────────────────────────
  function getTargetIndex() {
    const { top } = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight;
    // progress: 0 = animation start, 1 = animation end
    const progress = Math.max(0, Math.min(1, -top / scrollable));
    return Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
  }

  function onScroll() {
    if (!nativeW) return;               // first frame not yet loaded
    const index = getTargetIndex();
    scheduleRender(index);
    const progress = index / (FRAME_COUNT - 1);
    updatePhase(progress);
    updateProgressBar(progress);
  }

  // ── Reduced-motion: just show first frame, no scrubbing ───────────────
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!prefersReduced.matches) {
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const startObserver = new IntersectionObserver(
    entries => {
      if (!entries[0]?.isIntersecting) return;
      void startSequence();
      startObserver.disconnect();
    },
    { rootMargin: '900px 0px' }
  );

  startObserver.observe(section);
})();

/* Header state */
const header = document.querySelector('.site-header');

function syncHeaderState() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 20);
}

syncHeaderState();
window.addEventListener('scroll', syncHeaderState, { passive: true });

/* Hero video autoplay reliability for iOS/mobile */
(function () {
  const heroVideo = document.querySelector('.hero-video');
  if (!heroVideo) return;

  function tryPlay() {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    heroVideo.setAttribute('muted', '');
    heroVideo.setAttribute('playsinline', '');
    heroVideo.setAttribute('webkit-playsinline', '');

    const playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }

  if (heroVideo.readyState >= 2) {
    tryPlay();
  } else {
    heroVideo.addEventListener('loadeddata', tryPlay, { once: true });
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tryPlay();
  });

  window.addEventListener('pageshow', tryPlay);
  window.addEventListener('touchstart', tryPlay, { passive: true, once: true });
})();

/* ── Feature showcase tabs ───────────────────────────────────────────── */
(function () {
  const featTabs   = Array.from(document.querySelectorAll('.feat-tab'));
  const featPanels = Array.from(document.querySelectorAll('.feat-panel'));
  if (!featTabs.length) return;

  const FEAT_DELAY = 5000;
  let featTimer  = null;
  let currentFeat = Math.max(
    featTabs.findIndex(t => t.classList.contains('active')),
    0
  );

  function goToFeat(index) {
    index = ((index % featTabs.length) + featTabs.length) % featTabs.length;

    featTabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));

      if (active) {
        const bar = tab.querySelector('.feat-tab-progress');
        if (bar) {
          const clone = bar.cloneNode(true);
          bar.parentNode.replaceChild(clone, bar);
        }
      }
    });

    featPanels.forEach((panel, i) => {
      const active = i === index;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });

    currentFeat = index;
  }

  function startFeatAuto() {
    clearInterval(featTimer);
    featTimer = setInterval(() => goToFeat(currentFeat + 1), FEAT_DELAY);
  }

  function stopFeatAuto() { clearInterval(featTimer); }

  featTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => { goToFeat(i); startFeatAuto(); });
  });

  const showcase = document.querySelector('.feat-showcase');
  if (showcase) {
    goToFeat(0);
    const obs = new IntersectionObserver(
      entries => entries[0]?.isIntersecting ? startFeatAuto() : stopFeatAuto(),
      { threshold: 0.25 }
    );
    obs.observe(showcase);
  }
})();

/* ── Hero mouse spotlight ────────────────────────────────────────────── */
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  let rafPending = false;
  hero.addEventListener('mousemove', e => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%');
      rafPending = false;
    });
  });
})();

/* ── Card 3-D tilt on hover ──────────────────────────────────────────── */
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) return;

  document.querySelectorAll('.cert-card, .eng-row, .usecase-card, .kp-tile, .td-stat').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      el.style.transform = `perspective(500px) rotateY(${(x * 6).toFixed(1)}deg) rotateX(${(-y * 6).toFixed(1)}deg) translateZ(3px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

/* ── Second scroll-scrubbed frame animation (0326) ───────────────────── */
(function () {
  const FRAME_COUNT = 178;
  const FRAME_DIR   = 'media/frames/0326/';
  const FRAME_EXT   = '.jpg';
  const PRELOAD_RADIUS = 8;

  const section = document.getElementById('scrubSection2');
  const canvas  = document.getElementById('scrubCanvas2');
  if (!section || !canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  const frames = new Array(FRAME_COUNT).fill(null);
  const framePromises = new Array(FRAME_COUNT).fill(null);

  let pendingIndex  = 0;
  let renderedIndex = -1;
  let rafId         = null;
  let nativeW = 0;
  let nativeH = 0;
  let hasStarted = false;

  function applyCanvasSize() {
    if (!nativeW) return;
    const isMobile = window.innerWidth <= 900;
    const canvasSide = section.querySelector('.scrub-canvas-side');
    let maxW, maxH;
    if (isMobile) {
      maxW = canvasSide ? canvasSide.clientWidth : window.innerWidth * 0.92;
      maxH = window.innerHeight * 0.47;
    } else {
      maxW = canvasSide
        ? Math.min(canvasSide.clientWidth - 16, window.innerWidth * 0.46)
        : window.innerWidth * 0.46;
      maxH = window.innerHeight * 0.82;
    }
    const scale = Math.min(maxW / nativeW, maxH / nativeH);
    canvas.style.width  = Math.round(nativeW * scale) + 'px';
    canvas.style.height = Math.round(nativeH * scale) + 'px';
  }

  const scrubSticky2 = section.querySelector('.scrub-sticky-2');
  let currentPhase2  = -1;

  function updatePhase2(progress) {
    const phase = progress >= 0.45 ? 1 : 0;
    if (phase === currentPhase2) return;
    currentPhase2 = phase;

    section.querySelectorAll('.scrub-phase').forEach(el => {
      el.classList.toggle('active', Number(el.dataset.phase) === phase);
    });

    section.querySelectorAll('.scrub-track-step').forEach(el => {
      el.classList.toggle('active', Number(el.dataset.step) === phase);
    });

    if (scrubSticky2) scrubSticky2.classList.toggle('is-phase-agents', phase === 1);
  }

  function updateProgressBar2(progress) {
    const fill = document.getElementById('scrubStepFill2');
    if (!fill) return;
    fill.style.width = Math.min(progress / 0.45, 1) * 100 + '%';
  }

  function initCanvas(img) {
    nativeW = img.naturalWidth;
    nativeH = img.naturalHeight;
    canvas.width  = nativeW;
    canvas.height = nativeH;
    applyCanvasSize();
  }

  window.addEventListener('resize', applyCanvasSize, { passive: true });

  function pad(i) {
    return String(i + 1).padStart(4, '0');
  }

  function loadFrame(i) {
    if (i < 0 || i >= FRAME_COUNT) return Promise.resolve(null);
    if (frames[i]) return Promise.resolve(frames[i]);
    if (framePromises[i]) return framePromises[i];

    framePromises[i] = new Promise(resolve => {
      const img = new Image();
      img.decoding = 'async';
      img.onload  = () => {
        frames[i] = img;
        framePromises[i] = null;
        resolve(img);
      };
      img.onerror = () => {
        framePromises[i] = null;
        resolve(null);
      };
      img.src = `${FRAME_DIR}frame_${pad(i)}${FRAME_EXT}`;
    });

    return framePromises[i];
  }

  function preloadAround(index, radius = PRELOAD_RADIUS) {
    const start = Math.max(0, index - radius);
    const end = Math.min(FRAME_COUNT - 1, index + radius);
    for (let i = start; i <= end; i++) {
      void loadFrame(i);
    }
  }

  function getNearestLoaded(index) {
    if (frames[index]) return frames[index];
    for (let offset = 1; offset < FRAME_COUNT; offset++) {
      const prev = index - offset;
      const next = index + offset;
      if (prev >= 0 && frames[prev]) return frames[prev];
      if (next < FRAME_COUNT && frames[next]) return frames[next];
    }
    return null;
  }

  async function startSequence() {
    if (hasStarted) return;
    hasStarted = true;

    const first = await loadFrame(0);
    if (!first) return;
    initCanvas(first);
    drawImmediate(0);
    canvas.classList.add('is-ready');
    onScroll2();
    preloadAround(0, 4);
  }

  function drawImmediate(index) {
    const img = frames[index];
    if (!img) return;
    ctx.drawImage(img, 0, 0, nativeW, nativeH);
    renderedIndex = index;
  }

  function scheduleRender(index) {
    pendingIndex = index;
    preloadAround(index);
    if (!frames[index]) {
      void loadFrame(index).then(img => {
        if (!img) return;
        scheduleRender(index);
      });
    }
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (pendingIndex !== renderedIndex && frames[pendingIndex]) {
        drawImmediate(pendingIndex);
      } else if (!frames[pendingIndex]) {
        const fallback = getNearestLoaded(pendingIndex);
        if (fallback) {
          ctx.drawImage(fallback, 0, 0, nativeW, nativeH);
        }
      }
    });
  }

  function getTargetIndex() {
    const { top } = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, -top / scrollable));
    return Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
  }

  function onScroll2() {
    if (!nativeW) return;
    // If section is entirely below the viewport, lock to phase 0
    const topNow = section.getBoundingClientRect().top;
    if (topNow > window.innerHeight) {
      currentPhase2 = -1;
      updatePhase2(0);
      updateProgressBar2(0);
      return;
    }
    const index = getTargetIndex();
    scheduleRender(index);
    const progress = index / (FRAME_COUNT - 1);
    updatePhase2(progress);
    updateProgressBar2(progress);
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!prefersReduced.matches) {
    window.addEventListener('scroll', onScroll2, { passive: true });
  }

  const startObserver = new IntersectionObserver(
    entries => {
      if (!entries[0]?.isIntersecting) return;
      void startSequence();
      startObserver.disconnect();
    },
    { rootMargin: '900px 0px' }
  );

  startObserver.observe(section);
})();

/* ── Mobile nav hamburger ────────────────────────────────────────────── */
(function () {
  const hamburger = document.getElementById('navHamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  function close() {
    hamburger.classList.remove('is-open');
    navLinks.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const opening = !hamburger.classList.contains('is-open');
    if (opening) {
      hamburger.classList.add('is-open');
      navLinks.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
    } else {
      close();
    }
  });

  navLinks.addEventListener('click', close);

  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      close();
    }
  });
})();
