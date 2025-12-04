interface ScanLogData {
  serialNumber: string;
  scanEvent: string;
  location: string;
  timestamp: string;
  clientId?: string;
}

const REQUEST_TIMEOUT_MS = 30000; // 30 seconds

export class GoogleSheetClient {
  private scriptUrl: string;

  constructor(scriptUrl: string) {
    if (!scriptUrl) {
      throw new Error('GOOGLE_SCRIPT_API_KEY environment variable is not set');
    }
    this.scriptUrl = scriptUrl;
  }

  private async makeRequest(action: string, payload?: any): Promise<any> {
    try {
      console.log(`[GOOGLE_SHEETS_API] ${action}:`, payload || 'no payload');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          payload
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`[GOOGLE_SHEETS_API] ${action} response:`, result);

      if (!result.success) {
        throw new Error(result.error || 'Unknown error from Google Sheets API');
      }

      return result;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error(`[GOOGLE_SHEETS_API_ERROR] ${action} timed out after ${REQUEST_TIMEOUT_MS}ms`);
        throw new Error(`Request timed out. Please try again.`);
      }
      console.error(`[GOOGLE_SHEETS_API_ERROR] ${action}:`, error);
      throw new Error(`Failed to ${action}: ${error.message}`);
    }
  }

  async addScan(serialNumber: string, scanEvent: string, location: string, clientId?: string): Promise<any> {
    return this.makeRequest('addScan', {
      serialNumber,
      scanEvent,
      location,
      timestamp: new Date().toISOString(),
      b2bClientId: clientId
    });
  }

  async getLogs(): Promise<any> {
    const response = await fetch(`${this.scriptUrl}?action=getLogs`, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch logs');
    }

    return result;
  }

  async clearLogs(): Promise<any> {
    return this.makeRequest('clearLogs');
  }

  async getSummary(): Promise<any> {
    const response = await fetch(`${this.scriptUrl}?action=getSummary`, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch summary');
    }

    return result;
  }

  async getProducts(): Promise<any> {
    const response = await fetch(`${this.scriptUrl}?action=getProducts`, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch products');
    }

    return result;
  }

  async addProduct(product: any): Promise<any> {
    return this.makeRequest('addProduct', product);
  }

  async deleteProduct(productId: string): Promise<any> {
    return this.makeRequest('deleteProduct', { productId });
  }

  async getUsers(): Promise<any> {
    const response = await fetch(`${this.scriptUrl}?action=getUsers`, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch users');
    }

    return result;
  }

  async getB2BClients(): Promise<any> {
    const response = await fetch(`${this.scriptUrl}?action=getB2BClients`, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch B2B clients');
    }

    return result;
  }
}
