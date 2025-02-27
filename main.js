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
      
      <div class="toolbar-divider"></div>
      
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
  const { cellId, value } = e.detail
  activeCellDisplay.textContent = cellId
  formulaInput.value = value || ''
})

formulaInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    const event = new CustomEvent('formula-submitted', {
      detail: { value: formulaInput.value }
    })
    document.dispatchEvent(event)
  }
})

// Toolbar functionality
document.getElementById('undo-btn').addEventListener('click', () => {
  spreadsheet.undo()
})

document.getElementById('redo-btn').addEventListener('click', () => {
  spreadsheet.redo()
})

document.getElementById('export-btn').addEventListener('click', () => {
  const csv = spreadsheet.exportToCSV()
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'spreadsheet.csv'
  a.click()
  URL.revokeObjectURL(url)
})

document.getElementById('bold-btn').addEventListener('click', () => {
  spreadsheet.formatSelectedCells({ bold: true })
})

document.getElementById('italic-btn').addEventListener('click', () => {
  spreadsheet.formatSelectedCells({ italic: true })
})

document.getElementById('underline-btn').addEventListener('click', () => {
  spreadsheet.formatSelectedCells({ underline: true })
})

document.getElementById('font-select').addEventListener('change', (e) => {
  spreadsheet.formatSelectedCells({ fontFamily: e.target.value })
})

document.getElementById('font-size-select').addEventListener('change', (e) => {
  spreadsheet.formatSelectedCells({ fontSize: parseInt(e.target.value) })
})

document.getElementById('text-color-btn').addEventListener('click', () => {
  const color = prompt('Enter a color (e.g., #FF0000 or red):')
  if (color) {
    spreadsheet.formatSelectedCells({ color })
  }
})

document.getElementById('fill-color-btn').addEventListener('click', () => {
  const color = prompt('Enter a background color (e.g., #FFFF00 or yellow):')
  if (color) {
    spreadsheet.formatSelectedCells({ backgroundColor: color })
  }
})

document.getElementById('align-left-btn').addEventListener('click', () => {
  spreadsheet.formatSelectedCells({ align: 'left' })
})

document.getElementById('align-center-btn').addEventListener('click', () => {
  spreadsheet.formatSelectedCells({ align: 'center' })
})

// Find and Replace
document.querySelector('.menu-item[data-menu="Edit"]').addEventListener('click', () => {
  const find = prompt('Enter text to find:')
  const replace = prompt('Enter text to replace with:')
  if (find && replace !== null) {
    spreadsheet.findAndReplaceInRange(find, replace)
  }
})

// File Menu - Import CSV (keeping export in toolbar)
const fileMenu = document.querySelector('.menu-item[data-menu="File"]')
fileMenu.addEventListener('click', () => {
  const action = prompt('Type "import" to import from CSV:')
  if (action === 'import') {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          spreadsheet.importFromCSV(event.target.result)
        }
        reader.readAsText(file)
      }
    })
    input.click()
  }
})

// Sheet Management
const sheetTabs = document.getElementById('sheet-tabs')

document.getElementById('add-sheet').addEventListener('click', () => {
  const sheetName = spreadsheet.addSheet('Sheet')
  const tab = document.createElement('div')
  tab.className = 'sheet-tab'
  tab.dataset.sheet = sheetName
  tab.textContent = sheetName
  tab.addEventListener('click', () => switchTab(sheetName))
  sheetTabs.insertBefore(tab, document.getElementById('add-sheet'))
  switchTab(sheetName)
})

function switchTab(sheetName) {
  const tabs = sheetTabs.querySelectorAll('.sheet-tab')
  tabs.forEach(tab => tab.classList.remove('active'))
  const activeTab = sheetTabs.querySelector(`.sheet-tab[data-sheet="${sheetName}"]`)
  activeTab.classList.add('active')
  spreadsheet.switchSheet(sheetName)
}

sheetTabs.querySelector('.sheet-tab').addEventListener('click', () => {
  switchTab('Sheet1')
})

// Make toolbar buttons interactive
document.querySelectorAll('.toolbar-button').forEach(button => {
  button.addEventListener('click', () => {
    button.classList.toggle('active')
  })
})
