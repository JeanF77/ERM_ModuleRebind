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
|     2    | 26/09/2026 |    Dr Jazz     | METADATA block of the ERM export     |
+-------------------------------------------------------------------------------+
*/
/*
 * Reading of the Excel file (export of an ERM view) with SheetJS, and local
 * checks of its content. Only the first sheet is read, with the headers in
 * row 1. The METADATA block added by the ERM export is ignored. The REBIND
 * button is only enabled if every check passes.
 */

/* ------------------------------------------------------------------------------
   ---- Core functions
   --------------------------------------------------------------------------- */

/**
 * Reads a file selected by the user.
 * @param {File} file - Selected file
 * @returns {Promise<ArrayBuffer>} File content
 */
function excel_readFile(file) {
   return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
   });
}

/**
 * Tells whether a cell is empty.
 * @param {*} value - Cell value
 * @returns {Boolean} true if the cell is empty or only contains spaces
 */
function excel_isEmptyCell(value) {
   return value === null || value === undefined || (typeof value === "string" && value.trim() === "");
}

/**
 * Converts a cell into a strictly positive integer.
 * @param {*} value - Cell value (number or text)
 * @returns {Number|null} Integer, or null if the value is not a positive integer
 */
function excel_parseInteger(value) {
   if (typeof value === "number") {
      return Number.isInteger(value) && value > 0 ? value : null;
   }
   if (typeof value === "string" && /^\d+$/.test(value.trim())) {
      const number = Number(value.trim());
      return number > 0 ? number : null;
   }
   return null;
}

/**
 * Converts an isHeading cell into a boolean: Excel boolean, or text "true" / "false" (any case).
 * @param {*} value - Cell value
 * @returns {Boolean|null} Boolean, or null if the value is not accepted
 */
function excel_parseBoolean(value) {
   if (typeof value === "boolean") {
      return value;
   }
   if (typeof value === "string") {
      const text = value.trim().toLowerCase();
      if (text === "true") {
         return true;
      }
      if (text === "false") {
         return false;
      }
   }
   return null;
}

/**
 * Returns the text of a row whose only non-empty cell is the first one (column A).
 * @param {Array} cells - Cells of the row
 * @returns {String|null} Trimmed text of the first cell, or null if the row has another form
 */
function excel_firstCellOnly(cells) {
   if (!cells.length || typeof cells[0] !== "string" || !cells.slice(1).every(excel_isEmptyCell)) {
      return null;
   }
   return cells[0].trim();
}

/**
 * Removes the METADATA block added by the Excel export of an ERM view: a row
 * "METADATA", followed by rows "Name=Value" (e.g. "Export Module=https://…"),
 * each time in column A only. These rows are not used by the widget.
 * @param {Array<Object>} rows - Rows of the sheet ({ cells, line })
 * @returns {Object} { rows, metadataLines } - rows without the block, and Excel line numbers of the removed rows
 */
function excel_removeMetadata(rows) {
   const kept = [];
   const metadataLines = [];
   let inBlock = false;

   for (const row of rows) {
      const text = excel_firstCellOnly(row.cells);
      if (text === EXCEL_METADATA_MARKER) {
         inBlock = true;
      } else if (!inBlock || text === null || !EXCEL_METADATA_ENTRY.test(text)) {
         inBlock = false;
         kept.push(row);
         continue;
      }
      metadataLines.push(row.line);
   }
   return { rows: kept, metadataLines: metadataLines };
}

/**
 * Reads the first sheet of the workbook as rows of cells.
 * @param {ArrayBuffer} content - File content
 * @returns {Object} { rows, firstLine } where firstLine is the Excel line number of rows[0]
 * @throws {RebindError} If the file cannot be read as an XLSX workbook
 */
function excel_readSheet(content) {
   let workbook;

   try {
      workbook = XLSX.read(content, { type: "array" });
   } catch (error) {
      utils_console("SheetJS cannot read the file: " + error.message, CONSOLE_ERROR);
      throw new RebindError("error.excel.unreadable");
   }

   const sheet = workbook.SheetNames.length ? workbook.Sheets[workbook.SheetNames[0]] : null;
   if (!sheet || !sheet["!ref"]) {
      throw new RebindError("error.excel.noData");
   }

   return {
      rows: XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null, blankrows: true }),
      firstLine: XLSX.utils.decode_range(sheet["!ref"]).s.r + 1
   };
}

/**
 * Locates the mandatory columns in the header row.
 * @param {Array} headerRow - Cells of the header row
 * @returns {Object} Column index by column name
 * @throws {RebindError} If a mandatory column is missing or duplicated
 */
function excel_findColumns(headerRow) {
   const headers = headerRow.map((cell) => excel_isEmptyCell(cell) ? "" : String(cell).trim());
   const columns = {};
   const missing = [];

   for (const name of EXCEL_REQUIRED_COLUMNS) {
      const positions = headers.reduce((list, header, index) => (header === name ? list.concat(index) : list), []);
      if (positions.length === 0) {
         missing.push(name);
      } else if (positions.length > 1) {
         throw new RebindError("error.excel.duplicateColumn", { column: name });
      } else {
         columns[name] = positions[0];
      }
   }

   if (missing.length) {
      throw new RebindError("error.excel.missingColumns", { columns: missing.join(", ") });
   }
   return columns;
}

/**
 * Checks and converts one data row.
 * @param {Array} row - Cells of the row
 * @param {Number} line - Excel line number
 * @param {Object} columns - Column index by column name
 * @param {Array<Object>} errors - Error list, completed by this function ({ key, params })
 * @returns {Object|null} { line, id, parent, isHeading, type }, or null if the row has errors
 */
function excel_parseRow(row, line, columns, errors) {
   const rawId = row[columns[EXCEL_COLUMN_ID]];
   const rawParent = row[columns[EXCEL_COLUMN_PARENT]];
   const rawHeading = row[columns[EXCEL_COLUMN_IS_HEADING]];
   const rawType = row[columns[EXCEL_COLUMN_ARTIFACT_TYPE]];
   const errorCount = errors.length;

   const id = excel_parseInteger(rawId);
   if (excel_isEmptyCell(rawId)) {
      errors.push({ key: "error.excel.missingId", params: { line: line } });
   } else if (id === null) {
      errors.push({ key: "error.excel.invalidId", params: { line: line, value: rawId } });
   }

   const parent = excel_isEmptyCell(rawParent) ? null : excel_parseInteger(rawParent);
   if (!excel_isEmptyCell(rawParent) && parent === null) {
      errors.push({ key: "error.excel.invalidParent", params: { line: line, value: rawParent } });
   }

   const isHeading = excel_parseBoolean(rawHeading);
   if (excel_isEmptyCell(rawHeading)) {
      errors.push({ key: "error.excel.missingIsHeading", params: { line: line } });
   } else if (isHeading === null) {
      errors.push({ key: "error.excel.invalidIsHeading", params: { line: line, value: rawHeading } });
   }

   if (errors.length > errorCount) {
      return null;
   }
   return {
      line: line,
      id: id,
      parent: parent,
      isHeading: isHeading,
      type: excel_isEmptyCell(rawType) ? "" : String(rawType).trim()
   };
}

/**
 * Checks that the IDs are unique and that every parent present in the file
 * appears before its children.
 * @param {Array<Object>} rows - Converted rows
 * @param {Array<Object>} errors - Error list, completed by this function
 * @returns {void}
 */
function excel_checkHierarchy(rows, errors) {
   const firstLineById = new Map();

   for (const row of rows) {
      if (firstLineById.has(row.id)) {
         errors.push({ key: "error.excel.duplicateId", params: { id: row.id, line: row.line, firstLine: firstLineById.get(row.id) } });
      } else {
         firstLineById.set(row.id, row.line);
      }
   }
   if (errors.length) {
      return;
   }

   const seen = new Set();
   for (const row of rows) {
      if (row.parent !== null && firstLineById.has(row.parent) && !seen.has(row.parent)) {
         errors.push({ key: "error.excel.parentAfterChild", params: { line: row.line, id: row.id, parent: row.parent } });
      }
      seen.add(row.id);
   }
}

/**
 * Builds the summary of a valid file: anchor points, root artifacts and count by artifact type.
 * @param {String} fileName - File name
 * @param {Array<Object>} rows - Converted rows
 * @param {Array<Number>} metadataLines - Excel line numbers of the ignored METADATA rows
 * @returns {Object} { fileName, rows, anchors, rootCount, typeCounts, metadataLines }
 */
function excel_buildData(fileName, rows, metadataLines) {
   const ids = new Set(rows.map((row) => row.id));
   const anchors = [];
   const typeCounts = new Map();

   for (const row of rows) {
      if (row.parent !== null && !ids.has(row.parent) && !anchors.includes(row.parent)) {
         anchors.push(row.parent);
      }
      typeCounts.set(row.type, (typeCounts.get(row.type) || 0) + 1);
   }

   return {
      fileName: fileName,
      rows: rows,
      anchors: anchors,
      rootCount: rows.filter((row) => row.parent === null).length,
      typeCounts: typeCounts,
      metadataLines: metadataLines
   };
}

/**
 * Reads and checks the Excel file (section 6.5 of the specification):
 * readable XLSX, METADATA block of the ERM export ignored, mandatory headers, at least one data row, no empty row in the
 * middle of the data, valid values, unique IDs, parents before their children.
 * @param {String} fileName - File name
 * @param {ArrayBuffer} content - File content
 * @returns {Object} { valid, errors, data } - errors: [{ key, params }], data: see excel_buildData (null if invalid)
 */
function excel_analyze(fileName, content) {
   const errors = [];

   try {
      if (!fileName.toLowerCase().endsWith(EXCEL_FILE_EXTENSION)) {
         throw new RebindError("error.excel.notXlsx", { fileName: fileName });
      }

      const sheet = excel_readSheet(content);
      if (sheet.firstLine !== 1 || sheet.rows.length === 0) {
         throw new RebindError("error.excel.headerNotFirstRow");
      }

      // ---- The METADATA block of the ERM export is ignored, wherever it is in the sheet
      const sheetRows = sheet.rows.map((cells, index) => ({ cells: cells, line: sheet.firstLine + index }));
      const metadata = excel_removeMetadata(sheetRows);
      const keptRows = metadata.rows;

      // ---- Headers in row 1, or after the METADATA block (and its following empty rows) if it opens the sheet
      let headerIndex = 0;
      if (metadata.metadataLines[0] === sheetRows[0].line) {
         while (headerIndex < keptRows.length && keptRows[headerIndex].cells.every(excel_isEmptyCell)) {
            headerIndex++;
         }
      }
      if (headerIndex >= keptRows.length) {
         throw new RebindError("error.excel.headerNotFirstRow");
      }

      const columns = excel_findColumns(keptRows[headerIndex].cells);
      const dataRows = keptRows.slice(headerIndex + 1);

      // ---- Empty rows at the end of the sheet (possibly before the METADATA block) are ignored
      while (dataRows.length && dataRows[dataRows.length - 1].cells.every(excel_isEmptyCell)) {
         dataRows.pop();
      }
      if (dataRows.length === 0) {
         throw new RebindError("error.excel.noData");
      }

      const rows = [];
      dataRows.forEach((row) => {
         if (row.cells.every(excel_isEmptyCell)) {
            errors.push({ key: "error.excel.emptyRow", params: { line: row.line } });
            return;
         }
         const parsed = excel_parseRow(row.cells, row.line, columns, errors);
         if (parsed) {
            rows.push(parsed);
         }
      });

      if (errors.length === 0) {
         excel_checkHierarchy(rows, errors);
      }
      if (errors.length) {
         return { valid: false, errors: errors, data: null };
      }

      return { valid: true, errors: [], data: excel_buildData(fileName, rows, metadata.metadataLines) };
   } catch (error) {
      if (!(error instanceof RebindError)) {
         throw error;
      }
      return { valid: false, errors: [{ key: error.key, params: error.params }], data: null };
   }
}
