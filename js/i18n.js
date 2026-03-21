/* B-MO FINANCIAL - i18n.js v3
   Allemand integre - sans caracteres speciaux */

'use strict';

var I18N = {

  defaultLang: 'de',

  supported: {
    de: { label: 'Deutsch',     flag: 'DE' },
    fr: { label: 'Francais',    flag: 'FR' },
    en: { label: 'English',     flag: 'EN' },
    es: { label: 'Espanol',     flag: 'ES' },
    it: { label: 'Italiano',    flag: 'IT' },
    sl: { label: 'Slovenscina', flag: 'SL' },
    hr: { label: 'Hrvatski',    flag: 'HR' },
    ru: { label: 'Russkiy',     flag: 'RU' }
  },

  googleOnly: {
    pl: { label: 'Polski',      flag: 'PL' },
    cs: { label: 'Cestina',     flag: 'CZ' },
    hu: { label: 'Magyar',      flag: 'HU' },
    ro: { label: 'Romana',      flag: 'RO' },
    nl: { label: 'Nederlands',  flag: 'NL' },
    pt: { label: 'Portugues',   flag: 'PT' },
    tr: { label: 'Turkce',      flag: 'TR' },
    ar: { label: 'Arabe',       flag: 'AR' },
    zh: { label: 'Chinois',     flag: 'ZH' },
    ja: { label: 'Japonais',    flag: 'JA' }
  },

  de: {
    nav: {
      home: 'Startseite',
      loans: 'Unsere Kredite',
      simulator: 'Kreditrechner',
      apply: 'Online-Antrag',
      login: 'Anmelden',
      open_account: 'Konto eroeffnen',
      alerts: 'Benachrichtigungen'
    },
    hero: {
      title: 'Finanzieren Sie Ihre Projekte,',
      title_em: 'in Ihrem Tempo',
      subtitle: 'Privatkunden und Unternehmen: Nutzen Sie unsere Kreditloesungen und verfolgen Sie jeden Schritt in Ihrem gesicherten Bereich.',
      simulate: 'Kredit berechnen',
      discover: 'Unsere Angebote entdecken'
    },
    segments: {
      individuals: 'Privatkunden',
      business: 'Unternehmen und KMU'
    },
    products: {
      individuals_title: 'Loesungen fuer Privatkunden',
      individuals_sub: 'Finanzierungen fuer jeden Lebensabschnitt',
      business_title: 'Loesungen fuer Unternehmen',
      business_sub: 'Strukturierte Finanzierungen fuer Ihr Wachstum',
      personal_name: 'Privatkredit',
      personal_desc: 'Reisen, Renovierung, Ausstattung - ohne Verwendungsnachweis.',
      personal_rate: 'Ab 3,90 % effektiver Jahreszins',
      mortgage_name: 'Immobilienkredit',
      mortgage_desc: 'Kauf, Bau oder Renovierung.',
      mortgage_rate: 'Ab 3,20 % effektiver Jahreszins',
      auto_name: 'Autokredit',
      auto_desc: 'Neu- oder Gebrauchtfahrzeug, Benzin oder Elektro.',
      auto_rate: 'Ab 4,50 % effektiver Jahreszins',
      micro_name: 'Mikrofinanzierung',
      micro_desc: 'Kleine Betraege ohne komplexe Sicherheiten.',
      micro_rate: 'Ab 5,90 % effektiver Jahreszins'
    },
    simulator: {
      title: 'Kreditrechner',
      subtitle: 'Berechnen Sie Ihre monatliche Rate in Echtzeit, unverbindlich',
      amount: 'Kreditbetrag',
      duration: 'Laufzeit',
      rate: 'Jahreszins',
      apply_btn: 'Meinen Antrag stellen',
      monthly: 'Geschaetzte Monatsrate',
      capital: 'Kreditbetrag',
      interest: 'Gesamtzinsen',
      total: 'Gesamtrueckzahlung',
      debt_ratio: 'Verschuldungsgrad',
      disclaimer: 'Unverbindliche Simulation. Effektiver Jahreszins ohne Restschuldversicherung.'
    },
    auth: {
      title: 'Kundenbereich B-Mo Financial',
      login_tab: 'Anmelden',
      register_tab: 'Konto erstellen',
      login_btn: 'Zu meinem Bereich',
      create_btn: 'Konto erstellen',
      forgot: 'Passwort vergessen?'
    },
    footer: {
      copyright: '2025 B-Mo Financial. Alle Rechte vorbehalten.'
    }
  },

  currentLang: 'de',
  translations: {},

  init: function() {
    this.translations['de'] = this.de;
    var saved = localStorage.getItem('bmo_lang') || this.defaultLang;
    this.renderSelector();
    if (saved === 'de') {
      this.currentLang = 'de';
      this.applyTranslations();
      this.updateSelectorUI();
    } else {
      this.applyTranslations();
      this.setLang(saved);
    }
  },

  setLang: function(lang) {
    var self = this;

    if (this.googleOnly[lang]) {
      this.currentLang = lang;
      localStorage.setItem('bmo_lang', lang);
      this.applyGoogleTranslate(lang);
      this.updateSelectorUI();
      return;
    }

    if (lang === 'de') {
      this.removeGoogleTranslate();
      this.currentLang = 'de';
      localStorage.setItem('bmo_lang', 'de');
      this.applyTranslations();
      this.updateSelectorUI();
      return;
    }

    if (this.translations[lang]) {
      this.removeGoogleTranslate();
      this.currentLang = lang;
      localStorage.setItem('bmo_lang', lang);
      this.applyTranslations();
      this.updateSelectorUI();
      return;
    }

    fetch('locales/' + lang + '.json')
      .then(function(r) {
        if (!r.ok) { throw new Error('not found'); }
        return r.json();
      })
      .then(function(data) {
        self.translations[lang] = data;
        self.removeGoogleTranslate();
        self.currentLang = lang;
        localStorage.setItem('bmo_lang', lang);
        self.applyTranslations();
        self.updateSelectorUI();
      })
      .catch(function() {
        self.applyGoogleTranslate(lang);
      });
  },

  t: function(key) {
    var tr = this.translations[this.currentLang];
    if (!tr) { return ''; }
    var parts = key.split('.');
    var val = tr;
    for (var i = 0; i < parts.length; i++) {
      if (val === undefined || val === null) { return ''; }
      val = val[parts[i]];
    }
    return val || '';
  },

  applyTranslations: function() {
    var self = this;
    var els = document.querySelectorAll('[data-i18n]');
    els.forEach(function(el) {
      var val = self.t(el.getAttribute('data-i18n'));
      if (!val) { return; }
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.textContent = val;
      }
    });
  },

  applyGoogleTranslate: function(lang) {
    this.removeGoogleTranslate();
    document.cookie = 'googtrans=/auto/' + lang + '; path=/';

    var div = document.createElement('div');
    div.id = 'google_translate_element';
    div.style.display = 'none';
    document.body.appendChild(div);

    window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement({
        pageLanguage: 'de',
        includedLanguages: lang,
        autoDisplay: true
      }, 'google_translate_element');
    };

    var sc = document.createElement('script');
    sc.id = 'google-translate-script';
    sc.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(sc);
  },

  removeGoogleTranslate: function() {
    var el = document.getElementById('google_translate_element');
    if (el) { el.remove(); }
    var sc = document.getElementById('google-translate-script');
    if (sc) { sc.remove(); }
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  },

  updateSelectorUI: function() {
    var btn = document.getElementById('lang-current');
    if (!btn) { return; }
    var all = {};
    var k;
    for (k in this.supported)  { all[k] = this.supported[k]; }
    for (k in this.googleOnly) { all[k] = this.googleOnly[k]; }
    var info = all[this.currentLang];
    if (info) { btn.textContent = '[' + info.flag + '] ' + info.label; }

    var cur = this.currentLang;
    document.querySelectorAll('.lang-option').forEach(function(el) {
      el.classList.toggle('active', el.getAttribute('data-lang') === cur);
    });
  },

  renderSelector: function() {
    var container = document.getElementById('lang-selector');
    if (!container) { return; }
    var self = this;

    var html = '<div class="lang-wrapper">';
    html += '<button id="lang-current" class="lang-btn" onclick="I18N.toggleDropdown()">[DE] Deutsch</button>';
    html += '<div id="lang-dropdown" class="lang-dropdown">';
    html += '<div class="lang-group-label">Traductions completes</div>';

    var code;
    for (code in this.supported) {
      var l = this.supported[code];
      html += '<button class="lang-option" onclick="I18N.setLang(\'' + code + '\')" data-lang="' + code + '">[' + l.flag + '] ' + l.label + '</button>';
    }

    html += '<div class="lang-group-label">Via Google Translate</div>';

    for (code in this.googleOnly) {
      var lg = this.googleOnly[code];
      html += '<button class="lang-option" onclick="I18N.setLang(\'' + code + '\')" data-lang="' + code + '">[' + lg.flag + '] ' + lg.label + '</button>';
    }

    html += '</div></div>';
    container.innerHTML = html;

    document.addEventListener('click', function(e) {
      if (!container.contains(e.target)) {
        var dd = document.getElementById('lang-dropdown');
        if (dd) { dd.style.display = 'none'; }
      }
    });
  },

  toggleDropdown: function() {
    var dd = document.getElementById('lang-dropdown');
    if (!dd) { return; }
    dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
  }

};
