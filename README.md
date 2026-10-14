# Keystone — MERN edition, with an AI agent

This is your original **Keystone** real estate app, converted from Spring Boot + PostgreSQL
to a **MERN stack** (MongoDB, Express, React, Node), plus a new **AI agent** that can search
listings, answer questions, send inquiries, and save favorites — by calling the same backend
functions the rest of the app uses.

The React frontend is functionally unchanged (same pages, same components, same CSS) — only
the API layer underneath it changed. The only frontend addition is the chat widget
(`AgentChat`) in the bottom-right corner of every page.

## What changed

| | Before | Now |
|---|---|---|
| Backend | Java 17, Spring Boot 3, Spring Security | Node.js, Express |
| Database | PostgreSQL (JPA/Hibernate) | MongoDB (Mongoose) |
| Auth | JWT (jjwt) | JWT (jsonwebtoken) + bcryptjs |
| File upload | Spring MultipartFile | multer → Cloudinary (local disk fallback for dev) |
| Email | JavaMailSender | nodemailer |
| Frontend | React 18 + Vite | **Unchanged** — React 18 + Vite |
| New | — | **AI agent** (`/api/agent/chat`) with tool-calling into real app functions |
| New | — | **Production hardening**: helmet, rate limiting, input validation, NoSQL-injection guarding, boot-time config checks |
| New | — | **Animated UI**: app-opening intro, page transitions, animated auth pages, hover motion on listing cards |

The REST API contract is identical (`/api/properties`, `/api/auth/login`, etc. — same request/response
shapes), so the frontend needed zero changes to its API layer.

## Security — what's in place, and what you still need to do

**Already built in:**
- `helmet` — standard security headers (CSP-friendly defaults, no `X-Powered-By`, etc.)
- `express-rate-limit` — tight limits on `/api/auth/*` (10/15min, failed attempts only), the AI agent
  (12/min per logged-in user, or per IP for guests), public inquiry submission (20/hour), and a
  generous baseline (300/15min) across the rest of the API
- `express-mongo-sanitize` — strips `$`/`.` operators from request bodies, blocking NoSQL injection
- `hpp` — blocks HTTP parameter-pollution tricks (`?price=1&price=2`)
- `zod` validation on every write endpoint (register, login, property create/update, inquiries,
  reviews, agent chat) — bad input gets a clean `400` with field-level messages, never reaches your DB
- Centralized error handling that converts Mongoose `CastError`/`ValidationError`/duplicate-key
  errors into clean `400`s instead of leaking internals as `500`s
- **Boot-time config validation** (`src/config/env.js`) — the server refuses to start if `JWT_SECRET`
  is missing, too short, or still the placeholder value, and (in production) if `CLIENT_ORIGIN` points
  at `localhost` or the agent is enabled without an API key. This is the single most important
  safety net here — it turns "forgot to change a secret" from a silent vulnerability into a startup crash.
- Cloudinary file storage with local-disk fallback (see below)

**You still need to do, before real users:**
- Generate a fresh `JWT_SECRET` for production — don't reuse your dev one
  (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Set `NODE_ENV=production` and a real `CLIENT_ORIGIN` (your actual frontend domain) on your host
- Configure the three `CLOUDINARY_*` vars — production **will** warn on boot if they're missing
- Put the whole thing behind HTTPS (your hosting platform almost certainly does this for you —
  Render, Railway, Vercel, Netlify, Cloudflare Pages all provision free TLS automatically)
- Consider adding: email verification on signup, a password-reset flow, structured logging
  (`pino`) + error tracking (Sentry), and automated tests — none of these are security bugs exactly,
  but they're what separates a demo from something you'd trust with real users' data

## Animated UI

- **App-opening intro** (`components/AppIntro.jsx`) — a brief brand animation on first load each
  browser session (skipped on subsequent navigations/visits within the session, via `sessionStorage`)
- **Page transitions** (`components/PageTransition.jsx` + `AnimatePresence` in `App.jsx`) — every
  route change gets a quick fade/rise instead of a hard cut
- **Animated Login/Register pages** — staggered field entrance, soft floating gradient orbs in the
  background, animated error messages, button press feedback
- **Listing card hover motion** — a subtle lift + shadow on `PropertyCard`, felt across Home,
  Favorites, My Listings, and the agent's inline results
- All motion respects `prefers-reduced-motion` and degrades to instant/no animation for users who've
  asked for that at the OS level

Built with `framer-motion` — if you want to extend the motion elsewhere (e.g. animate the property
detail gallery, or add a skeleton-loading state), that's the library to reach for; it's already a
dependency.

## Deploying it for real

A reasonable, mostly-free path:

1. **Database** — [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register), free M0 tier.
   Create a cluster, add a database user, allow network access from anywhere (`0.0.0.0/0`) or your
   host's IPs, and copy the connection string into `MONGO_URI`.
2. **File storage** — [Cloudinary free tier](https://cloudinary.com/users/register/free), no card
   required. Grab your cloud name, API key, and API secret from the dashboard.
3. **Backend hosting** — [Render](https://render.com) (or Railway/Fly.io) — new Web Service, point
   it at the `backend/` folder, build command `npm install`, start command `npm start`, and set all
   the env vars from `.env.example` (with real production values) in their dashboard.
4. **Frontend hosting** — [Vercel](https://vercel.com) or [Netlify](https://netlify.com) — point at
   `frontend/`, build command `npm run build`, output directory `dist`, and set `VITE_API_URL` to
   your deployed backend's URL.
5. Update the backend's `CLIENT_ORIGIN` to your deployed frontend's URL once you have it (it can be
   comma-separated if you're also keeping a staging URL around).

## The AI agent

`backend/src/services/agentTools.js` defines what the agent can do, each mapped straight onto
the same service functions your REST endpoints use:

- **search_properties** — natural-language search ("2BHK for rent in Pune under 35k")
- **get_property_details** — full detail on a specific listing
- **submit_inquiry** — sends a contact message to the owner, same as the contact form
- **add_favorite** / **list_favorites** — requires the user to be logged in

`backend/src/controllers/agentController.js` runs the tool-calling loop: it asks the LLM what
to do, executes any tool calls against your real data, feeds the results back, and repeats
until the model has a final answer — then returns `{ reply, properties, actions }` to the
frontend, which renders `reply` as a chat bubble and `properties` as real `PropertyCard`s.

**Provider:** wired to **Google Gemini** (`gemini-3.6-flash`) in `backend/src/services/llmClient.js` —
a genuinely free tier, no credit card required. Get a key at
https://aistudio.google.com/apikey, then set `GEMINI_API_KEY` in `backend/.env`.

To swap to a different provider (OpenAI, Groq, a local model via Ollama, etc.), you only need
to rewrite that one file — it converts to/from a normalized `{ role, content, tool_calls }`
message shape, so `agentTools.js` and `agentController.js` never need to change.

## Getting started (local development)

### 1. MongoDB

```bash
cd backend
docker compose up -d      # starts MongoDB on localhost:27017
```

(Or point `MONGO_URI` in `.env` at MongoDB Atlas instead of a local container.)

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed               # demo accounts + sample listings (safe to skip)
npm run dev                # http://localhost:8080
```

Add your `GEMINI_API_KEY` to `.env` to turn on the AI agent (it degrades gracefully — the rest
of the app works fine without it, the chat widget just shows an error if you try to use it).

**Demo accounts** (from `npm run seed`): `agent@demo.com` / `password123` (has listings),
`buyer@demo.com` / `password123`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev                # http://localhost:5173
```

## Project structure

```
realestate-app-mern/
├── backend/
│   ├── server.js                 Express app entry
│   └── src/
│       ├── config/db.js          Mongoose connection
│       ├── models/                User, Property, Favorite, Inquiry, Review
│       ├── middleware/            auth (JWT), upload (multer), error handler
│       ├── services/               business logic — reused by both REST controllers AND the agent
│       │   ├── propertyService.js
│       │   ├── favoriteService.js / inquiryService.js / reviewService.js
│       │   ├── emailService.js
│       │   ├── llmClient.js       ← swap LLM providers here
│       │   └── agentTools.js      ← what the agent is allowed to do
│       ├── controllers/           REST + agentController.js (the tool-calling loop)
│       ├── routes/
│       └── seed/seed.js
└── frontend/                     Unchanged React app + new AgentChat widget
    └── src/
        ├── api/agentService.js
        ├── components/AgentChat.jsx
        └── styles/agent.css
```

## Notes

- Mongo `_id`s are strings (not the old numeric Postgres IDs) — this doesn't affect the
  frontend since it always treated ids as opaque values.
- The agent never bypasses your existing rules: it calls the exact same service functions as
  the REST API, so ownership checks, auth requirements, and validation all still apply.
- For a real deployment, move file storage off local disk to S3/Cloudinary, and swap
  `docker-compose.yml`'s Mongo for Atlas.
