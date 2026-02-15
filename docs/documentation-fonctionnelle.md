# Documentation fonctionnelle — mon-site

## 1) Objectif du projet
Ce site est une plateforme d’hommage à Jonathan, combinant :
- une **vitrine éditoriale** (accueil, page de présentation, galerie),
- un **espace d’articles chronologiques**,
- un **système communautaire de commentaires**,
- un **back-office de modération** pour les administrateurs.

L’expérience est orientée contenu émotionnel/mémoriel, avec un design immersif (thème sombre, transitions, navigation contextuelle).

---

## 2) Typologie des utilisateurs

### Visiteur non connecté
Peut :
- consulter les pages publiques (accueil, présentation, galerie, articles),
- parcourir les articles via listing et recherche,
- lire les commentaires.

Ne peut pas :
- publier/éditer/supprimer des commentaires,
- accéder à l’espace compte, posts, ou modération.

### Utilisateur connecté (rôle `user`)
Peut en plus :
- gérer son profil (nom, avatar),
- publier, modifier et supprimer ses propres commentaires,
- accéder à "Mes posts" pour retrouver ses contributions.

### Administrateur (rôle `admin`)
Peut en plus :
- accéder à l’espace de modération,
- consulter la liste utilisateurs,
- créer, éditer, supprimer des articles,
- modérer tous les commentaires (suppression/édition selon règles du composant commentaire).

---

## 3) Parcours fonctionnels principaux

## 3.1 Navigation globale
La navigation principale propose :
- **Qui est-il ?** (`/jonathan`),
- **Galerie** (`/gallery`),
- **Les articles** (accès listing + derniers articles via API),
- **Connexion / Mon compte / Modération** selon état de session et rôle.

Le menu est décliné en desktop (dropdowns) et mobile (overlay avec sections dépliables).

## 3.2 Accueil
La page d’accueil (`/`) présente :
- un hero visuel,
- des sections images d’introduction,
- une entrée dans l’univers du site.

## 3.3 Galerie média
La galerie (`/gallery`) permet :
- de basculer entre **photos** et **vidéos**,
- de rechercher un média par nom de fichier,
- d’activer un filtre **"IA améliorée"** pour les vidéos,
- d’ouvrir un média en lightbox avec navigation précédent/suivant,
- de paginer les résultats.

Les médias sont chargés depuis `public/photos`, `public/videos` et `public/ia`.

## 3.4 Consultation des articles
### Listing
La page `/dates/more` fournit :
- la liste complète des articles,
- recherche par titre / année / auteur,
- pagination,
- affichage d’un message d’erreur serveur si la récupération échoue.

### Détail d’article
La page `/dates/[year]/[slug]` affiche :
- titre,
- blocs de contenu ordonnés,
- signature auteur,
- section commentaires.

Types de blocs pris en charge :
- titre,
- paragraphe,
- citation,
- image (avec légende),
- vidéo YouTube (avec légende).

## 3.5 Commentaires
Sur une page article :
- lecture des commentaires en ordre chronologique décroissant,
- publication d’un commentaire si utilisateur connecté,
- édition/suppression autorisée à l’auteur du commentaire ou à un admin,
- mise à jour temps réel via abonnement Supabase Realtime,
- surlignage automatique d’un commentaire ciblé (`#comment-...` ou `?comment=...`).

## 3.6 Authentification & compte
### Connexion (`/login`)
- OAuth Google,
- email + mot de passe,
- callback OAuth sur `/auth/callback`.

### Inscription (`/signup`)
- création compte email/mot de passe,
- saisie username,
- upload facultatif d’une photo de profil dans le bucket `avatars`,
- mise à jour du profil applicatif.

### Mon compte (`/account`)
- consultation des informations de profil,
- modification du nom affiché,
- ajout/changement/suppression avatar.

### Mes posts (`/posts`)
- consultation des commentaires publiés par l’utilisateur,
- liens vers les commentaires sur les pages d’articles.

## 3.7 Modération (admin)
Accès protégé (`/moderation/*`) avec contrôle de rôle.

Fonctionnalités :
- **Liste utilisateurs** (`/moderation/users`) : profil, rôle, volume de commentaires,
- **Ajouter un article** (`/moderation/articles/add`) : éditeur en mode création,
- **Éditer un article** (`/moderation/articles/edit/[id]`) : édition structurée des blocs,
- **Gérer/Supprimer** (`/moderation/articles/manage`) : suppression complète (base + images du bucket `article-images` via RPC).

---

## 4) Règles d’accès et sécurité fonctionnelle
- Session rafraîchie en middleware pour toutes les routes applicatives.
- Les écrans de modération exigent un utilisateur authentifié avec rôle `admin`.
- Les écrans `/account` et `/posts` demandent une session active (sinon CTA vers connexion).
- Les opérations sensibles (suppression article, upload avatar/image, édition commentaires) passent par Supabase (Auth + DB + Storage + politiques RLS côté base attendues).

---

## 5) Modèle de données métier (vu côté application)

Tables utilisées :
- `profiles` : identité utilisateur, rôle, email, avatar,
- `articles` : métadonnées d’article (titre, slug, auteur, dates),
- `article_blocks` : contenu structuré ordonné par bloc,
- `comments` : commentaires liés à un identifiant d’article canonique.

Stockage objets :
- `avatars` : photos de profil,
- `article-images` : images insérées dans les articles.

Mécanisme complémentaire :
- RPC `delete_article_cascade` pour suppression atomique d’un article et de ses dépendances.

---

## 6) API interne
### `GET /api/articles/latest`
Retourne les 3 derniers articles (titre, année, URL) pour alimenter la navigation "Les articles".

---

## 7) Dépendances d’exécution
Variables d’environnement requises :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ou `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

Sans ces variables, les clients Supabase (serveur et navigateur) ne peuvent pas fonctionner.

---

## 8) Résumé fonctionnel
Le produit couvre un besoin complet de **site hommage éditorial** avec :
- diffusion de contenus multimédias,
- authentification moderne,
- interaction communautaire (commentaires temps réel),
- outils de gouvernance (modération utilisateurs + contenus).

La structure actuelle est adaptée pour évoluer vers des besoins supplémentaires (catégorisation avancée, workflows éditoriaux, analytics, etc.).
