/**
 * StockLens Backend for Google Sheets
 *
 * This script acts as the API backend for the StockLens application,
 * connecting it to a Google Sheet for data storage and retrieval.
 * It includes caching to improve performance and prevent timeouts.
 */
// --- CONFIGURATION ---
const LOG_SHEET_NAME = 'Scanned Inventory Log';
const PRODUCT_SHEET_NAME = 'Master Product List';
const SUMMARY_SHEET_NAME = 'Live Inventory Dashboard';
const USER_SHEET_NAME = 'Users';
const CAKE_STATUS_SHEET_NAME = 'Cake Status Dashboard';
const LIVE_OPS_SHEET_NAME = 'Live Operations Dashboard';
const B2B_CLIENTS_SHEET_NAME = 'B2B Clients';
const CACHE_EXPIRATION_SECONDS = 3600; // 1 hour
// --- WEB APP ENTRY POINTS ---
/**
 * Handles POST requests to the web app.
 */
function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    let result;
    switch (action) {
      case 'addScan':
        result = addScan(request.payload);
        break;
      case 'addProduct':
        result = addProduct(request.payload);
        break;
      case 'deleteProduct':
        result = deleteProduct(request.payload);
        break;
      case 'clearLogs':
        result = clearLogs();
        break;
      default:
        throw new Error('Invalid action for POST request: ' + action);
    }
    return createJsonResponse({ success: true, data: result });
  } catch (error) {
    Logger.log(error);
    return createJsonResponse({ success: false, error: error.message });
  }
}
/**
 * Handles GET requests to the web app.
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    let result;
    switch (action) {
      case 'getLogs':
        result = withCache('logs', getLogs);
        break;
      case 'getProducts':
        result = withCache('products', getProducts);
        break;
      case 'getSummary':
        result = withCache('summary', getSummary);
        break;
      case 'getUsers':
        result = withCache('users', getUsers);
        break;
      case 'getCakeStatus':
        result = withCache('cake_status', getCakeStatus);
        break;
      case 'getLiveOperationsData':
        result = withCache('live_ops', getLiveOperationsData);
        break;
      case 'getB2BClients':
        result = withCache('b2b_clients', getB2BClients);
        break;
      default:
        throw new Error('Invalid action for GET request: ' + action);
    }
    return createJsonResponse({ success: true, data: result });
  } catch (error) {
    Logger.log(error);
    return createJsonResponse({ success: false, error: error.message });
  }
}
// --- HELPER FUNCTIONS ---
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
function getSheetAndCreate(sheetName, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
    }
  }
  return sheet;
}
// --- CACHING LOGIC ---
function withCache(key, fetchFunction) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(key);
  if (cached != null) {
    return JSON.parse(cached);
  }
  const result = fetchFunction();
  cache.put(key, JSON.stringify(result), CACHE_EXPIRATION_SECONDS);
  return result;
}
function clearCache(keys) {
  const cache = CacheService.getScriptCache();
  if (Array.isArray(keys)) {
    cache.removeAll(keys);
  } else {
    cache.remove(keys);
  }
}
// --- CORE LOGIC: SCANS ---
function addScan(payload) {
  if (!payload || !payload.serialNumber || !payload.scanEvent || !payload.location) {
    throw new Error('Serial number, scan event, and location are required.');
  }
  const sheet = getSheetAndCreate(LOG_SHEET_NAME, ['Timestamp', 'SerialNumber', 'ScanEvent', 'Location', 'B2BClientId']);
  const timestamp = new Date();
  const b2bClientId = payload.b2bClientId || '';
  sheet.appendRow([timestamp, payload.serialNumber, payload.scanEvent, payload.location, b2bClientId]);
  updateCakeStatus(payload.serialNumber, payload.scanEvent, payload.location, timestamp);
  updateLiveInventoryCounts(payload.scanEvent);
  clearCache(['logs', 'summary', 'cake_status', 'live_ops']);
  return {
    serialNumber: payload.serialNumber,
    timestamp: timestamp.toISOString(),
    scanEvent: payload.scanEvent,
    location: payload.location,
    b2bClientId: b2bClientId
  };
}
function getLogs() {
  const sheet = getSheetAndCreate(LOG_SHEET_NAME, ['Timestamp', 'SerialNumber', 'ScanEvent', 'Location', 'B2BClientId']);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0].map(h => h.trim());
  return data.slice(1).map(row => ({
    timestamp: new Date(row[headers.indexOf('Timestamp')]).toISOString(),
    serialNumber: row[headers.indexOf('SerialNumber')],
    scanEvent: row[headers.indexOf('ScanEvent')],
    location: row[headers.indexOf('Location')] || 'N/A',
    b2bClientId: row[headers.indexOf('B2BClientId')] || undefined
  })).reverse();
}
function clearLogs() {
  const sheet = getSheetAndCreate(LOG_SHEET_NAME);
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
  const cakeStatusSheet = getSheetAndCreate(CAKE_STATUS_SHEET_NAME);
  if (cakeStatusSheet.getLastRow() > 1) {
    cakeStatusSheet.getRange(2, 1, cakeStatusSheet.getLastRow() - 1, cakeStatusSheet.getLastColumn()).clearContent();
  }
  clearCache(['logs', 'summary', 'cake_status', 'live_ops']);
  return { message: 'Logs cleared successfully.' };
}
// --- CORE LOGIC: DASHBOARDS ---
function updateCakeStatus(serialNumber, scanEvent, location, timestamp) {
  const sheet = getSheetAndCreate(CAKE_STATUS_SHEET_NAME, ['SerialNumber', 'CurrentLocation', 'Status', 'LastUpdate']);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const serialIndex = headers.indexOf('SerialNumber');
  let status = scanEvent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  let rowIndex = data.findIndex(row => row[serialIndex] === serialNumber);
  if (rowIndex === -1) {
    sheet.appendRow([serialNumber, location, status, timestamp]);
  } else {
    sheet.getRange(rowIndex + 1, 1, 1, 4).setValues([[serialNumber, location, status, timestamp]]);
  }
}
function updateLiveInventoryCounts(scanEvent) {
  const sheet = getSheetAndCreate(LIVE_OPS_SHEET_NAME, ['Metric', 'Value']);
  const data = sheet.getRange('A2:B' + sheet.getLastRow()).getValues();
  const metricMap = new Map(data.map(row => [row[0].toString().trim(), row[1]]));
  const rowIndexMap = new Map(data.map((row, i) => [row[0].toString().trim(), i + 2]));
  const warehouseMetric = 'In Production Warehouse';
  const warehouseRow = rowIndexMap.get(warehouseMetric);

  if (scanEvent === 'PRODUCTION_SCAN') {
    if (warehouseRow) {
      const currentWarehouseStock = Number(metricMap.get(warehouseMetric)) || 0;
      sheet.getRange(warehouseRow, 2).setValue(currentWarehouseStock + 1);
    }
    return;
  }

  const outletEvents = {
    'BOUTIQUE_STOCK_SCAN': 'Stock at Boutique',
    'MARCHE_STOCK_SCAN': 'Stock at Marche',
    'SALEYA_STOCK_SCAN': 'Stock at Saleya'
  };

  const outletMetric = outletEvents[scanEvent];
  if (!outletMetric) {
    return; // Not a relevant scan event for this function.
  }

  const outletRow = rowIndexMap.get(outletMetric);

  if (warehouseRow) {
    const currentWarehouseStock = Number(metricMap.get(warehouseMetric)) || 0;
    sheet.getRange(warehouseRow, 2).setValue(Math.max(0, currentWarehouseStock - 1));
  }
  if (outletRow) {
    const currentOutletStock = Number(metricMap.get(outletMetric)) || 0;
    sheet.getRange(outletRow, 2).setValue(currentOutletStock + 1);
  }
}
function getCakeStatus() {
  const sheet = getSheetAndCreate(CAKE_STATUS_SHEET_NAME, ['SerialNumber', 'CurrentLocation', 'Status', 'LastUpdate']);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => ({
    serialNumber: row[headers.indexOf('SerialNumber')],
    currentLocation: row[headers.indexOf('CurrentLocation')],
    status: row[headers.indexOf('Status')],
    lastUpdate: (date => date.getTime() ? date.toISOString() : null)(new Date(row[headers.indexOf('LastUpdate')]))
  }));
}
function getLiveOperationsData() {
  const sheet = getSheetAndCreate(LIVE_OPS_SHEET_NAME);
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
  const dataMap = data.reduce((map, row) => {
    if (row[0]) { map[row[0].toString().trim()] = row[1]; }
    return map;
  }, {});
  const keyMap = {
    producedToday: "Cakes Produced Today", totalProduced: "Total Cakes Produced",
    inProductionWarehouse: "In Production Warehouse", inTransit: "In Transit to Outlets",
    atBoutique: "Stock at Boutique", atMarche: "Stock at Marche", atSaleya: "Stock at Saleya",
    soldTodayB2C: "Cakes Sold Today (B2C)", deliveredTodayB2B: "Cakes Delivered Today (B2B)",
    totalSoldDelivered: "Total Cakes Sold/Delivered"
  };
  return {
    productionSummary: { producedToday: dataMap[keyMap.producedToday] || 0, totalProduced: dataMap[keyMap.totalProduced] || 0 },
    inventoryByLocation: { inProductionWarehouse: dataMap[keyMap.inProductionWarehouse] || 0, inTransit: dataMap[keyMap.inTransit] || 0, atBoutique: dataMap[keyMap.atBoutique] || 0, atMarche: dataMap[keyMap.atMarche] || 0, atSaleya: dataMap[keyMap.atSaleya] || 0 },
    salesSummary: { soldTodayB2C: dataMap[keyMap.soldTodayB2C] || 0, deliveredTodayB2B: dataMap[keyMap.deliveredTodayB2B] || 0, totalSoldDelivered: dataMap[keyMap.totalSoldDelivered] || 0 }
  };
}
// --- CORE LOGIC: USERS & CLIENTS ---
function getUsers() {
    const sheet = getSheetAndCreate(USER_SHEET_NAME, ['email', 'name', 'role', 'location', 'password']);
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    const headers = data[0].map(h => h.trim());
    return data.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, i) => { obj[header] = row[i]; });
        return obj;
    }).filter(u => u.email);
}
function getB2BClients() {
  const sheet = getSheetAndCreate(B2B_CLIENTS_SHEET_NAME, ['clientId', 'clientName', 'contactPerson', 'address']);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0].map(h => h.trim());
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, i) => { obj[header] = row[i]; });
    return obj;
  }).filter(c => c.clientId);
}
// --- CORE LOGIC: PRODUCTS ---
function getProducts() {
  const sheet = getSheetAndCreate(PRODUCT_SHEET_NAME, ['id', 'name', 'category', 'unitOfMeasure', 'unitCost', 'supplierName', 'reorderLevel', 'reorderQuantity', 'storageLocation', 'shelfLifeDays', 'isPerishable']);
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => h.trim());
  const idIndex = headers.indexOf('id');
  if (idIndex === -1) throw new Error('Product sheet must have an "id" column.');
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      if (header === 'isPerishable') { obj[header] = row[i] === true || String(row[i]).toLowerCase() === 'true'; }
      else if (['unitCost', 'reorderLevel', 'reorderQuantity', 'shelfLifeDays'].includes(header)) { obj[header] = parseFloat(row[i]) || 0; }
      else { obj[header] = row[i]; }
    });
    return obj;
  }).filter(p => p.id);
}
function addProduct(product) {
  const sheet = getSheetAndCreate(PRODUCT_SHEET_NAME, ['id', 'name', 'category', 'unitOfMeasure', 'unitCost', 'supplierName', 'reorderLevel', 'reorderQuantity', 'storageLocation', 'shelfLifeDays', 'isPerishable']);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idIndex = headers.indexOf('id');
  if (!product.id) throw new Error('Product ID is required.');
  const data = sheet.getDataRange().getValues();
  const existingRowIndex = data.findIndex(row => row[idIndex] === product.id);
  const newRow = headers.map(header => product[header] !== undefined ? product[header] : "");
  if (existingRowIndex > -1) {
    sheet.getRange(existingRowIndex + 1, 1, 1, newRow.length).setValues([newRow]);
  } else {
    sheet.appendRow(newRow);
  }
  clearCache(['products', 'summary']);
  return getProducts();
}
function deleteProduct(payload) {
  if (!payload || !payload.productId) { throw new Error('Product ID is required for deletion.'); }
  const sheet = getSheetAndCreate(PRODUCT_SHEET_NAME);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idIndex = headers.indexOf('id');
  const data = sheet.getDataRange().getValues();
  const rowIndexToDelete = data.findIndex(row => row[idIndex] === payload.productId);
  if (rowIndexToDelete > -1) {
    sheet.deleteRow(rowIndexToDelete + 1);
  } else {
    throw new Error('Product not found.');
  }
  clearCache(['products', 'summary']);
  return getProducts();
}
// --- CORE LOGIC: SUMMARY ---
function getSummary() {
  const sheet = getSheetAndCreate(SUMMARY_SHEET_NAME, ['productId', 'productName', 'count']);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0].map(h => h.trim());
  return data.slice(1).map(row => ({
    productId: row[headers.indexOf('productId')],
    productName: row[headers.indexOf('productName')],
    count: parseInt(row[headers.indexOf('count')], 10) || 0
  })).filter(item => item.productId && item.count > 0);
}