/* =========================================
   B-MO FINANCIAL — i18n.js
   Moteur multilingue
   Langues JSON + Google Translate fallback
   ========================================= */

'use strict';

var I18N = {

  /* Langue par défaut */
  defaultLang: 'de',

  /* Langues disponibles avec fichier JSON */
  supported: {
    de: { label: 'Deutsch',    flag: '🇩🇪' },
    fr: { label: 'Français',   flag: '🇫🇷' },
    en: { label: 'English',    flag: '🇬🇧' },
    es: { label: 'Español',    flag: '🇪🇸' },
    it: { label: 'Italiano',   flag: '🇮🇹' },
    sl: { label: 'Slovenščina',flag: '🇸🇮' },
    hr: { label: 'Hrvatski',   flag: '🇭🇷' },
    ru: { label: 'Русский',    flag: '🇷🇺' },
  },

  /* Langues sans fichier JSON — Google Translate */
  googleOnly: {
    pl: { label: 'Polski',     flag: '🇵🇱' },
    cs: { label: 'Čeština',    flag: '🇨🇿' },
    sk: { label: 'Slovenčina', flag: '🇸🇰' },
    hu: { label: 'Magyar',     flag: '🇭🇺' },
    ro: { label: 'Română',     flag: '🇷🇴' },
    nl: { label: 'Nederlands', flag: '🇳🇱' },
    pt: { label: 'Português',  flag: '🇵🇹' },
    tr: { label: 'Türkçe',     flag: '🇹🇷' },
    ar: { label: 'العربية',    flag: '🇸🇦' },
    zh: { label: '中文',        flag: '🇨🇳' },
    ja: { label: '日本語',      flag: '🇯🇵' },
  },

  currentLang: 'de',
  translations: {},

  /* Initialiser */
  async init() {
    var saved = localStorage.getItem('bmo_lang') || this.defaultLang;
    await this.setLang(saved);
    this.renderSelector();
  },

  /* Charger une langue */
  async setLang(lang) {
    /* Langue Google Translate uniquement */
    if (this.googleOnly[lang]) {
      this.currentLang = lang;
      localStorage.setItem('bmo_lang', lang);
      this.applyGoogleTranslate(lang);
      this.updateSelectorUI();
      return;
    }

    /* Langue avec fichier JSON */
    if (!this.translations[lang]) {
      try {
        var resp = await fetch('locales/' + lang + '.json');
        if (!resp.ok) throw new Error('not found');
        this.translations[lang] = await resp.json();
      } catch(e) {
        console.warn('Fichier ' + lang + '.json introuvable, fallback Google Translate');
        this.applyGoogleTranslate(lang);
        return;
      }
    }

    this.currentLang = lang;
    localStorage.setItem('bmo_lang', lang);
    this.removeGoogleTranslate();
    this.applyTranslations();
    this.updateSelectorUI();
    this.updateHtmlLang();
  },

  /* Obtenir une clé de traduction */
  t(key) {
    var tr = this.translations[this.currentLang];
    if (!tr) return key;
    var parts = key.split('.');
    var val = tr;
    for (var i = 0; i < parts.length; i++) {
      if (!val) return key;
      val = val[parts[i]];
    }
    return val || key;
  },

  /* Appliquer toutes les traductions via data-i18n */
  applyTranslations() {
    var els = document.querySelectorAll('[data-i18n]');
    els.forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      var val = I18N.t(key);
      if (val && val !== key) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = val;
        } else {
          el.textContent = val;
        }
      }
    });

    /* data-i18n-html pour contenu avec balises */
    var htmlEls = document.querySelectorAll('[data-i18n-html]');
    htmlEls.forEach(function(el) {
      var key = el.getAttribute('data-i18n-html');
      var val = I18N.t(key);
      if (val && val !== key) el.innerHTML = val;
    });
  },

  /* Google Translate — injection du widget */
  applyGoogleTranslate(lang) {
    this.removeGoogleTranslate();

    /* Ajouter le meta Google Translate */
    var meta = document.createElement('meta');
    meta.name = 'google-translate-customization';
    meta.content = '';
    document.head.appendChild(meta);

    /* Changer la langue via le cookie Google Translate */
    document.cookie = 'googtrans=/auto/' + lang + '; path=/';
    document.cookie = 'googtrans=/auto/' + lang + '; path=/; domain=.' + location.hostname;

    /* Charger le script Google Translate */
    var div = document.createElement('div');
    div.id = 'google_translate_element';
    div.style.display = 'none';
    document.body.appendChild(div);

    window.googleTranslateElementInit = function() {
      new google.translate.TranslateElement({
        pageLanguage: 'de',
        includedLanguages: lang,
        autoDisplay: true,
      }, 'google_translate_element');
    };

    var script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    this.currentLang = lang;
    localStorage.setItem('bmo_lang', lang);
    this.updateSelectorUI();
    this.updateHtmlLang();
  },

  removeGoogleTranslate() {
    var el = document.getElementById('google_translate_element');
    if (el) el.remove();
    var sc = document.getElementById('google-translate-script');
    if (sc) sc.remove();
    /* Supprimer les cookies Google Translate */
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  },

  /* Mettre à jour l'attribut lang du HTML */
  updateHtmlLang() {
    document.documentElement.lang = this.currentLang;
  },

  /* Mettre à jour l'UI du sélecteur */
  updateSelectorUI() {
    var btn = document.getElementById('lang-current');
    if (!btn) return;
    var all = Object.assign({}, this.supported, this.googleOnly);
    var info = all[this.currentLang];
    if (info) btn.textContent = info.flag + ' ' + info.label;
  },

  /* Rendre le sélecteur de langue */
  renderSelector() {
    var container = document.getElementById('lang-selector');
    if (!container) return;

    var all = Object.assign({}, this.supported, this.googleOnly);
    var self = this;

    var html = '<div class="lang-wrapper">';
    html += '<button id="lang-current" class="lang-btn" onclick="I18N.toggleDropdown()"></button>';
    html += '<div id="lang-dropdown" class="lang-dropdown">';

    /* Langues avec JSON d'abord */
    html += '<div class="lang-group-label">Traductions complètes</div>';
    Object.keys(this.supported).forEach(function(code) {
      var l = self.supported[code];
      html += '<button class="lang-option" onclick="I18N.setLang(\'' + code + '\')" data-lang="' + code + '">';
      html += l.flag + ' ' + l.label + '</button>';
    });

    /* Puis Google Translate */
    html += '<div class="lang-group-label" style="margin-top:6px">Via Google Translate</div>';
    Object.keys(this.googleOnly).forEach(function(code) {
      var l = self.googleOnly[code];
      html += '<button class="lang-option" onclick="I18N.setLang(\'' + code + '\')" data-lang="' + code + '">';
      html += l.flag + ' ' + l.label + '</button>';
    });

    html += '</div></div>';
    container.innerHTML = html;
    this.updateSelectorUI();

    /* Fermer le dropdown en cliquant ailleurs */
    document.addEventListener('click', function(e) {
      if (!container.contains(e.target)) {
        var dd = document.getElementById('lang-dropdown');
        if (dd) dd.style.display = 'none';
      }
    });
  },

  toggleDropdown() {
    var dd = document.getElementById('lang-dropdown');
    if (!dd) return;
    dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
  }
};
