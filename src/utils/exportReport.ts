import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ── helpers ────────────────────────────────────────────────────────────────
function fmtDate(val?: string) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function addPdfHeader(doc: jsPDF, title: string, subtitle: string) {
  // Blue header bar
  doc.setFillColor(37, 99, 235);          // blue-600
  doc.rect(0, 0, 210, 22, "F");

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("LogisTrack", 14, 10);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Logistics Management System", 14, 16);

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);           // slate-800
  doc.text(title, 14, 32);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);        // slate-500
  doc.text(subtitle, 14, 39);

  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleString("id-ID")}`, 14, 45);
}

// ── Shipment ───────────────────────────────────────────────────────────────
export type ShipmentRow = {
  shipmentNumber?: string; id: number;
  originAddress: string; destinationAddress: string;
  status: string; createdAt?: string; estimatedDelivery?: string;
  driver?: { name?: string }; vehicle?: { plateNumber?: string };
};

export function exportShipmentPdf(rows: ShipmentRow[], filters: string) {
  const doc = new jsPDF();
  addPdfHeader(doc, "Shipment Report", filters || "All shipments");

  autoTable(doc, {
    startY: 52,
    head: [["Shipment No", "Origin", "Destination", "Driver", "Vehicle", "Status", "Created", "Est. Delivery"]],
    body: rows.map((s) => [
      s.shipmentNumber ?? `#${s.id}`,
      s.originAddress.slice(0, 30),
      s.destinationAddress.slice(0, 30),
      s.driver?.name ?? "—",
      s.vehicle?.plateNumber ?? "—",
      s.status,
      fmtDate(s.createdAt),
      fmtDate(s.estimatedDelivery),
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  addPageNumbers(doc);
  doc.save(`shipment-report-${today()}.pdf`);
}

export function exportShipmentExcel(rows: ShipmentRow[], filters: string) {
  const data = [
    ["LogisTrack — Shipment Report"],
    [filters || "All shipments"],
    [`Generated: ${new Date().toLocaleString("id-ID")}`],
    [],
    ["Shipment No", "Origin", "Destination", "Driver", "Vehicle", "Status", "Created", "Est. Delivery"],
    ...rows.map((s) => [
      s.shipmentNumber ?? `#${s.id}`,
      s.originAddress,
      s.destinationAddress,
      s.driver?.name ?? "—",
      s.vehicle?.plateNumber ?? "—",
      s.status,
      fmtDate(s.createdAt),
      fmtDate(s.estimatedDelivery),
    ]),
  ];
  saveExcel(data, "Shipments", `shipment-report-${today()}.xlsx`);
}

// ── Driver ─────────────────────────────────────────────────────────────────
export type DriverRow = {
  name: string; phone: string; licenseNumber: string;
  status: string; assignments: number;
};

export function exportDriverPdf(rows: DriverRow[]) {
  const doc = new jsPDF();
  addPdfHeader(doc, "Driver Report", `${rows.length} driver(s)`);

  autoTable(doc, {
    startY: 52,
    head: [["Name", "Phone", "License No", "Status", "Assignments"]],
    body: rows.map((d) => [d.name, d.phone, d.licenseNumber, d.status, d.assignments]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  addPageNumbers(doc);
  doc.save(`driver-report-${today()}.pdf`);
}

export function exportDriverExcel(rows: DriverRow[]) {
  const data = [
    ["LogisTrack — Driver Report"],
    [`${rows.length} driver(s)`],
    [`Generated: ${new Date().toLocaleString("id-ID")}`],
    [],
    ["Name", "Phone", "License No", "Status", "Assignments"],
    ...rows.map((d) => [d.name, d.phone, d.licenseNumber, d.status, d.assignments]),
  ];
  saveExcel(data, "Drivers", `driver-report-${today()}.xlsx`);
}

// ── Vehicle ────────────────────────────────────────────────────────────────
export type VehicleRow = {
  plateNumber: string; model: string; type: string;
  capacity: number; status: string; usageCount: number;
};

export function exportVehiclePdf(rows: VehicleRow[]) {
  const doc = new jsPDF();
  addPdfHeader(doc, "Vehicle Report", `${rows.length} vehicle(s)`);

  autoTable(doc, {
    startY: 52,
    head: [["Plate Number", "Model", "Type", "Capacity (kg)", "Status", "Usage Count"]],
    body: rows.map((v) => [v.plateNumber, v.model, v.type, v.capacity, v.status, v.usageCount]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  addPageNumbers(doc);
  doc.save(`vehicle-report-${today()}.pdf`);
}

export function exportVehicleExcel(rows: VehicleRow[]) {
  const data = [
    ["LogisTrack — Vehicle Report"],
    [`${rows.length} vehicle(s)`],
    [`Generated: ${new Date().toLocaleString("id-ID")}`],
    [],
    ["Plate Number", "Model", "Type", "Capacity (kg)", "Status", "Usage Count"],
    ...rows.map((v) => [v.plateNumber, v.model, v.type, v.capacity, v.status, v.usageCount]),
  ];
  saveExcel(data, "Vehicles", `vehicle-report-${today()}.xlsx`);
}

// ── internal utils ─────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10);
}

function addPageNumbers(doc: jsPDF) {
  const total = (doc as jsPDF & { internal: { getNumberOfPages: () => number } })
    .internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${total}`, 196, 290, { align: "right" });
  }
}

function saveExcel(data: (string | number)[][], sheetName: string, filename: string) {
  const ws = XLSX.utils.aoa_to_sheet(data);
  // Bold the title row
  if (ws["A1"]) ws["A1"].s = { font: { bold: true, sz: 14 } };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}
