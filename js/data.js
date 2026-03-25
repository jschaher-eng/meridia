'use strict';

var CLIENTS = [];
var LOANS = [];
var DOCUMENTS = [];
var MSG_CONVERSATIONS = {};
var KPIS = { totalClients:0, activeLoans:0, pendingLoans:0, totalEncours:0, unreadMessages:0, pendingDocs:0 };

async function loadClients() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) { console.error('loadClients:', error.message); return; }
  CLIENTS = (data || []).map(u => ({
    id:      u.id,
    name:    u.full_name || u.email || '—',
    email:   u.email || '—',
    phone:   u.phone || '—',
    city:    u.city || '—',
    status:  'active',
    score:   u.credit_score || 0,
    income:  u.monthly_income || 0,
    created: formatDate(u.created_at),
    loans:   0,
    avatar:  initials(u.full_name || u.email || '?'),
    color:   'navy',
  }));
}

async function loadLoans() {
  const { data, error } = await supabase.from('loans').select('*').order('created_at', { ascending: false });
  if (error) { console.error('loadLoans:', error.message); return; }
  LOANS = (data || []).map(l => ({
    id: l.id,
    ref: l.reference || ('BM-' + l.id.slice(0,8).toUpperCase()),
    client:   l.user_id,
    clientId: l.user_id,
    type: l.type || 'Privatkredit',
    amount: l.amount || 0,
    duration: l.duration || 36,
    rate: l.rate || 3.9,
    status: l.status || 'pending',
    monthly: calcMonthly(l.amount, l.duration, l.rate),
    created: formatDate(l.created_at),
  }));

  LOANS.forEach(function(loan) {
    var profile = CLIENTS.find(function(c) { return c.id === loan.clientId; });
    if (profile) loan.client = profile.name;
  });

  CLIENTS.forEach(function(c) { 
    c.loans = LOANS.filter(function(l) { return l.clientId === c.id; }).length; 
  });
}

async function loadMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) { console.error('loadMessages:', error.message); return; }

  const ADMIN_ID = '2be14e9a-3a8c-447f-91d2-1f0889a3b12d';
  const convMap = {};

  (data || []).forEach(m => {
    const clientId = m.from_id === ADMIN_ID ? m.to_id : m.from_id;
    const key = clientId;

    if (!convMap[key]) {
      convMap[key] = {
        id: key,
        clientId: clientId,
        clientName: clientId,
        clientAvatar: '?',
        loanRef: m.loan_id || '—',
        unread: 0,
        lastTime: formatTime(m.created_at),
        messages: []
      };
    }

    if (!m.read && m.from_id !== ADMIN_ID) convMap[key].unread++;
    convMap[key].lastTime = formatTime(m.created_at);
    convMap[key].messages.push({
      recv: m.from_id !== ADMIN_ID,
      by: m.from_id === ADMIN_ID ? 'Admin' : 'Client',
      at: formatTime(m.created_at),
      text: m.content || ''
    });
  });
for (const key of Object.keys(convMap)) {
    const clientId = convMap[key].clientId;
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', clientId)
      .single();
    if (profile) {
      const name = profile.full_name || profile.email || clientId;
      convMap[key].clientName = name;
      convMap[key].clientAvatar = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }
  }

  MSG_CONVERSATIONS = convMap;
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

async function updateKPIs() {
  KPIS.totalClients   = CLIENTS.length;
  KPIS.activeLoans    = LOANS.filter(l => l.status === 'active').length;
  KPIS.pendingLoans   = LOANS.filter(l => l.status === 'pending').length;
  KPIS.totalEncours   = LOANS.filter(l => l.status === 'active').reduce((s,l) => s + l.amount, 0);
  KPIS.unreadMessages = Object.values(MSG_CONVERSATIONS).reduce((s,c) => s + c.unread, 0);
  KPIS.pendingDocs    = DOCUMENTS.filter(d => d.status === 'pending').length;
}

async function loadAllData() {
  showLoadingState(true);
  try {
    await loadClients();
    await loadLoans();
    await loadMessages();
    await loadDocuments();
    await updateKPIs();
  } catch(err) {
    console.error('Erreur chargement:', err);
  } finally {
    showLoadingState(false);
  }
}

function showLoadingState(loading) {
  const o = document.getElementById('loading-overlay');
  if (o) o.style.display = loading ? 'flex' : 'none';
}

var STATUS_LABEL = { pending:'Antrag eingereicht', reviewing:'Dokumentenpruefung', analysis:'Aktenanalyse', approved:'Grundsatzentscheidung', fees:'Gebuehrenzahlung', signed:'Vertragsunterzeichnung', funded:'Auszahlung der Mittel', active:'In Rueckzahlung', rejected:'Abgelehnt', suspended:'Suspendu' };
var STATUS_BADGE = { pending:'b-warn', reviewing:'b-info', analysis:'b-info', approved:'b-ok', fees:'b-warn', signed:'b-ok', funded:'b-ok', active:'b-ok', rejected:'b-err', suspended:'b-err' };
var TYPE_ICONS = { contrat:'#185FA5', immo:'#0F6E56', identite:'#854F0B' };

function fmt(v) { return Math.round(v || 0).toLocaleString('fr-FR') + ' €'; }
function fmtK(v) { v = v||0; return v >= 1000 ? Math.round(v/1000) + 'k€' : fmt(v); }
function initials(name) { if(!name) return '?'; return name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2); }
function formatDate(iso) { if(!iso) return '—'; return new Date(iso).toLocaleDateString('fr-FR', {day:'numeric', month:'short', year:'numeric'}); }
function formatTime(iso) {
  if(!iso) return '—';
  const d = new Date(iso), now = new Date(), diff = now-d;
  if(diff < 60000) return 'A l instant';
  if(diff < 3600000) return Math.floor(diff/60000) + ' min';
  if(diff < 86400000) return d.getHours() + 'h' + String(d.getMinutes()).padStart(2,'0');
  return formatDate(iso);
}
function calcMonthly(amount, months, rate) {
  if(!amount || !months) return 0;
  const r = (rate || 3.9) / 100 / 12;
  if(r === 0) return amount / months;
  return amount * r * Math.pow(1+r, months) / (Math.pow(1+r, months) - 1);
}
