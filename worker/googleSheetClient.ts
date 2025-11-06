const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'; // Replace with your actual URL

interface ScanLogData {
  serialNumber: string;
  scanEvent: string;
  location: string;
  timestamp: string;
  clientId?: string;
}

export async function logScanToGoogleSheets(data: ScanLogData): Promise<any> {
  try {
    console.log('[GOOGLE_SHEETS_API] Sending scan data:', data);

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'logScan',
        ...data
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[GOOGLE_SHEETS_API] Response:', result);
    return result;

  } catch (error: any) {
    console.error('[GOOGLE_SHEETS_API_ERROR]', error);
    throw new Error(`Failed to log scan: ${error.message}`);
  }
}

export async function getInventoryData(): Promise<any> {
  try {
    console.log('[GOOGLE_SHEETS_API] Fetching inventory data');

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getInventory'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[GOOGLE_SHEETS_API] Inventory data:', result);
    return result;

  } catch (error: any) {
    console.error('[GOOGLE_SHEETS_API_ERROR]', error);
    throw new Error(`Failed to fetch inventory: ${error.message}`);
  }
}
