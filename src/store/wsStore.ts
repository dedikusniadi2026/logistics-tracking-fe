import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WsConnectedState = "checking" | "online" | "offline" | "error";

interface WsState {
  wsStatus: WsConnectedState;
  setWsStatus: (status: WsConnectedState) => void;
}

export const useWsStore = create<WsState>()(
  persist<WsState>(
    (set) => ({
      wsStatus: "checking",
      setWsStatus: (status) => set({ wsStatus: status }),
    }),
    {
      name: "ws-store",
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      migrate: (persisted, version) => {
        // 🚀 Migration guide:
        //   if (version < 2) { /* handle breaking changes */ }
        //   if (version < 3) { /* handle next migration */ }
        return persisted as WsState;
      },
    }
  )
);
