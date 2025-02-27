import './style.css'
import { setupSpreadsheet } from './spreadsheet.js'

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
        <div class="menu-item">File</div>
        <div class="menu-item">Edit</div>
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
        <button class="toolbar-button" title="Undo (Ctrl+Z)">
          <i class="fa-solid fa-arrow-rotate-left"></i>
        </button>
        <button class="toolbar-button" title="Redo (Ctrl+Y)">
          <i class="fa-solid fa-arrow-rotate-right"></i>
        </button>
        <button class="toolbar-button" title="Print (Ctrl+P)">
          <i class="fa-solid fa-print"></i>
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
        <select class="font-select">
          <option>Arial</option>
          <option>Verdana</option>
          <option>Helvetica</option>
          <option>Times New Roman</option>
          <option>Courier New</option>
        </select>
        
        <select class="font-size-select">
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
        <button class="toolbar-button" title="Bold (Ctrl+B)">
          <i class="fa-solid fa-bold"></i>
        </button>
        <button class="toolbar-button" title="Italic (Ctrl+I)">
          <i class="fa-solid fa-italic"></i>
        </button>
        <button class="toolbar-button" title="Strikethrough">
          <i class="fa-solid fa-strikethrough"></i>
        </button>
      </div>
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button class="toolbar-button" title="Text color">
          <i class="fa-solid fa-font"></i>
        </button>
        <button class="toolbar-button" title="Fill color">
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
      
      <div class="toolbar-divider"></div>
      
      <div class="toolbar-group">
        <button class="toolbar-button" title="Horizontal align">
          <i class="fa-solid fa-align-left"></i>
        </button>
        <button class="toolbar-button" title="Vertical align">
          <i class="fa-solid fa-align-center"></i>
        </button>
        <button class="toolbar-button" title="Text wrapping">
          <i class="fa-solid fa-arrows-left-right-to-line"></i>
        </button>
      </div>
      
      
      <div class="toolbar-group">
        <button class="toolbar-button" title="Functions">
          <i class="fa-solid fa-function"></i>
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
    
    <div class="sheet-tabs">
      <div class="sheet-tab active">Sheet1</div>
      <div class="add-sheet">
        <i class="fa-solid fa-plus"></i>
      </div>
    </div>
  </div>
`

setupSpreadsheet(document.querySelector('#spreadsheet'))

// Connect formula bar to active cell
const formulaInput = document.getElementById('formula-input');
const activeCellDisplay = document.getElementById('active-cell');

// Listen for cell activation events
document.addEventListener('cell-activated', (e) => {
  const { cellId, value } = e.detail;
  activeCellDisplay.textContent = cellId;
  formulaInput.value = value || '';
});

// Update cell when formula changes
formulaInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const event = new CustomEvent('formula-submitted', {
      detail: {
        value: formulaInput.value
      }
    });
    document.dispatchEvent(event);
  }
});

// Make toolbar buttons interactive
document.querySelectorAll('.toolbar-button').forEach(button => {
  button.addEventListener('click', () => {
    // Toggle active state for the button
    button.classList.toggle('active');
  });
});