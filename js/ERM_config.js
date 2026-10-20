/*******************************************************************************/
/*                    (C) Copyright 2026 by Safran Aircraft Engines            */
/*                             All rights reserved                             */
/*******************************************************************************/
/*
+-------------------------------------------------------------------------------+
| Revision |    Date    |     Author     |                Issue                 |
+-------------------------------------------------------------------------------+
|     1    | 26/09/2026 |    Dr Jazz     | Initial version (v2026a)             |
+-------------------------------------------------------------------------------+
|     2    | 26/09/2026 |    Dr Jazz     | METADATA block of the ERM export     |
+-------------------------------------------------------------------------------+
*/
/*
 * Widget configuration: version, Excel prerequisites, query settings and
 * server task tracking settings.
 * These values are internal constants: they are not editable by the user.
 * User-facing texts are NOT defined here, see resources/messages_en.json.
 */

/* ------------------------------------------------------------------------------
   ---- Widget
   --------------------------------------------------------------------------- */

const WIDGET_VERSION = "v2026a";

// ---- File holding every text displayed by the widget (relative to main.html)
const MESSAGES_FILE_URL = "resources/messages_en.json";

// ---- Delay (ms) between the last keystroke in "Module URI" and its analysis
const URI_INPUT_DELAY_MS = 600;

/* ------------------------------------------------------------------------------
   ---- Excel file prerequisites
   --------------------------------------------------------------------------- */

// ---- Mandatory column headers (case sensitive, compared after trimming)
const EXCEL_COLUMN_ID = "id";
const EXCEL_COLUMN_ARTIFACT_TYPE = "Artifact Type";
const EXCEL_COLUMN_IS_HEADING = "isHeading";
const EXCEL_COLUMN_PARENT = "parentBinding";
const EXCEL_COLUMN_MODULE = "module";

const EXCEL_REQUIRED_COLUMNS = Object.freeze([
   EXCEL_COLUMN_ID,
   EXCEL_COLUMN_ARTIFACT_TYPE,
   EXCEL_COLUMN_IS_HEADING,
   EXCEL_COLUMN_PARENT,
   EXCEL_COLUMN_MODULE
]);

// ---- METADATA block added by the Excel export of an ERM view, ignored by the checks:
// ---- a row "METADATA" followed by rows "Name=Value", each time in column A only
const EXCEL_METADATA_MARKER = "METADATA";
const EXCEL_METADATA_ENTRY = /^[^=]+=/;

// ---- Only this file extension is accepted
const EXCEL_FILE_EXTENSION = ".xlsx";

// ---- Maximum number of Excel errors listed in the report (the others are counted)
const EXCEL_MAX_ERRORS_DISPLAYED = 20;

/* ------------------------------------------------------------------------------
   ---- Server
   --------------------------------------------------------------------------- */

// ---- Allowed characters of a project area UUID
const PROJECT_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

// ---- OSLC query service ("QUERY_BASE" of the original script): null = automatic discovery
const QUERY_BASE_OVERRIDE = null;

// ---- Number of IDs per OSLC query ("TAILLE_LOT_REQUETE" of the original script)
const QUERY_BATCH_SIZE = 40;

// ---- Maximum number of results per OSLC query page
const QUERY_PAGE_SIZE = 500;

// ---- Maximum number of IDs listed in an error message (the others are counted)
const MAX_IDS_IN_MESSAGE = 30;

// ---- Length of the server response excerpt shown with an error
const SERVER_RESPONSE_EXCERPT_LENGTH = 400;

/* ------------------------------------------------------------------------------
   ---- Server task tracking (after the structure update)
   --------------------------------------------------------------------------- */

const TRACKER_POLL_INITIAL_MS = 2000;       // ---- First polling interval
const TRACKER_POLL_MAX_MS = 10000;          // ---- Longest polling interval
const TRACKER_POLL_GROWTH = 1.5;            // ---- Interval growth factor between two polls
const TRACKER_TIMEOUT_MS = 15 * 60 * 1000;  // ---- Maximum tracking duration (15 minutes)

// ---- Refresh interval (ms) of the elapsed time displayed during server processing
const ELAPSED_TIME_REFRESH_MS = 1000;
