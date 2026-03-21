/* =========================================
   MERIDIA — messaging.js
   Messagerie sécurisée client
   ========================================= */

'use strict';

/* ---- Conversation data ---- */
const CONVERSATIONS = {
  m1: {
    id: 'm1',
    name: 'Sophie Bernard',
    role: 'Chargée de clientèle · Réf. MP-2025-00147',
    avatar: 'SB',
    time: "Aujourd'hui, 10h15",
    unread: true,
    messages: [
      { recv: true,  by: 'Sophie Bernard', at: '10h00', text: "Bonjour Jean, j'espère que vous allez bien. Je vous contacte au sujet de votre dossier de prêt personnel n° MP-2025-00147." },
      { recv: true,  by: 'Sophie Bernard', at: '10h02', text: "Nous avons le plaisir de vous informer que votre dossier a été entièrement validé par notre comité de crédit. L'offre de prêt de 15 000 € sur 36 mois au taux de 3,90 % TAEG est confirmée." },
      { recv: false, by: 'Vous',           at: '10h10', text: "Merci Sophie, c'est une excellente nouvelle ! Je vais prendre le temps de relire l'offre de prêt avant de signer." },
      { recv: true,  by: 'Sophie Bernard', at: '10h15', text: "Parfait. Prenez tout le temps nécessaire. N'hésitez pas à me contacter si vous avez des questions sur les conditions ou les modalités de remboursement. Je reste à votre disposition." },
    ]
  },
  m2: {
    id: 'm2',
    name: 'Meridia — Service Crédit',
    role: 'Notification automatique',
    avatar: 'MC',
    time: 'Hier, 09h00',
    unread: true,
    messages: [
      { recv: true, by: 'Service Crédit', at: '09h00', text: "Bonjour Jean Martin, nous vous informons que votre prochaine échéance de 444 € sera prélevée dans 10 jours, le 1er avril 2025." },
      { recv: true, by: 'Service Crédit', at: '09h01', text: "Veillez à ce que votre compte bancaire soit suffisamment approvisionné. Pour toute question, n'hésitez pas à contacter votre conseillère Sophie Bernard." },
    ]
  },
  m3: {
    id: 'm3',
    name: 'Meridia — Documents',
    role: 'Service documentaire',
    avatar: 'MD',
    time: '21 mars 2025',
    unread: true,
    messages: [
      { recv: true, by: 'Service Documents', at: '08h30', text: "Votre relevé annuel 2024 est désormais disponible dans votre espace documents. Vous pouvez le télécharger à tout moment depuis la rubrique « Mes documents »." },
    ]
  },
  m4: {
    id: 'm4',
    name: 'Sophie Bernard',
    role: 'Chargée de clientèle',
    avatar: 'SB',
    time: '18 mars 2025',
    unread: false,
    messages: [
      { recv: false, by: 'Vous',           at: '14h00', text: "Sophie, j'avais une question sur le tableau d'amortissement. Pouvez-vous me l'expliquer ?" },
      { recv: true,  by: 'Sophie Bernard', at: '16h30', text: "Bonjour Jean, bien sûr. Le tableau d'amortissement détaille mois par mois la part de capital remboursé et les intérêts. Je reste disponible pour toute question complémentaire." },
    ]
  },
  m5: {
    id: 'm5',
    name: 'Meridia — Bienvenue',
    role: 'Équipe Meridia',
    avatar: 'MB',
    time: '15 jan. 2025',
    unread: false,
    messages: [
      { recv: true, by: 'Équipe Meridia', at: '09h00', text: "Bienvenue chez Meridia Banque & Crédit, Jean ! Votre espace client est désormais actif. Votre conseillère Sophie Bernard vous contactera prochainement pour accompagner votre demande." },
    ]
  },
};

let currentConvId = 'm1';

/* ---- Render a conversation in the view pane ---- */
function renderConversation(id) {
  const conv = CONVERSATIONS[id];
  if (!conv) return;
  currentConvId = id;

  // Mark as read
  conv.unread = false;

  // Update header
  const nameEl = document.querySelector('.mv-name');
  const roleEl = document.querySelector('.mv-role');
  const timeEl = document.querySelector('.mv-time');
  const avEl   = document.querySelector('.mv-avatar');
  if (nameEl) nameEl.textContent = conv.name;
  if (roleEl) roleEl.textContent = conv.role;
  if (timeEl) timeEl.textContent = conv.time;
  if (avEl)   avEl.textContent   = conv.avatar;

  // Render messages
  const body = document.getElementById('msg-body');
  if (!body) return;
  body.innerHTML = '';
  conv.messages.forEach(m => appendBubble(body, m.recv, m.text, m.recv ? m.by + ' · ' + m.at : 'Vous · ' + m.at, false));
  body.scrollTop = body.scrollHeight;
}

/* ---- Append a bubble to the message body ---- */
function appendBubble(container, isRecv, text, meta, animate) {
  const wrap = document.createElement('div');
  wrap.className = 'bubble-wrap';

  const bub = document.createElement('div');
  bub.className = 'bubble ' + (isRecv ? 'recv' : 'sent');
  bub.textContent = text;
  if (animate) {
    bub.style.opacity = '0';
    bub.style.transform = 'translateY(6px)';
    bub.style.transition = 'opacity 0.2s, transform 0.2s';
    setTimeout(() => { bub.style.opacity = '1'; bub.style.transform = 'translateY(0)'; }, 10);
  }

  const t = document.createElement('div');
  t.className = 'bubble-time' + (isRecv ? '' : ' right');
  t.textContent = meta;

  wrap.appendChild(bub);
  wrap.appendChild(t);
  container.appendChild(wrap);
}

/* ---- Select conversation from list ---- */
function selectMsg(el, id) {
  document.querySelectorAll('.msg-item').forEach(m => {
    m.classList.remove('act');
    m.classList.remove('unread');
  });
  el.classList.add('act');

  // Remove unread dot
  const dot = el.querySelector('.unread-dot');
  if (dot) dot.remove();

  renderConversation(id);
  updateUnreadBadge();
}

/* ---- Send a reply ---- */
function sendReply() {
  const inp = document.getElementById('msg-input');
  if (!inp) return;
  const txt = inp.value.trim();
  if (!txt) return;

  const body = document.getElementById('msg-body');
  if (!body) return;

  const now  = new Date();
  const meta = 'Vous · ' + now.getHours() + 'h' + String(now.getMinutes()).padStart(2, '0');

  // Add to data
  if (CONVERSATIONS[currentConvId]) {
    CONVERSATIONS[currentConvId].messages.push({ recv: false, by: 'Vous', at: meta.replace('Vous · ', ''), text: txt });
  }

  appendBubble(body, false, txt, meta, true);
  inp.value = '';
  body.scrollTop = body.scrollHeight;

  // Simulate reply after 2s for demo
  if (currentConvId === 'm1') {
    setTimeout(() => {
      const replyText = "Merci pour votre message. Je reviendrai vers vous dans les meilleurs délais.";
      const at = now.getHours() + 'h' + String(now.getMinutes() + 1).padStart(2, '0');
      appendBubble(body, true, replyText, 'Sophie Bernard · ' + at, true);
      body.scrollTop = body.scrollHeight;
    }, 2000);
  }
}

/* ---- New conversation modal stub ---- */
function newMessage() {
  const body = document.getElementById('msg-body');
  if (body) {
    body.innerHTML = '<div class="msg-empty">Sélectionnez une conversation ou démarrez un nouveau message ci-dessous.</div>';
  }
  const inp = document.getElementById('msg-input');
  if (inp) inp.focus();
}

/* ---- Update sidebar unread badge ---- */
function updateUnreadBadge() {
  const unreadCount = Object.values(CONVERSATIONS).filter(c => c.unread).length;
  const badge = document.querySelector('#sm-messages .sb-badge');
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount === 0 ? 'none' : '';
  }
}

/* ---- Enter key sends message ---- */
document.addEventListener('DOMContentLoaded', function() {
  const inp = document.getElementById('msg-input');
  if (inp) {
    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendReply();
      }
    });
  }
  // Load first conversation by default
  renderConversation('m1');
});
