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
 * Entry point of the widget: loads the texts, then initializes the interface.
 */

/* ------------------------------------------------------------------------------
   ---- Constants
   --------------------------------------------------------------------------- */

// ---- The only text written in the code: shown when the texts themselves cannot be loaded
const MAIN_FATAL_MESSAGE = "Unable to load resources/messages_en.json. The widget cannot start.";

/* ------------------------------------------------------------------------------
   ---- Core functions
   --------------------------------------------------------------------------- */

/**
 * Stops the widget and shows the fatal message.
 * @returns {void}
 */
function main_showFatalError() {
   $("#" + GUI_ID_WIDGET).remove();
   $("#fatal").text(MAIN_FATAL_MESSAGE).removeClass("d-none");
}

/**
 * Widget entry point.
 */
$(function () {
   messages_load().then(gui_init, (error) => {
      utils_console(error.message, CONSOLE_ERROR);
      main_showFatalError();
   });
});
