# ERM Module Rebind — Exigences et couverture par les cas de test

Généré par `_recap_tools/req_catalog.py` à partir de `ERM_ModuleRebind-v2.docx` : ne pas modifier à la main.

Chaque exigence balisée `[ReqStart] … [ReqEnd]` reçoit un repère `<section>-<rang>` : `5.2.1-03` est la 3e exigence de la section 5.2.1, dans l'ordre du document. Les cas de test citent ces repères. Après l'import dans ERM, ce tableau sert à retrouver chaque exigence et à créer les liens « Validated By » vers les cas de test ETM.

**178 exigences**, **178 couvertes** par au moins un cas de test.

| Repère | Exigence | Cas de test |
|---|---|---|
| **2 Identification et environnement** | | |
| 2-01 | Le widget s'appelle « ERM Module Rebind ». Sa première version est v2026a. | TC01 |
| 2-02 | Le widget cible ERM v7.0.3 et les versions suivantes. | TC01 |
| 2-03 | Le widget fonctionne avec les navigateurs Chrome et Edge. | TC01 |
| 2-04 | Les fichiers du widget sont hébergés sur le serveur ERM. Le widget est déclaré comme gadget OpenSocial (main.xml). | TC14 |
| **3 Contraintes de codage** | | |
| 3-01 | Le code est commenté, lisible et compréhensible, pour faciliter la maintenance. | TC13 |
| 3-02 | Chaque fonction JavaScript a un bloc JSDoc qui décrit son usage, ses arguments d'entrée et les informations retournées. | TC13 |
| 3-03 | Tous les commentaires sont en anglais. | TC13 |
| 3-04 | Le widget est développé en JavaScript avec jQuery 3.7.1. | TC13 |
| 3-05 | L'interface graphique utilise Bootstrap 5.3.3 (ou une version supérieure) et Bootstrap Icons 1.13.1. | TC13 |
| 3-06 | Des librairies tierces peuvent être utilisées si elles facilitent le développement et la maintenance. Elles doivent être open source et maintenues. | TC13 |
| 3-07 | Le fichier Excel est lu avec SheetJS Community Edition 0.20.3 (licence Apache 2.0), la dernière version publiée. | TC13 |
| 3-08 | Tous les textes affichés sont placés dans resources/messages_en.json (voir 5.6). | TC13 |
| 3-09 | Les messages de la console du navigateur, destinés au débogage, restent en anglais dans le code. | TC13 |
| 3-10 | Le code n'est pas monolithique : chaque grande fonction (interface, lecture du fichier Excel, requêtes REST, etc.) est placée dans son propre fichier JavaScript (voir 4.1). | TC13 |
| 3-11 | Chaque fichier source commence par le cartouche d'ELM_AdminManager (sauf main.xml, voir ci-dessous) : • « (C) Copyright 2026 by Safran Aircraft Engines — All rights reserved » ; • un tableau des révisions (Revision, Date, Author, Issue), avec l'auteur Dr Jazz. | TC13 |
| 3-12 | Dans main.html, le cartouche prend la forme d'un commentaire HTML, avec le tableau des révisions et l'historique des versions (« v2026a : version initiale »). | TC13 |
| 3-13 | Dans main.xml, le cartouche est simplifié : un commentaire XML qui contient seulement la mention « (C) Copyright 2026 by Safran Aircraft Engines — All rights reserved », sans tableau des révisions ni historique des versions. | TC13 |
| **4 Organisation des fichiers** | | |
| 4-01 | Le widget est construit à la racine du projet. | TC14 |
| 4-02 | main.xml contient la déclaration « OpenSocial Gadget » : titre « ERM Module Rebind », icône resources/attach_file.png. Aucune UserPref n'est déclarée. | TC14 |
| 4-03 | main.html contient l'interface du widget. | TC14 |
| 4-04 | Le dossier css/ contient les styles. | TC14 |
| 4-05 | Le dossier js/ contient le code JavaScript. | TC14 |
| 4-06 | Le dossier lib/ contient jquery/jquery-3.7.1.min.js et xlsx-0.20.3/xlsx.full.min.js (SheetJS Community Edition 0.20.3, avec son fichier LICENSE). | TC14 |
| 4-07 | Le dossier resources/ contient attach_file.png (icône du widget, 24 × 24 px, également utilisée comme favicon) et messages_en.json (textes de l'interface). | TC14 |
| 4-08 | Bootstrap 5.3.3 et Bootstrap Icons 1.13.1 sont chargés depuis ../ELM_sharedLib/, partagés avec les autres widgets, avec les mêmes chemins qu'ELM_AdminManager. | TC14 |
| 4-09 | README.md (présentation du widget) et ETM_Manual_Test/ (cas de test manuels ETM) sont placés à la racine du projet (voir 8). | TC14 |
| 4-10 | SheetJS 0.20.3 se télécharge sur le site officiel de SheetJS, et non sur le registre npm, où le paquet xlsx est resté à une ancienne version (0.18.5) qui a des failles de sécurité connues : • https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js ; • https://cdn.sheetjs.com/xlsx-0.20.3/package/LICENSE. | TC14 |
| **4.1 Découpage du code JavaScript** | | |
| 4.1-01 | Chaque fichier JavaScript a une seule responsabilité. | TC13 |
| 4.1-02 | Comme dans ELM_AdminManager, les fichiers JavaScript sont des scripts classiques chargés dans un ordre fixe par main.html. | TC13 |
| 4.1-03 | Les noms de fonctions portent un préfixe qui indique leur fichier (par exemple excel_readWorkbook, rest_get, gui_updateRebindButton). | TC13 |
| 4.1-04 | Le code JavaScript est réparti dans les fichiers suivants : • js/ERM_config.js — constantes : version du widget, colonnes obligatoires, taille des lots, intervalles et délai de suivi, format des noms de fichiers ; • js/OSLC_NameSpace.js — espaces de noms RDF et OSLC (rdf, module, dcterms, oslc, auto, xsd) ; • js/ERM_messages.js — chargement de messages_en.json, fonction getText(key, params), remplissage des attributs data-text-key ; • js/ERM_utils.js — outils génériques : horodatage, téléchargement de fichier, lecture des attributs RDF, temporisation ; • js/ERM_rest.js — requêtes REST : GET et PUT, en-têtes ERM et OSLC, variantes en cas de refus 403, en-tête anti-CSRF, analyse des réponses XML, erreurs HTTP ; • js/ERM_uri.js — analyse et contrôle de la « Module URI », déduction du serveur et du changeset ; • js/ERM_module.js — lecture du module : UUID et nom du projet, titre du module, lien vers sa structure ; • js/ERM_excel.js — lecture du fichier XLSX avec SheetJS et contrôles locaux (voir 6.5) ; • js/ERM_query.js — découverte du service de requête OSLC et résolution des IDs ; • js/ERM_structure.js — lecture de la structure du module, contrôles côté serveur, construction des nouveaux bindings ; • js/ERM_rebind.js — enchaînement du traitement : simulation, exécution, suivi de la tâche serveur, vérification finale ; • js/ERM_report.js — zone de messages, compte-rendu (horodatage et niveaux), barre de progression ; • js/ERM_gui.js — interface : état des champs et erreurs sous les champs, sélecteur de simulation, bouton REBIND, fenêtre de confirmation, popovers d'aide ; • js/main.js — point d'entrée : chargement des textes, puis initialisation de l'interface. | TC13 |
| 4.1-05 | Seuls ERM_gui.js et ERM_report.js modifient l'interface. | TC13 |
| 4.1-06 | Les fichiers de traitement (ERM_excel.js, ERM_query.js, ERM_structure.js, ERM_rebind.js…) renvoient leurs résultats et passent par ERM_report.js pour écrire dans la zone de messages. | TC13 |
| **5.1 Principes généraux** | | |
| 5.1-01 | La présentation reprend le style du widget « ELM_AdminManager » (dossier ./ELM_AdminManager), pour uniformiser les widgets d'administration. | TC01 |
| 5.1-02 | Toute l'interface est en anglais. | TC01 |
| 5.1-03 | Le numéro de version est affiché uniquement en pied de page. | TC01 |
| 5.1-04 | L'interface compte quatre panneaux numérotés : • 01 / Module : champs « Module URI » et « Project ID », nom du projet ; • 02 / Excel file : sélection du fichier Excel ; • 03 / Rebind : sélecteur de simulation, bandeau « LIVE MODE », bouton « REBIND », barre de progression ; • 04 / Report : zone de messages et compte-rendu, placée en bas, car le compte-rendu suit l'action. | TC01 |
| 5.1-05 | Aide contextuelle : chaque panneau a un bouton « ? » qui ouvre une popover Bootstrap au clic. | TC08 |
| 5.1-06 | La popover d'aide se ferme au clic ailleurs dans le widget. | TC08 |
| 5.1-07 | L'aide contextuelle est aussi accessible au clavier, car l'icône d'aide est un vrai bouton. | TC08 |
| 5.1-08 | Le titre et le texte de l'aide viennent de messages_en.json (clés panel.<nom>.title et panel.<nom>.help). | TC08 |
| **5.2.1 Champ « Module URI »** | | |
| 5.2.1-01 | Le champ « Module URI » est obligatoire. Il sert à saisir l'URI du module dans son contexte de configuration. | TC01, TC02 |
| 5.2.1-02 | Une seule forme d'URI est acceptée (une fonction d'ERM permet de la récupérer facilement) : • https://<serveur>:<port>/rm/resources/<id>?oslc_config.context=<URI du changeset> | TC02 |
| 5.2.1-03 | La valeur de oslc_config.context est acceptée encodée ou non encodée, par exemple : • https://erm.example.com:9443/rm/resources/MD_LqgJQlkMEfGga_ma136JyQ?oslc_config.context=https%3A%2F%2Ferm.example.com%3A9443%2Frm%2Fcm%2Fchangeset%2F_5jA05lkKEfGga_ma136JyQ • https://erm.example.com:9443/rm/resources/MD_LqgJQlkMEfGga_ma136JyQ?oslc_config.context=https://erm.example.com:9443/rm/cm/changeset/_5jA05lkKEfGga_ma136JyQ | TC02 |
| 5.2.1-04 | Les espaces en début et fin de saisie sont supprimés. | TC02 |
| 5.2.1-05 | Le préfixe MD_ n'est pas contrôlé, car il n'existe que depuis la version 7 de Jazz. | TC02 |
| 5.2.1-06 | Contrôles à la saisie. Ils sont faits sans appel au serveur. Leurs erreurs s'affichent sous le champ (style Bootstrap is-invalid) et REBIND reste désactivé. | TC02, TC09 |
| 5.2.1-07 | Contrôle à la saisie de la forme de l'URI : elle respecte la forme ci-dessus. Sinon, un message rappelle la forme attendue. C'est le cas d'une URL du client web ERM, d'un paramètre en plus ou de l'absence de oslc_config.context. | TC02 |
| 5.2.1-08 | Contrôle à la saisie du contexte de configuration : il doit être un changeset (.../rm/cm/changeset/_<id>). Sinon (stream, baseline, configuration globale), un message rappelle que la création d'un changeset est obligatoire. | TC02 |
| 5.2.1-09 | Contrôle à la saisie du serveur du changeset : il doit être le même serveur que celui du module (même protocole, même nom d'hôte, même port). Sinon, une erreur s'affiche. | TC02 |
| 5.2.1-10 | Serveur ERM. L'adresse du serveur ERM est déduite de l'URI du module. Par exemple, si l'URI du module est https://erm.example.com:9443/rm/resources/MD_QlQfpF85EfGkXe6dYVgpBA, l'adresse du serveur ERM est https://erm.example.com:9443. | TC02, TC12 |
| 5.2.1-11 | Le serveur de l'URI du module n'est pas comparé à celui qui héberge le widget : les environnements et la politique CORS sont configurés pour permettre les accès d'un serveur à l'autre. | TC02 |
| **5.2.2 Lecture du module** | | |
| 5.2.2-01 | Dès qu'une « Module URI » valide est saisie, le widget lit le module sur le serveur, dans le contexte du changeset. | TC03, TC12 |
| 5.2.2-02 | Un indicateur de chargement s'affiche pendant la lecture du module. | TC03 |
| 5.2.2-03 | Le widget récupère l'UUID de la zone de projet dans la réponse RDF du module. Il lit ensuite le nom du projet, par une requête supplémentaire. | TC03 |
| 5.2.2-04 | La lecture du module vérifie aussi que le module existe dans le changeset. Il n'y a pas de vérification dédiée du changeset : s'il n'existe pas, la lecture du module échoue. | TC03 |
| 5.2.2-05 | La lecture du module est relancée à chaque nouvelle « Module URI » valide. | TC03 |
| 5.2.2-06 | Les erreurs de lecture du module s'affichent dans la zone de messages, pour ne pas surcharger l'interface. | TC03, TC09 |
| 5.2.2-07 | En cas d'échec de la lecture du module (module introuvable, session expirée, droits insuffisants, erreur réseau), « Project ID » reste vide, la cause s'affiche et REBIND est désactivé. Pour débloquer, l'utilisateur corrige l'URI ou rétablit sa session, puis la lecture est relancée. | TC03 |
| 5.2.2-08 | Si la réponse ne contient pas de structure de module (mod:structure), l'erreur « The URI does not designate a module » s'affiche et REBIND est désactivé. | TC03 |
| **5.2.3 Champ « Project ID »** | | |
| 5.2.3-01 | Le champ « Project ID » contient l'UUID interne de la zone de projet (par exemple _3IzYkB9TEfCqm5tHKKNb7A), et non son nom. | TC03 |
| 5.2.3-02 | Le champ « Project ID » est en lecture seule, rempli automatiquement par la lecture du module (5.2.2) et recalculé sans message à chaque nouvelle URI valide. | TC01, TC03 |
| 5.2.3-03 | Le champ « Project ID » est obligatoire : tant qu'il est vide, REBIND reste désactivé. | TC03 |
| 5.2.3-04 | Les caractères admis dans « Project ID » sont [A-Za-z0-9_-]. Ils sont vérifiés sur la valeur lue sur le serveur. Une valeur anormale donne une erreur dans la zone de messages, et REBIND reste désactivé. | TC13 |
| **5.2.4 Nom du projet** | | |
| 5.2.4-01 | Le nom de la zone de projet s'affiche sous « Project ID », en lecture seule (par exemple « Project: M30-TRD »). | TC03 |
| 5.2.4-02 | Le nom du projet sert uniquement à l'affichage : seul l'UUID est utilisé par le traitement. | TC12, TC13 |
| 5.2.4-03 | Si le nom du projet ne peut pas être lu, un avertissement s'affiche dans la zone de messages et REBIND reste utilisable. | TC03 |
| **5.3 Panneau 02 / Excel file** | | |
| 5.3-01 | Le champ de sélection du fichier Excel est obligatoire. Il n'accepte que les fichiers au format XLSX. | TC01, TC04 |
| 5.3-02 | À chaque sélection d'un fichier, la zone de messages est vidée, puis le fichier est analysé localement (voir 6.5). | TC04 |
| 5.3-03 | Les erreurs du fichier Excel s'affichent dans la zone de messages. | TC04, TC09 |
| **5.4.1 Sélecteur de simulation ON/OFF** | | |
| 5.4.1-01 | Au démarrage, le sélecteur de simulation est sur ON. Le widget est ainsi toujours lancé en mode simulation, ce qui prévient les erreurs de manipulation. | TC01 |
| 5.4.1-02 | Mode réel (OFF) : un signal visuel fort s'affiche : • le bouton devient rouge, avec le libellé « REBIND (LIVE) » ; • un bandeau orange s'affiche au-dessus : « LIVE MODE: changes will be written to the changeset ». | TC06 |
| 5.4.1-03 | Le sélecteur revient sur ON à la fin de toute exécution réelle, quel que soit le résultat (succès, échec ou délai dépassé). | TC06, TC10 |
| 5.4.1-04 | Si l'utilisateur clique sur « Cancel » dans la fenêtre de confirmation, le sélecteur reste sur OFF. | TC06 |
| **5.4.2 Bouton « REBIND »** | | |
| 5.4.2-01 | Le bouton « REBIND » est actif si toutes ces conditions sont réunies : • la « Module URI » est valide ; • le « Project ID » est rempli ; • le fichier Excel respecte tous les prérequis (voir 6). | TC01, TC02, TC04 |
| 5.4.2-02 | Le bouton « REBIND » est désactivé pendant la simulation ou l'exécution. | TC05 |
| 5.4.2-03 | Le bouton « REBIND » est réactivé à la fin de la simulation ou de l'exécution, y compris si le délai de suivi de la tâche serveur est dépassé (voir 7.6). | TC05, TC10 |
| **5.4.3 Fenêtre de confirmation** | | |
| 5.4.3-01 | En exécution réelle uniquement, une fenêtre Bootstrap demande une confirmation avant toute écriture. Elle remplace le confirm() du script et rappelle : • le titre du module ; • le nom du projet ; • le nombre d'artefacts à rattacher ; • les points d'accrochage, et la racine du module le cas échéant ; • le changeset. | TC05, TC06 |
| 5.4.3-02 | La fenêtre de confirmation a deux boutons : « Cancel » et « Rebind » (en rouge). | TC06 |
| **5.4.4 Barre de progression** | | |
| 5.4.4-01 | Pendant la recherche des IDs, la barre de progression affiche un pourcentage réel, par exemple « Resolving IDs: 80/126 ». | TC05 |
| 5.4.4-02 | Pendant le traitement serveur, la barre de progression est animée, sans pourcentage (l'avancement n'est pas connu), avec le temps écoulé. | TC06 |
| **5.5 Panneau 04 / Report** | | |
| 5.5-01 | La zone de messages reçoit les messages d'information et d'alerte, le compte-rendu de simulation ou d'exécution, les erreurs du fichier Excel et les erreurs venant du serveur. | TC09 |
| 5.5-02 | La zone de messages est vidée au lancement de chaque simulation ou exécution, et à chaque sélection d'un nouveau fichier Excel. | TC05, TC09 |
| 5.5-03 | La zone de messages a une hauteur maximale, avec un défilement : un compte-rendu peut dépasser une centaine de lignes, une par artefact. | TC09 |
| 5.5-04 | Le compte-rendu reprend la forme de celui du script LiF-107267-binding-script.js, traduite en anglais. | TC05 |
| 5.5-05 | Chaque ligne du compte-rendu a un horodatage et un niveau, par exemple 14:32:10  INFO  126 artifacts to rebind under 1 anchor point(s)…. | TC05, TC09 |
| 5.5-06 | Le niveau INFO s'affiche en vert. Il signale le déroulement normal : étapes, compteurs, vérification finale. | TC09 |
| 5.5-07 | Le niveau WARNING s'affiche en orange. Il signale une situation à surveiller qui ne bloque pas (nom du projet non lu, délai de suivi dépassé…). | TC09 |
| 5.5-08 | Le niveau ERROR s'affiche en rouge. Il signale une erreur qui arrête le traitement ou bloque REBIND. | TC09 |
| 5.5-09 | Les couleurs des niveaux reprennent celles des messages d'ELM_AdminManager. | TC09 |
| 5.5-10 | La colonne Artifact Type du fichier Excel sert au compte-rendu : un résumé du nombre d'artefacts par type, et le type affiché à côté de chaque ID dans le détail. | TC04, TC05 |
| 5.5-11 | Le compte-rendu s'affiche seulement dans l'interface : il n'y a pas de bouton « Copy » ni « Download report ». | TC09 |
| **5.6 Textes de l'interface** | | |
| 5.6-01 | Tous les textes affichés (libellés, aides, messages d'erreur, compte-rendu) sont placés dans resources/messages_en.json. | TC13 |
| 5.6-02 | Les clés des textes sont hiérarchiques : panel.module.help, error.uri.notChangeset… | TC13 |
| 5.6-03 | Les parties variables des textes sont des marqueurs nommés, comme {count}, remplacés par la fonction getText(key, params). | TC13 |
| 5.6-04 | Les libellés de main.html portent l'attribut data-text-key="…", rempli au démarrage. | TC01, TC13 |
| 5.6-05 | Une clé introuvable s'affiche telle quelle à l'écran, avec un avertissement dans la console : un oubli reste visible pendant les tests. | TC01 |
| 5.6-06 | Le fichier messages_en.json est indispensable. S'il est absent ou invalide, un unique message écrit dans le code s'affiche (« Unable to load resources/messages_en.json. The widget cannot start. »), puis le widget s'arrête. | TC01 |
| **6.1 Origine et format** | | |
| 6.1-01 | Le fichier Excel est obligatoirement issu de l'export Excel d'une vue ERM. | TC04 |
| 6.1-02 | Le fichier Excel est au format XLSX uniquement. | TC04 |
| 6.1-03 | Seule la première feuille du classeur est lue. | TC04 |
| 6.1-04 | Les en-têtes sont en ligne 1, ou juste après le bloc METADATA si celui-ci ouvre la feuille (voir 6.6). | TC11 |
| 6.1-05 | Les espaces en début et fin des noms de colonnes sont supprimés, puis la casse est respectée (isHeading est différent de isheading). | TC04 |
| 6.1-06 | Le fichier Excel est lu avec SheetJS Community Edition 0.20.3, placée dans ./lib. | TC13 |
| **6.2 Colonnes** | | |
| 6.2-01 | La colonne id est obligatoire. Elle contient l'ID numérique de l'artefact à rattacher. | TC04 |
| 6.2-02 | La colonne parentBinding est obligatoire. Elle contient l'ID numérique de l'artefact parent. Vide = l'artefact est placé à la racine du module, par exemple un titre de niveau 1. | TC04 |
| 6.2-03 | La colonne isHeading est obligatoire. Elle indique si l'artefact est un titre dans le module. | TC04 |
| 6.2-04 | La colonne Artifact Type est obligatoire. Elle ne sert qu'au compte-rendu (voir 5.5). | TC04 |
| 6.2-05 | La colonne module est obligatoire : elle doit être présente, mais n'est pas utilisée en v2026a. | TC04 |
| 6.2-06 | Les autres colonnes du fichier Excel ne sont pas obligatoires et sont ignorées. | TC04 |
| **6.3 Valeurs acceptées** | | |
| 6.3-01 | La valeur de id est un entier. La cellule ne peut pas être vide. | TC04 |
| 6.3-02 | La valeur de parentBinding est un entier, ou une cellule vide pour la racine du module. | TC04 |
| 6.3-03 | La valeur de isHeading est un booléen Excel, ou le texte true ou false, sans tenir compte de la casse. Une cellule vide ou toute autre valeur donne une erreur, avec le numéro de ligne. | TC04 |
| **6.4 Lignes vides** | | |
| 6.4-01 | Les lignes vides en fin de feuille sont ignorées, y compris celles qui précèdent ou suivent un bloc METADATA placé en fin de feuille (voir 6.6). | TC04, TC11 |
| 6.4-02 | Une ligne vide au milieu des données donne une erreur, avec son numéro de ligne. | TC04 |
| **6.5 Contrôles au chargement du fichier** | | |
| 6.5-01 | Les contrôles du fichier Excel sont faits localement, dès la sélection du fichier. Le bouton REBIND ne s'active que si tous passent. | TC04 |
| 6.5-02 | Contrôle du fichier : le fichier se lit comme un classeur XLSX. | TC04 |
| 6.5-03 | Contrôle du fichier : les 5 en-têtes obligatoires sont présents. Le bloc METADATA de l'export ERM est au préalable écarté (voir 6.6). | TC04, TC11 |
| 6.5-04 | Contrôle du fichier : le fichier contient au moins une ligne de données, donc au moins 2 lignes en comptant l'en-tête. | TC04 |
| 6.5-05 | Contrôle du fichier : aucune ligne vide au milieu des données. | TC04 |
| 6.5-06 | Contrôle du fichier : id, parentBinding et isHeading ont des valeurs valides (voir 6.3). | TC04 |
| 6.5-07 | Contrôle du fichier : aucun id en double. | TC04 |
| 6.5-08 | Contrôle du fichier : chaque parent apparaît avant ses enfants dans le fichier, sauf s'il s'agit d'un point d'accrochage ou de la racine (voir 7.2). | TC04 |
| **6.6 Bloc METADATA de l'export ERM** | | |
| 6.6-01 | Les lignes du bloc METADATA ne servent pas au widget. Elles sont ignorées par tous les contrôles du fichier (voir 6.5). | TC11 |
| 6.6-02 | Reconnaissance : le bloc METADATA commence par une ligne dont la seule cellule remplie est la colonne A, avec le texte METADATA. Il se poursuit par les lignes dont la seule cellule remplie est la colonne A, avec un texte de la forme Nom=Valeur. Il se termine à la première ligne qui n'a pas cette forme (ligne vide, en-têtes ou données). | TC11 |
| 6.6-03 | Le bloc METADATA est reconnu où qu'il se trouve dans la feuille. | TC11 |
| 6.6-04 | Bloc METADATA en fin de feuille : les lignes vides qui l'entourent sont des lignes vides de fin de feuille, donc ignorées (voir 6.4). | TC11 |
| 6.6-05 | Bloc METADATA en tête de feuille : les en-têtes sont sur la première ligne non vide qui suit le bloc. | TC11 |
| 6.6-06 | Bloc METADATA au milieu des données : le bloc est ignoré, mais les lignes vides qui l'entourent restent des lignes vides au milieu des données, donc des erreurs (voir 6.4). | TC11 |
| 6.6-07 | Les messages d'erreur du fichier gardent les numéros de ligne réels de la feuille Excel. | TC11 |
| 6.6-08 | Les valeurs du bloc METADATA (module, configuration, projet exportés) ne sont pas contrôlées en v2026a. | TC11 |
| 6.6-09 | Une ligne INFO du compte-rendu indique que le bloc METADATA a été ignoré, avec le nombre de lignes et leur position, par exemple « METADATA block of the ERM export ignored: 6 row(s), rows 9 to 14 ». | TC11 |
| 6.6-10 | Une ligne METADATA qui a d'autres cellules remplies n'est pas reconnue comme un bloc de métadonnées : elle est contrôlée comme une ligne de données. | TC11 |
| **7.1 Déroulement** | | |
| 7.1-01 | Étape 1 du traitement : contrôles locaux du fichier (voir 6.5), faits dès sa sélection. | TC04 |
| 7.1-02 | Étape 2 du traitement : découverte du service de requête OSLC à partir du document services.xml du projet. Le service est détecté automatiquement. En cas de refus 403, plusieurs variantes d'en-têtes OSLC sont essayées, comme dans le script. | TC05, TC12, TC13 |
| 7.1-03 | Étape 3 du traitement : résolution des IDs en URIs d'artefacts, par lots de 40 IDs. Plusieurs syntaxes de requête sont testées, comme dans le script. La barre de progression affiche l'avancement. Si un ID est introuvable dans la configuration, le traitement s'arrête avec une erreur. | TC05, TC07, TC12 |
| 7.1-04 | Étape 4 du traitement : lecture de la structure du module, avec son ETag. | TC05, TC12 |
| 7.1-05 | Étape 5 du traitement, contrôle côté serveur : un module cible vide est refusé, car il n'a aucun binding existant sur lequel copier le type, le module et le composant. | TC07 |
| 7.1-06 | Étape 5 du traitement, contrôle côté serveur : aucun artefact du fichier ne doit être déjà présent dans le module (arrêt par sécurité). | TC06, TC07 |
| 7.1-07 | Étape 5 du traitement, contrôle côté serveur : chaque point d'accrochage doit être présent exactement une fois dans le module. | TC07 |
| 7.1-08 | Étape 6 du traitement : construction des nouveaux bindings (voir 7.2). | TC05 |
| 7.1-09 | Étape 7 du traitement : simulation (voir 7.4) ou écriture (voir 7.5). | TC05 |
| 7.1-10 | Étape 8 du traitement : suivi de la tâche serveur (voir 7.6). | TC06 |
| 7.1-11 | Étape 9 du traitement : vérification finale : « X/Y artifacts present in the module ». | TC06 |
| **7.2 Règles de rattachement** | | |
| 7.2-01 | Racine du module : si parentBinding est vide, l'artefact est ajouté en fin de module, sous la racine de la structure. | TC05, TC06 |
| 7.2-02 | Point d'accrochage : si parentBinding désigne un ID absent du fichier, cet ID doit exister exactement une fois dans le module. Les enfants sont ajoutés en fin de chapitre. | TC05, TC06, TC07 |
| 7.2-03 | Parent présent dans le fichier : l'artefact est construit sous son parent, comme dans le script. | TC05 |
| 7.2-04 | Modèle de binding : les propriétés de chaque nouveau binding (type, module, composant) sont copiées sur le premier point d'accrochage. S'il n'y en a pas, parce que le fichier ne contient que des artefacts à la racine, un binding existant du module sert de modèle. | TC05 |
| 7.2-05 | L'option INSERER_APRES du script (insertion après un artefact frère précis) est abandonnée : l'insertion se fait toujours en fin de chapitre ou en fin de module. | TC05 |
| **7.3 Constantes internes** | | |
| 7.3-01 | Les paramètres du script ne sont plus modifiables par l'utilisateur. | TC13 |
| 7.3-02 | Le service de requête (QUERY_BASE) est détecté automatiquement. | TC05, TC13 |
| 7.3-03 | La taille des lots de requêtes (TAILLE_LOT_REQUETE) est de 40 IDs. | TC05, TC12, TC13 |
| 7.3-04 | L'intervalle d'interrogation de la tâche serveur est de 2 s au début, puis de plus en plus espacé, jusqu'à 10 s. | TC12, TC13 |
| 7.3-05 | Le délai maximum de suivi de la tâche serveur est de 15 minutes. | TC10, TC13 |
| **7.4 Mode simulation** | | |
| 7.4-01 | En mode simulation, rien n'est écrit dans ERM. | TC05, TC07 |
| 7.4-02 | En mode simulation, la structure du module avant et après modification est téléchargée (voir 7.8), pour contrôle. | TC05 |
| **7.5 Mode exécution réelle** | | |
| 7.5-01 | En exécution réelle, la fenêtre de confirmation s'affiche d'abord (voir 5.4.3). Si l'utilisateur annule, rien n'est écrit. | TC06 |
| 7.5-02 | En exécution réelle, la structure avant modification est téléchargée comme sauvegarde, juste avant l'écriture. Elle reste donc disponible même si l'écriture échoue. | TC06 |
| 7.5-03 | En exécution réelle, la nouvelle structure est envoyée avec le contrôle If-Match sur l'ETag lu en 7.1. | TC12 |
| 7.5-04 | L'en-tête anti-CSRF X-Jazz-CSRF-Prevent n'est envoyé que si le module est sur le serveur qui héberge le widget, car le cookie JSESSIONID lisible est celui de ce serveur. | TC12 |
| **7.6 Suivi de la tâche serveur** | | |
| 7.6-01 | Quand ERM accepte l'écriture, il répond souvent « 202 Accepted » : la mise à jour se poursuit sur le serveur, et le widget interroge régulièrement son état. | TC06, TC12 |
| 7.6-02 | Pendant le suivi de la tâche serveur, le widget affiche « Server processing… », avec le temps écoulé et l'état renvoyé par le serveur. | TC06 |
| 7.6-03 | Le suivi de la tâche serveur respecte le rythme d'interrogation progressif et le délai maximum de 15 minutes fixés en 7.3. | TC10 |
| 7.6-04 | En cas de succès de la tâche serveur, la vérification finale est faite (voir 7.1, étape 9). | TC06 |
| 7.6-05 | En cas d'échec de la tâche serveur, la cause renvoyée par le serveur s'affiche en erreur. | TC13 |
| 7.6-06 | Si le délai de suivi est dépassé, l'avertissement « The server is still processing the update. The result is not confirmed yet. Check the module in the changeset before delivering it. » s'affiche. | TC10 |
| 7.6-07 | Si le délai de suivi est dépassé, un bouton « Check status » permet de reprendre le suivi et de refaire la vérification finale. | TC10 |
| 7.6-08 | Si le délai de suivi est dépassé, REBIND est réactivé. | TC10 |
| **7.7 Garanties de sécurité** | | |
| 7.7-01 | Fermer le widget n'arrête pas la tâche côté serveur. | TC10 |
| 7.7-02 | Relancer REBIND trop tôt est sans danger : • l'écriture est refusée si la structure a changé depuis sa lecture (contrôle If-Match / ETag) ; • le contrôle « déjà présent dans le module » arrête le traitement. | TC06, TC12, TC13 |
| **7.8 Fichiers téléchargés** | | |
| 7.8-01 | Les noms des fichiers téléchargés sont en anglais. Ils contiennent l'identifiant du module et l'heure (au format AAAAMMJJ-HHMMSS), pour ne pas écraser les fichiers d'une exécution précédente, par exemple : • MD_LqgJQlkMEfGga_ma136JyQ_structure_before_20260925-143210.xml • MD_LqgJQlkMEfGga_ma136JyQ_structure_after_20260925-143210.xml | TC05, TC06 |
| **8 Livrables** | | |
| 8-01 | Le code du widget est livré : main.xml, main.html, css/, js/, lib/, resources/, organisés comme décrit en 4 et 4.1. | TC14 |
| 8-02 | Un fichier README.md est livré, sur le modèle d'ELM_AdminManager : description, fonctions, technologies, structure du projet, déploiement. | TC14 |
| 8-03 | Des cas de test de recette destinés à ETM sont livrés dans ETM_Manual_Test/, sur le modèle d'ELM_AdminManager : un index, puis des Test Cases (objectif, exigences couvertes, préconditions, Test Scripts « # / Action / Résultat attendu »). | TC14 |
| 8-04 | Les cas de test ETM sont rédigés en français. | TC14 |
| 8-05 | Les exigences couvertes par les cas de test ETM renvoient aux numéros de section de ce document (par exemple 5.2.1). | TC14 |
| 8-06 | Aucun fichier .jazzignore n'est livré. | TC14 |
| 8-07 | Chaque fichier source porte le cartouche décrit en 3. | TC13 |
