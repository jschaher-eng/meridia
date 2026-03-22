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
    const ov = document.getElementById('dp-vue');
    if (ov) ov.classList.add('act');
    document.querySelectorAll('.sb-menu a').forEach(a => a.classList.remove('act'));
    const sm = document.getElementById('sm-vue');
    if (sm) sm.classList.add('act');
  }

  closeNotif();
  window.scrollTo(0, 0);
}

/* ---- Dashboard tab router ---- */
function dashTab(t) {
  document.querySelectorAll('.dpanel').forEach(d => d.classList.remove('act'));
  const el = document.getElementById('dp-' + t);
  if (el) el.classList.add('act');

  document.querySelectorAll('.sb-menu a').forEach(a => a.classList.remove('act'));
  const sm = document.getElementById('sm-' + t);
  if (sm) sm.classList.add('act');

  goPage('dash');
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
  var user = result.data.user;
  var name = (user.user_metadata && user.user_metadata.full_name) ? user.user_metadata.full_name : user.email;
  var initials = name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0,2);
  var el = document.getElementById('sb-name');
  var av = document.getElementById('sb-avatar');
  var gr = document.getElementById('dash-greeting');
  if (el) el.textContent = name;
  if (av) av.textContent = initials;
  if (gr) gr.textContent = name.split(' ')[0] + ',';
  goPage('dash');
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

document.addEventListener('DOMContentLoaded', function() {
  goPage('home');

  setTimeout(function() {
    var lsm = document.getElementById('lang-selector-mobile');
    var ls  = document.getElementById('lang-selector');
    if (lsm && ls) { lsm.innerHTML = ls.innerHTML; }
  }, 500);
});
