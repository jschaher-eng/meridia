/* =========================================
   MERIDIA — simulator.js
   Calcul de prêt · Mise à jour UI
   ========================================= */

'use strict';

/* ---- Product type definitions ---- */
const LOAN_TYPES = {
  perso: { label: 'Prêt personnel',   rate: 3.9,  maxAmount: 75000,   maxDur: 84 },
  immo:  { label: 'Prêt immobilier',  rate: 3.2,  maxAmount: 1500000, maxDur: 300 },
  auto:  { label: 'Prêt auto',        rate: 4.5,  maxAmount: 80000,   maxDur: 84 },
  micro: { label: 'Microfinance',      rate: 5.9,  maxAmount: 25000,   maxDur: 60 },
};

let currentLoanType = 'perso';

/* ---- Core calculation ---- */
function calcMonthly(amount, durationMonths, annualRatePercent) {
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return amount / durationMonths;
  return amount * r * Math.pow(1 + r, durationMonths) / (Math.pow(1 + r, durationMonths) - 1);
}

function formatEur(v) {
  return Math.round(v).toLocaleString('fr-FR') + ' €';
}

/* ---- Update display ---- */
function calcSim() {
  const a = parseFloat(document.getElementById('s-a').value) || 15000;
  const d = parseInt(document.getElementById('s-d').value)   || 36;
  const r = parseFloat(document.getElementById('s-r').value) || 3.9;

  const monthly  = calcMonthly(a, d, r);
  const total    = monthly * d;
  const interest = total - a;

  // Estimated debt ratio (assuming ~2800€ income base)
  const refIncome = 2800;
  const debtRatio = Math.min(Math.round((monthly / refIncome) * 100), 45);

  // Update amount display
  const adEl = document.getElementById('s-ad');
  if (adEl) adEl.textContent = formatEur(a);

  // Update duration display
  const ddEl = document.getElementById('s-dd');
  if (ddEl) {
    const years = d >= 12 ? ' (' + (Math.round((d / 12) * 10) / 10) + ' ans)' : '';
    ddEl.textContent = d + ' mois' + years;
  }

  // Update rate display
  const rdEl = document.getElementById('s-rd');
  if (rdEl) rdEl.textContent = r.toFixed(1).replace('.', ',') + ' %';

  // Update results
  const fields = {
    's-m':  formatEur(monthly),
    's-c':  formatEur(a),
    's-i':  formatEur(interest),
    's-t':  formatEur(total),
    's-dt': '~' + debtRatio + ' %',
  };
  for (const [id, val] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }
}

/* ---- Switch loan type ---- */
function setLoanType(el, typeKey) {
  document.querySelectorAll('.ptab').forEach(t => t.classList.remove('act'));
  el.classList.add('act');
  currentLoanType = typeKey;

  const def = LOAN_TYPES[typeKey];
  if (!def) return;

  // Update rate slider
  const rSlider = document.getElementById('s-r');
  if (rSlider) {
    rSlider.value = def.rate;
    const rdEl = document.getElementById('s-rd');
    if (rdEl) rdEl.textContent = def.rate.toFixed(1).replace('.', ',') + ' %';
  }

  // Update amount slider max
  const aSlider = document.getElementById('s-a');
  if (aSlider) {
    aSlider.max = def.maxAmount;
    // Clamp current value
    if (parseFloat(aSlider.value) > def.maxAmount) {
      aSlider.value = Math.min(15000, def.maxAmount);
    }
  }

  // Update duration slider max
  const dSlider = document.getElementById('s-d');
  if (dSlider) {
    dSlider.max = def.maxDur;
    if (parseInt(dSlider.value) > def.maxDur) {
      dSlider.value = Math.min(36, def.maxDur);
    }
  }

  calcSim();
}

/* ---- Wire up sliders on load ---- */
document.addEventListener('DOMContentLoaded', function() {
  const sliders = ['s-a', 's-d', 's-r'];
  sliders.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calcSim);
  });
  calcSim();
});
