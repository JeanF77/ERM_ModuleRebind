# TC14 — Revue des livrables et du déploiement

**Objectif** : vérifier le contenu du dossier livré, l'origine des librairies,
les documents livrés et le déploiement du widget comme gadget OpenSocial.

Dans ETM, la méthode de vérification de TS14.1 est la revue (inspection) ;
TS14.2 est un test de déploiement.

**Exigences couvertes**
- 2-04 — Fichiers hébergés sur le serveur ERM, widget déclaré comme gadget OpenSocial (`main.xml`).
- 4-01 — Widget construit à la racine du projet.
- 4-02 — `main.xml` : titre, icône, aucune UserPref.
- 4-03 à 4-05 — `main.html`, `css/`, `js/`.
- 4-06 — `lib/` : jQuery 3.7.1 et SheetJS 0.20.3 avec son fichier `LICENSE`.
- 4-07 — `resources/` : icône `attach_file.png` 24 × 24 px (aussi favicon) et `messages_en.json`.
- 4-08 — Bootstrap et Bootstrap Icons chargés depuis `../ELM_sharedLib/`.
- 4-09 — `README.md` et `ETM_Manual_Test/` à la racine du projet.
- 4-10 — SheetJS téléchargé sur le site officiel, et non sur npm.
- 8-01 — Code du widget livré.
- 8-02 — `README.md` sur le modèle d'ELM_AdminManager.
- 8-03 — Cas de test ETM sur le modèle d'ELM_AdminManager.
- 8-04 — Cas de test rédigés en français.
- 8-05 — Exigences couvertes désignées par les numéros de section de la spécification.
- 8-06 — Pas de fichier `.jazzignore`.

**Préconditions** : accès au dossier du widget livré (ou à son dépôt) et à un
environnement ERM de test où un administrateur peut déclarer un gadget.

---

## Test Script TS14.1 — Contenu du dossier livré

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Lister la racine du projet. | Elle contient `main.xml`, `main.html`, `css/`, `js/`, `lib/`, `resources/`, `README.md` et `ETM_Manual_Test/` : le widget est construit à la racine (4-01, 4-03, 4-04, 4-05, 4-09, 8-01). |
| 2 | Ouvrir `main.xml`. | Il déclare un gadget OpenSocial de titre « ERM Module Rebind », avec l'icône `resources/attach_file.png`. Il n'a aucune `UserPref` (2-04, 4-02). |
| 3 | Lister `lib/`. | Il contient `jquery/jquery-3.7.1.min.js`, ainsi que `xlsx-0.20.3/xlsx.full.min.js` et son fichier `LICENSE` (4-06). |
| 4 | Calculer l'empreinte SHA-256 de `lib/xlsx-0.20.3/xlsx.full.min.js` et la comparer à celle du fichier `https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js`. | Les empreintes sont identiques : la librairie vient du site officiel de SheetJS, et non du registre npm (4-10). |
| 5 | Lister `resources/` et ouvrir les propriétés de `attach_file.png`. | Le dossier contient `attach_file.png` (24 × 24 px) et `messages_en.json`. `main.html` déclare `attach_file.png` comme favicon (4-07). |
| 6 | Lire les balises `<link>` et `<script>` de Bootstrap dans `main.html`. | Bootstrap 5.3.3 et Bootstrap Icons 1.13.1 sont chargés depuis `../ELM_sharedLib/`, avec les mêmes chemins qu'ELM_AdminManager (4-08). |
| 7 | Chercher un fichier `.jazzignore` dans le dossier livré. | Il n'y en a pas (8-06). |
| 8 | Comparer `README.md` avec celui d'ELM_AdminManager. | Il présente le widget avec les mêmes rubriques : description, fonctions, technologies, structure du projet, déploiement (8-02). |
| 9 | Ouvrir `ETM_Manual_Test/`. | Il contient un index, puis des Test Cases (objectif, exigences couvertes, préconditions, Test Scripts « # / Action / Résultat attendu »), sur le modèle d'ELM_AdminManager (8-03). Les Test Cases sont rédigés en français (8-04). Les exigences couvertes sont désignées par des repères de la forme `<section>-<rang>`, qui commencent par le numéro de section de la spécification (8-05). |

## Test Script TS14.2 — Déploiement du widget

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Copier le dossier du widget sur le serveur ERM, à côté de `ELM_sharedLib/`. | Les fichiers du widget sont hébergés sur le serveur ERM (2-04). |
| 2 | Déclarer `main.xml` comme gadget OpenSocial dans ERM, sans renseigner de préférence. | Le gadget est déclaré. Aucune préférence n'est demandée (2-04, 4-02). |
| 3 | Ajouter le gadget à un tableau de bord. | Le widget s'affiche avec son icône et le titre « ERM Module Rebind », et ses styles Bootstrap sont appliqués : `../ELM_sharedLib/` est bien résolu (4-07, 4-08). |
| 4 | Ouvrir `main.html` directement dans un onglet du navigateur. | L'onglet affiche l'icône `attach_file.png` comme favicon (4-07). |
