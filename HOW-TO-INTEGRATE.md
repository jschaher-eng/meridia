# B-Mo Financial — Guide d'intégration multilingue

## Structure des fichiers

```
bmo-i18n/
├── locales/
│   ├── de.json   ← Allemand (langue principale — COMPLET)
│   ├── fr.json   ← Français (COMPLET)
│   ├── en.json   ← Anglais (COMPLET)
│   ├── es.json   ← Espagnol (COMPLET)
│   ├── it.json   ← Italien (COMPLET)
│   ├── sl.json   ← Slovène (COMPLET)
│   ├── hr.json   ← Croate (COMPLET)
│   └── ru.json   ← Russe (COMPLET)
├── js/
│   └── i18n.js   ← Moteur de traduction
└── css/
    └── lang-selector.css  ← Styles du sélecteur
```

---

## Étape 1 — Copier les fichiers dans votre projet

Copiez dans votre dossier `bmo-financial/` :
- Le dossier `locales/` entier → `bmo-financial/locales/`
- `js/i18n.js` → `bmo-financial/js/i18n.js`
- `css/lang-selector.css` → `bmo-financial/css/lang-selector.css`

---

## Étape 2 — Modifier index.html

### 2a. Ajouter le CSS dans le <head>

Après vos autres CSS, ajoutez :
```html
<link rel="stylesheet" href="css/lang-selector.css">
```

### 2b. Ajouter le sélecteur dans la navigation

Dans la barre de navigation, dans `.nav-actions`, ajoutez avant le bouton "Connexion" :
```html
<div id="lang-selector"></div>
```

Résultat :
```html
<div class="nav-actions">
  <div id="lang-selector"></div>  <!-- AJOUTER ICI -->
  <button class="notif-btn" ...>...</button>
  <button class="btn btn-outline btn-sm" ...>Connexion</button>
  <button class="btn btn-primary btn-sm" ...>Ouvrir un compte</button>
</div>
```

### 2c. Ajouter les attributs data-i18n sur les textes

Sur chaque texte à traduire, ajoutez l'attribut `data-i18n` avec la clé correspondante.

Exemples :
```html
<!-- Avant -->
<button class="nav-link act" onclick="goPage('home')">Accueil</button>

<!-- Après -->
<button class="nav-link act" onclick="goPage('home')" data-i18n="nav.home">Startseite</button>
```

```html
<!-- Avant -->
<h1>Financez vos projets,<br><em>à votre rythme</em></h1>

<!-- Après -->
<h1 data-i18n="hero.title">Finanzieren Sie Ihre Projekte,</h1>
<em data-i18n="hero.title_em">in Ihrem Tempo</em>
```

### 2d. Charger i18n.js en bas de page

Avant la balise `</body>`, ajoutez AVANT les autres scripts :
```html
<script src="js/i18n.js"></script>
```

Puis tout en bas, après tous les scripts :
```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    I18N.init();
  });
</script>
```

---

## Clés disponibles dans les fichiers JSON

### Navigation — `nav.*`
- `nav.home` · `nav.loans` · `nav.simulator` · `nav.apply`
- `nav.login` · `nav.open_account` · `nav.alerts`

### Hero — `hero.*`
- `hero.title` · `hero.title_em` · `hero.subtitle`
- `hero.simulate` · `hero.discover`

### Produits — `products.*`
- `products.personal.name` · `products.personal.desc` · `products.personal.rate`
- `products.mortgage.name/desc/rate`
- `products.auto.name/desc/rate`
- `products.micro.name/desc/rate`

### Simulateur — `simulator.*`
- `simulator.title` · `simulator.amount` · `simulator.duration`
- `simulator.rate` · `simulator.monthly` · `simulator.apply_btn`

### Formulaire demande — `apply.*`
- `apply.step1/step2/step3/step4`
- `apply.next` · `apply.back` · `apply.submit`

### Authentification — `auth.*`
- `auth.title` · `auth.login_tab` · `auth.register_tab`
- `auth.email` · `auth.password` · `auth.login_btn`

### Dashboard — `dashboard.*`
- `dashboard.greeting` · `dashboard.paid` · `dashboard.upcoming`

### Footer — `footer.*`
- `footer.copyright` · `footer.our_loans` · `footer.contact`

---

## Ajouter une nouvelle langue

1. Créez `locales/XX.json` (XX = code ISO : `pl`, `cs`, `tr`...)
2. Copiez le contenu de `de.json` et traduisez les valeurs
3. Ajoutez la langue dans `i18n.js`, section `supported` :
```javascript
supported: {
  de: { label: 'Deutsch', flag: '🇩🇪' },
  // ... existants ...
  pl: { label: 'Polski',  flag: '🇵🇱' },  // AJOUTER
},
```
4. Retirez-la de `googleOnly` si elle y était

---

## Langues via Google Translate (automatique)

Ces langues n'ont pas de fichier JSON — Google Translate traduit automatiquement toute la page :
Polonais, Tchèque, Slovaque, Hongrois, Roumain, Néerlandais, Portugais, Turc, Arabe, Chinois, Japonais

Pour en ajouter d'autres, ajoutez simplement dans `googleOnly` :
```javascript
googleOnly: {
  // ... existants ...
  ko: { label: '한국어', flag: '🇰🇷' },
}
```

---

## Fonctionnement

1. Au chargement, la langue sauvegardée dans `localStorage` est utilisée (défaut : allemand)
2. L'utilisateur clique sur le sélecteur → choisit une langue
3. Si la langue a un fichier JSON → traduction instantanée via `data-i18n`
4. Si la langue n'a pas de fichier JSON → Google Translate traduit toute la page
5. Le choix est mémorisé pour les prochaines visites
