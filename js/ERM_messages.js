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
 * Texts of the widget. Every text displayed to the user is stored in
 * resources/messages_en.json and identified by a hierarchical key
 * (e.g. "error.uri.notChangeset"). Variable parts are written {name}.
 */

/* ------------------------------------------------------------------------------
   ---- Global variables
   --------------------------------------------------------------------------- */

let g_messages = null;   // ---- Content of messages_en.json (key -> text)

/* ------------------------------------------------------------------------------
   ---- Core functions
   --------------------------------------------------------------------------- */

/**
 * Loads the texts of the widget from messages_en.json.
 * @returns {Promise<void>} Resolved when the texts are loaded, rejected if the file is missing or invalid
 */
function messages_load() {
   return new Promise((resolve, reject) => {
      $.ajax({ url: MESSAGES_FILE_URL, dataType: "json", cache: false })
         .done((data) => {
            if (!data || typeof data !== "object" || Array.isArray(data)) {
               reject(new Error("'" + MESSAGES_FILE_URL + "' does not contain a JSON object"));
               return;
            }
            g_messages = data;
            utils_console("Texts loaded: " + Object.keys(data).length + " keys");
            resolve();
         })
         .fail((jqXHR, textStatus) => {
            reject(new Error("Unable to load '" + MESSAGES_FILE_URL + "' (" + textStatus + ", HTTP " + jqXHR.status + ")"));
         });
   });
}

/**
 * Returns the text of a key, with its {placeholders} replaced.
 * An unknown key is returned as is (and reported in the console), so that a
 * missing text stays visible during the tests.
 * @param {String} key - Message key
 * @param {Object} [params] - Placeholder values, e.g. { count: 12 }
 * @returns {String} Text to display
 */
function getText(key, params) {
   const template = g_messages ? g_messages[key] : undefined;

   if (typeof template !== "string") {
      utils_console("Missing text key '" + key + "' in " + MESSAGES_FILE_URL, CONSOLE_WARNING);
      return key;
   }
   if (!params) {
      return template;
   }
   return template.replace(/\{(\w+)\}/g, (placeholder, name) =>
      (params[name] === undefined || params[name] === null) ? placeholder : String(params[name]));
}

/**
 * Fills the static texts of the page. Supported attributes:
 * data-text-key (element text), data-text-placeholder-key, data-text-title-key
 * and data-text-aria-label-key.
 * @param {Element|jQuery} root - Element whose descendants are filled
 * @returns {void}
 */
function messages_applyToDom(root) {
   const $root = $(root);

   $root.find("[data-text-key]").each(function () {
      $(this).text(getText($(this).attr("data-text-key")));
   });
   $root.find("[data-text-placeholder-key]").each(function () {
      $(this).attr("placeholder", getText($(this).attr("data-text-placeholder-key")));
   });
   $root.find("[data-text-title-key]").each(function () {
      $(this).attr("title", getText($(this).attr("data-text-title-key")));
   });
   $root.find("[data-text-aria-label-key]").each(function () {
      $(this).attr("aria-label", getText($(this).attr("data-text-aria-label-key")));
   });
}
