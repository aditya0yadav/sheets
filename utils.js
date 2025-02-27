// utils.js
export const getCellId = (row, col) => {
  return `${String.fromCharCode(65 + col)}${row + 1}`;
};

export const parseCellId = (cellId) => {
  const colChar = cellId.charAt(0);
  const col = colChar.charCodeAt(0) - 65;
  const row = parseInt(cellId.substring(1)) - 1;
  return { row, col };
};

export const isFormula = (value) => {
  return typeof value === "string" && value.trim().startsWith("=");
};

export const parseRange = (range, cells) => {
  // Format: A1:B3
  const [start, end] = range.split(":");
  const startCell = parseCellId(start);
  const endCell = parseCellId(end);

  const values = [];
  for (let row = startCell.row; row <= endCell.row; row++) {
    for (let col = startCell.col; col <= endCell.col; col++) {
      const cellId = getCellId(row, col);
      const cellValue = cells[cellId]?.computed;
      if (cellValue !== undefined && !isNaN(parseFloat(cellValue))) {
        values.push(parseFloat(cellValue));
      }
    }
  }
  return values;
};

// Mathematical functions
export const sum = (range, cells) => {
  const values = parseRange(range, cells);
  return values.reduce((acc, val) => acc + val, 0);
};

export const average = (range, cells) => {
  const values = parseRange(range, cells);
  return values.length > 0
    ? values.reduce((acc, val) => acc + val, 0) / values.length
    : 0;
};

export const max = (range, cells) => {
  const values = parseRange(range, cells);
  return values.length > 0 ? Math.max(...values) : 0;
};

export const min = (range, cells) => {
  const values = parseRange(range, cells);
  return values.length > 0 ? Math.min(...values) : 0;
};

export const count = (range, cells) => {
  const values = parseRange(range, cells);
  return values.length;
};

// Data quality functions
export const trim = (value) => {
  return typeof value === "string" ? value.trim() : value;
};

export const upper = (value) => {
  return typeof value === "string" ? value.toUpperCase() : value;
};

export const lower = (value) => {
  return typeof value === "string" ? value.toLowerCase() : value;
};

export const findAndReplace = (range, cells, find, replace) => {
  // If find string is empty, don't proceed
  if (!find) return cells;
  
  const [start, end] = range.split(':');
  const startCell = parseCellId(start);
  const endCell = parseCellId(end);
  
  const updatedCells = { ...cells };
  
  for (let row = startCell.row; row <= endCell.row; row++) {
    for (let col = startCell.col; col <= endCell.col; col++) {
      const cellId = getCellId(row, col);
      const cellData = updatedCells[cellId];
      
      // Skip if cell doesn't exist or has no value
      if (!cellData || !cellData.value) continue;
      
      if (typeof cellData.value === 'string' && cellData.value.includes(find)) {
        // Update the cell value
        const newValue = cellData.value.replaceAll(find, replace);
        
        if (isFormula(newValue)) {
          updatedCells[cellId] = {
            ...cellData,
            value: newValue,
            // Let the evaluateCell function compute the new value
            computed: evaluateCell(newValue, updatedCells)
          };
        } else {
          updatedCells[cellId] = {
            ...cellData,
            value: newValue,
            computed: newValue
          };
        }
      }
    }
  }

  for (const cellId in updatedCells) {
    const cellData = updatedCells[cellId];
    if (cellData && isFormula(cellData.value)) {
      updatedCells[cellId] = {
        ...cellData,
        computed: evaluateCell(cellData.value, updatedCells)
      };
    }
  }
  
  return updatedCells;
};

export const removeDuplicates = (range, cells) => {
  const [start, end] = range.split(":");
  const startCell = parseCellId(start);
  const endCell = parseCellId(end);

  // Get all rows in the range
  const rows = [];
  for (let row = startCell.row; row <= endCell.row; row++) {
    const rowData = [];
    for (let col = startCell.col; col <= endCell.col; col++) {
      const cellId = getCellId(row, col);
      rowData.push(cells[cellId]?.value || "");
    }
    rows.push({ row, data: rowData });
  }

  // Find unique rows
  const seen = new Set();
  const uniqueRows = [];
  const duplicateRows = new Set();

  rows.forEach((rowObj) => {
    const rowStr = JSON.stringify(rowObj.data);
    if (seen.has(rowStr)) {
      duplicateRows.add(rowObj.row);
    } else {
      seen.add(rowStr);
      uniqueRows.push(rowObj);
    }
  });

  return { uniqueRows, duplicateRows };
};

// Date functions
export const today = () => {
  const date = new Date();
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

export const now = () => {
  const date = new Date();
  return date.toLocaleTimeString();
};

export const dateFormat = (value, format) => {
  if (!value) return '';
  
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '#INVALID DATE';
    
    // Simple format implementation
    if (format === 'MM/DD/YYYY') {
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    } else if (format === 'DD/MM/YYYY') {
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } else if (format === 'YYYY-MM-DD') {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } else {
      return date.toLocaleDateString();
    }
  } catch (error) {
    return '#ERROR';
  }
};

// Statistical functions
export const median = (range, cells) => {
  const values = parseRange(range, cells).sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  
  return values.length === 0
    ? 0
    : values.length % 2 === 0
      ? (values[mid - 1] + values[mid]) / 2
      : values[mid];
};

export const stdev = (range, cells) => {
  const values = parseRange(range, cells);
  if (values.length <= 1) return 0;
  
  const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (values.length - 1);
  
  return Math.sqrt(variance);
};

// Text functions
export const concatenate = (...args) => {
  return args.join('');
};

export const left = (text, numChars) => {
  if (typeof text !== 'string') return '';
  return text.substring(0, numChars);
};

export const right = (text, numChars) => {
  if (typeof text !== 'string') return '';
  return text.substring(text.length - numChars);
};

export const mid = (text, start, numChars) => {
  if (typeof text !== 'string') return '';
  return text.substring(start - 1, start - 1 + numChars);
};

export const len = (text) => {
  if (typeof text !== 'string') return 0;
  return text.length;
};

export const evaluateCell = (value, allCells = {}) => {
  if (!value) return "";
  if (!isFormula(value)) return value;

  try {
    const formula = value.substring(1).trim(); // Remove the equals sign

    // Handle built-in functions
    if (formula.startsWith("SUM(") && formula.endsWith(")")) {
      const range = formula.substring(4, formula.length - 1);
      return sum(range, allCells).toString();
    }

    if (formula.startsWith("AVERAGE(") && formula.endsWith(")")) {
      const range = formula.substring(8, formula.length - 1);
      return average(range, allCells).toString();
    }

    if (formula.startsWith("MAX(") && formula.endsWith(")")) {
      const range = formula.substring(4, formula.length - 1);
      return max(range, allCells).toString();
    }

    if (formula.startsWith("MIN(") && formula.endsWith(")")) {
      const range = formula.substring(4, formula.length - 1);
      return min(range, allCells).toString();
    }

    if (formula.startsWith("COUNT(") && formula.endsWith(")")) {
      const range = formula.substring(6, formula.length - 1);
      return count(range, allCells).toString();
    }

    if (formula.startsWith("TRIM(") && formula.endsWith(")")) {
      const cellId = formula.substring(5, formula.length - 1);
      const cellValue = allCells[cellId]?.value || "";
      return trim(cellValue);
    }

    if (formula.startsWith("UPPER(") && formula.endsWith(")")) {
      const cellId = formula.substring(6, formula.length - 1);
      const cellValue = allCells[cellId]?.value || "";
      return upper(cellValue);
    }

    if (formula.startsWith("LOWER(") && formula.endsWith(")")) {
      const cellId = formula.substring(6, formula.length - 1);
      const cellValue = allCells[cellId]?.value || "";
      return lower(cellValue);
    }
    
    if (formula.startsWith("TODAY(") && formula.endsWith(")")) {
      return today();
    }
    
    if (formula.startsWith("NOW(") && formula.endsWith(")")) {
      return now();
    }
    
    if (formula.startsWith("MEDIAN(") && formula.endsWith(")")) {
      const range = formula.substring(7, formula.length - 1);
      return median(range, allCells).toString();
    }
    
    if (formula.startsWith("STDEV(") && formula.endsWith(")")) {
      const range = formula.substring(6, formula.length - 1);
      return stdev(range, allCells).toString();
    }
    
    if (formula.startsWith("LEN(") && formula.endsWith(")")) {
      const param = formula.substring(4, formula.length - 1);
      // Check if it's a cell reference
      if (/^[A-Z]+[0-9]+$/.test(param)) {
        return len(allCells[param]?.computed || "").toString();
      } else {
        return len(param).toString();
      }
    }

    // Basic arithmetic operations
    // This is a simple implementation that doesn't handle operator precedence
    const parts = formula.split(/([+\-*/])/);

    if (parts.length > 1) {
      let result = parseFloat(parts[0]);
      for (let i = 1; i < parts.length; i += 2) {
        const operator = parts[i];
        const operand = parseFloat(parts[i + 1]);

        if (operator === "+") result += operand;
        else if (operator === "-") result -= operand;
        else if (operator === "*") result *= operand;
        else if (operator === "/") result /= operand;
      }

      return result.toString();
    }

    // If it's a cell reference, return its value
    if (/^[A-Z]+[0-9]+$/.test(formula)) {
      return allCells[formula]?.computed || "";
    }

    return formula; // If it's not a recognized formula, return as is
  } catch (error) {
    return "#ERROR";
  }
};