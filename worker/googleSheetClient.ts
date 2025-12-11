const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzPS5aPW0x2fXmu2j1zcsSeo4eVi7fzERl63y0VX9qXEcWgKYZ9QGHf07jO2cBp-Uyf1Q/exec';

interface ScanLogData {
  serialNumber: string;
  scanEvent: string;
  location: string;
  timestamp: string;
  clientId?: string;
}

export class GoogleSheetClient {
  constructor(private apiKey: string) {}

  async addScan(serialNumber: string, scanEvent: string, location: string, clientId?: string): Promise<any> {
    return this.makeRequest({
      action: 'logScan',
      serialNumber,
      scanEvent,
      location,
      clientId,
      timestamp: new Date().toISOString()
    });
  }

  async getLogs(): Promise<any> {
    return this.makeRequest({ action: 'getLogs' });
  }

  async clearLogs(): Promise<any> {
    return this.makeRequest({ action: 'clearLogs' });
  }

  async getSummary(): Promise<any> {
    return this.makeRequest({ action: 'getSummary' });
  }

  async getProducts(): Promise<any> {
    return this.makeRequest({ action: 'getProducts' });
  }

  async addProduct(product: any): Promise<any> {
    return this.makeRequest({ action: 'addProduct', product });
  }

  async deleteProduct(id: string): Promise<any> {
    return this.makeRequest({ action: 'deleteProduct', id });
  }

  async getUsers(): Promise<any> {
    return this.makeRequest({ action: 'getUsers' });
  }

  async getB2BClients(): Promise<any> {
    return this.makeRequest({ action: 'getB2BClients' });
  }

  async getCakeStatus(): Promise<any> {
    return this.makeRequest({ action: 'getCakeStatus' });
  }

  async getLiveOperationsData(): Promise<any> {
    return this.makeRequest({ action: 'getLiveOperationsData' });
  }

  private async makeRequest(payload: any): Promise<any> {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('[GOOGLE_SHEETS_API_ERROR]', error);
      throw new Error(`API request failed: ${error.message}`);
    }
  }
}

// Keep existing functions for backward compatibility if needed
export async function logScanToGoogleSheets(data: ScanLogData): Promise<any> {
  const client = new GoogleSheetClient('');
  return client.addScan(data.serialNumber, data.scanEvent, data.location, data.clientId);
}

export async function getInventoryData(): Promise<any> {
  const client = new GoogleSheetClient('');
  return client.getProducts();
}
