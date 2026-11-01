import { useEffect, useState } from "react";
import { MapPinned, Truck, XCircle } from "lucide-react";
import { dashboardStatsApi } from "../../api/dashboard.api";

export default function TripStats() {
  const [stats, setStats] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await dashboardStatsApi();
        if (mounted) setStats(data as any);
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

  const totalTrip = stats?.totalTrip ?? stats?.total_trips ?? stats?.total ?? 0;
  const onGoingTrip =
    stats?.onGoingTrip ?? stats?.on_going_trips ?? stats?.onGoing ?? 0;
  const cancelledTrip =
    stats?.cancelledTrip ??
    stats?.cancelled_trips ??
    stats?.cancelled ??
    0;

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500">Total Trip</p>
            <h2 className="text-3xl font-bold">
              {loading ? "..." : totalTrip}
            </h2>
          </div>

          <MapPinned className="text-indigo-500" size={32} />
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500">On Going Trip</p>
            <h2 className="text-3xl font-bold">
              {loading ? "..." : onGoingTrip}
            </h2>
          </div>

          <Truck className="text-green-500" size={32} />
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500">Cancelled Trip</p>
            <h2 className="text-3xl font-bold">
              {loading ? "..." : cancelledTrip}
            </h2>
          </div>

          <XCircle className="text-red-500" size={32} />
        </div>
      </div>
    </div>
  );
}
