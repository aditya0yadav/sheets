import { getCellId, parseCellId, evaluateCell, isFormula, findAndReplace } from './utils.js';

export function setupSpreadsheet(element) {
  const state = {
    cells: {},
    activeCell: null,
    selectedRange: null,
    columnWidths: {},
    rowHeights: {},
    dragState: {
      active: false,
      element: null,
      type: null, // 'row' or 'column'
      index: null,
      startPos: 0,
      startSize: 0
    },
    clipboard: null,
    undoStack: [],
    redoStack: [],
    currentSheet: 'Sheet1',
    sheets: {
      'Sheet1': {
        cells: {},
        columnWidths: {},
        rowHeights: {}
      }
    }
  };

  const DEFAULT_COLUMN_WIDTH = 100;
  const DEFAULT_ROW_HEIGHT = 25;
  const NUM_ROWS = 100;
  const NUM_COLS = 26;

  // Initialize column widths and row heights
  for (let col = 0; col < NUM_COLS; col++) {
    state.columnWidths[col] = DEFAULT_COLUMN_WIDTH;
  }
  
  for (let row = 0; row < NUM_ROWS; row++) {
    state.rowHeights[row] = DEFAULT_ROW_HEIGHT;
  }

  // Create spreadsheet structure
  function createSpreadsheet() {
    element.innerHTML = '';
    
    // Create the table
    const table = document.createElement('table');
    table.className = 'spreadsheet-table';
    
    // Create header row with column resizers
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Empty corner cell
    const cornerCell = document.createElement('th');
    cornerCell.className = 'corner-cell';
    headerRow.appendChild(cornerCell);
    
    // Column headers
    for (let col = 0; col < NUM_COLS; col++) {
      const th = document.createElement('th');
      th.textContent = String.fromCharCode(65 + col);
      th.style.width = `${state.columnWidths[col]}px`;
      
      // Add column resizer
      const resizer = document.createElement('div');
      resizer.className = 'column-resizer';
      resizer.addEventListener('mousedown', (e) => {
        startResize(e, 'column', col);
      });
      
      th.appendChild(resizer);
      headerRow.appendChild(th);
    }
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    for (let row = 0; row < NUM_ROWS; row++) {
      const tr = document.createElement('tr');
      tr.style.height = `${state.rowHeights[row]}px`;
      
      // Row header with row resizer
      const rowHeader = document.createElement('th');
      rowHeader.textContent = row + 1;
      rowHeader.className = 'row-header';
      
      // Add row resizer
      const rowResizer = document.createElement('div');
      rowResizer.className = 'row-resizer';
      rowResizer.addEventListener('mousedown', (e) => {
        startResize(e, 'row', row);
      });
      
      rowHeader.appendChild(rowResizer);
      tr.appendChild(rowHeader);
      
      // Create cells
      for (let col = 0; col < NUM_COLS; col++) {
        const td = document.createElement('td');
        const cellId = getCellId(row, col);
        td.id = cellId;
        td.dataset.row = row;
        td.dataset.col = col;
        
        // Display cell value if it exists
        if (state.cells[cellId]) {
          td.textContent = state.cells[cellId].computed || '';
          
          // Apply cell formatting if it exists
          if (state.cells[cellId].format) {
            applyCellFormat(td, state.cells[cellId].format);
          }
        }
        
        // Add click event to edit cell
        td.addEventListener('click', (e) => {
          // If shift key is pressed, extend selection
          if (e.shiftKey && state.activeCell) {
            const activeCellPos = parseCellId(state.activeCell);
            const clickedCellPos = parseCellId(cellId);
            
            // Create a range from active cell to clicked cell
            const startRow = Math.min(activeCellPos.row, clickedCellPos.row);
            const endRow = Math.max(activeCellPos.row, clickedCellPos.row);
            const startCol = Math.min(activeCellPos.col, clickedCellPos.col);
            const endCol = Math.max(activeCellPos.col, clickedCellPos.col);
            
            const startCellId = getCellId(startRow, startCol);
            const endCellId = getCellId(endRow, endCol);
            
            selectRange(startCellId, endCellId);
          } else {
            // Clear any existing selection
            clearSelection();
            activateCell(cellId);
          }
        });
        
        // Double click to edit directly
        td.addEventListener('dblclick', () => {
          activateCell(cellId, true);
        });
        
        tr.appendChild(td);
      }
      
      tbody.appendChild(tr);
    }
    
    table.appendChild(tbody);
    element.appendChild(table);
    
    // Add drag handlers to document
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyDown);
    
    // Listen for formula submissions
    document.addEventListener('formula-submitted', (e) => {
      if (state.activeCell) {
        updateCellValue(state.activeCell, e.detail.value);
      }
    });
  }
  
  // Handle keyboard navigation
  function handleKeyDown(e) {
    if (!state.activeCell) return;
    
    const { row, col } = parseCellId(state.activeCell);
    let newRow = row;
    let newCol = col;
    
    // Arrow key navigation
    if (e.key === 'ArrowUp') {
      newRow = Math.max(0, row - 1);
    } else if (e.key === 'ArrowDown') {
      newRow = Math.min(NUM_ROWS - 1, row + 1);
    } else if (e.key === 'ArrowLeft') {
      newCol = Math.max(0, col - 1);
    } else if (e.key === 'ArrowRight') {
      newCol = Math.min(NUM_COLS - 1, col + 1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      newCol = e.shiftKey ? Math.max(0, col - 1) : Math.min(NUM_COLS - 1, col + 1);
    } else if (e.key === 'Enter') {
      // If we're not editing, move down
      const cell = document.getElementById(state.activeCell);
      if (!cell.querySelector('input')) {
        e.preventDefault();
        newRow = Math.min(NUM_ROWS - 1, row + 1);
      }
    } else if (e.ctrlKey && e.key === 'c') {
      // Copy
      copySelectedCells();
      return;
    } else if (e.ctrlKey && e.key === 'v') {
      // Paste
      pasteFromClipboard();
      return;
    } else if (e.ctrlKey && e.key === 'x') {
      // Cut
      cutSelectedCells();
      return;
    } else if (e.ctrlKey && e.key === 'z') {
      // Undo
      undo();
      return;
    } else if (e.ctrlKey && e.key === 'y') {
      // Redo
      redo();
      return;
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      // Delete content of selected cells
      deleteSelectedCells();
      return;
    } else if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
      // Start editing with the pressed key
      const cell = document.getElementById(state.activeCell);
      if (!cell.querySelector('input')) {
        activateCell(state.activeCell, true, e.key);
        e.preventDefault();
      }
    }
    
    // If position changed, activate the new cell
    if (newRow !== row || newCol !== col) {
      const newCellId = getCellId(newRow, newCol);
      activateCell(newCellId);
    }
  }
  
  // Select a range of cells
  function selectRange(startCellId, endCellId) {
    // Clear previous selection
    clearSelection();
    
    const startPos = parseCellId(startCellId);
    const endPos = parseCellId(endCellId);
    
    state.selectedRange = {
      startRow: Math.min(startPos.row, endPos.row),
      endRow: Math.max(startPos.row, endPos.row),
      startCol: Math.min(startPos.col, endPos.col),
      endCol: Math.max(startPos.col, endPos.col)
    };
    
    // Highlight the selected range
    for (let row = state.selectedRange.startRow; row <= state.selectedRange.endRow; row++) {
      for (let col = state.selectedRange.startCol; col <= state.selectedRange.endCol; col++) {
        const cellId = getCellId(row, col);
        const cell = document.getElementById(cellId);
        if (cell) {
          cell.classList.add('selected-range');
        }
      }
    }
    
    // Make the starting cell active
    activateCell(startCellId);
  }
  
  // Clear cell selection
  function clearSelection() {
    const selectedCells = document.querySelectorAll('.selected-range');
    selectedCells.forEach(cell => {
      cell.classList.remove('selected-range');
    });
    
    state.selectedRange = null;
  }
  
  // Copy selected cells
  function copySelectedCells() {
    const range = state.selectedRange || {
      startRow: parseCellId(state.activeCell).row,
      endRow: parseCellId(state.activeCell).row,
      startCol: parseCellId(state.activeCell).col,
      endCol: parseCellId(state.activeCell).col
    };
    
    const copiedData = [];
    
    for (let row = range.startRow; row <= range.endRow; row++) {
      const rowData = [];
      for (let col = range.startCol; col <= range.endCol; col++) {
        const cellId = getCellId(row, col);
        rowData.push(state.cells[cellId] || { value: '', computed: '' });
      }
      copiedData.push(rowData);
    }
    
    state.clipboard = {
      data: copiedData,
      width: range.endCol - range.startCol + 1,
      height: range.endRow - range.startRow + 1
    };
  }
  
  // Paste from clipboard
  function pasteFromClipboard() {
    if (!state.clipboard || !state.activeCell) return;
    
    // Save current state for undo
    saveStateForUndo();
    
    const { row, col } = parseCellId(state.activeCell);
    
    for (let r = 0; r < state.clipboard.height; r++) {
      for (let c = 0; c < state.clipboard.width; c++) {
        const targetRow = row + r;
        const targetCol = col + c;
        
        // Skip if out of bounds
        if (targetRow >= NUM_ROWS || targetCol >= NUM_COLS) continue;
        
        const targetCellId = getCellId(targetRow, targetCol);
        const sourceData = state.clipboard.data[r][c];
        
        // Update the cell with copied data
        if (sourceData.value !== undefined) {
          updateCellValue(targetCellId, sourceData.value);
          
          // Copy formatting if it exists
          if (sourceData.format) {
            if (!state.cells[targetCellId]) {
              state.cells[targetCellId] = { value: '', computed: '' };
            }
            state.cells[targetCellId].format = { ...sourceData.format };
            
            // Apply formatting to the cell
            const cell = document.getElementById(targetCellId);
            if (cell) {
              applyCellFormat(cell, sourceData.format);
            }
          }
        }
      }
    }
    
    // Select the pasted range
    const endRow = Math.min(NUM_ROWS - 1, row + state.clipboard.height - 1);
    const endCol = Math.min(NUM_COLS - 1, col + state.clipboard.width - 1);
    selectRange(state.activeCell, getCellId(endRow, endCol));
  }
  
  // Cut selected cells
  function cutSelectedCells() {
    copySelectedCells();
    deleteSelectedCells();
  }
  
  // Delete content of selected cells
  function deleteSelectedCells() {
    // Save current state for undo
    saveStateForUndo();
    
    const range = state.selectedRange || {
      startRow: parseCellId(state.activeCell).row,
      endRow: parseCellId(state.activeCell).row,
      startCol: parseCellId(state.activeCell).col,
      endCol: parseCellId(state.activeCell).col
    };
    
    for (let row = range.startRow; row <= range.endRow; row++) {
      for (let col = range.startCol; col <= range.endCol; col++) {
        const cellId = getCellId(row, col);
        updateCellValue(cellId, '');
      }
    }
  }
  
  // Save current state for undo
  function saveStateForUndo() {
    state.undoStack.push(JSON.stringify({
      cells: state.cells,
      columnWidths: state.columnWidths,
      rowHeights: state.rowHeights
    }));
    
    // Limit undo stack size
    if (state.undoStack.length > 50) {
      state.undoStack.shift();
    }
    
    // Clear redo stack when a new action is performed
    state.redoStack = [];
  }
  
  // Undo last action
  function undo() {
    if (state.undoStack.length === 0) return;
    
    // Save current state for redo
    state.redoStack.push(JSON.stringify({
      cells: state.cells,
      columnWidths: state.columnWidths,
      rowHeights: state.rowHeights
    }));
    
    // Restore previous state
    const prevState = JSON.parse(state.undoStack.pop());
    state.cells = prevState.cells;
    state.columnWidths = prevState.columnWidths;
    state.rowHeights = prevState.rowHeights;
    
    // Refresh the display
    refreshCellDisplay();
  }
  
  // Redo last undone action
  function redo() {
    if (state.redoStack.length === 0) return;
    
    // Save current state for undo
    state.undoStack.push(JSON.stringify({
      cells: state.cells,
      columnWidths: state.columnWidths,
      rowHeights: state.rowHeights
    }));
    
    // Restore next state
    const nextState = JSON.parse(state.redoStack.pop());
    state.cells = nextState.cells;
    state.columnWidths = nextState.columnWidths;
    state.rowHeights = nextState.rowHeights;
    
    // Refresh the display
    refreshCellDisplay();
  }
  
  // Apply formatting to a cell
  function applyCellFormat(cell, format) {
    if (!format) return;
    
    // Reset all styles to default first
    cell.style.fontWeight = 'normal';
    cell.style.fontStyle = 'normal';
    cell.style.fontSize = ''; // Reset to default
    cell.style.textDecoration = 'none';
    cell.style.textAlign = 'left'; // Default alignment
    cell.style.color = ''; // Reset to default
    cell.style.backgroundColor = ''; // Reset to default
    cell.style.fontFamily = ''; // Reset to default

    // Apply specified formatting
    if (format.bold) {
        cell.style.fontWeight = 'bold';
    }
    if (format.italic) {
        cell.style.fontStyle = 'italic';
    }
    if (format.fontSize) {
        cell.style.fontSize = `${format.fontSize}px`; // Ensure px unit is included
    }
    if (format.underline) {
        cell.style.textDecoration = 'underline';
    }
    if (format.align) {
        cell.style.textAlign = format.align;
    }
    if (format.color) {
        cell.style.color = format.color;
    }
    if (format.backgroundColor) {
        cell.style.backgroundColor = format.backgroundColor;
    }
    if (format.fontFamily) {
        cell.style.fontFamily = format.fontFamily;
    }
}
  
  // Handle cell activation
  function activateCell(cellId, startEditing = false, initialValue = null) {
    // Deactivate previous cell if any
    if (state.activeCell) {
      const prevCell = document.getElementById(state.activeCell);
      if (prevCell) {
        prevCell.classList.remove('selected');
        const input = prevCell.querySelector('input');
        if (input) {
          // Save the value
          updateCellValue(state.activeCell, input.value);
          prevCell.innerHTML = '';
          prevCell.textContent = state.cells[state.activeCell]?.computed || '';
          
          // Reapply formatting
          if (state.cells[state.activeCell]?.format) {
            applyCellFormat(prevCell, state.cells[state.activeCell].format);
          }
        }
      }
    }
    
    state.activeCell = cellId;
    const cell = document.getElementById(cellId);
    
    if (cell) {
      cell.classList.add('selected');
      
      // Dispatch event for formula bar
      const cellValue = state.cells[cellId]?.value || '';
      document.dispatchEvent(new CustomEvent('cell-activated', {
        detail: {
          cellId,
          value: cellValue
        }
      }));
      
      if (startEditing) {
        const cellValue = state.cells[cellId]?.value || '';
        cell.innerHTML = '';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = initialValue !== null ? initialValue : cellValue;
        input.className = 'cell-input';
        
        // Handle Enter key to save and move to next cell
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            updateCellValue(cellId, input.value);
            
            // Move to the next row
            const { row, col } = parseCellId(cellId);
            const nextCellId = getCellId(row + 1, col);
            activateCell(nextCellId);
          } else if (e.key === 'Escape') {
            // Cancel editing
            cell.innerHTML = '';
            cell.textContent = state.cells[cellId]?.computed || '';
            
            // Reapply formatting
            if (state.cells[cellId]?.format) {
              applyCellFormat(cell, state.cells[cellId].format);
            }
          } else if (e.key === 'Tab') {
            e.preventDefault();
            updateCellValue(cellId, input.value);
            
            // Move to the next column
            const { row, col } = parseCellId(cellId);
            const nextCol = e.shiftKey ? Math.max(0, col - 1) : Math.min(NUM_COLS - 1, col + 1);
            const nextCellId = getCellId(row, nextCol);
            activateCell(nextCellId);
          }
        });
        
        cell.appendChild(input);
        input.focus();
        
        // If initialValue is provided, place cursor at the end
        if (initialValue !== null) {
          input.selectionStart = initialValue.length;
          input.selectionEnd = initialValue.length;
        } else {
          input.select();
        }
      }
    }
  }
  
  // Update cell value and recalculate
  function updateCellValue(cellId, value) {
    // Save current state for undo
    saveStateForUndo();
    
    if (!state.cells[cellId]) {
      state.cells[cellId] = { value: '', computed: '' };
    }
    
    state.cells[cellId].value = value;
    
    // Evaluate the cell
    if (isFormula(value)) {
      state.cells[cellId].computed = evaluateCell(value, state.cells);
    } else {
      state.cells[cellId].computed = value;
    }
    
    // Recalculate all cells that might depend on this one
    recalculateAllCells();
    
    // Update the display
    refreshCellDisplay();
  }
  
  // Recalculate all formula cells
  function recalculateAllCells() {
    for (const cellId in state.cells) {
      const cellData = state.cells[cellId];
      if (isFormula(cellData.value)) {
        cellData.computed = evaluateCell(cellData.value, state.cells);
      }
    }
  }
  
  // Refresh the display of all cells
  function refreshCellDisplay() {
    for (const cellId in state.cells) {
      const cell = document.getElementById(cellId);
      if (cell && !cell.contains(document.activeElement)) {
        cell.textContent = state.cells[cellId].computed || '';
        
        // Reapply formatting
        if (state.cells[cellId].format) {
          applyCellFormat(cell, state.cells[cellId].format);
        }
      }
    }
  }
  
  // Start resize operation
  function startResize(e, type, index) {
    e.preventDefault();
    
    state.dragState = {
      active: true,
      type,
      index,
      startPos: type === 'column' ? e.clientX : e.clientY,
      startSize: type === 'column' ? state.columnWidths[index] : state.rowHeights[index]
    };
    
    document.body.style.cursor = type === 'column' ? 'col-resize' : 'row-resize';
  }
  
  // Handle mouse move during resize
  function handleMouseMove(e) {
    if (!state.dragState.active) return;
    
    const { type, index, startPos, startSize } = state.dragState;
    
    if (type === 'column') {
      const diff = e.clientX - startPos;
      const newWidth = Math.max(50, startSize + diff); // Minimum width of 50px
      state.columnWidths[index] = newWidth;
      
      // Update column width
      const headers = document.querySelectorAll('th');
      headers[index + 1].style.width = `${newWidth}px`;
    } else if (type === 'row') {
      const diff = e.clientY - startPos;
      const newHeight = Math.max(20, startSize + diff); // Minimum height of 20px
      state.rowHeights[index] = newHeight;
      
      // Update row height
      const rows = document.querySelectorAll('tbody tr');
      rows[index].style.height = `${newHeight}px`;
    }
  }
  
  // Handle mouse up to end resize
  function handleMouseUp() {
    if (state.dragState.active) {
      // Save state for undo
      saveStateForUndo();
      
      state.dragState.active = false;
      document.body.style.cursor = '';
    }
  }
  
  // Find and replace in selected range
  function findAndReplaceInRange(find, replace) {
    if (!find) return;
    
    // Save current state for undo
    saveStateForUndo();
    
    const range = state.selectedRange || {
      startRow: 0,
      endRow: NUM_ROWS - 1,
      startCol: 0,
      endCol: NUM_COLS - 1
    };
    
    const startCellId = getCellId(range.startRow, range.startCol);
    const endCellId = getCellId(range.endRow, range.endCol);
    const rangeStr = `${startCellId}:${endCellId}`;
    
    // Use the utility function to perform find and replace
    state.cells = findAndReplace(rangeStr, state.cells, find, replace);
    
    // Refresh the display
    refreshCellDisplay();
  }
  
  // Export to CSV
  function exportToCSV() {
    let csv = '';
    
    for ( let row = 0; row < NUM_ROWS; row++) {
      const rowData = [];
      
      for (let col = 0; col < NUM_COLS; col++) {
        const cellId = getCellId(row, col);
        const cellValue = state.cells[cellId]?.computed || '';
        
        // Escape quotes and wrap in quotes if needed
        let formattedValue = cellValue;
        if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
          formattedValue = `"${cellValue.replace(/"/g, '""')}"`;
        }
        
        rowData.push(formattedValue);
      }
      
      csv += rowData.join(',') + '\n';
    }
    
    return csv;
  }
  
  // Import from CSV
  function importFromCSV(csvContent) {
    // Save current state for undo
    saveStateForUndo();
    
    const rows = csvContent.split('\n');
    
    for (let row = 0; row < rows.length && row < NUM_ROWS; row++) {
      // Handle quoted values with commas
      const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
      const matches = rows[row].matchAll(regex);
      const values = Array.from(matches).map(match => {
        let value = match[1];
        // Remove quotes and handle escaped quotes
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1).replace(/""/g, '"');
        }
        return value;
      });
      
      for (let col = 0; col < values.length && col < NUM_COLS; col++) {
        const cellId = getCellId(row, col);
        updateCellValue(cellId, values[col]);
      }
    }
  }
  
  // Format cell
  function formatCell(cellId, formatOptions) {
    if (!state.cells[cellId]) {
      state.cells[cellId] = { value: '', computed: '' };
    }
    
    if (!state.cells[cellId].format) {
      state.cells[cellId].format = {};
    }
    
    // Apply new format options
    state.cells[cellId].format = {
      ...state.cells[cellId].format,
      ...formatOptions
    };
    
    // Apply formatting to the cell
    const cell = document.getElementById(cellId);
    if (cell) {
      applyCellFormat(cell, state.cells[cellId].format);
    }
  }
  
  // Format selected cells
  function formatSelectedCells(formatOptions) {
    // Save current state for undo
    saveStateForUndo();
    
    const range = state.selectedRange || {
      startRow: parseCellId(state.activeCell).row,
      endRow: parseCellId(state.activeCell).row,
      startCol: parseCellId(state.activeCell).col,
      endCol: parseCellId(state.activeCell).col
    };
    
    for (let row = range.startRow; row <= range.endRow; row++) {
      for (let col = range.startCol; col <= range.endCol; col++) {
        const cellId = getCellId(row, col);
        formatCell(cellId, formatOptions);
      }
    }
  }
  
  // Add a new sheet
  function addSheet(sheetName) {
    if (state.sheets[sheetName]) {
      // Sheet already exists, generate a unique name
      let counter = 1;
      let newName = `${sheetName} (${counter})`;
      while (state.sheets[newName]) {
        counter++;
        newName = `${sheetName} (${counter})`;
      }
      sheetName = newName;
    }
    
    // Save current sheet data
    state.sheets[state.currentSheet] = {
      cells: { ...state.cells },
      columnWidths: { ...state.columnWidths },
      rowHeights: { ...state.rowHeights }
    };
    
    // Create new sheet
    state.sheets[sheetName] = {
      cells: {},
      columnWidths: {},
      rowHeights: {}
    };
    
    // Initialize column widths and row heights for new sheet
    for (let col = 0; col < NUM_COLS; col++) {
      state.sheets[sheetName].columnWidths[col] = DEFAULT_COLUMN_WIDTH;
    }
    
    for (let row = 0; row < NUM_ROWS; row++) {
      state.sheets[sheetName].rowHeights[row] = DEFAULT_ROW_HEIGHT;
    }
    
    // Switch to new sheet
    switchSheet(sheetName);
    
    return sheetName;
  }
  
  // Switch to a different sheet
  function switchSheet(sheetName) {
    if (!state.sheets[sheetName]) return;
    
    // Save current sheet data
    state.sheets[state.currentSheet] = {
      cells: { ...state.cells },
      columnWidths: { ...state.columnWidths },
      rowHeights: { ...state.rowHeights }
    };
    
    // Load new sheet data
    state.currentSheet = sheetName;
    state.cells = { ...state.sheets[sheetName].cells };
    state.columnWidths = { ...state.sheets[sheetName].columnWidths };
    state.rowHeights = { ...state.sheets[sheetName].rowHeights };
    
    // Clear selection and active cell
    state.activeCell = null;
    state.selectedRange = null;
    
    // Refresh the display
    createSpreadsheet();
  }
  
  // Initialize the spreadsheet
  createSpreadsheet();
  
  // Add window resize handler to maintain layout
  window.addEventListener('resize', () => {
    createSpreadsheet();
  });
  
  return {
    activateCell,
    updateCellValue,
    selectRange,
    formatSelectedCells,
    findAndReplaceInRange,
    exportToCSV,
    importFromCSV,
    addSheet,
    switchSheet,
    undo,
    redo
  };
}