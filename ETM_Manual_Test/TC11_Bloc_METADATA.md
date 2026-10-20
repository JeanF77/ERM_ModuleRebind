# TC11 — Bloc METADATA de l'export ERM

**Objectif** : vérifier que le bloc METADATA ajouté par l'export Excel d'une
vue ERM est reconnu et ignoré par les contrôles du fichier, quelle que soit sa
position dans la feuille, et que le compte-rendu le signale.

**Exigences couvertes**
- 6.1-04 — En-têtes en ligne 1, ou juste après le bloc METADATA s'il ouvre la feuille.
- 6.4-01 — Lignes vides de fin de feuille ignorées, y compris autour d'un bloc METADATA en fin de feuille.
- 6.5-03 — Bloc METADATA écarté avant le contrôle des en-têtes.
- 6.6-01 — Lignes du bloc METADATA ignorées par tous les contrôles du fichier.
- 6.6-02 — Reconnaissance du bloc : ligne `METADATA`, puis lignes `Nom=Valeur`, en colonne A seulement.
- 6.6-03 — Bloc reconnu où qu'il se trouve dans la feuille.
- 6.6-04 — Bloc en fin de feuille : lignes vides autour ignorées.
- 6.6-05 — Bloc en tête de feuille : en-têtes sur la première ligne non vide qui suit.
- 6.6-06 — Bloc au milieu des données : lignes vides autour en erreur.
- 6.6-07 — Numéros de ligne réels de la feuille Excel dans les messages d'erreur.
- 6.6-08 — Valeurs du bloc non contrôlées.
- 6.6-09 — Ligne INFO qui signale le bloc ignoré.
- 6.6-10 — Ligne `METADATA` avec d'autres cellules remplies contrôlée comme une ligne de données.

**Préconditions générales** : voir [00_Index.md](00_Index.md). URI_OK est
saisie et « Project ID » est rempli.

---

## Test Script TS11.1 — Bloc reconnu et ignoré

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Sélectionner `F01_valide.xlsx` (export ERM réel, bloc METADATA à sa place d'origine). | Le fichier est accepté. Une ligne INFO « METADATA block of the ERM export ignored: <n> row(s), rows <a> to <b> » indique le nombre de lignes et la position réelle du bloc dans la feuille (6.6-01, 6.6-09). **Noter cette position** : elle indique où l'export ERM place le bloc. |
| 2 | Sélectionner `F11_sans_metadata.xlsx`. | Le fichier est accepté, avec le même nombre d'artefacts que `F01_valide.xlsx`. Aucune ligne INFO ne parle du bloc METADATA (6.6-01). |
| 3 | Sélectionner `F12_metadata_en_tete.xlsx`. | Le fichier est accepté : les en-têtes sont lus sur la première ligne non vide après le bloc. La ligne INFO indique un bloc à partir de la ligne 1 (6.1-04, 6.5-03, 6.6-02, 6.6-05). |
| 4 | Sélectionner `F14_metadata_fin.xlsx`. | Le fichier est accepté : les lignes vides avant et après le bloc ne sont pas signalées. La valeur modifiée de `Export Module=` n'est pas signalée non plus (6.4-01, 6.6-04, 6.6-08). |
| 5 | Sélectionner `F16_metadata_milieu.xlsx`. | Le fichier est accepté. La ligne INFO indique la position du bloc au milieu des données (6.6-03). |

## Test Script TS11.2 — Cas d'erreur autour du bloc

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Sélectionner `F15_metadata_milieu_lignes_vides.xlsx`. | Le fichier est refusé. Deux lignes ERROR « Row <n>: empty row in the middle of the data. » citent les lignes vides qui entourent le bloc (6.6-06). |
| 2 | Ouvrir `F15_metadata_milieu_lignes_vides.xlsx` dans Excel et comparer. | Les numéros de ligne affichés à l'étape 1 sont ceux de la feuille Excel, bloc METADATA compris (6.6-07). |
| 3 | Sélectionner `F17_metadata_autre_cellule.xlsx`. | Le fichier est refusé. Des lignes ERROR citent la ligne `METADATA` et les lignes `Nom=Valeur` qui la suivent : la ligne `METADATA` n'est pas reconnue comme un bloc, elle est contrôlée comme une ligne de données (6.6-02, 6.6-10). |
| 4 | Observer le bouton REBIND après les étapes 1 et 3. | REBIND reste inactif (6.6-06, 6.6-10). |
