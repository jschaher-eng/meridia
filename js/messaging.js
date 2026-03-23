/* =========================================
   MERIDIA — messaging.js
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

  var { data, error } = await _supabase
    .from('messages')
    .select('*')
    .or('from_id.eq.' + userId + ',to_id.eq.' + userId)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) return;

  var body = document.getElementById('msg-body');
  if (!body) return;
  body.innerHTML = '';

  data.forEach(function(m) {
    var isMe = m.from_id === userId;
    var d = new Date(m.created_at);
    var meta = (isMe ? 'Sie' : 'Berater') + ' - ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
    appendBubble(body, !isMe, m.content, meta, false);
  });

  body.scrollTop = body.scrollHeight;
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
