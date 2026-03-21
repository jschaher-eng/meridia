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
async function loadDocuments() {
  const { data } = await supabase
    .from('documents')
    .select(`
      *,
      users ( full_name ),
      loans ( reference )
    `)
    .order('created_at', { ascending: false });
  return data || [];
}

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
