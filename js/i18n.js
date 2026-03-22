/* B-MO FINANCIAL - i18n.js v4 - Toutes les cles */
'use strict';
var I18N = {
  defaultLang: 'de',
  supported: { de:{label:'Deutsch',flag:'DE'}, fr:{label:'Francais',flag:'FR'}, en:{label:'English',flag:'EN'}, es:{label:'Espanol',flag:'ES'}, it:{label:'Italiano',flag:'IT'}, sl:{label:'Slovenscina',flag:'SL'}, hr:{label:'Hrvatski',flag:'HR'}, ru:{label:'Russkiy',flag:'RU'} },
  googleOnly: { pl:{label:'Polski',flag:'PL'}, cs:{label:'Cestina',flag:'CZ'}, hu:{label:'Magyar',flag:'HU'}, ro:{label:'Romana',flag:'RO'}, nl:{label:'Nederlands',flag:'NL'}, pt:{label:'Portugues',flag:'PT'}, tr:{label:'Turkce',flag:'TR'}, ar:{label:'Arabe',flag:'AR'}, zh:{label:'Chinois',flag:'ZH'}, ja:{label:'Japonais',flag:'JA'} },
  de: {
    topbar: { text:'B-Mo Financial - ACPR-zugelassen - Einlagen bis 100.000 EUR gesichert', branches:'Filialen', client_space:'Kundenbereich', contact:'Kontakt', tag:'Versicherungen & Kredit' },
    nav: { home:'Startseite', loans:'Unsere Kredite', simulator:'Kreditrechner', apply:'Online-Antrag', login:'Anmelden', open_account:'Konto eroeffnen', alerts:'Benachrichtigungen' },
    notif: { title:'Benachrichtigungen', mark_read:'Alle als gelesen markieren', msg1_title:'Neue Nachricht von Sophie Bernard', msg1_sub:'Ihre Akte wurde validiert', msg1_time:'Vor 2 Stunden', due_title:'Faelligkeit in 10 Tagen', due_sub:'444 EUR werden am 1. April abgebucht', doc_title:'Dokument verfuegbar', doc_sub:'Jahresabrechnung 2024 zum Herunterladen', security_title:'Anmeldung von neuem Geraet', security_sub:'Bitte ueberpruefen', today:'Heute', yesterday:'Gestern' },
    hero: { title:'Finanzieren Sie Ihre Projekte,', title_em:'in Ihrem Tempo', subtitle:'Privatkunden und Unternehmen: Nutzen Sie unsere Kreditloesungen und verfolgen Sie jeden Schritt in Ihrem gesicherten Bereich.', simulate:'Kredit berechnen', discover:'Unsere Angebote entdecken' },
    segments: { individuals:'Privatkunden', business:'Unternehmen und KMU' },
    products: {
      individuals_title:'Loesungen fuer Privatkunden', individuals_sub:'Finanzierungen fuer jeden Lebensabschnitt',
      business_title:'Loesungen fuer Unternehmen', business_sub:'Strukturierte Finanzierungen fuer Ihr Wachstum',
      personal_name:'Privatkredit', personal_desc:'Reisen, Renovierung, Ausstattung - ohne Verwendungsnachweis.', personal_rate:'Ab 3,90 % effektiver Jahreszins',
      mortgage_name:'Immobilienkredit', mortgage_desc:'Kauf, Bau oder Renovierung.', mortgage_rate:'Ab 3,20 % effektiver Jahreszins',
      auto_name:'Autokredit', auto_desc:'Neu- oder Gebrauchtfahrzeug, Benzin oder Elektro.', auto_rate:'Ab 4,50 % effektiver Jahreszins',
      micro_name:'Mikrofinanzierung', micro_desc:'Kleine Betraege ohne komplexe Sicherheiten.', micro_rate:'Ab 5,90 % effektiver Jahreszins',
      pro_credit_name:'Betriebskredit', pro_credit_desc:'Finanzierung von Ausruestung, Betriebsmitteln, Wachstum.', pro_credit_rate:'Ab 4,20 % effektiver Jahreszins',
      pro_mortgage_name:'Gewerbeimmobilien', pro_mortgage_desc:'Kauf von Bueros, Lagerhallen, Geschaeftsraeumen.', pro_mortgage_rate:'Ab 3,50 % effektiver Jahreszins',
      micro_sme_name:'Mikrofinanzierung KMU', micro_sme_desc:'Bis zu 50.000 EUR fuer Kleinstunternehmen.', micro_sme_rate:'Ab 6,50 % effektiver Jahreszins',
      treasury_name:'Kreditlinie', treasury_desc:'Revolvierende Betriebsmittellinie.', treasury_rate:'Ab 5,00 % effektiver Jahreszins'
    },
    figures: { hours:'24 Std.', hours_label:'Grundsatzentscheidung', percent:'100%', percent_label:'Online-Antrag', clients:'12.000+', clients_label:'Begleitete Kunden' },
    footer: { our_loans:'Unsere Kredite', business:'Unternehmen', info:'Informationen', about:'Ueber uns', legal:'Impressum', privacy:'Datenschutz', cgu:'AGB', contact:'Kontakt', copyright:'2025 B-Mo Financial. Alle Rechte vorbehalten.', license:'ACPR-Zulassung Nr. 123456', brand_desc:'Zugelassene Privatgesellschaft. Aktiengesellschaft mit einem Kapital von 10.000.000 EUR.' },
    prods: { title:'Unsere Kreditloesungen', subtitle:'4 Produkte fuer Privatkunden und Unternehmen', tag_individuals:'Privatkunden', tag_both:'Privatkunden & Unternehmen', apply_btn:'Antrag stellen', personal_detail:'1.000 bis 75.000 EUR - 12 bis 84 Monate - Ohne Verwendungsnachweis', mortgage_detail:'50.000 bis 1.500.000 EUR - Bis zu 25 Jahre - Fester oder variabler Zinssatz', auto_detail:'3.000 bis 80.000 EUR - Neu oder gebraucht - Benzin oder Elektro', micro_detail:'500 bis 25.000 EUR - Ohne komplexe Sicherheiten - Fuer KMU geeignet' },
    simulator: { title:'Kreditrechner', subtitle:'Berechnen Sie Ihre monatliche Rate in Echtzeit, unverbindlich', amount:'Kreditbetrag', duration:'Laufzeit', rate:'Jahreszins (eff.)', profile:'Kreditnehmerprofil', profile_employee:'Privatperson - Angestellte/r', profile_freelance:'Privatperson - Selbststaendige/r', profile_business:'Unternehmen / KMU', apply_btn:'Meinen Antrag stellen', monthly:'Geschaetzte Monatsrate', capital:'Kreditbetrag', interest:'Gesamtzinsen', total:'Gesamtrueckzahlung', debt_ratio:'Verschuldungsgrad', disclaimer:'Unverbindliche Simulation. Effektiver Jahreszins ohne Restschuldversicherung.' },
    apply: { title:'Online-Kreditantrag', subtitle:'100% digital - Grundsatzentscheidung in 24 Std.', step1:'1 - Vorhaben', step2:'2 - Identitaet', step3:'3 - Finanzen', step4:'4 - Dokumente', project_title:'Ihr Vorhaben', project_sub:'Was moechten Sie finanzieren?', loan_type:'Kreditart', borrower_profile:'Kreditnehmerprofil', amount:'Betrag (EUR)', duration_label:'Gewuenschte Laufzeit', purpose:'Verwendungszweck', purpose_placeholder:'z.B. Fahrzeugkauf, Renovierung...', next:'Weiter', back:'Zurueck', identity_title:'Ihre Identitaet', identity_sub:'Persoenliche Daten', firstname:'Vorname', lastname:'Nachname', birthdate:'Geburtsdatum', nationality:'Staatsangehoerigkeit', email:'E-Mail-Adresse', phone:'Mobiltelefon', postal_code:'Postleitzahl', city:'Stadt', finance_title:'Finanzielle Situation', finance_sub:'Monatliche Einnahmen und Ausgaben', employment:'Beschaeftigungsstatus', net_income:'Nettoeinkommen / Monat (EUR)', other_income:'Sonstige Einnahmen (EUR)', rent:'Miete / Monatsrate (EUR)', other_charges:'Sonstige Fixkosten (EUR)', existing_credits:'Laufende Kredite?', no_credits:'Nein', one_credit:'Ja - 1 Kredit', multiple_credits:'Ja - mehrere Kredite', docs_title:'Nachweise', docs_sub:'Laden Sie Ihre Unterlagen hoch', doc_id:'Personalausweis (Vorder- und Rueckseite)', doc_salary:'Letzte 3 Gehaltsabrechnungen', doc_bank:'Letzte 3 Kontoauszuege', submit:'Antrag einreichen', cgu:'Mit der Einreichung akzeptieren Sie unsere AGB und ermaechtigen B-Mo Financial, Ihre Kredithistorie einzusehen.', summary:'Zusammenfassung', monthly_est:'geschaetzte Monatsrate', sum_type:'Art', sum_profile:'Profil', sum_individual:'Privatperson', sum_amount:'Betrag', sum_duration:'Laufzeit', sum_rate:'Eff. Jahreszins', trust1:'Verschluesselte Daten', trust2:'Kein Engagement vor Unterzeichnung', trust3:'Antwort in 24 Std.', trust4:'SSL 256-Bit-Verschluesselung' },
    auth: { title:'Kundenbereich B-Mo Financial', login_tab:'Anmelden', register_tab:'Konto erstellen', email:'E-Mail-Adresse', password:'Passwort', remember:'Angemeldet bleiben', forgot:'Passwort vergessen?', login_btn:'Zu meinem Bereich', ssl_note:'SSL-verschluesselte Verbindung - 2FA verfuegbar', register_note:'Erstellen Sie Ihren Bereich, um einen Antrag zu stellen und Ihren Vorgang zu verfolgen.', profile_label:'Profil', individual:'Privatperson', business:'Unternehmen / KMU', accept_text:'Ich akzeptiere die AGB und die Datenschutzrichtlinie von B-Mo Financial.', create_btn:'Konto erstellen', confirm_password: 'Passwort bestaetigen'},
    dashboard: { greeting:'Guten Tag,', updated:'Aktualisiert heute', new_request:'+ Neuer Antrag', granted_amount:'Bewilligter Betrag', next_due:'Naechste Faelligkeit', progress:'Fortschritt', in_repayment:'In Rueckzahlung', paid:'Bezahlt', upcoming:'Bevorstehend', advisor:'Ihre Beraterin', send_message:'Nachricht senden' },
    dash: {
      client_since:'Privatkunde - Kunde seit 2023', overview:'Uebersicht', my_file:'Meine Akte', messaging:'Nachrichten', documents:'Dokumente', alerts:'Benachrichtigungen', my_profile:'Mein Profil', security:'Kontosicherheit',
      active_file:'Aktive Akte', last_messages:'Letzte Nachrichten', unread:'Ungelesen', msg_preview:'Ihre Akte wurde validiert - Kreditvertrag unterzeichnet.', two_hours_ago:'Vor 2 Stunden', see_all_messages:'Alle Nachrichten anzeigen', last_dues:'Letzte Faelligkeiten', march_due:'Monatsrate Maerz 2025', feb_due:'Monatsrate Februar 2025', april_due:'Monatsrate April 2025', due_date:'Faelligkeit: 1. April 2025', yesterday:'Gestern',
      loan_progress:'Kreditfortschritt', installments_progress:'12 Raten von 36', repaid:'zurueckgezahlt', remaining:'verbleibend', recent_alerts:'Aktuelle Benachrichtigungen', unknown_device:'Unbekanntes Geraet erkannt', check_security:'Neues Geraet - bitte ueberpruefen', due_10_days:'Faelligkeit in 10 Tagen', due_amount:'444 EUR am 1. April', advisor_role:'Kundenbetreuerin', installments:'Raten',
      step_by_step:'Schritt-fuer-Schritt-Verfolgung', step_submitted:'Antrag eingereicht', step_docs:'Dokumente geprueft', step_analysis:'Bonitaetspruefung abgeschlossen', step_approved:'Grundsatzentscheidung erteilt', step_signed:'Kreditvertrag elektronisch unterzeichnet', step_repayment:'Rueckzahlung laeuft', step_repayment_detail:'Seit Feb. 2025 - noch 24 Monate', step_closed:'Kreditabschluss', step_closed_date:'Geplant Januar 2028',
      loan_details:'Kreditdetails', reference:'Referenz', monthly:'Monatsrate', total_cost:'Gesamtkosten', quick_actions:'Schnellzugriff', download_offer:'Kreditangebot herunterladen', amortization:'Tilgungsplan', contact_advisor:'Berater kontaktieren', capital_repaid:'Zurueckgezahltes Kapital',
      file_ref:'Privatkredit - 15.000 EUR - Ref. BM-2025-00147',
      msg_subtitle:'3 ungelesene Nachrichten - Ende-zu-Ende-Verschluesselung', new_message:'+ Neue Nachricht', conversations:'Gespraeche', unread_count:'3 ungelesen', msg1_preview:'Ihre Akte wurde validiert', msg2_preview:'Naechste Faelligkeit in 10 Tagen', msg3_preview:'Jahresabrechnung 2024 verfuegbar', msg4_preview:'Ich stehe Ihnen gerne zur Verfuegung', msg5_preview:'Willkommen bei B-Mo Financial!', today_time:'Heute, 10:15', advisor_role_ref:'Kundenbetreuerin - Ref. BM-2025-00147', msg_placeholder:'Ihre sichere Nachricht... (Enter zum Senden)', send:'Senden',
      docs_subtitle:'Alle Ihre Dateien an einem sicheren Ort', all:'Alle', contracts:'Vertraege', statements:'Abrechnungen', proofs:'Nachweise', doc1_name:'Unterzeichnetes Kreditangebot', doc_signed:'Elektronisch unterzeichnet', download:'Herunterladen', doc2_name:'Tilgungsplan', doc3_name:'Jahresabrechnung 2024', doc_new:'Neu', doc4_name:'Kreditbescheinigung', doc5_name:'Personalausweis', doc_verified:'Geprueft', doc6_name:'Gehaltsabrechnungen (x3)',
      alerts_subtitle:'Verwalten Sie Ihre Benachrichtigungseinstellungen', active_alerts:'Aktive Benachrichtigungen', alert1_title:'Anmeldung von neuem Geraet', alert1_sub:'Paris - Chrome - Windows - 10:42', alert1_link:'Sicherheit verwalten', alert2_title:'Faelligkeit in 10 Tagen', alert2_sub:'444 EUR werden am 1. April 2025 abgebucht', alert3_title:'Neue Nachricht von Sophie Bernard', alert3_sub:'Ihre Akte wurde validiert', alert4_title:'Jahresabrechnung 2024 verfuegbar', alert4_sub:'Ihr Dokument steht zum Download bereit',
      alert_settings:'Benachrichtigungseinstellungen', alert_settings_sub:'Waehlen Sie Ihre Benachrichtigungsart', alert_due:'Anstehende Faelligkeiten', alert_msg:'Neue Nachrichten', alert_security:'Verdaechtige Anmeldungen', alert_docs:'Neue Dokumente', alert_offers:'Personalisierte Angebote', alert_email:'E-Mail-Benachrichtigungen', alert_sms:'SMS-Benachrichtigungen', save:'Speichern',
      personal_info:'Persoenliche Daten', full_name:'Vollstaendiger Name', situation:'Situation', married:'Verheiratet', employee:'Angestellte/r (unbefristet)', contact_info:'Kontaktdaten', address:'Adresse', financial_situation:'Finanzielle Situation', monthly_charges:'Monatliche Ausgaben', credit_score:'Bonitaetsscore', score_excellent:'Ausgezeichnet', score_sub:'Guenstiges Kreditnehmerprofil', score_updated:'Score aktualisiert am 20. Maerz 2025', profile_subtitle:'Ihre persoenlichen und finanziellen Informationen', edit:'Bearbeiten',
      authentication:'Authentifizierung', twofa:'Zwei-Faktor-Authentifizierung (2FA)', twofa_sub:'SMS an +33 6 12 *** 78', active:'Aktiv', magic_link:'Anmeldung per Magic Link', magic_link_sub:'E-Mail ohne Passwort', inactive:'Inaktiv', change_password:'Passwort aendern', new_password:'Neues Passwort', update:'Aktualisieren', delete_account:'Konto loeschen', delete_warning:'Diese Aktion ist unwiderruflich.', delete_btn:'Loeschung beantragen',
      recent_connections:'Letzte Anmeldungen', unknown_device_detail:'Unbekanntes Geraet - Heute 10:42', usual_device:'20. Maerz 2025 - Ihr uebliches Geraet', block:'Sperren', approved:'Genehmigt', security_note:'Alle Verbindungen sind SSL/TLS 256-Bit-verschluesselt.', security_subtitle:'Schuetzen Sie Ihren B-Mo Financial Bereich', llogout: 'Abmelden'
    }
  },
  currentLang: 'de',
  translations: {},
  init: function() {
    this.translations['de'] = this.de;
    var saved = localStorage.getItem('bmo_lang') || this.defaultLang;
    this.renderSelector();
    if (saved === 'de') { this.currentLang = 'de'; this.applyTranslations(); this.updateSelectorUI(); }
    else { this.applyTranslations(); this.setLang(saved); }
  },
  setLang: function(lang) {
    var self = this;
    if (this.googleOnly[lang]) { this.currentLang = lang; localStorage.setItem('bmo_lang', lang); this.applyGoogleTranslate(lang); this.updateSelectorUI(); return; }
    if (this.translations[lang]) { this.removeGoogleTranslate(); this.currentLang = lang; localStorage.setItem('bmo_lang', lang); this.applyTranslations(); this.updateSelectorUI(); return; }
    fetch('locales/' + lang + '.json').then(function(r) { if (!r.ok) { throw new Error('not found'); } return r.json(); }).then(function(data) { self.translations[lang] = data; self.removeGoogleTranslate(); self.currentLang = lang; localStorage.setItem('bmo_lang', lang); self.applyTranslations(); self.updateSelectorUI(); }).catch(function() { self.applyGoogleTranslate(lang); });
  },
  t: function(key) {
    var tr = this.translations[this.currentLang]; if (!tr) { return ''; }
    var parts = key.split('.'), val = tr;
    for (var i = 0; i < parts.length; i++) { if (val === undefined || val === null) { return ''; } val = val[parts[i]]; }
    return val || '';
  },
  applyTranslations: function() {
    var self = this;
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var val = self.t(el.getAttribute('data-i18n')); if (!val) { return; }
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') { el.placeholder = val; } else { el.textContent = val; }
    });
  },
  applyGoogleTranslate: function(lang) {
    this.removeGoogleTranslate();
    document.cookie = 'googtrans=/auto/' + lang + '; path=/';
    var div = document.createElement('div'); div.id = 'google_translate_element'; div.style.display = 'none'; document.body.appendChild(div);
    window.googleTranslateElementInit = function() { new google.translate.TranslateElement({ pageLanguage:'de', includedLanguages:lang, autoDisplay:true }, 'google_translate_element'); };
    var sc = document.createElement('script'); sc.id = 'google-translate-script'; sc.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'; document.body.appendChild(sc);
  },
  removeGoogleTranslate: function() {
    var el = document.getElementById('google_translate_element'); if (el) { el.remove(); }
    var sc = document.getElementById('google-translate-script'); if (sc) { sc.remove(); }
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  },
  updateSelectorUI: function() {
    var btn = document.getElementById('lang-current'); if (!btn) { return; }
    var all = {}; var k;
    for (k in this.supported) { all[k] = this.supported[k]; }
    for (k in this.googleOnly) { all[k] = this.googleOnly[k]; }
    var info = all[this.currentLang]; if (info) { btn.textContent = '[' + info.flag + '] ' + info.label; }
    var cur = this.currentLang;
    document.querySelectorAll('.lang-option').forEach(function(el) { el.classList.toggle('active', el.getAttribute('data-lang') === cur); });
  },
  renderSelector: function() {
    var container = document.getElementById('lang-selector'); if (!container) { return; }
    var self = this;
    var html = '<div class="lang-wrapper"><button id="lang-current" class="lang-btn" onclick="I18N.toggleDropdown()">[DE] Deutsch</button><div id="lang-dropdown" class="lang-dropdown"><div class="lang-group-label">Traductions completes</div>';
    var code;
    for (code in this.supported) { var l = this.supported[code]; html += '<button class="lang-option" onclick="I18N.setLang(\'' + code + '\')" data-lang="' + code + '">[' + l.flag + '] ' + l.label + '</button>'; }
    html += '<div class="lang-group-label">Via Google Translate</div>';
    for (code in this.googleOnly) { var lg = this.googleOnly[code]; html += '<button class="lang-option" onclick="I18N.setLang(\'' + code + '\')" data-lang="' + code + '">[' + lg.flag + '] ' + lg.label + '</button>'; }
    html += '</div></div>'; container.innerHTML = html;
    document.addEventListener('click', function(e) { if (!container.contains(e.target)) { var dd = document.getElementById('lang-dropdown'); if (dd) { dd.style.display = 'none'; } } });
  },
  toggleDropdown: function() { var dd = document.getElementById('lang-dropdown'); if (!dd) { return; } dd.style.display = dd.style.display === 'block' ? 'none' : 'block'; }
};
