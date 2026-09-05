// ============================================================================
// AURUM TITANS · LUXURY 3D REAL ESTATE WEB APPLICATION
// Modular ES6 Client Engine
// ============================================================================

import { MANSIONS, PORTFOLIO_STATS } from './data.js';
import {
  initAuraPortal,
  closeAuraPortal,
  init3DMansionViewer,
  switch3DMansion,
  toggleSplitRooms,
  setSplitSlider,
  focusLevel,
  toggleDayNightMode,
  zoomIn,
  zoomOut,
  toggleAutoRotate,
  resetCameraView
} from './three-world.js';

let activeFilterLocation = 'ALL';
let currentSort = 'price-desc';
let activeModalMansion = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // 1. Start Aura Farming Hole / Wormhole Welcome Animation
  initAuraWelcome();

  // 2. Initialize 3D Mansion Viewer
  init3DMansionViewer('mansion-3d-canvas-wrapper', 'villa-skyfall');

  // 3. Render Initial Mansion Cards (Clash Royale 3D Triangular Cards)
  renderMansionCards();

  // 4. Setup Event Listeners & Interactive UI
  setupNavigationAndFilters();
  setup3DViewerControls();
  setupMortgageCalculator();
  setupModals();
  setupReplayPortal();
});

// ----------------------------------------------------------------------------
// 1. AURA FARMING HOLE / WORMHOLE WELCOME LOGIC
// ----------------------------------------------------------------------------
function initAuraWelcome() {
  initAuraPortal(() => {
    showToast('Entered 3D Realm: Interactive Architecture Ready', 'fa-cube');
  });

  const enterBtn = document.getElementById('btn-enter-portal');
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      closeAuraPortal(() => {
        showToast('Welcome to AURUM TITANS 3D Compound Portal', 'fa-crown');
      });
    });
  }
}

function setupReplayPortal() {
  const replayBtn = document.getElementById('btn-replay-portal');
  const portalOverlay = document.getElementById('aura-welcome-overlay');
  if (replayBtn && portalOverlay) {
    replayBtn.addEventListener('click', () => {
      portalOverlay.style.display = 'flex';
      portalOverlay.classList.remove('portal-warp-out');
      initAuraPortal();
    });
  }
}

// ----------------------------------------------------------------------------
// 2. 3D VIEWER COCKPIT CONTROLS
// ----------------------------------------------------------------------------
function setup3DViewerControls() {
  // Populate Mansion Dropdown in 3D Cockpit
  const mansionSelect = document.getElementById('viewer-mansion-select');
  const calcMansionSelect = document.getElementById('calc-mansion-select');
  const tourMansionSelect = document.getElementById('tour-estate-select');

  if (mansionSelect) {
    mansionSelect.innerHTML = MANSIONS.map(m => `
      <option value="${m.id}">${m.name} (${m.formattedPrice})</option>
    `).join('');

    mansionSelect.addEventListener('change', (e) => {
      switch3DMansion(e.target.value);
      showToast(`Switched 3D Model: ${mansionSelect.options[mansionSelect.selectedIndex].text}`, 'fa-cube');
    });
  }

  if (calcMansionSelect) {
    calcMansionSelect.innerHTML = MANSIONS.map(m => `
      <option value="${m.id}">${m.name} - ${m.formattedPrice}</option>
    `).join('');

    calcMansionSelect.addEventListener('change', (e) => {
      const selected = MANSIONS.find(m => m.id === e.target.value);
      if (selected) {
        const priceSlider = document.getElementById('calc-price-slider');
        if (priceSlider) {
          priceSlider.value = selected.price;
          updateCalculator();
        }
      }
    });
  }

  if (tourMansionSelect) {
    tourMansionSelect.innerHTML = MANSIONS.map(m => `
      <option value="${m.id}">${m.name} · ${m.location}</option>
    `).join('');
  }

  // Split Rooms Controls
  const splitBtn = document.getElementById('btn-split-toggle');
  if (splitBtn) {
    splitBtn.addEventListener('click', () => {
      toggleSplitRooms();
    });
  }

  const splitSlider = document.getElementById('split-range-slider');
  if (splitSlider) {
    splitSlider.addEventListener('input', (e) => {
      setSplitSlider(Number(e.target.value));
    });
  }

  // Level Focus Chips
  const levelChips = document.querySelectorAll('.btn-level-chip');
  levelChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const level = Number(chip.dataset.level);
      focusLevel(level);
      levelChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Camera & Environment Buttons
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => zoomIn());
  document.getElementById('btn-zoom-out')?.addEventListener('click', () => zoomOut());
  document.getElementById('btn-auto-rotate')?.addEventListener('click', () => toggleAutoRotate());
  document.getElementById('btn-reset-cam')?.addEventListener('click', () => resetCameraView());
  document.getElementById('btn-day-night')?.addEventListener('click', () => toggleDayNightMode());

  // Hero "TRY IN 3D" Button Smooth Scroll & 3D Focus
  document.getElementById('btn-try-3d-hero')?.addEventListener('click', () => {
    document.getElementById('viewer-3d-section')?.scrollIntoView({ behavior: 'smooth' });
    showToast('Entering 3D World: Drag to orbit 360°, scroll to zoom', 'fa-cube');
  });
}

// ----------------------------------------------------------------------------
// 3. CLASH ROYALE STYLE 3D TRIANGULAR CARDS RENDERING
// Strict requirement: NO CLUTTER BADGES ON CARD FACE, ONLY PROPERTY NAME & SCALELINE.
// Below card: PROMINENT "TRY 3D!" BUTTON + VIEW ESTATE + PRIVATE TOUR + BROCHURE.
// ----------------------------------------------------------------------------
function renderMansionCards() {
  const grid = document.getElementById('estates-grid');
  if (!grid) return;

  // Filter properties
  let filtered = [...MANSIONS];
  if (activeFilterLocation !== 'ALL') {
    filtered = filtered.filter(m => m.location.toLowerCase() === activeFilterLocation.toLowerCase());
  }

  // Sort properties
  filtered.sort((a, b) => {
    if (currentSort === 'price-desc') return b.price - a.price;
    if (currentSort === 'price-asc') return a.price - b.price;
    if (currentSort === 'sqft-desc') return b.scale.sqFt - a.scale.sqFt;
    if (currentSort === 'beds-desc') return b.scale.beds - a.scale.beds;
    return 0;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
        <i class="fa-solid fa-building-circle-exclamation" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--gold-primary);"></i>
        <h3>No compounds found in this location tier</h3>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(mansion => `
    <article class="mansion-3d-card" data-id="${mansion.id}">
      <!-- 3D IMAGE VIEWPORT (CLEAN, NO BADGES) -->
      <div class="card-media-viewport">
        <img class="card-img" src="${mansion.images.hero}" alt="${mansion.name}" loading="lazy">
        <div class="card-gradient-overlay"></div>
        <!-- 3D Triangular Gem Accent -->
        <div class="card-corner-gem" title="3D Architectural Model Available">
          <i class="fa-solid fa-cube"></i>
        </div>
      </div>

      <!-- CARD BODY: STRICTLY ONLY PROPERTY NAME, SCALELINE & PRICE AS INSTRUCTED -->
      <div class="card-body">
        <h3 class="card-property-name">${mansion.name}</h3>
        <div class="card-price">${mansion.formattedPrice}</div>
        <div class="card-scaleline">
          <i class="fa-solid fa-vector-square"></i>
          <span>${mansion.scale.scaleLine}</span>
        </div>
      </div>

      <!-- ACTION BUTTONS BELOW CARD: PROMINENT "TRY 3D!" + VIEW ESTATE + PRIVATE TOUR + BROCHURE -->
      <div class="card-actions-panel">
        <button class="btn-card-try-3d btn-launch-3d" data-id="${mansion.id}">
          <i class="fa-solid fa-cube"></i> TRY 3D!
        </button>

        <div class="card-secondary-actions-row">
          <button class="btn-card-view-estate btn-view-estate" data-id="${mansion.id}">
            <i class="fa-solid fa-eye"></i> View Estate
          </button>
          <button class="btn-card-private-tour btn-card-tour" data-id="${mansion.id}">
            <i class="fa-solid fa-calendar"></i> Private Tour
          </button>
        </div>

        <button class="btn-card-brochure btn-card-brochure-action" data-id="${mansion.id}">
          <i class="fa-solid fa-file-pdf"></i> Request Confidential Brochure
        </button>
      </div>
    </article>
  `).join('');

  // Attach 3D Card Tilt Effect and Button Click Handlers
  attachCardEvents();
}

// ----------------------------------------------------------------------------
// 4. 3D CARD PARALLAX TILT & BUTTON INTERACTIONS
// ----------------------------------------------------------------------------
function attachCardEvents() {
  const cards = document.querySelectorAll('.mansion-3d-card');

  cards.forEach(card => {
    // 3D Mouse Parallax Tilt
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
    });

    // Launch 3D World Button
    const try3dBtn = card.querySelector('.btn-launch-3d');
    try3dBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const mansionId = try3dBtn.dataset.id;
      switch3DMansion(mansionId);
      document.getElementById('viewer-3d-section')?.scrollIntoView({ behavior: 'smooth' });
      showToast(`Loaded ${card.querySelector('.card-property-name').textContent} into 3D World`, 'fa-cube');
    });

    // View Estate Button
    const viewBtn = card.querySelector('.btn-view-estate');
    viewBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      openEstateDetailsModal(viewBtn.dataset.id);
    });

    // Private Tour Button
    const tourBtn = card.querySelector('.btn-card-tour');
    tourBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      openTourModal(tourBtn.dataset.id);
    });

    // Brochure Button
    const brochureBtn = card.querySelector('.btn-card-brochure-action');
    brochureBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      openBrochureModal(brochureBtn.dataset.id);
    });
  });
}

// ----------------------------------------------------------------------------
// 5. NAVIGATION, FILTERS & SORTING
// ----------------------------------------------------------------------------
function setupNavigationAndFilters() {
  // Location Filter Chips
  const chips = document.querySelectorAll('.chip-btn');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilterLocation = chip.dataset.location;
      renderMansionCards();
    });
  });

  // Sort Dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderMansionCards();
    });
  }

  // Header Tour Buttons
  document.getElementById('btn-open-tour-header')?.addEventListener('click', () => openTourModal());
  document.getElementById('btn-footer-tour')?.addEventListener('click', () => openTourModal());
}

// ----------------------------------------------------------------------------
// 6. COMPREHENSIVE "VIEW ESTATE" DOSSIER MODAL
// Includes all details from PDF: Day View, Night View, Garden, Area, Nearby Lifestyle,
// Developer/Broker attribution, Why this works, etc.
// ----------------------------------------------------------------------------
function openEstateDetailsModal(mansionId) {
  const mansion = MANSIONS.find(m => m.id === mansionId);
  if (!mansion) return;

  activeModalMansion = mansion;
  const modal = document.getElementById('estate-detail-modal');
  if (!modal) return;

  // Set Core Details
  document.getElementById('modal-estate-name').textContent = mansion.name;
  document.getElementById('modal-estate-address').textContent = mansion.address;
  document.getElementById('modal-estate-price').textContent = mansion.formattedPrice;
  document.getElementById('modal-spec-beds-baths').textContent = `${mansion.scale.beds} Beds · ${mansion.scale.bathsTotal} Baths`;
  document.getElementById('modal-spec-sqft').textContent = `${mansion.scale.sqFt.toLocaleString()} Sq Ft (${mansion.scale.sqFtNote})`;
  document.getElementById('modal-spec-acres').textContent = mansion.scale.lotSize;
  document.getElementById('modal-spec-waterfront').textContent = mansion.scale.waterfront;

  // Set Hero Image
  const heroImg = document.getElementById('modal-hero-img');
  if (heroImg) heroImg.src = mansion.images.hero;

  // Setup Perspectives Tabs (Day View, Night View, Garden, Waterfront, Interior, Master)
  const perspectivesContainer = document.getElementById('modal-perspectives-container');
  if (perspectivesContainer) {
    const perspectives = [
      { key: 'dayView', label: 'Day View', icon: 'fa-sun' },
      { key: 'nightView', label: 'Night View', icon: 'fa-moon' },
      { key: 'garden', label: 'Garden & Grounds', icon: 'fa-tree' },
      { key: 'waterfront', label: 'Waterfront & Marina', icon: 'fa-water' },
      { key: 'interior', label: 'Interior Living', icon: 'fa-couch' },
      { key: 'master', label: 'Master Sanctuary', icon: 'fa-bed' }
    ];

    perspectivesContainer.innerHTML = perspectives.map((p, idx) => `
      <button class="btn-perspective-tab ${idx === 0 ? 'active' : ''}" data-key="${p.key}">
        <i class="fa-solid ${p.icon}"></i> ${p.label}
      </button>
    `).join('');

    perspectivesContainer.querySelectorAll('.btn-perspective-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        perspectivesContainer.querySelectorAll('.btn-perspective-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const key = tab.dataset.key;
        if (mansion.images[key] && heroImg) {
          heroImg.style.opacity = '0.3';
          setTimeout(() => {
            heroImg.src = mansion.images[key];
            heroImg.style.opacity = '1';
          }, 200);
        }
      });
    });
  }

  // Set Luxury Highlights (from PDF)
  const highlightsList = document.getElementById('modal-highlights-list');
  if (highlightsList) {
    highlightsList.innerHTML = mansion.luxuryHighlights.map(item => `
      <li class="highlight-item">
        <i class="fa-solid fa-diamond"></i>
        <span>${item}</span>
      </li>
    `).join('');
  }

  // Set Nearby Lifestyle (from PDF)
  const lifestyleText = document.getElementById('modal-lifestyle-text');
  if (lifestyleText) lifestyleText.textContent = mansion.nearbyLifestyle;

  // Set Why This Works (from PDF)
  const whyText = document.getElementById('modal-why-text');
  if (whyText) whyText.textContent = mansion.whyThisWorks;

  // Set Broker Attribution
  const brokerName = document.getElementById('modal-broker-name');
  if (brokerName) brokerName.textContent = mansion.listedDevelopedBy;

  // Modal Action Buttons
  document.getElementById('modal-btn-try-3d').onclick = () => {
    modal.classList.remove('open');
    switch3DMansion(mansion.id);
    document.getElementById('viewer-3d-section')?.scrollIntoView({ behavior: 'smooth' });
    showToast(`Exploring ${mansion.name} in 3D`, 'fa-cube');
  };

  document.getElementById('modal-btn-schedule-tour').onclick = () => {
    modal.classList.remove('open');
    openTourModal(mansion.id);
  };

  document.getElementById('modal-btn-download-brochure').onclick = () => {
    modal.classList.remove('open');
    openBrochureModal(mansion.id);
  };

  modal.classList.add('open');
}

// ----------------------------------------------------------------------------
// 7. VIP CONCIERGE & BROCHURE MODALS
// ----------------------------------------------------------------------------
function openTourModal(mansionId) {
  const modal = document.getElementById('tour-modal');
  if (!modal) return;

  const select = document.getElementById('tour-estate-select');
  if (select && mansionId) {
    select.value = mansionId;
  }

  modal.classList.add('open');
}

function openBrochureModal(mansionId) {
  const mansion = MANSIONS.find(m => m.id === mansionId) || MANSIONS[0];
  const modal = document.getElementById('brochure-modal');
  if (!modal) return;

  document.getElementById('brochure-estate-name').textContent = mansion.name;
  document.getElementById('brochure-estate-address').textContent = mansion.address;
  document.getElementById('brochure-estate-price').textContent = mansion.formattedPrice;
  document.getElementById('brochure-scale-text').textContent = mansion.scale.scaleLine;
  document.getElementById('brochure-region-text').textContent = mansion.region;
  document.getElementById('brochure-broker-text').textContent = mansion.listedDevelopedBy;
  document.getElementById('brochure-bio-text').textContent = mansion.whyThisWorks;
  document.getElementById('brochure-estate-img').src = mansion.images.hero;

  modal.classList.add('open');
}

function setupModals() {
  // Close Modals
  document.getElementById('btn-close-detail-modal')?.addEventListener('click', () => {
    document.getElementById('estate-detail-modal')?.classList.remove('open');
  });

  document.getElementById('btn-close-tour-modal')?.addEventListener('click', () => {
    document.getElementById('tour-modal')?.classList.remove('open');
  });

  document.getElementById('btn-close-brochure-modal')?.addEventListener('click', () => {
    document.getElementById('brochure-modal')?.classList.remove('open');
  });

  // Close on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
      }
    });
  });

  // Tour Concierge Transport Selection
  const transportCards = document.querySelectorAll('.transport-card');
  transportCards.forEach(card => {
    card.addEventListener('click', () => {
      transportCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  // Tour Form Submission
  const tourForm = document.getElementById('tour-concierge-form');
  if (tourForm) {
    tourForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const refCode = 'AURUM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      document.getElementById('tour-modal')?.classList.remove('open');
      showToast(`Showing Escort Confirmed. Security Ref: #${refCode}`, 'fa-shield-halved');
    });
  }

  // PDF Save dummy button
  document.getElementById('btn-download-pdf-dummy')?.addEventListener('click', () => {
    showToast('Compiling High-Resolution PDF Dossier for download...', 'fa-file-arrow-down');
    setTimeout(() => {
      window.print();
    }, 600);
  });
}

// ----------------------------------------------------------------------------
// 8. MEGA-MANSION JUMBO MORTGAGE & WEALTH CALCULATOR
// ----------------------------------------------------------------------------
function setupMortgageCalculator() {
  const priceSlider = document.getElementById('calc-price-slider');
  const downSlider = document.getElementById('calc-down-slider');
  const rateSlider = document.getElementById('calc-rate-slider');
  const termInputs = document.querySelectorAll('input[name="calc-term"]');

  priceSlider?.addEventListener('input', updateCalculator);
  downSlider?.addEventListener('input', updateCalculator);
  rateSlider?.addEventListener('input', updateCalculator);
  termInputs.forEach(t => t.addEventListener('change', updateCalculator));

  document.getElementById('btn-consult-wealth')?.addEventListener('click', () => {
    openTourModal();
    showToast('Direct routing to Private Wealth & Escrow Desk', 'fa-briefcase');
  });

  updateCalculator();
}

function updateCalculator() {
  const price = Number(document.getElementById('calc-price-slider')?.value || 85000000);
  const downPercent = Number(document.getElementById('calc-down-slider')?.value || 30);
  const rate = Number(document.getElementById('calc-rate-slider')?.value || 6.25);
  const termYears = Number(document.querySelector('input[name="calc-term"]:checked')?.value || 30);

  const downAmount = price * (downPercent / 100);
  const loanAmount = price - downAmount;
  const monthlyRate = rate / 100 / 12;
  const totalMonths = termYears * 12;

  // Monthly Principal & Interest
  const monthlyPI = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) / (Math.pow(1 + monthlyRate, totalMonths) - 1);

  // Florida Property Tax (~1.1% annually)
  const monthlyTax = (price * 0.011) / 12;

  // Waterfront Hurricane & Hazard Insurance
  const monthlyInsurance = (price * 0.003) / 12;

  // Private Gated Security & Marina HOA
  const monthlyHOA = 6500;

  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA;

  // Update UI Displays
  const priceLabel = document.getElementById('calc-price-label');
  const downLabel = document.getElementById('calc-down-label');
  const rateLabel = document.getElementById('calc-rate-label');

  if (priceLabel) priceLabel.textContent = `$${price.toLocaleString()}`;
  if (downLabel) downLabel.textContent = `${downPercent}% ($${Math.round(downAmount).toLocaleString()})`;
  if (rateLabel) rateLabel.textContent = `${rate.toFixed(2)}%`;

  document.getElementById('calc-monthly-total').textContent = `$${Math.round(totalMonthly).toLocaleString()} / mo`;
  document.getElementById('calc-pi-amount').textContent = `$${Math.round(monthlyPI).toLocaleString()}`;
  document.getElementById('calc-tax-amount').textContent = `$${Math.round(monthlyTax).toLocaleString()}`;
  document.getElementById('calc-insurance-amount').textContent = `$${Math.round(monthlyInsurance).toLocaleString()}`;
  document.getElementById('calc-hoa-amount').textContent = `$${monthlyHOA.toLocaleString()}`;
}

// ----------------------------------------------------------------------------
// 9. TOAST NOTIFICATION SYSTEM
// ----------------------------------------------------------------------------
function showToast(message, icon = 'fa-check') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 4200);
}