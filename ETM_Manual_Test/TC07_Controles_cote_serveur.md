# TC07 — Contrôles côté serveur

**Objectif** : vérifier que le traitement s'arrête, sans rien écrire, quand
les données du fichier ne correspondent pas au module ou au changeset.

**Exigences couvertes**
- 7.1-03 — Arrêt avec une erreur si un ID est introuvable dans la configuration.
- 7.1-05 — Module cible vide refusé.
- 7.1-06 — Aucun artefact du fichier ne doit être déjà présent dans le module.
- 7.1-07 — Chaque point d'accrochage présent exactement une fois dans le module.
- 7.2-02 — Point d'accrochage : ID absent du fichier qui doit exister une fois dans le module.
- 7.4-01 — En simulation, rien n'est écrit.

**Préconditions générales** : voir [00_Index.md](00_Index.md). URI_OK est
saisie. « Simulation » est sur ON : ces contrôles sont faits en simulation
comme en exécution réelle, et la simulation garantit que rien n'est écrit.

---

## Test Script TS07.1 — ID introuvable

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Sélectionner `F09_id_inconnu.xlsx`, puis cliquer sur « REBIND ». | Le traitement s'arrête avec la ligne ERROR « 1 ID(s) not found in the change set: <id> » (7.1-03). |
| 2 | Observer les téléchargements, puis ouvrir le module dans le changeset. | Aucun fichier n'est téléchargé. Le module n'a pas changé (7.4-01). |

## Test Script TS07.2 — Point d'accrochage absent du module

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Sélectionner `F10_ancrage_absent.xlsx`, puis cliquer sur « REBIND ». | Le traitement s'arrête avec la ligne ERROR « Anchor point <id> found 0 time(s) in the module structure (exactly 1 expected). » (7.1-07, 7.2-02). |

## Test Script TS07.3 — Artefacts déjà présents

**Préconditions** : les artefacts de `F01_valide.xlsx` sont présents dans le
module MR_TEST (par exemple avant de les retirer du module, ou après TC06).

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Sélectionner `F01_valide.xlsx`, puis cliquer sur « REBIND ». | Le traitement s'arrête avec la ligne ERROR « <n> artifact(s) already present in the module, stopped for safety: … » (7.1-06). |

## Test Script TS07.4 — Module cible vide

**Préconditions** : un module vide **MR_EMPTY** existe dans le changeset.

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Saisir l'URI de MR_EMPTY dans le changeset, sélectionner `F01_valide.xlsx`, puis cliquer sur « REBIND ». | Le traitement s'arrête avec la ligne ERROR « The target module is empty. An empty module cannot be used: it has no existing binding to copy. » (7.1-05). |
