# TC03 — Lecture du module, « Project ID » et nom du projet

**Objectif** : vérifier que la saisie d'une « Module URI » valide déclenche la
lecture du module, remplit « Project ID » et le nom du projet, et que les
erreurs de lecture s'affichent dans la zone de messages.

**Exigences couvertes**
- 5.2.2-01 — Lecture du module dès la saisie d'une URI valide, dans le contexte du changeset.
- 5.2.2-02 — Indicateur de chargement pendant la lecture.
- 5.2.2-03 — UUID de la zone de projet lu dans la réponse du module, puis lecture du nom du projet.
- 5.2.2-04 — Lecture du module qui échoue si le changeset n'existe pas.
- 5.2.2-05 — Lecture relancée à chaque nouvelle URI valide.
- 5.2.2-06 — Erreurs de lecture dans la zone de messages.
- 5.2.2-07 — Échec de lecture : « Project ID » vide, cause affichée, REBIND désactivé, déblocage.
- 5.2.2-08 — Erreur « The URI does not designate a module ».
- 5.2.3-01 — « Project ID » contient l'UUID de la zone de projet, et non son nom.
- 5.2.3-02 — « Project ID » en lecture seule, rempli automatiquement, recalculé sans message.
- 5.2.3-03 — « Project ID » obligatoire.
- 5.2.4-01 — Nom du projet affiché sous « Project ID ».
- 5.2.4-03 — Nom du projet non lu : avertissement, REBIND utilisable.

**Préconditions générales** : voir [00_Index.md](00_Index.md).

---

## Test Script TS03.1 — Lecture réussie

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Saisir URI_OK dans « Module URI ». | La lecture démarre sans autre action. Un indicateur de chargement apparaît à côté de « Project ID » pendant la lecture (5.2.2-01, 5.2.2-02). |
| 2 | Attendre la fin de la lecture. | « Project ID » contient l'UUID de la zone de projet (forme `_xxxxxxxx`), et non son nom (5.2.2-03, 5.2.3-01). |
| 3 | Observer le texte sous « Project ID ». | « Project: <nom du projet> » s'affiche, en lecture seule (5.2.2-03, 5.2.4-01). |
| 4 | Observer la zone de messages. | Une ligne INFO indique « Module "MR_TEST" read (project area <UUID>). » (5.2.2-01). |
| 5 | Essayer de modifier « Project ID ». | La saisie est impossible : le champ est en lecture seule (5.2.3-02). |
| 6 | Remplacer URI_OK par l'URI d'un autre module du même changeset. | La lecture est relancée. « Project ID » et le nom du projet sont recalculés, sans fenêtre de confirmation ni avertissement (5.2.2-05, 5.2.3-02). |
| 7 | Saisir de nouveau URI_OK, sélectionner `F01_valide.xlsx`, puis vider le champ « Module URI ». | « Project ID » et le nom du projet sont vidés. REBIND devient inactif (5.2.3-03). |

## Test Script TS03.2 — Échecs de lecture

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Sélectionner `F01_valide.xlsx`. Saisir une URI de la bonne forme, mais avec un identifiant de module inexistant. | Une ligne ERROR « Resource not found (HTTP 404): … » s'affiche dans la zone de messages. « Project ID » reste vide. REBIND reste inactif (5.2.2-06, 5.2.2-07, 5.2.3-03). |
| 2 | Saisir une URI de la bonne forme qui désigne une exigence (et non un module), dans le changeset. | La ligne ERROR « The URI does not designate a module. » s'affiche dans la zone de messages. « Project ID » reste vide. REBIND reste inactif (5.2.2-08). |
| 3 | Saisir URI_OK avec un identifiant de changeset inexistant. | Une ligne ERROR s'affiche dans la zone de messages. « Project ID » reste vide : le module n'est pas lu dans un changeset qui n'existe pas (5.2.2-04). |
| 4 | Se déconnecter d'ERM dans un autre onglet, puis ressaisir URI_OK. | La ligne ERROR « Your ERM session has expired or you are not logged in. Log in to ERM, then enter the Module URI again. » s'affiche. REBIND reste inactif (5.2.2-07). |
| 5 | Se reconnecter à ERM, puis ressaisir URI_OK. | « Project ID » et le nom du projet sont remplis : la correction débloque le widget (5.2.2-07). |
| 6 | (Optionnel) Avec un compte qui n'a pas accès au projet de test, saisir URI_OK. | Une ligne ERROR indique un accès refusé (par exemple « Access denied (HTTP 403) on … »). « Project ID » reste vide (5.2.2-07). |

## Test Script TS03.3 — Nom du projet non lu

**Préconditions** : environnement de test où le document
`/rm/oslc_rm/<UUID>/services.xml` du projet est rendu inaccessible (par
exemple par une règle du proxy). Si ce n'est pas réalisable, l'exigence est
vérifiée en revue de code (TC13, TS13.4).

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Saisir URI_OK. | « Project ID » est rempli. Le texte « Project: name unavailable » s'affiche sous le champ (5.2.4-03). |
| 2 | Observer la zone de messages. | Une ligne WARNING « The name of project area <UUID> cannot be read. REBIND remains available. » s'affiche (5.2.4-03). |
| 3 | Sélectionner `F01_valide.xlsx`. | REBIND devient actif (5.2.4-03). |
