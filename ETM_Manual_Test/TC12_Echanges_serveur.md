# TC12 — Échanges avec le serveur ERM

**Objectif** : vérifier, dans les outils de développement du navigateur, les
requêtes envoyées au serveur ERM : serveur et contexte utilisés, découverte du
service de requête, lots d'IDs, ETag et `If-Match`, en-tête anti-CSRF, suivi de
la tâche serveur.

**Exigences couvertes**
- 5.2.1-10 — Serveur ERM déduit de l'URI du module.
- 5.2.2-01 — Module lu dans le contexte du changeset.
- 5.2.4-02 — Seul l'UUID du projet est utilisé par le traitement.
- 7.1-02 — Découverte du service de requête à partir de `services.xml`.
- 7.1-03 — Résolution des IDs par lots de 40, syntaxe de requête testée.
- 7.1-04 — Lecture de la structure du module avec son ETag.
- 7.3-03 — Lots de 40 IDs.
- 7.3-04 — Interrogation de la tâche serveur toutes les 2 s, puis de plus en plus espacée, jusqu'à 10 s.
- 7.5-03 — Écriture avec le contrôle `If-Match` sur l'ETag lu.
- 7.5-04 — En-tête anti-CSRF envoyé seulement si le module est sur le serveur du widget.
- 7.6-01 — Réponse « 202 Accepted » et interrogation de l'état de la tâche.
- 7.7-02 — Écriture refusée si la structure a changé depuis sa lecture (`If-Match`).

**Préconditions générales** : voir [00_Index.md](00_Index.md).

**Préconditions particulières** : outils de développement ouverts (F12),
onglet « Network » (Réseau), option « Preserve log » cochée, liste des
requêtes vidée. Le widget est hébergé sur le même serveur que le module
MR_TEST. TS12.1 se déroule pendant une simulation (TC05), TS12.2 pendant une
exécution réelle (TC06/TS06.2).

---

## Test Script TS12.1 — Lecture du module et simulation

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Saisir URI_OK, puis observer la requête de lecture du module. | La requête `GET` est envoyée au serveur `https://<serveur>:<port>` de l'URI (5.2.1-10). Elle porte l'URI du changeset dans l'en-tête `vvc.configuration` (5.2.2-01). |
| 2 | Observer la requête de lecture du nom du projet. | Elle porte sur `/rm/oslc_rm/<UUID>/services.xml` : le projet est désigné par son UUID (5.2.4-02). |
| 3 | Sélectionner `F01_valide.xlsx`, puis lancer une simulation. Observer les requêtes dans l'ordre. | Le service de requête est trouvé à partir du document `services.xml` du projet, désigné par son UUID et non par son nom (5.2.4-02, 7.1-02). |
| 4 | Observer les requêtes de résolution des IDs (paramètre `oslc.where`). | Chaque requête contient au plus 40 IDs. Avec au moins 45 artefacts, il y a au moins deux requêtes (7.1-03, 7.3-03). |
| 5 | Dans l'onglet « Console », lire les messages du widget. | Une ligne « Query syntax retained: … » indique la syntaxe de requête retenue (7.1-03). |
| 6 | Observer la requête `GET` de la structure du module (`…/structure`). | La réponse contient un en-tête `ETag` (7.1-04). |

## Test Script TS12.2 — Écriture et suivi de la tâche serveur

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Lancer une exécution réelle (TC06/TS06.2, étape 1) et noter la valeur de l'en-tête `ETag` de la réponse au `GET` de la structure. | — |
| 2 | Observer la requête `PUT` de la structure. | Elle porte l'en-tête `If-Match` avec la valeur de l'ETag notée à l'étape 1 : l'écriture serait refusée si la structure avait changé depuis sa lecture (7.5-03, 7.7-02). |
| 3 | Dans la même requête, chercher l'en-tête `X-Jazz-CSRF-Prevent`. | L'en-tête est présent, car le module est sur le serveur qui héberge le widget (7.5-04). |
| 4 | Observer la réponse au `PUT`. | Le statut est `202 Accepted` et l'en-tête `Location` donne l'URL de la tâche serveur (7.6-01). |
| 5 | Observer les requêtes `GET` sur l'URL de la tâche serveur et leur heure de départ (colonne « Waterfall » ou « Start Time »). | Le widget interroge régulièrement la tâche (7.6-01). La première interrogation a lieu environ 2 s après le `PUT`, puis les intervalles augmentent (environ 3 s, 4,5 s, 6,75 s) sans dépasser 10 s. Si la tâche se termine très vite, seule la première interrogation est visible (7.3-04). |
| 6 | (Optionnel, si un second serveur ERM est configuré pour CORS) Recommencer les étapes 1 à 3 avec un module de ce second serveur. | La requête `PUT` ne porte pas l'en-tête `X-Jazz-CSRF-Prevent` (7.5-04). |
