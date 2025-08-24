Below is a detailed plan for implementing the Sales Forecast Dashboard. All changes, dependencies, error handling, and UI considerations are listed.

---

## Project Structure

```
project-root/

├── backend/
│   ├── data/
│   │   └── salesmonthly.csv
│   ├── routes/
│   │   └── sales.js
│   └── server.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── pages/
            └── Dashboard.jsx
```

---

## Backend Implementation (Node.js + Express)

### 1. File: backend/data/salesmonthly.csv  
- **Content:**  
  - Include header with columns: datum,M01AB,M01AE,N02BA,N02BE,N05B,N05C,R03,R06  
  - Provide 12 rows for 2025 (one per month; e.g., “2025-01-31,…”, “2025-02-28,…”) with realistic sales figures.  
- **Notes:**  
  - Use this CSV for all calculations; later you can upgrade to MySQL.

### 2. File: backend/routes/sales.js  
- **Endpoints to Implement:**  
  - **GET /api/medicines**  
  - Return a static array: [ "M01AB", "M01AE", "N02BA", "N02BE", "N05B", "N05C", "R03", "R06", "All" ].  
  - **GET /api/sales?medicine=X&month=Y&week=Z**  
  - Validate query parameters; if missing or invalid, return 400.  
  - Read and parse salesmonthly.csv using csv-parser.  
  - Filter rows for the year 2025 and (if specified) the given month.  
  - If medicine is “All”, sum sales across all medicine columns; otherwise, use the selected column.  
  - Daily Breakdown:  
   - If week is “All”:  
    - Calculate number of days in the month (use Date utilities).  
    - Daily sales = monthlySales / totalDays.  
   - If week is 1–4:  
    - Define ranges: week 1 (days 1–7), week 2 (8–14), week 3 (15–21), week 4 (22–last day).  
    - Weekly sales = monthlySales / 4 and then daily sales = weeklySales / (# days in that week).  
  - Return a JSON with keys: medicine, month, week, totalSales and dailyBreakdown array (each element: { day, sales }).  
  - **GET /api/recommendations**  
  - Return insights (e.g., static or computed based on sales data) such as:  
   [ "Sales of N02BE peak in Q2 → suggest stocking inventory before summer.", "M01AB shows steady growth across Q1." ].  
- **Error Handling:**  
  - Catch file read errors and CSV parsing errors.  
  - Use try...catch blocks and express error middleware if needed.

### 3. File: backend/server.js  
- **Setup:**  
  - Import express, cors, and your sales route.  
  - Mount the sales router on “/api.”  
  - Listen on a configurable port (e.g., 3000) and log server startup.  
  - Use error-handling middleware to capture errors from routes.

---

## Frontend Implementation (React + Vite)

### 1. File: frontend/index.html  
- **Content:**  
  - Basic HTML file to load the Vite bundle.

### 2. File: frontend/package.json & vite.config.js  
- **Dependencies:**  
  - React 18, ReactDOM, Recharts (for charts), TailwindCSS (for styling).  
  - Configure Vite to work with React.

### 3. File: frontend/src/main.jsx  
- **Setup:**  
  - Render the application by importing App.jsx and attaching it to the root.

### 4. File: frontend/src/App.jsx  
- **Content:**  
  - Render the Dashboard page directly (or set up routing if needed).

### 5. File: frontend/src/pages/Dashboard.jsx  
- **UI Components:**  
  - **Background Image:**  
  - Add an <img> tag with:  
   src=`"https://placehold.co/1920x1080?text=Subtle+corporate+dashboard+background+with+tint"`  
   alt=`"Subtle+corporate+dashboard+background+with+tint+showing+a+calm+corporate+setting"`  
   onerror handler for graceful fallback.  
  - Position the image absolutely behind other content.  
  - **Dropdown Menus:**  
  - Medicine dropdown (options: All, M01AB, …, R03).  
  - Month dropdown (options: All, January (01) … December (12)).  
  - Week dropdown (options: All, 1, 2, 3, 4) enabled only if month ≠ "All".  
  - **Toggle Button:**  
  - Allow switching between Table View and Graph (line chart) View.  
  - **Graph View:**  
  - Use Recharts LineChart to show monthly trend for the selected medicine (use API GET /api/sales with appropriate query parameters).  
  - **Table View:**  
  - Render a table that shows daily breakdown:  
   - If “All” weeks: list days from 1 to last day of the month with sales (computed as monthlySales/daysInMonth).  
   - If a specific week is selected: list only the days in that week’s range.  
  - **Recommendation Panel:**  
  - Fetch from GET /api/recommendations and render the list of insights styled with TailwindCSS.  
- **State and Error Handling:**  
  - Use React useState and useEffect for fetching data on dropdown changes.  
  - Display error messages if API calls fail and show loading states appropriately.  
- **General Styling:**  
  - Use TailwindCSS classes for margin, padding, font, and responsive layout.  
  - Ensure modern, clean UI with proper spacing and typography.

---

## Summary

- The backend includes a CSV data file with 2025 sales data, an Express server (server.js) and a router (sales.js) handling /api/medicines, /api/sales, and /api/recommendations with robust error handling.  
- Sales endpoint filters data for 2025, computes monthly totals, and dynamically creates a daily breakdown based on week selection.  
- The frontend, built with React + Vite, provides a Dashboard page with modern TailwindCSS styling, dropdowns for medicine, month, and optionally week selection, and a toggle between table and graph views.  
- A background image is added using a placeholder URL with a detailed alt text and graceful fallback.  
- Recharts is used for a line chart in the graph view while the table displays daily sales breakdown according to selections.  
- All code changes follow best practices and are future-proof for an upgrade to MySQL.  
- The complete project scaffold is packaged for zip delivery.
