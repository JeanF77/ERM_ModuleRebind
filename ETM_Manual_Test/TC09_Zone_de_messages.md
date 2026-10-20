# TC09 — Zone de messages

**Objectif** : vérifier la présentation des messages, les cas où la zone est
vidée, sa hauteur maximale et l'emplacement des erreurs.

**Exigences couvertes**
- 5.2.1-06 — Erreurs de saisie de « Module URI » sous le champ.
- 5.2.2-06 — Erreurs de lecture du module dans la zone de messages.
- 5.3-03 — Erreurs du fichier Excel dans la zone de messages.
- 5.5-01 — Contenu de la zone : informations, alertes, compte-rendu, erreurs du fichier et du serveur.
- 5.5-02 — Zone vidée à chaque simulation ou exécution et à chaque nouveau fichier Excel.
- 5.5-03 — Hauteur maximale, avec un défilement.
- 5.5-05 — Horodatage et niveau sur chaque ligne.
- 5.5-06 — INFO en vert.
- 5.5-07 — WARNING en orange.
- 5.5-08 — ERROR en rouge.
- 5.5-09 — Couleurs des messages d'ELM_AdminManager.
- 5.5-11 — Compte-rendu seulement dans l'interface : ni « Copy » ni « Download report ».

**Préconditions générales** : voir [00_Index.md](00_Index.md).

---

## Test Script TS09.1 — Présentation et vidage de la zone

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Saisir URI_OK. | Une ligne INFO, en vert, s'affiche avec l'heure au format HH:MM:SS et le niveau « INFO » (5.5-01, 5.5-05, 5.5-06). |
| 2 | Sélectionner `F05_valeurs_invalides.xlsx`. | La zone est vidée, puis des lignes ERROR s'affichent en rouge (5.5-02, 5.5-08). |
| 3 | Sélectionner `F01_valide.xlsx`. | La zone est vidée, puis le résumé du fichier s'affiche (5.5-02). |
| 4 | Lancer une simulation. | La zone est vidée au lancement, puis reçoit le compte-rendu (5.5-01, 5.5-02). |
| 5 | Observer la zone à la fin de la simulation (le fichier contient au moins 45 artefacts). | La zone a une hauteur maximale et une barre de défilement ; la dernière ligne est visible (5.5-03). |
| 6 | Observer les boutons du panneau « 04 / Report ». | Il n'y a ni bouton « Copy » ni bouton « Download report » (5.5-11). |
| 7 | (Si TC03/TS03.3 est réalisable) Observer l'avertissement « The name of project area … cannot be read. … ». Sinon, observer l'avertissement de TC10/TS10.1. | La ligne WARNING est affichée en orange (5.5-07). |
| 8 | Comparer les couleurs des lignes INFO, WARNING et ERROR avec celles des messages du widget ELM_AdminManager. | Les couleurs sont les mêmes (5.5-09). |

## Test Script TS09.2 — Emplacement des erreurs

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Saisir URI_STREAM. | Le message d'erreur s'affiche **sous le champ** « Module URI » et non dans la zone de messages (5.2.1-06). |
| 2 | Saisir une URI de la bonne forme qui désigne une exigence. | L'erreur « The URI does not designate a module. » s'affiche **dans la zone de messages** (5.2.2-06). |
| 3 | Sélectionner `F02_colonnes_manquantes.xlsx`. | L'erreur s'affiche **dans la zone de messages** (5.3-03). |
