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
 * Generic helpers: widget error class, console messages, dates, file download,
 * XML/RDF reading and cookies. This file has no knowledge of the GUI.
 */

/* ------------------------------------------------------------------------------
   ---- Constants
   --------------------------------------------------------------------------- */

const CONSOLE_INFO = "--- INFO : ";
const CONSOLE_WARNING = "§§§ WARN : ";
const CONSOLE_ERROR = "### ERROR : ";

/* ------------------------------------------------------------------------------
   ---- Classes
   --------------------------------------------------------------------------- */

/**
 * Error raised by the widget. It carries a message key of messages_en.json
 * (and its parameters) instead of a text, so that the GUI displays it in the
 * user's language.
 */
class RebindError extends Error {
   /**
    * Creates a widget error.
    * @param {String} key - Message key in messages_en.json
    * @param {Object} [params] - Values of the {placeholders} of the message
    * @param {String} [detail] - Technical detail (e.g. server response excerpt), shown as is
    */
   constructor(key, params, detail) {
      super(key);
      this.name = "RebindError";
      this.key = key;
      this.params = params || {};
      this.detail = detail || null;
      this.saveStructure = false; // ---- true = the structure "before" must be downloaded for analysis
   }
}

/* ------------------------------------------------------------------------------
   ---- Core functions
   --------------------------------------------------------------------------- */

/**
 * Writes a message in the browser console (debugging only, not shown to the user).
 * @param {String} text - Message
 * @param {String} [type] - CONSOLE_INFO (default), CONSOLE_WARNING or CONSOLE_ERROR
 * @returns {void}
 */
function utils_console(text, type) {
   const prefix = type || CONSOLE_INFO;

   if (prefix === CONSOLE_ERROR) {
      console.error(prefix + text);
   } else if (prefix === CONSOLE_WARNING) {
      console.warn(prefix + text);
   } else {
      console.log(prefix + text);
   }
}

/**
 * Waits for a given duration.
 * @param {Number} ms - Duration in milliseconds
 * @returns {Promise<void>} Resolved when the duration has elapsed
 */
function utils_sleep(ms) {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Pads a number with leading zeros.
 * @param {Number} value - Number to pad
 * @param {Number} [length] - Expected length (default 2)
 * @returns {String} Padded number
 */
function utils_pad(value, length) {
   return String(value).padStart(length || 2, "0");
}

/**
 * Formats a time as HH:MM:SS (report timestamps).
 * @param {Date} date - Date to format
 * @returns {String} Formatted time
 */
function utils_formatTime(date) {
   return utils_pad(date.getHours()) + ":" + utils_pad(date.getMinutes()) + ":" + utils_pad(date.getSeconds());
}

/**
 * Formats a date as YYYYMMDD-HHMMSS (downloaded file names).
 * @param {Date} date - Date to format
 * @returns {String} Formatted date
 */
function utils_fileTimestamp(date) {
   return date.getFullYear() + utils_pad(date.getMonth() + 1) + utils_pad(date.getDate()) + "-" +
      utils_pad(date.getHours()) + utils_pad(date.getMinutes()) + utils_pad(date.getSeconds());
}

/**
 * Formats a duration as M:SS (elapsed time of the server processing).
 * @param {Number} ms - Duration in milliseconds
 * @returns {String} Formatted duration
 */
function utils_formatDuration(ms) {
   const totalSeconds = Math.floor(ms / 1000);
   return Math.floor(totalSeconds / 60) + ":" + utils_pad(totalSeconds % 60);
}

/**
 * Makes the browser download a text file.
 * @param {String} fileName - Name of the downloaded file
 * @param {String} text - File content
 * @param {String} [mimeType] - MIME type (default application/xml)
 * @returns {void}
 */
function utils_downloadText(fileName, text, mimeType) {
   const blob = new Blob([text], { type: mimeType || "application/xml" });
   const url = URL.createObjectURL(blob);
   const link = document.createElement("a");

   link.href = url;
   link.download = fileName;
   document.body.appendChild(link);
   link.click();
   link.remove();

   // ---- Release the object URL once the download has started
   setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Shortens a server response so that it can be shown in the report.
 * @param {String} text - Server response
 * @returns {String} Response excerpt
 */
function utils_excerpt(text) {
   const flat = String(text || "").replace(/\s+/g, " ").trim();
   return flat.length > SERVER_RESPONSE_EXCERPT_LENGTH ? flat.slice(0, SERVER_RESPONSE_EXCERPT_LENGTH) + "…" : flat;
}

/**
 * Formats a list of IDs for a message, limited to MAX_IDS_IN_MESSAGE values.
 * @param {Array<Number>} ids - IDs to list
 * @returns {String} Comma-separated list, followed by "…" when truncated
 */
function utils_formatIdList(ids) {
   const shown = ids.slice(0, MAX_IDS_IN_MESSAGE).join(", ");
   return ids.length > MAX_IDS_IN_MESSAGE ? shown + ", …" : shown;
}

/**
 * Parses an XML text.
 * @param {String} text - XML text
 * @returns {Document|null} XML document, or null if the text is not well-formed XML
 */
function utils_parseXml(text) {
   const doc = new DOMParser().parseFromString(text, "application/xml");
   return doc.getElementsByTagName("parsererror").length ? null : doc;
}

/**
 * Reads the rdf:resource attribute of an element.
 * @param {Element} element - RDF element (may be undefined)
 * @returns {String|null} Attribute value, or null
 */
function utils_rdfResource(element) {
   return element ? (element.getAttributeNS(NS_RDF, "resource") || element.getAttribute("rdf:resource")) : null;
}

/**
 * Reads the rdf:about attribute of an element.
 * @param {Element} element - RDF element (may be undefined)
 * @returns {String|null} Attribute value, or null
 */
function utils_rdfAbout(element) {
   return element ? (element.getAttributeNS(NS_RDF, "about") || element.getAttribute("rdf:about")) : null;
}

/**
 * Returns the direct children of an element that have a given namespace and local name.
 * @param {Element} element - Parent element
 * @param {String} namespace - Namespace URI of the children
 * @param {String} localName - Local name of the children
 * @returns {Array<Element>} Matching children
 */
function utils_childrenNS(element, namespace, localName) {
   return [...element.children].filter((child) => child.namespaceURI === namespace && child.localName === localName);
}

/**
 * Returns every element of a document with a given local name, whatever its namespace.
 * @param {Document} doc - XML document
 * @param {String} localName - Local name to look for
 * @returns {Array<Element>} Matching elements
 */
function utils_elementsByLocalName(doc, localName) {
   return [...doc.getElementsByTagNameNS("*", localName)];
}

/**
 * Reads a cookie of the current page.
 * @param {String} name - Cookie name
 * @returns {String|null} Cookie value, or null if the cookie is absent or not readable
 */
function utils_getCookie(name) {
   const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
   return match ? match[1] : null;
}
