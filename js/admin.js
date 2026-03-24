/* =========================================
   B-Mo Financial ADMIN — admin.js
   Navigation · Dashboard · Prêts · Clients
   Messagerie · Documents · Modals · Toasts
   ========================================= */

'use strict';

let currentPanel = 'dashboard';
let currentConv   = 'c1';
let currentLoan   = null;
let currentClient = null;

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

  // Render panel content
  if (id === 'dashboard')  renderDashboard();
  if (id === 'loans')      renderLoans();
  if (id === 'clients')    renderClients();
  if (id === 'messaging')  { loadMessages().then(function() { renderMessaging(); }); }
  if (id === 'documents')  renderDocuments();
}

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
  const pending = LOANS.filter(l => l.status === 'pending');
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
  let data = LOANS.slice();
  if (statusFilter !== 'all') data = data.filter(l => l.status === statusFilter);
  if (search) data = data.filter(l => l.client.toLowerCase().includes(search) || l.ref.toLowerCase().includes(search) || l.type.toLowerCase().includes(search));

  const tbody = document.getElementById('loans-body');
  if (!tbody) return;
  tbody.innerHTML = data.map(l => `
    <tr onclick="openLoanDetail('${l.id}')">
      <td><div class="td-name">${l.ref}</div><div class="td-sub">${l.created}</div></td>
      <td><div class="td-name">${l.client}</div></td>
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
    acts.innerHTML = l.status === 'pending'
      ? `<button class="btn btn-ok" onclick="validateLoan('${l.id}','active');closeModal('modal-loan')">Valider le dossier</button>
         <button class="btn btn-err" onclick="validateLoan('${l.id}','rejected');closeModal('modal-loan')">Refuser</button>`
      : `<button class="btn btn-ghost" onclick="closeModal('modal-loan')">Fermer</button>`;
  }
  openModal('modal-loan');
}

// Dans admin.js — remplace la fonction validateLoan()
async function validateLoan(id, decision) {
  const { error } = await supabase
    .from('loans')
    .update({
      status: decision,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

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
  setEl('mc-score',   c.score + ' / 850');
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
  const text = document.getElementById('admin-msg-input').value.trim();
  if (!text) return;

  await supabase.from('messages').insert({
    from_id:  currentAdminId,
    to_id:    currentClientId,
    loan_id:  currentConv.loanId,
    content:  text,
    read:     false
  });

  showToast('Message envoyé.');
}
/* ========================================
   MESSAGERIE
   ======================================== */
function renderMessaging() {
  renderConvList();
  selectConv(currentConv);
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
  if (!conv) return;
  conv.unread = 0;

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
}

function appendBubble(container, isRecv, text, meta) {
  const wrap = document.createElement('div');
  const bub  = document.createElement('div');
  bub.className = 'bubble ' + (isRecv ? 'recv' : 'sent');
  bub.textContent = text;
  const t = document.createElement('div');
  t.className = 'bubble-time' + (isRecv ? '' : ' r');
  t.textContent = meta;
  wrap.appendChild(bub);
  wrap.appendChild(t);
  container.appendChild(wrap);
}

async function sendAdminReply() {
  var inp = document.getElementById('admin-msg-input');
  if (!inp || !inp.value.trim()) return;
  var text = inp.value.trim();
  var conv = Object.values(MSG_CONVERSATIONS)[0];
  if (!conv) return;

  var { error } = await supabase.from('messages').insert({
    from_id:  '1ac56567-795b-48de-b547-c025ed8c7b8d',
    to_id:    conv.clientId,
    content:  text,
    read:     false,
  });

  if (error) { showToast('Erreur: ' + error.message); return; }

  inp.value = '';
  showToast('Message envoyé.');
  await loadMessages();
  renderConvList();
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
          <button class="btn btn-ghost btn-sm">Télécharger</button>
        </div>
      </td>
    </tr>`).join('');

  setEl('docs-count', data.length + ' document' + (data.length > 1 ? 's' : ''));
}

function verifyDoc(id) {
  const d = DOCUMENTS.find(x => x.id === id);
  if (d) {
    d.status = 'verified';
    KPIS.pendingDocs = DOCUMENTS.filter(x => x.status === 'pending').length;
    showToast(`Document "${d.name}" validé.`);
    if (currentPanel === 'documents') renderDocuments();
    if (currentPanel === 'dashboard') renderDashboard();
    updateBadges();
  }
}

/* ========================================
   MODAL HELPERS
   ======================================== */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
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
}

/* ========================================
   HELPERS
   ======================================== */
function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
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
