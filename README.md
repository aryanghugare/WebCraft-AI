# WebCraft AI — AI‑Powered Website Builder

WebCraft AI is a (work-in-progress) AI-powered website builder that turns a plain-English prompt into a website you can preview, iterate on, and eventually publish.

The repo currently contains a Vite + React front-end with the core pages and UI scaffolding for:

- A prompt-based “Create with AI” landing flow
- Project listing (with mini iframe previews via `srcDoc`)
- Pricing page UI
- A step-based loader screen

Backend + database wiring is planned (see Prisma schema), but not implemented in this workspace yet.

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS (via `@tailwindcss/vite`)
- React Router
- Lucide icons
- Prisma schema (PostgreSQL) for the planned backend

## Getting Started

### Prerequisites

- Node.js (recommended: latest LTS)
- npm

### Run the web app (client)

```bash
cd client
npm install
npm run dev
```

Vite will print the local URL (typically `http://localhost:5173`).

### Build / lint / preview

```bash
cd client
npm run build
npm run lint
npm run preview
```

## Project Structure

- `client/` — React + Vite front-end
	- `src/pages/` — routes (Home, Pricing, My Projects, etc.)
	- `src/components/` — shared UI components (Navbar, loader steps, editor panel, etc.)
	- `src/assets/` — local assets + sample data used in the UI
- `server/` — placeholder for a future backend
- `client/assets/schema.prisma` — Prisma schema for planned Postgres models (users, projects, versions, conversations)

## Current Status / Notes

- The UI is functional for navigation and layout.
- AI generation and persistence are not wired up yet (you’ll see TODOs where API calls should happen).
- Some pages/routes are placeholders while the data layer is being integrated.

## Roadmap (high-level)

- Connect the “Create with AI” flow to a backend generation API
- Save projects, versions, and conversations in Postgres (Prisma)
- Add project editor + version switching in Preview

