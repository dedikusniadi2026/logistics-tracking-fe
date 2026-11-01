import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  user: any;

  login: (token: string, user: any) => void;
  setUser: (user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set) => ({
      token: null,
      user: null,

      login: (token, user) => {
        set({ token, user });
      },

      setUser: (user) => {
        set({ user });
      },

      logout: () => {
        set({ token: null, user: null });
      },
    }),
    {
      name: "auth-store",
      version: 1,
      migrate: (persisted, version) => {
        // 🚀 Migration guide:
        //   if (version < 2) { /* handle breaking changes */ }
        //   if (version < 3) { /* handle next migration */ }
        return persisted as AuthState;
      },
    }
  )
);
