# Meridia Admin — Guide d'intégration Supabase

## Structure du projet admin

```
meridia-admin/
├── admin.html        ← Interface complète de l'espace admin
├── css/
│   └── admin.css     ← Tous les styles de l'admin
├── js/
│   ├── data.js       ← Données de démo (à remplacer par Supabase)
│   └── admin.js      ← Logique UI, navigation, actions
└── INTEGRATION.md    ← Ce fichier
```

---

## Étape 1 — Ajouter le SDK Supabase

Dans `admin.html`, avant les balises `<script>` existantes :

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const supabase = window.supabase.createClient(
    'https://VOTRE_ID.supabase.co',
    'VOTRE_ANON_KEY'
  );
</script>
```

---

## Étape 2 — Remplacer les données de démo

Dans `js/data.js`, remplacez les tableaux statiques par des appels API.

### Charger les dossiers de prêt

```javascript
// Remplace : const LOANS = [...];
async function loadLoans() {
  const { data, error } = await supabase
    .from('loans')
    .select(`
      *,
      users ( full_name, email, city )
    `)
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return []; }
  return data;
}
```

### Charger les clients

```javascript
async function loadClients() {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false });
  return data || [];
}
```

### Charger les messages

```javascript
async function loadMessages() {
  const { data } = await supabase
    .from('messages')
    .select(`
      *,
      from:users!from_id ( full_name, avatar ),
      to:users!to_id ( full_name )
    `)
    .order('created_at', { ascending: false });
  return data || [];
}
```

### Charger les documents

```javascript
async function loadDocuments() {
  const { data } = await supabase
    .from('documents')
    .select(`
      *,
      users ( full_name ),
      loans ( reference )
    `)
    .order('created_at', { ascending: false });
  return data || [];
}
```

---

## Étape 3 — Actions en temps réel

### Valider un dossier de prêt

```javascript
// Dans admin.js — remplace la fonction validateLoan()
async function validateLoan(id, decision) {
  const { error } = await supabase
    .from('loans')
    .update({
      status:      decision,
      reviewed_at: new Date().toISOString(),
      reviewed_by: currentAdminId
    })
    .eq('id', id);

  if (error) { showToast('Erreur : ' + error.message); return; }

  // Envoyer une notification email au client
  await supabase.functions.invoke('notify-client', {
    body: { loanId: id, decision }
  });

  showToast(decision === 'active' ? 'Dossier validé.' : 'Dossier refusé.');
  renderLoans();
}
```

### Valider un document

```javascript
async function verifyDoc(id) {
  await supabase
    .from('documents')
    .update({ status: 'verified', verified_at: new Date().toISOString() })
    .eq('id', id);
  showToast('Document validé.');
  renderDocuments();
}
```

### Envoyer un message à un client

```javascript
async function sendAdminReply() {
  const text = document.getElementById('admin-msg-input').value.trim();
  if (!text) return;

  await supabase.from('messages').insert({
    from_id:  currentAdminId,
    to_id:    currentClientId,
    loan_id:  currentConv.loanId,
    content:  text,
    read:     false
  });

  showToast('Message envoyé.');
}
```

---

## Étape 4 — Messagerie en temps réel (WebSockets)

Supabase supporte nativement les WebSockets (Realtime).

```javascript
// S'abonner aux nouveaux messages en temps réel
const channel = supabase
  .channel('admin-messages')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      console.log('Nouveau message:', payload.new);
      updateBadges();
      if (currentPanel === 'messaging') renderMessaging();
    }
  )
  .subscribe();
```

---

## Étape 5 — Sécuriser l'accès admin

### Row Level Security — seuls les admins accèdent à tout

```sql
-- Dans Supabase SQL Editor

-- Admins voient tous les dossiers
CREATE POLICY "admin_loans_all" ON loans
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Admins voient tous les messages
CREATE POLICY "admin_messages_all" ON messages
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- Admins voient tous les documents
CREATE POLICY "admin_docs_all" ON documents
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### Protéger la page admin.html

```javascript
// En haut de admin.js — vérifier le rôle avant d'afficher quoi que ce soit
async function checkAdminAccess() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { location.href = '/auth.html'; return; }
  const role = session.user.user_metadata?.role;
  if (role !== 'admin') { location.href = '/index.html'; return; }
  currentAdminId = session.user.id;
}

// Appeler au chargement
document.addEventListener('DOMContentLoaded', async () => {
  await checkAdminAccess();
  goPanel('dashboard');
});
```

### Créer un compte admin (Supabase Dashboard)

```sql
-- Dans Supabase SQL Editor
-- Après inscription normale, mettre à jour le rôle :
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'
WHERE email = 'admin@meridia-credit.fr';
```

---

## Déploiement

1. Copier le dossier `meridia-admin/` à la racine de votre projet
2. Déployer sur Vercel (même repo que le site principal)
3. L'admin sera accessible sur : `https://meridia-credit.fr/admin.html`
4. Protéger via `.htaccess` ou middleware Vercel si besoin d'IP whitelist

---

## Checklist avant mise en production

- [ ] SDK Supabase intégré dans admin.html
- [ ] Clés API dans les variables d'environnement Vercel (pas dans le code)
- [ ] Row Level Security activé sur toutes les tables
- [ ] Vérification du rôle admin au chargement de la page
- [ ] Seuls les emails @meridia-credit.fr peuvent être admins
- [ ] Logs d'audit activés (Supabase Dashboard → Logs)
- [ ] 2FA activé sur le compte Supabase

---

© 2025 Meridia Banque & Crédit — Usage interne uniquement.
