# Marloa Live — Ops Dashboard Prototype

A working prototype of **Marloa Live**, the operations view Marloa's own site
describes as *"a planned operations view for the people who supervise, join
or take over active conversations"* and marks **in development**. This
project builds that missing piece, plus a lightweight version of the
**ASK** human-escalation flow, as a deployable MVP.

Built against the scope in `Marloa_Live_Prototype_Plan.pdf`: React +
Node/Express + Socket.io + MongoDB (Atlas free tier), with scripted/mocked
AI responses so the demo runs with zero API cost and no telephony
dependency.

## What it does

- A **call simulator** plays scripted scenarios (booking, enquiry, an
  escalation, a lead) message-by-message on a timer — no real telephony or
  LLM calls.
- A **live ops dashboard** shows the call queue in real time over
  Socket.io, color-coded by status: `ai_handling` → `needs_human` →
  `human_active` → `resolved`.
- An operator can open any call, read the live transcript, **take over**,
  send messages as the human, and **mark it resolved**.
- Resolving a call creates a **structured outcome** (booking / enquiry /
  lead), visible in a separate outcomes table — the "structured records"
  value prop Marloa markets but doesn't yet visualize.

## Project structure

```
marloa-live/
├── backend/     Express + Socket.io + Mongoose API and call simulator
└── frontend/    React (Vite) + Socket.io-client dashboard
```

## Running it locally

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and paste in a MongoDB Atlas (M0 free tier) connection string
npm install
npm run dev      # or: npm start
```

The API listens on `http://localhost:5000` and, by default, seeds three
demo calls on boot (`AUTO_SEED_DEMO=false` to disable).

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

Open `http://localhost:5173`. Use the "Start simulated call" control in the
top bar to fire off any of the five scripted scenarios on demand.

## API reference

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/calls` | List calls (optional `?status=`) |
| GET | `/api/calls/:id` | Full call with transcript |
| POST | `/api/calls` | Create a call |
| POST | `/api/calls/:id/messages` | Append a message (human sending = takeover) |
| PATCH | `/api/calls/:id/status` | Explicit status transition |
| POST | `/api/calls/:id/resolve` | Resolve + create structured Outcome |
| GET | `/api/outcomes` | List structured outcomes |
| GET | `/api/simulator/scenarios` | List scripted scenarios |
| POST | `/api/simulator/run` | Start a new simulated call |

## Socket.io events

**Server → client:** `call:new`, `call:message`, `call:status`, `outcome:new`
**Client → server:** `operator:takeover`, `operator:message`, `operator:resolve`

## Deliberate v1 scope cuts

Per the prototype plan: no real Twilio/voice integration, no real LLM calls
(scripted scenarios instead), single workspace / no multi-tenant auth, and
outcomes are stored in a mock collection rather than pushed to a real CRM.
See `backend/simulator/scenarios.js` for the scripted call scripts and
`Marloa_Live_Prototype_Plan.pdf` for the full one-week build plan this
prototype was built against.

## Deployment

- **Frontend:** Vercel (`npm run build`, output in `frontend/dist`)
- **Backend:** Render or Railway (`npm start`, set `MONGODB_URI` and
  `CLIENT_ORIGIN` env vars)
- **Database:** MongoDB Atlas M0 free tier
