# Meridia Banque & Crédit — Site Web Complet

## Structure du projet

```
meridia/
├── index.html              ← Page principale (toutes les vues)
├── css/
│   ├── main.css            ← Variables, reset, typographie, layout global
│   ├── nav.css             ← Topbar, navigation, notifications
│   ├── pages.css           ← Hero, produits, simulateur, auth, apply, footer
│   ├── dashboard.css       ← Sidebar, métriques, timeline, docs, alertes, profil
│   └── messaging.css       ← Messagerie sécurisée (bulles, liste, compose)
└── js/
    ├── app.js              ← Navigation, routeur de pages, notifications
    ├── simulator.js        ← Calcul de prêt, mise à jour UI simulateur
    ├── messaging.js        ← Conversations, envoi de messages, bulles
    └── dashboard.js        ← Documents, alertes, profil, sécurité, toasts

```

## Fonctionnalités incluses

### Site public
- **Accueil** : hero, switch Particuliers / Entreprises, 4 produits de prêt, chiffres clés, footer
- **Nos prêts** : 4 fiches produits détaillées (Prêt personnel, Immobilier, Auto, Microfinance/Tontine)
- **Simulateur** : calcul en temps réel (mensualité, intérêts, total, taux d'endettement), 4 types de prêts
- **Demande en ligne** : formulaire 4 étapes (Projet → Identité → Finances → Documents), panneau récapitulatif
- **Authentification** : connexion + création de compte avec CGU

### Espace client (tableau de bord)
- **Vue d'ensemble** : métriques clés, derniers messages, échéances, progression, conseiller
- **Mon dossier** : timeline complète, détails du prêt, barre de progression, actions rapides
- **Messagerie sécurisée** : liste de conversations, bulles de chat, envoi de messages, réponse simulée
- **Documents** : gestion de fichiers par catégorie (Contrats, Relevés, Justificatifs), téléchargement
- **Alertes** : centre de notifications classé par niveau (danger, warn, info, ok), paramétrage
- **Mon profil** : infos personnelles, coordonnées, situation financière, score de crédit
- **Sécurité** : authentification 2FA, historique de connexions, gestion d'appareils, mot de passe

## Comment utiliser

1. Ouvrir `index.html` dans un navigateur moderne (Chrome, Firefox, Safari, Edge)
2. Aucune dépendance externe ni serveur requis — fonctionne en local
3. La police est chargée depuis Google Fonts (nécessite une connexion internet)

## Pour aller plus loin (développement)

- **Backend** : Connecter un serveur Node.js/Python/PHP pour l'authentification réelle et la base de données
- **Base de données** : PostgreSQL ou MySQL pour stocker clients, dossiers, messages, documents
- **Authentification** : JWT + bcrypt + 2FA réel (TOTP ou SMS via Twilio)
- **Messagerie** : WebSockets (Socket.io) pour la messagerie en temps réel
- **Documents** : AWS S3 ou équivalent pour le stockage sécurisé des fichiers
- **Emails/SMS** : SendGrid / Mailjet + Twilio pour les notifications

## Identité visuelle

- Palette : Navy (#0C2340) + Or (#B8963E) + Blanc cassé (#F7F5F0)
- Typographie : Cormorant Garamond (titres) + Jost (corps de texte)
- Style : bancaire institutionnel, sobre et professionnel

---
© 2025 Meridia Banque & Crédit. Projet fictif à des fins de démonstration.
