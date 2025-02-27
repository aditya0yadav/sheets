# Spreadsheet Application

A lightweight, web-based spreadsheet application hosted on a server, designed for simple data management and calculations. This tool offers essential features like formula support, resizable rows and columns, and drag-to-resize functionality, making it ideal for basic spreadsheet tasks directly in your browser.

## Use Cases

Below are practical examples of how to use the spreadsheet:

### 1. Basic Data Entry and Summation
- **Scenario**: Track daily expenses.
- **How to Use**:
  - Click cell `A1`, type `Day 1`.
  - Click cell `A2`, type `Day 2`.
  - Click cell `B1`, type `50` (expense for Day 1).
  - Click cell `B2`, type `75` (expense for Day 2).
  - Click cell `B3`, type `=SUM(B1:B2)` and press Enter.
  - **Result**: Cell `B3` displays `125` (total expenses).

### 2. Resizing Columns for Better Readability
- **Scenario**: Adjust column width to fit longer text.
- **How to Use**:
  - Enter `Monthly Budget Report` in cell `A1`.
  - Hover over the right edge of the `A` column header until the cursor changes to a resize arrow.
  - Click and drag to the right to widen the column.
  - **Result**: The full text `Monthly Budget Report` is visible without truncation.

### 3. Drag to Resize Rows for Notes
- **Scenario**: Make space for detailed notes.
- **How to Use**:
  - Click cell `C1`, type a long note like `Meeting with team to discuss Q1 goals and projections`.
  - Hover over the bottom edge of row `1` (left side, row number) until the cursor changes to a resize arrow.
  - Drag downward to increase the row height.
  - **Result**: The entire note fits comfortably in the cell.

### 4. Calculating Averages
- **Scenario**: Average student scores.
- **How to Use**:
  - Enter scores: `85` in `A1`, `90` in `A2`, `88` in `A3`.
  - Click cell `A4`, type `=AVERAGE(A1:A3)` and press Enter.
  - **Result**: Cell `A4` shows `87.67` (average score).

### 5. Tracking Current Date
- **Scenario**: Add today’s date to a log.
- **How to Use**:
  - Click cell `D1`, type `=TODAY()` and press Enter.
  - **Result**: Cell `D1` displays the current date (e.g., `2/27/2025`).

## Supported Formulas

Enter these formulas in a cell starting with `=` to perform calculations or transformations:

- **`SUM(range)`**: Adds all numeric values in a range.
  - Example: `=SUM(A1:A3)` sums values in `A1` to `A3`.
- **`AVERAGE(range)`**: Calculates the average of numeric values in a range.
  - Example: `=AVERAGE(B1:B5)` averages values in `B1` to `B5`.
- **`MAX(range)`**: Finds the maximum value in a range.
  - Example: `=MAX(C1:C10)` returns the highest value.
- **`MIN(range)`**: Finds the minimum value in a range.
  - Example: `=MIN(D1:D4)` returns the lowest value.
- **`COUNT(range)`**: Counts numeric values in a range.
  - Example: `=COUNT(A1:A5)` returns the number of numeric entries.
- **`MEDIAN(range)`**: Finds the median value in a range.
  - Example: `=MEDIAN(E1:E3)` returns the middle value.
- **`STDEV(range)`**: Calculates the standard deviation of a range.
  - Example: `=STDEV(F1:F5)` computes statistical spread.
- **`LEN(cell)`**: Returns the length of text in a cell.
  - Example: `=LEN(A1)` counts characters in `A1`.
- **`TRIM(cell)`**: Removes extra spaces from text.
  - Example: `=TRIM(B1)` cleans up text in `B1`.
- **`UPPER(cell)`**: Converts text to uppercase.
  - Example: `=UPPER(C1)` makes text in `C1` all caps.
- **`LOWER(cell)`**: Converts text to lowercase.
  - Example: `=LOWER(D1)` makes text in `D1` lowercase.
- **`TODAY()`**: Displays the current date.
  - Example: `=TODAY()` shows today’s date.
- **`NOW()`**: Displays the current time.
  - Example: `=NOW()` shows the current time.

## Resizable Features

- **Columns**:
  - **How**: Hover over the right edge of any column header (e.g., `A`, `B`) until a resize cursor appears, then drag left or right.
  - **Minimum Width**: 50 pixels.
  - **Purpose**: Adjust column sizes to fit content like long text or wide numbers.

- **Rows**:
  - **How**: Hover over the bottom edge of any row number (e.g., `1`, `2`) until a resize cursor appears, then drag up or down.
  - **Minimum Height**: 20 pixels.
  - **Purpose**: Increase row height for multi-line text or better visibility.

## Drag Features

- **Column Resizing**:
  - Click and hold the resize handle (small vertical bar) on the right side of a column header.
  - Drag to adjust width dynamically.
  - Release to set the new size.

- **Row Resizing**:
  - Click and hold the resize handle (small horizontal bar) at the bottom of a row number.
  - Drag to adjust height dynamically.
  - Release to set the new size.

## Accessing the Application

- **URL**: Visit `<your-hosted-url>` (replace with the actual server URL where the app is hosted).
- **Requirements**: A modern web browser (Chrome, Firefox, Edge, Safari) with JavaScript enabled.
- **Interaction**: Simply click cells to start typing, or use the mouse to resize rows and columns.

## Notes

- Formulas are recalculated automatically when referenced cells change.
- Drag resizing is smooth and responsive, with minimum size limits to prevent collapsing content.
- This is a basic version; advanced features like formatting or multi-sheet support may not be available in this hosted instance.
