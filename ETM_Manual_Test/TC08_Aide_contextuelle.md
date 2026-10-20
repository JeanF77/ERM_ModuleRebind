# TC08 — Aide contextuelle

**Objectif** : vérifier la présence et le comportement de l'aide contextuelle
de chaque panneau.

**Exigences couvertes**
- 5.1-05 — Bouton « ? » sur chaque panneau, qui ouvre une popover Bootstrap au clic.
- 5.1-06 — Popover fermée au clic ailleurs dans le widget.
- 5.1-07 — Aide accessible au clavier.
- 5.1-08 — Titre et texte de l'aide lus dans `messages_en.json` (clés `panel.<nom>.title` et `panel.<nom>.help`).

**Préconditions générales** : voir [00_Index.md](00_Index.md).

---

## Test Script TS08.1 — Popovers d'aide

| # | Action | Résultat attendu |
|---|--------|-------------------|
| 1 | Cliquer sur le bouton « ? » du panneau « 01 / Module ». | Une popover s'ouvre, avec le titre « Target module » et un texte qui rappelle la forme attendue de l'URI et l'obligation d'un changeset (5.1-05). |
| 2 | Cliquer ailleurs dans le widget. | La popover se ferme (5.1-06). |
| 3 | Répéter les étapes 1 et 2 pour « 02 / Excel file », « 03 / Rebind » et « 04 / Report ». | Chaque panneau a son bouton « ? ». Chaque popover a un titre et un texte propres à son panneau : colonnes obligatoires du fichier, modes simulation et réel, contenu de la zone de messages (5.1-05, 5.1-06). |
| 4 | Atteindre un bouton « ? » avec la touche Tab, puis appuyer sur Entrée. | La popover s'ouvre. Elle se ferme quand le focus quitte le bouton (touche Tab) (5.1-07). |
| 5 | (Revue) Ouvrir `resources/messages_en.json`. | Les titres et textes affichés aux étapes 1 à 3 sont ceux des clés `panel.module.*`, `panel.excel.*`, `panel.rebind.*` et `panel.report.*` (`title` et `help`) (5.1-08). |
