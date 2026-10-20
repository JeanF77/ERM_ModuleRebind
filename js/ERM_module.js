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
 * Reading of the module in its change set: module title, link to its
 * structure, UUID and name of its project area.
 */

/* ------------------------------------------------------------------------------
   ---- Constants
   --------------------------------------------------------------------------- */

// ---- Project area UUID in the links of a resource
const MODULE_PROJECT_AREA_PATTERN = /\/process\/project-areas\/([^\/?#]+)/;
const MODULE_SERVICE_PROVIDER_PATTERN = /\/oslc_rm\/([^\/?#]+)\/services\.xml/;

/* ------------------------------------------------------------------------------
   ---- Core functions
   --------------------------------------------------------------------------- */

/**
 * Returns the URL of the OSLC services document of a project area.
 * @param {String} server - ERM server address
 * @param {String} projectId - Project area UUID
 * @returns {String} services.xml URL
 */
function module_servicesUrl(server, projectId) {
   return server + "/rm/oslc_rm/" + projectId + "/services.xml";
}

/**
 * Looks for the project area UUID in the links of the module
 * (process:projectArea, then oslc:serviceProvider).
 * @param {Document} doc - RDF document of the module
 * @returns {String|null} Project area UUID, or null if not found
 */
function module_findProjectId(doc) {
   const candidates = [
      { localName: "projectArea", pattern: MODULE_PROJECT_AREA_PATTERN },
      { localName: "serviceProvider", pattern: MODULE_SERVICE_PROVIDER_PATTERN }
   ];

   for (const candidate of candidates) {
      for (const element of utils_elementsByLocalName(doc, candidate.localName)) {
         const match = (utils_rdfResource(element) || "").match(candidate.pattern);
         if (match) {
            return decodeURIComponent(match[1]);
         }
      }
   }
   return null;
}

/**
 * Reads the module in its change set.
 * @param {Object} ctx - REST context (see rest_createContext)
 * @param {String} moduleUri - Module URI, without configuration parameter
 * @returns {Promise<Object>} { title, structureUri, projectId }
 * @throws {RebindError} If the module cannot be read, is not a module, or has no valid project area
 */
async function module_read(ctx, moduleUri) {
   const result = await rest_getXml(ctx, moduleUri, false);
   const doc = result.doc;

   const structureUri = utils_rdfResource(doc.getElementsByTagNameNS(NS_DNG_MODULE, "structure")[0]);
   if (!structureUri) {
      throw new RebindError("error.module.notModule", { url: moduleUri });
   }

   const projectId = module_findProjectId(doc);
   if (!projectId) {
      throw new RebindError("error.module.projectNotFound", { url: moduleUri });
   }
   if (!PROJECT_ID_PATTERN.test(projectId)) {
      throw new RebindError("error.module.projectIdInvalid", { value: projectId });
   }

   const titleElement = doc.getElementsByTagNameNS(NS_DCTERMS, "title")[0];

   utils_console("Module read: structure = " + structureUri + ", project area = " + projectId);

   return {
      title: titleElement ? titleElement.textContent.trim() : "",
      structureUri: structureUri,
      projectId: projectId
   };
}

/**
 * Reads the name of the project area in its OSLC services document.
 * The document is returned too: it is reused to discover the query service.
 * @param {Object} ctx - REST context
 * @param {String} projectId - Project area UUID
 * @returns {Promise<Object>} { name, servicesDoc }
 * @throws {RebindError} If the services document cannot be read or has no title
 */
async function module_readProjectName(ctx, projectId) {
   const result = await rest_getXml(ctx, module_servicesUrl(ctx.server, projectId), true);
   const doc = result.doc;
   const provider = doc.getElementsByTagNameNS(NS_OSLC, "ServiceProvider")[0];
   const titleElement = provider ? utils_childrenNS(provider, NS_DCTERMS, "title")[0] : doc.getElementsByTagNameNS(NS_DCTERMS, "title")[0];
   const name = titleElement ? titleElement.textContent.trim() : "";

   if (!name) {
      throw new RebindError("error.module.projectNameNotFound", { projectId: projectId });
   }

   return { name: name, servicesDoc: doc };
}
