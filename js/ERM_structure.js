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
 * Module structure: reading (with its ETag), server-side checks and
 * construction of the new bindings.
 *
 * Attachment rules (section 7.2 of the specification):
 *  - empty parentBinding        -> added at the end of the module (root of the structure);
 *  - parent absent from the file -> anchor point: it must exist exactly once in the module,
 *                                   the children are added at the end of its chapter;
 *  - parent present in the file  -> built under its parent.
 * The properties of the new bindings (type, module, component) are copied
 * from the first anchor point, or from any existing binding of the module.
 */

/* ------------------------------------------------------------------------------
   ---- Core functions
   --------------------------------------------------------------------------- */

/**
 * Reads the structure of the module.
 * @param {Object} ctx - REST context
 * @param {String} structureUri - Structure URI (read with the module)
 * @returns {Promise<Object>} { doc, etag, xml }
 * @throws {RebindError} If the structure cannot be read or has no ETag
 */
async function structure_read(ctx, structureUri) {
   const result = await rest_getXml(ctx, structureUri, false);
   const etag = result.response.headers.get("ETag");

   if (!etag) {
      throw new RebindError("error.structure.noEtag", { url: structureUri });
   }
   return { doc: result.doc, etag: etag, xml: result.text };
}

/**
 * Lists the bindings of the structure by bound artifact.
 * @param {Document} doc - Structure document
 * @returns {Map<String, Array<Element>>} Binding elements by artifact URI
 */
function structure_bindingsByArtifact(doc) {
   const bindings = new Map();

   for (const boundArtifact of doc.getElementsByTagNameNS(NS_DNG_MODULE, "boundArtifact")) {
      const uri = utils_rdfResource(boundArtifact);
      if (!bindings.has(uri)) {
         bindings.set(uri, []);
      }
      bindings.get(uri).push(boundArtifact.parentElement);
   }
   return bindings;
}

/**
 * Server-side checks before building the new bindings:
 * the module is not empty, no artifact of the file is already in the module,
 * every anchor point is present exactly once.
 * @param {Map<String, Array<Element>>} bindings - Bindings by artifact URI
 * @param {Object} excelData - Data of the Excel file (see excel_buildData)
 * @param {Map<Number, String>} uriById - Artifact URI by ID
 * @returns {Map<Number, Element>} Binding of each anchor point
 * @throws {RebindError} If a check fails
 */
function structure_checkServer(bindings, excelData, uriById) {
   if (bindings.size === 0) {
      throw new RebindError("error.structure.emptyModule");
   }

   const alreadyPresent = excelData.rows.map((row) => row.id).filter((id) => bindings.has(uriById.get(id)));
   if (alreadyPresent.length) {
      throw new RebindError("error.structure.alreadyPresent", { count: alreadyPresent.length, ids: utils_formatIdList(alreadyPresent) });
   }

   const anchorBindings = new Map();
   for (const anchor of excelData.anchors) {
      const found = bindings.get(uriById.get(anchor)) || [];
      if (found.length !== 1) {
         throw new RebindError("error.structure.anchorCount", { id: anchor, count: found.length });
      }
      anchorBindings.set(anchor, found[0]);
   }
   return anchorBindings;
}

/**
 * Finds the collection of the first-level bindings of the module (root of the structure).
 * @param {Document} doc - Structure document
 * @param {String} structureUri - Structure URI
 * @returns {Element|null} childBindings element of the root, or null if not found
 */
function structure_findRootCollection(doc, structureUri) {
   const candidates = [...doc.getElementsByTagNameNS(NS_DNG_MODULE, "childBindings")].filter((collection) =>
      utils_childrenNS(collection.parentElement, NS_DNG_MODULE, "boundArtifact").length === 0);

   if (candidates.length === 1) {
      return candidates[0];
   }
   return candidates.find((collection) => utils_rdfAbout(collection.parentElement) === structureUri) || null;
}

/**
 * Checks that a childBindings element is an rdf:Collection.
 * @param {Element} collection - childBindings element
 * @param {String} owner - Owner of the collection (ID of the anchor point, or "root"), for the message
 * @returns {Element} The collection
 * @throws {RebindError} If the format is unexpected (the structure "before" is then saved for analysis)
 */
function structure_checkCollection(collection, owner) {
   const parseType = collection.getAttributeNS(NS_RDF, "parseType") || collection.getAttribute("rdf:parseType");

   if (parseType !== "Collection") {
      const error = new RebindError("error.structure.unexpectedFormat", { owner: owner });
      error.saveStructure = true;
      throw error;
   }
   return collection;
}

/**
 * Builds the new bindings and inserts them in the structure document.
 * @param {Document} doc - Structure document (modified by this function)
 * @param {String} structureUri - Structure URI
 * @param {Map<String, Array<Element>>} bindings - Existing bindings by artifact URI
 * @param {Map<Number, Element>} anchorBindings - Binding of each anchor point
 * @param {Object} excelData - Data of the Excel file
 * @param {Map<Number, String>} uriById - Artifact URI by ID
 * @returns {Object} { xml, created, placements } - placements: [{ anchor (null = root), count }]
 * @throws {RebindError} If the structure has an unexpected format
 */
function structure_build(doc, structureUri, bindings, anchorBindings, excelData, uriById) {
   const prefixModule = doc.documentElement.lookupPrefix(NS_DNG_MODULE) || "dng_module";
   const prefixRdf = doc.documentElement.lookupPrefix(NS_RDF) || "rdf";

   /**
    * Creates an element of the module namespace.
    * @param {String} localName - Local name
    * @returns {Element} New element
    */
   function createModuleElement(localName) {
      return doc.createElementNS(NS_DNG_MODULE, prefixModule + ":" + localName);
   }

   /**
    * Creates an empty childBindings collection.
    * @returns {Element} New childBindings element
    */
   function createCollection() {
      const collection = createModuleElement("childBindings");
      collection.setAttributeNS(NS_RDF, prefixRdf + ":parseType", "Collection");
      return collection;
   }

   /**
    * Returns the childBindings collection of a binding, created if absent.
    * @param {Element} binding - Binding element
    * @param {Number} owner - ID of the anchor point, for the error message
    * @returns {Element} childBindings element
    */
   function collectionOf(binding, owner) {
      let collection = utils_childrenNS(binding, NS_DNG_MODULE, "childBindings")[0];
      if (!collection) {
         collection = createCollection();
         binding.appendChild(collection);
      }
      return structure_checkCollection(collection, owner);
   }

   // ---- Model binding: first anchor point, or any existing binding of the module
   const model = excelData.anchors.length ? anchorBindings.get(excelData.anchors[0]) : bindings.values().next().value[0];
   const copiedProperties = [...model.children].filter((child) =>
      (child.namespaceURI === NS_RDF && child.localName === "type") ||
      (child.namespaceURI === NS_DNG_MODULE && child.localName === "module") ||
      child.localName === "component");

   // ---- Children of each parent, in the order of the file (key null = root of the module)
   const children = new Map();
   for (const row of excelData.rows) {
      if (!children.has(row.parent)) {
         children.set(row.parent, []);
      }
      children.get(row.parent).push(row);
   }

   let created = 0;

   /**
    * Creates the binding of an artifact, with the bindings of its descendants.
    * @param {Object} row - Excel row of the artifact
    * @returns {Element} New binding element
    */
   function createBinding(row) {
      const binding = doc.createElementNS(model.namespaceURI, model.tagName);
      binding.setAttributeNS(NS_RDF, prefixRdf + ":about", structureUri + "#new" + (++created));
      copiedProperties.forEach((property) => binding.appendChild(property.cloneNode(true)));

      const boundArtifact = createModuleElement("boundArtifact");
      boundArtifact.setAttributeNS(NS_RDF, prefixRdf + ":resource", uriById.get(row.id));
      binding.appendChild(boundArtifact);

      const isHeading = createModuleElement("isHeading");
      isHeading.setAttributeNS(NS_RDF, prefixRdf + ":datatype", NS_XSD + "boolean");
      isHeading.textContent = row.isHeading ? "true" : "false";
      binding.appendChild(isHeading);

      const collection = createCollection();
      (children.get(row.id) || []).forEach((child) => collection.appendChild(createBinding(child)));
      binding.appendChild(collection);

      return binding;
   }

   const placements = [];

   // ---- Under each anchor point, at the end of its chapter
   for (const anchor of excelData.anchors) {
      const collection = collectionOf(anchorBindings.get(anchor), anchor);
      const rows = children.get(anchor) || [];
      rows.forEach((row) => collection.appendChild(createBinding(row)));
      placements.push({ anchor: anchor, count: rows.length });
   }

   // ---- At the end of the module (empty parentBinding)
   const rootRows = children.get(null) || [];
   if (rootRows.length) {
      const root = structure_findRootCollection(doc, structureUri);
      if (!root) {
         const error = new RebindError("error.structure.rootNotFound");
         error.saveStructure = true;
         throw error;
      }
      structure_checkCollection(root, "root");
      rootRows.forEach((row) => root.appendChild(createBinding(row)));
      placements.push({ anchor: null, count: rootRows.length });
   }

   if (created !== excelData.rows.length) {
      throw new RebindError("error.structure.inconsistent", { created: created, expected: excelData.rows.length });
   }

   return { xml: new XMLSerializer().serializeToString(doc), created: created, placements: placements };
}

/**
 * Counts the artifacts of the file that are present in a structure (final verification).
 * @param {Document} doc - Structure document
 * @param {Array<Number>} ids - IDs of the file
 * @param {Map<Number, String>} uriById - Artifact URI by ID
 * @returns {Number} Number of artifacts present
 */
function structure_countPresent(doc, ids, uriById) {
   const bound = new Set([...doc.getElementsByTagNameNS(NS_DNG_MODULE, "boundArtifact")].map(utils_rdfResource));
   return ids.filter((id) => bound.has(uriById.get(id))).length;
}
