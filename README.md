# WebCraft AI — AI‑Powered Website Builder

WebCraft AI is an AI-powered website builder that aims to turn a plain-English prompt into a website you can preview, iterate on, and eventually publish.

## Project Status

This project is **in active development**.

The current workspace focuses on the front-end experience and UI scaffolding. Backend APIs and persistence are planned (see the Prisma schema), but are not wired up in this repo yet.

## What’s Implemented (Current)

- Prompt-based “Create with AI” landing flow (UI)
- Project listing view (includes mini iframe previews via `srcDoc`)
- Pricing page UI
- Step-based loading screen
- Core routing + shared layout components

## What’s Planned (Next)

- Backend generation API integration for the “Create with AI” flow
- Project persistence (users, projects, versions, conversations) via Postgres + Prisma
- Editor/preview workflow improvements (versioning, switching, saving)

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS (via `@tailwindcss/vite`)
- React Router
- Lucide icons
- Prisma schema (PostgreSQL) for the planned backend

## Getting Started

### Prerequisites

- Node.js (latest LTS recommended)
- npm

### Run the client

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
- `client/assets/schema.prisma` — Prisma schema for planned Postgres models

## Notes

- Some routes/pages are placeholders while the data layer is being integrated.
- Where applicable, TODOs mark intended API boundaries.

## Contributing

Contributions are welcome while the project is evolving. If you plan to make larger changes, consider opening an issue first to align on scope and direction.

## License

No license has been specified yet.

