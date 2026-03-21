/* =========================================
   MERIDIA ADMIN — data.js
   Données de démonstration (à remplacer
   par des appels Supabase en production)
   ========================================= */

'use strict';

/* ====== CLIENTS ====== */
const CLIENTS = [
  { id:'u1', name:'Jean Martin',    email:'jean.martin@email.com',    phone:'+33 6 12 34 56 78', city:'Paris',     role:'client', status:'active',    score:782, income:2800, created:'15 jan. 2025', loans:1, avatar:'JM', color:'navy' },
  { id:'u2', name:'Marie Dupont',   email:'marie.dupont@email.com',   phone:'+33 6 98 76 54 32', city:'Lyon',      role:'client', status:'active',    score:641, income:3400, created:'02 fév. 2025', loans:2, avatar:'MD', color:'green' },
  { id:'u3', name:'Ahmed Benali',   email:'ahmed.benali@email.com',   phone:'+33 7 12 34 56 00', city:'Marseille', role:'client', status:'pending',   score:510, income:1900, created:'18 fév. 2025', loans:1, avatar:'AB', color:'gold' },
  { id:'u4', name:'Clara Fontaine', email:'clara.fontaine@email.com', phone:'+33 6 55 44 33 22', city:'Bordeaux',  role:'client', status:'suspended', score:290, income:2100, created:'01 mar. 2025', loans:0, avatar:'CF', color:'red' },
  { id:'u5', name:'Luc Moreau',     email:'luc.moreau@email.com',     phone:'+33 6 77 88 99 00', city:'Nantes',    role:'client', status:'active',    score:715, income:4200, created:'10 mar. 2025', loans:1, avatar:'LM', color:'navy' },
  { id:'u6', name:'Sara Khoury',    email:'sara.khoury@email.com',    phone:'+33 6 11 22 33 44', city:'Strasbourg',role:'client', status:'active',    score:688, income:3100, created:'15 mar. 2025', loans:1, avatar:'SK', color:'green' },
];

/* ====== DOSSIERS DE PRÊT ====== */
const LOANS = [
  { id:'l1', ref:'MP-2025-00147', client:'Jean Martin',    clientId:'u1', type:'Prêt personnel',  amount:15000, duration:36, rate:3.9,  status:'active',   monthly:444,  created:'15 jan. 2025', reviewed:'21 jan. 2025' },
  { id:'l2', ref:'MP-2025-00148', client:'Marie Dupont',   clientId:'u2', type:'Prêt immobilier', amount:185000,duration:240,rate:3.2,  status:'active',   monthly:1048, created:'02 fév. 2025', reviewed:'10 fév. 2025' },
  { id:'l3', ref:'MP-2025-00149', client:'Marie Dupont',   clientId:'u2', type:'Prêt auto',       amount:22000, duration:60, rate:4.5,  status:'active',   monthly:408,  created:'02 fév. 2025', reviewed:'10 fév. 2025' },
  { id:'l4', ref:'MP-2025-00150', client:'Ahmed Benali',   clientId:'u3', type:'Microfinance',    amount:5000,  duration:24, rate:5.9,  status:'pending',  monthly:222,  created:'18 fév. 2025', reviewed:null },
  { id:'l5', ref:'MP-2025-00151', client:'Clara Fontaine', clientId:'u4', type:'Prêt personnel',  amount:8000,  duration:48, rate:6.2,  status:'rejected', monthly:189,  created:'01 mar. 2025', reviewed:'05 mar. 2025' },
  { id:'l6', ref:'MP-2025-00152', client:'Luc Moreau',     clientId:'u5', type:'Prêt immobilier', amount:320000,duration:300,rate:3.15, status:'pending',  monthly:1524, created:'10 mar. 2025', reviewed:null },
  { id:'l7', ref:'MP-2025-00153', client:'Sara Khoury',    clientId:'u6', type:'Prêt personnel',  amount:12000, duration:36, rate:3.9,  status:'pending',  monthly:354,  created:'15 mar. 2025', reviewed:null },
];

/* ====== MESSAGES ====== */
const MSG_CONVERSATIONS = {
  c1: {
    id:'c1', clientName:'Jean Martin', clientAvatar:'JM', clientColor:'navy',
    loanRef:'MP-2025-00147', unread:0, lastTime:'10h15',
    messages:[
      { recv:false, by:'Jean Martin',    at:'10h00', text:"Bonjour, j'ai une question sur mon tableau d'amortissement." },
      { recv:true,  by:'Sophie Bernard', at:'10h05', text:"Bonjour Jean, je vous l'explique volontiers. Votre capital restant dû est de 10 672 €, avec 24 mensualités de 444 € restantes." },
      { recv:false, by:'Jean Martin',    at:'10h10', text:"Merci beaucoup, c'est très clair !" },
      { recv:true,  by:'Sophie Bernard', at:'10h15', text:"De rien, n'hésitez pas si vous avez d'autres questions." },
    ]
  },
  c2: {
    id:'c2', clientName:'Ahmed Benali', clientAvatar:'AB', clientColor:'gold',
    loanRef:'MP-2025-00150', unread:2, lastTime:'Hier',
    messages:[
      { recv:false, by:'Ahmed Benali',   at:'14h30', text:"Bonjour, où en est mon dossier de microfinance ? Ça fait 3 semaines." },
      { recv:false, by:'Ahmed Benali',   at:'09h00', text:"Bonjour, toujours sans réponse. C'est urgent pour moi." },
    ]
  },
  c3: {
    id:'c3', clientName:'Luc Moreau', clientAvatar:'LM', clientColor:'navy',
    loanRef:'MP-2025-00152', unread:1, lastTime:'21 mar.',
    messages:[
      { recv:false, by:'Luc Moreau', at:'11h00', text:"Bonjour, pouvez-vous me confirmer le taux fixe pour mon prêt immobilier ?" },
    ]
  },
  c4: {
    id:'c4', clientName:'Marie Dupont', clientAvatar:'MD', clientColor:'green',
    loanRef:'MP-2025-00148', unread:0, lastTime:'18 mar.',
    messages:[
      { recv:true,  by:'Sophie Bernard', at:'09h00', text:"Bonjour Marie, votre dossier immobilier est bien avancé. Il vous reste à signer l'offre." },
      { recv:false, by:'Marie Dupont',   at:'09h30', text:"Merci Sophie, je vais le faire aujourd'hui." },
    ]
  },
};

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
