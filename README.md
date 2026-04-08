# UNESS – SDD + ECOS

> Userscript Tampermonkey qui transforme le livret LISA 2025 en outil de révision pour les ECOS.

![Version](https://img.shields.io/badge/version-14.0-6366f1)
![Platform](https://img.shields.io/badge/platform-Tampermonkey-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Sommaire

- [Aperçu](#aperçu)
- [Installation](#installation)
- [Fonctionnalités](#fonctionnalités)
- [Architecture technique](#architecture-technique)
- [Configuration](#configuration)
- [Raccourcis & astuces](#raccourcis--astuces)
- [FAQ & Dépannage](#faq--dépannage)

---

## Aperçu

Le script s'injecte sur deux types de pages du livret LISA :

| Page | URL | Ce que le script fait |
|---|---|---|
| **Liste SDD** | `Catégorie:Situation_de_départ` | Redesign complet : recherche, filtres, statuts, stats, tirage aléatoire ECOS |
| **Page SDD individuelle** | `*_SDD-*` | Redesign de la fiche : notes Markdown, synthèse IA communautaire, upload/preview ECOS, grille de scoring |

---

## Installation

### Prérequis

- Navigateur desktop (Chrome, Firefox, Edge, Safari)
- Extension [Tampermonkey](https://www.tampermonkey.net/) installée

### Installation rapide

1. Cliquer sur le lien d'installation directe :
   **[Installer le script](https://raw.githubusercontent.com/WalterHeerdt/UnessLiSA/main/uness-sdd-enhanced.user.js)**
2. Tampermonkey affiche le script → cliquer **Installer**
3. Naviguer sur le [livret LISA 2025](https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part)

Les mises à jour sont automatiques via Tampermonkey.

### Installation manuelle

1. Télécharger `UNESS___SDD___ECOS-14_0_user.js`
2. Ouvrir le dashboard Tampermonkey → onglet **Utilitaires** → **Importer depuis un fichier**
3. Sélectionner le fichier `.user.js`

---

## Fonctionnalités

### 📋 Liste des SDD

- **Redesign complet** de la page catégorie avec typographie Inter, cards, couleurs par famille de spécialité
- **Recherche instantanée** par nom, numéro, tag ou spécialité
- **Filtres combinables** : par statut (à faire / en cours / fait), par spécialité, par révision due, par présence ECOS
- **Statut tripartite** : À faire → En cours → Fait, avec date de complétion
- **Révision espacée** (J+1, J+3, J+7, J+30) : badge orange quand une SDD est à réviser
- **Point rouge ECOS** : indicateur visuel pour les SDD ayant des stations ECOS uploadées
- **Tirage aléatoire ECOS** : lance une station au hasard parmi les SDD filtrées

### 📊 Statistiques & Dashboard

- **Compteurs** : faites, en cours, à faire, progression %, à réviser, total
- **Streak** : nombre de jours consécutifs avec au moins une SDD complétée
- **Heatmap GitHub-style** : activité sur les 12 derniers mois
- **Progression par spécialité** : barres de progression par tag
- **Notes ECOS par matière** : moyenne, min, max par spécialité (chargé depuis Firestore)

### 📝 Page SDD individuelle

- **Notes Markdown** : éditeur Toast UI (WYSIWYG + Markdown), sauvegarde automatique toutes les 4 secondes
- **Synthèse communautaire IA** : résumé GPT-4o des notes de la communauté, mis en cache 24h, généré via Cloud Function Firebase
- **Explication IA des attendus** : bouton ✦ sur chaque attendu pour obtenir une explication GPT-4o (avec cache Firestore)
- **Cards collapsibles** : objectifs, attendus, items, ECOS — chaque section se replie indépendamment

### 🏥 Module ECOS

- **Upload de stations** : drag & drop ou sélection de fichiers (PDF, PNG, JPEG, max 50 Mo), avec métadonnées (source, spécialité)
- **Preview PDF** en modale plein écran avec panneau de scoring à droite
- **Notation /5** par fichier : système de rating communautaire avec moyenne affichée
- **Checkbox "station faite"** : suivi par fichier
- **Vérification HEAD** : filtre automatique des fichiers 404 à l'affichage
- **Suppression** : possible par l'auteur ou l'admin

### ⏱ Panneau de scoring ECOS (v14)

Le panneau à droite de la preview PDF contient :

1. **Lien SDD** : accès direct à la fiche SDD correspondante
2. **Timer ECOS** : 8 min station + 3 min débrief, avec barre de progression, changement de couleur (warning à 25%, danger à 12.5%), transition automatique entre phases, haptics mobile
3. **Bloc notes** : textarea libre pour noter ses réponses et idées pendant la station (non persisté)
4. **Grille de notation** : boutons 1→N cliquables (total configurable), score affiché en direct
5. **Score final** : note normalisée sur 20 = `(points cochés / total) × 20`
6. **Sauvegarde Firestore** : enregistre le score avec métadonnées (matière, SDD, date)

### ☁️ Cloud & Sync

- **Authentification Firebase** : login par email/PIN via Identity Toolkit
- **Sync bidirectionnelle** : push/pull des statuts, notes, dates, révisions vers Firestore
- **Debounce intelligent** : push déclenché 900ms après la dernière modification
- **Stockage Firebase Storage** : fichiers ECOS uploadés dans `ecos/{sddN}/`

---

## Architecture technique

```
Tampermonkey (GM_setValue/getValue)     ← stockage local
        │
        ├── Liste SDD ──── parse HTML → items[] → render avec filtres/recherche
        │                              └── statsModal (heatmap, barres, scores ECOS)
        │
        └── Page SDD ──── redesignSDDPage()
                           ├── Notes Markdown (Toast UI Editor)
                           ├── Synthèse communautaire (Cloud Function → GPT-4o)
                           ├── ECOS Card
                           │    ├── loadEcosFiles() ← Firestore
                           │    ├── uploadEcosFile() → Firebase Storage + Firestore
                           │    └── openEcosPreviewV14()
                           │         ├── iframe PDF
                           │         └── Scoring Panel (timer + notes + grille + save)
                           └── Cloud sync (push/pull)
```

### Stack

| Composant | Technologie |
|---|---|
| Runtime | Tampermonkey (GM APIs) |
| Éditeur Markdown | Toast UI Editor (CDN) |
| Backend | Firebase (Firestore, Storage, Auth, Cloud Functions v2) |
| IA | GPT-4o via Cloud Function `explainAttendant` + synthèse communautaire |
| Typographie | Inter (Google Fonts) |
| Haptics mobile | API externe `haptics.lochie.me` |

### Firebase

- **Projet** : `uneisa-26e34`
- **Storage bucket** : `uneisa-26e34.firebasestorage.app`
- Collections Firestore :
  - `users/{uid}/state` — sync locale (statuts, notes, dates)
  - `users/{uid}/ecosScores/{sddN_fileId}` — scores ECOS
  - `ecos/{sddN}/files/{fileId}` — métadonnées fichiers ECOS
  - `ecos/{sddN}/ratings/{fileId}` — ratings communautaires /5
  - `community/{sddN}` — synthèses IA mises en cache

---

## Configuration

Les paramètres principaux sont dans l'objet `CFG` en haut du script :

| Paramètre | Défaut | Description |
|---|---|---|
| `cacheTTLms` | 48h | Durée de cache de la liste SDD |
| `ecosCacheTTLms` | 6h | Durée de cache de présence ECOS |
| `autosaveDelay` | 4000ms | Délai avant sauvegarde auto des notes |
| `ecos.maxFileSizeMB` | 50 | Taille max d'upload |
| `cloud.pushDebounceMs` | 900ms | Debounce avant push cloud |

---

## Raccourcis & astuces

| Action | Comment |
|---|---|
| Fermer une preview | `Echap` ou clic hors de la modale |
| Recherche rapide | Commencer à taper dans la barre de recherche (liste SDD) |
| Timer ECOS | ▶ Démarrer → ⏸ Pause → ▶ Reprendre / ↺ Reset |
| Déconnecter le cloud | Console JS : `cloudDisconnect()` |
| Reset credentials | Console JS : `debugCloudReset()` |
| Forcer un refresh de la liste | Supprimer le cache local via `GM_deleteValue('uness_sdd_v5')` |

---

## FAQ & Dépannage

**Le script ne se charge pas**
Vérifier que Tampermonkey est actif et que l'URL correspond à `livret.uness.fr/lisa/2025/…`. Le script ne s'active que sur les pages matchées (`Catégorie:Situation_de_départ` et `*_SDD-*`).

**"⚠ Erreur" au save du score ECOS**
Ouvrir la console (F12 → Console), chercher `[ECOS Score Save]` pour le message d'erreur exact. Causes possibles : session expirée (se reconnecter), règles Firestore restrictives, ou fichier sans ID valide.

**Les notes ne se synchronisent pas**
Vérifier la connexion cloud : le script doit demander un email/PIN au premier lancement. Si le push échoue silencieusement, tenter `cloudDisconnect()` puis se reconnecter.

**Les fichiers ECOS n'apparaissent pas**
Le script fait un HEAD check sur chaque URL. Si le fichier a été supprimé du Storage mais pas de Firestore, il sera filtré. Le cache de présence ECOS se rafraîchit toutes les 6h.

**La synthèse communautaire ne se génère pas**
Il faut au minimum 1 note sur la SDD (configurable via `CFG.community.minNotes`). La synthèse est mise en cache 24h. Si la Cloud Function échoue, un message d'erreur s'affiche dans le panneau.

---

## Contribuer

Le code source est hébergé sur [GitHub](https://github.com/WalterHeerdt/UnessLiSA). Pour signaler un bug ou proposer une amélioration, ouvrir une [issue](https://github.com/WalterHeerdt/UnessLiSA/issues).

---

*Développé pour la promo DFASM3 2026 — bon courage pour les ECOS !* 🩺
