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
 * Message zone (panel 04 / Report) and progress bar (panel 03 / Rebind).
 * Each report line has a timestamp and a level (INFO, WARNING, ERROR).
 * The processing files write in the message zone only through this file.
 */

/* ------------------------------------------------------------------------------
   ---- Constants
   --------------------------------------------------------------------------- */

// ---- GUI identifiers
const REPORT_ID_MESSAGES = "rpt_messages";
const REPORT_ID_CHECK_STATUS = "rpt_checkStatus";
const REPORT_ID_PROGRESS = "rbd_progress";
const REPORT_ID_PROGRESS_BAR = "rbd_progressBar";
const REPORT_ID_PROGRESS_LABEL = "rbd_progressLabel";

// ---- Report levels
const REPORT_INFO = "info";
const REPORT_WARNING = "warning";
const REPORT_ERROR = "error";

/* ------------------------------------------------------------------------------
   ---- Core functions
   --------------------------------------------------------------------------- */

/**
 * Empties the message zone.
 * @returns {void}
 */
function report_clear() {
   $("#" + REPORT_ID_MESSAGES).empty();
   report_showCheckStatus(false);
}

/**
 * Adds a line to the message zone.
 * @param {String} level - REPORT_INFO, REPORT_WARNING or REPORT_ERROR
 * @param {String} key - Message key in messages_en.json
 * @param {Object} [params] - Placeholder values
 * @param {Boolean} [indent] - true = detail line (indented)
 * @returns {void}
 */
function report_add(level, key, params, indent) {
   report_addText(level, getText(key, params), indent);
}

/**
 * Adds a line whose text is already built.
 * @param {String} level - REPORT_INFO, REPORT_WARNING or REPORT_ERROR
 * @param {String} text - Text of the line
 * @param {Boolean} [indent] - true = detail line (indented)
 * @returns {void}
 */
function report_addText(level, text, indent) {
   const zone = $("#" + REPORT_ID_MESSAGES);
   const line = $("<div>", { class: "rpt-line rpt-" + level + (indent ? " rpt-detail" : "") });

   $("<span>", { class: "rpt-time", text: utils_formatTime(new Date()) }).appendTo(line);
   $("<span>", { class: "rpt-level", text: getText("report.level." + level) }).appendTo(line);
   $("<span>", { class: "rpt-text", text: text }).appendTo(line);

   line.appendTo(zone);
   zone.scrollTop(zone.prop("scrollHeight"));
}

/**
 * Adds an error to the message zone, with the server response excerpt if any.
 * @param {Error} error - RebindError, or unexpected error
 * @returns {void}
 */
function report_addError(error) {
   if (error instanceof RebindError) {
      report_add(REPORT_ERROR, error.key, error.params);
      if (error.detail) {
         report_add(REPORT_ERROR, "report.serverResponse", { detail: error.detail }, true);
      }
   } else {
      utils_console("Unexpected error: " + (error && error.stack ? error.stack : error), CONSOLE_ERROR);
      report_add(REPORT_ERROR, "error.unexpected", { message: error && error.message ? error.message : String(error) });
   }
}

/**
 * Adds the errors of the Excel file, limited to EXCEL_MAX_ERRORS_DISPLAYED lines.
 * @param {Array<Object>} errors - Errors [{ key, params }]
 * @returns {void}
 */
function report_addExcelErrors(errors) {
   report_add(REPORT_ERROR, "report.excel.invalid", { count: errors.length });
   errors.slice(0, EXCEL_MAX_ERRORS_DISPLAYED).forEach((error) => report_add(REPORT_ERROR, error.key, error.params, true));
   if (errors.length > EXCEL_MAX_ERRORS_DISPLAYED) {
      report_add(REPORT_ERROR, "report.excel.moreErrors", { count: errors.length - EXCEL_MAX_ERRORS_DISPLAYED }, true);
   }
}

/**
 * Adds the summary of a valid Excel file: number of artifacts, ignored METADATA
 * rows, anchor points, root artifacts, number of artifacts by type and, optionally, one line per artifact.
 * @param {Object} data - Data of the Excel file (see excel_buildData)
 * @param {Boolean} withDetail - true = one line per artifact, with its type
 * @returns {void}
 */
function report_addFileSummary(data, withDetail) {
   report_add(REPORT_INFO, "report.file.summary", { file: data.fileName, count: data.rows.length });
   if (data.metadataLines.length) {
      report_add(REPORT_INFO, "report.file.metadata", {
         count: data.metadataLines.length,
         first: data.metadataLines[0],
         last: data.metadataLines[data.metadataLines.length - 1]
      }, true);
   }
   if (data.anchors.length) {
      report_add(REPORT_INFO, "report.file.anchors", { count: data.anchors.length, ids: utils_formatIdList(data.anchors) }, true);
   }
   if (data.rootCount) {
      report_add(REPORT_INFO, "report.file.root", { count: data.rootCount }, true);
   }
   data.typeCounts.forEach((count, type) =>
      report_add(REPORT_INFO, "report.file.type", { type: type || getText("report.file.noType"), count: count }, true));

   if (withDetail) {
      data.rows.forEach((row) => report_add(REPORT_INFO, row.isHeading ? "report.file.artifactHeading" : "report.file.artifact", {
         id: row.id,
         type: row.type || getText("report.file.noType"),
         parent: row.parent === null ? getText("report.file.moduleRoot") : row.parent
      }, true));
   }
}

/**
 * Shows the progress bar with a known progress (e.g. ID resolution).
 * @param {String} labelKey - Message key of the label, with {done} and {total}
 * @param {Number} done - Items processed
 * @param {Number} total - Total number of items
 * @returns {void}
 */
function report_progressDeterminate(labelKey, done, total) {
   const percent = total ? Math.round((done * 100) / total) : 0;

   $("#" + REPORT_ID_PROGRESS).removeClass("d-none").attr("aria-valuenow", percent);
   $("#" + REPORT_ID_PROGRESS_BAR)
      .removeClass("progress-bar-striped progress-bar-animated")
      .css("width", percent + "%");
   $("#" + REPORT_ID_PROGRESS_LABEL).text(getText(labelKey, { done: done, total: total, percent: percent }));
}

/**
 * Shows an animated progress bar, without percentage (e.g. server processing).
 * @param {String} labelKey - Message key of the label
 * @param {Object} [params] - Placeholder values of the label
 * @returns {void}
 */
function report_progressIndeterminate(labelKey, params) {
   $("#" + REPORT_ID_PROGRESS).removeClass("d-none").removeAttr("aria-valuenow");
   $("#" + REPORT_ID_PROGRESS_BAR)
      .addClass("progress-bar-striped progress-bar-animated")
      .css("width", "100%");
   $("#" + REPORT_ID_PROGRESS_LABEL).text(getText(labelKey, params));
}

/**
 * Hides the progress bar.
 * @returns {void}
 */
function report_progressHide() {
   $("#" + REPORT_ID_PROGRESS).addClass("d-none");
   $("#" + REPORT_ID_PROGRESS_LABEL).text("");
}

/**
 * Shows or hides the "Check status" button (server tracking timeout).
 * @param {Boolean} visible - true to show the button
 * @returns {void}
 */
function report_showCheckStatus(visible) {
   $("#" + REPORT_ID_CHECK_STATUS).toggleClass("d-none", !visible);
}
