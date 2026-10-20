# TC06 — Exécution réelle

**Objectif** : vérifier le signal du mode réel, la fenêtre de confirmation,
l'écriture de la structure avec sauvegarde préalable, le suivi de la tâche
serveur, la vérification finale et la sécurité en cas de relance.

**Exigences couvertes**
- 5.4.1-02 — Mode réel : bouton rouge « REBIND (LIVE) », bandeau orange « LIVE MODE ».
- 5.4.1-03 — Retour sur ON à la fin de toute exécution réelle, quel que soit le résultat.
- 5.4.1-04 — Sélecteur sur OFF après « Cancel ».
- 5.4.3-01 — Fenêtre de confirmation avant toute écriture : titre du module, nom du projet, nombre d'artefacts, points d'accrochage et racine, changeset.
- 5.4.3-02 — Boutons « Cancel » et « Rebind » (rouge).
- 5.4.4-02 — Barre animée, sans pourcentage, avec le temps écoulé pendant le traitement serveur.
- 7.1-06 — Arrêt si un artefact du fichier est déjà présent dans le module.
- 7.1-10 — Suivi de la tâche serveur (étape 8 du traitement).
- 7.1-11 — Vérification finale « X/Y artifacts present in the module ».
- 7.2-01 — Racine du module : ajout en fin de module.
- 7.2-02 — Point d'accrochage : ajout en fin de chapitre.
- 7.5-01 — Confirmation d'abord ; rien n'est écrit si l'utilisateur annule.
- 7.5-02 — Sauvegarde de la structure juste avant l'écriture.
- 7.6-01 — Réponse « 202 Accepted » et interrogation de l'état de la tâche.
- 7.6-02 — Affichage « Server processing… », temps écoulé et état.
- 7.6-04 — Vérification finale en cas de succès.
- 7.7-02 — Relance sans danger : contrôle « déjà présent dans le module ».
- 7.8-01 — Nom du fichier de sauvegarde.

**Préconditions générales** : voir [00_Index.md](00_Index.md). TC05 a été
déroulé avec succès. URI_OK est saisie, `F01_valide.xlsx` est sélectionné.
Pour dérouler [TC12](TC12_Echanges_serveur.md) en même temps, ouvrir les
outils de développement avant TS06.2.

---

## Test Script TS06.1 — Signal du mode réel et annulation

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Passer le sélecteur « Simulation » sur OFF. | Le sélecteur affiche OFF. Le bouton devient rouge et s'intitule « REBIND (LIVE) ». Le bandeau orange « LIVE MODE: changes will be written to the changeset. » s'affiche au-dessus du bouton (5.4.1-02). |
| 2 | Cliquer sur « REBIND (LIVE) ». | La fenêtre « Confirm the rebind » s'ouvre. Elle affiche le titre du module (MR_TEST), le nom du projet, le nombre d'artefacts du fichier, les points d'accrochage (id du titre B, puis « module root ») et l'URI du changeset (5.4.3-01). |
| 3 | Observer les boutons de la fenêtre. | Elle a deux boutons : « Cancel » et « Rebind », en rouge (5.4.3-02). |
| 4 | Cliquer sur « Cancel ». | La fenêtre se ferme. Rien n'est écrit : aucun fichier n'est téléchargé et le module n'a pas changé (7.5-01). Le sélecteur reste sur OFF (5.4.1-04). |

## Test Script TS06.2 — Écriture, suivi et vérification

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Cliquer sur « REBIND (LIVE) », puis sur « Rebind » (rouge) dans la fenêtre de confirmation. | La fenêtre se ferme et le traitement démarre. Le compte-rendu commence par « LIVE EXECUTION on module "MR_TEST" … » (5.4.3-01, 7.5-01). |
| 2 | Observer les téléchargements du navigateur et le compte-rendu. | Un seul fichier est téléchargé : `<id module>_structure_before_<AAAAMMJJ-HHMMSS>.xml`. La ligne « Backup of the current structure downloaded: … » s'affiche **avant** la ligne « Structure update accepted by the server … » (7.5-02, 7.8-01). |
| 3 | Observer la barre de progression après « Structure update accepted by the server (HTTP 202). ». | Le serveur a répondu 202 (7.6-01). La barre est animée, sans pourcentage, avec le libellé « Server processing… <m:ss> (<état>) » ; le temps écoulé augmente (5.4.4-02, 7.1-10, 7.6-02). |
| 4 | Attendre la fin du traitement. | Le compte-rendu affiche « Server task completed: state=complete, verdict=passed. », puis « Verification: <n>/<n> artifacts present in the module. » (7.1-11, 7.6-04). |
| 5 | Observer le panneau « 03 / Rebind ». | Le sélecteur est revenu sur ON, le bandeau « LIVE MODE » a disparu et le bouton s'intitule de nouveau « REBIND » (5.4.1-03). |
| 6 | Ouvrir le module MR_TEST dans le changeset. | Le chapitre A est de nouveau à la fin du module, avec sa hiérarchie. L'artefact rattaché au chapitre B est le dernier enfant de ce chapitre (7.2-01, 7.2-02). |

## Test Script TS06.3 — Relance sans danger

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Sans rien changer, passer « Simulation » sur OFF, cliquer sur « REBIND (LIVE) », puis confirmer. | Le traitement s'arrête avec la ligne ERROR « <n> artifact(s) already present in the module, stopped for safety: … » (7.1-06, 7.7-02). |
| 2 | Ouvrir le module MR_TEST dans le changeset. | Le module n'a pas changé depuis TS06.2 (7.7-02). |
| 3 | Observer le panneau « 03 / Rebind ». | Le sélecteur est revenu sur ON, même après un échec (5.4.1-03). |
| 4 | Abandonner le changeset de test (ou le livrer, selon la procédure du projet). | — |
