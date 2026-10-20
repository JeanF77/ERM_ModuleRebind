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
 * RDF and OSLC namespaces used to read and write ERM resources.
 */

/* ------------------------------------------------------------------------------
   ---- Namespaces
   --------------------------------------------------------------------------- */

const NS_RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const NS_DNG_MODULE = "http://jazz.net/ns/rm/dng/module#";
const NS_DCTERMS = "http://purl.org/dc/terms/";
const NS_OSLC = "http://open-services.net/ns/core#";
const NS_OSLC_AUTO = "http://open-services.net/ns/auto#";
const NS_XSD = "http://www.w3.org/2001/XMLSchema#";

/* ------------------------------------------------------------------------------
   ---- OSLC types
   --------------------------------------------------------------------------- */

const OSLC_RM_REQUIREMENT = "http://open-services.net/ns/rm#Requirement";

// ---- Suffixes of the OSLC Automation task states and verdicts
const OSLC_AUTO_STATE_IN_PROGRESS = "inProgress";
const OSLC_AUTO_VERDICT_UNAVAILABLE = "unavailable";
const OSLC_AUTO_VERDICT_PASSED = "passed";
