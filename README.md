# 🚚 Logistics Tracking — Real-time Fleet Dashboard

> **From 30s map lag → <1s live tracking on low-end warehouse tablets.**  
> Built for national logistics handling **1.2M parcels/year, 2,000 dispatchers peak**.

**Live:** https://logistics-tracking-fe.vercel.app  
**Portfolio:** https://www.dedikusniadi.my.id/  
**Backend:** https://github.com/dedikusniadi2026/logistics-tracking-be

### 🔥 Why This Repo Exists

- Dispatchers complained **map lag 30 seconds** — but worked fine on my MacBook
- Warehouse tablets are **low-end Android**, 2GB RAM
- 6 squads ship to same SPA, single Redux store → conflict
- LCP 8.1s

### ✅ Fix → Result

- 30s → <1s (Web Worker + split WS)
- 8.1s → 2.4s (code-split Leaflet)
- 5fps → 60fps (virtualization)
- 35% fewer UI bugs (design tokens)

### 🏗️ Architecture

React SPA → Web Worker (WS) + REST + Leaflet (lazy) → Zustand per domain

### 📂 Review in 30s

- `src/store/trackingStore.ts`
- `src/modules/tracking/useTrackingSocket.ts`
- `src/modules/map/MapView.tsx`

### 🚀 Run

npm install
npm run dev