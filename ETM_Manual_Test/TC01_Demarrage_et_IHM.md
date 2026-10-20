# TC01 — Démarrage du widget et conformité générale de l'IHM

**Objectif** : vérifier l'état initial du widget, l'organisation de l'interface
et le comportement quand le fichier des textes est absent, invalide ou
incomplet.

**Exigences couvertes**
- 2-01 — Nom « ERM Module Rebind », version v2026a.
- 2-02 — ERM v7.0.3 et versions suivantes.
- 2-03 — Navigateurs Chrome et Edge.
- 5.1-01 — Style d'ELM_AdminManager.
- 5.1-02 — Interface entièrement en anglais.
- 5.1-03 — Version affichée uniquement en pied de page.
- 5.1-04 — Quatre panneaux numérotés.
- 5.2.1-01 — Champ « Module URI » obligatoire.
- 5.2.3-02 — « Project ID » en lecture seule.
- 5.3-01 — Champ de sélection du fichier Excel obligatoire.
- 5.4.1-01 — Sélecteur de simulation sur ON au démarrage.
- 5.4.2-01 — REBIND inactif tant que ses conditions ne sont pas réunies.
- 5.6-04 — Libellés de `main.html` remplis au démarrage.
- 5.6-05 — Clé de texte introuvable affichée telle quelle, avec un avertissement dans la console.
- 5.6-06 — Fichier des textes absent ou invalide : message unique, arrêt du widget.

**Préconditions générales** : voir [00_Index.md](00_Index.md).

---

## Test Script TS01.1 — État initial et organisation de l'interface

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Dans ERM, ouvrir « Help > About » (ou la page d'information du serveur) et noter la version. | La version d'ERM est 7.0.3 ou supérieure (2-02). |
| 2 | Ouvrir le tableau de bord contenant le widget. | Le widget s'affiche avec le titre « ERM Module Rebind » (2-01). |
| 3 | Lire tous les libellés de l'interface. | L'interface est entièrement en anglais (5.1-02). Aucun libellé n'apparaît sous la forme d'une clé technique (par exemple `panel.module.label`) : tous les libellés sont remplis (5.6-04). |
| 4 | Observer l'organisation de l'interface. | Quatre panneaux se suivent : « 01 / Module » (champs « Module URI » et « Project ID »), « 02 / Excel file » (sélection du fichier), « 03 / Rebind » (sélecteur « Simulation », bouton « REBIND »), « 04 / Report » (zone de messages, en bas) (5.1-04). |
| 5 | Comparer la présentation avec le widget ELM_AdminManager. | Couleurs, polices, en-tête et panneaux sont les mêmes (5.1-01). |
| 6 | Observer l'en-tête et le pied de page. | La version n'apparaît pas dans l'en-tête. Le pied de page affiche « ERM Module Rebind · v2026a » (2-01, 5.1-03). |
| 7 | Observer le panneau « 03 / Rebind ». | Le sélecteur « Simulation » est sur ON. Aucun bandeau « LIVE MODE » n'est affiché. Le bouton s'intitule « REBIND » (5.4.1-01). |
| 8 | Observer le bouton « REBIND », alors que « Module URI » est vide et qu'aucun fichier n'est sélectionné. | Le bouton est inactif (5.2.1-01, 5.3-01, 5.4.2-01). |
| 9 | Observer le champ « Project ID » et essayer d'y saisir du texte. | Le champ est vide et en lecture seule : la saisie est impossible (5.2.3-02). |
| 10 | Recommencer les étapes 2 à 9 avec l'autre navigateur (Chrome ou Edge). | Même résultat (2-03). |

## Test Script TS01.2 — Fichier des textes absent ou invalide

**Préconditions** : sur un environnement de test, avoir accès en écriture au
dossier du widget sur le serveur.

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Renommer temporairement `resources/messages_en.json`, puis recharger le tableau de bord. | Seul le message « Unable to load resources/messages_en.json. The widget cannot start. » s'affiche. Aucun panneau n'est affiché (5.6-06). |
| 2 | Redonner son nom au fichier, puis le rendre invalide (par exemple en supprimant sa dernière accolade `}`). Recharger le tableau de bord. | Le même message unique s'affiche et aucun panneau n'est affiché (5.6-06). |
| 3 | Restaurer le fichier d'origine, puis recharger le tableau de bord. | Le widget s'affiche normalement (5.6-06). |

## Test Script TS01.3 — Clé de texte introuvable

**Préconditions** : sur un environnement de test, avoir accès en écriture au
dossier du widget sur le serveur.

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Dans `resources/messages_en.json`, renommer la clé `panel.excel.label` en `panel.excel.labelX`. Ouvrir les outils de développement du navigateur (F12), onglet « Console », puis recharger le tableau de bord. | Le widget démarre. Le titre du panneau 02 affiche la clé `panel.excel.label` au lieu de « 02 / Excel file » (5.6-05). |
| 2 | Lire la console du navigateur. | Un avertissement indique « Missing text key 'panel.excel.label' in resources/messages_en.json » (5.6-05). |
| 3 | Restaurer le fichier d'origine, puis recharger le tableau de bord. | Le titre « 02 / Excel file » s'affiche de nouveau (5.6-05). |
