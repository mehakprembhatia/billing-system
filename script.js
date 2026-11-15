// Harborview Clinic Billing & Receipt Manager
// Pure Vanilla JavaScript (ES6 basics, DOM manipulation, localStorage persistence)

const STORAGE_KEY = 'harborview_clinic_billing_v1';

// Helper: Get local YYYY-MM-DD date string safely
function getLocalDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentTimeStr() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Strict integer-cent rounding to prevent floating-point drift
function toCents(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100);
}

function fromCents(cents) {
  return Math.round(cents) / 100;
}

function roundMoney(amount) {
  return fromCents(toCents(amount));
}

function formatMoney(amount) {
  const currency = state.settings.currency || '$';
  const val = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  const sign = val < 0 ? '-' : '';
  return `${sign}${currency}${Math.abs(val).toFixed(2)}`;
}

// Escape HTML to guard against XSS in user-entered strings
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createInitialData() {
  const today = getLocalDateStr(0);
  const yesterday = getLocalDateStr(-1);
  const twoDaysAgo = getLocalDateStr(-2);

  return {
    settings: {
      clinicName: 'Harborview Family Clinic',
      phone: '(555) 418-2900',
      address: '420 Cedar Avenue, Suite 200, Portland, OR 97205',
      taxId: 'TAX-84-2910442',
      currency: '$',
      defaultTaxRate: 5,
      adminPin: '2468',
      receiptFooter: 'Thank you for trusting Harborview Family Clinic with your care. Retain this receipt for insurance or tax reimbursement.',
    },
    patients: [
      {
        id: 'PAT-1001',
        name: 'Elena Rostova',
        phone: '(555) 201-4489',
        dob: '1988-04-12',
        reference: 'BlueCross PPO #BC-44910',
      },
      {
        id: 'PAT-1002',
        name: 'Marcus Vance',
        phone: '(555) 394-1120',
        dob: '1975-09-28',
        reference: 'Self-Pay Account',
      },
      {
        id: 'PAT-1003',
        name: 'Priya Nair',
        phone: '(555) 612-8834',
        dob: '1994-11-03',
        reference: 'Aetna Health #AE-90321',
      },
      {
        id: 'PAT-1004',
        name: 'Arthur Pendelton',
        phone: '(555) 842-7715',
        dob: '1959-02-19',
        reference: 'Medicare Part B #MC-1104',
      },
      {
        id: 'PAT-1005',
        name: 'Sofia Alvarez',
        phone: '(555) 773-5021',
        dob: '2016-07-22',
        reference: 'Pediatric Care Plan #PC-331',
      },
    ],
    services: [
      { id: 'srv-1', code: 'SRV-01', name: 'General Practitioner Consultation', category: 'Consultation', price: 85.0, active: true },
      { id: 'srv-2', code: 'SRV-02', name: 'Follow-Up Medical Review', category: 'Consultation', price: 55.0, active: true },
      { id: 'srv-3', code: 'SRV-03', name: 'Pediatric Wellness Check', category: 'Consultation', price: 75.0, active: true },
      { id: 'srv-4', code: 'SRV-04', name: 'Complete Blood Count (CBC)', category: 'Diagnostics', price: 42.0, active: true },
      { id: 'srv-5', code: 'SRV-05', name: '12-Lead ECG Screening', category: 'Diagnostics', price: 65.0, active: true },
      { id: 'srv-6', code: 'SRV-06', name: 'Lipid & Metabolic Panel', category: 'Diagnostics', price: 58.0, active: true },
      { id: 'srv-7', code: 'SRV-07', name: 'Wound Dressing & Sterile Care', category: 'Procedures', price: 45.0, active: true },
      { id: 'srv-8', code: 'SRV-08', name: 'Minor Suture Removal', category: 'Procedures', price: 40.0, active: true },
      { id: 'srv-9', code: 'SRV-09', name: 'Seasonal Influenza Vaccine', category: 'Immunization', price: 35.0, active: true },
      { id: 'srv-10', code: 'SRV-10', name: 'Physiotherapy Assessment (45m)', category: 'Therapy', price: 95.0, active: true },
    ],
    invoices: [
      {
        id: 'inv-1001',
        invoiceNumber: 'INV-2026-0001',
        receiptNumber: 'RCP-2026-0001',
        date: today,
        time: '09:15',
        patientId: 'PAT-1001',
        patientName: 'Elena Rostova',
        patientPhone: '(555) 201-4489',
        patientRef: 'BlueCross PPO #BC-44910',
        items: [
          { code: 'SRV-01', name: 'General Practitioner Consultation', price: 85.0, qty: 1 },
          { code: 'SRV-04', name: 'Complete Blood Count (CBC)', price: 42.0, qty: 1 },
        ],
        discountType: 'percent',
        discountValue: 0,
        taxRate: 5,
        subtotal: 127.0,
        discountAmount: 0,
        taxableAmount: 127.0,
        taxAmount: 6.35,
        grandTotal: 133.35,
        paymentStatus: 'Paid',
        paymentMethod: 'Card',
        amountPaid: 133.35,
        balanceDue: 0,
        notes: 'Routine annual blood work requested.',
      },
      {
        id: 'inv-1002',
        invoiceNumber: 'INV-2026-0002',
        receiptNumber: 'RCP-2026-0002',
        date: today,
        time: '10:30',
        patientId: 'PAT-1002',
        patientName: 'Marcus Vance',
        patientPhone: '(555) 394-1120',
        patientRef: 'Self-Pay Account',
        items: [
          { code: 'SRV-05', name: '12-Lead ECG Screening', price: 65.0, qty: 1 },
          { code: 'SRV-02', name: 'Follow-Up Medical Review', price: 55.0, qty: 1 },
        ],
        discountType: 'fixed',
        discountValue: 10,
        taxRate: 5,
        subtotal: 120.0,
        discountAmount: 10.0,
        taxableAmount: 110.0,
        taxAmount: 5.5,
        grandTotal: 115.5,
        paymentStatus: 'Partial',
        paymentMethod: 'Cash',
        amountPaid: 60.0,
        balanceDue: 55.5,
        notes: 'Balance to be settled on lab review visit.',
      },
      {
        id: 'inv-1003',
        invoiceNumber: 'INV-2026-0003',
        receiptNumber: 'RCP-2026-0003',
        date: today,
        time: '11:45',
        patientId: 'PAT-1005',
        patientName: 'Sofia Alvarez',
        patientPhone: '(555) 773-5021',
        patientRef: 'Pediatric Care Plan #PC-331',
        items: [
          { code: 'SRV-03', name: 'Pediatric Wellness Check', price: 75.0, qty: 1 },
          { code: 'SRV-09', name: 'Seasonal Influenza Vaccine', price: 35.0, qty: 1 },
        ],
        discountType: 'percent',
        discountValue: 10,
        taxRate: 0,
        subtotal: 110.0,
        discountAmount: 11.0,
        taxableAmount: 99.0,
        taxAmount: 0,
        grandTotal: 99.0,
        paymentStatus: 'Unpaid',
        paymentMethod: 'Insurance',
        amountPaid: 0,
        balanceDue: 99.0,
        notes: 'Awaiting pediatric insurance pre-authorization.',
      },
      {
        id: 'inv-1004',
        invoiceNumber: 'INV-2026-0004',
        receiptNumber: 'RCP-2026-0004',
        date: yesterday,
        time: '14:20',
        patientId: 'PAT-1004',
        patientName: 'Arthur Pendelton',
        patientPhone: '(555) 842-7715',
        patientRef: 'Medicare Part B #MC-1104',
        items: [
          { code: 'SRV-10', name: 'Physiotherapy Assessment (45m)', price: 95.0, qty: 1 },
          { code: 'SRV-07', name: 'Wound Dressing & Sterile Care', price: 45.0, qty: 1 },
        ],
        discountType: 'percent',
        discountValue: 0,
        taxRate: 5,
        subtotal: 140.0,
        discountAmount: 0,
        taxableAmount: 140.0,
        taxAmount: 7.0,
        grandTotal: 147.0,
        paymentStatus: 'Paid',
        paymentMethod: 'Bank Transfer',
        amountPaid: 147.0,
        balanceDue: 0,
        notes: 'Cleared via clinic transfer reference #TR-904.',
      },
      {
        id: 'inv-1005',
        invoiceNumber: 'INV-2026-0005',
        receiptNumber: 'RCP-2026-0005',
        date: twoDaysAgo,
        time: '16:05',
        patientId: 'PAT-1003',
        patientName: 'Priya Nair',
        patientPhone: '(555) 612-8834',
        patientRef: 'Aetna Health #AE-90321',
        items: [
          { code: 'SRV-06', name: 'Lipid & Metabolic Panel', price: 58.0, qty: 1 },
        ],
        discountType: 'percent',
        discountValue: 0,
        taxRate: 5,
        subtotal: 58.0,
        discountAmount: 0,
        taxableAmount: 58.0,
        taxAmount: 2.9,
        grandTotal: 60.9,
        paymentStatus: 'Paid',
        paymentMethod: 'Cash',
        amountPaid: 60.9,
        balanceDue: 0,
        notes: '',
      },
    ],
    counters: {
      patientSeq: 1005,
      invoiceSeq: 5,
    },
  };
}

let state = loadState();
let isAdminUnlocked = false;
let currentView = 'billing';
let pendingConfirmHandler = null;
let pendingAdminAction = null;
let activeReceiptInvoiceId = null;

// Draft invoice workspace state
let draft = createFreshDraft();

// Filter states
const filters = {
  billingCategory: 'All',
  billingServiceQuery: '',
  ledgerQuery: '',
  ledgerStatus: 'All',
  ledgerDateRange: 'all',
  reconDate: getLocalDateStr(0),
  patientQuery: '',
  serviceCategory: 'All',
  serviceQuery: '',
};

function createFreshDraft() {
  return {
    editingInvoiceId: null,
    selectedPatientId: '',
    items: [],
    date: getLocalDateStr(0),
    taxRate: Number(state?.settings?.defaultTaxRate ?? 5),
    discountType: 'percent',
    discountValue: 0,
    paymentStatus: 'Paid',
    paymentMethod: 'Card',
    amountPaid: '',
    notes: '',
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialData();
      saveRawState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.patients) || !Array.isArray(parsed.services) || !Array.isArray(parsed.invoices) || !parsed.settings) {
      throw new Error('Invalid stored structure');
    }
    if (!parsed.counters) {
      parsed.counters = { patientSeq: 1005, invoiceSeq: parsed.invoices.length };
    }
    return parsed;
  } catch (err) {
    const fallback = createInitialData();
    saveRawState(fallback);
    return fallback;
  }
}

function saveRawState(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
}

function persistState() {
  const ok = saveRawState(state);
  if (!ok) {
    showToast('Unable to save changes to browser storage. Storage may be full.', 'error');
  }
  updateSidebarSnapshot();
}

// Toast Notification
function showToast(message, type = 'info') {
  const region = document.getElementById('toast-region');
  const toast = document.createElement('div');
  toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'success' ? 'toast-success' : ''}`;
  toast.textContent = message;
  region.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3600);
}

// Modal Management
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.hidden = false;
  const firstInput = modal.querySelector('input:not([type="hidden"]), select, button.btn-primary');
  if (firstInput) {
    setTimeout(() => firstInput.focus(), 20);
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.hidden = true;
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach((m) => {
    m.hidden = true;
  });
}

function openConfirmModal(title, message, acceptLabel, onConfirm) {
  document.getElementById('confirm-modal-title').textContent = title;
  document.getElementById('confirm-modal-message').textContent = message;
  const acceptBtn = document.getElementById('confirm-modal-accept');
  acceptBtn.textContent = acceptLabel || 'Confirm';
  pendingConfirmHandler = onConfirm;
  openModal('confirm-modal');
}

function requireAdmin(callback) {
  if (isAdminUnlocked) {
    callback();
    return;
  }
  pendingAdminAction = callback;
  document.getElementById('admin-pin-input').value = '';
  hideError('admin-pin-error');
  openModal('admin-pin-modal');
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
}

function hideError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  el.hidden = true;
}

// Navigation & View Switching
const VIEW_TITLES = {
  billing: 'New Invoice',
  invoices: 'Invoices & Receipts',
  reconciliation: 'Daily Totals & Reconciliation',
  patients: 'Patient Reference',
  services: 'Service Catalogue',
  admin: 'Admin & Settings',
};

function switchView(viewName) {
  currentView = viewName;
  document.querySelectorAll('.view-section').forEach((sec) => {
    sec.hidden = sec.id !== `view-${viewName}`;
    sec.classList.toggle('active', sec.id === `view-${viewName}`);
  });
  document.querySelectorAll('.nav-item').forEach((btn) => {
    const active = btn.dataset.nav === viewName;
    btn.classList.toggle('active', active);
    if (active) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  });
  document.getElementById('topbar-title').textContent =
    viewName === 'billing' && draft.editingInvoiceId ? 'Edit Invoice' : VIEW_TITLES[viewName] || 'Clinic Ledger';

  closeMobileSidebar();
  renderCurrentView();
}

function openMobileSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-backdrop').hidden = false;
}

function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-backdrop').hidden = true;
}

function renderCurrentView() {
  updateAdminUI();
  updateSidebarSnapshot();
  if (currentView === 'billing') renderBillingView();
  if (currentView === 'invoices') renderLedgerView();
  if (currentView === 'reconciliation') renderReconciliationView();
  if (currentView === 'patients') renderPatientsView();
  if (currentView === 'services') renderServicesView();
  if (currentView === 'admin') renderAdminView();
}

function updateAdminUI() {
  document.getElementById('sidebar-clinic-name').textContent = state.settings.clinicName;
  const topBtn = document.getElementById('topbar-admin-text');
  const sideLabel = document.getElementById('sidebar-admin-label');
  const serviceNotice = document.getElementById('services-admin-notice');

  if (isAdminUnlocked) {
    topBtn.textContent = 'Admin Unlocked';
    sideLabel.textContent = 'Lock Admin Access';
    if (serviceNotice) serviceNotice.hidden = true;
  } else {
    topBtn.textContent = 'Staff Mode';
    sideLabel.textContent = 'Unlock Admin Access';
    if (serviceNotice) serviceNotice.hidden = false;
  }
}

function updateSidebarSnapshot() {
  const today = getLocalDateStr(0);
  let collectedCents = 0;
  for (const inv of state.invoices) {
    if (inv.date === today && inv.paymentStatus !== 'Void') {
      collectedCents += toCents(inv.amountPaid);
    }
  }
  document.getElementById('sidebar-today-total').textContent = formatMoney(fromCents(collectedCents));
}

// ============================================================
// CALCULATIONS ENGINE (Strictly clamped & integer-cent safe)
// ============================================================
function computeDraftTotals() {
  let subtotalCents = 0;
  for (const item of draft.items) {
    const priceCents = Math.max(0, toCents(item.price));
    const qty = Math.max(1, Math.min(999, Math.floor(Number(item.qty) || 1)));
    subtotalCents += priceCents * qty;
  }

  let discountCents = 0;
  let adjustmentError = '';
  const rawDisc = Number(draft.discountValue);
  if (!Number.isFinite(rawDisc) || rawDisc < 0) {
    adjustmentError = 'Discount cannot be negative.';
  } else if (draft.discountType === 'percent') {
    if (rawDisc > 100) {
      adjustmentError = 'Percentage discount cannot exceed 100%.';
      discountCents = subtotalCents;
    } else {
      discountCents = Math.round((subtotalCents * rawDisc) / 100);
    }
  } else {
    const fixedCents = toCents(rawDisc);
    if (fixedCents > subtotalCents && subtotalCents > 0) {
      adjustmentError = 'Fixed discount cannot exceed the invoice subtotal.';
      discountCents = subtotalCents;
    } else {
      discountCents = Math.min(subtotalCents, fixedCents);
    }
  }

  const taxableCents = Math.max(0, subtotalCents - discountCents);

  const rawTax = Number(draft.taxRate);
  let safeTaxRate = 0;
  if (!Number.isFinite(rawTax) || rawTax < 0) {
    adjustmentError = adjustmentError || 'Tax rate cannot be negative.';
  } else if (rawTax > 50) {
    adjustmentError = adjustmentError || 'Tax rate cannot exceed 50%.';
    safeTaxRate = 50;
  } else {
    safeTaxRate = rawTax;
  }

  const taxCents = Math.round((taxableCents * safeTaxRate) / 100);
  const grandTotalCents = taxableCents + taxCents;

  let amountPaidCents = 0;
  let paymentError = '';
  if (draft.paymentStatus === 'Paid') {
    amountPaidCents = grandTotalCents;
  } else if (draft.paymentStatus === 'Unpaid') {
    amountPaidCents = 0;
  } else if (draft.paymentStatus === 'Partial') {
    const entered = Number(draft.amountPaid);
    if (grandTotalCents === 0) {
      paymentError = 'Grand Total is zero; select Paid in Full.';
      amountPaidCents = 0;
    } else if (draft.amountPaid === '' || !Number.isFinite(entered) || entered <= 0) {
      paymentError = 'Enter a partial payment amount greater than 0.';
      amountPaidCents = 0;
    } else {
      const enteredCents = toCents(entered);
      if (enteredCents >= grandTotalCents) {
        paymentError = 'Partial payment must be less than the Grand Total. Select "Paid in Full" instead.';
        amountPaidCents = grandTotalCents;
      } else {
        amountPaidCents = enteredCents;
      }
    }
  }

  const balanceDueCents = Math.max(0, grandTotalCents - amountPaidCents);

  return {
    subtotal: fromCents(subtotalCents),
    discountAmount: fromCents(discountCents),
    taxableAmount: fromCents(taxableCents),
    taxRate: safeTaxRate,
    taxAmount: fromCents(taxCents),
    grandTotal: fromCents(grandTotalCents),
    amountPaid: fromCents(amountPaidCents),
    balanceDue: fromCents(balanceDueCents),
    adjustmentError,
    paymentError,
  };
}

// ============================================================
// VIEW 1: INVOICE BUILDER
// ============================================================
function renderBillingView() {
  const editBanner = document.getElementById('edit-mode-banner');
  const editLabel = document.getElementById('edit-mode-label');
  const draftNumEl = document.getElementById('draft-invoice-number');

  if (draft.editingInvoiceId) {
    const existing = state.invoices.find((i) => i.id === draft.editingInvoiceId);
    editBanner.hidden = false;
    editLabel.textContent = `Editing ${existing ? existing.invoiceNumber : 'Invoice'}`;
    draftNumEl.textContent = existing ? `${existing.invoiceNumber} · ${existing.receiptNumber}` : 'Editing Invoice';
  } else {
    editBanner.hidden = true;
    draftNumEl.textContent = 'Draft · Auto-numbered on save';
  }

  renderSelectedPatient();
  renderBillingServicePicker();
  renderDraftItemsTable();
  syncSummaryInputs();
  updateDraftSummaryDisplay();
}

function renderSelectedPatient() {
  const summaryCard = document.getElementById('selected-patient-summary');
  const searchInput = document.getElementById('invoice-patient-search');
  const patient = state.patients.find((p) => p.id === draft.selectedPatientId);

  if (patient) {
    summaryCard.hidden = false;
    searchInput.value = '';
    searchInput.parentElement.parentElement.hidden = true;
    document.getElementById('selected-patient-name').textContent = patient.name;
    document.getElementById('selected-patient-id').textContent = patient.id;
    const parts = [patient.phone];
    if (patient.dob) parts.push(`DOB: ${patient.dob}`);
    if (patient.reference) parts.push(patient.reference);
    document.getElementById('selected-patient-meta').textContent = parts.join(' · ');
    hideError('patient-selection-error');
  } else {
    summaryCard.hidden = true;
    searchInput.parentElement.parentElement.hidden = false;
  }
}

function renderPatientDropdown(query) {
  const listEl = document.getElementById('patient-dropdown-list');
  const q = query.trim().toLowerCase();
  const matches = state.patients.filter((p) => {
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q)
    );
  });

  if (matches.length === 0) {
    listEl.innerHTML = `<div class="combobox-option"><span class="combobox-option-sub">No matching patients found. Use "Add New Patient" above.</span></div>`;
    listEl.hidden = false;
    return;
  }

  listEl.innerHTML = matches
    .slice(0, 8)
    .map(
      (p) => `
      <button type="button" class="combobox-option" data-select-patient="${escapeHtml(p.id)}" role="option">
        <div>
          <strong>${escapeHtml(p.name)}</strong>
          <div class="combobox-option-sub">${escapeHtml(p.phone)}${p.reference ? ` · ${escapeHtml(p.reference)}` : ''}</div>
        </div>
        <span class="mono combobox-option-sub">${escapeHtml(p.id)}</span>
      </button>
    `
    )
    .join('');
  listEl.hidden = false;
}

function renderBillingServicePicker() {
  const categories = ['All', ...new Set(state.services.filter((s) => s.active).map((s) => s.category))];
  const tabsEl = document.getElementById('billing-category-tabs');
  tabsEl.innerHTML = categories
    .map(
      (cat) => `
      <button type="button" class="seg-tab ${filters.billingCategory === cat ? 'active' : ''}" data-billing-cat="${escapeHtml(cat)}">
        ${escapeHtml(cat)}
      </button>
    `
    )
    .join('');

  const q = filters.billingServiceQuery.trim().toLowerCase();
  const visibleServices = state.services.filter((s) => {
    if (!s.active) return false;
    if (filters.billingCategory !== 'All' && s.category !== filters.billingCategory) return false;
    if (q && !s.name.toLowerCase().includes(q) && !s.code.toLowerCase().includes(q)) return false;
    return true;
  });

  const gridEl = document.getElementById('billing-service-grid');
  if (visibleServices.length === 0) {
    gridEl.innerHTML = `<p class="muted-text">No active services match your search.</p>`;
    return;
  }

  gridEl.innerHTML = visibleServices
    .map(
      (s) => `
      <button type="button" class="service-pick-btn" data-add-service="${escapeHtml(s.id)}">
        <div>
          <div class="service-pick-top">
            <span class="service-pick-code mono">${escapeHtml(s.code)}</span>
            <span class="service-pick-cat">${escapeHtml(s.category)}</span>
          </div>
          <div class="service-pick-name">${escapeHtml(s.name)}</div>
        </div>
        <div class="service-pick-bottom">
          <span class="service-pick-price mono">${formatMoney(s.price)}</span>
          <span class="service-pick-add">+ Add</span>
        </div>
      </button>
    `
    )
    .join('');
}

function addServiceToDraft(serviceId) {
  const service = state.services.find((s) => s.id === serviceId);
  if (!service) return;

  const existingIndex = draft.items.findIndex((i) => i.code === service.code && i.name === service.name);
  if (existingIndex >= 0) {
    if (draft.items[existingIndex].qty < 999) {
      draft.items[existingIndex].qty += 1;
    }
  } else {
    draft.items.push({
      code: service.code,
      name: service.name,
      price: roundMoney(service.price),
      qty: 1,
    });
  }

  hideError('invoice-items-error');
  renderDraftItemsTable();
  updateDraftSummaryDisplay();
}

function renderDraftItemsTable() {
  const tbody = document.getElementById('invoice-items-tbody');
  const emptyEl = document.getElementById('invoice-items-empty');
  const tableEl = document.getElementById('invoice-items-table');

  if (draft.items.length === 0) {
    tbody.innerHTML = '';
    tableEl.hidden = true;
    emptyEl.hidden = false;
    return;
  }

  tableEl.hidden = false;
  emptyEl.hidden = true;

  tbody.innerHTML = draft.items
    .map((item, idx) => {
      const lineTotal = fromCents(toCents(item.price) * item.qty);
      return `
      <tr>
        <td>
          <strong>${escapeHtml(item.name)}</strong>
          <div class="muted-text mono">${escapeHtml(item.code)}</div>
        </td>
        <td class="num">${formatMoney(item.price)}</td>
        <td class="num">
          <div class="qty-control">
            <button type="button" class="qty-btn" data-item-dec="${idx}" aria-label="Decrease quantity">-</button>
            <input type="number" class="qty-input" data-item-qty="${idx}" value="${item.qty}" min="1" max="999" aria-label="Quantity for ${escapeHtml(item.name)}" />
            <button type="button" class="qty-btn" data-item-inc="${idx}" aria-label="Increase quantity">+</button>
          </div>
        </td>
        <td class="num">${formatMoney(lineTotal)}</td>
        <td class="actions-col">
          <button type="button" class="btn-link danger" data-item-remove="${idx}">Remove</button>
        </td>
      </tr>
    `;
    })
    .join('');
}

function syncSummaryInputs() {
  document.getElementById('invoice-date').value = draft.date;
  document.getElementById('invoice-tax-rate').value = draft.taxRate;
  document.getElementById('invoice-discount-type').value = draft.discountType;
  document.getElementById('invoice-discount-value').value = draft.discountValue;
  document.getElementById('invoice-payment-status').value = draft.paymentStatus;
  document.getElementById('invoice-payment-method').value = draft.paymentMethod;
  document.getElementById('invoice-amount-paid').value = draft.amountPaid;
  document.getElementById('invoice-notes').value = draft.notes;

  const methodGroup = document.getElementById('payment-method-group');
  const paidGroup = document.getElementById('amount-paid-group');
  methodGroup.hidden = draft.paymentStatus === 'Unpaid';
  paidGroup.hidden = draft.paymentStatus !== 'Partial';
}

function updateDraftSummaryDisplay() {
  const calc = computeDraftTotals();
  document.getElementById('summary-subtotal').textContent = formatMoney(calc.subtotal);
  document.getElementById('summary-discount').textContent = `-${formatMoney(calc.discountAmount)}`;
  document.getElementById('summary-taxable').textContent = formatMoney(calc.taxableAmount);
  document.getElementById('summary-tax-label').textContent = `Tax (${calc.taxRate}%)`;
  document.getElementById('summary-tax').textContent = formatMoney(calc.taxAmount);
  document.getElementById('summary-grand-total').textContent = formatMoney(calc.grandTotal);
  document.getElementById('summary-balance-due').textContent = formatMoney(calc.balanceDue);

  if (calc.adjustmentError) {
    showError('billing-adjustment-error', calc.adjustmentError);
  } else {
    hideError('billing-adjustment-error');
  }

  if (calc.paymentError && draft.paymentStatus === 'Partial') {
    showError('amount-paid-error', calc.paymentError);
  } else {
    hideError('amount-paid-error');
  }
}

function saveDraftInvoice() {
  let hasError = false;
  const patient = state.patients.find((p) => p.id === draft.selectedPatientId);
  if (!patient) {
    showError('patient-selection-error', 'Please select or register a patient before creating an invoice.');
    hasError = true;
  } else {
    hideError('patient-selection-error');
  }

  if (draft.items.length === 0) {
    showError('invoice-items-error', 'Add at least one clinic service or charge to the invoice.');
    hasError = true;
  } else {
    hideError('invoice-items-error');
  }

  const calc = computeDraftTotals();
  if (calc.adjustmentError) {
    showError('billing-adjustment-error', calc.adjustmentError);
    hasError = true;
  }

  if (draft.paymentStatus === 'Partial' && calc.paymentError) {
    showError('amount-paid-error', calc.paymentError);
    hasError = true;
  }

  if (!draft.date) {
    showToast('Please select a valid billing date.', 'error');
    hasError = true;
  }

  if (hasError) {
    showToast('Please resolve the highlighted billing errors before saving.', 'error');
    return;
  }

  if (draft.editingInvoiceId) {
    const idx = state.invoices.findIndex((i) => i.id === draft.editingInvoiceId);
    if (idx === -1) {
      showToast('Original invoice could not be found.', 'error');
      return;
    }
    const old = state.invoices[idx];
    const updated = {
      ...old,
      date: draft.date,
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      patientRef: patient.reference || '',
      items: draft.items.map((item) => ({ ...item })),
      discountType: draft.discountType,
      discountValue: Number(draft.discountValue) || 0,
      taxRate: calc.taxRate,
      subtotal: calc.subtotal,
      discountAmount: calc.discountAmount,
      taxableAmount: calc.taxableAmount,
      taxAmount: calc.taxAmount,
      grandTotal: calc.grandTotal,
      paymentStatus: draft.paymentStatus,
      paymentMethod: draft.paymentStatus === 'Unpaid' ? 'Unassigned' : draft.paymentMethod,
      amountPaid: calc.amountPaid,
      balanceDue: calc.balanceDue,
      notes: draft.notes.trim(),
    };
    state.invoices[idx] = updated;
    persistState();
    showToast(`Updated ${updated.invoiceNumber}.`, 'success');
    draft = createFreshDraft();
    renderBillingView();
    openReceiptModal(updated.id);
    return;
  }

  state.counters.invoiceSeq += 1;
  const seq = String(state.counters.invoiceSeq).padStart(4, '0');
  const year = draft.date.slice(0, 4) || new Date().getFullYear();

  const newInvoice = {
    id: `inv-${Date.now()}`,
    invoiceNumber: `INV-${year}-${seq}`,
    receiptNumber: `RCP-${year}-${seq}`,
    date: draft.date,
    time: getCurrentTimeStr(),
    patientId: patient.id,
    patientName: patient.name,
    patientPhone: patient.phone,
    patientRef: patient.reference || '',
    items: draft.items.map((item) => ({ ...item })),
    discountType: draft.discountType,
    discountValue: Number(draft.discountValue) || 0,
    taxRate: calc.taxRate,
    subtotal: calc.subtotal,
    discountAmount: calc.discountAmount,
    taxableAmount: calc.taxableAmount,
    taxAmount: calc.taxAmount,
    grandTotal: calc.grandTotal,
    paymentStatus: draft.paymentStatus,
    paymentMethod: draft.paymentStatus === 'Unpaid' ? 'Unassigned' : draft.paymentMethod,
    amountPaid: calc.amountPaid,
    balanceDue: calc.balanceDue,
    notes: draft.notes.trim(),
  };

  state.invoices.unshift(newInvoice);
  persistState();
  showToast(`Saved ${newInvoice.invoiceNumber} and generated receipt.`, 'success');
  draft = createFreshDraft();
  renderBillingView();
  openReceiptModal(newInvoice.id);
}

// ============================================================
// VIEW 2: INVOICES & RECEIPTS LEDGER
// ============================================================
function getFilteredInvoices() {
  const q = filters.ledgerQuery.trim().toLowerCase();
  const today = getLocalDateStr(0);
  const weekAgo = getLocalDateStr(-6);
  const monthAgo = getLocalDateStr(-29);

  return state.invoices.filter((inv) => {
    if (filters.ledgerStatus !== 'All' && inv.paymentStatus !== filters.ledgerStatus) return false;

    if (filters.ledgerDateRange === 'today' && inv.date !== today) return false;
    if (filters.ledgerDateRange === '7days' && inv.date < weekAgo) return false;
    if (filters.ledgerDateRange === '30days' && inv.date < monthAgo) return false;

    if (q) {
      const servicesText = inv.items.map((it) => `${it.code} ${it.name}`).join(' ').toLowerCase();
      const hit =
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.receiptNumber.toLowerCase().includes(q) ||
        inv.patientName.toLowerCase().includes(q) ||
        inv.patientId.toLowerCase().includes(q) ||
        servicesText.includes(q);
      if (!hit) return false;
    }
    return true;
  });
}

function statusClass(status) {
  if (status === 'Paid') return 'status-paid';
  if (status === 'Partial') return 'status-partial';
  if (status === 'Unpaid') return 'status-unpaid';
  return 'status-void';
}

function renderLedgerView() {
  document.querySelectorAll('#ledger-status-tabs .seg-tab').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.status === filters.ledgerStatus);
  });

  const rows = getFilteredInvoices();
  const tbody = document.getElementById('ledger-tbody');
  const emptyEl = document.getElementById('ledger-empty');

  if (rows.length === 0) {
    tbody.innerHTML = '';
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;
  tbody.innerHTML = rows
    .map((inv) => {
      const firstItem = inv.items[0] ? inv.items[0].name : 'Clinic Service';
      const extraCount = inv.items.length > 1 ? ` +${inv.items.length - 1} more` : '';
      const canPay = inv.paymentStatus === 'Unpaid' || inv.paymentStatus === 'Partial';
      const canEdit = inv.paymentStatus !== 'Void';

      return `
      <tr>
        <td>
          <strong class="mono">${escapeHtml(inv.invoiceNumber)}</strong>
          <div class="muted-text mono">${escapeHtml(inv.receiptNumber)}</div>
        </td>
        <td class="mono">${escapeHtml(inv.date)}<div class="muted-text">${escapeHtml(inv.time || '')}</div></td>
        <td>
          <strong>${escapeHtml(inv.patientName)}</strong>
          <div class="muted-text mono">${escapeHtml(inv.patientId)}</div>
        </td>
        <td>${escapeHtml(firstItem)}<span class="muted-text">${escapeHtml(extraCount)}</span></td>
        <td class="num">${formatMoney(inv.grandTotal)}</td>
        <td class="num">${formatMoney(inv.balanceDue)}</td>
        <td>
          <span class="status-label ${statusClass(inv.paymentStatus)}">${escapeHtml(inv.paymentStatus)}</span>
          <div class="muted-text">${inv.paymentMethod && inv.paymentMethod !== 'Unassigned' ? escapeHtml(inv.paymentMethod) : '—'}</div>
        </td>
        <td class="actions-col">
          <div class="row-actions">
            <button type="button" class="btn-link" data-view-receipt="${escapeHtml(inv.id)}">Receipt</button>
            ${canPay ? `<button type="button" class="btn-link" data-pay-invoice="${escapeHtml(inv.id)}">Record Pay</button>` : ''}
            ${canEdit ? `<button type="button" class="btn-link" data-edit-invoice="${escapeHtml(inv.id)}">Edit</button>` : ''}
            ${inv.paymentStatus !== 'Void' ? `<button type="button" class="btn-link danger" data-void-invoice="${escapeHtml(inv.id)}">Void</button>` : ''}
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}

function loadInvoiceForEdit(invoiceId) {
  const inv = state.invoices.find((i) => i.id === invoiceId);
  if (!inv || inv.paymentStatus === 'Void') return;

  draft = {
    editingInvoiceId: inv.id,
    selectedPatientId: inv.patientId,
    items: inv.items.map((it) => ({ ...it })),
    date: inv.date,
    taxRate: inv.taxRate,
    discountType: inv.discountType,
    discountValue: inv.discountValue,
    paymentStatus: inv.paymentStatus,
    paymentMethod: inv.paymentMethod === 'Unassigned' ? 'Card' : inv.paymentMethod,
    amountPaid: inv.paymentStatus === 'Partial' ? String(inv.amountPaid) : '',
    notes: inv.notes || '',
  };
  switchView('billing');
}

function voidInvoice(invoiceId) {
  const inv = state.invoices.find((i) => i.id === invoiceId);
  if (!inv) return;

  requireAdmin(() => {
    openConfirmModal(
      `Void ${inv.invoiceNumber}?`,
      `Voiding ${inv.invoiceNumber} for ${inv.patientName} excludes it from active daily revenue while preserving the audit record.`,
      'Void Invoice',
      () => {
        inv.paymentStatus = 'Void';
        inv.amountPaid = 0;
        inv.balanceDue = 0;
        persistState();
        showToast(`${inv.invoiceNumber} has been marked Void.`, 'success');
        renderCurrentView();
      }
    );
  });
}

// ============================================================
// PAYMENT RECORDING MODAL
// ============================================================
function openPaymentModal(invoiceId) {
  const inv = state.invoices.find((i) => i.id === invoiceId);
  if (!inv || inv.paymentStatus === 'Void' || inv.balanceDue <= 0) return;

  document.getElementById('payment-invoice-id').value = inv.id;
  document.getElementById('payment-invoice-summary').innerHTML = `
    <div><strong>${escapeHtml(inv.invoiceNumber)}</strong> &middot; ${escapeHtml(inv.patientName)}</div>
    <div>Total: <span class="mono">${formatMoney(inv.grandTotal)}</span> &middot; Paid: <span class="mono">${formatMoney(inv.amountPaid)}</span></div>
    <div>Remaining Balance: <strong class="mono">${formatMoney(inv.balanceDue)}</strong></div>
  `;
  document.getElementById('payment-amount-input').value = inv.balanceDue.toFixed(2);
  document.getElementById('payment-method-select').value = inv.paymentMethod === 'Unassigned' ? 'Card' : inv.paymentMethod;
  hideError('payment-form-error');
  openModal('payment-modal');
}

// ============================================================
// RECEIPT GENERATION & PRINTING
// ============================================================
function openReceiptModal(invoiceId) {
  const inv = state.invoices.find((i) => i.id === invoiceId);
  if (!inv) return;
  closeModal('patient-history-modal');
  activeReceiptInvoiceId = invoiceId;

  const s = state.settings;
  const rowsHtml = inv.items
    .map((it) => {
      const lineTotal = fromCents(toCents(it.price) * it.qty);
      return `
      <tr>
        <td>
          <strong>${escapeHtml(it.name)}</strong>
          <div class="muted-text mono">${escapeHtml(it.code)}</div>
        </td>
        <td class="num">${it.qty}</td>
        <td class="num">${formatMoney(it.price)}</td>
        <td class="num">${formatMoney(lineTotal)}</td>
      </tr>
    `;
    })
    .join('');

  document.getElementById('receipt-print-area').innerHTML = `
    <div class="receipt-header">
      <div>
        <div class="receipt-clinic-name">${escapeHtml(s.clinicName)}</div>
        <div class="receipt-clinic-meta">
          ${escapeHtml(s.address)}<br />
          Tel: ${escapeHtml(s.phone)}${s.taxId ? ` &middot; Tax ID: ${escapeHtml(s.taxId)}` : ''}
        </div>
      </div>
      <div class="receipt-doc-meta">
        <div class="receipt-doc-title">${inv.paymentStatus === 'Void' ? 'VOIDED RECEIPT' : 'OFFICIAL RECEIPT'}</div>
        <div class="mono">${escapeHtml(inv.receiptNumber)}</div>
        <div class="muted-text mono">Invoice: ${escapeHtml(inv.invoiceNumber)}</div>
        <div class="muted-text mono">Date: ${escapeHtml(inv.date)} ${escapeHtml(inv.time || '')}</div>
      </div>
    </div>

    <div class="receipt-meta-grid">
      <div class="receipt-meta-block">
        <h4>Patient Reference</h4>
        <div><strong>${escapeHtml(inv.patientName)}</strong> (${escapeHtml(inv.patientId)})</div>
        <div>${escapeHtml(inv.patientPhone)}</div>
        ${inv.patientRef ? `<div class="muted-text">${escapeHtml(inv.patientRef)}</div>` : ''}
      </div>
      <div class="receipt-meta-block">
        <h4>Payment Summary</h4>
        <div>Status: <span class="status-label ${statusClass(inv.paymentStatus)}">${escapeHtml(inv.paymentStatus)}</span></div>
        <div>Method: ${inv.paymentMethod && inv.paymentMethod !== 'Unassigned' ? escapeHtml(inv.paymentMethod) : 'Pending'}</div>
      </div>
    </div>

    <div class="table-wrap" style="margin-top: 14px;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Service Description</th>
            <th class="num">Qty</th>
            <th class="num">Unit Fee</th>
            <th class="num">Amount</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>

    <div class="receipt-totals">
      <div class="receipt-total-row">
        <span>Subtotal</span>
        <span class="mono">${formatMoney(inv.subtotal)}</span>
      </div>
      <div class="receipt-total-row">
        <span>Discount${inv.discountType === 'percent' && inv.discountValue > 0 ? ` (${inv.discountValue}%)` : ''}</span>
        <span class="mono">-${formatMoney(inv.discountAmount)}</span>
      </div>
      <div class="receipt-total-row">
        <span>Tax (${inv.taxRate}%)</span>
        <span class="mono">${formatMoney(inv.taxAmount)}</span>
      </div>
      <div class="receipt-total-row grand">
        <span>Grand Total</span>
        <span class="mono">${formatMoney(inv.grandTotal)}</span>
      </div>
      <div class="receipt-total-row">
        <span>Amount Paid</span>
        <span class="mono">${formatMoney(inv.amountPaid)}</span>
      </div>
      <div class="receipt-total-row">
        <strong>Balance Due</strong>
        <strong class="mono">${formatMoney(inv.balanceDue)}</strong>
      </div>
    </div>

    ${inv.notes ? `<div class="receipt-note-box"><strong>Clinic Note:</strong> ${escapeHtml(inv.notes)}</div>` : ''}

    <div class="receipt-footer">
      ${escapeHtml(s.receiptFooter)}
    </div>
  `;

  openModal('receipt-modal');
}

function downloadReceiptText() {
  const inv = state.invoices.find((i) => i.id === activeReceiptInvoiceId);
  if (!inv) return;
  const s = state.settings;
  const lines = [
    s.clinicName,
    s.address,
    `Tel: ${s.phone} | Tax ID: ${s.taxId}`,
    '================================================',
    `RECEIPT: ${inv.receiptNumber}   INVOICE: ${inv.invoiceNumber}`,
    `DATE: ${inv.date} ${inv.time || ''}   STATUS: ${inv.paymentStatus}`,
    `PATIENT: ${inv.patientName} (${inv.patientId})`,
    `PHONE: ${inv.patientPhone}`,
    '------------------------------------------------',
    ...inv.items.map((it) => {
      const lineTotal = fromCents(toCents(it.price) * it.qty);
      return `${it.code} ${it.name} x${it.qty} @ ${formatMoney(it.price)} = ${formatMoney(lineTotal)}`;
    }),
    '------------------------------------------------',
    `Subtotal:     ${formatMoney(inv.subtotal)}`,
    `Discount:    -${formatMoney(inv.discountAmount)}`,
    `Tax (${inv.taxRate}%):   ${formatMoney(inv.taxAmount)}`,
    `Grand Total:  ${formatMoney(inv.grandTotal)}`,
    `Amount Paid:  ${formatMoney(inv.amountPaid)} (${inv.paymentMethod})`,
    `Balance Due:  ${formatMoney(inv.balanceDue)}`,
    '================================================',
    inv.notes ? `Note: ${inv.notes}` : '',
    s.receiptFooter,
  ].filter(Boolean);

  triggerFileDownload(`${inv.receiptNumber}.txt`, lines.join('\n'), 'text/plain;charset=utf-8');
}

// ============================================================
// VIEW 3: DAILY TOTALS & RECONCILIATION
// ============================================================
function renderReconciliationView() {
  const dateInput = document.getElementById('recon-date-input');
  dateInput.value = filters.reconDate;

  const today = getLocalDateStr(0);
  const yesterday = getLocalDateStr(-1);
  document.getElementById('recon-today-btn').classList.toggle('active', filters.reconDate === today);
  document.getElementById('recon-yesterday-btn').classList.toggle('active', filters.reconDate === yesterday);

  const dayInvoices = state.invoices.filter((inv) => inv.date === filters.reconDate);
  const activeDayInvoices = dayInvoices.filter((inv) => inv.paymentStatus !== 'Void');

  let collectedCents = 0;
  let billedCents = 0;
  let outstandingCents = 0;
  let discountCents = 0;
  let taxCents = 0;
  let subtotalCents = 0;

  let paidCount = 0;
  let pendingCount = 0;
  let voidCount = 0;

  const methodStats = {
    Cash: { count: 0, cents: 0 },
    Card: { count: 0, cents: 0 },
    'Bank Transfer': { count: 0, cents: 0 },
    Insurance: { count: 0, cents: 0 },
  };

  for (const inv of dayInvoices) {
    if (inv.paymentStatus === 'Void') {
      voidCount += 1;
      continue;
    }
    if (inv.paymentStatus === 'Paid') paidCount += 1;
    else pendingCount += 1;

    collectedCents += toCents(inv.amountPaid);
    billedCents += toCents(inv.grandTotal);
    outstandingCents += toCents(inv.balanceDue);
    discountCents += toCents(inv.discountAmount);
    taxCents += toCents(inv.taxAmount);
    subtotalCents += toCents(inv.subtotal);

    if (toCents(inv.amountPaid) > 0 && methodStats[inv.paymentMethod]) {
      methodStats[inv.paymentMethod].count += 1;
      methodStats[inv.paymentMethod].cents += toCents(inv.amountPaid);
    }
  }

  document.getElementById('recon-collected').textContent = formatMoney(fromCents(collectedCents));
  document.getElementById('recon-billed').textContent = formatMoney(fromCents(billedCents));
  document.getElementById('recon-outstanding').textContent = formatMoney(fromCents(outstandingCents));
  document.getElementById('recon-count').textContent = String(dayInvoices.length);
  document.getElementById('recon-count-sub').textContent = `${paidCount} paid · ${pendingCount} pending · ${voidCount} void`;

  const methodsTbody = document.getElementById('recon-methods-tbody');
  methodsTbody.innerHTML = Object.entries(methodStats)
    .map(
      ([method, info]) => `
      <tr>
        <td><strong>${escapeHtml(method)}</strong></td>
        <td class="num">${info.count}</td>
        <td class="num">${formatMoney(fromCents(info.cents))}</td>
      </tr>
    `
    )
    .join('') +
    `<tr>
      <td><strong>Total Collected</strong></td>
      <td class="num">${activeDayInvoices.filter((i) => i.amountPaid > 0).length}</td>
      <td class="num"><strong>${formatMoney(fromCents(collectedCents))}</strong></td>
    </tr>`;

  document.getElementById('recon-adjustments-tbody').innerHTML = `
    <tr><td>Gross Service Charges (Before Discounts)</td><td class="num">${formatMoney(fromCents(subtotalCents))}</td></tr>
    <tr><td>Patient Discounts Granted</td><td class="num">-${formatMoney(fromCents(discountCents))}</td></tr>
    <tr><td>Net Taxable Services</td><td class="num">${formatMoney(fromCents(subtotalCents - discountCents))}</td></tr>
    <tr><td>Total Tax Collected / Billed</td><td class="num">${formatMoney(fromCents(taxCents))}</td></tr>
    <tr><td><strong>Net Billed Total</strong></td><td class="num"><strong>${formatMoney(fromCents(billedCents))}</strong></td></tr>
  `;

  const txTbody = document.getElementById('recon-transactions-tbody');
  const emptyEl = document.getElementById('recon-empty');
  document.getElementById('recon-register-subtitle').textContent = `Showing ${dayInvoices.length} record(s) for ${filters.reconDate}`;

  if (dayInvoices.length === 0) {
    txTbody.innerHTML = '';
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;
  txTbody.innerHTML = dayInvoices
    .map(
      (inv) => `
      <tr>
        <td>
          <strong class="mono">${escapeHtml(inv.invoiceNumber)}</strong>
          <div class="muted-text mono">${escapeHtml(inv.receiptNumber)}</div>
        </td>
        <td>${escapeHtml(inv.patientName)} <span class="muted-text mono">(${escapeHtml(inv.patientId)})</span></td>
        <td>${inv.paymentMethod && inv.paymentMethod !== 'Unassigned' ? escapeHtml(inv.paymentMethod) : '—'}</td>
        <td><span class="status-label ${statusClass(inv.paymentStatus)}">${escapeHtml(inv.paymentStatus)}</span></td>
        <td class="num">${formatMoney(inv.grandTotal)}</td>
        <td class="num">${formatMoney(inv.amountPaid)}</td>
        <td class="num">${formatMoney(inv.balanceDue)}</td>
        <td class="actions-col">
          <button type="button" class="btn-link" data-view-receipt="${escapeHtml(inv.id)}">Receipt</button>
        </td>
      </tr>
    `
    )
    .join('');
}

function printDailyReconciliation() {
  const dateStr = filters.reconDate;
  const dayInvoices = state.invoices.filter((inv) => inv.date === dateStr && inv.paymentStatus !== 'Void');
  let collected = 0;
  let billed = 0;
  let outstanding = 0;
  const byMethod = { Cash: 0, Card: 0, 'Bank Transfer': 0, Insurance: 0 };

  for (const inv of dayInvoices) {
    collected += toCents(inv.amountPaid);
    billed += toCents(inv.grandTotal);
    outstanding += toCents(inv.balanceDue);
    if (inv.amountPaid > 0 && byMethod[inv.paymentMethod] !== undefined) {
      byMethod[inv.paymentMethod] += toCents(inv.amountPaid);
    }
  }

  document.getElementById('recon-print-sheet').innerHTML = `
    <div style="padding: 24px; font-family: sans-serif;">
      <h2>${escapeHtml(state.settings.clinicName)} — Daily Reconciliation Report</h2>
      <p>Date: <strong>${escapeHtml(dateStr)}</strong> &middot; Generated: ${escapeHtml(getLocalDateStr(0))} ${escapeHtml(getCurrentTimeStr())}</p>
      <hr />
      <p><strong>Total Collected:</strong> ${formatMoney(fromCents(collected))} &nbsp;|&nbsp;
         <strong>Net Billed:</strong> ${formatMoney(fromCents(billed))} &nbsp;|&nbsp;
         <strong>Outstanding:</strong> ${formatMoney(fromCents(outstanding))}</p>
      <p>Cash: ${formatMoney(fromCents(byMethod.Cash))} &middot;
         Card: ${formatMoney(fromCents(byMethod.Card))} &middot;
         Bank Transfer: ${formatMoney(fromCents(byMethod['Bank Transfer']))} &middot;
         Insurance: ${formatMoney(fromCents(byMethod.Insurance))}</p>
      <table border="1" cellspacing="0" cellpadding="6" style="width:100%; border-collapse: collapse; margin-top: 12px; font-size: 12px;">
        <thead>
          <tr><th>Invoice</th><th>Patient</th><th>Method</th><th>Status</th><th>Billed</th><th>Paid</th><th>Balance</th></tr>
        </thead>
        <tbody>
          ${dayInvoices
            .map(
              (inv) => `
            <tr>
              <td>${escapeHtml(inv.invoiceNumber)}</td>
              <td>${escapeHtml(inv.patientName)} (${escapeHtml(inv.patientId)})</td>
              <td>${escapeHtml(inv.paymentMethod)}</td>
              <td>${escapeHtml(inv.paymentStatus)}</td>
              <td>${formatMoney(inv.grandTotal)}</td>
              <td>${formatMoney(inv.amountPaid)}</td>
              <td>${formatMoney(inv.balanceDue)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  document.body.classList.add('printing-recon');
  window.print();
  document.body.classList.remove('printing-recon');
}

// ============================================================
// VIEW 4: PATIENTS DIRECTORY
// ============================================================
function renderPatientsView() {
  const q = filters.patientQuery.trim().toLowerCase();
  const list = state.patients.filter((p) => {
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.phone.toLowerCase().includes(q);
  });

  const tbody = document.getElementById('patients-tbody');
  const emptyEl = document.getElementById('patients-empty');

  if (list.length === 0) {
    tbody.innerHTML = '';
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;
  tbody.innerHTML = list
    .map((p) => {
      const pInvoices = state.invoices.filter((i) => i.patientId === p.id && i.paymentStatus !== 'Void');
      const totalBilled = fromCents(pInvoices.reduce((acc, i) => acc + toCents(i.grandTotal), 0));
      const balanceDue = fromCents(pInvoices.reduce((acc, i) => acc + toCents(i.balanceDue), 0));
      return `
      <tr>
        <td class="mono">${escapeHtml(p.id)}</td>
        <td>
          <strong>${escapeHtml(p.name)}</strong>
          ${p.reference ? `<div class="muted-text">${escapeHtml(p.reference)}</div>` : ''}
        </td>
        <td>${escapeHtml(p.phone)}</td>
        <td class="mono">${p.dob ? escapeHtml(p.dob) : '—'}</td>
        <td class="num">${pInvoices.length}</td>
        <td class="num">${formatMoney(totalBilled)}</td>
        <td class="num">${formatMoney(balanceDue)}</td>
        <td class="actions-col">
          <div class="row-actions">
            <button type="button" class="btn-link" data-bill-patient="${escapeHtml(p.id)}">New Bill</button>
            <button type="button" class="btn-link" data-patient-history="${escapeHtml(p.id)}">History</button>
            <button type="button" class="btn-link" data-edit-patient="${escapeHtml(p.id)}">Edit</button>
            <button type="button" class="btn-link danger" data-delete-patient="${escapeHtml(p.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `;
    })
    .join('');
}

function openPatientModal(patientId = '') {
  hideError('patient-form-error');
  if (patientId) {
    const p = state.patients.find((x) => x.id === patientId);
    if (!p) return;
    document.getElementById('patient-modal-title').textContent = `Edit Patient (${p.id})`;
    document.getElementById('patient-form-id').value = p.id;
    document.getElementById('patient-name-input').value = p.name;
    document.getElementById('patient-phone-input').value = p.phone;
    document.getElementById('patient-dob-input').value = p.dob || '';
    document.getElementById('patient-ref-input').value = p.reference || '';
  } else {
    document.getElementById('patient-modal-title').textContent = 'Register New Patient';
    document.getElementById('patient-form-id').value = '';
    document.getElementById('patient-name-input').value = '';
    document.getElementById('patient-phone-input').value = '';
    document.getElementById('patient-dob-input').value = '';
    document.getElementById('patient-ref-input').value = '';
  }
  openModal('patient-modal');
}

function openPatientHistoryModal(patientId) {
  const p = state.patients.find((x) => x.id === patientId);
  if (!p) return;

  const invs = state.invoices.filter((i) => i.patientId === patientId);
  document.getElementById('patient-history-title').textContent = `Billing History — ${p.name} (${p.id})`;
  const bodyEl = document.getElementById('patient-history-body');

  if (invs.length === 0) {
    bodyEl.innerHTML = `<div class="empty-state"><p class="empty-title">No invoices recorded yet</p><p class="empty-desc">Create an invoice for ${escapeHtml(p.name)} from the Patients table or New Invoice screen.</p></div>`;
  } else {
    bodyEl.innerHTML = `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Date</th>
              <th>Status</th>
              <th class="num">Total</th>
              <th class="num">Balance</th>
              <th class="actions-col">Receipt</th>
            </tr>
          </thead>
          <tbody>
            ${invs
              .map(
                (i) => `
              <tr>
                <td class="mono">${escapeHtml(i.invoiceNumber)}</td>
                <td class="mono">${escapeHtml(i.date)}</td>
                <td><span class="status-label ${statusClass(i.paymentStatus)}">${escapeHtml(i.paymentStatus)}</span></td>
                <td class="num">${formatMoney(i.grandTotal)}</td>
                <td class="num">${formatMoney(i.balanceDue)}</td>
                <td class="actions-col"><button type="button" class="btn-link" data-view-receipt="${escapeHtml(i.id)}">View Receipt</button></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  openModal('patient-history-modal');
}

// ============================================================
// VIEW 5: SERVICE CATALOGUE
// ============================================================
function renderServicesView() {
  const categories = ['All', 'Consultation', 'Diagnostics', 'Procedures', 'Immunization', 'Therapy'];
  document.getElementById('services-category-tabs').innerHTML = categories
    .map(
      (cat) => `
      <button type="button" class="seg-tab ${filters.serviceCategory === cat ? 'active' : ''}" data-service-cat="${escapeHtml(cat)}">
        ${escapeHtml(cat)}
      </button>
    `
    )
    .join('');

  const q = filters.serviceQuery.trim().toLowerCase();
  const rows = state.services.filter((s) => {
    if (filters.serviceCategory !== 'All' && s.category !== filters.serviceCategory) return false;
    if (q && !s.name.toLowerCase().includes(q) && !s.code.toLowerCase().includes(q)) return false;
    return true;
  });

  const tbody = document.getElementById('services-tbody');
  const emptyEl = document.getElementById('services-empty');

  if (rows.length === 0) {
    tbody.innerHTML = '';
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;
  tbody.innerHTML = rows
    .map(
      (s) => `
      <tr>
        <td class="mono">${escapeHtml(s.code)}</td>
        <td><strong>${escapeHtml(s.name)}</strong></td>
        <td>${escapeHtml(s.category)}</td>
        <td class="num">${formatMoney(s.price)}</td>
        <td>
          <span class="status-label ${s.active ? 'status-paid' : 'status-void'}">${s.active ? 'Active' : 'Archived'}</span>
        </td>
        <td class="actions-col">
          <div class="row-actions">
            ${s.active ? `<button type="button" class="btn-link" data-quick-bill-service="${escapeHtml(s.id)}">Add to Bill</button>` : ''}
            <button type="button" class="btn-link" data-edit-service="${escapeHtml(s.id)}">Edit</button>
            <button type="button" class="btn-link danger" data-delete-service="${escapeHtml(s.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `
    )
    .join('');
}

function openServiceModal(serviceId = '') {
  requireAdmin(() => {
    hideError('service-form-error');
    if (serviceId) {
      const s = state.services.find((x) => x.id === serviceId);
      if (!s) return;
      document.getElementById('service-modal-title').textContent = `Edit Service (${s.code})`;
      document.getElementById('service-form-id').value = s.id;
      document.getElementById('service-code-input').value = s.code;
      document.getElementById('service-name-input').value = s.name;
      document.getElementById('service-category-input').value = s.category;
      document.getElementById('service-price-input').value = s.price.toFixed(2);
      document.getElementById('service-active-input').value = String(s.active);
    } else {
      const nextNum = state.services.length + 1;
      document.getElementById('service-modal-title').textContent = 'Add Clinic Service';
      document.getElementById('service-form-id').value = '';
      document.getElementById('service-code-input').value = `SRV-${String(nextNum).padStart(2, '0')}`;
      document.getElementById('service-name-input').value = '';
      document.getElementById('service-category-input').value = 'Consultation';
      document.getElementById('service-price-input').value = '';
      document.getElementById('service-active-input').value = 'true';
    }
    openModal('service-modal');
  });
}

// ============================================================
// VIEW 6: ADMIN & PRACTICE SETTINGS
// ============================================================
function renderAdminView() {
  const lockedPanel = document.getElementById('admin-locked-panel');
  const unlockedContent = document.getElementById('admin-unlocked-content');

  if (!isAdminUnlocked) {
    lockedPanel.hidden = false;
    unlockedContent.hidden = true;
    return;
  }

  lockedPanel.hidden = true;
  unlockedContent.hidden = false;

  const s = state.settings;
  document.getElementById('setting-clinic-name').value = s.clinicName;
  document.getElementById('setting-clinic-phone').value = s.phone;
  document.getElementById('setting-clinic-address').value = s.address;
  document.getElementById('setting-clinic-taxid').value = s.taxId || '';
  document.getElementById('setting-currency').value = s.currency || '$';
  document.getElementById('setting-default-tax').value = s.defaultTaxRate;
  document.getElementById('setting-receipt-footer').value = s.receiptFooter || '';
  document.getElementById('setting-new-pin').value = '';
  hideError('settings-form-error');
}

// ============================================================
// CSV & FILE EXPORTS
// ============================================================
function csvCell(val) {
  const str = String(val ?? '');
  return `"${str.replace(/"/g, '""')}"`;
}

function triggerFileDownload(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportInvoicesCsv(rows, filename) {
  const header = ['Invoice Number', 'Receipt Number', 'Date', 'Time', 'Patient ID', 'Patient Name', 'Subtotal', 'Discount', 'Tax', 'Grand Total', 'Amount Paid', 'Balance Due', 'Status', 'Payment Method'];
  const lines = [
    header.map(csvCell).join(','),
    ...rows.map((inv) =>
      [
        inv.invoiceNumber,
        inv.receiptNumber,
        inv.date,
        inv.time || '',
        inv.patientId,
        inv.patientName,
        inv.subtotal.toFixed(2),
        inv.discountAmount.toFixed(2),
        inv.taxAmount.toFixed(2),
        inv.grandTotal.toFixed(2),
        inv.amountPaid.toFixed(2),
        inv.balanceDue.toFixed(2),
        inv.paymentStatus,
        inv.paymentMethod,
      ]
        .map(csvCell)
        .join(',')
    ),
  ];
  triggerFileDownload(filename, lines.join('\n'), 'text/csv;charset=utf-8');
  showToast(`Downloaded ${filename}`, 'success');
}

// ============================================================
// EVENT WIRING
// ============================================================
function bindEvents() {
  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.nav));
  });

  document.getElementById('mobile-menu-btn').addEventListener('click', openMobileSidebar);
  document.getElementById('sidebar-backdrop').addEventListener('click', closeMobileSidebar);

  document.getElementById('topbar-new-invoice-btn').addEventListener('click', () => {
    draft = createFreshDraft();
    switchView('billing');
  });

  // Admin toggle buttons
  function handleAdminToggle() {
    if (isAdminUnlocked) {
      isAdminUnlocked = false;
      showToast('Admin access locked. Switched to Staff Mode.');
      renderCurrentView();
    } else {
      requireAdmin(() => {
        showToast('Administrator access unlocked.', 'success');
        renderCurrentView();
      });
    }
  }
  document.getElementById('topbar-admin-toggle').addEventListener('click', handleAdminToggle);
  document.getElementById('sidebar-admin-btn').addEventListener('click', handleAdminToggle);
  document.getElementById('services-unlock-btn').addEventListener('click', handleAdminToggle);
  document.getElementById('admin-view-unlock-btn').addEventListener('click', handleAdminToggle);
  document.getElementById('admin-lock-now-btn').addEventListener('click', handleAdminToggle);

  // Admin PIN form
  document.getElementById('admin-pin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const entered = document.getElementById('admin-pin-input').value.trim();
    if (!entered) {
      showError('admin-pin-error', 'Please enter the administrator PIN.');
      return;
    }
    if (entered !== state.settings.adminPin) {
      showError('admin-pin-error', 'Incorrect PIN. Please try again (demo PIN is 2468).');
      return;
    }
    isAdminUnlocked = true;
    closeModal('admin-pin-modal');
    updateAdminUI();
    if (typeof pendingAdminAction === 'function') {
      const fn = pendingAdminAction;
      pendingAdminAction = null;
      fn();
    } else {
      renderCurrentView();
    }
  });

  // Confirm modal accept
  document.getElementById('confirm-modal-accept').addEventListener('click', () => {
    closeModal('confirm-modal');
    if (typeof pendingConfirmHandler === 'function') {
      const fn = pendingConfirmHandler;
      pendingConfirmHandler = null;
      fn();
    }
  });

  // Modal close buttons & backdrop click
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-close-modal]');
    if (closeBtn) {
      closeModal(closeBtn.dataset.closeModal);
      return;
    }
    if (e.target.classList.contains('modal-overlay')) {
      e.target.hidden = true;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      document.getElementById('patient-dropdown-list').hidden = true;
    }
  });

  // Patient combobox in New Invoice
  const patientSearchInput = document.getElementById('invoice-patient-search');
  const patientDropdown = document.getElementById('patient-dropdown-list');

  patientSearchInput.addEventListener('focus', () => {
    renderPatientDropdown(patientSearchInput.value);
    patientSearchInput.setAttribute('aria-expanded', 'true');
  });

  patientSearchInput.addEventListener('input', () => {
    renderPatientDropdown(patientSearchInput.value);
  });

  patientDropdown.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-select-patient]');
    if (!opt) return;
    draft.selectedPatientId = opt.dataset.selectPatient;
    patientDropdown.hidden = true;
    patientSearchInput.setAttribute('aria-expanded', 'false');
    renderSelectedPatient();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.combobox-wrap')) {
      patientDropdown.hidden = true;
      patientSearchInput.setAttribute('aria-expanded', 'false');
    }
  });

  document.getElementById('clear-selected-patient-btn').addEventListener('click', () => {
    draft.selectedPatientId = '';
    renderSelectedPatient();
    patientSearchInput.focus();
  });

  document.getElementById('quick-add-patient-btn').addEventListener('click', () => openPatientModal());

  // Billing Service Picker
  document.getElementById('billing-category-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('[data-billing-cat]');
    if (!tab) return;
    filters.billingCategory = tab.dataset.billingCat;
    renderBillingServicePicker();
  });

  document.getElementById('billing-service-search').addEventListener('input', (e) => {
    filters.billingServiceQuery = e.target.value;
    renderBillingServicePicker();
  });

  document.getElementById('billing-service-grid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-service]');
    if (!btn) return;
    addServiceToDraft(btn.dataset.addService);
  });

  // Custom Charge Subform
  document.getElementById('add-custom-item-btn').addEventListener('click', () => {
    const form = document.getElementById('custom-item-form');
    form.hidden = !form.hidden;
    hideError('custom-item-error');
    if (!form.hidden) document.getElementById('custom-item-name').focus();
  });

  document.getElementById('cancel-custom-item-btn').addEventListener('click', () => {
    document.getElementById('custom-item-form').hidden = true;
  });

  document.getElementById('save-custom-item-btn').addEventListener('click', () => {
    const name = document.getElementById('custom-item-name').value.trim();
    const price = Number(document.getElementById('custom-item-price').value);
    const qty = Math.floor(Number(document.getElementById('custom-item-qty').value));

    if (!name) {
      showError('custom-item-error', 'Enter a service or charge description.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      showError('custom-item-error', 'Unit price must be greater than 0.');
      return;
    }
    if (!Number.isFinite(qty) || qty < 1 || qty > 999) {
      showError('custom-item-error', 'Quantity must be between 1 and 999.');
      return;
    }

    draft.items.push({
      code: 'CUSTOM',
      name,
      price: roundMoney(price),
      qty,
    });

    document.getElementById('custom-item-name').value = '';
    document.getElementById('custom-item-price').value = '';
    document.getElementById('custom-item-qty').value = '1';
    document.getElementById('custom-item-form').hidden = true;
    hideError('invoice-items-error');
    renderDraftItemsTable();
    updateDraftSummaryDisplay();
  });

  // Draft line items table interactions
  const itemsTbody = document.getElementById('invoice-items-tbody');
  itemsTbody.addEventListener('click', (e) => {
    const dec = e.target.closest('[data-item-dec]');
    const inc = e.target.closest('[data-item-inc]');
    const rem = e.target.closest('[data-item-remove]');

    if (dec) {
      const idx = Number(dec.dataset.itemDec);
      if (draft.items[idx].qty > 1) {
        draft.items[idx].qty -= 1;
        renderDraftItemsTable();
        updateDraftSummaryDisplay();
      }
    } else if (inc) {
      const idx = Number(inc.dataset.itemInc);
      if (draft.items[idx].qty < 999) {
        draft.items[idx].qty += 1;
        renderDraftItemsTable();
        updateDraftSummaryDisplay();
      }
    } else if (rem) {
      const idx = Number(rem.dataset.itemRemove);
      draft.items.splice(idx, 1);
      renderDraftItemsTable();
      updateDraftSummaryDisplay();
    }
  });

  itemsTbody.addEventListener('change', (e) => {
    const qtyInput = e.target.closest('[data-item-qty]');
    if (!qtyInput) return;
    const idx = Number(qtyInput.dataset.itemQty);
    let val = Math.floor(Number(qtyInput.value));
    if (!Number.isFinite(val) || val < 1) val = 1;
    if (val > 999) val = 999;
    draft.items[idx].qty = val;
    renderDraftItemsTable();
    updateDraftSummaryDisplay();
  });

  // Billing Summary Inputs
  document.getElementById('invoice-date').addEventListener('change', (e) => {
    draft.date = e.target.value || getLocalDateStr(0);
  });

  document.getElementById('invoice-tax-rate').addEventListener('input', (e) => {
    draft.taxRate = e.target.value;
    updateDraftSummaryDisplay();
  });

  document.getElementById('invoice-discount-type').addEventListener('change', (e) => {
    draft.discountType = e.target.value;
    updateDraftSummaryDisplay();
  });

  document.getElementById('invoice-discount-value').addEventListener('input', (e) => {
    draft.discountValue = e.target.value;
    updateDraftSummaryDisplay();
  });

  document.getElementById('invoice-payment-status').addEventListener('change', (e) => {
    draft.paymentStatus = e.target.value;
    syncSummaryInputs();
    updateDraftSummaryDisplay();
  });

  document.getElementById('invoice-payment-method').addEventListener('change', (e) => {
    draft.paymentMethod = e.target.value;
  });

  document.getElementById('invoice-amount-paid').addEventListener('input', (e) => {
    draft.amountPaid = e.target.value;
    updateDraftSummaryDisplay();
  });

  document.getElementById('invoice-notes').addEventListener('input', (e) => {
    draft.notes = e.target.value;
  });

  document.getElementById('save-and-receipt-btn').addEventListener('click', saveDraftInvoice);

  document.getElementById('reset-invoice-btn').addEventListener('click', () => {
    draft = createFreshDraft();
    renderBillingView();
    showToast('Draft invoice cleared.');
  });

  document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    draft = createFreshDraft();
    renderBillingView();
    switchView('invoices');
  });

  // View 2: Ledger Search & Filters
  document.getElementById('ledger-search-input').addEventListener('input', (e) => {
    filters.ledgerQuery = e.target.value;
    renderLedgerView();
  });

  document.getElementById('ledger-status-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('[data-status]');
    if (!tab) return;
    filters.ledgerStatus = tab.dataset.status;
    renderLedgerView();
  });

  document.getElementById('ledger-date-filter').addEventListener('change', (e) => {
    filters.ledgerDateRange = e.target.value;
    renderLedgerView();
  });

  document.getElementById('ledger-clear-filters-btn').addEventListener('click', () => {
    filters.ledgerQuery = '';
    filters.ledgerStatus = 'All';
    filters.ledgerDateRange = 'all';
    document.getElementById('ledger-search-input').value = '';
    document.getElementById('ledger-date-filter').value = 'all';
    renderLedgerView();
  });

  document.getElementById('export-ledger-csv-btn').addEventListener('click', () => {
    const rows = getFilteredInvoices();
    if (rows.length === 0) {
      showToast('No invoices in the current view to export.', 'error');
      return;
    }
    exportInvoicesCsv(rows, `clinic-invoices-${getLocalDateStr(0)}.csv`);
  });

  // Ledger row action delegation (works in Ledger, Recon, and Patient History)
  document.addEventListener('click', (e) => {
    const receiptBtn = e.target.closest('[data-view-receipt]');
    if (receiptBtn) {
      openReceiptModal(receiptBtn.dataset.viewReceipt);
      return;
    }
    const payBtn = e.target.closest('[data-pay-invoice]');
    if (payBtn) {
      openPaymentModal(payBtn.dataset.payInvoice);
      return;
    }
    const editInvBtn = e.target.closest('[data-edit-invoice]');
    if (editInvBtn) {
      loadInvoiceForEdit(editInvBtn.dataset.editInvoice);
      return;
    }
    const voidInvBtn = e.target.closest('[data-void-invoice]');
    if (voidInvBtn) {
      voidInvoice(voidInvBtn.dataset.voidInvoice);
    }
  });

  // Record payment form
  document.getElementById('payment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const invId = document.getElementById('payment-invoice-id').value;
    const inv = state.invoices.find((i) => i.id === invId);
    if (!inv) return;

    const payAmount = Number(document.getElementById('payment-amount-input').value);
    const method = document.getElementById('payment-method-select').value;

    if (!Number.isFinite(payAmount) || payAmount <= 0) {
      showError('payment-form-error', 'Payment amount must be greater than 0.');
      return;
    }
    const payCents = toCents(payAmount);
    const balCents = toCents(inv.balanceDue);
    if (payCents > balCents) {
      showError('payment-form-error', `Payment cannot exceed remaining balance (${formatMoney(inv.balanceDue)}).`);
      return;
    }

    const newPaidCents = toCents(inv.amountPaid) + payCents;
    const newBalCents = Math.max(0, toCents(inv.grandTotal) - newPaidCents);
    inv.amountPaid = fromCents(newPaidCents);
    inv.balanceDue = fromCents(newBalCents);
    inv.paymentMethod = method;
    inv.paymentStatus = newBalCents === 0 ? 'Paid' : 'Partial';

    persistState();
    closeModal('payment-modal');
    showToast(`Recorded ${formatMoney(fromCents(payCents))} payment for ${inv.invoiceNumber}.`, 'success');
    renderCurrentView();
    openReceiptModal(inv.id);
  });

  // Receipt Modal actions
  document.getElementById('print-receipt-btn').addEventListener('click', () => {
    document.body.classList.add('printing-receipt');
    window.print();
    document.body.classList.remove('printing-receipt');
  });
  document.getElementById('download-receipt-btn').addEventListener('click', downloadReceiptText);

  // View 3: Daily Reconciliation controls
  document.getElementById('recon-date-input').addEventListener('change', (e) => {
    filters.reconDate = e.target.value || getLocalDateStr(0);
    renderReconciliationView();
  });
  document.getElementById('recon-today-btn').addEventListener('click', () => {
    filters.reconDate = getLocalDateStr(0);
    renderReconciliationView();
  });
  document.getElementById('recon-yesterday-btn').addEventListener('click', () => {
    filters.reconDate = getLocalDateStr(-1);
    renderReconciliationView();
  });
  document.getElementById('recon-export-csv-btn').addEventListener('click', () => {
    const rows = state.invoices.filter((i) => i.date === filters.reconDate);
    if (rows.length === 0) {
      showToast('No records for the selected date to export.', 'error');
      return;
    }
    exportInvoicesCsv(rows, `daily-reconciliation-${filters.reconDate}.csv`);
  });
  document.getElementById('recon-print-btn').addEventListener('click', printDailyReconciliation);

  // View 4: Patients Directory
  document.getElementById('patients-search-input').addEventListener('input', (e) => {
    filters.patientQuery = e.target.value;
    renderPatientsView();
  });
  document.getElementById('add-patient-btn').addEventListener('click', () => openPatientModal());

  document.getElementById('patients-tbody').addEventListener('click', (e) => {
    const billBtn = e.target.closest('[data-bill-patient]');
    if (billBtn) {
      draft = createFreshDraft();
      draft.selectedPatientId = billBtn.dataset.billPatient;
      switchView('billing');
      return;
    }
    const histBtn = e.target.closest('[data-patient-history]');
    if (histBtn) {
      openPatientHistoryModal(histBtn.dataset.patientHistory);
      return;
    }
    const editBtn = e.target.closest('[data-edit-patient]');
    if (editBtn) {
      openPatientModal(editBtn.dataset.editPatient);
      return;
    }
    const delBtn = e.target.closest('[data-delete-patient]');
    if (delBtn) {
      const pid = delBtn.dataset.deletePatient;
      const patient = state.patients.find((p) => p.id === pid);
      if (!patient) return;
      requireAdmin(() => {
        const hasInvoices = state.invoices.some((i) => i.patientId === pid);
        const msg = hasInvoices
          ? `${patient.name} (${patient.id}) has existing invoices. Deleting removes them from the directory, though existing invoice snapshots stay in the ledger.`
          : `Remove ${patient.name} (${patient.id}) from the patient directory?`;
        openConfirmModal('Delete Patient Record?', msg, 'Delete Patient', () => {
          state.patients = state.patients.filter((p) => p.id !== pid);
          if (draft.selectedPatientId === pid) draft.selectedPatientId = '';
          persistState();
          showToast(`Removed ${patient.name}.`);
          renderPatientsView();
        });
      });
    }
  });

  document.getElementById('patient-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('patient-form-id').value;
    const name = document.getElementById('patient-name-input').value.trim();
    const phone = document.getElementById('patient-phone-input').value.trim();
    const dob = document.getElementById('patient-dob-input').value;
    const reference = document.getElementById('patient-ref-input').value.trim();

    if (name.length < 2) {
      showError('patient-form-error', 'Please enter the patient full name (at least 2 characters).');
      return;
    }
    if (phone.length < 5) {
      showError('patient-form-error', 'Please enter a valid contact phone number.');
      return;
    }

    if (editId) {
      const p = state.patients.find((x) => x.id === editId);
      if (p) {
        p.name = name;
        p.phone = phone;
        p.dob = dob;
        p.reference = reference;
        persistState();
        showToast(`Updated ${p.name} (${p.id}).`, 'success');
      }
    } else {
      state.counters.patientSeq += 1;
      const newPatient = {
        id: `PAT-${state.counters.patientSeq}`,
        name,
        phone,
        dob,
        reference,
      };
      state.patients.unshift(newPatient);
      if (currentView === 'billing') {
        draft.selectedPatientId = newPatient.id;
      }
      persistState();
      showToast(`Registered ${newPatient.name} (${newPatient.id}).`, 'success');
    }

    closeModal('patient-modal');
    renderCurrentView();
  });

  // View 5: Service Catalogue
  document.getElementById('services-search-input').addEventListener('input', (e) => {
    filters.serviceQuery = e.target.value;
    renderServicesView();
  });

  document.getElementById('services-category-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('[data-service-cat]');
    if (!tab) return;
    filters.serviceCategory = tab.dataset.serviceCat;
    renderServicesView();
  });

  document.getElementById('add-service-btn').addEventListener('click', () => openServiceModal());

  document.getElementById('services-tbody').addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-quick-bill-service]');
    if (addBtn) {
      addServiceToDraft(addBtn.dataset.quickBillService);
      switchView('billing');
      return;
    }
    const editBtn = e.target.closest('[data-edit-service]');
    if (editBtn) {
      openServiceModal(editBtn.dataset.editService);
      return;
    }
    const delBtn = e.target.closest('[data-delete-service]');
    if (delBtn) {
      const sid = delBtn.dataset.deleteService;
      const srv = state.services.find((s) => s.id === sid);
      if (!srv) return;
      requireAdmin(() => {
        openConfirmModal(
          `Delete ${srv.code}?`,
          `Remove "${srv.name}" from the service catalogue? Past invoices remain unchanged.`,
          'Delete Service',
          () => {
            state.services = state.services.filter((s) => s.id !== sid);
            persistState();
            showToast(`Removed ${srv.code} from catalogue.`);
            renderServicesView();
          }
        );
      });
    }
  });

  document.getElementById('service-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('service-form-id').value;
    const code = document.getElementById('service-code-input').value.trim().toUpperCase();
    const name = document.getElementById('service-name-input').value.trim();
    const category = document.getElementById('service-category-input').value;
    const price = Number(document.getElementById('service-price-input').value);
    const active = document.getElementById('service-active-input').value === 'true';

    if (!code) {
      showError('service-form-error', 'Service code is required.');
      return;
    }
    if (!name) {
      showError('service-form-error', 'Service name is required.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      showError('service-form-error', 'Unit fee must be 0 or higher.');
      return;
    }
    const duplicate = state.services.find((s) => s.code.toUpperCase() === code && s.id !== editId);
    if (duplicate) {
      showError('service-form-error', `Service code "${code}" is already in use.`);
      return;
    }

    if (editId) {
      const s = state.services.find((x) => x.id === editId);
      if (s) {
        s.code = code;
        s.name = name;
        s.category = category;
        s.price = roundMoney(price);
        s.active = active;
        persistState();
        showToast(`Updated service ${s.code}.`, 'success');
      }
    } else {
      state.services.push({
        id: `srv-${Date.now()}`,
        code,
        name,
        category,
        price: roundMoney(price),
        active,
      });
      persistState();
      showToast(`Added ${code} to service catalogue.`, 'success');
    }

    closeModal('service-modal');
    renderCurrentView();
  });

  // View 6: Admin Settings Form & Data Maintenance
  document.getElementById('clinic-settings-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!isAdminUnlocked) return;

    const clinicName = document.getElementById('setting-clinic-name').value.trim();
    const phone = document.getElementById('setting-clinic-phone').value.trim();
    const address = document.getElementById('setting-clinic-address').value.trim();
    const taxId = document.getElementById('setting-clinic-taxid').value.trim();
    const currency = document.getElementById('setting-currency').value;
    const defaultTaxRate = Number(document.getElementById('setting-default-tax').value);
    const receiptFooter = document.getElementById('setting-receipt-footer').value.trim();
    const newPin = document.getElementById('setting-new-pin').value.trim();

    if (!clinicName || !phone || !address) {
      showError('settings-form-error', 'Clinic Name, Phone, and Address are required.');
      return;
    }
    if (!Number.isFinite(defaultTaxRate) || defaultTaxRate < 0 || defaultTaxRate > 50) {
      showError('settings-form-error', 'Default tax rate must be between 0% and 50%.');
      return;
    }
    if (newPin && !/^\d{4,8}$/.test(newPin)) {
      showError('settings-form-error', 'New Admin PIN must be 4 to 8 numeric digits.');
      return;
    }

    state.settings.clinicName = clinicName;
    state.settings.phone = phone;
    state.settings.address = address;
    state.settings.taxId = taxId;
    state.settings.currency = currency;
    state.settings.defaultTaxRate = defaultTaxRate;
    state.settings.receiptFooter = receiptFooter;
    if (newPin) state.settings.adminPin = newPin;

    if (!draft.editingInvoiceId && draft.items.length === 0) {
      draft.taxRate = defaultTaxRate;
    }

    persistState();
    hideError('settings-form-error');
    document.getElementById('setting-new-pin').value = '';
    updateAdminUI();
    showToast('Clinic settings saved.', 'success');
  });

  document.getElementById('export-json-backup-btn').addEventListener('click', () => {
    triggerFileDownload(
      `harborview-clinic-backup-${getLocalDateStr(0)}.json`,
      JSON.stringify(state, null, 2),
      'application/json'
    );
    showToast('Downloaded JSON backup.', 'success');
  });

  document.getElementById('restore-demo-data-btn').addEventListener('click', () => {
    openConfirmModal(
      'Restore Sample Clinic Data?',
      'This replaces your current patients, service catalogue, and invoices with the initial clinic sample records.',
      'Restore Sample Data',
      () => {
        state = createInitialData();
        draft = createFreshDraft();
        persistState();
        showToast('Sample clinic data restored.', 'success');
        renderCurrentView();
      }
    );
  });

  document.getElementById('clear-invoices-btn').addEventListener('click', () => {
    openConfirmModal(
      'Clear All Invoices?',
      'This permanently removes all recorded invoices and receipts while keeping your patient directory and service catalogue.',
      'Clear All Invoices',
      () => {
        state.invoices = [];
        state.counters.invoiceSeq = 0;
        draft = createFreshDraft();
        persistState();
        showToast('All invoices cleared.');
        renderCurrentView();
      }
    );
  });
}

// Initialize Application
function init() {
  bindEvents();
  switchView('billing');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
