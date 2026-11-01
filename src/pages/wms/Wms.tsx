import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, Search, Package, Warehouse,
  AlertTriangle, QrCode, RefreshCw, Loader2, MapPin, Phone, User
} from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import { useWarehouses, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse, useCreateInventory, useAdjustStock, useLowStock } from "../../hooks/useWms";
import { getWarehouseInventoryApi, scanBarcodeApi, type ScanResult } from "../../api/wms.api";
import type { Warehouse as WHType, InventoryItem, CreateWarehousePayload } from "../../api/wms.api";
import WarehouseFormDialog from "./WarehouseFormDialog";
import InventoryFormDialog from "./InventoryFormDialog";
import AdjustStockDialog from "./AdjustStockDialog";
import DeleteConfirm from "../../components/common/DeleteConfirm";
import Pagination from "../../components/common/Pagination";

type Tab = "warehouses" | "inventory" | "barcode";

// ── Sub-tab: Warehouses ───────────────────────────────────────────────────
function WarehousesTab() {
  const { data: warehouses = [], isLoading, isError } = useWarehouses();
  const createMut = useCreateWarehouse();
  const updateMut = useUpdateWarehouse();
  const deleteMut = useDeleteWarehouse();

  const [formOpen, setFormOpen] = useState(false);
  const [editWh, setEditWh] = useState<WHType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WHType | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number | "all">(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return warehouses.filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.code.toLowerCase().includes(q) ||
      w.address.toLowerCase().includes(q)
    );
  }, [warehouses, search]);

  const paginated = perPage === "all" ? filtered : filtered.slice((page - 1) * perPage, page * perPage);

  const handleSubmit = async (data: CreateWarehousePayload) => {
    try {
      if (editWh) {
        await updateMut.mutateAsync({ id: editWh.id, data });
        toast.success("Warehouse updated");
      } else {
        await createMut.mutateAsync(data);
        toast.success("Warehouse added");
      }
      setFormOpen(false); setEditWh(null);
    } catch { toast.error("Failed to save warehouse"); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch { toast.error("Failed to delete warehouse"); }
  };

  const isMutating = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search warehouses..."
            className="pl-8 pr-4 py-1.5 text-sm bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 placeholder:text-gray-400" />
        </div>
        <button onClick={() => { setEditWh(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          <Plus size={14} /> Add Warehouse
        </button>
      </div>

      {/* Cards Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      )}
      {isError && <p className="text-sm text-red-500 text-center py-8">Failed to load warehouses</p>}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-gray-400 gap-3">
          <Warehouse size={40} className="opacity-30" />
          <p className="text-sm">{search ? "No warehouses match" : "No warehouses yet"}</p>
          <button onClick={() => { setEditWh(null); setFormOpen(true); }}
            className="text-xs text-blue-600 hover:underline">+ Add first warehouse</button>
        </div>
      )}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map(wh => (
            <div key={wh.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">{wh.name}</p>
                  <p className="text-xs text-blue-600 font-mono font-semibold">{wh.code}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditWh(wh); setFormOpen(true); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-500">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setDeleteTarget(wh)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-start gap-1.5"><MapPin size={12} className="shrink-0 mt-0.5 text-gray-400" /><span className="line-clamp-2">{wh.address}</span></div>
                <div className="flex items-center gap-1.5"><Package size={12} className="text-gray-400" /><span>Capacity: <span className="font-semibold text-gray-700">{wh.totalCapacity.toLocaleString()}</span> units</span></div>
                <div className="flex items-center gap-1.5"><User size={12} className="text-gray-400" /><span>{wh.managerName}</span></div>
                <div className="flex items-center gap-1.5"><Phone size={12} className="text-gray-400" /><span>{wh.managerPhone}</span></div>
              </div>
              {wh.latitude && wh.longitude && (
                <p className="text-[10px] text-gray-400 mt-2">📍 {Number(wh.latitude).toFixed(4)}, {Number(wh.longitude).toFixed(4)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && (
        <Pagination
          page={page}
          totalItems={filtered.length}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}

      <WarehouseFormDialog open={formOpen} onClose={() => { setFormOpen(false); setEditWh(null); }} onSubmit={handleSubmit} isLoading={isMutating} editData={editWh} />
      <DeleteConfirm open={!!deleteTarget} message={`Apakah Anda yakin ingin menghapus warehouse "${deleteTarget?.name}"?`} isLoading={deleteMut.isPending} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

// ── Sub-tab: Inventory ────────────────────────────────────────────────────
function InventoryTab({ warehouses }: { warehouses: WHType[] }) {
  const { data: lowStock = [] } = useLowStock();
  const createMut = useCreateInventory();
  const adjustMut = useAdjustStock();

  const [formOpen, setFormOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [selectedWh, setSelectedWh] = useState<number | "all">("all");
  const [whInventory, setWhInventory] = useState<InventoryItem[]>([]);
  const [loadingWh, setLoadingWh] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number | "all">(10);

  const loadWarehouseInventory = async (id: number) => {
    setLoadingWh(true);
    try {
      const items = await getWarehouseInventoryApi(id);
      setWhInventory(items);
    } catch { toast.error("Failed to load inventory"); }
    finally { setLoadingWh(false); }
  };

  const handleSelectWh = (id: number | "all") => {
    setSelectedWh(id);
    setPage(1);
    if (id !== "all") loadWarehouseInventory(id as number);
  };

  const displayItems = selectedWh === "all" ? lowStock : whInventory;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return displayItems.filter(item =>
      item.sku.toLowerCase().includes(q) ||
      item.productName.toLowerCase().includes(q) ||
      (item.location ?? "").toLowerCase().includes(q)
    );
  }, [displayItems, search]);

  const paginated = perPage === "all" ? filtered : filtered.slice((page - 1) * perPage, page * perPage);

  const handleAddInventory = async (data: import("../../api/wms.api").CreateInventoryPayload) => {
    try {
      await createMut.mutateAsync(data);
      toast.success("Inventory item added");
      setFormOpen(false);
      if (selectedWh !== "all") loadWarehouseInventory(selectedWh as number);
    } catch { toast.error("Failed to add inventory"); }
  };

  const handleAdjust = async (data: { adjustment: number; reason: string }) => {
    if (!adjustTarget) return;
    try {
      await adjustMut.mutateAsync({ id: adjustTarget.id, data });
      toast.success("Stock adjusted");
      setAdjustTarget(null);
      if (selectedWh !== "all") loadWarehouseInventory(selectedWh as number);
    } catch { toast.error("Failed to adjust stock"); }
  };

  const isLow = (item: InventoryItem) =>
    item.minStockLevel != null && item.quantity <= item.minStockLevel;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <select value={String(selectedWh)} onChange={e => handleSelectWh(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="all">⚠️ Low Stock Only</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          {loadingWh && <Loader2 size={14} className="animate-spin text-blue-500" />}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search items..."
              className="pl-8 pr-4 py-1.5 text-sm bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 placeholder:text-gray-400" />
          </div>
        </div>
        <button onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
          <Plus size={14} /> Add Item
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        {selectedWh === "all" && lowStock.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-gray-400 gap-2">
            <Package size={32} className="opacity-30" />
            <p className="text-sm">No low-stock items 🎉</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {["#", "SKU", "Product Name", "Warehouse", "Qty", "Min Stock", "Location", "Barcode", "Action"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center text-sm text-gray-400 py-10">No items found</td></tr>
              )}
              {paginated.map((item, idx) => (
                <tr key={item.id} className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${isLow(item) ? "bg-red-50/30" : ""}`}>
                  <td className="px-5 py-3 text-sm text-gray-400">
                    {perPage === "all" ? idx + 1 : (page - 1) * perPage + idx + 1}
                  </td>
                  <td className="px-5 py-3 text-xs font-mono font-semibold text-gray-700">{item.sku}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">
                    <div className="flex items-center gap-1.5">
                      {isLow(item) && <AlertTriangle size={13} className="text-red-500 shrink-0" />}
                      {item.productName}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">{item.warehouse?.name ?? `WH #${item.warehouseId}`}</td>
                  <td className={`px-5 py-3 text-sm font-bold ${isLow(item) ? "text-red-600" : "text-gray-800"}`}>{item.quantity}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{item.minStockLevel ?? "—"}</td>
                  <td className="px-5 py-3 text-xs text-gray-500 font-mono">{item.location ?? "—"}</td>
                  <td className="px-5 py-3 text-xs text-gray-500 font-mono">{item.barcodeValue ?? "—"}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => setAdjustTarget(item)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <RefreshCw size={11} /> Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loadingWh && (
        <Pagination
          page={page}
          totalItems={filtered.length}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}

      <InventoryFormDialog open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleAddInventory} isLoading={createMut.isPending} warehouses={warehouses} />
      <AdjustStockDialog open={!!adjustTarget} item={adjustTarget} isLoading={adjustMut.isPending} onClose={() => setAdjustTarget(null)} onSubmit={handleAdjust} />
    </div>
  );
}

// ── Sub-tab: Barcode Scanner ──────────────────────────────────────────────
function BarcodeTab({ warehouses }: { warehouses: WHType[] }) {
  const [barcodeValue, setBarcodeValue] = useState("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = async () => {
    if (!barcodeValue.trim()) { toast.error("Enter a barcode value"); return; }
    setScanning(true);
    try {
      const res = await scanBarcodeApi({
        barcodeValue: barcodeValue.trim(),
        ...(warehouseId ? { warehouseId: Number(warehouseId) } : {}),
      });
      setResult(res);
      if (!res.found) toast.warning("Item not found for this barcode");
    } catch { toast.error("Scan failed"); setResult(null); }
    finally { setScanning(false); }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Scanner Input */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <QrCode size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Barcode / QR Scanner</h3>
            <p className="text-xs text-gray-400">Scan or enter barcode to lookup inventory</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Barcode / QR Value <span className="text-red-500">*</span></label>
            <input
              value={barcodeValue}
              onChange={e => { setBarcodeValue(e.target.value); setResult(null); }}
              onKeyDown={e => e.key === "Enter" && handleScan()}
              placeholder="Scan or type barcode..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono placeholder:text-gray-400"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Warehouse (optional)</label>
            <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">All Warehouses</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
            </select>
          </div>
          <button onClick={handleScan} disabled={scanning || !barcodeValue.trim()}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
            {scanning ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
            {scanning ? "Scanning..." : "Scan Barcode"}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-2xl p-5 border ${result.found ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          {result.found && result.item ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800">Item Found</p>
                  <p className="text-xs text-green-600">Barcode matched successfully</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ["SKU", result.item.sku],
                  ["Product", result.item.productName],
                  ["Warehouse", result.item.warehouse?.name ?? `#${result.item.warehouseId}`],
                  ["Quantity", String(result.item.quantity)],
                  ["Location", result.item.location ?? "—"],
                  ["Description", result.item.description ?? "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-green-700 font-medium">{k}</span>
                    <span className="text-green-900 font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              <div>
                <p className="text-sm font-semibold text-red-700">Item Not Found</p>
                <p className="text-xs text-red-500">{result.message ?? "No inventory item matches this barcode"}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main WMS Page ─────────────────────────────────────────────────────────
export default function Wms() {
  const [tab, setTab] = useState<Tab>("warehouses");
  const { data: warehouses = [], isLoading: whLoading } = useWarehouses();
  const { data: lowStock = [] } = useLowStock();

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "warehouses", label: "Warehouses", icon: <Warehouse size={14} /> },
    { key: "inventory", label: "Inventory", icon: <Package size={14} /> },
    { key: "barcode", label: "Barcode Scanner", icon: <QrCode size={14} /> },
  ];

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Warehouse Management</h1>
            <p className="text-xs text-gray-400 mt-0.5">WMS — multi-warehouse inventory & distribution</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Warehouses", value: whLoading ? "—" : warehouses.length, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Active Warehouses", value: whLoading ? "—" : warehouses.filter(w => w.status !== "INACTIVE").length, color: "text-green-600", bg: "bg-green-50" },
            { label: "Low Stock Alerts", value: lowStock.length, color: "text-red-600", bg: "bg-red-50" },
            { label: "Total Capacity", value: whLoading ? "—" : warehouses.reduce((s, w) => s + (w.totalCapacity || 0), 0).toLocaleString(), color: "text-purple-600", bg: "bg-purple-50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-100 px-4 pt-3">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors mr-1 ${
                  tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                {t.icon} {t.label}
                {t.key === "inventory" && lowStock.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{lowStock.length}</span>
                )}
              </button>
            ))}
          </div>
          <div className="p-5">
            {tab === "warehouses" && <WarehousesTab />}
            {tab === "inventory" && <InventoryTab warehouses={warehouses} />}
            {tab === "barcode" && <BarcodeTab warehouses={warehouses} />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
