import { Bell, Search, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useShipments } from "../../hooks/useShipments";
import { useAuthStore } from "../../store/authStore";
import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { data: shipments = [] } = useShipments();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const notifCount = useMemo(() => {
    const oneHourAgo = Date.now() - 3_600_000;
    return shipments.filter(
      (s) => s.updatedAt && new Date(s.updatedAt).getTime() > oneHourAgo
    ).length;
  }, [shipments]);

  const displayName = user?.name ?? "Admin";
  const displayRole = user?.role ?? "Administrator";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white h-14 border-b border-gray-100 flex items-center justify-between px-5 shadow-sm shrink-0">
      {/* Search Bar */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search shipments, drivers, vehicles..."
            className="w-full pl-9 pr-4 py-1.5 bg-gray-100 rounded-full text-sm border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="text-gray-500" size={17} />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-7 bg-gray-200 mx-1" />

        {/* User Profile + Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 cursor-pointer rounded-xl hover:bg-gray-50 px-2 py-1 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initial}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-gray-900 leading-tight">{displayName}</div>
              <div className="text-[11px] text-gray-400 leading-tight">{displayRole}</div>
            </div>
            <ChevronDown
              size={13}
              className={`text-gray-400 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 z-50">
              {/* User info */}
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">{displayName}</p>
                <p className="text-xs text-gray-400">{displayRole}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => { setDropdownOpen(false); navigate("/profile"); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <User size={14} className="text-gray-400" />
                  Profile
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); navigate("/settings"); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={14} className="text-gray-400" />
                  Settings
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
