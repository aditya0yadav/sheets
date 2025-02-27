import './style.css'
import { setupSpreadsheet } from './spreadsheet.js'

// Security utilities
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/[<>&;]/g, '')
        .trim()
        .substring(0, 1000);
}

function generateCsrfToken() {
    return crypto.getRandomValues(new Uint32Array(1))[0].toString(36) +
           crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const csrfToken = generateCsrfToken();

document.querySelector('#app').innerHTML = `
  <div class="spreadsheet-app">
    <div class="app-header">
      <div class="app-title">
        <div class="app-icon">
          <i class="fa-solid fa-table-cells"></i>
        </div>
        <div class="title-input-container">
          <input type="text" class="title-input" value="Untitled spreadsheet">
        </div>
        <div class="star-button">
          <i class="fa-regular fa-star"></i>
        </div>
      </div>
      <div class="app-menu">
        <div class="menu-item" data-menu="File">File</div>
        <div class="menu-item" data-menu="Edit">Edit</div>
        <div class="menu-item">View</div>
        <div class="menu-item">Insert</div>
        <div class="menu-item">Format</div>
        <div class="menu-item">Data</div>
        <div class="menu-item">Tools</div>
        <div class="menu-item">Extensions</div>
        <div class="menu-item">Help</div>
      </div>
    </div>
    
    <div class="toolbar">
      <div class="toolbar-group">
        <button class="toolbar-button" title="Undo (Ctrl+Z)" id="undo-btn">
          <i class="fa-solid fa-arrow-rotate-left"></i>
        </button>
        <button class="toolbar-button" title="Redo (Ctrl+Y)" id="redo-btn">
          <i class="fa-solid fa-arrow-rotate-right"></i>
        </button>
        <button class="toolbar-button" title="Print (Ctrl+P)">
          <i class="fa-solid fa-print"></i>
        </button>
        <button class="toolbar-button" title="Export to CSV" id="export-btn">
          <i class="fa-solid fa-file-export"></i>
        </button>
        <button class="toolbar-button" title="Paint format">
          <i class="fa-solid fa-paintbrush"></i>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <select class="zoom-select">
          <option>100%</option>
          <option>75%</option>
          <option>50%</option>
          <option>25%</option>
        </select>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button class="toolbar-button" title="Format as currency">
          <i class="fa-solid fa-dollar-sign"></i>
        </button>
        <button class="toolbar-button" title="Format as percent">
          <i class="fa-solid fa-percent"></i>
        </button>
        <button class="toolbar-button" title="Decrease decimal places">
          <i class="fa-solid fa-minus"></i>
        </button>
        <button class="toolbar-button" title="Increase decimal places">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <select class="font-select" id="font-select">
          <option>Arial</option>
          <option>Verdana</option>
          <option>Helvetica</option>
          <option>Times New Roman</option>
          <option>Courier New</option>
        </select>
        
        <select class="font-size-select" id="font-size-select">
          <option>10</option>
          <option>11</option>
          <option selected>12</option>
          <option>14</option>
          <option>16</option>
          <option>18</option>
          <option>24</option>
          <option>36</option>
        </select>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button class="toolbar-button" title="Bold (Ctrl+B)" id="bold-btn">
          <i class="fa-solid fa-bold"></i>
        </button>
        <button class="toolbar-button" title="Italic (Ctrl+I)" id="italic-btn">
          <i class="fa-solid fa-italic"></i>
        </button>
        <button class="toolbar-button" title="Strikethrough" id="underline-btn">
          <i class="fa-solid fa-strikethrough"></i>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button class="toolbar-button" title="Text color" id="text-color-btn">
          <i class="fa-solid fa-font"></i>
        </button>
        <button class="toolbar-button" title="Fill color" id="fill-color-btn">
          <i class="fa-solid fa-fill-drip"></i>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button class="toolbar-button" title="Borders">
          <i class="fa-solid fa-border-all"></i>
        </button>
        <button class="toolbar-button" title="Merge cells">
          <i class="fa-solid fa-table-cells-large"></i>
        </button>
      </div>
            
      <div class="toolbar-group">
        <button class="toolbar-button" title="Horizontal align" id="align-left-btn">
          <i class="fa-solid fa-align-left"></i>
        </button>
        <button class="toolbar-button" title="Vertical align" id="align-center-btn">
          <i class="fa-solid fa-align-center"></i>
        </button>
        <button class="toolbar-button" title="Text wrapping">
          <i class="fa-solid fa-arrows-left-right-to-line"></i>
        </button>
      </div>
      
    </div>
    
    <div class="formula-bar">
      <div class="cell-name" id="active-cell">A1</div>
      <div class="formula-equals">=</div>
      <div class="formula-input-container">
        <input type="text" id="formula-input" placeholder="Enter formula">
      </div>
    </div>
    
    <div class="spreadsheet-container">
      <div id="spreadsheet" class="spreadsheet"></div>
    </div>
    
    <div class="sheet-tabs" id="sheet-tabs">
      <div class="sheet-tab active" data-sheet="Sheet1">Sheet1</div>
      <div class="add-sheet" id="add-sheet">
        <i class="fa-solid fa-plus"></i>
      </div>
    </div>
  </div>
`

// Initialize the spreadsheet
const spreadsheet = setupSpreadsheet(document.querySelector('#spreadsheet'))

// Connect formula bar to active cell
const formulaInput = document.getElementById('formula-input')
const activeCellDisplay = document.getElementById('active-cell')

document.addEventListener('cell-activated', (e) => {
    const { cellId, value } = e.detail;
    activeCellDisplay.textContent = sanitizeInput(cellId);
    formulaInput.value = sanitizeInput(value || '');
})

formulaInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const sanitizedValue = sanitizeInput(formulaInput.value);
        const event = new CustomEvent('formula-submitted', {
            detail: { 
                value: sanitizedValue,
                csrfToken: csrfToken 
            }
        });
        document.dispatchEvent(event);
    }
})

// Toolbar functionality with debouncing
const undoBtnHandler = debounce(() => spreadsheet.undo(), 200);
document.getElementById('undo-btn').addEventListener('click', undoBtnHandler);

const redoBtnHandler = debounce(() => spreadsheet.redo(), 200);
document.getElementById('redo-btn').addEventListener('click', redoBtnHandler);

const exportBtnHandler = debounce(() => {
    const csv = spreadsheet.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet.csv';
    a.click();
    URL.revokeObjectURL(url);
}, 200);
document.getElementById('export-btn').addEventListener('click', exportBtnHandler);

const boldBtnHandler = debounce(() => spreadsheet.formatSelectedCells({ bold: true }), 200);
document.getElementById('bold-btn').addEventListener('click', boldBtnHandler);

const italicBtnHandler = debounce(() => spreadsheet.formatSelectedCells({ italic: true }), 200);
document.getElementById('italic-btn').addEventListener('click', italicBtnHandler);

const underlineBtnHandler = debounce(() => spreadsheet.formatSelectedCells({ underline: true }), 200);
document.getElementById('underline-btn').addEventListener('click', underlineBtnHandler);

document.getElementById('font-select').addEventListener('change', (e) => {
    spreadsheet.formatSelectedCells({ fontFamily: sanitizeInput(e.target.value) });
});

document.getElementById('font-size-select').addEventListener('change', (e) => {
    spreadsheet.formatSelectedCells({ fontSize: parseInt(e.target.value) });
});

const textColorBtnHandler = debounce(() => {
    const color = sanitizeInput(prompt('Enter a color (e.g., #FF0000 or red):'));
    if (color && (/^#[0-9A-F]{6}$/i.test(color) || /^[a-z]+$/i.test(color))) {
        spreadsheet.formatSelectedCells({ color });
    }
}, 200);
document.getElementById('text-color-btn').addEventListener('click', textColorBtnHandler);

const fillColorBtnHandler = debounce(() => {
    const color = sanitizeInput(prompt('Enter a background color (e.g., #FFFF00 or yellow):'));
    if (color && (/^#[0-9A-F]{6}$/i.test(color) || /^[a-z]+$/i.test(color))) {
        spreadsheet.formatSelectedCells({ backgroundColor: color });
    }
}, 200);
document.getElementById('fill-color-btn').addEventListener('click', fillColorBtnHandler);

const alignLeftBtnHandler = debounce(() => spreadsheet.formatSelectedCells({ align: 'left' }), 200);
document.getElementById('align-left-btn').addEventListener('click', alignLeftBtnHandler);

const alignCenterBtnHandler = debounce(() => spreadsheet.formatSelectedCells({ align: 'center' }), 200);
document.getElementById('align-center-btn').addEventListener('click', alignCenterBtnHandler);

// Find and Replace
const editMenuHandler = debounce(() => {
    const find = sanitizeInput(prompt('Enter text to find:'));
    const replace = sanitizeInput(prompt('Enter text to replace with:'));
    if (find && replace !== null) {
        spreadsheet.findAndReplaceInRange(find, replace);
    }
}, 200);
document.querySelector('.menu-item[data-menu="Edit"]').addEventListener('click', editMenuHandler);

// File Menu - Import CSV
const fileMenu = document.querySelector('.menu-item[data-menu="File"]');
const fileMenuHandler = debounce(() => {
    const action = sanitizeInput(prompt('Type "import" to import from CSV:'));
    if (action === 'import') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type === 'text/csv' && file.size < 5 * 1024 * 1024) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const sanitizedCsv = sanitizeInput(event.target.result);
                    spreadsheet.importFromCSV(sanitizedCsv);
                };
                reader.readAsText(file);
            } else {
                alert('Please select a valid CSV file under 5MB');
            }
        });
        input.click();
    }
}, 200);
fileMenu.addEventListener('click', fileMenuHandler);

// Sheet Management
const sheetTabs = document.getElementById('sheet-tabs');

const addSheetHandler = debounce(() => {
    const sheetName = spreadsheet.addSheet('Sheet');
    const tab = document.createElement('div');
    tab.className = 'sheet-tab';
    tab.dataset.sheet = sheetName;
    tab.textContent = sheetName;
    tab.addEventListener('click', () => switchTab(sheetName));
    sheetTabs.insertBefore(tab, document.getElementById('add-sheet'));
    switchTab(sheetName);
}, 200);
document.getElementById('add-sheet').addEventListener('click', addSheetHandler);

function switchTab(sheetName) {
    const tabs = sheetTabs.querySelectorAll('.sheet-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    const activeTab = sheetTabs.querySelector(`.sheet-tab[data-sheet="${sheetName}"]`);
    activeTab.classList.add('active');
    spreadsheet.switchSheet(sheetName);
}

const sheetTabHandler = debounce(() => switchTab('Sheet1'), 200);
sheetTabs.querySelector('.sheet-tab').addEventListener('click', sheetTabHandler);

// Make toolbar buttons interactive
document.querySelectorAll('.toolbar-button').forEach(button => {
    const debouncedClick = debounce(() => {
        button.classList.toggle('active');
    }, 200);
    button.addEventListener('click', debouncedClick);
});
