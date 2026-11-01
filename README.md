🚚 Logistics Tracking — Real-time Fleet Dashboard
From 30s map lag → <1s live tracking on low-end warehouse tablets.
Built for national logistics handling 1.2M parcels/year, 2,000 dispatchers peak.

[Live Demo](https://logistics-tracking-fe.vercel.app)
[Stack]()
[Performance]()
[TypeScript]()

Portfolio Case Study: https://www.dedikusniadi.my.id/
Backend Repo: https://github.com/dedikusniadi2026/logistics-tracking-be

🔥 Why This Repo Exists (The Real Problem)
National logistics operator called me when:

Dispatchers complained map lag 30 seconds — but worked fine on my MacBook
Warehouse tablets are low-end Android, 2GB RAM
6 squads ship to same SPA, stepping on each other (single Redux store)
Leaflet maps loaded upfront → LCP 8.1s
This repo is the sanitized rebuild of how I fixed it. No company code, all mock data.

✅ What I Fixed → Result
Before	After	How
30s map lag	<1s	Split WebSocket: tracking in Web Worker, routing via REST
8.1s LCP	2.4s on low-end tablets	Code-split Leaflet, lazy load maps, tree-shake
5fps with 50k rows	60fps	Virtualization + memo
35% UI bugs / sprint	Token-based system	Design tokens from Figma
🏗️ Architecture
Edge CDN / WAF
   ↓
React SPA (Vite) — code-split
   ├─ Web Worker → WS /ws/tracking (live <1s)
   ├─ REST → /api/parcels, /api/parcels/:id/route
   └─ Leaflet Maps (lazy, only when tab visible)
        ↓
Zustand per domain (not single Redux store)
  - trackingStore.ts
  - routingStore.ts
  - uiStore.ts
Why Zustand per domain?
First tried Redux single store → mess with 6 squads merging conflicts. Moved to Zustand per domain so squads can ship independently.

🧠 Engineering Notes — What Didn't Work (Honest Version)
First version put everything in one WebSocket — map froze when routing service slow.
Split: tracking in Web Worker, routing separate REST.
First Redux single store → conflict. Moved to Zustand per domain.
First Leaflet loaded upfront → 8.1s. Code-split + lazy → 2.4s.

This is what I explain in interviews.

📂 Key Files HRD / Tech Lead Should Review (30 seconds)
src/store/trackingStore.ts           # Zustand per domain - fix for 6 squads
src/modules/tracking/useTrackingSocket.ts  # WebSocket split + Worker pattern
src/modules/map/MapView.tsx          # Leaflet code-split + lazy loading
src/mock/parcels.mock.json           # 20 mock parcels (Bandung-Jakarta)
🚀 How to Run (1 minute)
git clone https://github.com/dedikusniadi2026/logistics-tracking-fe.git
cd logistics-tracking-fe
npm install
npm run dev
# FE: http://localhost:5173
# Set BE URL in .env: VITE_WS_URL=ws://localhost:8080/ws/tracking
.env.example

VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws/tracking
With Backend (optional):

# BE repo: https://github.com/dedikusniadi2026/logistics-tracking-be
# MODE=mock npm run dev → BE on :8080
📸 Demo
Add 10-sec GIF here after deploy: map with 20 parcels moving <1s

Live tracking <1s even on throttled 3G
Tablet mode: low-end Android 2GB RAM → still 2.4s LCP
2,000 dispatchers simulated peak
🛠️ Stack
Frontend: React 18, TypeScript (strict), Vite, Zustand, Leaflet + OpenStreetMap, TailwindCSS
Performance: Web Workers, code-splitting, lazy loading, virtualization
Tooling: ESLint strict, Prettier, Husky

👤 Author — Open for Remote
Dedi Kusniadi — Senior Frontend Engineer | 13+ Years
Ex-Axiata Digital Labs (2020-2023) • BTPN Banking Compliance • National Logistics

Specialty: Fixing slow dashboards & messy frontend code
Location: Bandung → Remote | Available Immediately
Links: Portfolio | LinkedIn | dedikusniadi.bisnis@gmail.com
Note: This is a personal rebuild for portfolio. No proprietary code, credentials, or real customer data. Inspired by real challenges, all code original with mock data.

📄 License
MIT — Portfolio only

If you are HRD / Hiring Manager:
This repo shows how I think: Problem → What didn't work → Fix → Result with metrics.
I can walk through this in 15 minutes interview + show BE repo architecture.

Let’s talk: Open for Frontend Performance Audit, Slow Dashboard Rescue, or Design System setup.
