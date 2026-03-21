/* =========================================
   MERIDIA ADMIN — data.js
   Données de démonstration (à remplacer
   par des appels Supabase en production)
   ========================================= */

'use strict';

/* ====== CLIENTS ====== */
async function loadClients() {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false });
  return data || [];
}

/* ====== DOSSIERS DE PRÊT ====== */
// Remplace : const LOANS = [...];
async function loadLoans() {
  const { data, error } = await supabase
    .from('loans')
    .select(`
      *,
      users ( full_name, email, city )
    `)
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return []; }
  return data;
}

/* ====== MESSAGES ====== */
async function loadMessages() {
  const { data } = await supabase
    .from('messages')
    .select(`
      *,
      from:users!from_id ( full_name, avatar ),
      to:users!to_id ( full_name )
    `)
    .order('created_at', { ascending: false });
  return data || [];
}

/* ====== DOCUMENTS ====== */
const DOCUMENTS = [
  { id:'d1', clientId:'u1', client:'Jean Martin',    loan:'MP-2025-00147', name:"Offre de prêt signée",    type:'contrat',  size:'245 Ko', date:'28 jan. 2025', status:'verified', ext:'PDF' },
  { id:'d2', clientId:'u1', client:'Jean Martin',    loan:'MP-2025-00147', name:"Tableau d'amortissement", type:'contrat',  size:'118 Ko', date:'28 jan. 2025', status:'verified', ext:'PDF' },
  { id:'d3', clientId:'u1', client:'Jean Martin',    loan:'MP-2025-00147', name:"Pièce d'identité",         type:'identite', size:'2,1 Mo', date:'15 jan. 2025', status:'verified', ext:'JPG' },
  { id:'d4', clientId:'u2', client:'Marie Dupont',   loan:'MP-2025-00148', name:"Compromis de vente",       type:'immo',     size:'1,4 Mo', date:'05 fév. 2025', status:'verified', ext:'PDF' },
  { id:'d5', clientId:'u2', client:'Marie Dupont',   loan:'MP-2025-00148', name:"Bulletins de salaire (x3)", type:'identite', size:'980 Ko', date:'03 fév. 2025', status:'verified', ext:'PDF' },
  { id:'d6', clientId:'u3', client:'Ahmed Benali',   loan:'MP-2025-00150', name:"Pièce d'identité",          type:'identite', size:'1,8 Mo', date:'18 fév. 2025', status:'pending',  ext:'JPG' },
  { id:'d7', clientId:'u3', client:'Ahmed Benali',   loan:'MP-2025-00150', name:"Justificatif de revenus",   type:'identite', size:'450 Ko', date:'18 fév. 2025', status:'pending',  ext:'PDF' },
  { id:'d8', clientId:'u5', client:'Luc Moreau',     loan:'MP-2025-00152', name:"Acte de propriété",         type:'immo',     size:'2,3 Mo', date:'12 mar. 2025', status:'pending',  ext:'PDF' },
  { id:'d9', clientId:'u6', client:'Sara Khoury',    loan:'MP-2025-00153', name:"Bulletins de salaire",      type:'identite', size:'720 Ko', date:'15 mar. 2025', status:'pending',  ext:'PDF' },
];

/* ====== KPIs ====== */
const KPIS = {
  totalClients:    CLIENTS.length,
  activeLoans:     LOANS.filter(l => l.status === 'active').length,
  pendingLoans:    LOANS.filter(l => l.status === 'pending').length,
  totalEncours:    LOANS.filter(l => l.status === 'active').reduce((s,l) => s + l.amount, 0),
  unreadMessages:  Object.values(MSG_CONVERSATIONS).reduce((s,c) => s + c.unread, 0),
  pendingDocs:     DOCUMENTS.filter(d => d.status === 'pending').length,
};

/* ====== Helpers ====== */
const STATUS_LABEL = {
  active: 'En cours', pending: 'En attente', rejected: 'Refusé', suspended: 'Suspendu'
};
const STATUS_BADGE = {
  active:    'b-ok',   pending:  'b-warn',
  rejected:  'b-err',  suspended:'b-err',
  verified:  'b-ok',
};
const TYPE_ICONS = {
  contrat:'#185FA5', immo:'#0F6E56', identite:'#854F0B'
};

function fmt(v) { return Math.round(v).toLocaleString('fr-FR') + ' €'; }
function fmtK(v) { return v >= 1000 ? (v/1000).toFixed(0) + ' k€' : fmt(v); }
