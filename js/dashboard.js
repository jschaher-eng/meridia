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
async function updatePassword() {
  var inp = document.querySelector('#dp-securite input[type="password"]');
  if (!inp || !inp.value) { showToast('Bitte geben Sie ein neues Passwort ein.'); return; }
  if (inp.value.length < 8) { showToast('Mindestens 8 Zeichen erforderlich.'); return; }

  var { error } = await _supabase.auth.updateUser({ password: inp.value });

  if (error) { showToast('Fehler: ' + error.message); return; }
  inp.value = '';
  showToast('Passwort erfolgreich geaendert.');
}

/* ---- Profile: edit mode toggle ---- */
var editMode = false;

function toggleEditProfile() {
  editMode = !editMode;
  var btn = document.querySelector('[onclick="toggleEditProfile()"]');

  if (editMode) {
    document.querySelectorAll('#dp-profil .pval').forEach(function(cell) {
      var val = cell.textContent === '—' ? '' : cell.textContent;
      cell.innerHTML = '<input type="text" value="' + val + '" style="width:100%;border:0.5px solid var(--border-md);border-radius:3px;padding:4px 8px;font-size:12px;font-family:var(--font-sans);">';
    });
    if (btn) btn.textContent = 'Speichern';
  } else {
    var ids = ['prof-name','prof-birthdate','prof-nationality','prof-situation','prof-profession','prof-email','prof-phone','prof-address','prof-city','prof-income','prof-charges'];
    var values = {};
    ids.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        var inp = el.querySelector('input');
        if (inp) {
          values[id] = inp.value;
          el.textContent = inp.value || '—';
        }
      }
    });
    saveProfile(values);
    if (btn) btn.textContent = 'Bearbeiten';
  }
}

async function saveProfile(values) {
  var userResult = await _supabase.auth.getUser();
  if (!userResult.data.user) return;
  var userId = userResult.data.user.id;

  var { error } = await _supabase.from('profiles').update({
    full_name:       values['prof-name']        || null,
    email:           values['prof-email']       || null,
    phone:           values['prof-phone']       || null,
    city:            values['prof-city']        || null,
    birthdate:       values['prof-birthdate']   || null,
    nationality:     values['prof-nationality'] || null,
    situation:       values['prof-situation']   || null,
    profession:      values['prof-profession']  || null,
    monthly_income:  parseFloat(values['prof-income'])   || null,
    monthly_charges: parseFloat(values['prof-charges'])  || null,
  }).eq('id', userId);

  if (error) { showToast('Fehler: ' + error.message); return; }
  showToast('Profil gespeichert.');
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

async function loadDocuments() {
  const { data, error } = await supabase
    .from('documents')
    .select('*, loans ( reference )')
    .order('created_at', { ascending: false });
  if (error) { console.error('loadDocuments:', error.message); return; }
  DOCUMENTS = (data || []).map(d => ({
    id:       d.id,
    clientId: d.user_id,
    client:   d.user_id,
    loan:     d.loans?.reference || '—',
    name:     d.name || 'Document',
    type:     d.type || 'autre',
    size:     d.size || '—',
    date:     formatDate(d.created_at),
    status:   d.status || 'pending',
    ext:      d.ext || 'PDF',
    path:     d.path || null,
  }));
}

async function loadClientDocuments() {
  var userResult = await _supabase.auth.getUser();
  if (!userResult.data.user) return;
  var userId = userResult.data.user.id;

  var { data, error } = await _supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  var grid = document.getElementById('client-doc-grid');
  if (!grid) return;

  if (error || !data || data.length === 0) {
    grid.innerHTML = '<p style="font-size:12px;color:var(--text-muted);padding:1rem">' + (I18N.t('dash.no_docs') || 'Keine Dokumente verfuegbar.') + '</p>';
    return;
  }

  grid.innerHTML = data.map(function(d) {
    if (d.status === 'requested') {
      /* Document demandé — afficher un bouton upload */
      return '<div class="doc-card" style="border:1px dashed var(--gold)">' +
        '<div class="doc-icon" style="background:var(--warn-bg)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--warn-bdr)" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>' +
        '<div class="doc-name">' + d.name + '</div>' +
        '<div class="doc-meta" style="color:var(--warn-bdr)">' + (I18N.t('dash.doc_requested') || 'Dokument angefordert') + '</div>' +
        (d.request_message ? '<div class="doc-meta" style="margin-top:4px;font-style:italic">' + d.request_message + '</div>' : '') +
        '<span class="badge badge-warn" style="width:fit-content">' + (I18N.t('dash.doc_pending') || 'Ausstehend') + '</span>' +
        '<input type="file" id="upload-' + d.id + '" style="display:none" onchange="uploadRequestedDoc(\'' + d.id + '\', \'' + d.name + '\')">' +
        '<button class="doc-dl" style="background:var(--gold);color:#fff;border:none" onclick="document.getElementById(\'upload-' + d.id + '\').click()">' + (I18N.t('dash.doc_upload') || 'Dokument hochladen') + '</button>' +
        '</div>';
    } else {
      /* Document normal */
      var statusBadge = d.status === 'verified' ? 'badge-ok' : d.status === 'rejected' ? 'badge-danger' : 'badge-warn';
      var statusLabel = d.status === 'verified' ? (I18N.t('dash.doc_verified') || 'Geprueft') : d.status === 'rejected' ? (I18N.t('dash.doc_rejected') || 'Abgelehnt') : (I18N.t('dash.doc_processing') || 'In Bearbeitung');
      return '<div class="doc-card">' +
        '<div class="doc-icon" style="background:var(--info-bg)"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--info-bdr)" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>' +
        '<div class="doc-name">' + d.name + '</div>' +
        '<div class="doc-meta">' + (d.ext || 'PDF') + ' - ' + (d.size || '') + ' - ' + new Date(d.created_at).toLocaleDateString('de-DE') + '</div>' +
        '<span class="badge ' + statusBadge + '" style="width:fit-content">' + statusLabel + '</span>' +
        '<button class="doc-dl" onclick="downloadDocument(\'' + d.path + '\', \'' + d.name + '\')">' + (I18N.t('dash.doc_download') || 'Herunterladen') + '</button>' +
        '</div>';
    }
  }).join('');
}

async function downloadDocument(path, name) {
  var result = await _supabase.storage.from('documents').download(path);
  if (result.error) { showToast('Fehler: ' + result.error.message); return; }
  var url = URL.createObjectURL(result.data);
  var a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

async function loadNotifications() {
  var userResult = await _supabase.auth.getUser();
  if (!userResult.data.user) return;
  var userId = userResult.data.user.id;

  var { data, error } = await _supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return;

  var container = document.getElementById('alerts-container');
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = '<p style="font-size:12px;color:var(--text-muted);padding:1rem">Keine Benachrichtigungen.</p>';
    return;
  }

  var typeConfig = {
    message:  { color: 'info',   icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    status:   { color: 'ok',     icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' },
    document: { color: 'info',   icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
    security: { color: 'danger', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    payment:  { color: 'warn',   icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
  };

  container.innerHTML = data.map(function(n) {
    var cfg = typeConfig[n.type] || typeConfig.message;
    var d = new Date(n.created_at);
    var time = d.toLocaleDateString('de-DE', {day:'numeric', month:'short'}) + ' ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
    return '<div class="alert-item ' + cfg.color + '" style="cursor:pointer" onclick="markNotifRead(\'' + n.id + '\', this)">' +
      '<div class="al-icon" style="background:var(--' + cfg.color + '-bg)">' +
      '<svg viewBox="0 0 24 24" stroke="var(--' + cfg.color + '-bdr)" fill="none" stroke-width="2"><path d="' + cfg.icon + '"/></svg></div>' +
      '<div><div class="al-title" style="color:var(--' + cfg.color + '-bdr)">' + n.title + (n.read ? '' : ' <span style="background:var(--navy);color:#fff;font-size:9px;padding:1px 6px;border-radius:10px">Neu</span>') + '</div>' +
      '<div class="al-sub">' + (n.message || '') + '</div>' +
      '<div class="al-time">' + time + '</div></div></div>';
  }).join('');

  /* Mettre à jour le badge */
  var unread = data.filter(function(n) { return !n.read; }).length;
  var badge = document.getElementById('alert-badge');
  if (badge) { badge.textContent = unread; badge.style.display = unread > 0 ? 'inline-block' : 'none'; }
}

async function markNotifRead(id, el) {
  await _supabase.from('notifications').update({ read: true }).eq('id', id);
  var badge = el.querySelector('.al-title span');
  if (badge) badge.remove();
  var alertBadge = document.getElementById('alert-badge');
  if (alertBadge) {
    var count = parseInt(alertBadge.textContent) - 1;
    alertBadge.textContent = count;
    alertBadge.style.display = count > 0 ? 'inline-block' : 'none';
  }
}

async function loadSecurityInfo() {
  var { data: { session } } = await _supabase.auth.getSession();
  if (!session) return;

  var deviceEl = document.getElementById('current-session-device');
  var timeEl   = document.getElementById('current-session-time');

  var ua = navigator.userAgent;
  var browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Browser';
  var os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'Mac' : ua.includes('iPhone') ? 'iPhone' : ua.includes('Android') ? 'Android' : 'Geraet';

  if (deviceEl) deviceEl.textContent = browser + ' - ' + os;
  if (timeEl) {
    var d = new Date(session.created_at || Date.now());
    timeEl.textContent = d.toLocaleDateString('de-DE', {day:'numeric', month:'long', year:'numeric'}) + ' - ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
  }
}

async function uploadRequestedDoc(docId, docName) {
  var fileInput = document.getElementById('upload-' + docId);
  if (!fileInput || !fileInput.files[0]) return;
  var file = fileInput.files[0];

  var userResult = await _supabase.auth.getUser();
  if (!userResult.data.user) return;
  var userId = userResult.data.user.id;

  var cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  var fileName = userId + '/' + Date.now() + '_' + cleanName;

  showToast('Upload en cours...');

  var { error: uploadError } = await _supabase.storage
    .from('documents')
    .upload(fileName, file);

  if (uploadError) { showToast('Fehler: ' + uploadError.message); return; }

  var { error: dbError } = await _supabase.from('documents').update({
    path:      fileName,
    size:      Math.round(file.size / 1024) + ' Ko',
    ext:       file.name.split('.').pop().toUpperCase(),
    status:    'pending',
    requested: false
  }).eq('id', docId);

  if (dbError) { showToast('Fehler: ' + dbError.message); return; }

  showToast('Dokument erfolgreich hochgeladen!');
  setTimeout(function() { loadClientDocuments(); }, 500);
}
