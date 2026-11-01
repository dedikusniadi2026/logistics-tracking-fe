import { useEffect, useMemo, useState } from "react";
import { liveTrackingApi, type TrackingPoint as LiveTrackingPoint } from "../../api/tracking.api";

type Row = {
  id: number;
  tripNumber: string;
  driver: string;
  vehicle: string;
  destination: string;
  status: string;
};

export default function LatestTripTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await liveTrackingApi();

        // Fallback mapping: use shipmentId and whatever fields exist
        const points = Array.isArray(data) ? (data as LiveTrackingPoint[]) : [];

        const mapped: Row[] = points
          .filter((p) => typeof p.shipmentId === "number")
          .slice(0, 8)
          .map((p, idx) => {
            const status =
              (p as any).status ??
              (p as any).shipmentStatus ??
              (p as any).deliveryStatus ??
              "UNKNOWN";

            return {
              id: (p.shipmentId as number) ?? idx,
              tripNumber: String((p as any).tripNumber ?? p.shipmentId ?? idx),
              driver: String((p as any).driverName ?? (p as any).driver ?? "-"),
              vehicle: String((p as any).vehiclePlate ?? (p as any).vehicle ?? "-"),
              destination: String((p as any).destinationAddress ?? (p as any).destination ?? "-"),
              status: String(status),
            };
          });

        if (mounted) setRows(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const statusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("delivered") || s === "done") return "bg-green-100 text-green-700";
    if (s.includes("cancel")) return "bg-red-100 text-red-700";
    if (s.includes("in_transit") || s.includes("on") || s.includes("assigned"))
      return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  const tableRows = useMemo(() => rows, [rows]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Latest Trip</h2>
        <button className="text-indigo-600 hover:text-indigo-700 font-medium">
          See All
        </button>
      </div>

      <table className="w-full">
        <thead>
          <tr className="text-left border-b">
            <th className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">No</th>
            <th className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trip Number</th>
            <th className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Driver</th>
            <th className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle</th>
            <th className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Destination</th>
            <th className="py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="py-6 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          ) : (
            tableRows.map((trip, i) => (
              <tr key={trip.id ?? i} className="border-b hover:bg-gray-50">
                <td className="py-3 text-sm text-gray-700">{trip.id ?? i + 1}</td>
                <td className="py-3 text-sm text-gray-900 font-medium">{trip.tripNumber}</td>
                <td className="py-3 text-sm text-gray-700">{trip.driver}</td>
                <td className="py-3 text-sm text-gray-700">{trip.vehicle}</td>
                <td className="py-3 text-sm text-gray-700">{trip.destination}</td>
                <td className="py-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClass(
                      trip.status
                    )}`}
                  >
                    {trip.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
