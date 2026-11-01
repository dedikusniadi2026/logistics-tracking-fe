import { useState } from "react";
import { toast } from "react-toastify";
import {
  Settings2, Bell, Shield, Globe, Sun, Moon, Monitor,
  Smartphone, Mail, MessageSquare, Loader2, Palette, Languages, Clock,
} from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import { useUiStore } from "../../store/uiStore";

type Tab = "general" | "notifications" | "security";

const TABS: { key: Tab; label: string; icon: typeof Settings2 }[] = [
  { key: "general", label: "General", icon: Settings2 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Shield },
];

/* ── Toggle component ── */
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
        enabled ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ── Theme mode card ── */
type ThemeMode = "light" | "dark" | "system";

function ThemeSelector({ value, onChange }: { value: ThemeMode; onChange: (v: ThemeMode) => void }) {
  const options: { key: ThemeMode; icon: typeof Sun; label: string }[] = [
    { key: "light", icon: Sun, label: "Light" },
    { key: "dark", icon: Moon, label: "Dark" },
    { key: "system", icon: Monitor, label: "System" },
  ];
  return (
    <div className="flex gap-3">
      {options.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl border-2 transition-all ${
            value === key
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-200 hover:border-gray-300 text-gray-500"
          }`}
        >
          <Icon size={20} />
          <span className="text-xs font-semibold">{label}</span>
        </button>
      ))}
    </div>
  );
}

export default function Settings() {
  const darkMode = useUiStore((s) => s.darkMode);
  const toggleDarkMode = useUiStore((s) => s.toggleDarkMode);

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [theme, setTheme] = useState<ThemeMode>(darkMode ? "dark" : "light");
  const [language, setLanguage] = useState("english");
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [saving, setSaving] = useState(false);

  /* Notification toggles */
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [shipmentUpdates, setShipmentUpdates] = useState(true);
  const [fraudAlerts, setFraudAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("Settings saved successfully");
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 bg-white transition-all";
  const labelCls = "block text-xs font-medium text-gray-600 mb-1";
  const sectionCls = "bg-white rounded-2xl shadow-sm border border-gray-100 p-6";
  const sectionTitle = "text-sm font-semibold text-gray-900 mb-4";

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-gray-900">Settings</h1>
          <p className="text-xs text-gray-400 mt-0.5">Customize your application preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                activeTab === key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ── General Tab ── */}
        {activeTab === "general" && (
          <div className="space-y-5">
            {/* Appearance */}
            <div className={sectionCls}>
              <h3 className={sectionTitle}>
                <Palette size={15} className="inline mr-1.5 text-gray-400" />
                Appearance
              </h3>
              <div className="space-y-5">
                <div>
                  <label className={labelCls}>Theme Mode</label>
                  <ThemeSelector value={theme} onChange={(v) => { setTheme(v); toggleDarkMode(); }} />
                </div>
              </div>
            </div>

            {/* Region */}
            <div className={sectionCls}>
              <h3 className={sectionTitle}>
                <Globe size={15} className="inline mr-1.5 text-gray-400" />
                Region & Language
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    <Languages size={12} className="inline mr-1" />
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={inputCls}
                  >
                    <option value="english">English</option>
                    <option value="indonesian">Bahasa Indonesia</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>
                    <Clock size={12} className="inline mr-1" />
                    Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className={inputCls}
                  >
                    <option value="Asia/Jakarta">Asia/Jakarta (WIB, UTC+7)</option>
                    <option value="Asia/Makassar">Asia/Makassar (WITA, UTC+8)</option>
                    <option value="Asia/Jayapura">Asia/Jayapura (WIT, UTC+9)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Settings2 size={14} />}
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}

        {/* ── Notifications Tab ── */}
        {activeTab === "notifications" && (
          <div className="space-y-5">
            {/* Channels */}
            <div className={sectionCls}>
              <h3 className={sectionTitle}>
                <Smartphone size={15} className="inline mr-1.5 text-gray-400" />
                Notification Channels
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Email Notifications", desc: "Receive updates via email", value: emailNotif, set: setEmailNotif, icon: Mail },
                  { label: "Push Notifications", desc: "Receive push notifications on your browser", value: pushNotif, set: setPushNotif, icon: Smartphone },
                  { label: "SMS Notifications", desc: "Receive text message alerts", value: smsNotif, set: setSmsNotif, icon: MessageSquare },
                ].map(({ label, desc, value, set, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Icon size={16} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                    </div>
                    <Toggle enabled={value} onChange={set} />
                  </div>
                ))}
              </div>
            </div>

            {/* Events */}
            <div className={sectionCls}>
              <h3 className={sectionTitle}>
                <Bell size={15} className="inline mr-1.5 text-gray-400" />
                Notification Events
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Shipment Updates", desc: "Status changes on shipments", value: shipmentUpdates, set: setShipmentUpdates },
                  { label: "Fraud Alerts", desc: "Suspicious activity detected", value: fraudAlerts, set: setFraudAlerts },
                  { label: "Weekly Report", desc: "Weekly performance summary", value: weeklyReport, set: setWeeklyReport },
                ].map(({ label, desc, value, set }) => (
                  <div key={label} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                    <Toggle enabled={value} onChange={set} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />}
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        )}

        {/* ── Security Tab ── */}
        {activeTab === "security" && (
          <div className="space-y-5">
            {/* Session */}
            <div className={sectionCls}>
              <h3 className={sectionTitle}>
                <Shield size={15} className="inline mr-1.5 text-gray-400" />
                Active Sessions
              </h3>
              <div className="space-y-3">
                {[
                  { device: "Chrome on Windows", ip: "192.168.1.100", lastActive: "Now", current: true },
                  { device: "Safari on iPhone", ip: "192.168.1.101", lastActive: "2 hours ago", current: false },
                ].map((s) => (
                  <div
                    key={s.ip}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      s.current ? "bg-blue-50 border border-blue-100" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        s.current ? "bg-blue-100" : "bg-white shadow-sm"
                      }`}>
                        <Smartphone size={16} className={s.current ? "text-blue-600" : "text-gray-500"} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {s.device}
                          {s.current && (
                            <span className="ml-2 text-[10px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">{s.ip} &middot; {s.lastActive}</p>
                      </div>
                    </div>
                    {!s.current && (
                      <button className="text-xs font-medium text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Two Factor */}
            <div className={sectionCls}>
              <h3 className={sectionTitle}>
                <Shield size={15} className="inline mr-1.5 text-gray-400" />
                Two-Factor Authentication
              </h3>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">Enable 2FA</p>
                  <p className="text-xs text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                  Setup
                </button>
              </div>
            </div>

            {/* Login History */}
            <div className={sectionCls}>
              <h3 className={sectionTitle}>
                <Clock size={15} className="inline mr-1.5 text-gray-400" />
                Recent Login Activity
              </h3>
              <div className="space-y-2">
                {[
                  { action: "Login successful", time: "2 minutes ago", location: "Jakarta, Indonesia" },
                  { action: "Password changed", time: "3 days ago", location: "Jakarta, Indonesia" },
                  { action: "Login from new device", time: "1 week ago", location: "Bandung, Indonesia" },
                ].map((e, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{e.action}</p>
                      <p className="text-xs text-gray-400">{e.location}</p>
                    </div>
                    <span className="text-xs text-gray-400">{e.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

