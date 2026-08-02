# WebCraft AI

WebCraft AI is a full-stack AI website builder that turns plain-English prompts into editable single-page websites.  
Users can generate a site, request revisions through chat, preview versions, publish/unpublish projects, and purchase credits.

## Features

- Prompt-to-website generation flow
- Revision workflow with conversation history
- Version snapshots and rollback
- Live iframe preview + simple visual element editor
- Public community feed for published projects
- Credits-based usage with Stripe checkout
- Email/password authentication (Better Auth)

## Tech Stack

### Frontend (`/home/runner/work/WebCraft-AI/WebCraft-AI/client`)
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Axios
- Sonner toasts
- Better Auth UI components

### Backend (`/home/runner/work/WebCraft-AI/WebCraft-AI/server`)
- Node.js + Express (TypeScript)
- Prisma + PostgreSQL
- Better Auth
- OpenRouter (via OpenAI SDK) for AI generation/revision
- Stripe for payments

## Monorepo Structure

```text
WebCraft-AI/
├── client/
│   ├── src/
│   │   ├── pages/          # App routes (home, projects, preview, community, auth, settings)
│   │   ├── components/     # Navbar, sidebar chat, preview/editor UI, footer, UI primitives
│   │   ├── configs/        # Axios client config
│   │   ├── lib/            # Auth client + shared utilities
│   │   └── types/          # Shared frontend interfaces
│   └── public/             # Static assets
└── server/
    ├── controllers/        # User, project, Stripe webhook handlers
    ├── routes/             # User and project API routes
    ├── middlewares/        # Auth protection middleware
    ├── lib/                # Prisma and Better Auth setup
    ├── prisma/             # Prisma schema + migrations
    └── configs/            # OpenRouter/OpenAI client
```

## Setup

## 1) Prerequisites

- Node.js (LTS recommended)
- npm
- PostgreSQL database
- Stripe account + webhook setup
- OpenRouter API key

## 2) Install dependencies

```bash
cd /home/runner/work/WebCraft-AI/WebCraft-AI/client && npm install
cd /home/runner/work/WebCraft-AI/WebCraft-AI/server && npm install
```

## 3) Configure environment variables

Create a `.env` file in `/home/runner/work/WebCraft-AI/WebCraft-AI/server`:

```env
PORT=3000
DATABASE_URL=******HOST:5432/DB_NAME

TRUSTED_ORIGINS=http://localhost:5173,http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_secret_here

AI_API_KEY=your_openrouter_api_key

STRIPE_SECRET_KEY=sk_test_or_live_key
STRIPE_WEBHOOK_SECRET=whsec_...
```

Create a `.env` file in `/home/runner/work/WebCraft-AI/WebCraft-AI/client`:

```env
VITE_BASEURL=http://localhost:3000
```

## 4) Run database migration/generation

```bash
cd /home/runner/work/WebCraft-AI/WebCraft-AI/server
npx prisma migrate dev
npx prisma generate
```

## 5) Start development servers

Backend:
```bash
cd /home/runner/work/WebCraft-AI/WebCraft-AI/server
npm run server
```

Frontend:
```bash
cd /home/runner/work/WebCraft-AI/WebCraft-AI/client
npm run dev
```

Client usually runs at `http://localhost:5173`, server at `http://localhost:3000`.

## Scripts

### Client
```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Server
```bash
npm run start
npm run server
npm run build
```

## Core User Flow

1. User signs in.
2. User enters a prompt on home page.
3. Backend creates project + conversation record, deducts credits, and asynchronously generates HTML.
4. User opens project builder page, previews result, and submits revision prompts.
5. Each revision can produce a new version; user can rollback, save edited code, download HTML, or publish.
6. Published projects appear in community and can be viewed publicly.

## API Overview

### Auth
- `ALL /api/auth/{*}` (Better Auth handler)

### User routes (`/api/user`)
- `GET /credits`
- `POST /project`
- `GET /project/:projectId`
- `GET /projects`
- `GET /publish-toggle/:projectId`
- `POST /purchase-credits`

### Project routes (`/api/project`)
- `POST /revision/:projectId`
- `PUT /save/:projectId`
- `GET /rollback/:projectId/:versionId`
- `DELETE /:projectId`
- `GET /preview/:projectId`
- `GET /published`
- `GET /published/:projectId`

### Stripe webhook
- `POST /api/stripe`

## Noteworthy Implementation Details

- AI HTML generation is asynchronous after initial project creation response.
- Polling is used in the builder flow to refresh generated code.
- Project revisions and generation consume credits.
- Frontend includes sample/dummy project data for fallback/demo usage in some views.

## Current Limitations

- No CI workflow files are currently present in the repository.
- Root-level deployment configs (Docker/Vercel/Netlify) are not included.
- Some duplicated asset/schema files exist in `client/assets` and `client/src/assets`.
- No license file is currently defined.
