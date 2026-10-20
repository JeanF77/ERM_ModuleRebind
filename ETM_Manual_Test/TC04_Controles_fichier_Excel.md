# TC04 — Contrôles du fichier Excel

**Objectif** : vérifier que le fichier Excel est contrôlé dès sa sélection, que
ses erreurs s'affichent dans la zone de messages avec le numéro de ligne, et
que REBIND ne s'active qu'avec un fichier valide.

Le bloc METADATA de l'export ERM est testé à part, dans
[TC11](TC11_Bloc_METADATA.md).

**Exigences couvertes**
- 5.3-01 — Champ de fichier obligatoire, format XLSX uniquement.
- 5.3-02 — Zone de messages vidée à chaque sélection, puis analyse locale du fichier.
- 5.3-03 — Erreurs du fichier dans la zone de messages.
- 5.4.2-01 — REBIND actif seulement si le fichier respecte tous les prérequis.
- 5.5-10 — Nombre d'artefacts par type dans le résumé du fichier.
- 6.1-01 — Fichier issu de l'export Excel d'une vue ERM.
- 6.1-02 — Format XLSX uniquement.
- 6.1-03 — Seule la première feuille est lue.
- 6.1-05 — Espaces autour des noms de colonnes supprimés, casse respectée.
- 6.2-01 à 6.2-05 — Colonnes obligatoires `id`, `parentBinding`, `isHeading`, `Artifact Type`, `module` (`module` non utilisée).
- 6.2-06 — Autres colonnes ignorées.
- 6.3-01 — `id` : entier, cellule non vide.
- 6.3-02 — `parentBinding` : entier ou cellule vide.
- 6.3-03 — `isHeading` : booléen Excel ou texte `true`/`false` sans tenir compte de la casse ; vide ou autre valeur en erreur, avec le numéro de ligne.
- 6.4-01 — Lignes vides en fin de feuille ignorées.
- 6.4-02 — Ligne vide au milieu des données en erreur, avec son numéro de ligne.
- 6.5-01 — Contrôles locaux dès la sélection ; REBIND actif seulement si tous passent.
- 6.5-02 à 6.5-08 — Les sept contrôles du fichier.
- 7.1-01 — Étape 1 du traitement : contrôles locaux du fichier dès sa sélection.

**Préconditions générales** : voir [00_Index.md](00_Index.md). URI_OK est
saisie et « Project ID » est rempli.

---

## Test Script TS04.1 — Fichiers refusés

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Sélectionner `export.xls` (dans la fenêtre de sélection, choisir « Tous les fichiers » : le filtre ne propose que les fichiers `.xlsx`). | Ligne ERROR « "export.xls" is not an XLSX file. ». Sous le champ : « export.xls: file rejected, see the report below. » REBIND reste inactif (5.3-01, 6.1-02). |
| 2 | Sélectionner `F20_pas_un_classeur.xlsx`. | Ligne ERROR « The file cannot be read as an XLSX workbook. » (6.5-02). |
| 3 | Sélectionner `F02_colonnes_manquantes.xlsx`. | La zone de messages est vidée, puis une ligne ERROR indique « Missing column(s): id, Artifact Type, parentBinding, module. Mandatory columns: id, Artifact Type, isHeading, parentBinding, module. » (5.3-02, 5.3-03, 6.2-01, 6.2-02, 6.2-04, 6.2-05, 6.5-03). |
| 4 | Sélectionner `F03_entete_casse.xlsx`. | Ligne ERROR « Missing column(s): isHeading. … » : la casse des en-têtes est respectée (6.1-05, 6.2-03). |
| 5 | Sélectionner `F04_sans_donnees.xlsx`. | Ligne ERROR « The file contains no data row (at least one row is expected after the headers). » (6.5-04). |
| 6 | Sélectionner `F05_valeurs_invalides.xlsx`. | Une ligne ERROR par valeur invalide, chacune avec son numéro de ligne : `invalid isHeading "yes"`, `isHeading is empty`, `invalid id "abc"`, `id is empty`, `invalid parentBinding "x"` (6.3-01, 6.3-02, 6.3-03, 6.5-06). |
| 7 | Sélectionner `F06_ligne_vide.xlsx`. | Ligne ERROR « Row <n>: empty row in the middle of the data. », avec le numéro de la ligne vide. Les lignes vides de fin de feuille ne sont pas signalées (6.4-01, 6.4-02, 6.5-05). |
| 8 | Sélectionner `F07_doublon.xlsx`. | Ligne ERROR « Row <n>: id <id> already appears in row <m>. » (6.5-07). |
| 9 | Sélectionner `F08_ordre.xlsx`. | Ligne ERROR « Row <n>: parent <parent> of <id> appears after it in the file. » (6.5-08). |
| 10 | Après chacune des étapes 1 à 9, observer le bouton REBIND. | REBIND reste inactif (5.4.2-01, 6.5-01). |

## Test Script TS04.2 — Fichiers valides

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Sélectionner `F01_valide.xlsx` (export d'une vue ERM). | La zone de messages est vidée, puis le fichier est analysé sans autre action. Elle affiche le nombre d'artefacts du fichier, le point d'accrochage (id du titre B), le nombre d'artefacts à la racine du module et le nombre d'artefacts par type, puis « The Excel file meets every prerequisite. » (5.3-02, 5.5-10, 6.1-01, 6.5-01, 7.1-01). |
| 2 | Observer le texte sous le champ. | « F01_valide.xlsx: <n> artifact(s) ready. » (5.3-02). |
| 3 | Observer le bouton REBIND. | REBIND est actif (5.4.2-01, 6.5-01). |
| 4 | Vérifier que la colonne supplémentaire de `F01_valide.xlsx` (par exemple `Name`) n'est pas signalée. | Aucun message ne porte sur cette colonne : elle est ignorée (6.2-06). |
| 5 | Ouvrir `F01_valide.xlsx` dans Excel, ajouter des espaces autour de l'en-tête `id` et deux lignes vides en fin de feuille, enregistrer, puis sélectionner à nouveau le même fichier. | Le fichier est de nouveau accepté : les espaces des en-têtes et les lignes vides de fin sont ignorés. La nouvelle version du fichier est bien relue (6.1-05, 6.4-01). |
| 6 | Sélectionner `F02_colonnes_manquantes.xlsx`, puis de nouveau `F01_valide.xlsx`. | REBIND devient inactif après la sélection du fichier refusé, puis de nouveau actif (6.5-01). |
| 7 | Sélectionner `F19_valeurs_texte.xlsx`. | Le fichier est accepté : `isHeading` est lu quelle que soit la casse du texte, et le contenu de la colonne `module` n'est pas contrôlé (6.2-05, 6.3-03). |
| 8 | Sélectionner `F13_deux_feuilles.xlsx`. | Le fichier est accepté, avec le même nombre d'artefacts que `F01_valide.xlsx` : les valeurs invalides de la deuxième feuille ne sont pas lues (6.1-03). |
