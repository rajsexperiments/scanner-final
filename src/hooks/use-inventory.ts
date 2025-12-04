import { create } from 'zustand';
import { toast } from 'sonner';
import type { ScanLog, InventorySummaryItem, Product, ScanEvent, B2BClient } from '@shared/types';

interface InventoryState {
  logs: ScanLog[];
  summary: InventorySummaryItem[];
  products: Product[];
  b2bClients: B2BClient[];
  loadingLogs: boolean;
  loadingSummary: boolean;
  loadingProducts: boolean;
  loadingB2BClients: boolean;
  fetchLogs: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchB2BClients: () => Promise<void>;
  addScan: (serialNumber: string, scanEvent: ScanEvent, location: string, clientId?: string) => Promise<void>;
  clearLogs: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
}
export const useInventoryStore = create<InventoryState>((set, get) => ({
  logs: [],
  summary: [],
  products: [],
  b2bClients: [],
  loadingLogs: false,
  loadingSummary: false,
  loadingProducts: false,
  loadingB2BClients: false,

  fetchLogs: async () => {
    set({ loadingLogs: true });
    try {
      const res = await fetch('/api/logs');
      const result = await res.json();
      console.log('[FETCH_LOGS] Response:', result);

      if (result.success && result.data) {
        set({ logs: result.data });
      } else if (result.error) {
        toast.error(`Failed to fetch logs: ${result.error}`);
      } else {
        toast.error('Failed to fetch logs: Unknown error');
      }
    } catch (e: any) {
      console.error('[FETCH_LOGS_ERROR]', e);
      toast.error(`Error fetching logs: ${e.message || 'Unknown error'}`);
    } finally {
      set({ loadingLogs: false });
    }
  },

  fetchSummary: async () => {
    set({ loadingSummary: true });
    try {
      const res = await fetch('/api/summary');
      const result = await res.json();
      if (result.success) set({ summary: result.data });
      else toast.error(`Failed to fetch summary: ${result.error}`);
    } catch (e) {
      toast.error('An error occurred while fetching summary.');
    } finally {
      set({ loadingSummary: false });
    }
  },
  fetchProducts: async () => {
    set({ loadingProducts: true });
    try {
      const res = await fetch('/api/products');
      const result = await res.json();
      if (result.success) set({ products: result.data });
      else toast.error(`Failed to fetch products: ${result.error}`);
    } catch (e) {
      toast.error('An error occurred while fetching products.');
    } finally {
      set({ loadingProducts: false });
    }
  },

  fetchB2BClients: async () => {
    set({ loadingB2BClients: true });
    try {
      const res = await fetch('/api/b2b-clients');
      const result = await res.json();
      if (result.success) set({ b2bClients: result.data });
      else toast.error(`Failed to fetch B2B clients: ${result.error}`);
    } catch (e) {
      toast.error('An error occurred while fetching B2B clients.');
    } finally {
      set({ loadingB2BClients: false });
    }
  },
  addScan: async (serialNumber: string, scanEvent: ScanEvent, location: string, clientId?: string) => {
    try {
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber, scanEvent, location, clientId }),
      });
      const result = await res.json();
      if (result.success) {
        set(state => ({ logs: [result.data, ...state.logs] }));
        toast.success(`Logged: ${serialNumber}`);
        get().fetchSummary();
      } else {
        toast.error(`Failed to log scan: ${result.error || 'Unknown error'}`);
      }
    } catch (e) {
      toast.error('An error occurred while logging the scan.');
    }
  },
  clearLogs: async () => {
    set({ loadingLogs: true, loadingSummary: true });
    try {
      const res = await fetch('/api/logs/clear', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        set({ logs: [], summary: [] });
        toast.success('Inventory log cleared.');
        get().fetchSummary();
      } else {
        toast.error(`Failed to clear logs: ${result.error}`);
      }
    } catch (e) {
      toast.error('An error occurred while clearing logs.');
    } finally {
      set({ loadingLogs: false, loadingSummary: false });
    }
  },
  addProduct: async (product: Product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const result = await res.json();
      if (result.success) {
        set({ products: result.data });
        toast.success(`Product "${product.name}" saved.`);
        get().fetchSummary();
      } else {
        toast.error(`Failed to save product: ${result.error || 'Unknown error'}`);
      }
    } catch (e) {
      toast.error('An error occurred while saving the product.');
    }
  },
  deleteProduct: async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        set({ products: result.data });
        toast.success('Product deleted.');
        get().fetchSummary();
      } else {
        toast.error(`Failed to delete product: ${result.error}`);
      }
    } catch (e) {
      toast.error('An error occurred while deleting the product.');
    }
  },
}));
