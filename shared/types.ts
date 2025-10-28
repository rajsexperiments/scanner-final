export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type ScanEvent =
  | 'PRODUCTION_SCAN'
  | 'WAREHOUSE_ENTRY'
  | 'WAREHOUSE_EXIT'
  | 'BOUTIQUE_STOCK_SCAN'
  | 'MARCHE_STOCK_SCAN'
  | 'SALEYA_STOCK_SCAN'
  | 'SALE_B2C'
  | 'DELIVERY_B2B';
export interface ScanLog {
  serialNumber: string;
  timestamp: string;
  scanEvent: ScanEvent;
  location: string;
  clientId?: string;
}
export interface InventorySummaryItem {
  productId: string;
  productName: string;
  count: number;
}
export interface Product {
  id: string;
  name: string;
  category?: string;
  unitOfMeasure?: string;
  unitCost?: number;
  supplierName?: string;
  reorderLevel?: number;
  reorderQuantity?: number;
  storageLocation?: string;
  shelfLifeDays?: number;
  isPerishable: boolean;
}
export interface User {
  email: string;
  name: string;
  role: 'Warehouse Manager' | 'Scanner';
  location: string;
  password?: string;
}
export interface CakeStatus {
  serialNumber: string;
  currentLocation: string;
  status: string;
  lastUpdate: string;
}
export interface ProductionSummary {
  producedToday: number;
  totalProduced: number;
}
export interface InventoryByLocation {
  inProductionWarehouse: number;
  inTransit: number;
  atBoutique: number;
  atMarche: number;
  atSaleya: number;
}
export interface SalesSummary {
  soldTodayB2C: number;
  deliveredTodayB2B: number;
  totalSoldDelivered: number;
}
export interface LiveOperationsData {
  productionSummary: ProductionSummary;
  inventoryByLocation: InventoryByLocation;
  salesSummary: SalesSummary;
}
export interface B2BClient {
  clientId: string;
  clientName: string;
  contactPerson: string;
  address: string;
}
