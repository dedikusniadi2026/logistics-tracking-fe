🚚 Logistics Tracking — Real-time Fleet Dashboard
From 30s map lag → <1s live tracking on low-end warehouse tablets.
Built for national logistics handling 1.2M parcels/year, 2,000 dispatchers peak.

Portfolio: https://www.dedikusniadi.my.id/

🔥 Why This Repo Exists
National logistics operator called me when:

Dispatchers complained map lag 30 seconds — but worked fine on my MacBook
Warehouse tablets are low-end Android, 2GB RAM
6 squads ship to same SPA, single Redux store → conflict
LCP 8.1s
This repo is the sanitized rebuild of how I fixed it. No company code, all mock data.

✅ What I Fixed → Result
30s → <1s (Web Worker + split WS)
8.1s → 2.4s on low-end tablets (code-split Leaflet)
5fps → 60fps (virtualization + memo)
35% fewer UI bugs (design tokens)
🏗 Architecture
Edge CDN / WAF
   ↓
React SPA (Vite) — code-split
   ├─ Web Worker → WS /ws/tracking (live <1s)
   ├─ REST → /api/parcels
   └─ Leaflet Maps (lazy, only when tab visible)
        ↓
Zustand per domain (not single Redux store)
First tried Redux single store → mess with 6 squads. Moved to Zustand per domain so squads can ship independently.

📂 Key Files To Review (30 seconds)
src/store/trackingStore.ts - Zustand per domain
src/modules/tracking/useTrackingSocket.ts - WebSocket split + Worker pattern
src/modules/map/MapView.tsx - Leaflet code-split
🚀 How to Run
git clone https://github.com/dedikusniadi2026/logistics-tracking-fe.git
cd logistics-tracking-fe
npm install
npm run dev
Runs with mock data from src/mock/parcels.mock.json.

🛠 Stack
React 18, TypeScript, Vite, Zustand, Leaflet + OSM, TailwindCSS

👤 Author — Open for Remote
Dedi Kusniadi — Senior Frontend Engineer | 13+ Years
Ex-Axiata Digital Labs (2020-2023)

Portfolio: https://www.dedikusniadi.my.id/
LinkedIn: https://www.linkedin.com/in/dedi-kusniadi/
Email: dedikusniadi.bisnis@gmail.com
Note: Personal rebuild for portfolio. No proprietary code or real data.

For HRD / Hiring Manager: This repo shows how I think: Problem → What didn't work → Fix → Result with metrics. I can walk through this in 15 min interview.