/* =========================================
   B-MO FINANCIAL — i18n.js v2
   Allemand intégré — pas de fetch bloquant
   ========================================= */
'use strict';
var I18N = {
  defaultLang:'de',
  supported:{ de:{label:'Deutsch',flag:'🇩🇪'}, fr:{label:'Français',flag:'🇫🇷'}, en:{label:'English',flag:'🇬🇧'}, es:{label:'Español',flag:'🇪🇸'}, it:{label:'Italiano',flag:'🇮🇹'}, sl:{label:'Slovenščina',flag:'🇸🇮'}, hr:{label:'Hrvatski',flag:'🇭🇷'}, ru:{label:'Русский',flag:'🇷🇺'} },
  googleOnly:{ pl:{label:'Polski',flag:'🇵🇱'}, cs:{label:'Čeština',flag:'🇨🇿'}, sk:{label:'Slovenčina',flag:'🇸🇰'}, hu:{label:'Magyar',flag:'🇭🇺'}, ro:{label:'Română',flag:'🇷🇴'}, nl:{label:'Nederlands',flag:'🇳🇱'}, pt:{label:'Português',flag:'🇵🇹'}, tr:{label:'Türkçe',flag:'🇹🇷'}, ar:{label:'العربية',flag:'🇸🇦'}, zh:{label:'中文',flag:'🇨🇳'}, ja:{label:'日本語',flag:'🇯🇵'} },
  builtIn:{
    de:{
      nav:{home:'Startseite',loans:'Unsere Kredite',simulator:'Kreditrechner',apply:'Online-Antrag',login:'Anmelden',open_account:'Konto eröffnen',alerts:'Benachrichtigungen'},
      hero:{title:'Finanzieren Sie Ihre Projekte,',title_em:'in Ihrem Tempo',subtitle:'Privatkunden und Unternehmen: Nutzen Sie unsere maßgeschneiderten Kreditlösungen und verfolgen Sie jeden Schritt Ihres Antrags in Ihrem gesicherten Bereich.',simulate:'Kredit berechnen',discover:'Unsere Angebote entdecken'},
      segments:{individuals:'Privatkunden',business:'Unternehmen & KMU'},
      products:{individuals_title:'Lösungen für Privatkunden',individuals_sub:'Finanzierungen für jeden Lebensabschnitt',business_title:'Lösungen für Unternehmen',business_sub:'Strukturierte Finanzierungen für Ihr Wachstum',personal:{name:'Privatkredit',desc:'Reisen, Renovierung, Ausstattung — ohne Verwendungsnachweis.',rate:'Ab 3,90 % effektiver Jahreszins'},mortgage:{name:'Immobilienkredit',desc:'Kauf, Bau oder Renovierung.',rate:'Ab 3,20 % effektiver Jahreszins'},auto:{name:'Autokredit',desc:'Neu- oder Gebrauchtfahrzeug, Benzin oder Elektro.',rate:'Ab 4,50 % effektiver Jahreszins'},micro:{name:'Mikrofinanzierung',desc:'Kleine Beträge ohne komplexe Sicherheiten.',rate:'Ab 5,90 % effektiver Jahreszins'},pro_credit:{name:'Betriebskredit',desc:'Finanzierung von Ausrüstung, Betriebsmitteln, Wachstum.',rate:'Ab 4,20 % effektiver Jahreszins'},pro_mortgage:{name:'Gewerbeimmobilien',desc:'Kauf von Büros, Lagerhallen, Geschäftsräumen.',rate:'Ab 3,50 % effektiver Jahreszins'},micro_sme:{name:'Mikrofinanzierung KMU',desc:'Bis zu 50.000 € für Kleinstunternehmen.',rate:'Ab 6,50 % effektiver Jahreszins'},treasury:{name:'Kreditlinie',desc:'Revolvierende Betriebsmittellinie.',rate:'Ab 5,00 % effektiver Jahreszins'}},
      simulator:{title:'Kreditrechner',subtitle:'Berechnen Sie Ihre monatliche Rate in Echtzeit, unverbindlich',amount:'Kreditbetrag',duration:'Laufzeit',rate:'Jahreszins (eff.)',profile:'Kreditnehmerprofil',apply_btn:'Meinen Antrag stellen →',monthly:'Geschätzte Monatsrate',capital:'Kreditbetrag',interest:'Gesamtzinsen',total:'Gesamtrückzahlung',debt_ratio:'Verschuldungsgrad',disclaimer:'Unverbindliche Simulation. Effektiver Jahreszins ohne Restschuldversicherung.'},
      apply:{title:'Online-Kreditantrag',subtitle:'100% digital · Grundsatzentscheidung in 24 Std.',step1:'1 — Vorhaben',step2:'2 — Identität',step3:'3 — Finanzen',step4:'4 — Dokumente',next:'Weiter →',back:'← Zurück',submit:'Antrag einreichen',summary:'Zusammenfassung',monthly_est:'geschätzte Monatsrate'},
      auth:{title:'Kundenbereich B-Mo Financial',login_tab:'Anmelden',register_tab:'Konto erstellen',email:'E-Mail-Adresse',password:'Passwort',remember:'Angemeldet bleiben',forgot:'Passwort vergessen?',login_btn:'Zu meinem Bereich',ssl_note:'SSL-verschlüsselte Verbindung · 2FA verfügbar',individual:'Privatperson',business:'Unternehmen / KMU',create_btn:'Konto erstellen'},
      dashboard:{greeting:'Guten Tag,',updated:'Aktualisiert heute',new_request:'+ Neuer Antrag',paid:'Bezahlt',upcoming:'Bevorstehend',advisor:'Ihr/e Berater/in',send_message:'Nachricht senden'},
      footer:{our_loans:'Unsere Kredite',about:'Über uns',legal:'Impressum',privacy:'Datenschutz',contact:'Kontakt',copyright:'© 2025 B-Mo Financial. Alle Rechte vorbehalten.',license:'ACPR-Zulassung Nr. 123456'}
    }
  },
  currentLang:'de',
  translations:{},
  init:function(){
    this.translations['de']=this.builtIn['de'];
    var saved=localStorage.getItem('bmo_lang')||this.defaultLang;
    this.renderSelector();
    if(saved==='de'){this.currentLang='de';this.applyTranslations();this.updateSelectorUI();this.updateHtmlLang();}
    else{this.applyTranslations();this.setLang(saved);}
  },
  setLang:function(lang){
    var self=this;
    if(this.googleOnly[lang]){this.currentLang=lang;localStorage.setItem('bmo_lang',lang);this.applyGoogleTranslate(lang);this.updateSelectorUI();this.updateHtmlLang();return;}
    if(this.translations[lang]){this.removeGoogleTranslate();this.currentLang=lang;localStorage.setItem('bmo_lang',lang);this.applyTranslations();this.updateSelectorUI();this.updateHtmlLang();return;}
    fetch('locales/'+lang+'.json').then(function(r){if(!r.ok)throw new Error('not found');return r.json();}).then(function(data){self.translations[lang]=data;self.removeGoogleTranslate();self.currentLang=lang;localStorage.setItem('bmo_lang',lang);self.applyTranslations();self.updateSelectorUI();self.updateHtmlLang();}).catch(function(){self.applyGoogleTranslate(lang);});
  },
  t:function(key){
    var tr=this.translations[this.currentLang];if(!tr)return'';
    var parts=key.split('.'),val=tr;
    for(var i=0;i<parts.length;i++){if(val===undefined||val===null)return'';val=val[parts[i]];}
    return val||'';
  },
  applyTranslations:function(){
    var self=this;
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var val=self.t(el.getAttribute('data-i18n'));if(!val)return;
      if(el.tagName==='INPUT'||el.tagName==='TEXTAREA'){el.placeholder=val;}else{el.textContent=val;}
    });
  },
  applyGoogleTranslate:function(lang){
    this.removeGoogleTranslate();
    document.cookie='googtrans=/auto/'+lang+'; path=/';
    document.cookie='googtrans=/auto/'+lang+'; path=/; domain=.'+location.hostname;
    var div=document.createElement('div');div.id='google_translate_element';div.style.display='none';document.body.appendChild(div);
    window.googleTranslateElementInit=function(){new google.translate.TranslateElement({pageLanguage:'de',includedLanguages:lang,autoDisplay:true},'google_translate_element');};
    var sc=document.createElement('script');sc.id='google-translate-script';sc.src='//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';document.body.appendChild(sc);
  },
  removeGoogleTranslate:function(){
    var el=document.getElementById('google_translate_element');if(el)el.remove();
    var sc=document.getElementById('google-translate-script');if(sc)sc.remove();
    document.cookie='googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  },
  updateHtmlLang:function(){document.documentElement.lang=this.currentLang;},
  updateSelectorUI:function(){
    var btn=document.getElementById('lang-current');if(!btn)return;
    var all=Object.assign({},this.supported,this.googleOnly);
    var info=all[this.currentLang];if(info)btn.textContent=info.flag+' '+info.label;
    document.querySelectorAll('.lang-option').forEach(function(el){el.classList.toggle('active',el.getAttribute('data-lang')===I18N.currentLang);});
  },
  renderSelector:function(){
    var container=document.getElementById('lang-selector');if(!container)return;
    var self=this,html='<div class="lang-wrapper"><button id="lang-current" class="lang-btn" onclick="I18N.toggleDropdown()">🇩🇪 Deutsch</button><div id="lang-dropdown" class="lang-dropdown"><div class="lang-group-label">Traductions complètes</div>';
    Object.keys(this.supported).forEach(function(code){var l=self.supported[code];html+='<button class="lang-option" onclick="I18N.setLang(\''+code+'\')" data-lang="'+code+'">'+l.flag+' '+l.label+'</button>';});
    html+='<div class="lang-group-label" style="margin-top:6px">Via Google Translate</div>';
    Object.keys(this.googleOnly).forEach(function(code){var l=self.googleOnly[code];html+='<button class="lang-option" onclick="I18N.setLang(\''+code+'\')" data-lang="'+code+'">'+l.flag+' '+l.label+'</button>';});
    html+='</div></div>';container.innerHTML=html;
    document.addEventListener('click',function(e){if(!container.contains(e.target)){var dd=document.getElementById('lang-dropdown');if(dd)dd.style.display='none';}});
  },
  toggleDropdown:function(){var dd=document.getElementById('lang-dropdown');if(!dd)return;dd.style.display=dd.style.display==='block'?'none':'block';}
};
