/* =========================================
   MERIDIA — app.js
   Navigation · Pages · Notifications
   ========================================= */

'use strict';

/* ---- Page router ---- */
function goPage(id) {
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('act'));
  const el = document.getElementById('pg-' + id);
  if (el) el.classList.add('act');

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('act'));
  const map = { home: 0, prods: 1, sim: 2, apply: 3 };
  const btns = document.querySelectorAll('.nav-link');
  if (map[id] !== undefined && btns[map[id]]) btns[map[id]].classList.add('act');

  // If going to dash, reset to overview panel
  if (id === 'dash') {
    document.querySelectorAll('.dpanel').forEach(d => d.classList.remove('act'));
    var ov = document.getElementById('dp-vue');
    if (ov) ov.classList.add('act');
    document.querySelectorAll('.sb-menu a').forEach(a => a.classList.remove('act'));
    var sm = document.getElementById('sm-vue');
    if (sm) sm.classList.add('act');
    _supabase.auth.getUser().then(function(r) {
      if (!r.data.user) return;
      var user = r.data.user;
      var name = (user.user_metadata && user.user_metadata.full_name) ? user.user_metadata.full_name : user.email;
      var initials = name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0,2);
      var el = document.getElementById('sb-name');
      var av = document.getElementById('sb-avatar');
      var gr = document.getElementById('dash-greeting');
      if (el) el.textContent = name;
      if (av) av.textContent = initials;
      if (gr) gr.textContent = name.split(' ')[0] + ',';
      var since = new Date(user.created_at).getFullYear();
      var sinceEl = document.querySelector('.sb-type');
      if (sinceEl) sinceEl.textContent = 'Privatkunde - Kunde seit ' + since;
      loadDashboard();
    });
  }

  closeNotif();
  window.scrollTo(0, 0);
}

/* ---- Dashboard tab router ---- */
function dashTab(t) {
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('act'));
  var pg = document.getElementById('pg-dash');
  if (pg) pg.classList.add('act');
  document.querySelectorAll('.dpanel').forEach(d => d.classList.remove('act'));
  var el = document.getElementById('dp-' + t);
  if (el) el.classList.add('act');
  document.querySelectorAll('.sb-menu a').forEach(a => a.classList.remove('act'));
  var sm = document.getElementById('sm-' + t);
  if (sm) sm.classList.add('act');
  if (t === 'dossier') { loadDashboard(); }
  window.scrollTo(0, 0);
}

/* ---- Home segment switcher ---- */
function switchSeg(s) {
  document.getElementById('sg-p').classList.toggle('act', s === 'p');
  document.getElementById('sg-e').classList.toggle('act', s === 'e');
  document.getElementById('ct-p').style.display = s === 'p' ? 'block' : 'none';
  document.getElementById('ct-e').style.display = s === 'e' ? 'block' : 'none';
}

/* ---- Auth tabs ---- */
function authTab(t) {
  document.getElementById('at-c').classList.toggle('act', t === 'c');
  document.getElementById('at-n').classList.toggle('act', t === 'n');
  document.getElementById('a-c').style.display = t === 'c' ? 'block' : 'none';
  document.getElementById('a-n').style.display = t === 'n' ? 'block' : 'none';
}

/* ---- Apply multi-step form ---- */
function applyStep(n) {
  for (let i = 1; i <= 4; i++) {
    const f  = document.getElementById('af' + i);
    const sp = document.getElementById('ap' + i);
    if (f)  f.classList.toggle('act', i === n);
    if (sp) {
      sp.classList.remove('act', 'done');
      if (i < n) sp.classList.add('done');
      else if (i === n) sp.classList.add('act');
    }
  }
  // Update summary panel
  updateSummary(n);
}

function updateSummary(step) {
  const stepNames = ['', 'Projet', 'Identité', 'Finances', 'Documents'];
  const prog = document.getElementById('apply-progress');
  if (prog) prog.textContent = 'Étape ' + step + ' / 4 — ' + stepNames[step];
}

/* ---- Notification panel ---- */
function toggleNotif() {
  document.getElementById('notif-panel').classList.toggle('open');
}
function closeNotif() {
  const p = document.getElementById('notif-panel');
  if (p) p.classList.remove('open');
}

// Close notif on outside click
document.addEventListener('click', function(e) {
  const panel = document.getElementById('notif-panel');
  const bell  = document.getElementById('nbell');
  if (panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
    closeNotif();
  }
});

/* ---- Product card selection ---- */
function selectProd(el) {
  el.closest('.pgrid, .products-grid, .grid-auto')
    ?.querySelectorAll('.prod-card')
    .forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

/* ---- Initialize on load ---- */
function toggleMobileMenu() {
  var menu = document.getElementById('mobile-menu');
  var btn  = document.getElementById('hamburger');
  if (menu) menu.classList.toggle('open');
  if (btn)  btn.classList.toggle('open');
}

function closeMobileMenu() {
  var menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.remove('open');
}

async function doLogin() {
  var email    = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;
  var errEl    = document.getElementById('login-error');
  if (!email || !password) { errEl.textContent = 'Bitte alle Felder ausfullen.'; errEl.style.display = 'block'; return; }
  var btn = document.getElementById('btn-login');
  btn.textContent = '...'; btn.disabled = true;
  var result = await _supabase.auth.signInWithPassword({ email: email, password: password });
  if (result.error) { errEl.textContent = 'E-Mail oder Passwort falsch.'; errEl.style.display = 'block'; btn.textContent = 'Zu meinem Bereich'; btn.disabled = false; return; }
  errEl.style.display = 'none';
  goPage('dash');
  setTimeout(function() {
    var user = result.data.user;
    var name = (user.user_metadata && user.user_metadata.full_name) ? user.user_metadata.full_name : user.email;
    var initials = name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0,2);
    var el = document.getElementById('sb-name');
    var av = document.getElementById('sb-avatar');
    var gr = document.getElementById('dash-greeting');
    if (el) el.textContent = name;
    if (av) av.textContent = initials;
    if (gr) gr.textContent = name.split(' ')[0] + ',';
  }, 100);
}

async function doRegister() {
  var email    = document.getElementById('reg-email').value.trim();
  var password = document.getElementById('reg-password').value;
  var fname    = document.getElementById('reg-fname').value.trim();
  var lname    = document.getElementById('reg-lname').value.trim();
  var errEl    = document.getElementById('reg-error');
  if (!email || !password || !fname || !lname) { errEl.textContent = 'Bitte alle Felder ausfullen.'; errEl.style.display = 'block'; return; }
  var btn = document.getElementById('btn-register');
  btn.textContent = '...'; btn.disabled = true;
  var result = await _supabase.auth.signUp({
    email: email, password: password,
    options: { data: { full_name: fname + ' ' + lname, role: 'client' } }
  });
  if (result.error) { errEl.textContent = 'Fehler: ' + result.error.message; errEl.style.display = 'block'; btn.textContent = 'Konto erstellen'; btn.disabled = false; return; }
  errEl.style.background = '#EAF3DE'; errEl.style.color = '#27500A'; errEl.style.borderColor = '#3B6D11';
  errEl.textContent = 'Bestaetigen Sie Ihre E-Mail. Bitte pruefen Sie Ihr Postfach.';
  errEl.style.display = 'block'; btn.textContent = 'Konto erstellen'; btn.disabled = false;
}

async function doLogout() {
  await _supabase.auth.signOut();
  goPage('home');
}

async function doLogin() {
  var email    = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;
  var errEl    = document.getElementById('login-error');
  if (!email || !password) { errEl.textContent = 'Bitte alle Felder ausfullen.'; errEl.style.display = 'block'; return; }
  var btn = document.getElementById('btn-login');
  btn.textContent = '...'; btn.disabled = true;
  var result = await _supabase.auth.signInWithPassword({ email: email, password: password });
  if (result.error) { errEl.textContent = 'E-Mail oder Passwort falsch.'; errEl.style.display = 'block'; btn.textContent = 'Zu meinem Bereich'; btn.disabled = false; return; }
  errEl.style.display = 'none';
  goPage('dash');
}

async function doRegister() {
  var email    = document.getElementById('reg-email').value.trim();
  var password = document.getElementById('reg-password').value;
  var confirm  = document.getElementById('reg-password-confirm').value;
  var fname    = document.getElementById('reg-fname').value.trim();
  var lname    = document.getElementById('reg-lname').value.trim();
  var errEl    = document.getElementById('reg-error');
  errEl.style.display = 'none';
  if (!email || !password || !fname || !lname) { errEl.style.background='#FCEBEB'; errEl.style.color='#791F1F'; errEl.textContent = 'Bitte alle Felder ausfullen.'; errEl.style.display = 'block'; return; }
  if (password !== confirm) { errEl.style.background='#FCEBEB'; errEl.style.color='#791F1F'; errEl.textContent = 'Die Passwoerter stimmen nicht ueberein.'; errEl.style.display = 'block'; return; }
  if (password.length < 8) { errEl.style.background='#FCEBEB'; errEl.style.color='#791F1F'; errEl.textContent = 'Das Passwort muss mindestens 8 Zeichen haben.'; errEl.style.display = 'block'; return; }
  var btn = document.getElementById('btn-register');
  btn.textContent = '...'; btn.disabled = true;
  var result = await _supabase.auth.signUp({ email: email, password: password, options: { data: { full_name: fname + ' ' + lname, role: 'client' } } });
  if (result.error) { errEl.style.background='#FCEBEB'; errEl.style.color='#791F1F'; errEl.textContent = 'Fehler: ' + result.error.message; errEl.style.display = 'block'; btn.textContent = 'Konto erstellen'; btn.disabled = false; return; }
  errEl.style.background = '#EAF3DE'; errEl.style.color = '#27500A'; errEl.style.borderColor = '#3B6D11';
  errEl.textContent = 'Konto erstellt! Bitte bestaetigen Sie Ihre E-Mail-Adresse.';
  errEl.style.display = 'block'; btn.textContent = 'Konto erstellen'; btn.disabled = false;
}

async function doLogout() {
  await _supabase.auth.signOut();
  goPage('home');
}

async function submitLoan() {
  var user = await _supabase.auth.getUser();
  if (!user.data.user) { goPage('auth'); return; }

  var type     = document.querySelector('#af1 select').value;
  var amount   = document.querySelector('#af1 input[type="number"]').value;
  var duration = document.querySelectorAll('#af1 select')[1].value;
  var purpose  = document.querySelector('#af1 input[type="text"]').value;

  var btn = document.querySelector('#af4 .btn-gold');
  btn.textContent = '...'; btn.disabled = true;

  var ref = 'BM-' + Date.now().toString().slice(-8);

  var result = await _supabase.from('loans').insert({
    user_id:   user.data.user.id,
    reference: ref,
    type:      type,
    amount:    parseFloat(amount) || 0,
    duration:  parseInt(duration) || 36,
    status:    'pending'
  });

  if (result.error) {
    alert('Fehler: ' + result.error.message);
    btn.textContent = 'Antrag einreichen';
    btn.disabled = false;
    return;
  }

  btn.textContent = 'Antrag einreichen';
  btn.disabled = false;
  goPage('dash');
}

function renderTimeline(status) {
  var steps = [
    { key:'pending',   label:'Antrag eingereicht' },
    { key:'reviewing', label:'Dokumentenpruefung' },
    { key:'analysis',  label:'Aktenanalyse' },
    { key:'approved',  label:'Grundsatzentscheidung' },
    { key:'fees',      label:'Gebuehrenzahlung' },
    { key:'signed',    label:'Vertragsunterzeichnung' },
    { key:'funded',    label:'Auszahlung der Mittel' },
    { key:'active',    label:'Rueckzahlung' },
  ];

  var order = ['pending','reviewing','analysis','approved','fees','signed','funded','active'];
  var currentIndex = order.indexOf(status);
  if (currentIndex === -1) currentIndex = 0;

  var html = '<div class="tl">';
  steps.forEach(function(step, i) {
    var dotClass = i < currentIndex ? 'done' : (i === currentIndex ? 'now' : 'wait');
    var lblClass = i === currentIndex ? 'active-step' : (i < currentIndex ? '' : 'pending-step');
    html += '<div class="tl-it">';
    html += '<div class="tl-dot ' + dotClass + '"></div>';
    html += '<div class="tl-lb ' + lblClass + '">' + step.label + '</div>';
    html += '</div>';
  });
  html += '</div>';

  var container = document.getElementById('loan-timeline');
  if (container) container.innerHTML = html;
}

async function loadDashboard() {
  var userResult = await _supabase.auth.getUser();
  if (!userResult.data.user) return;
  var userId = userResult.data.user.id;

  var { data: loans } = await _supabase
    .from('loans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!loans || loans.length === 0) return;
  var loan = loans[0];
  renderTimeline(loan.status || 'pending');

var statusLabels = { pending:'Antrag eingereicht', reviewing:'Dokumentenpruefung', analysis:'Aktenanalyse', approved:'Grundsatzentscheidung', fees:'Gebuehrenzahlung', signed:'Vertragsunterzeichnung', funded:'Auszahlung der Mittel', active:'In Rueckzahlung', rejected:'Abgelehnt' };
  var statusLabel = statusLabels[loan.status] || 'Antrag eingereicht';

  var r2 = (loan.rate || 3.9) / 100 / 12;
  var d2 = loan.duration || 36;
  var a2 = loan.amount || 0;
  var monthly2 = r2 === 0 ? a2/d2 : a2*r2*Math.pow(1+r2,d2)/(Math.pow(1+r2,d2)-1);
  var interest2 = monthly2 * d2 - a2;

  var el;
  el = document.getElementById('dossier-ref'); if (el) el.textContent = loan.reference || '—';
  el = document.getElementById('dossier-status'); if (el) el.textContent = statusLabel;
  el = document.getElementById('d-ref');      if (el) el.textContent = loan.reference || '—';
  el = document.getElementById('d-type');     if (el) el.textContent = loan.type || '—';
  el = document.getElementById('d-amount');   if (el) el.textContent = Math.round(a2).toLocaleString('de-DE') + ' EUR';
  el = document.getElementById('d-rate');     if (el) el.textContent = (loan.rate || 3.9) + ' %';
  el = document.getElementById('d-duration'); if (el) el.textContent = d2 + ' Monate';
  el = document.getElementById('d-monthly');  if (el) el.textContent = Math.round(monthly2).toLocaleString('de-DE') + ' EUR';
  el = document.getElementById('d-total');    if (el) el.textContent = Math.round(interest2).toLocaleString('de-DE') + ' EUR';

  el = document.getElementById('d-progress-pct'); if (el) el.textContent = progress + ' %';
  el = document.getElementById('d-progress-bar'); if (el) el.style.width = progress + '%';
  el = document.getElementById('d-repaid');       if (el) el.firstChild.textContent = Math.round(paidAmount).toLocaleString('de-DE') + ' EUR ';
  el = document.getElementById('d-remaining');    if (el) el.firstChild.textContent = remaining.toLocaleString('de-DE') + ' EUR ';
   
  var dossierRef = document.getElementById('dossier-ref');
  if (dossierRef) dossierRef.textContent = (loan.type || '—') + ' - ' + Math.round(a2).toLocaleString('de-DE') + ' EUR - Ref. ' + (loan.reference || '—');
  var { data: payments } = await _supabase
    .from('payments')
    .select('*')
    .eq('loan_id', loan.id)
    .order('due_date', { ascending: false });

  var r = (loan.rate || 3.9) / 100 / 12;
  var d = loan.duration || 36;
  var a = loan.amount || 0;
  var monthly = r === 0 ? a/d : a*r*Math.pow(1+r,d)/(Math.pow(1+r,d)-1);
  var paid = payments ? payments.filter(function(p) { return p.status === 'paid'; }).length : 0;
  var paidAmount = payments ? payments.filter(function(p) { return p.status === 'paid'; }).reduce(function(s,p) { return s + p.amount; }, 0) : 0;
  var remaining = Math.round(a - paidAmount);
  var progress = a > 0 ? Math.round((paidAmount / a) * 100) : 0;

 var el2;
  el2 = document.getElementById('vue-active');       if (el2) el2.textContent = loans.length;
  el2 = document.getElementById('vue-amount');       if (el2) el2.textContent = Math.round(a).toLocaleString('de-DE') + ' EUR';
  el2 = document.getElementById('vue-type');         if (el2) el2.textContent = loan.type;
  el2 = document.getElementById('vue-progress');     if (el2) el2.textContent = progress + ' %';
  el2 = document.getElementById('vue-installments'); if (el2) el2.textContent = paid + ' / ' + d + ' Raten';

  var monthlyEl = document.querySelector('.met:nth-child(3) .mv');
  if (monthlyEl) monthlyEl.textContent = Math.round(monthly).toLocaleString('de-DE') + ' EUR';

  var progFill = document.querySelector('.prog-fill');
  if (progFill) progFill.style.width = progress + '%';

  var repaidEl    = document.querySelector('.prog-bar + div span:first-child');
  var remainingEl = document.querySelector('.prog-bar + div span:last-child');
  if (repaidEl)    repaidEl.textContent    = Math.round(paidAmount).toLocaleString('de-DE') + ' EUR zurueckgezahlt';
  if (remainingEl) remainingEl.textContent = remaining.toLocaleString('de-DE') + ' EUR verbleibend';

  if (payments && payments.length > 0) {
    var tbody = document.querySelector('#dp-vue .dbox:nth-child(2)');
    if (tbody) {
      var html = '<div class="dbox-h" data-i18n="dash.last_dues">Letzte Faelligkeiten</div>';
      payments.slice(0, 4).forEach(function(p) {
        var date = p.due_date ? new Date(p.due_date).toLocaleDateString('de-DE', {day:'numeric', month:'long', year:'numeric'}) : '—';
        var badge = p.status === 'paid'
          ? '<span class="badge badge-ok">Bezahlt</span>'
          : '<span class="badge badge-warn">Bevorstehend</span>';
        html += '<div class="lr"><div><div class="ln">Rate ' + date + '</div><div class="lm">Kapital ' + Math.round(p.capital||0) + ' EUR - Zinsen ' + Math.round(p.interest||0) + ' EUR</div></div>' + badge + '</div>';
      });
      tbody.innerHTML = html;
 }
  }

  var nextDueEl = document.getElementById('next-due-date');
  if (nextDueEl) {
    if (payments && payments.length > 0) {
      var upcoming = payments.find(function(p) { return p.status !== 'paid'; });
      if (upcoming && upcoming.due_date) {
        var d = new Date(upcoming.due_date);
        nextDueEl.textContent = d.toLocaleDateString('de-DE', {day:'numeric', month:'long', year:'numeric'});
      } else {
        nextDueEl.textContent = '—';
      }
    } else {
      nextDueEl.textContent = '—';
   }
  }

  var nextDueAmountEl = document.getElementById('next-due-amount');
  if (nextDueAmountEl) {
    if (payments && payments.length > 0) {
      var upcomingAmt = payments.find(function(p) { return p.status !== 'paid'; });
      if (upcomingAmt) {
        nextDueAmountEl.textContent = Math.round(upcomingAmt.amount).toLocaleString('de-DE') + ' EUR';
      } else {
        nextDueAmountEl.textContent = '—';
      }
    } else {
      nextDueAmountEl.textContent = '—';
    }
  }

  var dueNotif = document.getElementById('due-amount-notif');
  if (dueNotif) {
    if (payments && payments.length > 0) {
      var next = payments.find(function(p) { return p.status !== 'paid'; });
      if (next) {
        var nd = new Date(next.due_date);
        dueNotif.textContent = Math.round(next.amount).toLocaleString('de-DE') + ' EUR am ' + nd.toLocaleDateString('de-DE', {day:'numeric', month:'long'});
      } else {
        dueNotif.textContent = '—';
      }
    } else {
      dueNotif.textContent = '—';
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  goPage('home');

  setTimeout(function() {
    var lsm = document.getElementById('lang-selector-mobile');
    var ls  = document.getElementById('lang-selector');
    if (lsm && ls) { lsm.innerHTML = ls.innerHTML; }
  }, 500);
});
