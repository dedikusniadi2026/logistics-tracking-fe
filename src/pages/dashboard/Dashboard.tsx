import { useState } from "react";
import MainLayout from "../../components/layouts/MainLayout";

import DashboardHeader        from "./DashboardHeader";
import KpiCards               from "./KpiCards";
import LiveOperationsMap      from "./LiveOperationsMap";
import CurrentOperationsPanel from "./CurrentOperationsPanel";
import ShipmentTrendChart     from "./ShipmentTrendChart";
import DeliveryStatusChart    from "./DeliveryStatusChart";
import AlertCenter            from "./AlertCenter";
import RecentActivities       from "./RecentActivities";
import SystemStatus           from "./SystemStatus";
import CalendarWidget         from "./CalendarWidget";
import ScheduleOfTripsTable   from "./ScheduleOfTripsTable";
import CurrentVehicleCard     from "./CurrentVehicleCard";

export default function Dashboard() {
  const [dark, setDark] = useState(false);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-gray-950" : "bg-[#f0f4f9]"}`}>
      <MainLayout>
        <div className="space-y-4">

          {/* ── 1. HEADER: Greeting, Date/Time, System Status, WS, Quick Actions ── */}
          <DashboardHeader dark={dark} onToggleDark={() => setDark((d) => !d)} />

          {/* ── 2. KPI CARDS (8 metrics) ── */}
          <KpiCards dark={dark} />

          {/* ── 3. LIVE MAP (big — ~55% viewport height) ── */}
          <div style={{ height: "55vh", minHeight: 420 }}>
            <LiveOperationsMap dark={dark} />
          </div>

          {/* ── 4. CURRENT OPERATIONS: Trip Detail + Fleet Health ── */}
          <CurrentOperationsPanel dark={dark} />

          {/* ── 5. ANALYTICS: Trend Chart + Delivery Donut ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ShipmentTrendChart dark={dark} />
            <DeliveryStatusChart dark={dark} />
          </div>

          {/* ── 6. ALERT CENTER + RECENT ACTIVITIES + SYSTEM STATUS + CALENDAR ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <AlertCenter dark={dark} />
            <RecentActivities dark={dark} />
            <div className="flex flex-col gap-4">
              <SystemStatus dark={dark} />
              <CalendarWidget />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ScheduleOfTripsTable />
            </div>
            <CurrentVehicleCard />
          </div>

        </div>
      </MainLayout>
    </div>
  );
}
