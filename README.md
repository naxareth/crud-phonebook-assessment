# Paper Directory — Full-Stack Phonebook Assessment

A personal address book directory built with **React (Vite)**, an **Express.js API**, and **Supabase PostgreSQL**. Designed in an editorial "Paper Directory" aesthetic with warm ivory tones, ink charcoal typography, forest green accents, and alphabetical groupings.

---

## 🏛️ Architecture & Request Flow

```
[ Browser / React Client ]
           │
           │ (Relative /api/contacts requests)
           ▼
[ Express.js Backend Server ]  (Port 3000)
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

### Why This Stack?
> *"I chose React, Express, and Supabase PostgreSQL to deliver a persistent CRUD phonebook within the assessment time limit. React handles the interactive interface, Express validates incoming requests and exposes clean REST endpoints, and Supabase hosts the PostgreSQL database. This separation demonstrates full-stack proficiency while reducing manual database infrastructure setup."*

---

## ✨ Features & Assessment Requirements

1. **Create Contact (`POST /api/contacts`)**: Add a contact with Full Name, Phone Number, and optional Email Address.
2. **Read Directory (`GET /api/contacts`)**: Display all contacts sorted alphabetically, grouped cleanly under letter headings (`A`, `B`, `C`...).
3. **Update Contact (`PUT /api/contacts/:id`)**: Edit an existing entry in place using the reusable side panel.
4. **Delete Contact (`DELETE /api/contacts/:id`)**: Remove a contact after modal confirmation.
5. **Data Persistence**: Changes persist across page refreshes and server restarts via Supabase PostgreSQL.
6. **Dual Validation (Frontend & Backend)**:
   - Trims whitespace on all fields.
   - Requires non-empty name and phone number.
   - Permissive international phone format (preserves leading zeros, `+` prefix, dashes, parentheses).
   - Validates email format when supplied, stores omitted emails as `NULL`.
   - Rejects malformed UUIDs with `400 Bad Request`.
7. **Comprehensive UI States**: Loading skeleton, empty directory state, no search results state, inline form errors, toast success banners, and error banners with retry.
8. **Responsive Editorial Design**: Usable across desktop and mobile devices without horizontal scrolling.

---

## 📁 Project Structure

```
crud-phonebook-assessment/
├── client/                     # Frontend (React + Vite + Vanilla CSS)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContactFormPanel.jsx  # Reusable New/Edit Drawer
│   │   │   ├── ContactList.jsx       # Alphabetical letter groups
│   │   │   ├── ContactRow.jsx        # Individual contact entry
│   │   │   ├── ControlBar.jsx        # Search & entry counter
│   │   │   ├── DeleteModal.jsx       # Delete confirmation dialog
│   │   │   ├── Header.jsx            # Directory title & top action
│   │   │   ├── StateViews.jsx        # Loading, Empty, Error states
│   │   │   └── Toast.jsx             # Accessible status announcements
│   │   ├── services/
│   │   │   └── api.js                # Relative /api/contacts fetch client
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
├── paper-directory-ui-design.md
└── phonebook-assessment-plan.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (20.19.x or later in Node 20, or Node 22.12+; Node 24 recommended)
- A free [Supabase](https://supabase.com) account & project

### 2. Database Setup (Supabase)
1. In your Supabase project dashboard, open the **SQL Editor**.
2. Open [`supabase/schema.sql`](supabase/schema.sql) from this repository.
3. Paste the contents and click **Run**. This creates the `contacts` table, indexes, RLS configuration, and initial fictional seed records.

### 3. Environment Configuration
Create a `.env` file in the root directory (copied from `.env.example`):

```bash
cp .env.example .env
```

Populate `.env` with your Supabase credentials (found in **Project Settings &rarr; API**):
```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_secret_or_service_role_key
```

### 4. Install Dependencies
```bash
npm install
npm --prefix client install
```

---

## 💻 Running the Application

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

## 🧪 Automated Testing

Run the automated validation and integration test suite:
```bash
npm test
```

---

## 🎬 Presentation & Demo Script (2-Minute Walkthrough)

1. **Architecture Overview (30s)**:
   - Point out the 3-tier architecture: React frontend communicates with Express REST API (`/api/contacts`), which validates and talks to Supabase PostgreSQL.
   - In production, Express serves both the API and the compiled React assets from a single port.
2. **Create Operation**:
   - Click **Add a contact**.
   - Attempt to submit blank fields &rarr; demonstrate inline validation error highlights.
   - Enter fictional contact (e.g. `Eleanor Vance`, `+1 (555) 432-8765`, `eleanor@example.com`).
   - Click **Save contact** &rarr; verify toast announcement ("Contact added") and alphabetical insertion.
3. **Read & Search**:
   - Observe automatic grouping under letter sections (`E`, `J`, etc.).
   - Type in the search box &rarr; demonstrate instant filtering by name or phone.
4. **Update Operation**:
   - Click **Edit** on a contact.
   - Modify the phone number (e.g. change to `+1 (555) 000-9999`) and save &rarr; observe immediate list update and "Contact updated" confirmation.
5. **Persistence**:
   - Refresh the browser (F5) &rarr; verify all records and updates remain intact from PostgreSQL.
6. **Delete Operation**:
   - Click **Delete** on a contact.
   - Show the confirmation dialog ("Delete [Name]?", "This contact will be permanently removed.").
   - Confirm deletion &rarr; verify removal and "Contact deleted" toast.
7. **Security & Limitations Note**:
   - Server holds Supabase credentials in server-only environment variables (never exposed to client).
   - In a production personal app, authentication (e.g. Supabase Auth / JWT) would be added to restrict access per user.

---

## 📝 Design Decisions & Tradeoffs

- **Paper Directory Styling**: Chosen to evoke a physical personal address book with tactile warmth (ivory `#F5F1E8`, dark charcoal ink `#252820`, forest green `#365744`), avoiding generic cookie-cutter dashboards.
- **Single Reusable Drawer**: Both Create and Edit reuse one accessible side panel with focus trap, ESC closing, and focus restoration to reduce DOM complexity.
- **Server-Side Supabase Access**: Express acts as the single point of truth for business logic and validation, preventing client-side key leakage.

## Deployment and access

This assessment has **no authentication**. Anyone who can reach the Express API can read, create, edit, and delete every contact. Supabase RLS protects direct database access; it does not restrict these public Express routes. Use fictional demo contacts only.

Deploy the repository root to a Node web service (Node 24):

- Build command: `npm ci && npm --prefix client ci && npm run build`
- Start command: `npm start`
- Set `NODE_ENV=production`, `SUPABASE_URL`, and `SUPABASE_KEY` in the host's private environment settings. Let the host provide `PORT`.
- Never use a `VITE_` variable for database credentials. Do not commit `.env`.
- Apply `supabase/schema.sql` in the Supabase SQL editor. Repeated runs skip existing deterministic seed IDs; older seeds created with random IDs are not automatically deduplicated.
- `/api/health` confirms process health and configuration presence only, not a successful database connection. Verify `/api/contacts` and a complete CRUD flow separately.
- On the hosted URL, create a fictional contact, edit it, refresh, redeploy and confirm it persists, then delete it. Test cancel and invalid input too.

Run `npm run build` before `npm test`: the static-serving test requires `client/dist`.

## Verification record (2026-09-28)

- Read both planning documents; no repository `AGENTS.md` was found.
- Production build passed; 21 automated tests passed; client lint exited successfully without diagnostics.
- Actual Supabase read, browser create and edit, leading-zero phone preservation, optional email, and reload persistence passed on the built app served by Express at port 3001.
- API deletion returned 204; a fresh read confirmed removal; a repeated deletion returned 404. Only the fictional verification contact was removed. Final delete-button submission was not browser-tested.
- Browser checks passed for required-field and email validation, both modal Tab/Shift+Tab boundaries, background inert attribute, and cancel focus restoration. Desktop was visually inspected; the mobile form fit a 390px viewport without horizontal overflow.
- `.env` is untracked; the configured server key was absent from generated frontend assets. No credentials were printed.
- Public deployment, persistence across redeployment, database RLS policy inspection, SQL rerun execution, and browser recovery from a failed save remain unverified.

Interview note: deterministic seed IDs must also pass route validation; modal focus must be restored after React removes `inert`; a configuration health check alone cannot prove CRUD works. The local integration checks exercised the real database instead of inferring success from a health response.

Repeat the API smoke check against the running local app or your deployed origin:

```bash
node scripts/smoke-crud.js http://localhost:3001
# Or: node scripts/smoke-crud.js https://your-app-host
```

This creates a uniquely named fictional contact, verifies validation and CRUD against the actual database, then deletes only that contact. It does not test the browser or persistence across redeployment.
