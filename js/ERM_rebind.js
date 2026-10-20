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
*/
/*
 * Sequence of the rebind processing (section 7.1 of the specification):
 * query service discovery, ID resolution, structure reading, server checks,
 * construction of the new bindings, then simulation or writing, server task
 * tracking and final verification.
 *
 * A "session" gathers what the GUI knows when REBIND is clicked:
 *    { ctx, uri, module, excel }
 *    ctx    : REST context (rest_createContext)
 *    uri    : result of uri_parseModuleUri
 *    module : { title, structureUri, projectId, projectName, servicesDoc }
 *    excel  : data of the Excel file (excel_buildData)
 */

/* ------------------------------------------------------------------------------
   ---- Constants
   --------------------------------------------------------------------------- */

// ---- Result of a processing
const REBIND_SIMULATED = "simulated";   // ---- Simulation completed, nothing written
const REBIND_DONE = "done";             // ---- Structure written and verified
const REBIND_FAILED = "failed";         // ---- Processing stopped on an error
const REBIND_TIMEOUT = "timeout";       // ---- Server still processing after TRACKER_TIMEOUT_MS

// ---- Result of the server task tracking
const TRACKING_PASSED = "passed";
const TRACKING_FAILED = "failed";
const TRACKING_TIMEOUT = "timeout";

/* ------------------------------------------------------------------------------
   ---- Global variables
   --------------------------------------------------------------------------- */

// ---- Server task still running after the tracking timeout ("Check status" button)
let g_pendingTracking = null;   // ---- { session, trackerUrl, ids, uriById }

/* ------------------------------------------------------------------------------
   ---- Core functions
   --------------------------------------------------------------------------- */

/**
 * Returns the name of a downloaded structure file.
 * @param {Object} session - Processing session
 * @param {String} kind - "before" or "after"
 * @param {String} stamp - Timestamp (utils_fileTimestamp)
 * @returns {String} File name, e.g. MD_xxx_structure_before_20260925-143210.xml
 */
function rebind_fileName(session, kind, stamp) {
   return session.uri.moduleId + "_structure_" + kind + "_" + stamp + ".xml";
}

/**
 * Tells whether there is a server task left to check ("Check status" button).
 * @returns {Boolean} true if a server task is pending
 */
function rebind_hasPendingTracking() {
   return g_pendingTracking !== null;
}

/**
 * Runs the rebind processing.
 * @param {Object} session - Processing session (see the header of this file)
 * @param {Boolean} simulation - true = simulation (nothing is written)
 * @returns {Promise<String>} REBIND_SIMULATED, REBIND_DONE, REBIND_FAILED or REBIND_TIMEOUT
 */
async function rebind_run(session, simulation) {
   const ctx = session.ctx;
   const excel = session.excel;
   const artifactIds = excel.rows.map((row) => row.id);

   g_pendingTracking = null;
   report_add(REPORT_INFO, simulation ? "report.run.startSimulation" : "report.run.startLive",
      { module: session.module.title || session.uri.moduleId, project: session.module.projectName || session.module.projectId });
   report_addFileSummary(excel, true);

   try {
      // ---- 1. OSLC query service
      const queryBase = await query_findQueryBase(ctx, session.module.projectId, session.module.servicesDoc);
      report_add(REPORT_INFO, "report.query.service", { url: queryBase });

      // ---- 2. ID -> URI of the base artifacts (anchor points first)
      const idsToResolve = excel.anchors.concat(artifactIds);
      report_progressDeterminate("progress.resolve", 0, idsToResolve.length);
      const uriById = await query_resolveIds(ctx, queryBase, idsToResolve, (done, total) => report_progressDeterminate("progress.resolve", done, total));
      report_add(REPORT_INFO, "report.query.resolved", { count: idsToResolve.length });

      // ---- 3. Structure of the module and server checks
      report_progressIndeterminate("progress.structure");
      const structure = await structure_read(ctx, session.module.structureUri);
      const bindings = structure_bindingsByArtifact(structure.doc);
      report_add(REPORT_INFO, "report.structure.read", { count: bindings.size });

      const anchorBindings = structure_checkServer(bindings, excel, uriById);
      const stamp = utils_fileTimestamp(new Date());

      // ---- 4. New bindings
      let built;
      try {
         built = structure_build(structure.doc, session.module.structureUri, bindings, anchorBindings, excel, uriById);
      } catch (error) {
         if (error.saveStructure) {
            const fileName = rebind_fileName(session, "before", stamp);
            utils_downloadText(fileName, structure.xml);
            report_add(REPORT_INFO, "report.structure.savedForAnalysis", { file: fileName });
         }
         throw error;
      }
      built.placements.forEach((placement) => report_add(REPORT_INFO,
         placement.anchor === null ? "report.structure.placementRoot" : "report.structure.placementAnchor",
         { anchor: placement.anchor, count: placement.count }, true));
      report_add(REPORT_INFO, "report.structure.built", { count: built.created });

      // ---- 5a. Simulation: nothing is written
      if (simulation) {
         const before = rebind_fileName(session, "before", stamp);
         const after = rebind_fileName(session, "after", stamp);
         utils_downloadText(before, structure.xml);
         utils_downloadText(after, built.xml);
         report_add(REPORT_INFO, "report.simulation.done", { before: before, after: after });
         return REBIND_SIMULATED;
      }

      // ---- 5b. Real execution: backup, then writing with the If-Match control
      const backup = rebind_fileName(session, "before", stamp);
      utils_downloadText(backup, structure.xml);
      report_add(REPORT_INFO, "report.live.backup", { file: backup });

      report_progressIndeterminate("progress.writing");
      const put = await rest_putXml(ctx, session.module.structureUri, built.xml, structure.etag);
      report_add(REPORT_INFO, "report.live.accepted", { status: put.response.status });

      // ---- 6. Server task tracking (HTTP 202 Accepted)
      const trackerUrl = put.response.headers.get("Location");
      if (put.response.status === 202 && trackerUrl) {
         const outcome = await rebind_trackTask(ctx, trackerUrl);
         if (outcome === TRACKING_TIMEOUT) {
            g_pendingTracking = { session: session, trackerUrl: trackerUrl, ids: artifactIds, uriById: uriById };
            report_add(REPORT_WARNING, "report.tracker.timeout");
            report_showCheckStatus(true);
            return REBIND_TIMEOUT;
         }
         if (outcome === TRACKING_FAILED) {
            return REBIND_FAILED;
         }
      } else if (put.response.status === 202) {
         report_add(REPORT_WARNING, "report.tracker.noLocation");
      }

      // ---- 7. Final verification
      await rebind_verify(ctx, session.module.structureUri, artifactIds, uriById);
      return REBIND_DONE;
   } catch (error) {
      report_addError(error);
      return REBIND_FAILED;
   } finally {
      report_progressHide();
   }
}

/**
 * Follows the server task until it ends or TRACKER_TIMEOUT_MS is reached.
 * The polling interval grows from TRACKER_POLL_INITIAL_MS to TRACKER_POLL_MAX_MS.
 * @param {Object} ctx - REST context
 * @param {String} trackerUrl - URL of the task (Location header of the PUT response)
 * @returns {Promise<String>} TRACKING_PASSED, TRACKING_FAILED or TRACKING_TIMEOUT
 * @throws {RebindError} If the task cannot be read
 */
async function rebind_trackTask(ctx, trackerUrl) {
   const start = Date.now();
   let interval = TRACKER_POLL_INITIAL_MS;
   let stateName = getText("progress.stateWaiting");

   /**
    * Refreshes the label of the progress bar (elapsed time and task state).
    * @returns {void}
    */
   function refreshLabel() {
      report_progressIndeterminate("progress.server", { elapsed: utils_formatDuration(Date.now() - start), state: stateName });
   }

   report_add(REPORT_INFO, "report.tracker.started");
   refreshLabel();
   const timer = setInterval(refreshLabel, ELAPSED_TIME_REFRESH_MS);

   try {
      while (Date.now() - start < TRACKER_TIMEOUT_MS) {
         await utils_sleep(Math.min(interval, Math.max(0, TRACKER_TIMEOUT_MS - (Date.now() - start))));

         const task = await rest_getXml(ctx, trackerUrl, false);
         const state = utils_rdfResource(task.doc.getElementsByTagNameNS(NS_OSLC_AUTO, "state")[0]) || "";
         const verdict = utils_rdfResource(task.doc.getElementsByTagNameNS(NS_OSLC_AUTO, "verdict")[0]) || "";

         if (state) {
            stateName = state.split("#").pop();
         }
         if (state && !state.endsWith(OSLC_AUTO_STATE_IN_PROGRESS) && !verdict.endsWith(OSLC_AUTO_VERDICT_UNAVAILABLE)) {
            const params = { state: stateName, verdict: verdict.split("#").pop() };
            if (verdict.endsWith(OSLC_AUTO_VERDICT_PASSED)) {
               report_add(REPORT_INFO, "report.tracker.passed", params);
               return TRACKING_PASSED;
            }
            utils_console("Server task failed:\n" + task.text, CONSOLE_WARNING);
            report_add(REPORT_ERROR, "report.tracker.failed", params);
            return TRACKING_FAILED;
         }
         interval = Math.min(interval * TRACKER_POLL_GROWTH, TRACKER_POLL_MAX_MS);
      }
      return TRACKING_TIMEOUT;
   } finally {
      clearInterval(timer);
   }
}

/**
 * Final verification: counts the artifacts of the file present in the module.
 * @param {Object} ctx - REST context
 * @param {String} structureUri - Structure URI
 * @param {Array<Number>} ids - IDs of the file
 * @param {Map<Number, String>} uriById - Artifact URI by ID
 * @returns {Promise<void>}
 * @throws {RebindError} If the structure cannot be read
 */
async function rebind_verify(ctx, structureUri, ids, uriById) {
   report_progressIndeterminate("progress.verify");
   const result = await rest_getXml(ctx, structureUri, false);
   const present = structure_countPresent(result.doc, ids, uriById);

   report_add(present === ids.length ? REPORT_INFO : REPORT_WARNING, "report.verify.result", { present: present, total: ids.length });
}

/**
 * Resumes the tracking of a server task after a timeout ("Check status" button),
 * then makes the final verification.
 * @returns {Promise<String>} REBIND_DONE, REBIND_FAILED or REBIND_TIMEOUT
 */
async function rebind_checkStatus() {
   const pending = g_pendingTracking;

   if (!pending) {
      return REBIND_FAILED;
   }
   report_showCheckStatus(false);
   report_add(REPORT_INFO, "report.tracker.resume");

   try {
      const outcome = await rebind_trackTask(pending.session.ctx, pending.trackerUrl);
      if (outcome === TRACKING_TIMEOUT) {
         report_add(REPORT_WARNING, "report.tracker.timeout");
         report_showCheckStatus(true);
         return REBIND_TIMEOUT;
      }
      g_pendingTracking = null;
      if (outcome === TRACKING_FAILED) {
         return REBIND_FAILED;
      }
      await rebind_verify(pending.session.ctx, pending.session.module.structureUri, pending.ids, pending.uriById);
      return REBIND_DONE;
   } catch (error) {
      report_addError(error);
      report_showCheckStatus(true);
      return REBIND_FAILED;
   } finally {
      report_progressHide();
   }
}
