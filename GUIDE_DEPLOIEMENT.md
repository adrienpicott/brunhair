# 🚀 Brunair — Guide de déploiement (Phase 0)

Guide pour **toi** (Adrien). Le guide d'utilisation pour Bruna (en anglais) viendra en Phase 4, une fois l'app remplie.

Stack : **Next.js 14 + Supabase (auth réelle + RLS) + Vercel**. App en anglais, 2 utilisateurs, données de santé → tout est cloisonné par utilisateur.

---

## 0. Vue d'ensemble (ordre des opérations)

1. Créer le projet Supabase `brunair`
2. Exécuter les 4 fichiers SQL **dans l'ordre**
3. Vérifier le bucket `media` (privé)
4. Créer les 2 comptes (Bruna + toi)
5. Récupérer URL + clé anon → `.env.local`
6. Pousser le repo `brunair` sur GitHub
7. Connecter Vercel + variables d'env → déployer
8. Tester l'isolation RLS

---

## 1. Projet Supabase

1. https://supabase.com → **New project** → nom `brunair`, région **EU (Frankfurt)** (RGPD, données santé).
2. Note bien le **mot de passe DB** (tu n'en as pas besoin ici mais garde-le).

## 2. Exécuter le SQL (dossier `supabase/`)

**SQL Editor** → New query → colle et exécute **dans cet ordre**, un fichier à la fois :

1. `01_foundation.sql` → extension + `set_updated_at` + tables de référence (`actives`, `knowledge_articles`)
2. `02_products_routines.sql` → produits, interventions (la matrice), routines + observance
3. `03_daily_logs.sql` → cycle, compléments, nutrition, biométrie, événements, chute, cuir chevelu
4. `04_photos_medical_agent.sql` → photos, bilans sanguins, sorties agent, **bucket `media` privé**

> Les scripts sont **idempotents** : tu peux les ré-exécuter sans casse. Si un import échoue à mi-chemin, relance le fichier entier.

**Vérif rapide** (SQL Editor) :
```sql
select count(*) as tables
from information_schema.tables
where table_schema = 'public';  -- attendu : 21
```

## 3. Vérifier le Storage

**Storage** → tu dois voir un bucket **`media`** marqué **Private** (créé par le script 04). Si absent, ré-exécute `04_…`.
Les fichiers seront rangés en `{user_id}/photos/…`, `{user_id}/medical/…`, etc. La policy bloque tout accès hors de son propre dossier. Les images s'affichent via **URL signée** (helper `lib/storage.ts`).

## 4. Créer les 2 comptes

**Authentication → Users → Add user → Create new user** :

- **Bruna** : son email + un mot de passe → ✅ coche **Auto Confirm User**
- **Toi** : ton email + mot de passe → ✅ **Auto Confirm User**

> Pas d'inscription publique : la page de login ne propose pas de sign-up, c'est volontaire. Pour ajouter/retirer un compte plus tard, ça se passe ici.

**Désactiver les inscriptions ouvertes** : Authentication → **Providers → Email** → désactive *"Enable sign-ups"* (sécurité : seuls les comptes que tu crées existent).

## 5. Variables d'environnement

**Settings → API** → copie :
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

En local : `cp .env.example .env.local` puis remplis les 2 valeurs.
> La clé **anon** est faite pour le client (la RLS protège les données). Ne mets **jamais** la clé `service_role` dans le front.

Test local :
```bash
npm install
npm run dev   # http://localhost:3000 → redirige vers /login
```

## 6. GitHub

1. Crée un repo **vide** `brunair` (privé) sur GitHub.
2. Pousse tout le contenu livré (racine = `package.json`, `app/`, `components/`, `lib/`, `types/`, `supabase/`).
   - Via l'UI web : "uploading an existing file" → glisse l'arborescence. Ou en CLI :
   ```bash
   git init && git add . && git commit -m "Phase 0 — foundation"
   git branch -M main
   git remote add origin https://github.com/adrienpicott/brunair.git
   git push -u origin main
   ```

## 7. Vercel

1. https://vercel.com → **Add New → Project** → importe `brunair`.
2. Framework détecté : **Next.js**. Laisse les réglages par défaut.
3. **Environment Variables** → ajoute les 2 mêmes que `.env.local` :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy**. À chaque push sur `main`, Vercel redéploie.

> Pense à ajouter l'URL Vercel finale dans Supabase → **Authentication → URL Configuration → Site URL / Redirect URLs** (utile pour la suite).

## 8. Tester l'isolation RLS (important)

1. Connecte-toi avec **ton** compte → tu vois le dashboard, **aucune donnée de Bruna**.
2. Connecte-toi avec le compte **Bruna** → idem, isolé.
3. (Optionnel, en Phase 1 quand il y aura des données) : crée une ligne avec un compte, vérifie qu'elle n'apparaît pas sur l'autre.

---

## 🔐 Rappel sur le modèle d'accès choisi

- **Données perso** (produits, photos, bilans, cycle, journaux) → **owner-scoped** : chaque utilisateur ne voit **que** ses propres données. Toi inclus → tu ne vois pas les données de Bruna dans l'app.
- **Bibliothèque scientifique** (`actives`, `knowledge_articles`) → **partagée** : vous deux y accédez.
- **Pour débugger sur ses données réelles** : tu passes par le **dashboard Supabase** (Table Editor / SQL, service role) — délibérément, pas via l'app.

### Tu veux plutôt que vous voyiez TOUS LES DEUX toutes les données ?
Dis-le moi et je te fournis un script qui remplace, sur chaque table perso, la policy
`using (user_id = auth.uid())` par `using (true)` (lecture/écriture partagée entre comptes authentifiés). 1 script, idempotent.

---

## ✅ Ce qui est livré en Phase 0

- 21 tables + RLS + bucket privé (4 fichiers SQL)
- Auth réelle Supabase (login EN, pas de sign-up public, garde de route)
- Client Supabase + helper Storage (upload + URL signée) + types TS des 21 tables
- Layout + NavBar + **dashboard shell** listant les 10 modules à venir

## ⏭️ Phase 1 (prochaine session) — le « maintenant »
Les pages de saisie réelles : **Products & Actives**, **Interventions** (la matrice), **Routines + observance**, **Cycle/Règles**, **Blood Panels**. Owner-scoped, en anglais, brique après brique.

> Dis « on lance la Phase 1 » quand tu as déployé et testé la Phase 0.
