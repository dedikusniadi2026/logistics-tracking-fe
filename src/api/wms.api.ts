import api from "./axios";

function normalise<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray((raw as any)?.value)) return (raw as any).value as T[];
  if (Array.isArray((raw as any)?.data)) return (raw as any).data as T[];
  return [];
}

// ── Types ──────────────────────────────────────────────────────────────────
export interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  latitude?: number;
  longitude?: number;
  totalCapacity: number;
  managerName: string;
  managerPhone: string;
  status?: string;
  currentStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  id: number;
  warehouseId: number;
  sku: string;
  productName: string;
  description?: string;
  quantity: number;
  minStockLevel?: number;
  location?: string;
  barcodeValue?: string;
  warehouse?: { name: string; code: string };
  createdAt?: string;
}

export interface CreateWarehousePayload {
  name: string;
  code: string;
  address: string;
  latitude?: number;
  longitude?: number;
  totalCapacity: number;
  managerName: string;
  managerPhone: string;
}

export interface CreateInventoryPayload {
  warehouseId: number;
  sku: string;
  productName: string;
  description?: string;
  quantity: number;
  minStockLevel?: number;
  location?: string;
  barcodeValue?: string;
}

export interface AdjustStockPayload {
  adjustment: number;
  reason: string;
}

export interface ScanResult {
  found: boolean;
  item?: InventoryItem;
  message?: string;
}

// ── Warehouse CRUD ────────────────────────────────────────────────────────
export const getWarehousesApi = async (): Promise<Warehouse[]> => {
  const res = await api.get("/warehouses");
  return normalise<Warehouse>(res.data);
};

export const createWarehouseApi = async (data: CreateWarehousePayload): Promise<Warehouse> => {
  const res = await api.post("/warehouses", data);
  return res.data;
};

export const updateWarehouseApi = async (id: number, data: Partial<CreateWarehousePayload>): Promise<Warehouse> => {
  const res = await api.patch(`/warehouses/${id}`, data);
  return res.data;
};

export const deleteWarehouseApi = async (id: number): Promise<void> => {
  await api.delete(`/warehouses/${id}`);
};

// ── Inventory ──────────────────────────────────────────────────────────────
export const getWarehouseInventoryApi = async (id: number): Promise<InventoryItem[]> => {
  const res = await api.get(`/warehouses/${id}/inventory`);
  return normalise<InventoryItem>(res.data);
};

export const getLowStockApi = async (): Promise<InventoryItem[]> => {
  const res = await api.get("/warehouses/inventory/low-stock");
  return normalise<InventoryItem>(res.data);
};

export const getDistributionApi = async (): Promise<unknown[]> => {
  const res = await api.get("/warehouses/distribution");
  return normalise(res.data);
};

export const createInventoryApi = async (data: CreateInventoryPayload): Promise<InventoryItem> => {
  const res = await api.post("/warehouses/inventory", data);
  return res.data;
};

export const adjustStockApi = async (inventoryId: number, data: AdjustStockPayload): Promise<InventoryItem> => {
  const res = await api.patch(`/warehouses/inventory/${inventoryId}/adjust-stock`, data);
  return res.data;
};

export const scanBarcodeApi = async (data: { barcodeValue: string; warehouseId?: number }): Promise<ScanResult> => {
  const res = await api.post("/warehouses/scan", data);
  return res.data;
};
