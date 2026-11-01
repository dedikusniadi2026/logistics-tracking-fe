import { useState, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import {
  User, Mail, Phone, Shield, Save, Lock, Camera,
  Loader2, CheckCircle, Eye, EyeOff, Upload,
} from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import { useAuthStore } from "../../store/authStore";
import { updateProfileApi, changePasswordApi, uploadAvatarApi } from "../../api/profile.api";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);

  /* ── Avatar state ── */
  const avatarUrl = user?.avatarUrl ?? user?.avatar ?? "";
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    /* Validate */
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WebP & GIF files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    /* Show local preview */
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    /* Upload */
    setUploading(true);
    try {
      const res = await uploadAvatarApi(file);
      const newUrl = res.avatarUrl ?? res.avatar ?? res.user?.avatarUrl ?? res.user?.avatar ?? "";
      if (newUrl) {
        setUser({ ...user, avatarUrl: newUrl, avatar: newUrl });
        toast.success("Avatar uploaded successfully");
      } else {
        toast.success("Avatar uploaded");
      }
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to upload avatar";
      toast.error(msg);
      /* Revert preview on error */
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  }, [user, setUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    /* Reset so the same file can be re-selected */
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  /* Password state */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const displayName = user?.name ?? "User";
  const displayRole = user?.role ?? "USER";
  const initial = displayName.charAt(0).toUpperCase();
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : "—";

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      const updatedUser = await updateProfileApi({ name, email, phone });
      // Update the auth store so the new info reflects everywhere
      const fresh = updatedUser.user ?? updatedUser;
      setUser(fresh);
      // Sync local form state with the API response
      setName(fresh.name ?? name);
      setEmail(fresh.email ?? email);
      setPhone(fresh.phone ?? phone);
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to update profile";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setChangingPassword(true);
    try {
      await changePasswordApi({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully");
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to change password";
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 transition-all";
  const labelCls = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-gray-900">Profile</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Cover */}
          <div className="h-28 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 relative">
            <div className="absolute -bottom-12 left-6">
              {/* Avatar upload area — drag & drop + click */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center relative group cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? "ring-4 ring-blue-400 scale-105 shadow-xl"
                    : ""
                }`}
              >
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleInputChange}
                  className="hidden"
                />

                {/* Avatar image or initial fallback */}
                {(previewUrl || avatarUrl) ? (
                  <img
                    src={previewUrl || avatarUrl}
                    alt="Avatar"
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {initial}
                  </div>
                )}

                {/* Upload overlay on hover */}
                <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  {uploading ? (
                    <Loader2 size={18} className="text-white animate-spin opacity-0 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <Camera size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>

                {/* Drag-over indicator */}
                {dragOver && (
                  <div className="absolute inset-0 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                    <Upload size={22} className="text-blue-600" />
                  </div>
                )}

                {/* Upload progress inside the avatar box */}
                {uploading && (
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-[10px] text-blue-600 font-medium">
                      <Loader2 size={10} className="animate-spin" />
                      Uploading...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="pt-16 px-6 pb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{displayName}</h2>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Shield size={11} />
                  {displayRole} &middot; Member since {memberSince}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                <CheckCircle size={11} />
                Active
              </span>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { icon: Mail, label: "Email", value: user?.email ?? "—" },
                { icon: Phone, label: "Phone", value: user?.phone ?? "—" },
                { icon: Shield, label: "Role", value: displayRole },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center">
                    <Icon size={15} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={15} className="text-gray-400" />
            Edit Profile
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                type="email"
                className={inputCls}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62 xxx-xxxx-xxxx"
                className={inputCls}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock size={15} className="text-gray-400" />
            Change Password
          </h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className={labelCls}>Current Password</label>
              <div className="relative">
                <input
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelCls}>New Password</label>
              <div className="relative">
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelCls}>Confirm New Password</label>
              <div className="relative">
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              {changingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <h3 className="text-sm font-semibold text-red-600 mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Danger Zone
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Irreversible actions that affect your account.
          </p>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-800">Delete Account</p>
              <p className="text-xs text-gray-500">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors shrink-0">
              Delete
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
