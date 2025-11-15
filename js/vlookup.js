/**
 * JavaScript implementation of Excel VLOOKUP function
 * Replicates the VBA VLOOKUP functionality from the original spreadsheet
 */

/**
 * Performs a VLOOKUP operation on a data array
 * @param {*} lookupValue - The value to search for
 * @param {Array} tableArray - The 2D array to search in
 * @param {number} colIndex - The column index to return (1-based)
 * @param {boolean} exactMatch - True for exact match, false for approximate
 * @returns {*} The found value or null if not found
 */
function vlookup(lookupValue, tableArray, colIndex, exactMatch = true) {
    if (!tableArray || tableArray.length === 0) {
        return null;
    }

    // Convert to 0-based index
    const columnIndex = colIndex - 1;

    for (let i = 0; i < tableArray.length; i++) {
        const row = tableArray[i];
        const firstColumn = row[0];

        if (exactMatch) {
            // Exact match
            if (firstColumn === lookupValue) {
                return row[columnIndex] || null;
            }
        } else {
            // Approximate match (assumes sorted data)
            if (firstColumn <= lookupValue) {
                // Check if next row is too large
                if (i === tableArray.length - 1 || tableArray[i + 1][0] > lookupValue) {
                    return row[columnIndex] || null;
                }
            }
        }
    }

    return null;
}

/**
 * GI (Growth Item) autofill functions
 * These replicate the VBA macros for populating trainer fields
 */
class GIAutofill {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.giAutofillData = null;
    }

    /**
     * Load GI_Autofill named range data
     */
    async loadGIData() {
        // This would load from the extracted JSON data
        // The actual range would need to be identified in the spreadsheet
        this.giAutofillData = await this.dataManager.getNamedRange('GI_Autofill');
    }

    /**
     * Generic GI lookup function
     * @param {string} sourceCell - Source cell reference (e.g., "I27")
     * @param {string} targetCell - Target cell reference (e.g., "I5")
     */
    performGILookup(sourceCell, targetCell) {
        const lookupValue = this.dataManager.getCellValue('Trainer', sourceCell);
        const result = vlookup(lookupValue, this.giAutofillData, 2, false);
        this.dataManager.setCellValue('Trainer', targetCell, result);
    }

    // Individual GI functions matching the VBA macros
    GISTR() { this.performGILookup('I27', 'I5'); }
    GICON() { this.performGILookup('I28', 'I6'); }
    GIDEX() { this.performGILookup('I29', 'I7'); }
    GIAGI() { this.performGILookup('I30', 'I8'); }
    GIDIS() { this.performGILookup('I31', 'I9'); }
    GIAUR() { this.performGILookup('I32', 'I10'); }
    GILOG() { this.performGILookup('I33', 'I11'); }
    GIINT() { this.performGILookup('I34', 'I12'); }
    GIWIS() { this.performGILookup('I35', 'I13'); }
    GIINF() { this.performGILookup('I36', 'I14'); }
}

export { vlookup, GIAutofill };
