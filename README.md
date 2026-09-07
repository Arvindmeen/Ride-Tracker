# RideTracker — Distributed Real-Time Mobility Platform

```
d:\Ride Tracker\
├── frontend/          ← React + Vite + JS + Tailwind CSS (this is the current work)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── mock/
│   │   ├── constants/
│   │   ├── styles/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
└── backend/           ← Node.js + Express (future work)
    ├── src/
    │   ├── api/           ← REST API routes
    │   ├── services/      ← Business logic
    │   ├── kafka/         ← Producers / Consumers (future)
    │   ├── redis/         ← GEO / Cache (future)
    │   ├── db/            ← PostgreSQL models (future)
    │   ├── flink/         ← Pricing engine stubs (future)
    │   ├── websocket/     ← Real-time WS server (future)
    │   └── middleware/    ← Auth / Rate-limit (future)
    ├── package.json
    └── .env.example
```

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

### Backend (future)
```bash
cd backend
npm install
npm run dev
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, Tailwind CSS |
| State | Zustand |
| Server State | TanStack Query (ready) |
| Charts | Recharts |
| Maps | Leaflet + React-Leaflet |
| Backend (future) | Node.js, Express |
| Database (future) | PostgreSQL |
| Cache (future) | Redis + Redis GEO |
| Messaging (future) | Apache Kafka |
| Streaming (future) | Apache Flink |
| Search (future) | Elasticsearch |
| Real-time (future) | WebSocket (ws) |
| Auth (future) | JWT + RBAC |
| Payments (future) | Razorpay / Stripe |
| Infra (future) | Docker, Kubernetes |
| Spatial (future) | H3 geo-indexing |
