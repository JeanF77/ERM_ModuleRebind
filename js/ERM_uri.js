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
 * Analysis of the "Module URI" field. Only one form is accepted:
 *    https://<server>:<port>/rm/resources/<id>?oslc_config.context=<change set URI>
 * with the change set URI encoded or not. These checks are made without any
 * server call.
 */

/* ------------------------------------------------------------------------------
   ---- Constants
   --------------------------------------------------------------------------- */

// ---- Group 1 = server, group 2 = resource ID, group 3 = value of oslc_config.context
const URI_MODULE_PATTERN = /^(https:\/\/[^\/?#\s]+)\/rm\/resources\/([^\/?#&\s]+)\?oslc_config\.context=([^&#\s]+)$/;

// ---- Change set URI: group 1 = server
const URI_CHANGESET_PATTERN = /^(https:\/\/[^\/?#\s]+)\/rm\/cm\/changeset\/[^\/?#\s]+$/;

/* ------------------------------------------------------------------------------
   ---- Core functions
   --------------------------------------------------------------------------- */

/**
 * Returns the normalized origin (protocol, host, port) of an URL.
 * @param {String} url - URL
 * @returns {String|null} Origin such as https://host:port, or null if the URL is invalid
 */
function uri_origin(url) {
   try {
      return new URL(url).origin;
   } catch (error) {
      return null;
   }
}

/**
 * Decodes the value of oslc_config.context when it is URL-encoded.
 * @param {String} value - Raw parameter value
 * @returns {String|null} Decoded value, or null if the encoding is invalid
 */
function uri_decodeContext(value) {
   if (!/%[0-9A-Fa-f]{2}/.test(value)) {
      return value;
   }
   try {
      return decodeURIComponent(value);
   } catch (error) {
      return null;
   }
}

/**
 * Analyzes the content of the "Module URI" field.
 * @param {String} rawValue - Field content
 * @returns {Object} On success: { valid: true, moduleUri, moduleId, server, configurationUri }.
 *    On failure: { valid: false, errorKey } where errorKey is a message key,
 *    or null when the field is empty.
 */
function uri_parseModuleUri(rawValue) {
   const value = String(rawValue || "").trim();

   if (value === "") {
      return { valid: false, errorKey: null };
   }

   const match = value.match(URI_MODULE_PATTERN);
   if (!match) {
      return { valid: false, errorKey: "error.uri.invalidForm" };
   }

   const server = uri_origin(match[1]);
   const configurationUri = uri_decodeContext(match[3]);

   if (!server || !configurationUri || !uri_origin(configurationUri)) {
      return { valid: false, errorKey: "error.uri.invalidForm" };
   }

   // ---- The configuration context must be a change set (not a stream, a baseline or a global configuration)
   if (!URI_CHANGESET_PATTERN.test(configurationUri)) {
      return { valid: false, errorKey: "error.uri.notChangeset" };
   }

   // ---- ... on the same server as the module
   if (uri_origin(configurationUri) !== server) {
      return { valid: false, errorKey: "error.uri.changesetOtherServer" };
   }

   return {
      valid: true,
      moduleUri: server + "/rm/resources/" + match[2],
      moduleId: match[2],
      server: server,
      configurationUri: configurationUri
   };
}
