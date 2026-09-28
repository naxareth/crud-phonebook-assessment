# Paper Directory — Full-Stack Phonebook Assessment

A personal address book directory built with **React (Vite)**, an **Express.js API**, and **Supabase PostgreSQL**. Designed in an editorial "Paper Directory" aesthetic with warm ivory tones, ink charcoal typography, forest green accents, and alphabetical groupings.

---

## 1. Architecture & Request Flow

```
[ Browser / React Client ]
           │
           │ (Relative /api/contacts requests)
           ▼
[ Express.js Backend Server ]  (Port 3000 / Serverless on Vercel)
    ├── Request Validation & Sanitization
    ├── Centralized Error Handling
    └── Static SPA Serving (Production)
           │
           │ (Supabase JS Client with Server Key)
           ▼
[ Supabase PostgreSQL Database ]
    ├── contacts table
    ├── Data integrity constraints (NOT NULL, nonblank)
    └── Row Level Security (RLS)
```

### Stack Rationale
> *"I chose React, Express, and Supabase PostgreSQL to deliver a persistent CRUD phonebook within the assessment time limit. React handles the interactive interface, Express validates incoming requests and exposes clean REST endpoints, and Supabase hosts the PostgreSQL database. This separation demonstrates full-stack proficiency while reducing manual database infrastructure setup."*

---

## 2. Features & Assessment Requirements

* **Create Contact (`POST /api/contacts`)**: Add a contact with Full Name, Phone Number, and optional Email Address.
* **Read Directory (`GET /api/contacts`)**: Display all contacts sorted alphabetically, grouped cleanly under letter headings (`A`, `B`, `C`...).
* **Update Contact (`PUT /api/contacts/:id`)**: Edit an existing entry in place using the reusable side panel.
* **Delete Contact (`DELETE /api/contacts/:id`)**: Remove a contact after modal confirmation.
* **Data Persistence**: Changes persist across page refreshes and server restarts via Supabase PostgreSQL.
* **Dual Validation (Frontend & Backend)**:
  - Trims and collapses internal whitespace on all fields.
  - Strict name validation (letters, spaces, hyphens, apostrophes, dots; numbers and symbols rejected).
  - Permissive ITU-T phone format (digits, spaces, hyphens, parens, dots, slashes, optional leading `+`).
  - Strict email format with IANA/ccTLD extension validation, stores omitted emails as `NULL`.
  - Rejects malformed UUIDs with `400 Bad Request`.
* **Comprehensive UI States**: Loading skeleton, empty directory state, no search results state, inline form errors, toast success banners, and error banners with retry.
* **Visual Focus & Auto-Scroll**: Viewport smoothly scrolls to and highlights newly added/edited contacts with an editorial pulse animation.
* **Accessible Modals & Drawers**: Focus trapping (`Tab`/`Shift+Tab`), background `inert` attribute, and `Esc` key dismissal with focus restoration.
* **Responsive Editorial Design**: Usable across desktop and mobile devices without horizontal scrolling.

---

## 3. Project Structure

```
crud-phonebook-assessment/
├── api/
│   └── index.js                # Vercel serverless function entry point
├── client/                     # Frontend (React + Vite + Vanilla CSS)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContactFormPanel.jsx  # Reusable New/Edit Drawer
│   │   │   ├── ContactList.jsx       # Alphabetical letter groups
│   │   │   ├── ContactRow.jsx        # Individual contact entry with avatar badge
│   │   │   ├── ControlBar.jsx        # Search toolbar & entry counter
│   │   │   ├── DeleteModal.jsx       # Delete confirmation dialog
│   │   │   ├── Header.jsx            # Directory title & top action
│   │   │   ├── StateViews.jsx        # Loading, Empty, Error states
│   │   │   └── Toast.jsx             # Accessible status announcements
│   │   ├── services/
│   │   │   └── api.js                # Relative /api/contacts fetch client
│   │   ├── utils/
│   │   │   └── validation.js         # Client-side input validation
│   │   ├── App.jsx                   # Main state orchestration
│   │   ├── index.css                 # Paper Directory design tokens
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js          # Configured with proxy to port 3000
├── server/                     # Backend (Node.js + Express)
│   ├── routes/
│   │   └── contacts.js         # GET, POST, PUT, DELETE /api/contacts
│   ├── tests/
│   │   ├── api.test.js         # API integration tests
│   │   └── validation.test.js  # Validation logic unit tests
│   ├── utils/
│   │   └── validation.js       # Input sanitization and rules
│   ├── app.js                  # Express middleware & static routing
│   ├── config.js               # Environment config loader
│   ├── db.js                   # Supabase client singleton
│   └── index.js                # Server entry point
├── supabase/
│   └── schema.sql              # PostgreSQL schema, constraints, RLS, seed data
├── .env.example                # Configuration template
├── .gitignore
├── package.json                # Unified scripts for dev, build, start, test
├── vercel.json                 # Vercel deployment configuration
└── README.md
```

---

## 4. Getting Started

### 4.1 Prerequisites
* Node.js (`>=20.19.0` or `>=22.12.0`; Node 24 recommended)
* A free [Supabase](https://supabase.com) account & project

### 4.2 Database Setup (Supabase)
1. In your Supabase project dashboard, open the **SQL Editor**.
2. Open [`supabase/schema.sql`](supabase/schema.sql) from this repository.
3. Paste the contents and click **Run**. This creates the `contacts` table, indexes, RLS configuration, and idempotent deterministic seed records.

### 4.3 Environment Configuration
Create a `.env` file in the root directory (copied from `.env.example`):

```bash
cp .env.example .env
```

Populate `.env` with your Supabase credentials (found in **Project Settings → API**):
```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_secret_or_service_role_key
```

### 4.4 Install Dependencies
```bash
npm install
npm --prefix client install
```

---

## 5. Running the Application

### Development Mode (Concurrent Vite + Express)
Runs the Express API on port 3000 and the Vite dev server on port 5173 with hot-module reloading:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### Production Mode (Unified Single-Origin)
Builds the React client into `client/dist` and starts the Express server to serve both API and frontend on a single port:
```bash
npm run build
npm start
```
Open **`http://localhost:3000`** in your browser.

---

## 6. Automated Testing

Run the automated validation and integration test suite (22 unit & integration tests):
```bash
npm test
```

Run client code quality and lint checks:
```bash
npm --prefix client run lint
```

---

## 7. Deployment & Hosting

### Option A: Deploy to Vercel (One-Click / Serverless)
This repository includes [`vercel.json`](vercel.json) and [`api/index.js`](api/index.js) preconfigured for Vercel:
1. Push this repository to GitHub / GitLab.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** → **Import Repository**.
3. Under **Environment Variables**, add:
   - `SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `SUPABASE_KEY`: `your-supabase-key`
   - `NODE_ENV`: `production`
4. Click **Deploy**.

### Option B: Deploy to Node Web Service (Render, Railway, Fly.io)
- Build command: `npm ci && npm --prefix client ci && npm run build`
- Start command: `npm start`
- Set `NODE_ENV=production`, `SUPABASE_URL`, and `SUPABASE_KEY` in the host's private environment variables. Let the platform provide `PORT`.

---

## 8. Presentation & Demo Script (2-Minute Walkthrough)

1. **Architecture Overview (30s)**:
   - Point out the 3-tier architecture: React frontend communicates with Express REST API (`/api/contacts`), which validates and talks to Supabase PostgreSQL.
   - In production, Express serves both the API and the compiled React assets from a single port.
2. **Create Operation**:
   - Click **Add a contact**.
   - Attempt to submit blank or invalid fields → demonstrate inline validation error highlights.
   - Enter contact (e.g. `Beatrix Thorne`, `+1 (555) 432-8765`, `beatrix@example.com`).
   - Click **Save contact** → verify toast announcement ("Contact added"), auto-scroll, and visual pulse highlight.
3. **Read & Search**:
   - Observe automatic alphabetical grouping under letter sections (`B`, `J`, etc.) and monogram avatar badges.
   - Type in the search box → demonstrate instant filtering by name or phone.
4. **Update Operation**:
   - Click **Edit** on a contact.
   - Modify the phone number (e.g. change to `+1 (555) 000-9999`) and save → observe immediate list update and "Contact updated" confirmation.
5. **Persistence**:
   - Refresh the browser (F5) → verify all records and updates remain intact from PostgreSQL.
6. **Delete Operation**:
   - Click **Delete** on a contact.
   - Show the confirmation dialog ("Delete [Name]?", "This contact will be permanently removed.").
   - Confirm deletion → verify removal and "Contact deleted" toast.
7. **Security & Limitations Note**:
   - Server holds Supabase credentials in server-only environment variables (never exposed to client).
   - In a production personal app, authentication (e.g. Supabase Auth / JWT) would be added to restrict access per user.

---

## 9. Design Decisions & Tradeoffs

* **Paper Directory Styling**: Chosen to evoke a physical personal address book with tactile warmth (ivory `#F5F1E8`, dark charcoal ink `#252820`, forest green `#365744`), avoiding generic cookie-cutter dashboards.
* **Single Reusable Drawer**: Both Create and Edit reuse one accessible side panel with focus trap, ESC closing, and focus restoration to reduce DOM complexity.
* **Server-Side Supabase Access**: Express acts as the single point of truth for business logic and validation, preventing client-side key leakage.
* **Auto-Scroll & Focus Feedback**: Automatically centers the viewport and pulses the active row upon creation or update to prevent lost-in-list disorientation.

---

## 10. Verification Record

* Production build passes cleanly with Vite (`npm run build`).
* Automated test suite passes (22/22 unit and integration tests).
* Client linter passes with 0 warnings and 0 errors (`oxlint`).
* Real Supabase read, browser create/edit, leading-zero phone preservation, optional email, and reload persistence verified on built app.
* Modal keyboard focus trapped (`Tab`/`Shift+Tab`), background marked `inert`, and `Esc` key cleanly closes dialogs.
* No credentials or private environment variables leaked to frontend bundles.
