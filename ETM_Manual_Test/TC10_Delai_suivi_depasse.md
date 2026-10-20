# TC10 — Délai de suivi de la tâche serveur dépassé

**Objectif** : vérifier le comportement du widget quand la tâche serveur dure
plus que le délai maximum de suivi (15 minutes).

**Exigences couvertes**
- 5.4.1-03 — Sélecteur revenu sur ON, y compris si le délai de suivi est dépassé.
- 5.4.2-03 — REBIND réactivé, y compris si le délai de suivi est dépassé.
- 7.3-05 — Délai maximum de suivi de 15 minutes.
- 7.6-03 — Suivi selon le rythme et le délai maximum fixés en 7.3.
- 7.6-06 — Avertissement quand le délai est dépassé.
- 7.6-07 — Bouton « Check status » qui reprend le suivi et refait la vérification finale.
- 7.6-08 — REBIND réactivé quand le délai est dépassé.
- 7.7-01 — Fermer le widget n'arrête pas la tâche côté serveur.

**Préconditions générales** : voir [00_Index.md](00_Index.md). Comme pour
TC06, les artefacts de `F01_valide.xlsx` sont absents du module MR_TEST dans
un changeset de test.

**Préconditions particulières** : ce cas ne se produit qu'avec une mise à jour
très longue côté serveur (module volumineux, serveur chargé). Sur un
environnement de test, il peut être provoqué en réduisant temporairement la
constante `TRACKER_TIMEOUT_MS` de `js/ERM_config.js` (par exemple à
`5 * 1000`), puis en rétablissant sa valeur après le test. La valeur livrée
(15 minutes) est vérifiée en revue (TC13, TS13.4).

---

## Test Script TS10.1 — Délai dépassé, puis « Check status »

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Lancer une exécution réelle (voir TC06/TS06.2, étapes 1 à 3) et noter l'heure de la ligne « The server is processing the update… ». | Le suivi de la tâche serveur démarre (7.6-03). |
| 2 | Attendre le délai maximum. | La ligne WARNING « The server is still processing the update. The result is not confirmed yet. Check the module in the changeset before delivering it. » s'affiche, après le délai maximum compté depuis l'heure notée (15 minutes avec la valeur livrée) (7.3-05, 7.6-03, 7.6-06). Le bouton « Check status » apparaît sous la zone de messages (7.6-07). |
| 3 | Observer le panneau « 03 / Rebind ». | REBIND est réactivé et le sélecteur est revenu sur ON (5.4.1-03, 5.4.2-03, 7.6-08). |
| 4 | Cliquer sur « Check status ». | La ligne « Checking the server task again… » s'affiche et le suivi reprend. Le bouton « Check status » disparaît pendant le suivi (7.6-07). |
| 5 | Attendre la fin de la tâche. | Le compte-rendu affiche « Server task completed: … », puis « Verification: <n>/<n> artifacts present in the module. » (7.6-07). |

## Test Script TS10.2 — Fermeture du widget pendant la tâche serveur

**Préconditions** : rétablir les artefacts de `F01_valide.xlsx` dans l'état
« absents du module » (nouveau changeset de test, par exemple).

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Lancer une exécution réelle, puis fermer l'onglet du tableau de bord pendant « Server processing… ». | — |
| 2 | Attendre quelques minutes, puis ouvrir le module dans le changeset. | Les artefacts ont été rattachés : la tâche s'est terminée côté serveur (7.7-01). |
