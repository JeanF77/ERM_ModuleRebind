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
 * OSLC queries: discovery of the requirement query service of the project
 * area, then resolution of the artifact IDs (dcterms:identifier) into the
 * URIs of the base artifacts, in the change set.
 * Several query syntaxes are tried (as in the original script); the first
 * one that returns results is kept for the whole resolution.
 */

/* ------------------------------------------------------------------------------
   ---- Constants
   --------------------------------------------------------------------------- */

// ---- Query syntaxes, tried in this order. "batch" = several IDs per query.
const QUERY_SYNTAXES = [
   { batch: true, where: (ids) => "dcterms:identifier in [" + ids.join(",") + "]" },
   { batch: true, where: (ids) => "dcterms:identifier in [" + ids.map((id) => "\"" + id + "\"").join(",") + "]" },
   { batch: false, where: (ids) => "dcterms:identifier=" + ids[0] },
   { batch: false, where: (ids) => "dcterms:identifier=\"" + ids[0] + "\"" }
];

// ---- Module artifacts (BI_) and modules (MD_) are not base artifacts
const QUERY_NOT_BASE_ARTIFACT_PATTERN = /\/(BI_|MD_)/;

/* ------------------------------------------------------------------------------
   ---- Core functions
   --------------------------------------------------------------------------- */

/**
 * Finds the requirement query service in the OSLC services document of the project area.
 * @param {Object} ctx - REST context
 * @param {String} projectId - Project area UUID
 * @param {Document|null} servicesDoc - Services document already read (null = read it now)
 * @returns {Promise<String>} Query base URL
 * @throws {RebindError} If no requirement query service is found
 */
async function query_findQueryBase(ctx, projectId, servicesDoc) {
   if (QUERY_BASE_OVERRIDE) {
      return QUERY_BASE_OVERRIDE;
   }

   const doc = servicesDoc || (await rest_getXml(ctx, module_servicesUrl(ctx.server, projectId), true)).doc;
   const capabilities = [...doc.getElementsByTagNameNS(NS_OSLC, "QueryCapability")].map((capability) => ({
      base: utils_rdfResource(utils_childrenNS(capability, NS_OSLC, "queryBase")[0]),
      types: utils_childrenNS(capability, NS_OSLC, "resourceType").map(utils_rdfResource)
   })).filter((capability) => capability.base);

   console.table(capabilities.map((capability) => ({ queryBase: capability.base, resourceType: capability.types.join(" ") })));

   const selected =
      capabilities.find((capability) => capability.types.includes(OSLC_RM_REQUIREMENT) && !/reqif/i.test(capability.base)) ||
      capabilities.find((capability) => /\/rm\/views\?/.test(capability.base));

   if (!selected) {
      throw new RebindError("error.query.serviceNotFound", { projectId: projectId });
   }
   return selected.base;
}

/**
 * Builds the URL of a query on a list of IDs.
 * @param {Object} ctx - REST context
 * @param {String} queryBase - Query base URL
 * @param {Array<Number>} ids - IDs to look for
 * @param {Number} syntax - Index in QUERY_SYNTAXES
 * @returns {String} Query URL
 */
function query_buildUrl(ctx, queryBase, ids, syntax) {
   return queryBase + (queryBase.includes("?") ? "&" : "?") +
      "oslc.prefix=" + encodeURIComponent("dcterms=<" + NS_DCTERMS + ">") +
      "&oslc.select=dcterms:identifier&oslc.pageSize=" + QUERY_PAGE_SIZE +
      "&oslc.where=" + encodeURIComponent(QUERY_SYNTAXES[syntax].where(ids)) +
      (queryBase.includes("oslc_config.context=") ? "" : "&oslc_config.context=" + encodeURIComponent(ctx.configurationUri));
}

/**
 * Reads the results of a query and stores the URI of each base artifact found.
 * @param {Document} doc - Query result
 * @param {Array<Number>} ids - IDs of the query
 * @param {Map<Number, String>} uriById - Resolved URIs, completed by this function
 * @returns {Number} Number of results kept
 * @throws {RebindError} If an ID designates two different artifacts
 */
function query_readResults(doc, ids, uriById) {
   let count = 0;

   for (const identifier of doc.getElementsByTagNameNS(NS_DCTERMS, "identifier")) {
      const uri = utils_rdfAbout(identifier.parentElement);
      const id = Number(identifier.textContent.trim());

      if (!uri || !ids.includes(id) || QUERY_NOT_BASE_ARTIFACT_PATTERN.test(uri)) {
         continue;
      }
      const known = uriById.get(id);
      if (known && known !== uri) {
         throw new RebindError("error.query.ambiguousId", { id: id, uri1: known, uri2: uri });
      }
      uriById.set(id, uri);
      count++;
   }
   return count;
}

/**
 * Tells whether an error must stop the syntax probing (session, network, access)
 * instead of simply rejecting the syntax.
 * @param {Error} error - Error raised by a query
 * @returns {Boolean} true if the error is fatal
 */
function query_isFatalError(error) {
   return !(error instanceof RebindError) ||
      ["error.rest.authRequired", "error.rest.network", "error.rest.forbidden", "error.query.ambiguousId"].includes(error.key);
}

/**
 * Finds the first query syntax accepted by the server, on the first IDs.
 * @param {Object} ctx - REST context
 * @param {String} queryBase - Query base URL
 * @param {Array<Number>} ids - IDs to resolve
 * @param {Map<Number, String>} uriById - Resolved URIs, completed by this function
 * @returns {Promise<Number>} Index of the syntax in QUERY_SYNTAXES
 * @throws {RebindError} If no syntax returns results
 */
async function query_findSyntax(ctx, queryBase, ids, uriById) {
   for (let syntax = 0; syntax < QUERY_SYNTAXES.length; syntax++) {
      const probe = QUERY_SYNTAXES[syntax].batch ? ids.slice(0, 2) : ids.slice(0, 1);
      try {
         const result = await rest_getXml(ctx, query_buildUrl(ctx, queryBase, probe, syntax), true);
         if (query_readResults(result.doc, probe, uriById) > 0) {
            utils_console("Query syntax retained: " + QUERY_SYNTAXES[syntax].where(["<id>"]));
            return syntax;
         }
         utils_console("Query syntax " + (syntax + 1) + ": no result", CONSOLE_WARNING);
      } catch (error) {
         if (query_isFatalError(error)) {
            throw error;
         }
         utils_console("Query syntax " + (syntax + 1) + " refused: " + error.key, CONSOLE_WARNING);
      }
   }
   throw new RebindError("error.query.noSyntax");
}

/**
 * Resolves artifact IDs into the URIs of the base artifacts, in the change set.
 * @param {Object} ctx - REST context
 * @param {String} queryBase - Query base URL
 * @param {Array<Number>} ids - IDs to resolve
 * @param {Function} onProgress - Called with (done, total) after each query
 * @returns {Promise<Map<Number, String>>} URI by ID
 * @throws {RebindError} If an ID is not found in the change set
 */
async function query_resolveIds(ctx, queryBase, ids, onProgress) {
   const uriById = new Map();
   const syntax = await query_findSyntax(ctx, queryBase, ids, uriById);
   const batchSize = QUERY_SYNTAXES[syntax].batch ? QUERY_BATCH_SIZE : 1;

   for (let start = 0; start < ids.length; start += batchSize) {
      const batch = ids.slice(start, start + batchSize).filter((id) => !uriById.has(id));
      if (batch.length) {
         query_readResults((await rest_getXml(ctx, query_buildUrl(ctx, queryBase, batch, syntax), true)).doc, batch, uriById);
      }
      onProgress(Math.min(start + batchSize, ids.length), ids.length);
   }

   const missing = ids.filter((id) => !uriById.has(id));
   if (missing.length) {
      throw new RebindError("error.query.idsNotFound", { count: missing.length, ids: utils_formatIdList(missing) });
   }
   return uriById;
}
