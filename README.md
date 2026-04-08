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
Penser à **activer les scripts utilisateurs** dans les réglages de l'extension Tampermonker

### Installation manuelle

1. Télécharger `UNESS___SDD___ECOS-14_0_user.js`
2. Ouvrir le dashboard Tampermonkey → onglet **Utilitaires** → **Importer depuis un fichier**
3. Sélectionner le fichier `.user.js`

---

## Fonctionnalités

### 📋 Liste des SDD

- **Redesign complet** des pages Uness
- **Recherche instantanée** par nom, numéro, tag ou spécialité
- **Filtres combinables** : par statut (à faire / en cours / fait), par spécialité, par révision due, par présence ECOS
- **Révision espacée** (J+1, J+3, J+7, J+30) : badge orange quand une SDD est à réviser

---

## Raccourcis & astuces

| Action | Comment |
|---|---|
| Fermer une preview | `Echap` ou clic hors de la modale |
| Recherche rapide | Commencer à taper dans la barre de recherche (liste SDD) |

---

## FAQ & Dépannage

**Le script ne se charge pas**
Vérifier que Tampermonkey est actif et que l'URL correspond à `livret.uness.fr/lisa/2025/…`. Le script ne s'active que sur les pages matchées (`Catégorie:Situation_de_départ` et `*_SDD-*`).

**Les notes ne se synchronisent pas**
Vérifier la connexion cloud : le script doit demander un email/PIN au premier lancement. Si le push échoue silencieusement, tenter `cloudDisconnect()` puis se reconnecter.

**La synthèse communautaire ne se génère pas**
Il faut au minimum 1 note sur la SDD (configurable via `CFG.community.minNotes`). La synthèse est mise en cache 24h. Si la Cloud Function échoue, un message d'erreur s'affiche dans le panneau.

---

## Contribuer

Le code source est hébergé sur [GitHub](https://github.com/WalterHeerdt/UnessLiSA). Pour signaler un bug ou proposer une amélioration, ouvrir une [issue](https://github.com/WalterHeerdt/UnessLiSA/issues).

---

*Développé pour la promo DFASM3 2026 — bon courage pour les ECOS !* 🩺
