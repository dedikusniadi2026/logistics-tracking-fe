import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Navigation, User, Users, Truck, Car, Package,
  Route, Calendar, MessageSquare, BarChart3, FileText, HelpCircle,
  Settings, LogOut, Box, Warehouse, Zap, Target, ShieldAlert, Cpu,
} from "lucide-react";

interface MenuItemProps {
  icon: ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
}

function MenuItem({ icon, label, badge, onClick }: MenuItemProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 select-none text-gray-500 hover:bg-gray-100 hover:text-gray-800"
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {badge !== undefined && (
        <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold bg-blue-500 text-white">
          {badge}
        </span>
      )}
    </div>
  );
}

interface NavMenuItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  badge?: number;
}

function NavMenuItem({ to, icon, label, badge }: NavMenuItemProps) {
  return (
    <NavLink to={to} end>
      {({ isActive }) => (
        <div
          className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 select-none ${
            isActive
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          }`}
        >
          <span className="shrink-0">{icon}</span>
          <span className="flex-1 text-sm font-medium">{label}</span>
          {badge !== undefined && (
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                isActive ? "bg-white text-blue-600" : "bg-blue-500 text-white"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
}

// Group label
function NavGroup({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-3 pb-1">
      {label}
    </p>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-56 bg-white border-r border-gray-100 h-screen flex flex-col shadow-sm shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <Box size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">LogisTrack</p>
          <p className="text-[10px] text-gray-400 leading-tight">Logistics Management</p>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="px-2 py-2 flex-1 overflow-y-auto space-y-0.5">
        <NavMenuItem to="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
        <NavMenuItem to="/livetracking" icon={<Navigation size={16} />} label="Live Tracking" />

        <NavGroup label="Master Data" />
        <NavMenuItem to="/customers" icon={<Users size={16} />} label="Customers" />
        <NavMenuItem to="/drivers" icon={<Truck size={16} />} label="Drivers" />
        <NavMenuItem to="/vehicles" icon={<Car size={16} />} label="Vehicles" />
        <NavMenuItem to="/users" icon={<User size={16} />} label="Users" />

        <NavGroup label="Warehouse" />
        <NavMenuItem to="/wms" icon={<Warehouse size={16} />} label="WMS" />

        <NavGroup label="Operations" />
        <NavMenuItem to="/shipments" icon={<Package size={16} />} label="Shipments" />
        <NavMenuItem to="/trips" icon={<Route size={16} />} label="Trips" />
        <NavMenuItem to="/schedule" icon={<Calendar size={16} />} label="Schedule" />

        <NavGroup label="Reports" />
        <NavMenuItem to="/analytics" icon={<BarChart3 size={16} />} label="Analytics" />
        <NavMenuItem to="/report" icon={<FileText size={16} />} label="Reports" />

        <NavGroup label="AI & Intelligence" />
        <NavMenuItem to="/route-optimization" icon={<Zap size={16} />} label="Route AI" />
        <NavMenuItem to="/sla" icon={<Target size={16} />} label="SLA Monitor" />
        <NavMenuItem to="/fraud" icon={<ShieldAlert size={16} />} label="Fraud Detection" />
        <NavMenuItem to="/iot" icon={<Cpu size={16} />} label="IoT Tracking" />

        <NavGroup label="Communication" />
        <NavMenuItem to="/messages" icon={<MessageSquare size={16} />} label="Messages" />
        <NavMenuItem to="/support" icon={<HelpCircle size={16} />} label="Support" />

        <NavGroup label="Account" />
        <NavMenuItem to="/profile" icon={<User size={16} />} label="Profile" />
        <NavMenuItem to="/settings" icon={<Settings size={16} />} label="Settings" />
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 pt-2 border-t border-gray-100 space-y-0.5">
        <MenuItem icon={<LogOut size={16} />} label="Log out" onClick={() => navigate("/login")} />
      </div>
    </aside>
  );
}
