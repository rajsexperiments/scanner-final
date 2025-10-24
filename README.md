# StockLens: QR Inventory Scanner
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/rajsexperiments/inv-tracker)
StockLens is a sleek, minimalist web application designed for rapid inventory management. It transforms any smartphone or tablet into a powerful QR code scanner. Staff can scan product QR codes with a specific event type (e.g., 'Production Scan', 'Warehouse Exit'), and each scan is instantly logged with a timestamp to a central Google Sheet. Users log in with credentials defined in the Google Sheet, enabling role-based access. The application provides a real-time inventory log, an aggregated summary view, and live operational dashboards, allowing for effortless physical inventory counts and tracking.
## Key Features
- **Event-Based QR Scanning**: Log scans with context (Production, Warehouse, Sales) for a complete lifecycle view.
- **Google Sheets Backend**: Uses Google Sheets as a free, powerful, and collaborative database.
- **Live Dashboards**: Real-time views for individual cake status and high-level operational summaries.
- **Multi-Warehouse Support**: Log scans with location data based on user profiles.
- **Password Authentication & RBAC**: Log in with an email and password defined in the Google Sheet to access role-specific features.
- **Master Product Management**: A dedicated settings page to manage a master list of all products.
- **B2B Client Management**: Manage B2B clients and associate them with delivery scans.
- **In-App User Documentation**: A comprehensive guide, FAQ, and best practices section available directly within the application.
- **Mobile-First & Responsive**: Flawless user experience on any device, from smartphones to desktops.
- **Minimalist & Polished UI**: A beautiful, intuitive interface built with shadcn/ui and Tailwind CSS for maximum usability.
## Technology Stack
- **Frontend**: React, Vite, React Router, Tailwind CSS, shadcn/ui, Zustand, Framer Motion, Sonner, html5-qrcode
- **Backend**: Cloudflare Workers (as a proxy to Google Sheets), Hono, Google Apps Script
- **Language**: TypeScript
## Google Sheets Integration Setup (Required)
This application uses Google Sheets as its database. You must set up your own sheet and deploy a script to act as the API.
### Step 1: Create Your Google Sheet
1.  Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet. Name it "StockLens Inventory".
2.  Create seven tabs (sheets) at the bottom with these exact names:
    *   `Master Product List`
    *   `Scanned Inventory Log`
    *   `Live Inventory Dashboard`
    *   `Users`
    *   `Cake Status Dashboard`
    *   `Live Operations Dashboard`
    *   `B2B Clients`
3.  **Set up the headers for each sheet:**
    *   **`Master Product List`**:
      `id`, `name`, `category`, `unitOfMeasure`, `unitCost`, `supplierName`, `reorderLevel`, `reorderQuantity`, `storageLocation`, `shelfLifeDays`, `isPerishable`
    *   **`Scanned Inventory Log`**:
      `Timestamp`, `SerialNumber`, `ScanEvent`, `Location`, `B2BClientId`
    *   **`Live Inventory Dashboard`**:
      `productId`, `productName`, `count`
    *   **`Users`**:
      `email`, `name`, `role`, `location`, `password`
    *   **`Cake Status Dashboard`**:
      `SerialNumber`, `CurrentLocation`, `Status`, `LastUpdate`
    *   **`Live Operations Dashboard`**:
      `Metric`, `Value` (Populate with the metrics below)
    *   **`B2B Clients`**:
      `clientId`, `clientName`, `contactPerson`, `address`
| Metric | Value |
| :--- | :--- |
| Cakes Produced Today | |
| Total Cakes Produced | |
| In Production Warehouse | |
| In Transit to Outlets | |
| Stock at Boutique | |
| Stock at Marche | |
| Stock at Saleya | |
| Cakes Sold Today (B2C) | |
| Cakes Delivered Today (B2B) | |
| Total Cakes Sold/Delivered | |
4.  **Populate the `Users` and `B2B Clients` sheets with some mock data.** The `role` must be either `Warehouse Manager` or `Scanner`.
    **Users Example:**
| email | name | role | location | password |
| :--- | :--- | :--- | :--- | :--- |
| manager@example.com | Alex Chen | Warehouse Manager | Main Warehouse | pass123 |
| scanner1@example.com | Ben Carter | Scanner | Main Warehouse | pass123 |
| scanner2@example.com | Chloe Davis | Scanner | Boutique | pass123 |
    **B2B Clients Example:**
| clientId | clientName | contactPerson | address |
| :--- | :--- | :--- | :--- |
| B2B-001 | Grand Hotel | Maria Rossi | 123 Ocean Drive |
| B2B-002 | City Cafe | John Smith | 456 Main Street |
5.  **Add the formula to `Live Inventory Dashboard`**:
    In cell `A2`, paste this formula to automatically calculate your inventory summary.
    ```excel
    =QUERY('Scanned Inventory Log'!B:B, "SELECT REGEXEXTRACT(B, '^(.*)-[^-]*'), COUNT(B) WHERE B IS NOT NULL GROUP BY REGEXEXTRACT(B, '^(.*)-[^-]*') LABEL REGEXEXTRACT(B, '^(.*)-[^-]*') 'productId', COUNT(B) 'count'")
    ```
    In cell `B2`, paste this formula and drag it down to look up product names:
    ```excel
    =IFNA(VLOOKUP(A2, 'Master Product List'!A:B, 2, FALSE), A2)
    ```
### Step 1.A: Add Dashboard Formulas
In the `Live Operations Dashboard` sheet, paste the following formulas into the `Value` column (column B) for each corresponding metric in column A.
**Note**: The inventory location metrics (`In Production Warehouse`, `Stock at Boutique`, etc.) are now calculated and updated automatically by the backend script during outlet scan events.
| Metric (Column A) | Formula (Paste into Column B) |
| :--- | :--- |
| Cakes Produced Today | `=COUNTIFS('Scanned Inventory Log'!C:C, "PRODUCTION_SCAN", 'Scanned Inventory Log'!A:A, ">="&TODAY())` |
| Total Cakes Produced | `=COUNTIF('Scanned Inventory Log'!C:C, "PRODUCTION_SCAN")` |
| In Transit to Outlets | `=COUNTIF('Cake Status Dashboard'!C:C, "Warehouse Exit")` |
| Cakes Sold Today (B2C) | `=COUNTIFS('Scanned Inventory Log'!C:C, "SALE_B2C", 'Scanned Inventory Log'!A:A, ">="&TODAY())` |
| Cakes Delivered Today (B2B) | `=COUNTIFS('Scanned Inventory Log'!C:C, "DELIVERY_B2B", 'Scanned Inventory Log'!A:A, ">="&TODAY())` |
| Total Cakes Sold/Delivered | `=SUM(COUNTIF('Scanned Inventory Log'!C:C, "SALE_B2C"), COUNTIF('Scanned Inventory Log'!C:C, "DELIVERY_B2B"))` |
### Step 2: Deploy the Google Apps Script
1.  In your Google Sheet, go to **Extensions > Apps Script**.
2.  Delete any existing code in the `Code.gs` file.
3.  Copy the entire content of the `google-apps-script/code.gs` file from this project.
4.  Paste the copied code into the Apps Script editor.
5.  Click the **Deploy** button (top right) and select **New deployment**.
6.  Click the gear icon next to "Select type" and choose **Web app**.
7.  In the "Who has access" dropdown, select **Anyone**.
8.  Click **Deploy**.
9.  A popup will appear asking for authorization. Click **Authorize access** and follow the prompts to allow the script to run.
10. After authorization, a "Deployment successfully updated" popup will appear. **Copy the Web app URL**. This is your API endpoint.
### Step 3: Configure the Application
1.  Open the file `worker/googleSheetClient.ts` in your code editor.
2.  Find the line `const GOOGLE_SCRIPT_URL = '...';`.
3.  **Replace** the URL with the Web app URL you copied in the previous step.
4.  Save the file.
Your application is now configured to use your Google Sheet as its backend!
## Scan Event Types
- **PRODUCTION_SCAN**: Scanned when a cake is produced.
- **WAREHOUSE_ENTRY**: Scanned when a cake enters the main warehouse.
- **WAREHOUSE_EXIT**: Scanned when a cake leaves the main warehouse for an outlet.
- **BOUTIQUE_STOCK_SCAN**: Scanned upon arrival at the Boutique.
- **MARCHE_STOCK_SCAN**: Scanned upon arrival at the Marche.
- **SALEYA_STOCK_SCAN**: Scanned upon arrival at the Saleya.
- **SALE_B2C**: Scanned when sold to a direct customer.
- **DELIVERY_B2B**: Scanned when delivered to a business client.
## Development
To start the development server, run:
```bash
bun dev
```
## Deployment
To deploy to Cloudflare, run:
```bash
bun deploy