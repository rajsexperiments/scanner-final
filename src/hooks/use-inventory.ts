import { create } from 'zustand';
import { toast } from 'sonner';
import type { ScanLog, InventorySummaryItem, Product, ScanEvent, CakeStatus, LiveOperationsData, B2BClient } from '@shared/types';
interface InventoryState {
  logs: ScanLog[];
  summary: InventorySummaryItem[];
  products: Product[];
  cakeStatus: CakeStatus[];
  liveOperationsData: LiveOperationsData | null;
  b2bClients: B2BClient[];
  loadingLogs: boolean;
  loadingSummary: boolean;
  loadingProducts: boolean;
  loadingCakeStatus: boolean;
  loadingLiveOperations: boolean;
  loadingB2BClients: boolean;
  fetchLogs: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchCakeStatus: () => Promise<void>;
  fetchLiveOperationsData: () => Promise<void>;
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
  cakeStatus: [],
  liveOperationsData: null,
  b2bClients: [],
  loadingLogs: false,
  loadingSummary: false,
  loadingProducts: false,
  loadingCakeStatus: false,
  loadingLiveOperations: false,
  loadingB2BClients: false,
  fetchLogs: async () => {
    set({ loadingLogs: true });
    try {
      const res = await fetch('/api/logs');
      const result = await res.json();
      if (result.success) set({ logs: result.data });
      else toast.error(`Failed to fetch logs: ${result.error}`);
    } catch (e) {
      toast.error('An error occurred while fetching logs.');
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
  fetchCakeStatus: async () => {
    set({ loadingCakeStatus: true });
    try {
      const res = await fetch('/api/cake-status');
      const result = await res.json();
      if (result.success) set({ cakeStatus: result.data });
      else toast.error(`Failed to fetch cake status: ${result.error}`);
    } catch (e) {
      toast.error('An error occurred while fetching cake status.');
    } finally {
      set({ loadingCakeStatus: false });
    }
  },
  fetchLiveOperationsData: async () => {
    set({ loadingLiveOperations: true });
    try {
      const res = await fetch('/api/live-operations');
      const result = await res.json();
      if (result.success) set({ liveOperationsData: result.data });
      else toast.error(`Failed to fetch live operations data: ${result.error}`);
    } catch (e) {
      toast.error('An error occurred while fetching live operations data.');
    } finally {
      set({ loadingLiveOperations: false });
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
        get().fetchCakeStatus();
        get().fetchLiveOperationsData();
      } else {
        toast.error(`Failed to log scan: ${result.error || 'Unknown error'}`);
      }
    } catch (e) {
      toast.error('An error occurred while logging the scan.');
    }
  },
  clearLogs: async () => {
    set({ loadingLogs: true, loadingSummary: true, loadingCakeStatus: true });
    try {
      const res = await fetch('/api/logs/clear', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        set({ logs: [], summary: [], cakeStatus: [] });
        toast.success('Inventory log cleared.');
        get().fetchSummary();
        get().fetchLiveOperationsData();
      } else {
        toast.error(`Failed to clear logs: ${result.error}`);
      }
    } catch (e) {
      toast.error('An error occurred while clearing logs.');
    } finally {
      set({ loadingLogs: false, loadingSummary: false, loadingCakeStatus: false });
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
