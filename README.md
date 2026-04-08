# UNESS – SDD + ECOS 🩺

**Transforme ton livret LISA 2025 en véritable outil de révision pour l'EDN et les ECOS.**

Un script qui s'installe en 2 minutes dans ton navigateur et qui ajoute plein de fonctionnalités directement sur le site du livret LISA : suivi de ta progression, notes personnelles, stations ECOS avec timer et scoring, synthèses IA, et bien plus.

![Version](https://img.shields.io/badge/version-14.0-6366f1)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## C'est quoi exactement ?

Quand tu installes ce script, deux choses changent sur ton livret LISA :

**1. La liste des SDD** devient un vrai dashboard de révision :
- Tu vois d'un coup d'œil ce que tu as fait, ce qui est en cours, ce qu'il te reste
- Tu peux chercher, filtrer par spécialité, par statut, par révisions à faire
- Tu as des stats de progression, un calendrier d'activité, et un tirage aléatoire de stations ECOS

**2. Chaque fiche SDD** devient un espace de travail complet :
- Tu peux prendre des notes directement sur la page (elles se sauvegardent toutes seules)
- Tu accèdes aux stations ECOS uploadées par la promo, avec un vrai timer 8 min + 3 min débrief
- Tu peux te noter sur une grille et suivre tes scores par matière
- Une synthèse IA résume les notes de la communauté pour chaque SDD

> Tout se synchronise entre tes appareils grâce à un compte cloud (email + PIN).

---

## Comment installer ?

### Ce qu'il te faut

- Un ordi avec **Chrome**, **Firefox**, **Edge** ou **Safari**
- L'extension gratuite **[Tampermonkey](https://www.tampermonkey.net/)** (ça prend 30 secondes)

### Installation en 2 clics

1. **Installe Tampermonkey** depuis le store de ton navigateur si ce n'est pas déjà fait
2. **Clique ici pour installer le script** → **[Installer](https://raw.githubusercontent.com/WalterHeerdt/UnessLiSA/main/uness-sdd-enhanced.user.js)**
3. Tampermonkey te montre le script → clique **Installer**
4. Va sur le [livret LISA 2025](https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part) — c'est prêt !

> Les mises à jour se font automatiquement, tu n'as rien à faire.

<details>
<summary>📦 Installation manuelle (si le lien ne marche pas)</summary>

1. Télécharge le fichier `UNESS___SDD___ECOS-14_0_user.js`
2. Ouvre Tampermonkey dans ton navigateur → onglet **Utilitaires**
3. Clique **Importer depuis un fichier** et sélectionne le fichier

</details>

---

## Ce que ça change concrètement

### 📋 Sur la liste des SDD

| Avant (LISA brut) | Après (avec le script) |
|---|---|
| Simple liste de liens | Cards colorées par spécialité |
| Aucun suivi | Statut par SDD : à faire → en cours → fait |
| Pas de recherche | Recherche instantanée par nom, numéro, spécialité |
| Rien sur les ECOS | Point rouge sur les SDD avec des stations ECOS dispo |

**En bonus :**
- 🔄 **Révision espacée** — le script te rappelle quand réviser (J+1, J+3, J+7, J+30)
- 🎲 **Tirage aléatoire** — lance une station ECOS au hasard pour t'entraîner
- 📊 **Stats** — progression globale, par spécialité, streak de jours, heatmap d'activité

### 📝 Sur chaque fiche SDD

- **Notes perso** — un éditeur intégré, sauvegarde automatique, synchronisé entre tes appareils
- **Synthèse IA** — un résumé généré par GPT-4o à partir des notes de toute la promo
- **Explication des attendus** — clique sur ✦ à côté d'un attendu pour avoir une explication IA

### 🏥 Module ECOS

- **Stations partagées** — la promo uploade des PDF/images de stations, tout le monde y accède
- **Preview plein écran** — ouvre un PDF avec un panneau de scoring à côté
- **Timer intégré** — 8 min de station + 3 min de débrief, avec alerte visuelle quand le temps file
- **Grille de notation** — coche tes points, le script calcule ta note /20
- **Suivi des scores** — tes notes sont sauvegardées et visibles dans les stats par matière
- **Rating communautaire** — note les stations /5 pour aider les autres à trouver les meilleures

---

## Première utilisation

Au premier lancement, le script te demande un **email** et un **PIN** pour créer ton compte cloud. Ça permet de :
- Sauvegarder ta progression en ligne
- Synchroniser entre plusieurs appareils
- Participer aux fonctionnalités communautaires (synthèses IA, ratings ECOS)

> Ton email sert uniquement à t'identifier, aucun spam ne sera envoyé.

---

## Raccourcis utiles

| Tu veux… | Fais ça |
|---|---|
| Fermer une preview ECOS | Appuie sur `Echap` ou clique en dehors |
| Chercher une SDD | Tape directement dans la barre de recherche en haut |
| Lancer le timer ECOS | ▶ Démarrer → ⏸ Pause → ▶ Reprendre → ↺ Reset |

---

## Un problème ?

<details>
<summary>🔴 Le script ne se charge pas</summary>

- Vérifie que Tampermonkey est bien activé (icône en haut à droite du navigateur)
- Vérifie que tu es sur la bonne page : `livret.uness.fr/lisa/2025/…`
- Essaie de rafraîchir la page (Ctrl+R)

</details>

<details>
<summary>🔴 Mes notes ne se synchronisent pas</summary>

- Vérifie que tu es connecté (le script demande email/PIN au premier lancement)
- Si ça ne marche toujours pas, ouvre la console du navigateur (F12 → Console), tape `cloudDisconnect()` et valide, puis recharge la page pour te reconnecter

</details>

<details>
<summary>🔴 Les fichiers ECOS n'apparaissent pas</summary>

- Les fichiers supprimés sont automatiquement masqués, c'est normal
- Le cache se rafraîchit toutes les 6h — attends un peu après un nouvel upload

</details>

<details>
<summary>🔴 Erreur quand je sauvegarde un score ECOS</summary>

- Ta session a peut-être expiré : déconnecte-toi et reconnecte-toi
- Ouvre la console (F12 → Console) pour voir le détail de l'erreur

</details>

<details>
<summary>🔴 La synthèse IA ne se génère pas</summary>

- Il faut qu'au moins une personne ait pris des notes sur cette SDD
- La synthèse est mise en cache 24h — si elle vient d'être générée, elle ne se relancera pas tout de suite

</details>

---

## Contribuer / Signaler un bug

Le code est sur [GitHub](https://github.com/WalterHeerdt/UnessLiSA). Si tu trouves un bug ou que tu as une idée d'amélioration, ouvre une [issue](https://github.com/WalterHeerdt/UnessLiSA/issues) — même un message simple ça aide !

---

## ☕ Soutenir le projet

Ce script est gratuit et le restera. Si tu trouves qu'il t'aide dans tes révisions et que tu veux me payer un café, c'est par ici :

**[☕ Me soutenir sur Ko-fi](https://ko-fi.com/leo960664)**

Merci, ça fait plaisir et ça motive à continuer ! 🙏

---

*Fait pour la promo DFASM3 2026 — bon courage pour les ECOS !* 🩺
