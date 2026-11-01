import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Loader2,
  Box,
  Truck,
  Route,
  BarChart3,
  Eye,
  EyeOff,
} from "lucide-react";

import { loginApi } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";

interface LoginForm {
  email: string;
  password: string;
}

const FEATURES = [
  {
    icon: Truck,
    title: "Realtime Tracking",
    desc: "Pantau seluruh armada secara langsung.",
  },
  {
    icon: Route,
    title: "Smart Route",
    desc: "Optimasi rute menggunakan AI.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Dashboard dan laporan operasional.",
  },
];

export default function Login() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setApiError("");

    try {
      setLoading(true);

      const result = await loginApi(data.email, data.password);

      const token =
        result?.access_token ??
        result?.accessToken ??
        result?.token ??
        result?.data?.access_token ??
        result?.data?.accessToken ??
        result?.data?.token;

      const user =
        result?.user ??
        result?.data?.user;

      if (!token) {
        setApiError("Token tidak ditemukan.");
        return;
      }

      login(token, user);

      navigate("/dashboard");
    } catch (error: unknown) {
      const msg = (error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      })?.response?.data?.message;

      setApiError(
        typeof msg === "string"
          ? msg
          : "Email atau password salah."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden grid lg:grid-cols-2">
        <div className="hidden lg:flex bg-blue-700 text-white p-12 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                <Box size={22} />
              </div>
              <div>

                <h2 className="text-xl font-semibold">
                  LogisTrack
                </h2>

                <p className="text-sm text-blue-100">
                  Logistics Management System
                </p>
              </div>
            </div>

            <h1 className="text-4xl font-semibold leading-tight mb-5"> Kelola Operasional <br /> Logistik Lebih Mudah </h1>
            <p className="text-blue-100 leading-7 mb-12">
              Platform manajemen logistik modern untuk memonitor
              pengiriman, armada, dan performa bisnis secara
              real-time.
            </p>

            <div className="space-y-8">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <div>

                    <h3 className="font-medium">
                      {title}
                    </h3>

                    <p className="text-sm text-blue-100 mt-1">
                      {desc}
                    </p>

                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-blue-200"> 2026 LogisTrack. All rights reserved. </p>
        </div>

        <div className="flex items-center justify-center px-8 py-14">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white">
                <Box size={18} />
              </div>
              <div>

                <h2 className="font-semibold">
                  LogisTrack
                </h2>

                <p className="text-xs text-gray-500">
                  Logistics Management
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-semibold text-gray-900"> Welcome Back </h2>

            <p className="text-gray-500 mt-2 mb-8">
              Sign in untuk melanjutkan ke dashboard.
            </p>

            {apiError && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {apiError}
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div
                  className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
                    errors.email
                      ? "border-red-400"
                      : "border-gray-300 focus-within:border-blue-600"
                  }`}
                >
                  <Mail
                    size={18}
                    className="text-gray-400 mr-3"
                  />

                  <input
                    {...register("email", {
                      required: "Email wajib diisi",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Format email tidak valid",
                      },
                    })}
                    type="email"
                    placeholder="admin@gmail.com"
                    autoComplete="email"
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                </div>

                {errors.email && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <div
                  className={`flex items-center border rounded-lg px-4 py-3 transition-colors ${
                    errors.password
                      ? "border-red-400"
                      : "border-gray-300 focus-within:border-blue-600"
                  }`}
                >
                  <Lock
                    size={18}
                    className="text-gray-400 mr-3"
                  />

                  <input
                    {...register("password", {
                      required: "Password wajib diisi",
                      minLength: {
                        value: 6,
                        message: "Minimal 6 karakter",
                      },
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    className="flex-1 bg-transparent outline-none text-sm"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="text-gray-400 hover:text-gray-700 transition"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-red-500 text-xs mt-2">
                    {errors.password.message}
                  </p>
                )}

              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"/>
                  Remember me
                </label>

                <button
                  type="button"
                  className="text-sm text-blue-700 hover:underline">
                  Forgot Password?
                </button>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium transition disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                )}

                {loading
                  ? "Signing In..."
                  : "Sign In"}
              </button>

              <p className="text-center text-xs text-gray-500 mt-6 leading-6">
                Dengan masuk ke sistem, Anda menyetujui
                syarat penggunaan dan kebijakan privasi
                LogisTrack.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};