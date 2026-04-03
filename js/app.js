/* =========================================
   MERIDIA — app.js
   Navigation · Pages · Notifications
   ========================================= */

'use strict';
var applyData = {
  email: '', fname: '', lname: '', phone: '', 
  city: '', postal_code: '', street: '', country: '',
  type: '', amount: 0, duration: 36, income: 0, charges: 0
};

/* ---- Page router ---- */
function goPage(id) {
  /* Fade out pages actives */
  document.querySelectorAll('.pg.act').forEach(function(p) {
    p.style.opacity = '0';
  });

  setTimeout(function() {
    document.querySelectorAll('.pg').forEach(function(p) { p.classList.remove('act'); });
    var el = document.getElementById('pg-' + id);
    if (el) {
      el.classList.add('act');
      setTimeout(function() { el.style.opacity = '1'; }, 10);
    }

    document.querySelectorAll('.nav-link').forEach(function(b) { b.classList.remove('act'); });
    var map = { home:0, prods:1, sim:2, apply:3 };
    var btns = document.querySelectorAll('.nav-link');
    if (map[id] !== undefined && btns[map[id]]) btns[map[id]].classList.add('act');

    if (id === 'dash') {
      /* Ne réinitialiser que si pas de hash panel */
      if (!window.location.hash.startsWith('#dash/')) {
        document.querySelectorAll('.dpanel').forEach(function(d) { d.classList.remove('act'); });
        var ov = document.getElementById('dp-vue');
        if (ov) ov.classList.add('act');
      }
      if (!window.location.hash.startsWith('#dash/')) {
        document.querySelectorAll('.sb-menu a').forEach(function(a) { a.classList.remove('act'); });
        var sm = document.getElementById('sm-vue');
        if (sm) sm.classList.add('act');
      }

      _supabase.auth.getUser().then(function(r) {
        if (!r.data.user) return;
        var user = r.data.user;
        var name = (user.user_metadata && user.user_metadata.full_name) ? user.user_metadata.full_name : user.email;
        var initials = name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0,2);
        var elName = document.getElementById('sb-name');
        var av = document.getElementById('sb-avatar');
        var gr = document.getElementById('dash-greeting');
        if (elName) elName.textContent = name;
        if (av)     av.textContent     = initials;
        if (gr)     gr.textContent     = name.split(' ')[0] + ',';
        var since = new Date(user.created_at).getFullYear();
        var sinceEl = document.querySelector('.sb-type');
        if (sinceEl) sinceEl.textContent = 'Privatkunde - Kunde seit ' + since;
        loadDashboard();
        loadLastMessages();
      });

      /* Cacher toute la navigation quand connecté */
      var mainNav = document.querySelector('.main-nav');
      var topBar  = document.querySelector('.topbar');
      if (mainNav) mainNav.style.display = 'none';
      if (topBar)  topBar.style.display  = 'none';
      document.querySelectorAll('.mobile-menu button').forEach(function(btn) {
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes('auth')) {
          btn.style.display = 'none';
        }
      });
    }

    closeNotif();
    window.scrollTo(0, 0);
  }, 200);
   if (window.location.hash !== '#' + id) {
    history.pushState({ page: id }, '', '#' + id);
  }
}

function showLoader(show) {
  var loader = document.getElementById('page-loader');
  if (loader) loader.style.display = show ? 'flex' : 'none';
}
/* ---- Dashboard tab router ---- */
function dashTab(t) {
  document.querySelectorAll('.pg').forEach(function(p) { p.classList.remove('act'); });
  var pg = document.getElementById('pg-dash');
  if (pg) pg.classList.add('act');
  document.querySelectorAll('.dpanel').forEach(function(d) { d.classList.remove('act'); });
  var el = document.getElementById('dp-' + t);
  if (el) el.classList.add('act');
  document.querySelectorAll('.sb-menu a').forEach(function(a) { a.classList.remove('act'); });
  var sm = document.getElementById('sm-' + t);
  if (sm) sm.classList.add('act');

  /* Mettre à jour la grille mobile */
  document.querySelectorAll('.dmn-item').forEach(function(d) { d.classList.remove('act'); });
  var dmn = document.getElementById('dmn-' + t);
  if (dmn) dmn.classList.add('act');

  /* Gérer l'historique du navigateur */
  var newHash = '#dash/' + t;
  if (window.location.hash !== newHash) {
    history.pushState({ panel: t }, '', newHash);
  }

  /* Cacher/montrer la nav mobile - seulement sur mobile */
  if (window.innerWidth <= 768) {
    var mobileNav = document.getElementById('dash-mobile-nav');
    if (mobileNav) {
      mobileNav.style.display = t === 'vue' ? '' : 'none';
    }
  }

  if (t === 'dossier')  { loadDashboard(); }
  if (t === 'messages') { loadClientMessages(); }
  if (t === 'docs')     { loadClientDocuments(); }
  if (t === 'alertes')  { loadNotifications(); }
  if (t === 'profil')   { loadDashboard(); }
  if (t === 'securite') { loadSecurityInfo(); }
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
  /* Validation de l'étape courante */
  var currentStep = null;
  for (var i = 1; i <= 4; i++) {
    var f = document.getElementById('af' + i);
    if (f && f.classList.contains('act')) { currentStep = i; break; }
  }

  if (currentStep && n > currentStep) {
    var errors = [];

    if (currentStep === 1) {
      var type = document.querySelector('#af1 select')?.value;
      var amount = document.querySelector('#af1 input[type="number"]')?.value;
      var duration = document.querySelectorAll('#af1 select')[2]?.value;
      if (!type) errors.push('Bitte wählen Sie einen Kredittyp.');
      if (!amount || amount <= 0) errors.push('Bitte geben Sie einen Betrag ein.');
      if (!duration) errors.push('Bitte wählen Sie eine Laufzeit.');
    }

    if (currentStep === 2) {
      var fname = document.querySelectorAll('#af2 .fg-row input')[0]?.value.trim();
      var lname = document.querySelectorAll('#af2 .fg-row input')[1]?.value.trim();
      var email = document.querySelector('#af2 input[type="email"]')?.value.trim();
      var phone = document.querySelector('#af2 input[type="tel"]')?.value.trim();
      if (!fname) errors.push('Bitte geben Sie Ihren Vornamen ein.');
      if (!lname) errors.push('Bitte geben Sie Ihren Nachnamen ein.');
      if (!email) errors.push('Bitte geben Sie Ihre E-Mail-Adresse ein.');
      if (!phone) errors.push('Bitte geben Sie Ihre Telefonnummer ein.');
    }

    if (currentStep === 3) {
      var income = document.querySelectorAll('#af3 input[type="number"]')[0]?.value;
      if (!income || income <= 0) errors.push('Bitte geben Sie Ihr monatliches Einkommen ein.');
    }

    if (errors.length > 0) {
      showToast(errors[0]);
      /* Mettre en évidence les champs vides */
      highlightEmptyFields(currentStep);
      return;
    }
  }

  // Sauvegarder les données de l'étape courante
  if (document.getElementById('af1') && document.getElementById('af1').classList.contains('act')) {
    applyData.type     = document.querySelector('#af1 select')?.value || '';
    applyData.amount   = parseFloat(document.querySelector('#af1 input[type="number"]')?.value) || 0;
    applyData.duration = parseInt(document.querySelectorAll('#af1 select')[2]?.value) || 36;
  }
  if (document.getElementById('af2') && document.getElementById('af2').classList.contains('act')) {
    applyData.fname       = document.querySelectorAll('#af2 .fg-row input')[0]?.value.trim() || '';
    applyData.lname       = document.querySelectorAll('#af2 .fg-row input')[1]?.value.trim() || '';
    applyData.email       = document.querySelector('#af2 input[type="email"]')?.value.trim() || '';
    applyData.phone       = document.querySelector('#af2 input[type="tel"]')?.value || '';
    applyData.street      = document.querySelector('#af2 input[placeholder="Friedrichstrasse 100"]')?.value || '';
    applyData.postal_code = document.querySelector('#af2 input[placeholder="10115"]')?.value || '';
    applyData.city        = document.querySelector('#af2 input[placeholder="Berlin"]')?.value || '';
    applyData.country     = document.querySelectorAll('#af2 select')[1]?.value || 'Deutschland';
    applyData.birthdate    = document.querySelector('#af2 input[type="date"]')?.value || null;
    applyData.nationality  = document.querySelectorAll('#af2 select')[0]?.value || null;
  }
  if (document.getElementById('af3') && document.getElementById('af3').classList.contains('act')) {
    applyData.income   = parseFloat(document.querySelectorAll('#af3 input[type="number"]')[0]?.value) || 0;
    applyData.charges  = parseFloat(document.querySelectorAll('#af3 input[type="number"]')[2]?.value) || 0;
  }

  for (var i = 1; i <= 4; i++) {
    var f  = document.getElementById('af' + i);
    var sp = document.getElementById('ap' + i);
    if (f) {
      if (i === n) {
        f.classList.remove('act');
        setTimeout(function(panel) {
          return function() {
            panel.classList.add('act');
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(10px)';
            setTimeout(function() {
              panel.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
              panel.style.opacity = '1';
              panel.style.transform = 'translateY(0)';
            }, 10);
          };
        }(f), 50);
      } else {
        f.classList.remove('act');
        f.style.transition = '';
        f.style.opacity = '';
        f.style.transform = '';
      }
    }
    if (sp) {
      sp.classList.remove('act', 'done');
      if (i < n)        sp.classList.add('done');
      else if (i === n) sp.classList.add('act');
    }
  }
  if (n === 4) {
    var emailInput = document.querySelector('#af2 input[type="email"]');
    var display = document.getElementById('apply-email-display');
    if (emailInput && display) display.textContent = emailInput.value || '—';
    
    /* Soumettre la demande automatiquement */
    submitLoanRequest().then(function(ref) {
      if (ref) {
        applyData.currentRef = ref;
        /* Mettre à jour la page de confirmation */
        var confirmRef = document.getElementById('confirm-ref');
        if (confirmRef) confirmRef.textContent = ref;
        var refDisplay = document.getElementById('apply-ref-display');
        if (refDisplay) refDisplay.textContent = ref;
        var confirmType = document.getElementById('confirm-type');
        if (confirmType) confirmType.textContent = applyData.type;
        var confirmAmount = document.getElementById('confirm-amount');
        if (confirmAmount) confirmAmount.textContent = Math.round(applyData.amount).toLocaleString('de-DE') + ' EUR';
        var confirmDuration = document.getElementById('confirm-duration');
        if (confirmDuration) confirmDuration.textContent = applyData.duration + ' Monate';
        var confirmEmail = document.getElementById('confirm-email');
        if (confirmEmail) confirmEmail.textContent = applyData.email;
      }
    });
  }
  // Update summary panel
  updateSummary(n);
}

function highlightEmptyFields(step) {
  var panel = document.getElementById('af' + step);
  if (!panel) return;
  panel.querySelectorAll('input, select').forEach(function(el) {
    if (!el.value || el.value.trim() === '') {
      el.style.borderColor = '#A32D2D';
      el.style.background = '#FCEBEB';
      el.addEventListener('input', function() {
        el.style.borderColor = '';
        el.style.background = '';
      }, { once: true });
    }
  });
}

function updateSummary(step) {
  var type     = document.querySelector('#af1 select')?.value || '—';
  var amount   = document.querySelector('#af1 input[type="number"]')?.value || '—';
  var duration = document.querySelectorAll('#af1 select')[2]?.value || '—';
  var profile  = document.querySelectorAll('#af1 select')[1]?.value || '—';

  var sumType     = document.getElementById('sum-type');
  var sumProfile  = document.getElementById('sum-profile');
  var sumAmount   = document.getElementById('sum-amount');
  var sumDuration = document.getElementById('sum-duration');
  var sumMonthly  = document.querySelector('.sa');

  if (sumType)     sumType.textContent     = type;
  if (sumProfile)  sumProfile.textContent  = profile;
  if (sumAmount)   sumAmount.textContent   = amount ? parseInt(amount).toLocaleString('de-DE') + ' EUR' : '—';
  if (sumDuration) sumDuration.textContent = duration;

  if (sumMonthly && amount && duration) {
    var r = 3.9 / 100 / 12;
    var d = parseInt(duration) || 36;
    var a = parseFloat(amount) || 0;
    var monthly = r === 0 ? a/d : a*r*Math.pow(1+r,d)/(Math.pow(1+r,d)-1);
    sumMonthly.textContent = Math.round(monthly).toLocaleString('de-DE') + ' EUR';
  }
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
  showLoader(false);
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
  showLoader(false);
  await _supabase.auth.signOut();
  showLoader(false);
  /* Réafficher les boutons */
  var btnLogin    = document.querySelector('.btn-outline.btn-sm[onclick*="auth"]');
  var btnRegister = document.querySelector('.btn-primary.btn-sm[onclick*="auth"]');
  if (btnLogin)    btnLogin.style.display    = '';
  if (btnRegister) btnRegister.style.display = '';
  goPage('home');
   /* Réafficher la navigation */
      var mainNav = document.querySelector('.main-nav');
      var topBar  = document.querySelector('.topbar');
      if (mainNav) mainNav.style.display = '';
      if (topBar)  topBar.style.display  = '';
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

/* Étape 4 — Soumettre la demande SANS compte (au chargement de l'étape 4) */
async function submitLoanRequest() {
  var ref = 'BM-' + Date.now().toString().slice(-8);

  var { error } = await _supabase.from('loan_requests').insert({
    reference:   ref,
    type:        applyData.type,
    amount:      applyData.amount,
    duration:    applyData.duration,
    fname:       applyData.fname,
    lname:       applyData.lname,
    email:       applyData.email,
    phone:       applyData.phone,
    city:        applyData.city,
    postal_code: applyData.postal_code,
    income:      applyData.income,
    charges:     applyData.charges,
    status:      'pending'
  });

  if (error) { console.error('Erreur demande:', error.message); return null; }
  return ref;
}

/* Étape 4 — Créer le compte (optionnel) */
async function submitLoanWithAccount() {
  var password = document.getElementById('apply-password').value;
  var confirm  = document.getElementById('apply-password-confirm').value;
  var errEl    = document.getElementById('apply-account-error');
  var btn      = document.getElementById('btn-submit-apply');

  errEl.style.display = 'none';

  if (!password) { errEl.textContent = 'Bitte geben Sie ein Passwort ein.'; errEl.style.display = 'block'; return; }
  if (password.length < 8) { errEl.textContent = 'Mindestens 8 Zeichen erforderlich.'; errEl.style.display = 'block'; return; }
  if (password !== confirm) { errEl.textContent = 'Passwoerter stimmen nicht ueberein.'; errEl.style.display = 'block'; return; }

  btn.textContent = '...'; btn.disabled = true;

  var signUpResult = await _supabase.auth.signUp({
    email: applyData.email,
    password: password,
    options: { data: { full_name: applyData.fname + ' ' + applyData.lname, role: 'client' } }
  });

  if (signUpResult.error) {
    errEl.textContent = 'Fehler: ' + signUpResult.error.message;
    errEl.style.display = 'block';
    btn.textContent = 'Konto erstellen & Antrag verfolgen';
    btn.disabled = false;
    return;
  }

  var userId = signUpResult.data.user.id;

  await _supabase.from('profiles').upsert({
    id:              userId,
    full_name:       applyData.fname + ' ' + applyData.lname,
    email:           applyData.email,
    phone:           applyData.phone || null,
    city:            applyData.city || null,
    postal_code:     applyData.postal_code || null,
    monthly_income:  applyData.income || null,
    monthly_charges: applyData.charges || null,
    street:          applyData.street || null,
    country:         applyData.country || null,
    birthdate:    applyData.birthdate || null,
    nationality:  applyData.nationality || null,
  });

  await _supabase.from('loans').insert({
    user_id:   userId,
    reference: applyData.currentRef || ('BM-' + Date.now().toString().slice(-8)),
    type:      applyData.type,
    amount:    applyData.amount,
    duration:  applyData.duration,
    status:    'pending'
  });

  await _supabase.from('loan_requests').update({ converted: true, user_id: userId })
    .eq('reference', applyData.currentRef);

  await _supabase.auth.signInWithPassword({ email: applyData.email, password: password });

  btn.textContent = 'Konto erstellen & Antrag verfolgen';
  btn.disabled = false;
  var btnConfirm = document.getElementById('btn-confirm-account');
  if (btnConfirm) btnConfirm.style.display = 'block';
  goPage('dash');
  loadDashboard();
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

  var profileResult = await _supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

 if (profileResult.data) {
    var p = profileResult.data;
    var pel;
    pel = document.getElementById('prof-name');  if (pel) pel.textContent = p.full_name || '—';
    pel = document.getElementById('prof-email'); if (pel) pel.textContent = p.email || '—';
    pel = document.getElementById('prof-phone'); if (pel) pel.textContent = p.phone || '—';
    pel = document.getElementById('prof-city');    if (pel) pel.textContent = (p.postal_code || '') + ' ' + (p.city || '—');
    pel = document.getElementById('prof-address'); if (pel) pel.textContent = p.street ? p.street + ', ' + (p.country || '') : '—';
    pel = document.getElementById('prof-income'); if (pel) pel.textContent = p.monthly_income ? Math.round(p.monthly_income).toLocaleString('de-DE') + ' EUR' : '—';
    pel = document.getElementById('prof-charges'); if (pel) pel.textContent = p.monthly_charges ? Math.round(p.monthly_charges).toLocaleString('de-DE') + ' EUR' : '—';
    pel = document.getElementById('prof-birthdate'); if (pel) pel.textContent = p.birthdate || '—';
    pel = document.getElementById('prof-nationality'); if (pel) pel.textContent = p.nationality || '—';
    pel = document.getElementById('prof-address'); if (pel) pel.textContent = (p.street ? p.street + ', ' : '') + (p.postal_code || '') + ' ' + (p.city || '') + (p.country ? ', ' + p.country : '');

    /* Score de crédit */
    var score = p.credit_score || 0;
    var scoreLabel = p.credit_score_label || '—';
    var scoreEl = document.querySelector('.score-n');
    var scoreLabelEl = document.querySelector('.score-l + div .fw-500, #dp-profil .score-excellent');
    var scoreNumEl = document.querySelector('#dp-profil .score-n');
    var scoreLblEl = document.querySelector('#dp-profil .score-excellent, #dp-profil [data-i18n="dash.score_excellent"]');
    var scoreBarEl = document.querySelector('#dp-profil .prog-fill');

    if (scoreNumEl) scoreNumEl.textContent = score;
    if (scoreLblEl) scoreLblEl.textContent = scoreLabel;
    if (scoreBarEl) scoreBarEl.style.width = Math.round((score / 850) * 100) + '%';
    var scoreDate = document.getElementById('score-updated-date');
    if (scoreDate && p.credit_score) {
      var today = new Date();
      scoreDate.textContent = 'Score aktualisiert am ' + today.toLocaleDateString('de-DE', {day:'numeric', month:'long', year:'numeric'});
    } else if (scoreDate) {
      scoreDate.textContent = 'Score noch nicht berechnet';
    }
  }
  var { data: loans } = await _supabase
    .from('loans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!loans || loans.length === 0) return;
  var loan = loans[0];
  var advisorName   = loan.advisor_name   || 'B-Mo Financial';
  var advisorAvatar = loan.advisor_avatar || 'BM';

  var advName = document.querySelector('#dp-vue .ln');
  var advAv   = document.querySelector('#dp-vue .dbox:last-child .sb-type');

  var advEl = document.getElementById('advisor-name');
  var avEl  = document.getElementById('advisor-avatar');
  if (advEl) advEl.textContent = advisorName;
  if (avEl)  avEl.textContent  = advisorAvatar;
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
  var paidAmountSafe = isNaN(paidAmount) ? 0 : (paidAmount || 0);
  var aSafe = isNaN(a) ? 0 : (a || 0);
  var remaining = Math.round(aSafe - paidAmountSafe);
  var progress = aSafe > 0 ? Math.round((paidAmountSafe / aSafe) * 100) : 0;

 var el2;
  el2 = document.getElementById('vue-active');       if (el2) el2.textContent = loans.length;
  el2 = document.getElementById('vue-amount');       if (el2) el2.textContent = Math.round(a).toLocaleString('de-DE') + ' EUR';
  el2 = document.getElementById('vue-type');         if (el2) el2.textContent = loan.type;
  el2 = document.getElementById('vue-progress');     if (el2) el2.textContent = progress + ' %';
  el2 = document.getElementById('vue-installments'); if (el2) el2.textContent = paid + ' / ' + d + ' Raten';
  el2 = document.getElementById('vue-progress-label'); if (el2) el2.textContent = paid + ' Raten von ' + d;
  el2 = document.getElementById('vue-repaid');    if (el2 && el2.firstChild) el2.firstChild.textContent = Math.round(paidAmount).toLocaleString('de-DE') + ' EUR ';
  el2 = document.getElementById('vue-remaining'); if (el2 && el2.firstChild) el2.firstChild.textContent = remaining.toLocaleString('de-DE') + ' EUR ';

  var vueProg = document.querySelector('#dp-vue .prog-fill');
  if (vueProg) vueProg.style.width = progress + '%';

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

   el = document.getElementById('d-progress-pct'); if (el) el.textContent = progress + ' %';
   el = document.getElementById('d-progress-bar'); if (el) el.style.width = progress + '%';
   el = document.getElementById('d-repaid');       if (el && el.firstChild) el.firstChild.textContent = Math.round(paidAmountSafe).toLocaleString('de-DE') + ' EUR ';
   el = document.getElementById('d-remaining');    if (el && el.firstChild) el.firstChild.textContent = remaining.toLocaleString('de-DE') + ' EUR ';

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
   loadLastMessages();

   /* Charger les notifications dans la vue d'ensemble */
  var { data: notifs } = await _supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(3);

  var notifContainer = document.getElementById('vue-notifications-preview');
  if (notifContainer) {
    if (!notifs || notifs.length === 0) {
      notifContainer.innerHTML = '<p style="font-size:12px;color:var(--text-muted)">Keine Benachrichtigungen.</p>';
    } else {
      notifContainer.innerHTML = notifs.map(function(n) {
        return '<div style="padding:8px 0;border-bottom:0.5px solid var(--border)">' +
          '<div style="font-size:12px;font-weight:500;color:var(--danger)">' + n.title + '</div>' +
          '<div style="font-size:11px;color:var(--text-muted);margin-top:2px">' + (n.message || '') + '</div>' +
          '</div>';
      }).join('');
    }
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  var { data: { session } } = await _supabase.auth.getSession();
  if (session) {
    var user = session.user;
    var name = (user.user_metadata && user.user_metadata.full_name) ? user.user_metadata.full_name : user.email;
    var initials = name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0,2);
    var el = document.getElementById('sb-name');
    var av = document.getElementById('sb-avatar');
    if (el) el.textContent = name;
    if (av) av.textContent = initials;
    var since = new Date(user.created_at).getFullYear();
    var sinceEl = document.querySelector('.sb-type');
    if (sinceEl) sinceEl.textContent = 'Privatkunde - Kunde seit ' + since;
    var savedPanel = window.location.hash.startsWith('#dash/') 
      ? window.location.hash.replace('#dash/', '') 
      : 'vue';

    goPage('dash');
    initRealtimeMessages();

    setTimeout(function() {
      /* Ajouter d'abord une entrée vue d'ensemble dans l'historique */
      if (savedPanel !== 'vue') {
        history.replaceState({ panel: 'vue' }, '', '#dash/vue');
        history.pushState({ panel: savedPanel }, '', '#dash/' + savedPanel);
      } else {
        history.replaceState({ panel: 'vue' }, '', '#dash/vue');
      }
      dashTab(savedPanel);
    }, 100);
  } else {
  /* Détecter la langue dans l'URL */
  var urlParams = new URLSearchParams(window.location.search);
  var langParam = urlParams.get('lang');
  if (langParam && I18N.supported[langParam]) {
    I18N.setLang(langParam);
  }

  var hash = window.location.hash.replace('#', '');
  if (hash && ['apply', 'sim', 'prods', 'auth'].includes(hash)) {
    goPage(hash);
  } else {
    goPage('home');
  }
}
   
  setTimeout(function() {
  var lsm = document.getElementById('lang-selector-mobile');
  var ls  = document.getElementById('lang-selector');
  if (lsm && ls) { 
    lsm.innerHTML = ls.innerHTML;
    /* Changer les IDs dans la copie mobile pour éviter les conflits */
    var mobileBtn = lsm.querySelector('#lang-current');
    var mobileDD  = lsm.querySelector('#lang-dropdown');
    if (mobileBtn) mobileBtn.id = 'lang-current-mobile';
    if (mobileDD)  mobileDD.id  = 'lang-dropdown-mobile';
    /* Corriger le onclick du bouton mobile */
    if (mobileBtn) mobileBtn.setAttribute('onclick', 'I18N.toggleDropdown()');
  }
}, 500);

// Mise à jour du récapitulatif en temps réel
  document.querySelectorAll('#af1 select, #af1 input').forEach(function(el) {
    el.addEventListener('change', function() { updateSummary(1); });
    el.addEventListener('input', function() { updateSummary(1); });
  });
  updateSummary(1);

});

window.addEventListener('pageshow', function(e) {
  if (e.persisted) {
    /* Page restaurée depuis le cache mobile */
    _supabase.auth.getSession().then(function(r) {
      if (r.data.session) {
        var savedPanel = window.location.hash.startsWith('#dash/') 
          ? window.location.hash.replace('#dash/', '') 
          : 'vue';
        goPage('dash');
        setTimeout(function() { dashTab(savedPanel); }, 100);
      }
    });
  }
});

window.addEventListener('popstate', function(e) {
  _supabase.auth.getSession().then(function(r) {
    var session = r.data.session;
    if (session) {
      /* Connecté — rester dans le dashboard */
      if (e.state && e.state.panel) {
        dashTab(e.state.panel);
      } else if (window.location.hash.startsWith('#dash/')) {
        var panel = window.location.hash.replace('#dash/', '');
        dashTab(panel);
      } else {
        dashTab('vue');
      }
    } else {
      /* Déconnecté — retourner au site */
      goPage('home');
    }
  });
});

window.addEventListener('beforeunload', function(e) {
  // Ne rien faire — laisser le navigateur gérer
});
