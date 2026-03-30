/* =========================================
   Allodo — messaging.js
   Messagerie sécurisée client
   ========================================= */

'use strict';

let currentConvId = null;

/* ---- Render a conversation in the view pane ---- */
function renderConversation(id) {
  currentConvId = id;
  var body = document.getElementById('msg-body');
  if (body) body.innerHTML = '';
  loadClientMessages();
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
  document.querySelectorAll('.msg-item').forEach(function(m) { m.classList.remove('act'); });
  el.classList.add('act');
  renderConversation(id);
}

/* ---- Send a reply ---- */
async function sendReply() {
  var inp = document.getElementById('msg-input');
  if (!inp || !inp.value.trim()) return;
  var text = inp.value.trim();

  var userResult = await _supabase.auth.getUser();
  if (!userResult.data.user) return;
  var userId = userResult.data.user.id;

  var { data: loans } = await _supabase
    .from('loans')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  var loanId = loans && loans.length > 0 ? loans[0].id : null;

  var { error } = await _supabase.from('messages').insert({
    from_id:  userId,
    to_id: '2be14e9a-3a8c-447f-91d2-1f0889a3b12d',
    content:  text,
    loan_id:  loanId,
    read:     false,
  });

  if (error) { showToast('Fehler: ' + error.message); return; }

  var body = document.getElementById('msg-body');
  var now = new Date();
  var meta = 'Sie - ' + now.getHours() + ':' + String(now.getMinutes()).padStart(2,'0');
  appendBubble(body, false, text, meta, true);
  inp.value = '';
  body.scrollTop = body.scrollHeight;
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

async function loadClientMessages() {
  var userResult = await _supabase.auth.getUser();
  if (!userResult.data.user) return;
  var userId = userResult.data.user.id;
  var ADMIN_ID = '2be14e9a-3a8c-447f-91d2-1f0889a3b12d';

  var { data, error } = await _supabase
    .from('messages')
    .select('*')
    .or('from_id.eq.' + userId + ',to_id.eq.' + userId)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) return;

  var body = document.getElementById('msg-body');
  if (!body) return;
  body.innerHTML = '';
  await markMessagesAsRead();

  data.forEach(function(m) {
    var isMe = m.from_id === userId;
    var isAdmin = m.from_id === ADMIN_ID;
    var d = new Date(m.created_at);
    var time = d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
    var meta = isAdmin ? 'Allodo Finanz · ' + time : 'Sie · ' + time;
    /* recv=true = message recu = affiché à gauche = message de l'admin */
    appendBubble(body, isAdmin, m.content, meta, false);
  });

  body.scrollTop = body.scrollHeight;
  await updateMessageBadge();
}

function initRealtimeMessages() {
  var userId = null;
  _supabase.auth.getUser().then(function(r) {
    if (r.data.user) userId = r.data.user.id;
  });

  _supabase
    .channel('client-messages')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      function(payload) {
        var body = document.getElementById('msg-body');
        if (!body) return;
        var m = payload.new;
        var ADMIN_ID = '2be14e9a-3a8c-447f-91d2-1f0889a3b12d';
        var isAdmin = m.from_id === ADMIN_ID;
        
        /* Ne pas afficher les messages envoyés par le client lui-même 
           car déjà affichés par sendReply() */
        if (!isAdmin) return;
        
        var d = new Date(m.created_at);
        var time = d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
        var meta = 'Allodo Finanz · ' + time;
        appendBubble(body, true, m.content, meta, true);
        updateMessageBadge();
        body.scrollTop = body.scrollHeight;
      }
    )
    .subscribe();
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

async function updateMessageBadge() {
  var userResult = await _supabase.auth.getUser();
  if (!userResult.data.user) return;
  var userId = userResult.data.user.id;

  var { data } = await _supabase
    .from('messages')
    .select('id')
    .eq('to_id', userId)
    .eq('read', false)
    .neq('from_id', userId);

  var count = data ? data.length : 0;
  var badge = document.getElementById('msg-badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  }
  var header = document.getElementById('unread-count-header');
  if (header) {
    header.textContent = count > 0 ? count + ' ungelesene Nachrichten' : 'Keine ungelesenen Nachrichten';
  }
}

async function markMessagesAsRead() {
  var userResult = await _supabase.auth.getUser();
  if (!userResult.data.user) return;
  var userId = userResult.data.user.id;

  await _supabase
    .from('messages')
    .update({ read: true })
    .eq('to_id', userId)
    .eq('read', false);
}

async function loadLastMessages() {
  var userResult = await _supabase.auth.getUser();
  if (!userResult.data.user) return;
  var userId = userResult.data.user.id;

  var { data } = await _supabase
    .from('messages')
    .select('*')
    .or('from_id.eq.' + userId + ',to_id.eq.' + userId)
    .order('created_at', { ascending: false })
    .limit(2);

  var container = document.getElementById('last-messages-preview');
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = '<p style="font-size:12px;color:var(--text-muted);padding:8px 0">Keine Nachrichten.</p>';
    return;
  }

  var ADMIN_ID = '2be14e9a-3a8c-447f-91d2-1f0889a3b12d';
  container.innerHTML = data.map(function(m) {
    var isAdmin = m.from_id === ADMIN_ID;
    var d = new Date(m.created_at);
    var time = d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
    return '<div class="lr" style="cursor:pointer;align-items:flex-start;gap:10px" onclick="dashTab(\'messages\')">' +
      '<div style="width:30px;height:30px;border-radius:50%;background:var(--navy);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:500;color:#fff;flex-shrink:0">' + (isAdmin ? 'AF' : 'Sie') + '</div>' +
      '<div><div class="ln">' + (isAdmin ? 'Allodo Finanz' : 'Sie') + '</div>' +
      '<div class="lm">' + m.content.slice(0, 50) + '</div>' +
      '<div class="lm" style="margin-top:2px">' + time + '</div></div></div>';
  }).join('');
}
