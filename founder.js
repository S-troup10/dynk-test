const SOLD_IDS = new Set([1, 2, 3, 4, 5, 6, 8, 10, 11, 16, 18, 21, 25, 67, 87, 90, 100, 22, 667, 211, 500]);
const WALLET_COUNT = 800;

// ── URL params ──────────────────────────────────────────────────────────────
const params           = new URLSearchParams(window.location.search);
const selectedWalletStr = params.get("wallet");
const selectedWalletNum = selectedWalletStr ? parseInt(selectedWalletStr, 10) : null;

// ── Element refs ────────────────────────────────────────────────────────────
const fwGrid            = document.getElementById("fwGrid");
const fwSoldCount       = document.getElementById("fwSoldCount");
const fwAvailCount      = document.getElementById("fwAvailCount");
const fwProgressFill    = document.getElementById("fwProgressFill");
const fwProgressLabel   = document.getElementById("fwProgressLabel");
const fwCtaBtn          = document.getElementById("fwCtaBtn");
const fwCtaDesc         = document.getElementById("fwCtaDesc");
const fwHeroTitle       = document.getElementById("fwHeroTitle");
const fwPurchaseTitle   = document.getElementById("fwPurchaseTitle");
const fwScarcityText    = document.getElementById("fwScarcityText");
const fwSelectionBar    = document.getElementById("fwSelectionBar");
const fwSelectionText   = document.getElementById("fwSelectionText");
const fwSelectionCta    = document.getElementById("fwSelectionCta");
const fwSelectedCallout = document.getElementById("fwSelectedCallout");
const fwSelectedNum     = document.getElementById("fwSelectedNum");
const fwCalloutCta      = document.getElementById("fwCalloutCta");
const fwRevealOverlay   = document.getElementById("fwRevealOverlay");
const fwRevealNumber    = document.getElementById("fwRevealNumber");
const fwRevealConfirm   = document.getElementById("fwRevealConfirm");
const fwRevealKicker    = document.getElementById("fwRevealKicker");
let fwSelectionBarTimeout = null;

// ── Wallet reveal animation ─────────────────────────────────────────────────
function runWalletReveal(walletNum, { isPageLoad = false } = {}) {
  if (!fwRevealOverlay || !fwRevealNumber) return;

  // Reset
  fwRevealNumber.textContent = "0000";
  fwRevealNumber.classList.remove("is-locked");
  if (fwRevealConfirm) fwRevealConfirm.style.opacity = "0";
  fwRevealOverlay.classList.remove("is-dismissing");
  if (fwRevealKicker) {
    fwRevealKicker.textContent = isPageLoad ? "Securing your position" : "Wallet selected";
  }

  // Show
  fwRevealOverlay.style.display = "flex";
  requestAnimationFrame(() => requestAnimationFrame(() => {
    fwRevealOverlay.classList.add("is-visible");
  }));

  const SCRAMBLE_MS = isPageLoad ? 1500 : 550;
  const COUNT_MS    = isPageLoad ? 950  : 550;
  const HOLD_MS     = isPageLoad ? 1600 : 750;

  const animStart = performance.now();
  let lastFlip = 0;
  let locked = false;

  function tick(now) {
    const elapsed = now - animStart;

    if (elapsed < SCRAMBLE_MS) {
      if (now - lastFlip > 48) {
        fwRevealNumber.textContent = String(Math.floor(Math.random() * 800) + 1).padStart(4, "0");
        lastFlip = now;
      }
      requestAnimationFrame(tick);
      return;
    }

    const countT = elapsed - SCRAMBLE_MS;
    if (countT < COUNT_MS) {
      const t = countT / COUNT_MS;
      const eased = 1 - Math.pow(1 - t, 3);
      fwRevealNumber.textContent = String(Math.round(eased * walletNum)).padStart(4, "0");
      requestAnimationFrame(tick);
      return;
    }

    if (!locked) {
      locked = true;
      fwRevealNumber.textContent = String(walletNum).padStart(4, "0");
      fwRevealNumber.classList.add("is-locked");
      if (fwRevealConfirm) fwRevealConfirm.style.opacity = "1";
      setTimeout(dismissReveal, HOLD_MS);
    }
  }

  requestAnimationFrame(tick);

  function dismissReveal() {
    fwRevealOverlay.classList.remove("is-visible");
    fwRevealOverlay.classList.add("is-dismissing");
    setTimeout(() => {
      fwRevealOverlay.style.display = "none";
      fwRevealOverlay.classList.remove("is-dismissing");
    }, 650);
  }
}

// ── Page-load reveal (wallet in URL) ────────────────────────────────────────
if (selectedWalletNum && !isNaN(selectedWalletNum) && !SOLD_IDS.has(selectedWalletNum)) {
  if (fwRevealOverlay) {
    fwRevealOverlay.style.display = "flex";
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fwRevealOverlay.classList.add("is-visible");
    }));
    setTimeout(() => runWalletReveal(selectedWalletNum, { isPageLoad: true }), 250);
  }
}

// ── Board grid ──────────────────────────────────────────────────────────────
if (fwGrid) {
  const frag = document.createDocumentFragment();

  for (let i = 1; i <= WALLET_COUNT; i++) {
    const tile = document.createElement("div");
    const isSold     = SOLD_IDS.has(i);
    const isSelected = i === selectedWalletNum;
    tile.className   = "board-tile-static"
      + (isSold     ? " is-sold"     : "")
      + (isSelected ? " is-selected" : "");
    tile.setAttribute("data-num", `#${String(i).padStart(4, "0")}`);
    tile.setAttribute("title", `Wallet #${String(i).padStart(4, "0")} — ${isSold ? "Claimed" : "Available"}`);
    if (!isSold) {
      tile.style.cursor = "pointer";
      tile.addEventListener("click", () => selectWallet(i, tile));
    }
    frag.appendChild(tile);
  }
  fwGrid.appendChild(frag);

  const soldCount  = SOLD_IDS.size;
  const availCount = WALLET_COUNT - soldCount;
  const pct        = ((soldCount / WALLET_COUNT) * 100).toFixed(1);

  if (fwSoldCount)     fwSoldCount.textContent     = soldCount;
  if (fwAvailCount)    fwAvailCount.textContent     = availCount;
  if (fwProgressFill)  fwProgressFill.style.width   = `${pct}%`;
  if (fwProgressLabel) fwProgressLabel.textContent  = `${soldCount} of ${WALLET_COUNT} claimed`;
  if (fwScarcityText)  fwScarcityText.textContent   = `${availCount} wallets remaining`;

  // Restore pre-selected wallet from URL (no animation — overlay handles that)
  if (selectedWalletNum && !SOLD_IDS.has(selectedWalletNum)) {
    fwGrid.classList.add("has-selection");
    const tile = fwGrid.children[selectedWalletNum - 1];
    if (tile) setTimeout(() => tile.scrollIntoView({ behavior: "smooth", block: "center" }), 600);
    const padded = String(selectedWalletNum).padStart(4, "0");
    updateCta(padded);
    showSelectionBar(padded);
    showCallout(padded);
    updateForm(padded);
  }
}

// ── selectWallet ────────────────────────────────────────────────────────────
function selectWallet(num, clickedTile) {
  // Clear previous selection
  fwGrid.querySelectorAll(".is-selected").forEach(t => t.classList.remove("is-selected"));
  fwGrid.querySelectorAll(".is-locking").forEach(t => t.classList.remove("is-locking"));

  // Tile lock animation — scale + glow burst
  void clickedTile.offsetWidth; // force reflow so animation restarts
  clickedTile.classList.add("is-locking");
  clickedTile.addEventListener("animationend", () => {
    clickedTile.classList.remove("is-locking");
    clickedTile.classList.add("is-selected");
  }, { once: true });

  // Dim the board
  fwGrid.classList.add("has-selection");

  const padded = String(num).padStart(4, "0");
  updateCta(padded);
  showCallout(padded);
  updateForm(padded);

  const url = new URL(window.location);
  url.searchParams.set("wallet", padded);
  history.replaceState(null, "", url);

  // Show pill + run reveal
  setTimeout(() => {
    showSelectionBar(padded);
    runWalletReveal(num, { isPageLoad: false });
  }, 160);
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function updateCta(padded) {
  if (fwCtaBtn) {
    fwCtaBtn.textContent = `Buy Wallet #${padded} →`;
    fwCtaBtn.href = "#fw-contact";
  }
  if (fwCtaDesc) {
    fwCtaDesc.textContent = `You have selected Wallet #${padded}. Fill in the form below to arrange a call and secure your position.`;
  }
  if (fwPurchaseTitle) {
    fwPurchaseTitle.innerHTML = `Secure Wallet<br>#${padded}.`;
  }
}

function showSelectionBar(padded) {
  if (!fwSelectionBar) return;

  if (fwSelectionBarTimeout) {
    clearTimeout(fwSelectionBarTimeout);
    fwSelectionBarTimeout = null;
  }

  if (fwSelectionText) fwSelectionText.textContent = `Wallet #${padded} selected`;
  fwSelectionBar.classList.add("is-visible");

  fwSelectionBarTimeout = setTimeout(() => {
    fwSelectionBar.classList.remove("is-visible");
    fwSelectionBarTimeout = null;
  }, 3200);
}

function showCallout(padded) {
  if (!fwSelectedCallout) return;
  if (fwSelectedNum) fwSelectedNum.textContent = `Wallet #${padded}`;
  if (fwCalloutCta)  fwCalloutCta.href = "#fw-contact";
  fwSelectedCallout.classList.add("is-visible");
}

function updateForm(padded) {
  const walletField  = document.getElementById("fwFormWallet");
  const subjectField = document.getElementById("fwFormSubject");
  if (walletField) {
    walletField.value = `#${padded}`;
    walletField.classList.add("has-value");
  }
  if (subjectField) {
    subjectField.value = `Founder Wallet #${padded} Enquiry`;
  }
}

// ── Contact form — AJAX submission ─────────────────────────────────────────
const fwContactForm = document.getElementById("fwContactForm");
const fwFormBtn     = document.getElementById("fwFormBtn");
const fwFormWrap    = document.getElementById("fwFormWrap");
const fwFormSuccess = document.getElementById("fwFormSuccess");

if (fwContactForm && fwFormBtn) {
  fwContactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Basic validation
    const name  = fwContactForm.querySelector("#fwFormName");
    const email = fwContactForm.querySelector("#fwFormEmail");
    if (!name.value.trim() || !email.value.trim()) {
      name.classList.toggle("fw-form-input--error", !name.value.trim());
      email.classList.toggle("fw-form-input--error", !email.value.trim());
      return;
    }

    // Loading state
    fwFormBtn.disabled = true;
    fwFormBtn.classList.add("is-loading");
    fwFormBtn.textContent = "Sending";

    const wallet  = (fwContactForm.querySelector("#fwFormWallet")?.value  || "").trim();
    const phone   = (fwContactForm.querySelector("#fwFormPhone")?.value   || "").trim();
    const message = (fwContactForm.querySelector("#fwFormMessage")?.value || "").trim();
    const subject = wallet
      ? `Founder Wallet ${wallet} Enquiry`
      : "Founder Wallet Enquiry";

    try {
      const res = await fetch("https://api.staticforms.xyz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessKey: "sf_47101be9907d2407a1ce5375",
          name:      name.value.trim(),
          email:     email.value.trim(),
          phone,
          subject,
          replyTo:   "@",
          message:   `Wallet: ${wallet || "Not selected"}\n\n${message}`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showFormSuccess(wallet);
      } else {
        resetFormBtn("Try Again →");
      }
    } catch {
      resetFormBtn("Try Again →");
    }
  });

  // Clear error highlight on input
  fwContactForm.querySelectorAll(".fw-form-input").forEach(el => {
    el.addEventListener("input", () => el.classList.remove("fw-form-input--error"));
  });
}

function showFormSuccess(wallet) {
  if (!fwFormWrap || !fwFormSuccess) return;

  // Lock wrap height so it doesn't collapse
  fwFormWrap.style.minHeight = fwFormWrap.offsetHeight + "px";

  // Wallet text in success message
  const walletSpan = document.getElementById("fwFormSuccessWallet");
  if (walletSpan && wallet) walletSpan.textContent = ` in Founder Wallet ${wallet}`;

  // Slide form out
  fwContactForm.classList.add("is-exiting");

  setTimeout(() => {
    fwContactForm.style.display = "none";
    fwFormSuccess.classList.add("is-visible");
  }, 420);
}

function resetFormBtn(label) {
  if (!fwFormBtn) return;
  fwFormBtn.disabled = false;
  fwFormBtn.classList.remove("is-loading");
  fwFormBtn.textContent = label;
}

// ── Scroll reveal ───────────────────────────────────────────────────────────
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length) {
  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.06 }
  );
  revealEls.forEach(el => observer.observe(el));
}
