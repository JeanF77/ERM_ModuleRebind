# ERM Module Rebind

ERM Module Rebind is a JavaScript/jQuery widget for IBM Engineering Requirements Management (ERM, DOORS Next) that rebinds a list of existing artifacts into the structure of a module, in a change set, from the Excel export of an ERM view.

It industrializes the console script `LiF-107267-binding-script.js`: the same processing, but driven from a form instead of editing code in the browser console, with local checks of the input file, a simulation mode on by default, a confirmation step and a timestamped report.

| | |
|---|---|
| Version | v2026a |
| Target application | ERM 7.0.3 and later |
| Browsers | Chrome, Edge |
| Specification | v2.3 (maintained outside this repository; its 178 requirements are listed in [ETM_Manual_Test/01_Exigences_et_couverture.md](ETM_Manual_Test/01_Exigences_et_couverture.md)) |

## Features

- **Module URI** — accepts `https://<server>:<port>/rm/resources/<id>?oslc_config.context=<change set URI>` (context encoded or not) and refuses any configuration that is not a change set of the same server. These checks are made while typing, without calling the server.
- **Project ID** — read-only, filled from the module; the project name is shown underneath.
- **Excel file** — XLSX export of an ERM view (first sheet, headers in row 1, columns `id`, `Artifact Type`, `isHeading`, `parentBinding`, `module`), fully checked as soon as it is selected. The `METADATA` block added by the ERM export is ignored wherever it is in the sheet, and reported by an INFO line.
- **Simulation (default)** — nothing is written; the module structure before and after the change is downloaded for comparison.
- **Real execution** — red "REBIND (LIVE)" button and "LIVE MODE" banner, confirmation window, backup of the current structure, structure update with the `If-Match` control, tracking of the server task (up to 15 minutes, then a *Check status* button), final verification. The switch goes back to simulation after every real execution.
- **Report** — timestamped INFO / WARNING / ERROR lines, count by artifact type and one line per artifact.
- **Contextual help** — a "?" button on each panel opens a help popover.

Attachment rules: an empty `parentBinding` adds the artifact at the end of the module; a parent absent from the file is an *anchor point* that must exist exactly once in the module (children added at the end of its chapter); a parent present in the file must appear before its children. The processing stops, without writing anything, if the target module is empty, if an ID is not found in the change set, or if an artifact of the file is already in the module.

## Tech stack

- [jQuery 3.7.1](https://jquery.com/) (MIT), bundled in `lib/`
- [SheetJS Community Edition 0.20.3](https://docs.sheetjs.com/) (Apache 2.0, see `lib/xlsx-0.20.3/LICENSE`), bundled in `lib/` to read the XLSX file
- [Bootstrap 5.3.3](https://getbootstrap.com/) + [Bootstrap Icons 1.13.1](https://icons.getbootstrap.com/) (MIT), **not bundled**: loaded from the shared library `../ELM_sharedLib/` of the hosting server
- Packaged as an [OpenSocial](https://opensocial.github.io/spec/2.5.1/Core-Gadget.xml.html) gadget (`main.xml`) for deployment inside an ERM dashboard

## Project structure

```
main.xml               OpenSocial gadget declaration (no UserPref)
main.html              Widget markup (texts filled from resources/messages_en.json)
css/ERM_view.css       Styles (base taken from ELM_AdminManager)
js/                    Application code, one responsibility per file
  ERM_config.js          Internal constants (version, Excel columns, query batch size, tracking delays)
  OSLC_NameSpace.js      RDF / OSLC namespaces
  ERM_utils.js           Generic helpers (RebindError class, dates, download, RDF attributes, cookies)
  ERM_messages.js        Loading of messages_en.json, getText(key, params), data-text-* attributes
  ERM_rest.js            REST requests (GET/PUT, ERM and OSLC headers, 403 variants, anti-CSRF, HTTP errors)
  ERM_report.js          Message zone and progress bar
  ERM_uri.js             Analysis of the Module URI
  ERM_module.js          Module reading (title, structure link, project area UUID and name)
  ERM_excel.js           XLSX reading with SheetJS and local checks (METADATA block included)
  ERM_query.js           OSLC query service discovery and ID resolution
  ERM_structure.js       Structure reading, server checks, construction of the new bindings
  ERM_rebind.js          Processing sequence (simulation, execution, tracking, verification)
  ERM_gui.js             Interface state and events
  main.js                Entry point
lib/                   jQuery 3.7.1 and SheetJS 0.20.3 with its LICENSE
resources/             attach_file.png (icon, 24 x 24 px) and messages_en.json (every displayed text)
ETM_Manual_Test/       Manual acceptance test cases for ETM (in French)
```

Only `ERM_gui.js` and `ERM_report.js` modify the page; the processing files return their results and write to the report through `ERM_report.js`.

## Texts

Every text displayed by the widget is in [resources/messages_en.json](resources/messages_en.json), identified by a hierarchical key (`panel.module.help`, `error.uri.notChangeset`…). Variable parts are written `{name}`. A missing key is displayed as the key itself, with a warning in the browser console. If the file cannot be loaded, the widget displays a single hard-coded message and stops.

## Deployment

1. Copy the widget folder next to `ELM_sharedLib/` on the ERM server, so that `../ELM_sharedLib/bootstrap/5.3.3/` and `../ELM_sharedLib/bootstrap-icons/1.13.1/` resolve from `main.html`.
2. Register `main.xml` as an OpenSocial gadget in ERM and add it to a dashboard. No preference is needed: the ERM server is deduced from the Module URI.

When the module is on another server than the one hosting the widget, the CORS policy of that server must allow credentials and expose the `ETag` and `Location` response headers, which the widget needs to update the structure and to track the server task. The anti-CSRF header `X-Jazz-CSRF-Prevent` is only sent when the module is on the server hosting the widget.

## Usage

1. In ERM, create a change set and open the module in it; copy the module URI with its configuration context.
2. Paste it in **Module URI**: Project ID and the project name are filled.
3. Select the **Excel file**: the report lists the artifacts to rebind, or the errors to correct.
4. Click **REBIND** with Simulation ON, and compare the downloaded `*_structure_before_*.xml` and `*_structure_after_*.xml` files.
5. Switch Simulation OFF, click **REBIND (LIVE)** and confirm. Check the module in the change set, then deliver it (or discard the change set).

## Tests

[ETM_Manual_Test/](ETM_Manual_Test/00_Index.md) holds 14 manual test cases, written in French, to be entered in IBM Engineering Test Management (ETM):

- TC01 to TC12 — functional tests: interface, Module URI, module reading, Excel checks, METADATA block, simulation, real execution, server checks, help, message zone, tracking timeout, and the REST exchanges observed in the browser developer tools;
- TC13 and TC14 — reviews of the source code, the deliverables and the deployment.

Each step quotes the requirements it verifies by a label `<section>-<rank>` (e.g. `5.2.1-03`). [01_Exigences_et_couverture.md](ETM_Manual_Test/01_Exigences_et_couverture.md) gives the text of every requirement and the test cases that cover it: all 178 requirements are covered.

**Status**: the widget has been tested against a simulated ERM server (end-to-end tests with jsdom, screenshots in Chromium). The acceptance on a real ERM 7.0.3 server, with these test cases, is still to be done. Points to watch first: the root of the structure for artifacts with an empty `parentBinding`, and the CORS exposure of `ETag` and `Location` when the module is on another server.

## Copyright

(C) Copyright 2026 by Safran Aircraft Engines — All rights reserved. Third-party libraries keep their own licenses (see above).
