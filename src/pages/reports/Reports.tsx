import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { FileText, Download, Search, Loader2 } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import Pagination from "../../components/common/Pagination";
import { useShipments } from "../../hooks/useShipments";
import { useDrivers } from "../../hooks/useDrivers";
import { useVehicles } from "../../hooks/useVehicles";
import {
  exportShipmentPdf, exportShipmentExcel,
  exportDriverPdf, exportDriverExcel,
  exportVehiclePdf, exportVehicleExcel,
} from "../../utils/exportReport";

type Tab = "shipment" | "driver" | "vehicle";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  PICKED_UP: "bg-purple-100 text-purple-700",
  IN_TRANSIT: "bg-blue-100 text-blue-700",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-600",
  AVAILABLE: "bg-green-100 text-green-700",
  ON_DELIVERY: "bg-blue-100 text-blue-700",
  INACTIVE: "bg-gray-100 text-gray-600",
  ACTIVE: "bg-green-100 text-green-700",
  MAINTENANCE: "bg-yellow-100 text-yellow-700",
};

function fmtDate(val?: string) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}
function truncate(text: string, max = 28) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

// ── Export button with loading state ──────────────────────────────────────
function ExportButton({
  onClick, color, icon: Icon, label,
}: {
  onClick: () => Promise<void>;
  color: "red" | "green";
  icon: React.ElementType;
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  const handle = async () => {
    setBusy(true);
    try { await onClick(); }
    finally { setBusy(false); }
  };
  const base = color === "red"
    ? "text-red-600 border-red-200 hover:bg-red-50"
    : "text-green-600 border-green-200 hover:bg-green-50";
  return (
    <button
      onClick={handle}
      disabled={busy}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-xl transition-colors disabled:opacity-60 ${base}`}
    >
      {busy ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
      {label}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Reports() {
  const [tab, setTab] = useState<Tab>("shipment");

  const { data: shipments = [], isLoading: shipLoading } = useShipments();
  const { data: driverList = [], isLoading: drvLoading } = useDrivers();
  const { data: vehicles = [], isLoading: vehicleLoading } = useVehicles();

  // Shipment filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [shipSearch, setShipSearch] = useState("");
  const [driverSearch, setDriverSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");

  const [shipPage, setShipPage] = useState(1);
  const [driverPage, setDriverPage] = useState(1);
  const [vehiclePage, setVehiclePage] = useState(1);
  const [perPage, setPerPage] = useState<number | "all">(10);

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const q = shipSearch.toLowerCase();
      const matchSearch =
        (s.shipmentNumber ?? "").toLowerCase().includes(q) ||
        s.originAddress.toLowerCase().includes(q) ||
        s.destinationAddress.toLowerCase().includes(q);
      const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
      const matchStart = !startDate || new Date(s.createdAt ?? 0) >= new Date(startDate);
      const matchEnd = !endDate || new Date(s.createdAt ?? 0) <= new Date(endDate + "T23:59:59");
      return matchSearch && matchStatus && matchStart && matchEnd;
    });
  }, [shipments, shipSearch, statusFilter, startDate, endDate]);

  const paginatedShipments = perPage === "all" ? filteredShipments : filteredShipments.slice((shipPage - 1) * perPage, shipPage * perPage);

  const filteredDrivers = useMemo(() => {
    const q = driverSearch.toLowerCase();
    return driverList.filter(
      (d) => d.name.toLowerCase().includes(q) || d.phone.includes(q) || d.licenseNumber.toLowerCase().includes(q)
    );
  }, [driverList, driverSearch]);

  const paginatedDrivers = perPage === "all" ? filteredDrivers : filteredDrivers.slice((driverPage - 1) * perPage, driverPage * perPage);

  const filteredVehicles = useMemo(() => {
    const q = vehicleSearch.toLowerCase();
    return vehicles.filter(
      (v) => v.plateNumber.toLowerCase().includes(q) || v.model.toLowerCase().includes(q) || v.type.toLowerCase().includes(q)
    );
  }, [vehicles, vehicleSearch]);

  const paginatedVehicles = perPage === "all" ? filteredVehicles : filteredVehicles.slice((vehiclePage - 1) * perPage, vehiclePage * perPage);

  // ── Export handlers ──────────────────────────────────────────────────────
  const shipFilterLabel = [
    startDate && `From ${startDate}`,
    endDate && `To ${endDate}`,
    statusFilter !== "ALL" && `Status: ${statusFilter}`,
  ].filter(Boolean).join(" | ") || "All shipments";

  const handleShipmentPdf = async () => {
    if (filteredShipments.length === 0) { toast.warning("Tidak ada data untuk diekspor"); return; }
    exportShipmentPdf(filteredShipments, shipFilterLabel);
    toast.success(`PDF berhasil diunduh (${filteredShipments.length} baris)`);
  };

  const handleShipmentExcel = async () => {
    if (filteredShipments.length === 0) { toast.warning("Tidak ada data untuk diekspor"); return; }
    exportShipmentExcel(filteredShipments, shipFilterLabel);
    toast.success(`Excel berhasil diunduh (${filteredShipments.length} baris)`);
  };

  const handleDriverPdf = async () => {
    if (filteredDrivers.length === 0) { toast.warning("Tidak ada data driver"); return; }
    exportDriverPdf(filteredDrivers.map((d) => ({
      ...d, assignments: shipments.filter((s) => s.driverId === d.id).length,
    })));
    toast.success("PDF driver berhasil diunduh");
  };

  const handleDriverExcel = async () => {
    if (filteredDrivers.length === 0) { toast.warning("Tidak ada data driver"); return; }
    exportDriverExcel(filteredDrivers.map((d) => ({
      ...d, assignments: shipments.filter((s) => s.driverId === d.id).length,
    })));
    toast.success("Excel driver berhasil diunduh");
  };

  const handleVehiclePdf = async () => {
    if (filteredVehicles.length === 0) { toast.warning("Tidak ada data kendaraan"); return; }
    exportVehiclePdf(filteredVehicles.map((v) => ({
      ...v, usageCount: shipments.filter((s) => s.vehicleId === v.id).length,
    })));
    toast.success("PDF kendaraan berhasil diunduh");
  };

  const handleVehicleExcel = async () => {
    if (filteredVehicles.length === 0) { toast.warning("Tidak ada data kendaraan"); return; }
    exportVehicleExcel(filteredVehicles.map((v) => ({
      ...v, usageCount: shipments.filter((s) => s.vehicleId === v.id).length,
    })));
    toast.success("Excel kendaraan berhasil diunduh");
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "shipment", label: "Shipment Report" },
    { key: "driver",   label: "Driver Report" },
    { key: "vehicle",  label: "Vehicle Report" },
  ];

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-gray-900">Reports</h1>
          <p className="text-xs text-gray-400 mt-0.5">Laporan data sistem pengiriman — export ke PDF & Excel</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-5 pt-4">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors mr-1 ${
                  tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5">

            {/* ── SHIPMENT REPORT ── */}
            {tab === "shipment" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 font-medium">From</label>
                    <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setShipPage(1); }}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 font-medium">To</label>
                    <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setShipPage(1); }}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setShipPage(1); }}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    {["ALL","PENDING","ASSIGNED","PICKED_UP","IN_TRANSIT","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"].map((s) => (
                      <option key={s} value={s}>{s === "ALL" ? "All Status" : s}</option>
                    ))}
                  </select>
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search..." value={shipSearch} onChange={(e) => { setShipSearch(e.target.value); setShipPage(1); }}
                      className="pl-8 pr-4 py-1.5 text-sm bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 placeholder:text-gray-400" />
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-gray-400">{filteredShipments.length} rows</span>
                    <ExportButton onClick={handleShipmentPdf} color="red" icon={FileText} label="Export PDF" />
                    <ExportButton onClick={handleShipmentExcel} color="green" icon={Download} label="Export Excel" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["Shipment No", "Origin", "Destination", "Driver", "Vehicle", "Status", "Created", "Est. Delivery"].map((h) => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {shipLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                            <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                          ))}</tr>
                        ))
                      ) : filteredShipments.length === 0 ? (
                        <tr><td colSpan={8} className="text-center text-sm text-gray-400 py-10">Tidak ada data</td></tr>
                      ) : paginatedShipments.map((s) => (
                        <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.shipmentNumber ?? `#${s.id}`}</td>
                          <td className="px-4 py-3 text-sm text-gray-500" title={s.originAddress}>{truncate(s.originAddress)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500" title={s.destinationAddress}>{truncate(s.destinationAddress)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{s.driver?.name ?? "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{s.vehicle?.plateNumber ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[s.status] ?? "bg-gray-100 text-gray-600"}`}>{s.status}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">{fmtDate(s.createdAt)}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">{fmtDate(s.estimatedDelivery)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Shipment Pagination */}
                {!shipLoading && (
                  <Pagination
                    page={shipPage}
                    totalItems={filteredShipments.length}
                    perPage={perPage}
                    onPageChange={setShipPage}
                    onPerPageChange={setPerPage}
                  />
                )}
              </div>
            )}

            {/* ── DRIVER REPORT ── */}
            {tab === "driver" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative w-52">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search drivers..." value={driverSearch} onChange={(e) => { setDriverSearch(e.target.value); setDriverPage(1); }}
                      className="pl-8 pr-4 py-1.5 text-sm bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full placeholder:text-gray-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{filteredDrivers.length} rows</span>
                    <ExportButton onClick={handleDriverPdf} color="red" icon={FileText} label="Export PDF" />
                    <ExportButton onClick={handleDriverExcel} color="green" icon={Download} label="Export Excel" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["Driver Name","Phone","License No","Status","Total Assignments"].map((h) => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {drvLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                            <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                          ))}</tr>
                        ))
                      ) : filteredDrivers.length === 0 ? (
                        <tr><td colSpan={5} className="text-center text-sm text-gray-400 py-10">Tidak ada data driver</td></tr>
                      ) : paginatedDrivers.map((d) => {
                        const assignments = shipments.filter((s) => s.driverId === d.id).length;
                        return (
                          <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{d.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{d.phone}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{d.licenseNumber}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[d.status] ?? "bg-gray-100 text-gray-600"}`}>{d.status}</span>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800">{assignments}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Driver Pagination */}
                {!drvLoading && (
                  <Pagination
                    page={driverPage}
                    totalItems={filteredDrivers.length}
                    perPage={perPage}
                    onPageChange={setDriverPage}
                    onPerPageChange={setPerPage}
                  />
                )}
              </div>
            )}

            {/* ── VEHICLE REPORT ── */}
            {tab === "vehicle" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative w-52">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search vehicles..." value={vehicleSearch} onChange={(e) => { setVehicleSearch(e.target.value); setVehiclePage(1); }}
                      className="pl-8 pr-4 py-1.5 text-sm bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full placeholder:text-gray-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{filteredVehicles.length} rows</span>
                    <ExportButton onClick={handleVehiclePdf} color="red" icon={FileText} label="Export PDF" />
                    <ExportButton onClick={handleVehicleExcel} color="green" icon={Download} label="Export Excel" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["Plate Number","Model","Type","Capacity","Status","Usage Count"].map((h) => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vehicleLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                            <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                          ))}</tr>
                        ))
                      ) : filteredVehicles.length === 0 ? (
                        <tr><td colSpan={6} className="text-center text-sm text-gray-400 py-10">Tidak ada data kendaraan</td></tr>
                      ) : paginatedVehicles.map((v) => {
                        const usageCount = shipments.filter((s) => s.vehicleId === v.id).length;
                        return (
                          <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{v.plateNumber}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{v.model}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{v.type}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{v.capacity} kg</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[v.status] ?? "bg-gray-100 text-gray-600"}`}>{v.status}</span>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800">{usageCount}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Vehicle Pagination */}
                {!vehicleLoading && (
                  <Pagination
                    page={vehiclePage}
                    totalItems={filteredVehicles.length}
                    perPage={perPage}
                    onPageChange={setVehiclePage}
                    onPerPageChange={setPerPage}
                  />
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
