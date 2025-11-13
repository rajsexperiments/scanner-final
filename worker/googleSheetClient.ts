const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzPS5aPW0x2fXmu2j1zcsSeo4eVi7fzERl63y0VX9qXEcWgKYZ9QGHf07jO2cBp-Uyf1Q/exec';

interface ScanLogData {
  serialNumber: string;
  scanEvent: string;
  location: string;
  timestamp: string;
  clientId?: string;
}

/**
 * Google Sheets API Client for Cloudflare Workers
 * Handles all communication with Google Apps Script backend
 */
export class GoogleSheetClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic GET request handler for all read operations
   */
  private async fetchData(action: string): Promise<any> {
    try {
      console.log(`[GoogleSheetClient] Fetching data for action: ${action}`);
      
      // Use GET request with query parameters (matches your doGet in Apps Script)
      const url = `${this.baseUrl}?action=${action}`;
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`[GoogleSheetClient] Response for ${action}:`, result);

      // Handle the { success: true, data: [...] } format from your Apps Script
      if (result.success) {
        return result.data || [];
      } else {
        throw new Error(result.error || `Failed to fetch ${action}`);
      }
    } catch (error: any) {
      console.error(`[GoogleSheetClient] Error fetching ${action}:`, error);
      throw new Error(`Failed to fetch ${action}: ${error.message}`);
    }
  }

  /**
   * POST request handler for write operations
   */
  private async postData(action: string, data: any): Promise<any> {
    try {
      console.log(`[GoogleSheetClient] Posting data for action: ${action}`, data);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...data
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`[GoogleSheetClient] Response for ${action}:`, result);

      if (result.success) {
        return result.data || result;
      } else {
        throw new Error(result.error || `Failed to ${action}`);
      }
    } catch (error: any) {
      console.error(`[GoogleSheetClient] Error posting ${action}:`, error);
      throw new Error(`Failed to ${action}: ${error.message}`);
    }
  }

  // ============= READ OPERATIONS (GET) =============

  /**
   * Fetch all inventory logs
   * Maps to doGet with action=getLogs
   */
  async getLogs(): Promise<any[]> {
    return this.fetchData('getLogs');
  }

  /**
   * Fetch all products from Master Product List
   * Maps to doGet with action=getProducts
   */
  async getProducts(): Promise<any[]> {
    return this.fetchData('getProducts');
  }

  /**
   * Fetch inventory summary
   * Maps to doGet with action=getSummary
   */
  async getSummary(): Promise<any[]> {
    return this.fetchData('getSummary');
  }

  /**
   * Fetch all users
   * Maps to doGet with action=getUsers
   */
  async getUsers(): Promise<any[]> {
    return this.fetchData('getUsers');
  }

  /**
   * Fetch cake status dashboard data
   * Maps to doGet with action=getCakeStatus
   */
  async getCakeStatus(): Promise<any[]> {
    return this.fetchData('getCakeStatus');
  }

  /**
   * Fetch live operations dashboard data
   * Maps to doGet with action=getLiveOperationsData
   */
  async getLiveOperationsData(): Promise<any> {
    return this.fetchData('getLiveOperationsData');
  }

  /**
   * Fetch all B2B clients
   * Maps to doGet with action=getB2BClients
   */
  async getB2BClients(): Promise<any[]> {
    return this.fetchData('getB2BClients');
  }

  /**
   * Generate weekly sales report
   * Maps to doGet with action=generateWeeklySalesReport
   */
  async generateWeeklySalesReport(): Promise<any> {
    return this.fetchData('generateWeeklySalesReport');
  }

  // ============= WRITE OPERATIONS (POST) =============

  /**
   * Log a scan to Google Sheets
   * Maps to doPost with action=logScan
   */
  async logScan(data: ScanLogData): Promise<any> {
    return this.postData('logScan', data);
  }

  /**
   * Add a new product
   * Maps to doPost with action=addProduct
   */
  async addProduct(product: any): Promise<any> {
    return this.postData('addProduct', { product });
  }

  /**
   * Update a product
   * Maps to doPost with action=updateProduct
   */
  async updateProduct(productId: string, product: any): Promise<any> {
    return this.postData('updateProduct', { productId, product });
  }

  /**
   * Delete a product
   * Maps to doPost with action=deleteProduct
   */
  async deleteProduct(productId: string): Promise<any> {
    return this.postData('deleteProduct', { productId });
  }

  /**
   * Add a new B2B client
   * Maps to doPost with action=addB2BClient
   */
  async addB2BClient(client: any): Promise<any> {
    return this.postData('addB2BClient', { client });
  }

  /**
   * Update a B2B client
   * Maps to doPost with action=updateB2BClient
   */
  async updateB2BClient(clientId: string, client: any): Promise<any> {
    return this.postData('updateB2BClient', { clientId, client });
  }

  /**
   * Delete a B2B client
   * Maps to doPost with action=deleteB2BClient
   */
  async deleteB2BClient(clientId: string): Promise<any> {
    return this.postData('deleteB2BClient', { clientId });
  }

  /**
   * Clear all logs (admin operation)
   * Maps to doPost with action=clearLogs
   */
  async clearLogs(): Promise<any> {
    return this.postData('clearLogs', {});
  }

  // ============= LEGACY METHODS (for backwards compatibility) =============

  /**
   * @deprecated Use logScan instead
   */
  async logScanToGoogleSheets(data: ScanLogData): Promise<any> {
    return this.logScan(data);
  }

  /**
   * @deprecated Use getSummary instead
   */
  async getInventoryData(): Promise<any> {
    return this.getSummary();
  }
}

// Export a singleton instance as default
const googleSheetClient = new GoogleSheetClient(GOOGLE_SCRIPT_URL);
export default googleSheetClient;

// Also export individual functions for backwards compatibility
export async function logScanToGoogleSheets(data: ScanLogData): Promise<any> {
  return googleSheetClient.logScan(data);
}

export async function getInventoryData(): Promise<any> {
  return googleSheetClient.getSummary();
}

