/**
 * Sheet Operations
 * Replicates VBA sheet manipulation functions
 */

class SheetOperations {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    /**
     * Clear Training Area
     * Replicates: ClearTraining() VBA macro
     */
    clearTraining() {
        this.dataManager.clearNamedRange('Training_Area');
        console.log('Training area cleared');
    }

    /**
     * Clear Ascension Area
     * Replicates: ClearAscension() VBA macro
     */
    clearAscension() {
        this.dataManager.clearNamedRange('Ascension_Area');
        this.dataManager.setCellValue('Ascension', 'Ascension_Milestones', 'False');
        console.log('Ascension area cleared');
    }

    /**
     * Hide/Unhide Training Rows
     * Replicates: HideUnhideTraining() VBA macro
     * This would need to be adapted to work with HTML table rows
     */
    hideUnhideTraining() {
        const hideEmptyRows = this.dataManager.getCellValue('Trainer', 'J41');

        if (hideEmptyRows === 'True' || hideEmptyRows === true) {
            // Hide empty rows in Current_Total range
            const rangeData = this.dataManager.getNamedRange('Current_Total');

            rangeData.forEach((row, index) => {
                const value = row[0];
                if (value === 0 || value === '' || value === null) {
                    // In HTML implementation, we would hide the corresponding table row
                    this.hideTableRow('trainer-table', index);
                }
            });
        } else {
            // Show all rows
            this.showAllTableRows('trainer-table');
        }
    }

    /**
     * Hide a table row in the HTML
     * @param {string} tableId - ID of the table
     * @param {number} rowIndex - Index of the row to hide
     */
    hideTableRow(tableId, rowIndex) {
        const table = document.getElementById(tableId);
        if (table && table.rows[rowIndex]) {
            table.rows[rowIndex].style.display = 'none';
        }
    }

    /**
     * Show all table rows
     * @param {string} tableId - ID of the table
     */
    showAllTableRows(tableId) {
        const table = document.getElementById(tableId);
        if (table) {
            for (let i = 0; i < table.rows.length; i++) {
                table.rows[i].style.display = '';
            }
        }
    }

    /**
     * Auto Training function
     * Replicates: Autotraining() VBA macro (incomplete in original)
     */
    autoTraining() {
        const autoAssignmentData = this.dataManager.getNamedRange('AutoAssignment');

        autoAssignmentData.forEach(row => {
            const value = row[0];
            if (value) {
                const levelup = value.toString().trim().toUpperCase();
                // Original VBA macro was incomplete
                // This would need additional implementation
                console.log('Processing auto-training for:', levelup);
            }
        });
    }
}

export { SheetOperations };
