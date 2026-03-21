/* =========================================
   MERIDIA — dashboard.js
   Documents · Alertes · Profil · Sécurité
   ========================================= */

'use strict';

/* ---- Document filter ---- */
function filterDocs(el, cat) {
  document.querySelectorAll('.doc-tab').forEach(t => t.classList.remove('act'));
  el.classList.add('act');

  document.querySelectorAll('.doc-card').forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? 'flex' : 'none';
  });
}

/* ---- Simulate doc download feedback ---- */
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('doc-dl')) {
    const btn = e.target;
    const original = btn.textContent;
    btn.textContent = 'Téléchargement...';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = '✓ Téléchargé';
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
      }, 2000);
    }, 800);
  }
});

/* ---- Alerts: mark all read ---- */
function markAllRead() {
  document.querySelectorAll('.notif-item').forEach(item => {
    item.classList.remove('new', 'danger');
  });
  const dot = document.querySelector('.notif-dot');
  if (dot) dot.style.display = 'none';

  // Update badges
  const alertBadge = document.querySelector('#sm-alertes .sb-badge');
  if (alertBadge) alertBadge.style.display = 'none';
}

/* ---- Alert param checkboxes - save feedback ---- */
document.addEventListener('change', function(e) {
  if (e.target.closest('.alert-param')) {
    const label = e.target.closest('.alert-param')?.querySelector('span, label')?.textContent?.trim();
    const state = e.target.checked ? 'activée' : 'désactivée';
    showToast('Notification "' + label + '" ' + state);
  }
});

/* ---- Security: block device ---- */
function blockDevice(btn) {
  const row = btn.closest('.device-row');
  if (!row) return;
  row.style.opacity = '0.4';
  btn.textContent = 'Bloqué';
  btn.disabled = true;
  showToast('Appareil bloqué. Toutes les sessions actives ont été fermées.');
}

/* ---- Security: update password ---- */
function updatePassword() {
  const input = document.querySelector('#dp-securite input[type="password"]');
  if (!input || !input.value) {
    showToast('Veuillez saisir un nouveau mot de passe.');
    return;
  }
  if (input.value.length < 8) {
    showToast('Le mot de passe doit comporter au moins 8 caractères.');
    return;
  }
  input.value = '';
  showToast('Mot de passe mis à jour avec succès.');
}

/* ---- Profile: edit mode toggle ---- */
let editMode = false;
function toggleEditProfile() {
  editMode = !editMode;
  document.querySelectorAll('.prow .pval').forEach(cell => {
    if (editMode) {
      const val = cell.textContent;
      cell.innerHTML = '<input type="text" value="' + val + '" style="width:100%;border:0.5px solid var(--border-md);border-radius:3px;padding:3px 6px;font-size:12px;font-family:var(--font-sans);">';
    } else {
      const inp = cell.querySelector('input');
      if (inp) cell.textContent = inp.value;
    }
  });
  const btn = document.querySelector('[onclick="toggleEditProfile()"]');
  if (btn) btn.textContent = editMode ? 'Enregistrer' : 'Modifier';
  if (!editMode) showToast('Profil mis à jour avec succès.');
}

/* ---- Toast notification ---- */
function showToast(msg) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: 'var(--navy)',
    color: '#fff',
    padding: '10px 18px',
    borderRadius: '4px',
    fontSize: '12px',
    zIndex: '9999',
    opacity: '0',
    transition: 'opacity 0.2s',
    maxWidth: '300px',
    lineHeight: '1.5',
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.style.opacity = '1', 10);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ---- 2FA toggle ---- */
function toggle2FA() {
  const badge = document.querySelector('.twofa-badge');
  if (!badge) return;
  const isOn = badge.classList.contains('badge-ok');
  badge.classList.toggle('badge-ok', !isOn);
  badge.classList.toggle('badge-warn', isOn);
  badge.textContent = isOn ? 'Inactif' : 'Activé';
  showToast('Double authentification ' + (isOn ? 'désactivée' : 'activée') + '.');
}
