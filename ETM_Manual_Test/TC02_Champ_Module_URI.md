# TC02 — Contrôles du champ « Module URI »

**Objectif** : vérifier que seule la forme d'URI prévue est acceptée, que le
contexte doit être un changeset du même serveur, que les erreurs de saisie
s'affichent sous le champ sans appel au serveur, et que le serveur ERM est
déduit de l'URI.

**Exigences couvertes**
- 5.2.1-01 — Champ « Module URI » obligatoire.
- 5.2.1-02 — Une seule forme d'URI acceptée.
- 5.2.1-03 — `oslc_config.context` accepté encodé ou non encodé.
- 5.2.1-04 — Espaces de début et de fin supprimés.
- 5.2.1-05 — Préfixe `MD_` non contrôlé.
- 5.2.1-06 — Contrôles à la saisie sans appel au serveur, erreurs sous le champ, REBIND désactivé.
- 5.2.1-07 — Contrôle de la forme de l'URI.
- 5.2.1-08 — Contexte de configuration obligatoirement un changeset.
- 5.2.1-09 — Changeset sur le même serveur que le module.
- 5.2.1-10 — Serveur ERM déduit de l'URI du module.
- 5.2.1-11 — Serveur de l'URI non comparé à celui qui héberge le widget.
- 5.4.2-01 — REBIND inactif tant que la « Module URI » n'est pas valide.

**Préconditions générales** : voir [00_Index.md](00_Index.md).

---

## Test Script TS02.1 — URI refusées

**Préconditions** : ouvrir les outils de développement du navigateur (F12),
onglet « Network » (Réseau), et vider la liste des requêtes.

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Coller dans « Module URI » l'URL du module copiée depuis la barre d'adresse du client web ERM (`…/rm/web#action=…`). | Le champ est encadré en rouge. Le message « Invalid URI. Expected form: https://<server>:<port>/rm/resources/<module id>?oslc_config.context=<change set URI> » s'affiche sous le champ (5.2.1-02, 5.2.1-06, 5.2.1-07). |
| 2 | Saisir l'URI du module sans le paramètre `oslc_config.context`. | Même message sous le champ (5.2.1-07). |
| 3 | Saisir URI_OK suivie de `&foo=1`. | Même message sous le champ (5.2.1-07). |
| 4 | Saisir URI_STREAM. | Le message « The configuration context must be a change set. Creating a change set is mandatory. » s'affiche sous le champ (5.2.1-08). |
| 5 | (Optionnel) Saisir l'URI du module avec le contexte d'une baseline, puis d'une configuration globale. | Même message que l'étape 4 (5.2.1-08). |
| 6 | Saisir URI_OK en remplaçant le serveur du changeset par un autre serveur (par exemple un autre nom d'hôte, ou un autre port). | Le message « The change set must be on the same server as the module (same protocol, host and port). » s'affiche sous le champ (5.2.1-09). |
| 7 | Pour chacune des étapes 1 à 6, observer « Project ID », la zone de messages et l'onglet « Network ». | « Project ID » reste vide. Aucun message n'apparaît dans la zone de messages, et aucune requête n'est envoyée au serveur ERM (5.2.1-06). |
| 8 | Observer le bouton « REBIND ». | Le bouton reste inactif (5.2.1-06, 5.4.2-01). |
| 9 | Vider le champ « Module URI ». | Le message d'erreur disparaît, « Project ID » reste vide et REBIND reste inactif : le champ est obligatoire (5.2.1-01). |

## Test Script TS02.2 — URI acceptées

**Préconditions** : outils de développement ouverts, onglet « Network ».

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Saisir URI_OK, avec le contexte encodé (`https%3A%2F%2F…`). | Le cadre rouge et le message d'erreur disparaissent. « Project ID » se remplit (voir TC03) (5.2.1-02, 5.2.1-03). |
| 2 | Dans l'onglet « Network », observer la requête de lecture du module. | Elle est envoyée au serveur `https://<serveur>:<port>` de l'URI saisie (5.2.1-10). |
| 3 | Remplacer le contenu par URI_OK avec le contexte non encodé (`https://…`). | L'URI est acceptée et « Project ID » est rempli (5.2.1-03). |
| 4 | Ajouter des espaces avant et après URI_OK. | L'URI est acceptée (5.2.1-04). |
| 5 | Dans URI_OK, remplacer le préfixe `MD_` de l'identifiant du module par `XX_`. | Aucun message ne s'affiche sous le champ : le préfixe n'est pas contrôlé à la saisie. La lecture du module est tentée et son échec (ressource introuvable) s'affiche dans la zone de messages (5.2.1-05). |
| 6 | (Optionnel, si un module créé avant la version 7 de Jazz est disponible) Saisir l'URI d'un module dont l'identifiant ne commence pas par `MD_`. | L'URI est acceptée et « Project ID » est rempli (5.2.1-05). |
| 7 | (Optionnel, si un second serveur ERM est configuré pour CORS) Saisir l'URI d'un module de ce second serveur, dans un changeset de ce serveur. | L'URI est acceptée et « Project ID » est rempli, bien que ce serveur ne soit pas celui qui héberge le widget (5.2.1-11). |
