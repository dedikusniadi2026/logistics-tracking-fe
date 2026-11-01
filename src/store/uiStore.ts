import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  darkMode: boolean;
  sidebarOpen: boolean;

  toggleDarkMode: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist<UiState>(
    (set) => ({
      darkMode: false,
      sidebarOpen: true,

      toggleDarkMode: () =>
        set((state) => ({ darkMode: !state.darkMode })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "ui-store",
      version: 1,
      migrate: (persisted, version) => {
        // 🚀 Migration guide:
        //   if (version < 2) { /* handle breaking changes */ }
        //   if (version < 3) { /* handle next migration */ }
        return persisted as UiState;
      },
    }
  )
);
