# TC13 — Revue du code source

**Objectif** : vérifier, par une revue du code, les contraintes de codage, le
découpage du code, la gestion des textes, les constantes internes et les
comportements qu'on ne peut pas provoquer sur un vrai serveur ERM.

Dans ETM, la méthode de vérification de ce Test Case est la revue
(inspection). Chaque étape est un point de contrôle : le résultat attendu est
le constat à faire dans le code.

**Exigences couvertes**
- 3-01 à 3-13 — Contraintes de codage : commentaires, JSDoc, anglais, jQuery 3.7.1, Bootstrap 5.3.3 et Bootstrap Icons 1.13.1, librairies tierces, SheetJS 0.20.3, textes dans `messages_en.json`, console en anglais, code non monolithique, cartouches.
- 4.1-01 à 4.1-06 — Découpage du code JavaScript.
- 5.2.3-04 — Caractères admis dans « Project ID ».
- 5.2.4-02 — Nom du projet utilisé seulement pour l'affichage.
- 5.6-01 à 5.6-04 — Textes dans `messages_en.json`, clés hiérarchiques, marqueurs nommés, attribut `data-text-key`.
- 6.1-06 — Fichier Excel lu avec SheetJS Community Edition 0.20.3.
- 7.1-02 — Variantes d'en-têtes OSLC essayées en cas de refus 403.
- 7.3-01 à 7.3-05 — Constantes internes.
- 7.6-05 — Échec de la tâche serveur : cause affichée en erreur.
- 7.7-02 — Écriture refusée si la structure a changé (`If-Match`, HTTP 412).
- 8-07 — Cartouche sur chaque fichier source.

**Préconditions** : accès au dossier du widget livré (ou à son dépôt).

---

## Test Script TS13.1 — Contraintes de codage

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Parcourir les fichiers de `js/`. | Le code est commenté, lisible et compréhensible (3-01). Les commentaires sont en anglais (3-03). |
| 2 | Pour chaque fonction de `js/`, regarder le commentaire qui la précède. | Chaque fonction a un bloc JSDoc qui décrit son usage, ses arguments (`@param`) et ce qu'elle retourne (`@returns`) (3-02). |
| 3 | Lire les balises `<script>` et `<link>` de `main.html`. | jQuery 3.7.1 est chargé depuis `lib/jquery/` (3-04). Bootstrap 5.3.3 et Bootstrap Icons 1.13.1 sont chargés depuis `../ELM_sharedLib/` (3-05). SheetJS est chargé depuis `lib/xlsx-0.20.3/` (3-07, 6.1-06). |
| 4 | Lister les librairies tierces utilisées et vérifier leur licence et leur maintenance. | Seules jQuery, SheetJS Community Edition, Bootstrap et Bootstrap Icons sont utilisées. Elles sont open source et maintenues (3-06). |
| 5 | Chercher le texte `version=` dans `lib/xlsx-0.20.3/xlsx.full.min.js`. | Le fichier contient `version="0.20.3"`, et son en-tête mentionne SheetJS (3-07, 6.1-06). |
| 6 | Chercher les appels à `utils_console` et `console.` dans `js/`. | Les messages de la console sont en anglais, écrits dans le code (3-09). |
| 7 | Ouvrir l'en-tête de chaque fichier de `js/` et de `css/`. | Chaque fichier commence par le cartouche « (C) Copyright 2026 by Safran Aircraft Engines — All rights reserved », avec un tableau des révisions (Revision, Date, Author, Issue) dont l'auteur est « Dr Jazz » (3-11, 8-07). |
| 8 | Ouvrir l'en-tête de `main.html`. | Le cartouche est un commentaire HTML, avec le tableau des révisions et l'historique des versions (« v2026a : version initiale ») (3-12, 8-07). |
| 9 | Ouvrir l'en-tête de `main.xml`. | Le cartouche est un commentaire XML qui contient seulement la mention de copyright, sans tableau des révisions ni historique des versions (3-13). |

## Test Script TS13.2 — Découpage du code JavaScript

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Lister les fichiers de `js/`. | Il y a 14 fichiers : `ERM_config.js`, `OSLC_NameSpace.js`, `ERM_messages.js`, `ERM_utils.js`, `ERM_rest.js`, `ERM_uri.js`, `ERM_module.js`, `ERM_excel.js`, `ERM_query.js`, `ERM_structure.js`, `ERM_rebind.js`, `ERM_report.js`, `ERM_gui.js`, `main.js`. Le code n'est pas monolithique (3-10, 4.1-04). |
| 2 | Lire le commentaire d'en-tête et les fonctions de chaque fichier. | Chaque fichier a la seule responsabilité décrite dans la spécification (4.1-01, 4.1-04). |
| 3 | Lire les balises `<script>` de `main.html`. | Les fichiers sont des scripts classiques (pas de modules ES), chargés dans un ordre fixe (4.1-02). |
| 4 | Parcourir les noms de fonctions. | Chaque nom de fonction porte le préfixe de son fichier (`excel_…`, `rest_…`, `gui_…`, etc.) (4.1-03). |
| 5 | Chercher les accès à la page (`$(`, `document.`) dans les fichiers autres que `ERM_gui.js` et `ERM_report.js`. | Seuls `ERM_gui.js` et `ERM_report.js` modifient l'interface. Les seules autres exceptions, attendues, sont : `ERM_messages.js` (remplissage des libellés au démarrage), `main.js` (message fatal), et dans `ERM_utils.js` le lien temporaire et invisible du téléchargement et la lecture du cookie `JSESSIONID` (4.1-05). |
| 6 | Dans `ERM_excel.js`, `ERM_query.js`, `ERM_structure.js` et `ERM_rebind.js`, observer comment les résultats et les messages sont transmis. | Ces fichiers renvoient leurs résultats ou lèvent des erreurs, et écrivent dans la zone de messages seulement par les fonctions `report_…` de `ERM_report.js` (4.1-06). |

## Test Script TS13.3 — Textes de l'interface

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Chercher dans `js/` et `main.html` des textes affichés écrits en dur. | Tous les textes affichés viennent de `resources/messages_en.json` par `getText(key, params)` ou par les attributs `data-text-*`. Seul le message fatal de `main.js` est écrit dans le code (3-08, 5.6-01). |
| 2 | Parcourir les clés de `resources/messages_en.json`. | Les clés sont hiérarchiques (`panel.module.help`, `error.uri.notChangeset`…) (5.6-02). |
| 3 | Chercher les textes qui ont des parties variables. | Les parties variables sont des marqueurs nommés (`{count}`, `{file}`…), remplacés par `getText(key, params)` dans `ERM_messages.js` (5.6-03). |
| 4 | Lire les libellés de `main.html`. | Ils portent l'attribut `data-text-key="…"`, rempli au démarrage par `messages_applyToDom` (5.6-04). |

## Test Script TS13.4 — Constantes et comportements non provoquables

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Lire `js/ERM_config.js` et l'interface. | Les paramètres du script sont des constantes internes, sans champ de saisie dans l'interface (7.3-01). |
| 2 | Lire `QUERY_BASE_OVERRIDE` et la fonction `query_findQueryBase` (`ERM_query.js`). | `QUERY_BASE_OVERRIDE` vaut `null` : le service de requête est détecté automatiquement dans `services.xml` (7.3-02). |
| 3 | Lire `QUERY_BATCH_SIZE`. | Sa valeur est 40 (7.3-03). |
| 4 | Lire `TRACKER_POLL_INITIAL_MS`, `TRACKER_POLL_MAX_MS`, `TRACKER_POLL_GROWTH` et la fonction `rebind_trackTask` (`ERM_rebind.js`). | Le premier intervalle est de 2000 ms. Il est multiplié par 1,5 à chaque interrogation, sans dépasser 10000 ms (7.3-04). |
| 5 | Lire `TRACKER_TIMEOUT_MS`. | Sa valeur est `15 * 60 * 1000` (15 minutes) (7.3-05). |
| 6 | Lire `PROJECT_ID_PATTERN`, la fonction `module_read` (`ERM_module.js`) et la fonction `gui_isReady` (`ERM_gui.js`). | Le motif est `^[A-Za-z0-9_-]+$`. Une valeur lue sur le serveur qui ne le respecte pas lève l'erreur `error.module.projectIdInvalid`, affichée dans la zone de messages, et REBIND reste désactivé (5.2.3-04). |
| 7 | Chercher les usages du nom du projet (`projectName`). | Il sert seulement à l'affichage (texte sous « Project ID », compte-rendu, fenêtre de confirmation). Les requêtes utilisent l'UUID (`projectId`) (5.2.4-02). |
| 8 | Lire la fonction `rest_getXml` (`ERM_rest.js`). | Quand le serveur répond 403 à une requête OSLC, les variantes d'en-têtes de `rest_oslcHeaders` sont essayées une à une (7.1-02). |
| 9 | Dans `rebind_trackTask`, lire le cas où le verdict de la tâche n'est pas « passed ». | Une ligne ERROR « Server task failed: state=…, verdict=…. The server response is in the browser console. » s'affiche, et la réponse du serveur est écrite dans la console (7.6-05). |
| 10 | Lire la fonction `rest_putXml` et le traitement du statut 412 dans `rest_checkResponse` (`ERM_rest.js`). | La structure est envoyée avec l'en-tête `If-Match`. Si le serveur répond 412, l'erreur « The module structure was modified since it was read (HTTP 412). Nothing was written: run REBIND again. » s'affiche (7.7-02). |
