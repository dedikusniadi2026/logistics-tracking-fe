import {
  BrowserRouter,
  Routes,
  Navigate,
  Route,
} from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import Users from "../pages/users/Users";
import Customers from "../pages/customers/Customers";
import Drivers from "../pages/drivers/Drivers";
import Vehicles from "../pages/vehicles/Vehicles";
import ProtectedRoute from "../components/common/ProtectedRoute";
import LiveTracking from "../pages/livetracking/LiveTracking";
import Shipments from "../pages/shipments/Shipments";
import Trips from "../pages/trips/Trips";
import Schedule from "../pages/schedule/Schedule";
import Analytics from "../pages/analytics/Analytics";
import Reports from "../pages/reports/Reports";
import Messages from "../pages/messages/Messages";
import Support from "../pages/support/Support";
import Wms from "../pages/wms/Wms";
import RouteOptimization from "../pages/route-optimization/RouteOptimization";
import Sla from "../pages/sla/Sla";
import Fraud from "../pages/fraud/Fraud";
import IotTracking from "../pages/iot/IotTracking";
import Profile from "../pages/profile/Profile";
import Settings from "../pages/settings/Settings";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/drivers"
          element={
            <ProtectedRoute>
              <Drivers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles"
          element={
            <ProtectedRoute>
              <Vehicles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/livetracking"
          element={
            <ProtectedRoute>
              <LiveTracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shipments"
          element={
            <ProtectedRoute>
              <Shipments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <Trips />
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wms"
          element={
            <ProtectedRoute>
              <Wms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/route-optimization"
          element={
            <ProtectedRoute>
              <RouteOptimization />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sla"
          element={
            <ProtectedRoute>
              <Sla />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fraud"
          element={
            <ProtectedRoute>
              <Fraud />
            </ProtectedRoute>
          }
        />

        <Route
          path="/iot"
          element={
            <ProtectedRoute>
              <IotTracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* legacy typo redirect */}
        <Route path="/livetraking" element={<Navigate to="/livetracking" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
