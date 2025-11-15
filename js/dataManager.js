/**
 * Data Manager for Whirlin Trainer
 * Handles loading and managing spreadsheet data
 */

class DataManager {
    constructor() {
        this.sheets = {};
        this.namedRanges = {};
        this.loaded = false;
    }

    /**
     * Load all sheet data from JSON files
     */
    async loadAllSheets() {
        const sheetNames = [
            'Trainer',
            'Ascension',
            'Enhancive_Builds',
            'Enhancive_Inventory',
            'Defense_Strength',
            'Attack_Strength',
            'Aiming',
            'Services',
            'Society',
            'Tables',
            'Weapon_Tables',
            'Sheet3',
            'Spell_Effects',
            'Releases,_Versions,_etc',
            'Sheet2',
            'Player_Skills_Manager'
        ];

        try {
            // Load all sheets in parallel
            const promises = sheetNames.map(async (name) => {
                const response = await fetch(`data/${name}.json`);
                const data = await response.json();
                this.sheets[data.name] = data;
            });

            await Promise.all(promises);
            this.loaded = true;
            this.parseNamedRanges();
            return true;
        } catch (error) {
            console.error('Error loading sheets:', error);
            return false;
        }
    }

    /**
     * Parse and identify named ranges from the data
     * Named ranges like "Training_Area", "GI_Autofill", etc.
     */
    parseNamedRanges() {
        // This would need to be configured based on the actual named ranges
        // For now, we'll set up a placeholder structure
        this.namedRanges = {
            'Training_Area': { sheet: 'Trainer', range: 'A1:Z100' },
            'GI_Autofill': { sheet: 'Trainer', range: 'A1:B50' },
            'Ascension_Area': { sheet: 'Ascension', range: 'A1:T20' },
            'Current_Total': { sheet: 'Trainer', range: 'A1:A334' }
        };
    }

    /**
     * Get value from a specific cell
     * @param {string} sheetName - Name of the sheet
     * @param {string} cellRef - Cell reference (e.g., "I5")
     * @returns {*} Cell value
     */
    getCellValue(sheetName, cellRef) {
        const sheet = this.sheets[sheetName];
        if (!sheet) return null;

        const { row, col } = this.parseCellReference(cellRef);
        return sheet.rows[row]?.[col]?.value || null;
    }

    /**
     * Set value in a specific cell
     * @param {string} sheetName - Name of the sheet
     * @param {string} cellRef - Cell reference (e.g., "I5")
     * @param {*} value - Value to set
     */
    setCellValue(sheetName, cellRef, value) {
        const sheet = this.sheets[sheetName];
        if (!sheet) return;

        const { row, col } = this.parseCellReference(cellRef);
        if (!sheet.rows[row]) sheet.rows[row] = [];
        if (!sheet.rows[row][col]) sheet.rows[row][col] = {};
        sheet.rows[row][col].value = value;
    }

    /**
     * Parse cell reference like "I5" into row and column indices
     * @param {string} cellRef - Cell reference
     * @returns {{row: number, col: number}}
     */
    parseCellReference(cellRef) {
        const match = cellRef.match(/^([A-Z]+)(\d+)$/);
        if (!match) throw new Error(`Invalid cell reference: ${cellRef}`);

        const colLetters = match[1];
        const rowNum = parseInt(match[2], 10) - 1; // Convert to 0-based

        // Convert column letters to number (A=0, B=1, ..., Z=25, AA=26, etc.)
        let col = 0;
        for (let i = 0; i < colLetters.length; i++) {
            col = col * 26 + (colLetters.charCodeAt(i) - 65);
        }

        return { row: rowNum, col };
    }

    /**
     * Get data from a named range
     * @param {string} rangeName - Name of the range
     * @returns {Array} 2D array of cell values
     */
    getNamedRange(rangeName) {
        const range = this.namedRanges[rangeName];
        if (!range) return null;

        const sheet = this.sheets[range.sheet];
        if (!sheet) return null;

        // Parse range (e.g., "A1:B50")
        const [start, end] = range.range.split(':');
        const startPos = this.parseCellReference(start);
        const endPos = this.parseCellReference(end);

        const result = [];
        for (let r = startPos.row; r <= endPos.row; r++) {
            const row = [];
            for (let c = startPos.col; c <= endPos.col; c++) {
                row.push(sheet.rows[r]?.[c]?.value || null);
            }
            result.push(row);
        }

        return result;
    }

    /**
     * Clear contents of a named range
     * @param {string} rangeName - Name of the range to clear
     */
    clearNamedRange(rangeName) {
        const range = this.namedRanges[rangeName];
        if (!range) return;

        const sheet = this.sheets[range.sheet];
        if (!sheet) return;

        const [start, end] = range.range.split(':');
        const startPos = this.parseCellReference(start);
        const endPos = this.parseCellReference(end);

        for (let r = startPos.row; r <= endPos.row; r++) {
            for (let c = startPos.col; c <= endPos.col; c++) {
                if (sheet.rows[r]?.[c]) {
                    sheet.rows[r][c].value = null;
                }
            }
        }
    }

    /**
     * Get entire sheet as 2D array
     * @param {string} sheetName - Name of the sheet
     * @returns {Array} 2D array of cell values
     */
    getSheetData(sheetName) {
        const sheet = this.sheets[sheetName];
        if (!sheet) return null;

        return sheet.rows.map(row => row.map(cell => cell.value));
    }
}

export { DataManager };
