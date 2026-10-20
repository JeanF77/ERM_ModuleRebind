# TC05 — Simulation

**Objectif** : vérifier qu'une simulation n'écrit rien dans ERM, produit le
compte-rendu attendu et télécharge la structure avant et après modification,
conforme aux règles de rattachement.

**Exigences couvertes**
- 5.4.2-02 — REBIND désactivé pendant la simulation.
- 5.4.2-03 — REBIND réactivé à la fin de la simulation.
- 5.4.3-01 — Fenêtre de confirmation en exécution réelle uniquement.
- 5.4.4-01 — Barre de progression avec un avancement réel pendant la recherche des IDs.
- 5.5-02 — Zone de messages vidée au lancement de la simulation.
- 5.5-04 — Compte-rendu sur le modèle du script, en anglais.
- 5.5-05 — Horodatage et niveau sur chaque ligne.
- 5.5-10 — Nombre d'artefacts par type, type affiché à côté de chaque ID.
- 7.1-02 — Découverte du service de requête OSLC.
- 7.1-03 — Résolution des IDs par lots de 40.
- 7.1-04 — Lecture de la structure du module.
- 7.1-08 — Construction des nouveaux bindings.
- 7.1-09 — Simulation (étape 7 du traitement).
- 7.2-01 — Racine du module : ajout en fin de module.
- 7.2-02 — Point d'accrochage : ajout en fin de chapitre.
- 7.2-03 — Parent présent dans le fichier : artefact construit sous son parent.
- 7.2-04 — Modèle de binding : premier point d'accrochage, ou binding existant du module.
- 7.2-05 — Pas d'insertion après un frère précis (`INSERER_APRES` abandonné).
- 7.3-02 — Service de requête détecté automatiquement.
- 7.3-03 — Lots de 40 IDs.
- 7.4-01 — Rien n'est écrit dans ERM.
- 7.4-02 — Structure avant et après téléchargée.
- 7.8-01 — Noms des fichiers téléchargés.

**Préconditions générales** : voir [00_Index.md](00_Index.md). Les artefacts de
`F01_valide.xlsx` ont été retirés du module MR_TEST dans le changeset. URI_OK
est saisie, `F01_valide.xlsx` est sélectionné, « Simulation » est sur ON.

---

## Test Script TS05.1 — Déroulement de la simulation

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Cliquer sur « REBIND ». | Aucune fenêtre de confirmation ne s'ouvre (5.4.3-01). La zone de messages est vidée (5.5-02). REBIND, « Module URI », le champ de fichier et le sélecteur sont désactivés (5.4.2-02). |
| 2 | Observer le panneau « 03 / Rebind » pendant le traitement. | Une barre de progression se remplit à mesure que les IDs sont résolus, avec le libellé « Resolving IDs: <n>/<total> ». <n> avance par paliers de 40 (par exemple 40/47, puis 47/47) (5.4.4-01, 7.1-03, 7.3-03). La barre affiche ensuite « Reading the module structure… » (7.1-04). |
| 3 | Attendre la fin du traitement. | La barre de progression disparaît. REBIND est réactivé (5.4.2-03). |
| 4 | Lire le compte-rendu. | Il commence par « SIMULATION on module "MR_TEST" (project <nom>). Nothing will be written. ». Chaque ligne a une heure (HH:MM:SS) et un niveau (INFO, WARNING, ERROR). Les messages sont en anglais et suivent les étapes du script `LiF-107267-binding-script.js` (5.5-04, 5.5-05). |
| 5 | Vérifier le détail du fichier dans le compte-rendu. | Le nombre d'artefacts par type est affiché, puis une ligne par artefact au format « <id> [<type>] under <parent> » (« heading » pour les titres, « the module root » pour les artefacts à la racine) (5.5-10). |
| 6 | Vérifier la suite du compte-rendu. | Le compte-rendu affiche le service de requête trouvé (« Query service: <url> »), alors qu'aucun service n'a été saisi (7.1-02, 7.3-02), le nombre d'IDs résolus (7.1-03), le nombre d'artefacts de la structure actuelle (7.1-04), les ajouts par point d'accrochage et à la racine du module, le nombre de bindings préparés (7.1-08), puis « SIMULATION: nothing was written. … » (7.1-09). |
| 7 | Observer les téléchargements du navigateur. | Deux fichiers sont téléchargés : `<id module>_structure_before_<AAAAMMJJ-HHMMSS>.xml` et `<id module>_structure_after_<AAAAMMJJ-HHMMSS>.xml`. Les noms sont en anglais (7.4-02, 7.8-01). |
| 8 | Ouvrir le module MR_TEST dans le changeset. | Le module n'a pas changé (7.4-01). |

## Test Script TS05.2 — Contenu de la structure « after »

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Comparer les fichiers `…_before_…xml` et `…_after_…xml` avec un outil de comparaison de texte. | Seuls des bindings ont été ajoutés ; aucun binding existant n'a été modifié ou supprimé (7.4-02). |
| 2 | Chercher dans `…_after_…xml` le binding du titre du chapitre A (`parentBinding` vide dans le fichier). | Il est le **dernier** élément de la collection de premier niveau du module (7.2-01). |
| 3 | Chercher le binding de l'artefact rattaché au titre du chapitre B. | Il est le **dernier** enfant du chapitre B, après les enfants existants, et non après un frère choisi (7.2-02, 7.2-05). |
| 4 | Vérifier la hiérarchie des autres artefacts du chapitre A. | Chaque artefact est sous le binding de son `parentBinding`, dans l'ordre du fichier. `isHeading` vaut `true` pour les titres et `false` pour les autres artefacts (7.2-03). |
| 5 | Comparer les propriétés d'un nouveau binding (type, module, composant) avec celles du binding du titre B. | Elles sont identiques : le premier point d'accrochage sert de modèle (7.2-04). |
| 6 | Lancer une deuxième simulation sans rien changer. | Un nouveau couple de fichiers est téléchargé, avec une autre heure dans le nom : les fichiers précédents ne sont pas écrasés (7.8-01). |

## Test Script TS05.3 — Fichier sans point d'accrochage

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Sélectionner `F18_sans_ancrage.xlsx`, puis cliquer sur « REBIND ». | La simulation se termine sans erreur. Le compte-rendu n'indique aucun point d'accrochage, seulement des ajouts à la racine du module (7.2-01). |
| 2 | Dans le fichier `…_after_…xml` téléchargé, comparer les propriétés (type, module, composant) des nouveaux bindings avec celles d'un binding existant du module. | Elles sont identiques : un binding existant du module sert de modèle (7.2-04). |
