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
 * Graphical interface: fields and their errors, simulation switch, REBIND
 * button, confirmation window and help popovers.
 * This file holds the state of the widget and calls the processing files.
 */

/* ------------------------------------------------------------------------------
   ---- Constants
   --------------------------------------------------------------------------- */

// ---- GUI identifiers
const GUI_ID_WIDGET = "widget";
const GUI_ID_MODULE_URI = "mod_uri";
const GUI_ID_MODULE_URI_FEEDBACK = "mod_uriFeedback";
const GUI_ID_PROJECT_ID = "mod_projectId";
const GUI_ID_PROJECT_SPINNER = "mod_spinner";
const GUI_ID_PROJECT_NAME = "mod_projectName";
const GUI_ID_EXCEL_FILE = "xls_file";
const GUI_ID_EXCEL_STATUS = "xls_status";
const GUI_ID_SIMULATION = "rbd_simulation";
const GUI_ID_SIMULATION_STATE = "rbd_simulationState";
const GUI_ID_LIVE_BANNER = "rbd_liveBanner";
const GUI_ID_REBIND = "rbd_rebind";
const GUI_ID_CONFIRM_MODAL = "cfm_modal";
const GUI_ID_CONFIRM_MODULE = "cfm_module";
const GUI_ID_CONFIRM_PROJECT = "cfm_project";
const GUI_ID_CONFIRM_COUNT = "cfm_count";
const GUI_ID_CONFIRM_ANCHORS = "cfm_anchors";
const GUI_ID_CONFIRM_CHANGESET = "cfm_changeset";
const GUI_ID_CONFIRM_BUTTON = "cfm_confirm";
const GUI_ID_FOOTER = "ftr_text";

/* ------------------------------------------------------------------------------
   ---- Global variables
   --------------------------------------------------------------------------- */

// ---- State of the widget
const g_state = {
   uri: null,            // ---- Valid "Module URI" (uri_parseModuleUri result), or null
   uriKey: "",           // ---- Module + change set of the last URI analyzed (avoids reading it twice)
   ctx: null,            // ---- REST context of the module
   module: null,         // ---- { title, structureUri, projectId, projectName, servicesDoc }, or null
   moduleLoading: false, // ---- true while the module is being read
   moduleRequest: 0,     // ---- Number of the last module reading (older answers are ignored)
   excel: null,          // ---- Data of a valid Excel file (excel_buildData), or null
   excelRequest: 0,      // ---- Number of the last file reading (older answers are ignored)
   running: false        // ---- true during a simulation, an execution or a status check
};

let g_uriTimer = null;   // ---- Delay timer of the "Module URI" analysis

/* ------------------------------------------------------------------------------
   ---- Initialization
   --------------------------------------------------------------------------- */

/**
 * Initializes the interface once the texts are loaded.
 * @returns {void}
 */
function gui_init() {
   messages_applyToDom(document.body);
   document.title = getText("header.title");
   $("#" + GUI_ID_FOOTER).text(getText("footer.text", { version: WIDGET_VERSION }));

   gui_initHelp();

   $("#" + GUI_ID_MODULE_URI).on("input", gui_onModuleUriInput).on("change", gui_analyzeModuleUri);
   $("#" + GUI_ID_EXCEL_FILE).on("click", gui_onExcelClick).on("change", gui_onExcelChange);
   $("#" + GUI_ID_SIMULATION).on("change", function () {
      gui_setSimulation($(this).prop("checked"));
   });
   $("#" + GUI_ID_REBIND).on("click", gui_onRebindClick);
   $("#" + GUI_ID_CONFIRM_BUTTON).on("click", gui_onConfirm);
   $("#" + REPORT_ID_CHECK_STATUS).on("click", gui_onCheckStatus);

   gui_setSimulation(true);
   gui_updateProjectFields();
   $("#" + GUI_ID_EXCEL_STATUS).text(getText("field.excelFile.none"));
   gui_updateControls();

   $("#" + GUI_ID_WIDGET).removeClass("d-none");
   utils_console("ERM Module Rebind " + WIDGET_VERSION + " ready");
}

/**
 * Creates the help popovers of the panels (texts panel.<name>.title and panel.<name>.help).
 * A popover opens on click and closes when the user clicks elsewhere.
 * @returns {void}
 */
function gui_initHelp() {
   $("[data-help-key]").each(function () {
      const key = $(this).attr("data-help-key");
      new bootstrap.Popover(this, {
         title: getText(key + ".title"),
         content: getText(key + ".help"),
         trigger: "focus",
         placement: "left",
         container: "body",
         customClass: "elm-popover"
      });
   });
}

/* ------------------------------------------------------------------------------
   ---- 01 / Module
   --------------------------------------------------------------------------- */

/**
 * Delays the analysis of "Module URI" while the user is typing.
 * @returns {void}
 */
function gui_onModuleUriInput() {
   clearTimeout(g_uriTimer);
   g_uriTimer = setTimeout(gui_analyzeModuleUri, URI_INPUT_DELAY_MS);
}

/**
 * Analyzes "Module URI": shows the error under the field, and reads the module
 * when a new valid URI is entered.
 * @returns {void}
 */
function gui_analyzeModuleUri() {
   clearTimeout(g_uriTimer);

   const field = $("#" + GUI_ID_MODULE_URI);
   const parsed = uri_parseModuleUri(field.val());

   field.toggleClass("is-invalid", Boolean(parsed.errorKey));
   $("#" + GUI_ID_MODULE_URI_FEEDBACK).text(parsed.errorKey ? getText(parsed.errorKey) : "");

   if (!parsed.valid) {
      g_state.uri = null;
      g_state.uriKey = "";
      g_state.module = null;
      g_state.moduleLoading = false;
      g_state.moduleRequest++;
      gui_updateProjectFields();
      gui_updateControls();
      return;
   }

   const uriKey = parsed.moduleUri + "|" + parsed.configurationUri;
   if (uriKey === g_state.uriKey) {
      return;
   }
   g_state.uri = parsed;
   g_state.uriKey = uriKey;
   gui_loadModule();
}

/**
 * Reads the module, then the name of its project area, and fills "Project ID".
 * Errors go to the message zone; a missing project name is only a warning.
 * @returns {Promise<void>}
 */
async function gui_loadModule() {
   const request = ++g_state.moduleRequest;
   const uri = g_state.uri;

   g_state.ctx = rest_createContext(uri.server, uri.configurationUri);
   g_state.module = null;
   g_state.moduleLoading = true;
   gui_updateProjectFields();
   gui_updateControls();

   try {
      const module = await module_read(g_state.ctx, uri.moduleUri);
      if (request !== g_state.moduleRequest) {
         return;
      }

      let projectName = null;
      let servicesDoc = null;
      try {
         const project = await module_readProjectName(g_state.ctx, module.projectId);
         projectName = project.name;
         servicesDoc = project.servicesDoc;
      } catch (error) {
         if (request !== g_state.moduleRequest) {
            return;
         }
         report_add(REPORT_WARNING, "warning.projectNameUnavailable", { projectId: module.projectId });
         if (error instanceof RebindError) {
            report_add(REPORT_WARNING, error.key, error.params, true);
         }
      }
      if (request !== g_state.moduleRequest) {
         return;
      }

      g_state.module = Object.assign({}, module, { projectName: projectName, servicesDoc: servicesDoc });
      report_add(REPORT_INFO, "report.module.read", { module: module.title || uri.moduleId, projectId: module.projectId });
   } catch (error) {
      if (request === g_state.moduleRequest) {
         report_addError(error);
      }
   } finally {
      if (request === g_state.moduleRequest) {
         g_state.moduleLoading = false;
         gui_updateProjectFields();
         gui_updateControls();
      }
   }
}

/**
 * Refreshes "Project ID", its loading indicator and the project name.
 * @returns {void}
 */
function gui_updateProjectFields() {
   const module = g_state.module;
   let nameText = "";

   if (module) {
      nameText = module.projectName ?
         getText("field.projectId.name", { name: module.projectName }) :
         getText("field.projectId.nameUnavailable");
   }

   $("#" + GUI_ID_PROJECT_ID).val(module ? module.projectId : "");
   $("#" + GUI_ID_PROJECT_SPINNER).toggleClass("d-none", !g_state.moduleLoading);
   $("#" + GUI_ID_PROJECT_NAME).text(nameText);
}

/* ------------------------------------------------------------------------------
   ---- 02 / Excel file
   --------------------------------------------------------------------------- */

/**
 * Clears the file field before the file dialog opens, so that selecting the
 * same file again (e.g. after correcting it) is taken into account.
 * @returns {void}
 */
function gui_onExcelClick() {
   this.value = "";
}

/**
 * Reads and checks the selected Excel file. The message zone is emptied first.
 * @returns {Promise<void>}
 */
async function gui_onExcelChange() {
   const request = ++g_state.excelRequest;
   const file = this.files && this.files.length ? this.files[0] : null;
   const status = $("#" + GUI_ID_EXCEL_STATUS);

   report_clear();
   g_state.excel = null;
   gui_updateControls();

   if (!file) {
      status.text(getText("field.excelFile.none"));
      return;
   }
   status.text(getText("field.excelFile.reading"));

   try {
      const content = await excel_readFile(file);
      if (request !== g_state.excelRequest) {
         return;
      }
      const result = excel_analyze(file.name, content);

      if (result.valid) {
         g_state.excel = result.data;
         report_addFileSummary(result.data, false);
         report_add(REPORT_INFO, "report.excel.valid");
         status.text(getText("field.excelFile.valid", { file: file.name, count: result.data.rows.length }));
      } else {
         report_addExcelErrors(result.errors);
         status.text(getText("field.excelFile.invalid", { file: file.name }));
      }
   } catch (error) {
      if (request === g_state.excelRequest) {
         report_addError(error);
         status.text(getText("field.excelFile.invalid", { file: file.name }));
      }
   } finally {
      if (request === g_state.excelRequest) {
         gui_updateControls();
      }
   }
}

/* ------------------------------------------------------------------------------
   ---- 03 / Rebind
   --------------------------------------------------------------------------- */

/**
 * Sets the simulation switch and the matching display.
 * OFF (real execution): red "REBIND (LIVE)" button and "LIVE MODE" banner.
 * @param {Boolean} simulation - true = simulation ON
 * @returns {void}
 */
function gui_setSimulation(simulation) {
   $("#" + GUI_ID_SIMULATION).prop("checked", simulation);
   $("#" + GUI_ID_SIMULATION_STATE).text(getText(simulation ? "field.simulation.on" : "field.simulation.off"));
   $("#" + GUI_ID_LIVE_BANNER).toggleClass("d-none", simulation);
   $("#" + GUI_ID_REBIND)
      .toggleClass("btn-primary", simulation)
      .toggleClass("btn-danger", !simulation)
      .text(getText(simulation ? "button.rebind" : "button.rebindLive"));
}

/**
 * Tells whether the simulation switch is ON.
 * @returns {Boolean} true = simulation
 */
function gui_isSimulation() {
   return $("#" + GUI_ID_SIMULATION).prop("checked");
}

/**
 * Tells whether REBIND can be used: valid URI, Project ID filled, valid Excel file, nothing running.
 * @returns {Boolean} true if every condition is met
 */
function gui_isReady() {
   return Boolean(g_state.uri && g_state.module && PROJECT_ID_PATTERN.test(g_state.module.projectId) &&
      g_state.excel && !g_state.moduleLoading && !g_state.running);
}

/**
 * Enables or disables the controls according to the state of the widget.
 * Every input is locked during a simulation or an execution.
 * @returns {void}
 */
function gui_updateControls() {
   $("#" + GUI_ID_REBIND).prop("disabled", !gui_isReady());
   $("#" + GUI_ID_MODULE_URI).prop("disabled", g_state.running);
   $("#" + GUI_ID_EXCEL_FILE).prop("disabled", g_state.running);
   $("#" + GUI_ID_SIMULATION).prop("disabled", g_state.running);
   $("#" + REPORT_ID_CHECK_STATUS).prop("disabled", g_state.running);
}

/**
 * REBIND button: runs the simulation, or opens the confirmation window in real execution.
 * @returns {void}
 */
function gui_onRebindClick() {
   if (!gui_isReady()) {
      return;
   }
   if (gui_isSimulation()) {
      gui_startRun(true);
   } else {
      gui_openConfirmation();
   }
}

/**
 * Fills and opens the confirmation window (real execution).
 * @returns {void}
 */
function gui_openConfirmation() {
   const excel = g_state.excel;
   const targets = excel.anchors.map(String);

   if (excel.rootCount) {
      targets.push(getText("confirm.moduleRoot"));
   }

   $("#" + GUI_ID_CONFIRM_MODULE).text(g_state.module.title || g_state.uri.moduleId);
   $("#" + GUI_ID_CONFIRM_PROJECT).text(g_state.module.projectName || g_state.module.projectId);
   $("#" + GUI_ID_CONFIRM_COUNT).text(String(excel.rows.length));
   $("#" + GUI_ID_CONFIRM_ANCHORS).text(targets.join(", "));
   $("#" + GUI_ID_CONFIRM_CHANGESET).text(g_state.uri.configurationUri);

   bootstrap.Modal.getOrCreateInstance(document.getElementById(GUI_ID_CONFIRM_MODAL)).show();
}

/**
 * "Rebind" button of the confirmation window: starts the real execution.
 * ("Cancel" only closes the window: the switch stays OFF.)
 * @returns {void}
 */
function gui_onConfirm() {
   bootstrap.Modal.getOrCreateInstance(document.getElementById(GUI_ID_CONFIRM_MODAL)).hide();
   gui_startRun(false);
}

/**
 * Runs a simulation or a real execution. The message zone is emptied first.
 * After a real execution, whatever its result, the switch goes back to ON.
 * @param {Boolean} simulation - true = simulation
 * @returns {Promise<void>}
 */
async function gui_startRun(simulation) {
   const session = { ctx: g_state.ctx, uri: g_state.uri, module: g_state.module, excel: g_state.excel };

   g_state.running = true;
   gui_updateControls();
   report_clear();

   try {
      const outcome = await rebind_run(session, simulation);
      utils_console("Processing ended: " + outcome);
   } finally {
      g_state.running = false;
      if (!simulation) {
         gui_setSimulation(true);
      }
      gui_updateControls();
   }
}

/* ------------------------------------------------------------------------------
   ---- 04 / Report
   --------------------------------------------------------------------------- */

/**
 * "Check status" button: resumes the tracking of the server task after a timeout.
 * @returns {Promise<void>}
 */
async function gui_onCheckStatus() {
   if (g_state.running || !rebind_hasPendingTracking()) {
      return;
   }
   g_state.running = true;
   gui_updateControls();

   try {
      const outcome = await rebind_checkStatus();
      utils_console("Status check ended: " + outcome);
   } finally {
      g_state.running = false;
      gui_updateControls();
   }
}
