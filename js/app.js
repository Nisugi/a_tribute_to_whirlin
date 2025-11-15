/**
 * Main Application Module
 * Whirlin Trainer Web Application
 */

import { DataManager } from './dataManager.js';
import { GIAutofill } from './vlookup.js';
import { SheetOperations } from './sheetOperations.js';

class WhirlinTrainerApp {
    constructor() {
        this.dataManager = new DataManager();
        this.giAutofill = null;
        this.sheetOps = null;
        this.currentSheet = 'Trainer';
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Whirlin Trainer...');

        // Show loading indicator
        this.showLoading(true);

        try {
            // Load all data
            const success = await this.dataManager.loadAllSheets();

            if (!success) {
                throw new Error('Failed to load spreadsheet data');
            }

            // Initialize modules
            this.giAutofill = new GIAutofill(this.dataManager);
            this.sheetOps = new SheetOperations(this.dataManager);

            // Load GI autofill data
            await this.giAutofill.loadGIData();

            // Render initial view
            this.renderCurrentSheet();

            // Set up event listeners
            this.setupEventListeners();

            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize application: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Render the current sheet
     */
    renderCurrentSheet() {
        const sheetData = this.dataManager.sheets[this.currentSheet];
        if (!sheetData) {
            console.error('Sheet not found:', this.currentSheet);
            return;
        }

        const container = document.getElementById('sheet-container');
        if (!container) return;

        // Create table
        let html = '<div class="sheet-wrapper">';
        html += `<h2>${sheetData.name}</h2>`;
        html += '<table class="data-table" id="current-sheet-table">';

        // Render rows
        sheetData.rows.forEach((row, rowIndex) => {
            html += '<tr>';
            row.forEach((cell, colIndex) => {
                const value = cell.value !== null && cell.value !== undefined ? cell.value : '';
                const classes = [];

                // Add formatting classes
                if (cell.font?.bold) classes.push('bold');
                if (cell.font?.italic) classes.push('italic');

                html += `<td class="${classes.join(' ')}" data-row="${rowIndex}" data-col="${colIndex}">${value}</td>`;
            });
            html += '</tr>';
        });

        html += '</table>';
        html += '</div>';

        container.innerHTML = html;
    }

    /**
     * Switch to a different sheet
     * @param {string} sheetName - Name of the sheet to display
     */
    switchSheet(sheetName) {
        this.currentSheet = sheetName;
        this.renderCurrentSheet();
    }

    /**
     * Set up event listeners for buttons and inputs
     */
    setupEventListeners() {
        // Sheet navigation
        document.querySelectorAll('.sheet-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sheetName = e.target.dataset.sheet;
                this.switchSheet(sheetName);
            });
        });

        // Clear buttons
        const clearTrainingBtn = document.getElementById('clear-training-btn');
        if (clearTrainingBtn) {
            clearTrainingBtn.addEventListener('click', () => {
                this.sheetOps.clearTraining();
                this.renderCurrentSheet();
            });
        }

        const clearAscensionBtn = document.getElementById('clear-ascension-btn');
        if (clearAscensionBtn) {
            clearAscensionBtn.addEventListener('click', () => {
                this.sheetOps.clearAscension();
                this.renderCurrentSheet();
            });
        }

        // Hide/Unhide toggle
        const hideToggleBtn = document.getElementById('hide-toggle-btn');
        if (hideToggleBtn) {
            hideToggleBtn.addEventListener('click', () => {
                this.sheetOps.hideUnhideTraining();
            });
        }
    }

    /**
     * Show/hide loading indicator
     * @param {boolean} show - True to show, false to hide
     */
    showLoading(show) {
        const loader = document.getElementById('loading-indicator');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.whirlinApp = new WhirlinTrainerApp();
    window.whirlinApp.init();
});

export { WhirlinTrainerApp };
