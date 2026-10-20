# ERM Module Rebind — Cas de test manuels (ETM)

Ce dossier contient les **Test Case** de recette (niveau acceptation globale du
widget) destinés à être saisis dans IBM Engineering Test Management (ETM).
Chaque Test Case décrit un besoin fonctionnel et référence un ou plusieurs
**Test Script** (déroulé opératoire pas à pas : Action → Résultat attendu).

## Exigences de référence

Source des exigences : `ERM_ModuleRebind-v2.docx` (spécification v2.3, gérée
hors de ce dépôt), où chaque exigence est balisée `[ReqStart] … [ReqEnd]` pour
l'import dans ERM.

Chaque exigence est désignée par un **repère** `<section>-<rang>` : `5.2.1-03`
est la 3e exigence balisée de la section 5.2.1, dans l'ordre du document.
La liste complète des repères, avec le texte de chaque exigence et les Test Case
qui la couvrent, est dans
[01_Exigences_et_couverture.md](01_Exigences_et_couverture.md). Ce fichier est
généré par `_recap_tools/req_catalog.py`, qui vérifie aussi que chaque exigence
est couverte et que chaque repère cité existe.

**Traçabilité** : après l'import de la spécification dans ERM et des Test Case
dans ETM, retrouver chaque exigence ERM grâce au tableau de
`01_Exigences_et_couverture.md`, puis la relier aux Test Case de la colonne
« Cas de test » (lien « Validated By » côté ERM, « Validates Requirement » côté
ETM). Les identifiants ERM peuvent ensuite remplacer les repères dans ETM.

## Périmètre couvert

Les 178 exigences de la spécification sont couvertes :

- **Test Case fonctionnels** (TC01 à TC12) : exigences observables en opérant le
  widget (sections 2, 5, 6 et 7). TC12 observe les échanges avec le serveur
  dans les outils de développement du navigateur (touche F12).
- **Test Case de revue** (TC13 et TC14) : exigences qui portent sur le code
  source, les livrables et le déploiement (sections 3, 4 et 8), et
  comportements du code qu'on ne peut pas provoquer sur un vrai serveur (refus
  403, tâche serveur en échec, structure modifiée entre la lecture et
  l'écriture…). Dans ETM, leur méthode de vérification est la revue
  (inspection), et non le test.

## Liste des Test Case

| Test Case | Titre | Type | Sections couvertes |
|---|---|---|---|
| [TC01](TC01_Demarrage_et_IHM.md) | Démarrage du widget et conformité générale de l'IHM | Test | 2, 5.1, 5.2.1, 5.2.3, 5.3, 5.4.1, 5.4.2, 5.6 |
| [TC02](TC02_Champ_Module_URI.md) | Contrôles du champ « Module URI » | Test | 5.2.1, 5.4.2 |
| [TC03](TC03_Lecture_module_Project_ID.md) | Lecture du module, « Project ID » et nom du projet | Test | 5.2.2, 5.2.3, 5.2.4 |
| [TC04](TC04_Controles_fichier_Excel.md) | Contrôles du fichier Excel | Test | 5.3, 5.4.2, 5.5, 6.1 à 6.5, 7.1 |
| [TC05](TC05_Simulation.md) | Simulation | Test | 5.4.2, 5.4.3, 5.4.4, 5.5, 7.1 à 7.4, 7.8 |
| [TC06](TC06_Execution_reelle.md) | Exécution réelle | Test | 5.4.1, 5.4.3, 5.4.4, 7.1, 7.2, 7.5 à 7.8 |
| [TC07](TC07_Controles_cote_serveur.md) | Contrôles côté serveur | Test | 7.1, 7.2, 7.4 |
| [TC08](TC08_Aide_contextuelle.md) | Aide contextuelle | Test | 5.1 |
| [TC09](TC09_Zone_de_messages.md) | Zone de messages | Test | 5.2.1, 5.2.2, 5.3, 5.5 |
| [TC10](TC10_Delai_suivi_depasse.md) | Délai de suivi de la tâche serveur dépassé | Test | 5.4.1, 5.4.2, 7.3, 7.6, 7.7 |
| [TC11](TC11_Bloc_METADATA.md) | Bloc METADATA de l'export ERM | Test | 6.1, 6.4, 6.5, 6.6 |
| [TC12](TC12_Echanges_serveur.md) | Échanges avec le serveur ERM | Test | 5.2.1, 5.2.2, 5.2.4, 7.1, 7.3, 7.5, 7.6, 7.7 |
| [TC13](TC13_Revue_code_source.md) | Revue du code source | Revue | 3, 4.1, 5.2.3, 5.2.4, 5.6, 6.1, 7.1, 7.3, 7.6, 7.7, 8 |
| [TC14](TC14_Revue_livrables_deploiement.md) | Revue des livrables et du déploiement | Revue | 2, 3, 4, 8 |

Ordre de déroulement conseillé : TC01, TC08, TC02, TC03, TC09, TC04, TC11,
TC07, TC05, puis TC06 avec TC12 (outils de développement ouverts), puis TC10.
TC13 et TC14 peuvent être faits à tout moment.

## Convention utilisée dans chaque Test Case

- **Objectif** : ce que le Test Case démontre.
- **Exigences couvertes** : repères des exigences, avec un libellé court.
- **Préconditions générales** : état requis avant de dérouler les Test Script.
- **Test Script** : un tableau `# | Action | Résultat attendu`, avec les
  repères des exigences vérifiées entre parenthèses en fin de ligne.
- « (Optionnel) » en début d'étape : étape à faire seulement si l'environnement
  le permet (second serveur ERM, module ancien…). L'exigence correspondante est
  aussi vérifiée en revue (TC13 ou TC14) ou par une autre étape.

Les textes attendus à l'écran sont cités en anglais, tels qu'ils figurent dans
`resources/messages_en.json`.

## Préconditions communes à tous les Test Case

- Le serveur ERM de test est en version 7.0.3 ou supérieure.
- Le widget « ERM Module Rebind » est installé sur ce serveur ERM et ajouté à
  un tableau de bord ERM (voir TC14).
- Le testeur est authentifié sur ERM avec un compte autorisé à modifier les
  modules du projet de test.
- Navigateur : Chrome ou Edge, dans une version à jour.
- Un projet de test contient un module **MR_TEST** avec au moins :
  - un chapitre **A** (titre) contenant **au moins 45 artefacts**, sur au moins
    deux niveaux de hiérarchie et de plusieurs types (au-delà de 40 artefacts,
    la recherche des IDs se fait en plusieurs lots, et la zone de messages
    dépasse sa hauteur maximale) ;
  - un chapitre **B** (titre) qui servira de point d'accrochage.
- Un **changeset** de test est créé sur le composant du module. Son URI et
  l'URI du module dans ce changeset sont notées :
  - **URI_OK** : `https://<serveur>:<port>/rm/resources/<id MR_TEST>?oslc_config.context=<URI du changeset>` ;
  - **URI_STREAM** : la même URI, avec le contexte d'un stream à la place du changeset.

## Jeu de données de test

Préparer les fichiers suivants à partir de l'**export Excel d'une vue ERM** du
module MR_TEST (colonnes `id`, `Artifact Type`, `isHeading`, `parentBinding`,
`module`, plus au moins une autre colonne, par exemple `Name`). L'export
contient toujours un bloc `METADATA` (ligne `METADATA` suivie de lignes
`Nom=Valeur` en colonne A) : le laisser tel quel, sauf indication contraire.

| Fichier | Contenu |
|---|---|
| `F01_valide.xlsx` | Export des artefacts du chapitre A (titre compris), **avant** de les retirer du module dans le changeset. La ligne du titre A a un `parentBinding` vide (racine du module). Ajouter une ligne pour un artefact du projet absent du module, avec pour `parentBinding` l'id du titre du chapitre B (point d'accrochage). **Noter la position du bloc METADATA** dans la feuille (en tête, en fin ou ailleurs). |
| `F02_colonnes_manquantes.xlsx` | `F01_valide.xlsx` sans les colonnes `id`, `Artifact Type`, `parentBinding` et `module`. |
| `F03_entete_casse.xlsx` | `F01_valide.xlsx` avec l'en-tête `isheading` au lieu de `isHeading`. |
| `F04_sans_donnees.xlsx` | Uniquement la ligne d'en-têtes. |
| `F05_valeurs_invalides.xlsx` | `F01_valide.xlsx` avec : une valeur `yes` dans `isHeading`, une cellule `isHeading` vide, un `id` texte `abc`, une cellule `id` vide, un `parentBinding` texte `x`. |
| `F06_ligne_vide.xlsx` | `F01_valide.xlsx` avec une ligne entièrement vide au milieu des données et deux lignes vides en fin de feuille. |
| `F07_doublon.xlsx` | `F01_valide.xlsx` avec un `id` présent deux fois. |
| `F08_ordre.xlsx` | `F01_valide.xlsx` avec un enfant placé avant son parent. |
| `F09_id_inconnu.xlsx` | `F01_valide.xlsx` avec un `id` qui n'existe pas dans le projet. |
| `F10_ancrage_absent.xlsx` | `F01_valide.xlsx` dont un `parentBinding` désigne un artefact du projet absent du module (et absent du fichier). |
| `F11_sans_metadata.xlsx` | `F01_valide.xlsx` sans son bloc `METADATA`. |
| `F12_metadata_en_tete.xlsx` | `F01_valide.xlsx` dont le bloc `METADATA` est déplacé en tête de feuille, suivi d'une ligne vide puis des en-têtes. |
| `F13_deux_feuilles.xlsx` | `F01_valide.xlsx` avec une **deuxième feuille** qui contient les données de `F05_valeurs_invalides.xlsx`. |
| `F14_metadata_fin.xlsx` | `F01_valide.xlsx` dont le bloc `METADATA` est placé en fin de feuille, précédé de deux lignes vides et suivi d'une ligne vide. Dans le bloc, la valeur de `Export Module=` est remplacée par l'URI d'un autre module. |
| `F15_metadata_milieu_lignes_vides.xlsx` | `F01_valide.xlsx` dont le bloc `METADATA` est placé au milieu des données, avec une ligne vide juste avant et une ligne vide juste après. |
| `F16_metadata_milieu.xlsx` | `F01_valide.xlsx` dont le bloc `METADATA` est placé au milieu des données, sans ligne vide autour. |
| `F17_metadata_autre_cellule.xlsx` | `F16_metadata_milieu.xlsx` avec une valeur quelconque en colonne B de la ligne `METADATA`. |
| `F18_sans_ancrage.xlsx` | `F01_valide.xlsx` sans la ligne de l'artefact rattaché au chapitre B : le fichier n'a plus de point d'accrochage. |
| `F19_valeurs_texte.xlsx` | `F01_valide.xlsx` dont la colonne `module` contient le texte `XXX` sur chaque ligne, et dont `isHeading` est saisi comme texte avec des casses variées (`True`, `FALSE`, `true`). |
| `F20_pas_un_classeur.xlsx` | Un fichier texte quelconque renommé avec l'extension `.xlsx`. |
| `export.xls` | Un fichier au format XLS (ancien format Excel). |

Pour dérouler TC05 et TC06, retirer du module MR_TEST, **dans le changeset**,
les artefacts listés dans `F01_valide.xlsx` (sans les supprimer du projet).
