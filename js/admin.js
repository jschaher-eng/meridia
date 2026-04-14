/* =========================================
   Allodo ADMIN — admin.js
   Navigation · Dashboard · Prêts · Clients
   Messagerie · Documents · Modals · Toasts
   ========================================= */

'use strict';

let currentPanel = 'dashboard';
let currentConv = null;
let currentLoan   = null;
let currentClient = null;
const ADMIN_ID = '2be14e9a-3a8c-447f-91d2-1f0889a3b12d';
let currentAdminId = '2be14e9a-3a8c-447f-91d2-1f0889a3b12d';
let currentClientId = null;
/* ========================================
   NAVIGATION
   ======================================== */
function goPanel(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('act'));
  document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('act'));
  const el = document.getElementById('panel-' + id);
  const sb = document.getElementById('sb-' + id);
  if (el) el.classList.add('act');
  if (sb) sb.classList.add('act');
  currentPanel = id;

  /* Mettre à jour la nav mobile */
  document.querySelectorAll('.amn-item').forEach(i => i.classList.remove('act'));
  var amn = document.getElementById('amn-' + id);
  if (amn) amn.classList.add('act');

  /* Sur mobile : cacher la nav quand on entre dans un panel secondaire */
  if (window.innerWidth <= 900) {
    var mobileNav = document.querySelector('.admin-mobile-nav');
    if (mobileNav) mobileNav.style.display = id === 'dashboard' ? '' : 'none';
  }

  /* Réinitialiser la messagerie si on quitte ce panel */
  if (id !== 'messaging') {
    var layout = document.querySelector('.msg-layout');
    if (layout) layout.classList.remove('conv-open');
  }

  window.scrollTo(0, 0);
  history.pushState({ panel: id }, '', '#admin/' + id);

  if (id === 'dashboard')  renderDashboard();
  if (id === 'loans')      renderLoans();
  if (id === 'clients')    renderClients();
  if (id === 'messaging') {
    loadMessages().then(function() {
      if (!currentClientId) {
        renderMessaging();
      } else {
        renderConvList();
      }
    });
  }
  if (id === 'documents') {
    renderDocuments();
    populateClientSelect();
    var reqSelect = document.getElementById('req-client-select');
    if (reqSelect) {
      supabase.from('profiles').select('id, full_name, email').then(function(r) {
        if (r.data) {
          reqSelect.innerHTML = '<option value="">Sélectionner un client...</option>' +
            r.data.map(function(c) {
              return '<option value="' + c.id + '">' + (c.full_name || c.email) + '</option>';
            }).join('');
        }
      });
    }
  }

   if (id === 'invoices') {
  loadInvoices().then(function() {
    renderInvoices();
    /* Remplir le select client */
    var sel = document.getElementById('inv-client-select');
    if (sel) {
      sel.innerHTML = '<option value="">Sélectionner un client...</option>' +
        CLIENTS.map(function(c) {
          return '<option value="' + c.id + '">' + c.name + '</option>';
        }).join('');
    }
  });
}
   if (id === 'campaigns') { /* panel prêt */ }
   
}

/* Gestion du bouton retour téléphone */
window.addEventListener('popstate', function(e) {
  if (e.state && e.state.panel) {
    if (e.state.conv) {
  var layout = document.querySelector('.msg-layout');
  if (layout) layout.classList.remove('conv-open');
  var msgView = document.querySelector('.msg-view');
  if (msgView) msgView.style.display = 'none';
} else {
      /* Retour depuis un panel → aller au dashboard */
      var id = e.state.panel;
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('act'));
      var el = document.getElementById('panel-' + id);
      if (el) el.classList.add('act');
      currentPanel = id;
      document.querySelectorAll('.amn-item').forEach(i => i.classList.remove('act'));
      var amn = document.getElementById('amn-' + id);
      if (amn) amn.classList.add('act');
      if (window.innerWidth <= 900) {
        var mobileNav = document.querySelector('.admin-mobile-nav');
        if (mobileNav) mobileNav.style.display = id === 'dashboard' ? '' : 'none';
      }
    }
  }
});
/* ========================================
   DASHBOARD
   ======================================== */
function renderDashboard() {
  // KPIs
  setEl('kpi-clients',  KPIS.totalClients);
  setEl('kpi-active',   KPIS.activeLoans);
  setEl('kpi-pending',  KPIS.pendingLoans);
  setEl('kpi-encours',  fmtK(KPIS.totalEncours));
  setEl('kpi-msgs',     KPIS.unreadMessages);

  // Pending loans table
  const pending = LOANS.filter(l => l.status === 'pending')
  .sort(function(a, b) { return new Date(b.created_at_raw) - new Date(a.created_at_raw); });
  const tbody = document.getElementById('dash-pending-body');
  if (!tbody) return;
  tbody.innerHTML = pending.map(l => `
    <tr onclick="openLoanDetail('${l.id}')">
      <td><div class="td-name">${l.ref}</div><div class="td-sub">${l.type}</div></td>
      <td>${l.client}</td>
      <td>${fmt(l.amount)}</td>
      <td>${l.duration} mois</td>
      <td>${fmt(l.monthly)}/mois</td>
      <td><span class="badge b-warn">${STATUS_LABEL[l.status]}</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ok btn-sm" onclick="event.stopPropagation();validateLoan('${l.id}','active')">Valider</button>
          <button class="btn btn-err btn-sm" onclick="event.stopPropagation();validateLoan('${l.id}','rejected')">Refuser</button>
        </div>
      </td>
    </tr>`).join('');

  // Recent messages
  const unread = Object.values(MSG_CONVERSATIONS).filter(c => c.unread > 0);
  const mbox = document.getElementById('dash-messages-list');
  if (!mbox) return;
  mbox.innerHTML = unread.length === 0
    ? '<p class="text-m text-s" style="padding:.5rem 0">Aucun message non lu.</p>'
    : unread.map(c => `
    <div class="flex-b" style="padding:8px 0;border-bottom:0.5px solid var(--border);cursor:pointer;gap:8px" onclick="goPanel('messaging');selectConv('${c.id}')">
      <div class="flex-c gap-1">
        <div class="av av-sm av-${c.clientColor}">${c.clientAvatar}</div>
        <div>
          <div class="fw-5 text-s">${c.clientName} <span class="badge b-err" style="font-size:9px">${c.unread} non lu</span></div>
          <div class="text-s text-m">${c.messages[c.messages.length-1].text.slice(0,50)}…</div>
        </div>
      </div>
      <span class="text-s text-m">${c.lastTime}</span>
    </div>`).join('');

  // Docs to verify
  const pdocs = DOCUMENTS.filter(d => d.status === 'pending').slice(0,4);
  const dbox = document.getElementById('dash-docs-list');
  if (!dbox) return;
  dbox.innerHTML = pdocs.length === 0
    ? '<p class="text-m text-s" style="padding:.5rem 0">Aucun document en attente.</p>'
    : pdocs.map(d => `
    <div class="flex-b" style="padding:7px 0;border-bottom:0.5px solid var(--border)">
      <div><div class="fw-5 text-s">${d.name}</div><div class="text-s text-m">${d.client} · ${d.loan}</div></div>
      <div style="display:flex;gap:5px">
        <button class="btn btn-ok btn-sm" onclick="verifyDoc('${d.id}')">Valider</button>
        <button class="btn btn-ghost btn-sm" onclick="goPanel('documents')">Voir</button>
      </div>
    </div>`).join('');
}

/* ========================================
   LOANS
   ======================================== */
function renderLoans(filter) {
  const statusFilter = filter || document.getElementById('loan-filter-status')?.value || 'all';
  const search       = (document.getElementById('loan-search')?.value || '').toLowerCase();
  let data = LOANS.slice().sort(function(a, b) { return new Date(b.created_at_raw) - new Date(a.created_at_raw); });
  if (statusFilter !== 'all') data = data.filter(l => l.status === statusFilter);
  if (search) data = data.filter(l => l.client.toLowerCase().includes(search) || l.ref.toLowerCase().includes(search) || l.type.toLowerCase().includes(search));

  const tbody = document.getElementById('loans-body');
  if (!tbody) return;
  tbody.innerHTML = data.map(l => `
    <tr onclick="openLoanDetail('${l.id}')">
      <td><div class="td-name">${l.ref}</div><div class="td-sub">${l.created}</div></td>
      <td><div class="td-name">${l.client}</div>${l.isRequest ? '<div class="td-sub">' + (l.email || '') + (l.phone ? ' · ' + l.phone : '') + '</div>' : ''}</td>
      <td>${l.type}</td>
      <td class="fw-5">${fmt(l.amount)}</td>
      <td>${l.duration} mois</td>
      <td>${l.rate.toFixed(2)} %</td>
      <td>${fmt(l.monthly)}</td>
      <td><span class="badge ${STATUS_BADGE[l.status]}">${STATUS_LABEL[l.status]}</span></td>
      <td>
        <div style="display:flex;gap:5px;align-items:center">
          <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openLoanDetail('${l.id}')">Détail</button>
          <select class="btn btn-ghost btn-sm" style="cursor:pointer;font-size:11px" onchange="event.stopPropagation();validateLoan('${l.id}',this.value);this.value=''" onclick="event.stopPropagation()">
            <option value="">Statut...</option>
            <option value="pending">Antrag eingereicht</option>
            <option value="reviewing">Dokumentenpruefung</option>
            <option value="analysis">Aktenanalyse</option>
            <option value="approved">Grundsatzentscheidung</option>
            <option value="fees">Gebuehrenzahlung</option>
            <option value="signed">Vertragsunterzeichnung</option>
            <option value="funded">Auszahlung der Mittel</option>
            <option value="active">In Rueckzahlung</option>
            <option value="rejected">Abgelehnt</option>
          </select>
        </div>
      </td>
    </tr>`).join('');

  setEl('loans-count', data.length + ' dossier' + (data.length > 1 ? 's' : ''));
}

function openLoanDetail(id) {
  const l = LOANS.find(x => x.id === id);
  if (!l) return;
  currentLoan = l;
  const m = document.getElementById('modal-loan');
  if (!m) return;
  setEl('ml-ref',      l.ref);
  setEl('ml-client',   l.client);
  setEl('ml-type',     l.type);
  setEl('ml-amount',   fmt(l.amount));
  setEl('ml-duration', l.duration + ' mois');
  setEl('ml-rate',     l.rate.toFixed(2) + ' %');
  setEl('ml-monthly',  fmt(l.monthly));
  setEl('ml-status',   STATUS_LABEL[l.status]);
  setEl('ml-created',  l.created);
  setEl('ml-reviewed', l.reviewed || 'En attente');
  const acts = document.getElementById('ml-actions');
if (acts) {
  var clientId = l.clientId || null;
  acts.innerHTML = (l.status === 'pending'
    ? `<button class="btn btn-ok" onclick="validateLoan('${l.id}','active');closeModal('modal-loan')">Valider le dossier</button>
       <button class="btn btn-err" onclick="validateLoan('${l.id}','rejected');closeModal('modal-loan')">Refuser</button>`
    : '') +
    `<button class="btn btn-navy" onclick="generateContract('${l.clientId || ''}','${l.id}');closeModal('modal-loan')">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      Contrat générer
    </button>
    <button class="btn btn-ghost" onclick="closeModal('modal-loan')">Fermer</button>`;
}
  openModal('modal-loan');
}

// Dans admin.js — remplace la fonction validateLoan()
async function validateLoan(id, decision) {
 var loan = LOANS.find(function(l) { return l.id === id; });
 var table = (loan && loan.isRequest) ? 'loan_requests' : 'loans';
 var updateData = { status: decision };
if (table === 'loans') updateData.reviewed_at = new Date().toISOString();
const { error } = await supabase
  .from(table)
  .update(updateData)
  .eq('id', id);
   
 var loan = LOANS.find(function(l) { return l.id === id; });
 var clientId = loan?.clientId;
 console.log('Loan:', loan, 'ClientId:', clientId);
  if (clientId) {
    await createNotification(clientId, 'status',
      'Statusaenderung Ihrer Akte',
      'Ihr Dossier wurde aktualisiert: ' + (STATUS_LABEL[decision] || decision)
    );
   /* Récupérer l'email du client */
  var clientProfile = CLIENTS.find(function(c) { return c.id === clientId; });
  if (clientProfile && clientProfile.email) {
    var statusLabelsEmail = {
      pending:   'Antrag eingereicht',
      reviewing: 'Dokumentenpruefung laeuft',
      analysis:  'Aktenanalyse',
      approved:  'Grundsatzentscheidung getroffen',
      fees:      'Gebuehrenzahlung',
      signed:    'Vertragsunterzeichnung',
      funded:    'Auszahlung der Mittel',
      active:    'In Rueckzahlung',
      rejected:  'Antrag abgelehnt'
    };
    
    sendNotificationEmail(
      clientProfile.email,
      'Allodo Finanz — Aktualisierung Ihrer Akte',
      `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0C2340;padding:24px;text-align:center">
          <img src="https://www.allodo.de/logo.svg" alt="Allodo" style="height:50px">
        </div>
        <div style="padding:32px;background:#f9f9f9">
          <h2 style="color:#0C2340;font-size:18px">Guten Tag ${clientProfile.name},</h2>
          <p style="color:#555;line-height:1.6">Der Status Ihrer Akte wurde aktualisiert:</p>
          <div style="background:#fff;border-left:4px solid #B8963E;padding:16px;margin:20px 0;border-radius:4px">
            <strong style="color:#0C2340;font-size:16px">${statusLabelsEmail[decision] || decision}</strong>
          </div>
          <p style="color:#555;line-height:1.6">Melden Sie sich in Ihrem Kundenbereich an, um alle Details zu sehen.</p>
          <a href="https://www.allodo.de/#dash" style="display:inline-block;background:#B8963E;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;margin-top:16px">Mein Konto aufrufen</a>
        </div>
        <div style="padding:16px;text-align:center;color:#999;font-size:12px">
          Allodo Finanz · Friedrichstrasse 100 · 10117 Berlin
        </div>
      </div>
      `
    );
  }
  }
  if (error) { showToast('Erreur : ' + error.message); return; }

  var labels = {
    pending:   'Antrag eingereicht',
    reviewing: 'Dokumentenpruefung',
    analysis:  'Aktenanalyse',
    approved:  'Grundsatzentscheidung',
    fees:      'Gebuehrenzahlung',
    signed:    'Vertragsunterzeichnung',
    funded:    'Auszahlung der Mittel',
    active:    'In Rueckzahlung',
    rejected:  'Abgelehnt'
  };

  showToast('Statut mis à jour : ' + (labels[decision] || decision));
  await loadLoans();
  await updateKPIs();
  if (currentPanel === 'loans')     renderLoans();
  if (currentPanel === 'dashboard') renderDashboard();
  updateBadges();
}

/* ========================================
   CLIENTS
   ======================================== */
function renderClients(filter) {
  const statusFilter = filter || document.getElementById('client-filter-status')?.value || 'all';
  const search       = (document.getElementById('client-search')?.value || '').toLowerCase();
  let data = CLIENTS.slice();
  if (statusFilter !== 'all') data = data.filter(c => c.status === statusFilter);
  if (search) data = data.filter(c => c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search));

  const tbody = document.getElementById('clients-body');
  if (!tbody) return;
  tbody.innerHTML = data.map(c => `
    <tr onclick="openClientDetail('${c.id}')">
      <td>
        <div class="flex-c gap-1">
          <div class="av av-sm av-${c.color}">${c.avatar}</div>
          <div><div class="td-name">${c.name}</div><div class="td-sub">${c.email}</div></div>
        </div>
      </td>
      <td>${c.city}</td>
      <td>${fmt(c.income)}</td>
      <td><span class="badge ${c.score>=700?'b-ok':c.score>=500?'b-warn':'b-err'}">${c.score} / 850</span></td>
      <td>${c.loans} dossier${c.loans>1?'s':''}</td>
      <td><span class="badge ${STATUS_BADGE[c.status]||'b-gray'}">${STATUS_LABEL[c.status]||c.status}</span></td>
      <td>
        <div style="display:flex;gap:5px">
          <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openClientDetail('${c.id}')">Fiche</button>
          ${c.status==='active'?`<button class="btn btn-err btn-sm" onclick="event.stopPropagation();suspendClient('${c.id}')">Suspendre</button>`:`<button class="btn btn-ok btn-sm" onclick="event.stopPropagation();activateClient('${c.id}')">Réactiver</button>`}
        </div>
      </td>
    </tr>`).join('');

  setEl('clients-count', data.length + ' client' + (data.length > 1 ? 's' : ''));
}

function openClientDetail(id) {
  const c = CLIENTS.find(x => x.id === id);
  if (!c) return;
  currentClient = c;
  const m = document.getElementById('modal-client');
  if (!m) return;
  document.getElementById('mc-avatar').textContent   = c.avatar;
  document.getElementById('mc-avatar').className     = `av av-lg av-${c.color}`;
  setEl('mc-name',    c.name);
  setEl('mc-email',   c.email);
  setEl('mc-phone',   c.phone);
  setEl('mc-city',    c.city);
  setEl('mc-income',  fmt(c.income));
  setEl('mc-created', c.created);
  setEl('mc-loans',   c.loans + ' dossier' + (c.loans > 1 ? 's' : ''));
  setEl('mc-charges', c.charges ? Math.round(c.charges).toLocaleString('fr-FR') + ' €' : '—');
  setEl('mc-address', [c.address, c.postal_code, c.city].filter(Boolean).join(', ') || '—');
  setEl('mc-city', c.city || '—');
  var scoreInput = document.getElementById('mc-score-input');
  if (scoreInput) scoreInput.value = c.score || '';
  var scoreDisplay = document.getElementById('mc-score-display');
  var scoreBar = document.getElementById('mc-score-bar');
  var scoreLabelDisplay = document.getElementById('mc-score-label-display');
  if (scoreDisplay) scoreDisplay.textContent = c.score || 0;
  if (scoreBar) scoreBar.style.width = Math.round(((c.score || 0) / 850) * 100) + '%';
  if (scoreLabelDisplay) scoreLabelDisplay.textContent = c.scoreLabel || '—';
  setEl('mc-status',  STATUS_LABEL[c.status] || c.status);
  const clientLoans = LOANS.filter(l => l.clientId === c.id);
  const loansList = document.getElementById('mc-loans-list');
  if (loansList) {
    loansList.innerHTML = clientLoans.length === 0
      ? '<p class="text-m text-s">Aucun dossier.</p>'
      : clientLoans.map(l => `
        <div class="flex-b" style="padding:6px 0;border-bottom:0.5px solid var(--border)">
          <div><div class="fw-5 text-s">${l.ref} — ${l.type}</div><div class="text-s text-m">${fmt(l.amount)} · ${l.duration} mois</div></div>
          <span class="badge ${STATUS_BADGE[l.status]}">${STATUS_LABEL[l.status]}</span>
        </div>`).join('');
  }
  openModal('modal-client');
}

function suspendClient(id) {
  const c = CLIENTS.find(x => x.id === id);
  if (c) { c.status = 'suspended'; renderClients(); showToast(`Compte de ${c.name} suspendu.`); }
}
function activateClient(id) {
  const c = CLIENTS.find(x => x.id === id);
  if (c) { c.status = 'active'; renderClients(); showToast(`Compte de ${c.name} réactivé.`); }
}
//Valider un doccument()
async function verifyDoc(id) {
  await supabase
    .from('documents')
    .update({ status: 'verified', verified_at: new Date().toISOString() })
    .eq('id', id);
  showToast('Document validé.');
  renderDocuments();
}
//Envoyer un message à un client() 
async function sendAdminReply() {
  const inp = document.getElementById('admin-msg-input');
  if (!inp) return;
  const text = inp.value.trim();
  if (!text) return;

  console.log('Envoi depuis:', currentAdminId, 'vers:', currentClientId);
  const { error } = await supabase.from('messages').insert({
    from_id: currentAdminId,
    to_id:   currentClientId,
    content: text,
    read:    true
  });

  if (error) { showToast('Erreur: ' + error.message); return; }

  inp.value = '';
  showToast('Message envoyé.');
   
 var clientProfile = CLIENTS.find(function(c) { return c.id === currentClientId; });
if (clientProfile && clientProfile.email) {
  sendNotificationEmail(
    clientProfile.email,
    'Allodo — Neue Nachricht von Ihrem Berater',
    `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0C2340;padding:24px;text-align:center">
        <img src="https://www.allodo.de/logo.svg" alt="Allodo" style="height:46px">
      </div>
      <div style="padding:32px;background:#f9f9f9">
        <h2 style="color:#0C2340;font-size:17px;font-weight:400;font-family:Georgia,serif">Guten Tag ${clientProfile.name},</h2>
        <p style="color:#555;line-height:1.7;font-size:14px">Sie haben eine neue Nachricht von Ihrem Allodo-Berater erhalten.</p>
        <div style="background:#fff;border-left:3px solid #B8963E;padding:16px;margin:20px 0;border-radius:0 4px 4px 0">
          <p style="margin:0;color:#0C2340;font-size:14px;font-style:italic">"${text}"</p>
        </div>
        <a href="https://www.allodo.de/#dash" style="display:inline-block;background:#0C2340;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-size:13px;margin-top:8px">
          Nachricht lesen →
        </a>
      </div>
      <div style="padding:16px;text-align:center;color:#999;font-size:11px">
        Allodo · Friedrichstrasse 100 · 10117 Berlin
      </div>
    </div>
    `
  );
}
  await loadMessages();
/* Sauvegarder la référence avant renderConvList */
var savedName = document.getElementById('mv-name')?.textContent;
var savedSub = document.getElementById('mv-sub')?.textContent;
renderConvList();
/* Restaurer après */
if (savedName) setEl('mv-name', savedName);
if (savedSub) setEl('mv-sub', savedSub);
var layout = document.querySelector('.msg-layout');
if (layout) layout.classList.add('conv-open');
}
/* ========================================
   MESSAGERIE
   ======================================== */
function renderMessaging() {
  renderConvList();
  /* Sur mobile, ne pas ouvrir automatiquement une conversation */
  if (window.innerWidth > 900) {
    const firstKey = Object.keys(MSG_CONVERSATIONS)[0];
    if (firstKey) selectConv(firstKey);
  }
}

function renderConvList() {
  const ul = document.getElementById('msg-conv-list');
  if (!ul) return;
  ul.innerHTML = Object.values(MSG_CONVERSATIONS).map(c => `
    <div class="msg-item ${c.unread > 0 ? 'unread' : ''} ${c.id === currentConv ? 'act' : ''}" id="conv-${c.id}" onclick="selectConv('${c.id}')">
      <div class="mi-row">
        <span class="mi-name">${c.clientName}</span>
        <div style="display:flex;align-items:center;gap:5px">
          <span class="mi-time">${c.lastTime}</span>
          ${c.unread > 0 ? '<div class="unread-dot"></div>' : ''}
        </div>
      </div>
      <div class="mi-prev">${c.messages[c.messages.length-1].text}</div>
      ${c.unread > 0 ? `<span style="font-size:10px;color:var(--info-txt)">${c.unread} non lu${c.unread>1?'s':''}</span>` : ''}
    </div>`).join('');
}

function selectConv(id) {
  currentConv = id;
  const conv = MSG_CONVERSATIONS[id];
  currentClientId = conv.clientId;
  if (!conv) return;
  conv.unread = 0;

   /* Marquer les messages comme lus dans Supabase */
supabase.from('messages')
  .update({ read: true })
  .eq('to_id', ADMIN_ID)
  .eq('from_id', conv.clientId)
  .eq('read', false)
  .then(function() {});

  document.querySelectorAll('.msg-item').forEach(i => i.classList.remove('act'));
  const el = document.getElementById('conv-' + id);
  if (el) el.classList.add('act');

  setEl('mv-name', conv.clientName);
  setEl('mv-sub',  'Réf. ' + conv.loanRef);
  const av = document.getElementById('mv-avatar');
  if (av) { av.textContent = conv.clientAvatar; av.className = `av av-md av-${conv.clientColor}`; }

  const body = document.getElementById('msg-body-admin');
  if (!body) return;
  body.innerHTML = '';
  conv.messages.forEach(m => appendBubble(body, m.recv, m.text, (m.recv ? m.by : 'Vous') + ' · ' + m.at));
  body.scrollTop = body.scrollHeight;

  updateBadges();
  renderConvList();
   // Ouvrir la vue conversation sur mobile
var layout = document.querySelector('.msg-layout');
if (layout) layout.classList.add('conv-open');
var msgView = document.querySelector('.msg-view');
if (msgView && window.innerWidth <= 900) msgView.style.display = 'flex';
if (window.innerWidth <= 900) {
  history.pushState({ panel: 'messaging', conv: id }, '', '#admin/messaging/conv');
}
}

function setAmnActive(id) {
  document.querySelectorAll('.amn-item').forEach(i => i.classList.remove('act'));
  var el = document.getElementById('amn-' + id);
  if (el) el.classList.add('act');
}

function closeMobileConv() {
  var layout = document.querySelector('.msg-layout');
  if (layout) layout.classList.remove('conv-open');
  var msgView = document.querySelector('.msg-view');
  if (msgView) msgView.style.display = 'none';
}

function appendBubble(container, isRecv, text, meta) {
  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexDirection = 'column';
  wrap.style.alignItems = isRecv ? 'flex-start' : 'flex-end';
  const bub = document.createElement('div');
  bub.className = 'bubble ' + (isRecv ? 'recv' : 'sent');
  bub.innerHTML = (text || '').replace(/\n/g, '<br>');
  const t = document.createElement('div');
  t.className = 'bubble-time' + (isRecv ? '' : ' r');
  t.textContent = meta;
  wrap.appendChild(bub);
  wrap.appendChild(t);
  container.appendChild(wrap);
}

/* ========================================
   DOCUMENTS
   ======================================== */
function renderDocuments(filter) {
  const catFilter    = filter || document.getElementById('doc-filter-cat')?.value    || 'all';
  const statusFilter = document.getElementById('doc-filter-status')?.value || 'all';
  const search       = (document.getElementById('doc-search')?.value || '').toLowerCase();
  let data = DOCUMENTS.slice();
  if (catFilter !== 'all')    data = data.filter(d => d.type === catFilter);
  if (statusFilter !== 'all') data = data.filter(d => d.status === statusFilter);
  if (search) data = data.filter(d => d.client.toLowerCase().includes(search) || d.name.toLowerCase().includes(search));

  const tbody = document.getElementById('docs-body');
  if (!tbody) return;
  tbody.innerHTML = data.map(d => `
    <tr>
      <td>
        <div class="flex-c gap-1">
          <div class="doc-icon" style="background:${d.type==='identite'?'#FAEEDA':d.type==='immo'?'#EAF3DE':'#E6F1FB'};width:28px;height:28px;border-radius:4px">
            <svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:${TYPE_ICONS[d.type]};fill:none;stroke-width:1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div><div class="td-name">${d.name}</div><div class="td-sub">${d.ext} · ${d.size}</div></div>
        </div>
      </td>
      <td>${d.client}</td>
      <td>${d.loan}</td>
      <td>${d.date}</td>
      <td><span class="badge ${d.status==='verified'?'b-ok':'b-warn'}">${d.status==='verified'?'Vérifié':'À vérifier'}</span></td>
      <td>
        <div style="display:flex;gap:5px">
          ${d.status==='pending'?`<button class="btn btn-ok btn-sm" onclick="verifyDoc('${d.id}')">Valider</button>`:''}
          <button class="btn btn-ghost btn-sm" onclick="downloadDocument('${d.path}','${d.name}')">Télécharger</button>
        </div>
      </td>
    </tr>`).join('');

  setEl('docs-count', data.length + ' document' + (data.length > 1 ? 's' : ''));
}

async function verifyDoc(id) {
  const { error } = await supabase
    .from('documents')
    .update({ status: 'verified' })
    .eq('id', id);

  if (error) { showToast('Erreur: ' + error.message); return; }

  const d = DOCUMENTS.find(x => x.id === id);
  if (d) d.status = 'verified';

  KPIS.pendingDocs = DOCUMENTS.filter(x => x.status === 'pending').length;
  showToast('Document validé.');
  if (currentPanel === 'documents') renderDocuments();
  if (currentPanel === 'dashboard') renderDashboard();
  updateBadges();
}

/* ========================================
   MODAL HELPERS
   ======================================== */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); m.style.display = 'flex'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); m.style.display = 'none'; }
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});

/* ========================================
   TOAST
   ======================================== */
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ========================================
   SEARCH / FILTER WIRING
   ======================================== */
function wireSearch(inputId, selectId, renderFn) {
  const inp = document.getElementById(inputId);
  const sel = document.getElementById(selectId);
  if (inp) inp.addEventListener('input', () => renderFn());
  if (sel) sel.addEventListener('change', () => renderFn());
}

/* ========================================
   BADGE UPDATER
   ======================================== */
function updateBadges() {
  const pending  = LOANS.filter(l => l.status === 'pending').length;
  const unread   = Object.values(MSG_CONVERSATIONS).reduce((s,c) => s + c.unread, 0);
  const pdocs    = DOCUMENTS.filter(d => d.status === 'pending').length;
  const sb = document.getElementById('sb-badge-loans');
  const sm = document.getElementById('sb-badge-msgs');
  const sd = document.getElementById('sb-badge-docs');
  if (sb) { sb.textContent = pending; sb.style.display = pending ? '' : 'none'; }
  if (sm) { sm.textContent = unread;  sm.style.display = unread  ? '' : 'none'; }
  if (sd) { sd.textContent = pdocs;   sd.style.display = pdocs   ? '' : 'none'; }
var am = document.getElementById('amn-badge-loans');
var amm = document.getElementById('amn-badge-msgs');
var amd = document.getElementById('amn-badge-docs');
if (am) { am.textContent = pending; am.style.display = pending ? 'flex' : 'none'; }
if (amm) { amm.textContent = unread; amm.style.display = unread ? 'flex' : 'none'; }
if (amd) { amd.textContent = pdocs; amd.style.display = pdocs ? 'flex' : 'none'; }
}

/* ========================================
   HELPERS
   ======================================== */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
/* ========================================
    TELECHARGER DOCUMENTS
   ======================================== */
async function uploadDocument() {
  var fileInput = document.getElementById('doc-file-input');
  var clientId  = document.getElementById('doc-client-select').value;
  var docType   = document.getElementById('doc-type-select').value;
  var statusEl  = document.getElementById('upload-status');

  if (!fileInput.files[0]) return;
  if (!clientId) { statusEl.textContent = 'Veuillez sélectionner un client.'; statusEl.style.color = 'red'; return; }

  var file = fileInput.files[0];
  var cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  var fileName = clientId + '/' + Date.now() + '_' + cleanName;

  statusEl.textContent = 'Upload en cours...';
  statusEl.style.color = 'var(--text-m)';

  var { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, file);

  if (uploadError) { statusEl.textContent = 'Erreur upload: ' + uploadError.message; statusEl.style.color = 'red'; return; }

  var { error: dbError } = await supabase.from('documents').insert({
    user_id: clientId,
    name:    file.name,
    type:    docType,
    size:    Math.round(file.size / 1024) + ' Ko',
    ext:     file.name.split('.').pop().toUpperCase(),
    path:    fileName,
    status:  'verified'
  });

  if (dbError) { statusEl.textContent = 'Erreur DB: ' + dbError.message; statusEl.style.color = 'red'; return; }

  statusEl.textContent = 'Document uploadé avec succès !';
  statusEl.style.color = 'green';
  fileInput.value = '';

  await loadDocuments();
  renderDocuments();
  var clientId = document.getElementById('doc-client-select').value;
  await createNotification(clientId, 'document',
    'Neues Dokument verfuegbar',
    'Ein neues Dokument wurde in Ihrem Bereich hinterlegt: ' + file.name
  );
  showToast('Document déposé pour le client.');
}
/* ========================================
   INIT
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
  wireSearch('loan-search',   'loan-filter-status',   renderLoans);
  wireSearch('client-search', 'client-filter-status', renderClients);
  wireSearch('doc-search',    'doc-filter-cat',        renderDocuments);

  const msgInp = document.getElementById('admin-msg-input');
  if (msgInp) msgInp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAdminReply(); } });

  try {
    loadAllData().then(function() {
      updateBadges();
      goPanel('dashboard');
      if (currentPanel === 'messaging') renderMessaging();
    });
  } catch(e) {
    console.error('Erreur chargement:', e);
  }

});
// S'abonner aux nouveaux messages en temps réel
const channel = supabase
  .channel('admin-messages')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
   async (payload) => {
      console.log('Nouveau message:', payload.new);
      await loadMessages();
      await updateKPIs();
      updateBadges();
      if (currentPanel === 'messaging') renderMessaging();
      showToast('Nouveau message recu.');
    }
  )
  .subscribe();

async function populateClientSelect() {
  var clientSelect = document.getElementById('doc-client-select');
  if (!clientSelect) return;
  var { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email');
  if (error || !data) return;
  clientSelect.innerHTML = '<option value="">Client auswählen...</option>' +
    data.map(function(c) {
      return '<option value="' + c.id + '">' + (c.full_name || c.email) + '</option>';
    }).join('');
}

async function createNotification(userId, type, title, message) {
  await supabase.from('notifications').insert({
    user_id: userId,
    type:    type,
    title:   title,
    message: message,
    read:    false
  });
}

async function saveClientScore() {
  var score = document.getElementById('mc-score-input').value;
  var label = document.getElementById('mc-score-label').value;
  if (!score || !currentClient) return;

  var { error } = await supabase.from('profiles').update({
    credit_score:       parseInt(score),
    credit_score_label: label
  }).eq('id', currentClient.id);

  if (error) { showToast('Erreur: ' + error.message); return; }

  /* Mettre à jour l'affichage */
  var scoreDisplay = document.getElementById('mc-score-display');
  var scoreBar = document.getElementById('mc-score-bar');
  var scoreLabelDisplay = document.getElementById('mc-score-label-display');
  if (scoreDisplay) scoreDisplay.textContent = score;
  if (scoreBar) scoreBar.style.width = Math.round((parseInt(score) / 850) * 100) + '%';
  if (scoreLabelDisplay) scoreLabelDisplay.textContent = label;

  /* Mettre à jour dans CLIENTS */
  if (currentClient) {
    currentClient.score = parseInt(score);
    currentClient.scoreLabel = label;
  }

  showToast('Score mis à jour.');
}

async function startConversationWithClient() {
  if (!currentClient) return;
  closeModal('modal-client');
  currentClientId = currentClient.id;

  /* Charger les messages puis ouvrir le panel */
  await loadMessages();
  goPanel('messaging');

  setTimeout(function() {
    var convKey = currentClient.id;
    setEl('mv-name', currentClient.name);
    var clientLoan = LOANS.find(function(l) { return l.clientId === currentClient.id; });
    setEl('mv-sub', clientLoan ? 'Réf. ' + clientLoan.ref : currentClient.email || '');
    var av = document.getElementById('mv-avatar');
    if (av) { av.textContent = currentClient.avatar || '?'; av.className = 'av av-md av-navy'; }
    var body = document.getElementById('msg-body-admin');
    if (MSG_CONVERSATIONS[convKey]) {
      selectConv(convKey);
    } else {
      if (body) body.innerHTML = '<p style="text-align:center;color:var(--text-m);font-size:12px;padding:2rem">Noch keine Nachrichten.</p>';
    }
  }, 200);
}

async function sendNotificationEmail(to, subject, html) {
  try {
    const res = await fetch('https://optdeymyvokoowliqvnm.supabase.co/functions/v1/send-notification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wdGRleW15dm9rb293bGlxdm5tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA1Mjk5NCwiZXhwIjoyMDg5NjI4OTk0fQ.EWV6JQkMeFSKwu7Rf47N53MM7GU8ByvVnq23t_TBhCA'
      },
      body: JSON.stringify({ to, subject, html })
    });
    const data = await res.json();
    console.log('Email envoyé:', data);
  } catch(e) {
    console.error('Erreur email:', e);
  }
}

async function requestDocument() {
  var clientId  = document.getElementById('req-client-select')?.value;
  var docType   = document.getElementById('req-doc-type')?.value;
  var message   = document.getElementById('req-doc-message')?.value || '';
  var statusEl  = document.getElementById('request-status');

  if (!clientId) { statusEl.textContent = 'Veuillez sélectionner un client.'; statusEl.style.color = 'red'; return; }

  /* Trouver le loan_id du client */
  var loan = LOANS.find(function(l) { return l.clientId === clientId && !l.isRequest; });
  var loanId = loan ? loan.id : null;

  var typeLabels = {
    identite: 'Personalausweis',
    revenus:  'Einkommensnachweis',
    domicile: 'Wohnsitznachweis',
    bancaire: 'Kontoauszug',
    autre:    'Dokument'
  };

  var { error } = await supabase.from('documents').insert({
    user_id:         clientId,
    loan_id:         loanId,
    name:            typeLabels[docType] || 'Dokument',
    type:            docType,
    status:          'requested',
    requested:       true,
    request_message: message || null,
    ext:             '—',
    size:            '—'
  });

  if (error) { statusEl.textContent = 'Erreur: ' + error.message; statusEl.style.color = 'red'; return; }

  /* Envoyer une notification au client */
  await createNotification(clientId, 'document',
    'Dokument angefordert',
    'doc_request:' + docType
  );

  statusEl.textContent = 'Demande envoyée au client !';
  statusEl.style.color = 'green';
  document.getElementById('req-doc-message').value = '';

  await loadDocuments();
  renderDocuments();
}

supabase
  .channel('admin-documents')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'documents' },
    async function(payload) {
      await loadDocuments();
      renderDocuments();
      updateBadges();
      showToast('Nouveau document reçu!');
    }
  )
  .subscribe();

async function downloadDocument(path, name) {
  if (!path || path === '—') { showToast('Kein Dokument verfuegbar.'); return; }
  
  const { data, error } = await supabase.storage.from('documents').download(path);
  
  if (error) { showToast('Fehler: ' + error.message); return; }
  
  var url = URL.createObjectURL(data);
  var a = document.createElement('a');
  a.href = url;
  a.download = name || 'document';
  a.click();
  URL.revokeObjectURL(url);
}

function toggleAdminMenu() {
  document.getElementById('admin-drawer').classList.toggle('open');
  document.getElementById('admin-drawer-overlay').classList.toggle('open');
}
function closeAdminMenu() {
  document.getElementById('admin-drawer').classList.remove('open');
  document.getElementById('admin-drawer-overlay').classList.remove('open');
}

/* ========================================
   FACTURES
   ======================================== */
var INVOICES = [];

async function loadInvoices() {
  var { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('loadInvoices:', error.message); return; }
  INVOICES = (data || []).map(function(inv) {
    var client = CLIENTS.find(function(c) { return c.id === inv.user_id; });
    return {
      id:             inv.id,
      number:         inv.invoice_number,
      clientId:       inv.user_id,
      client:         client ? client.name : '—',
      type:           inv.type,
      amount:         inv.amount,
      description:    inv.description,
      status:         inv.status,
      iban:           inv.iban,
      bic:            inv.bic,
      beneficiary:    inv.beneficiary,
      reference:      inv.reference,
      created:        formatDate(inv.created_at),
      paidAt:         inv.paid_at ? formatDate(inv.paid_at) : null
    };
  });
}

function renderInvoices() {
  var tbody = document.getElementById('invoices-body');
  if (!tbody) return;
  if (INVOICES.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-m text-s" style="padding:1.5rem">Aucune facture.</td></tr>';
    return;
  }
  tbody.innerHTML = INVOICES.map(function(inv) {
    var badgeClass = inv.status === 'paid' ? 'b-ok' : inv.status === 'cancelled' ? 'b-err' : 'b-warn';
    var badgeLabel = inv.status === 'paid' ? 'Payée' : inv.status === 'cancelled' ? 'Annulée' : 'En attente';
    return '<tr>' +
      '<td><div class="td-name">' + inv.number + '</div></td>' +
      '<td>' + inv.client + '</td>' +
      '<td>' + inv.type + '</td>' +
      '<td class="fw-5">' + fmt(inv.amount) + '</td>' +
      '<td><span class="badge ' + badgeClass + '">' + badgeLabel + '</span></td>' +
      '<td>' + inv.created + '</td>' +
      '<td>' +
        '<div style="display:flex;gap:5px">' +
          '<button class="btn btn-ghost btn-sm" onclick="markInvoicePaid(\'' + inv.id + '\')">Marquer payée</button>' +
          '<button class="btn btn-navy btn-sm" onclick="sendInvoiceToClient(\'' + inv.id + '\')">Envoyer</button>' +
        '</div>' +
      '</td>' +
    '</tr>';
  }).join('');
  setEl('invoices-count', INVOICES.length + ' facture' + (INVOICES.length > 1 ? 's' : ''));
}

async function createInvoice() {
  var clientId    = document.getElementById('inv-client-select').value;
  var type        = document.getElementById('inv-type').value;
  var amount      = parseFloat(document.getElementById('inv-amount').value);
  var reference   = document.getElementById('inv-reference').value;
  var description = document.getElementById('inv-description').value;
  var iban        = document.getElementById('inv-iban').value;
  var bic         = document.getElementById('inv-bic').value;
  var beneficiary = document.getElementById('inv-beneficiary').value;

  if (!clientId) { showToast('Veuillez sélectionner un client.'); return; }
  if (!amount || amount <= 0) { showToast('Veuillez entrer un montant valide.'); return; }
  if (!iban) { showToast('Veuillez entrer un IBAN.'); return; }

  /* Générer le numéro de facture */
  var invoiceNumber = 'INV-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6);

  var { error } = await supabase.from('invoices').insert({
    invoice_number: invoiceNumber,
    user_id:        clientId,
    type:           type,
    amount:         amount,
    description:    description,
    reference:      reference || invoiceNumber,
    iban:           iban,
    bic:            bic,
    beneficiary:    beneficiary,
    status:         'pending'
  });

  if (error) { showToast('Erreur: ' + error.message); return; }

  showToast('Facture ' + invoiceNumber + ' créée.');
  
  /* Notifier le client */
  await createNotification(clientId, 'payment',
    'Neue Rechnung',
    'Eine neue Rechnung wurde erstellt: ' + invoiceNumber + ' - ' + Math.round(amount).toLocaleString('de-DE') + ' EUR'
  );

  await loadInvoices();
  renderInvoices();
}

async function markInvoicePaid(id) {
  var { error } = await supabase.from('invoices')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', id);
  if (error) { showToast('Erreur: ' + error.message); return; }
  showToast('Facture marquée comme payée.');
  await loadInvoices();
  renderInvoices();
}

async function sendInvoiceToClient(id) {
  var inv = INVOICES.find(function(i) { return i.id === id; });
  if (!inv) return;
  var client = CLIENTS.find(function(c) { return c.id === inv.clientId; });
  if (!client || !client.email) { showToast('Email client introuvable.'); return; }

  await sendNotificationEmail(
    client.email,
    'Allodo — Rechnung ' + inv.number,
    `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0C2340;padding:24px;text-align:center">
        <img src="https://www.allodo.de/logo.svg" alt="Allodo" style="height:46px">
      </div>
      <div style="padding:32px;background:#f9f9f9">
        <h2 style="color:#0C2340;font-size:18px">Rechnung ${inv.number}</h2>
        <p style="color:#555;line-height:1.7">Sehr geehrte/r ${client.name},</p>
        <p style="color:#555;line-height:1.7">Anbei finden Sie Ihre Rechnung:</p>
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:20px;margin:20px 0">
          <table style="width:100%;font-size:14px">
            <tr><td style="color:#555;padding:6px 0">Rechnungsnummer</td><td style="font-weight:500;text-align:right">${inv.number}</td></tr>
            <tr><td style="color:#555;padding:6px 0">Art</td><td style="font-weight:500;text-align:right">${inv.type}</td></tr>
            <tr><td style="color:#555;padding:6px 0">Beschreibung</td><td style="font-weight:500;text-align:right">${inv.description || '—'}</td></tr>
            <tr style="border-top:2px solid #E5E7EB"><td style="color:#0C2340;font-weight:600;padding:10px 0;font-size:16px">Betrag</td><td style="color:#0C2340;font-weight:600;text-align:right;font-size:16px">${Math.round(inv.amount).toLocaleString('de-DE')} EUR</td></tr>
          </table>
        </div>
        <div style="background:#0C2340;color:#fff;border-radius:8px;padding:20px;margin:20px 0">
          <div style="font-size:13px;opacity:0.7;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px">Zahlungsdetails</div>
          <table style="width:100%;font-size:14px;color:#fff">
            <tr><td style="padding:4px 0;opacity:0.8">Begünstigter</td><td style="text-align:right;font-weight:500">${inv.beneficiary}</td></tr>
            <tr><td style="padding:4px 0;opacity:0.8">IBAN</td><td style="text-align:right;font-weight:500">${inv.iban}</td></tr>
            <tr><td style="padding:4px 0;opacity:0.8">BIC</td><td style="text-align:right;font-weight:500">${inv.bic}</td></tr>
            <tr><td style="padding:4px 0;opacity:0.8">Verwendungszweck</td><td style="text-align:right;font-weight:500;color:#B8963E">${inv.reference}</td></tr>
          </table>
        </div>
        <a href="https://www.allodo.de/#dash" style="display:inline-block;background:#B8963E;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-size:13px">
          Mein Konto aufrufen →
        </a>
      </div>
      <div style="padding:16px;text-align:center;color:#999;font-size:11px">
        Allodo · Friedrichstrasse 100 · 10117 Berlin
      </div>
    </div>
    `
  );
  showToast('Facture envoyée à ' + client.email);
}

/* ========================================
   CAMPAGNES EMAIL
   ======================================== */
async function sendCampaign() {
  var emailsRaw = document.getElementById('camp-emails').value.trim();
  var subject   = document.getElementById('camp-subject').value.trim();
  var message   = document.getElementById('camp-message').value.trim();
  var statusEl  = document.getElementById('camp-status');

  if (!emailsRaw) { statusEl.textContent = 'Veuillez entrer au moins un email.'; statusEl.style.color = 'red'; return; }
  if (!subject)   { statusEl.textContent = 'Veuillez entrer un objet.'; statusEl.style.color = 'red'; return; }
  if (!message)   { statusEl.textContent = 'Veuillez entrer un message.'; statusEl.style.color = 'red'; return; }

  var emails = emailsRaw.split('\n')
    .map(function(e) { return e.trim(); })
    .filter(function(e) { return e.includes('@'); });

  if (emails.length === 0) { statusEl.textContent = 'Aucun email valide trouvé.'; statusEl.style.color = 'red'; return; }

  statusEl.textContent = 'Envoi en cours... 0/' + emails.length;
  statusEl.style.color = 'var(--text-m)';

  var html = `
  <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#222">
    <div style="padding:24px 0;border-bottom:1px solid #eee;text-align:center">
      <img src="https://www.allodo.de/logo.svg" alt="Allodo" style="height:40px">
    </div>
    <div style="padding:32px 0;font-size:15px;line-height:1.9;color:#333;white-space:pre-line">${message}</div>
    <div style="padding:20px 0">
      <a href="https://www.allodo.de" style="display:inline-block;background:#0C2340;color:#fff;padding:11px 24px;border-radius:3px;text-decoration:none;font-size:14px;font-family:Arial,sans-serif">
        Mehr erfahren
      </a>
    </div>
    <div style="padding:24px 0;border-top:1px solid #eee;font-size:11px;color:#999;font-family:Arial,sans-serif">
      Allodo GmbH · Friedrichstrasse 100 · 10117 Berlin<br>
      <a href="https://www.allodo.de/impressum.html" style="color:#999">Impressum</a> · 
      <a href="https://www.allodo.de/datenschutz.html" style="color:#999">Datenschutz</a> · 
      <a href="mailto:contact@allodo.de?subject=Abmeldung" style="color:#999">Abmelden</a>
    </div>
  </div>
`;

  var sent = 0;
  var failed = 0;

  for (var i = 0; i < emails.length; i++) {
    try {
      await sendNotificationEmail(emails[i], subject, html);
      sent++;
      statusEl.textContent = 'Envoi en cours... ' + sent + '/' + emails.length;
    } catch(e) {
      failed++;
    }
    /* Petite pause pour éviter le rate limiting */
    await new Promise(function(resolve) { setTimeout(resolve, 300); });
  }

  statusEl.textContent = '✓ Envoyé : ' + sent + ' · Échec : ' + failed;
  statusEl.style.color = sent > 0 ? 'green' : 'red';
}

/* Aperçu en temps réel */
document.addEventListener('DOMContentLoaded', function() {
  var msgInput = document.getElementById('camp-message');
  if (msgInput) {
    msgInput.addEventListener('input', function() {
      var preview = document.getElementById('camp-preview');
      if (preview) preview.innerHTML = this.value.replace(/\n/g, '<br>');
    });
  }
});

/* ========================================
   GÉNÉRATION CONTRAT PDF
   ======================================== */
var _contractClientId = null;
var _contractLoanId = null;

function generateContract(clientId, loanId) {
  _contractClientId = clientId;
  _contractLoanId = loanId;

  var client = CLIENTS.find(function(c) { return c.id === clientId; });
  var loan = LOANS.find(function(l) { return l.id === loanId; });

  /* Pré-remplir le formulaire */
  var today = new Date();
  var firstPayment = new Date(today.getFullYear(), today.getMonth() + 3, 1);
  var fmt = function(d) { return d.toISOString().split('T')[0]; };

  document.getElementById('ct-input-date').value = fmt(today);
  document.getElementById('ct-input-first-payment').value = fmt(firstPayment);
  document.getElementById('ct-input-address').value = (client && client.address) ? client.address : '';
  document.getElementById('ct-input-purpose').value = (loan && loan.type) ? loan.type : '';
  document.getElementById('ct-input-director').value = '';
  document.getElementById('ct-input-guarantee').value = 'Keine';
  document.getElementById('ct-input-iban').value = '';
  document.getElementById('ct-input-bic').value = '';
  document.getElementById('ct-input-bank').value = '';

  openModal('modal-contract');
}

async function confirmGenerateContract() {
  var clientId = _contractClientId;
  var loanId = _contractLoanId;
  var client = CLIENTS.find(function(c) { return c.id === clientId; });
  var loan = LOANS.find(function(l) { return l.id === loanId; });
  if (!client || !loan) { showToast('Client ou dossier introuvable.'); return; }

  var director = document.getElementById('ct-input-director').value.trim();
  var date = document.getElementById('ct-input-date').value;
  var address = document.getElementById('ct-input-address').value.trim();
  var purpose = document.getElementById('ct-input-purpose').value.trim();
  var firstPayment = document.getElementById('ct-input-first-payment').value;
  var guarantee = document.getElementById('ct-input-guarantee').value.trim();
  var iban = document.getElementById('ct-input-iban').value.trim();
  var bic = document.getElementById('ct-input-bic').value.trim();
  var bank = document.getElementById('ct-input-bank').value.trim();

  if (!director) { showToast('Veuillez entrer le nom du directeur.'); return; }
  if (!purpose) { showToast('Veuillez entrer le Verwendungszweck.'); return; }

  closeModal('modal-contract');

  /* Calculs */
  var r = (loan.rate || 3.9) / 100 / 12;
  var d = loan.duration || 36;
  var a = loan.amount || 0;
  var monthly = r === 0 ? a/d : a*r*Math.pow(1+r,d)/(Math.pow(1+r,d)-1);
  var total = Math.round(monthly * d);
  var interestTotal = Math.round(monthly * d - a);

  var contractDate = new Date(date);
  var firstPaymentDate = new Date(firstPayment);
  var endDate = new Date(firstPaymentDate.getFullYear(), firstPaymentDate.getMonth() + d, 0);

  var fmtDE = function(dt) { return new Date(dt).toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'}); };
  var contractNumber = 'AF-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-6);

  /* Remplir le template */
  var set = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
  set('ct-number', contractNumber);
  set('ct-date', fmtDE(contractDate));
  set('ct-date2', fmtDE(contractDate));
  set('ct-advisor', director);
  set('ct-advisor2', director);
  set('ct-client-name', client.name);
  set('ct-client-name2', client.name);
  set('ct-client-address', address || client.city || 'Deutschland');
  set('ct-client-email', client.email || '');
  set('ct-client-phone', client.phone || '');
  set('ct-amount', Math.round(a).toLocaleString('de-DE') + ' EUR');
  set('ct-amount2', Math.round(a).toLocaleString('de-DE') + ' EUR');
  set('ct-purpose', purpose);
  set('ct-purpose2', purpose);
  set('ct-duration', d);
  set('ct-duration2', d);
  set('ct-rate', (loan.rate || 3.9));
  set('ct-rate2', (loan.rate || 3.9));
  set('ct-monthly', Math.round(monthly).toLocaleString('de-DE'));
  set('ct-monthly2', Math.round(monthly).toLocaleString('de-DE'));
  set('ct-first-payment', fmtDE(firstPaymentDate));
  set('ct-first-payment2', fmtDE(firstPaymentDate));
  set('ct-total', total.toLocaleString('de-DE'));
  set('ct-end-date', fmtDE(endDate));
  set('ct-guarantee', guarantee);
  set('ct-iban', iban || '________________________________');
  set('ct-bic', bic || '________________________________');
  set('ct-bank', bank || '________________________________');
  set('ct-interest', interestTotal.toLocaleString('de-DE') + ' EUR');
  set('ct-account-holder', client.name);
  set('ct-first-payment3', fmtDE(firstPaymentDate));

   console.log('content element:', document.getElementById('contract-content'));
  /* Afficher le template */
  var content = document.getElementById('contract-content');
  content.style.display = 'block';
   
  var opt = {
  margin: [15, 15, 15, 15],
    filename: 'Darlehensvertrag_' + contractNumber + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    showToast('Contrat en cours de génération...');
    var pdfBlob = await html2pdf().set(opt).from(content).outputPdf('blob');
    content.style.display = 'none';

    var fileName = 'contracts/' + clientId + '/' + contractNumber + '.pdf';
    var { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, pdfBlob, { contentType: 'application/pdf', upsert: true });

    if (uploadError) { showToast('Erreur upload: ' + uploadError.message); return; }

    var { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName);
    var pdfUrl = urlData.publicUrl;

    await supabase.from('documents').insert({
      user_id:  clientId,
      loan_id:  loan.isRequest ? null : loanId,
      name:     'Darlehensvertrag ' + contractNumber,
      type:     'contrat',
      status:   'verified',
      path:     fileName,
      ext:      'PDF',
      size:     Math.round(pdfBlob.size / 1024) + ' KB'
    });

    if (client.id) {
      await createNotification(client.id, 'document',
        'Ihr Darlehensvertrag ist verfügbar',
        'Ihr Darlehensvertrag ' + contractNumber + ' wurde erstellt.'
      );
    }

    if (client.email) {
      await sendContractByEmail(client, contractNumber, pdfUrl, loan, director);
    }

    showToast('✓ Contrat généré et envoyé à ' + client.email);
    await loadDocuments();
    renderDocuments();

  } catch(e) {
    content.style.display = 'none';
    showToast('Erreur: ' + e.message);
    console.error(e);
  }
}

async function sendContractByEmail(client, contractNumber, pdfUrl, loan, director) {
  var html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0C2340;padding:24px;text-align:center">
        <img src="https://www.allodo.de/logo.svg" alt="Allodo" style="height:46px">
      </div>
      <div style="padding:32px;background:#f9f9f9">
        <h2 style="color:#0C2340;font-size:18px">Ihr Darlehensvertrag ist bereit</h2>
        <p style="color:#555;line-height:1.7">Sehr geehrte/r ${client.name},</p>
        <p style="color:#555;line-height:1.7">Ihr Darlehensvertrag Nr. <strong>${contractNumber}</strong> wurde erstellt und steht Ihnen zur Verfügung.</p>
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:20px;margin:20px 0">
          <table style="width:100%;font-size:14px">
            <tr><td style="color:#555;padding:6px 0">Betrag</td><td style="font-weight:500;text-align:right">${Math.round(loan.amount).toLocaleString('de-DE')} EUR</td></tr>
            <tr><td style="color:#555;padding:6px 0">Laufzeit</td><td style="font-weight:500;text-align:right">${loan.duration} Monate</td></tr>
            <tr><td style="color:#555;padding:6px 0">Zinssatz</td><td style="font-weight:500;text-align:right">${loan.rate || 3.9} %</td></tr>
          </table>
        </div>
        <p style="color:#555;line-height:1.7">Bitte lesen Sie den Vertrag sorgfältig durch und unterzeichnen Sie ihn.</p>
        <a href="${pdfUrl}" style="display:inline-block;background:#0C2340;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;font-size:14px;margin-top:8px">
          Vertrag herunterladen →
        </a>
        <p style="color:#555;line-height:1.7;margin-top:20px">Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
        <p style="color:#555">Mit freundlichen Grüßen,<br><strong>${director || 'Allodo GmbH'}</strong></p>
      </div>
      <div style="padding:16px;text-align:center;color:#999;font-size:11px">
        Allodo GmbH · Friedrichstrasse 100 · 10117 Berlin
      </div>
    </div>
  `;
  await sendNotificationEmail(client.email, 'Allodo — Ihr Darlehensvertrag ' + contractNumber, html);
}
