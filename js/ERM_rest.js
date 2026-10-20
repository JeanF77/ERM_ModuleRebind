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
 * REST requests to the ERM server: GET and PUT, ERM and OSLC headers,
 * header variants tried when the server answers 403, anti-CSRF header,
 * XML parsing of the responses and HTTP error handling.
 *
 * Every request uses a "REST context" created by rest_createContext(), which
 * holds the server, the change set and the OSLC header variant retained.
 */

/* ------------------------------------------------------------------------------
   ---- Constants
   --------------------------------------------------------------------------- */

// ---- Jazz answers HTTP 200 with this header when the session has expired (form authentication)
const REST_AUTH_HEADER = "X-com-ibm-team-repository-web-auth-msg";
const REST_AUTH_REQUIRED = "authrequired";

// ---- Number of OSLC header variants (see rest_oslcHeaders)
const REST_OSLC_VARIANT_COUNT = 3;

/* ------------------------------------------------------------------------------
   ---- Core functions
   --------------------------------------------------------------------------- */

/**
 * Creates the REST context of a module.
 * The anti-CSRF header is only sent when the module is on the server hosting
 * the widget: the readable JSESSIONID cookie is the one of that server.
 * @param {String} server - ERM server address (https://host:port)
 * @param {String} configurationUri - Change set URI
 * @returns {Object} REST context { server, configurationUri, csrfHeaders, oslcVariant }
 */
function rest_createContext(server, configurationUri) {
   const csrfHeaders = {};

   if (server === window.location.origin) {
      const sessionId = utils_getCookie("JSESSIONID");
      if (sessionId) {
         csrfHeaders["X-Jazz-CSRF-Prevent"] = sessionId;
      } else {
         utils_console("JSESSIONID cookie not readable: the anti-CSRF header is not sent", CONSOLE_WARNING);
      }
   }

   return { server: server, configurationUri: configurationUri, csrfHeaders: csrfHeaders, oslcVariant: 0 };
}

/**
 * Returns the headers of the module structure API.
 * @param {Object} ctx - REST context
 * @returns {Object} HTTP headers
 */
function rest_moduleHeaders(ctx) {
   return Object.assign({
      "DoorsRP-Request-Type": "public 2.0",
      "vvc.configuration": ctx.configurationUri,
      "X-Requested-With": "XMLHttpRequest"
   }, ctx.csrfHeaders);
}

/**
 * Returns one of the OSLC header variants (services.xml and queries).
 * The variants are tried in order when the server answers 403.
 * @param {Object} ctx - REST context
 * @param {Number} variant - Variant index (0 to REST_OSLC_VARIANT_COUNT - 1)
 * @returns {Object} HTTP headers
 */
function rest_oslcHeaders(ctx, variant) {
   const variants = [
      { "OSLC-Core-Version": "2.0", "Configuration-Context": ctx.configurationUri },
      { "OSLC-Core-Version": "2.0" },
      { "OSLC-Core-Version": "2.0", "Configuration-Context": ctx.configurationUri, "X-Requested-With": "XMLHttpRequest" }
   ];
   return Object.assign({}, variants[variant], ctx.csrfHeaders);
}

/**
 * Sends an HTTP request with the user's session and reads the response text.
 * @param {String} url - Request URL
 * @param {Object} options - fetch() options (method, headers, body)
 * @returns {Promise<Object>} { response, text }
 * @throws {RebindError} If the server cannot be reached
 */
async function rest_fetch(url, options) {
   let response;

   try {
      response = await fetch(url, Object.assign({ credentials: "include", cache: "no-store" }, options));
   } catch (error) {
      utils_console("Network error on " + (options.method || "GET") + " " + url + ": " + error.message, CONSOLE_ERROR);
      throw new RebindError("error.rest.network", { url: url });
   }

   return { response: response, text: await response.text() };
}

/**
 * Checks an HTTP response and raises the matching widget error.
 * @param {String} method - HTTP method
 * @param {String} url - Request URL
 * @param {Response} response - HTTP response
 * @param {String} text - Response text
 * @returns {void}
 * @throws {RebindError} If the session has expired or the status is not a success
 */
function rest_checkResponse(method, url, response, text) {
   const params = { method: method, url: url, status: response.status };

   if (response.headers.get(REST_AUTH_HEADER) === REST_AUTH_REQUIRED || response.status === 401) {
      throw new RebindError("error.rest.authRequired", params);
   }
   if (response.ok) {
      return;
   }

   utils_console(method + " " + url + " -> HTTP " + response.status + "\n" + text.slice(0, 1500), CONSOLE_ERROR);

   switch (response.status) {
      case 403:
         throw new RebindError("error.rest.forbidden", params, utils_excerpt(text));
      case 404:
         throw new RebindError("error.rest.notFound", params, utils_excerpt(text));
      case 412:
         throw new RebindError("error.rest.preconditionFailed", params, utils_excerpt(text));
      default:
         throw new RebindError("error.rest.http", params, utils_excerpt(text));
   }
}

/**
 * Reads an RDF/XML resource.
 * With OSLC headers, the header variants are tried in turn while the server answers 403;
 * the variant that works is kept in the context for the next requests.
 * @param {Object} ctx - REST context
 * @param {String} url - Resource URL
 * @param {Boolean} [useOslc] - true = OSLC headers, false (default) = module structure API headers
 * @returns {Promise<Object>} { response, text, doc }
 * @throws {RebindError} On network, HTTP or XML error
 */
async function rest_getXml(ctx, url, useOslc) {
   let result;

   for (;;) {
      const headers = useOslc ? rest_oslcHeaders(ctx, ctx.oslcVariant) : rest_moduleHeaders(ctx);

      result = await rest_fetch(url, { method: "GET", headers: Object.assign({ "Accept": "application/rdf+xml" }, headers) });

      if (useOslc && result.response.status === 403 && ctx.oslcVariant < REST_OSLC_VARIANT_COUNT - 1) {
         utils_console("HTTP 403 with OSLC header variant " + (ctx.oslcVariant + 1) + ", trying the next one. Server response:\n" +
            result.text.slice(0, 400), CONSOLE_WARNING);
         ctx.oslcVariant++;
         continue;
      }
      break;
   }

   rest_checkResponse("GET", url, result.response, result.text);

   const doc = utils_parseXml(result.text);
   if (!doc) {
      utils_console("Response is not XML for " + url + ":\n" + result.text.slice(0, 800), CONSOLE_ERROR);
      throw new RebindError("error.rest.notXml", { url: url }, utils_excerpt(result.text));
   }

   return { response: result.response, text: result.text, doc: doc };
}

/**
 * Writes an RDF/XML resource with the module structure API.
 * @param {Object} ctx - REST context
 * @param {String} url - Resource URL
 * @param {String} body - RDF/XML content
 * @param {String} etag - ETag read with the resource (If-Match control)
 * @returns {Promise<Object>} { response, text }
 * @throws {RebindError} On network or HTTP error
 */
async function rest_putXml(ctx, url, body, etag) {
   const headers = Object.assign({
      "Content-Type": "application/rdf+xml",
      "Accept": "application/rdf+xml",
      "If-Match": etag
   }, rest_moduleHeaders(ctx));

   const result = await rest_fetch(url, { method: "PUT", headers: headers, body: body });
   rest_checkResponse("PUT", url, result.response, result.text);

   return result;
}
