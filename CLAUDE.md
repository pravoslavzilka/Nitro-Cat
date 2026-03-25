# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run test         # Run tests once (Vitest)
npm run test:watch   # Run tests in watch mode
npm run preview      # Preview production build
```

Run a single test file:
```bash
npx vitest run src/test/example.test.ts
```

Note: Vite 8 and Vitest 3 require Node 20.19+.

## Architecture

This is a **Vite + React + TypeScript SPA** (not Next.js). It's **EnzymAI** — a biochemical pathway analysis tool for discovering optimal enzyme sequences for biosynthesis pathways, with an AI chat assistant for analysis.

### Routing

React Router v6. Dashboard routes share `DashboardLayout` (sidebar + header):

| Path | Page |
|------|------|
| `/` | LandingPage |
| `/login` | LoginPage |
| `/auth/callback` | CallbackPage |
| `/pathways` | PathwaysPage |
| `/pathways/new` | NewPathwayPage |
| `/pathways/:id` | PathwayDetailPage ← main view |
| `/pathways/:id/results` | PathwayResultsPage |
| `/history` | HistoryPage |
| `/settings` | SettingsPage |
| `/profile` | ProfilePage |

### Main view (`PathwayDetailPage`)

`DashboardLayout` → `PathwayDetailPage` → `ResizablePanelGroup`:
- Left panel: `PathwayBuilder` — vertical graph of pathway steps. Each step shows clickable `EnzymeCard`s with confidence scores. Clicking opens `EnzymeModal`. Steps without enzymes offer "Brute force search".
- Right panel: `ChatPanel` — AI chat UI with model selector, web search toggle, file attachment.

### Domain types (`src/types/`)

- `enzyme.ts` — `Enzyme` (kinetic params, score 0–1, vendor/pricing)
- `pathway.ts` — `PathwayStep`, `Pathway` (id, steps, status: draft/analyzing/complete)
- `user.ts` — `User`, `UserSettings` (theme, defaultModel, displayDensity)

Static sample data lives in `src/data/pathwayData.ts` (`samplePathway` — Shikimic Acid Biosynthesis). No real backend yet.

### Component folders

- `src/components/layout/` — `DashboardLayout`, `Header`, `Sidebar`, `ThemeProvider`, `ThemeToggle`, `NavLink`
- `src/components/pathway/` — `PathwayBuilder`, `PathwayStep`, `MoleculeInput`, `ReactionSelector`
- `src/components/enzyme/` — `EnzymeCard`, `EnzymeModal`, `ConfidenceScore`, `EnzymeTable`
- `src/components/chat/` — `ChatPanel`, `ChatMessage`
- `src/components/ui/` — shadcn/ui primitives (Radix-based, do not edit)

### Auth scaffolding (`src/lib/auth/`)

`AuthProvider` in `context.tsx` wraps the whole app (in `App.tsx`) with a **mock user** (`useAuth` hook). Auth is not real — stubs only, ready for OAuth integration.

### Backend API scaffolding (`src/lib/api/`)

- `client.ts` — fetch wrapper reading `VITE_API_URL` env var, attaches auth token from localStorage
- `pathways.ts`, `enzymes.ts` — typed stub functions; return sample data for now
- `src/lib/hooks/usePathway.ts`, `useEnzymes.ts` — react-query wrappers over the API stubs

### Styling

- Tailwind with CSS custom properties; dark/light via `next-themes` (`attribute="class"`).
- Design tokens defined in `src/styles/globals.css`, split into `src/styles/themes/light.css` and `dark.css`.
- Primary green: `#10B981`. Dark backgrounds: `#0A0F0D` / `#0F1612` / `#1A2420`. Light backgrounds: `#FFFFFF` / `#F7FBF9` / `#EFF6F3`.
- Shadows use green-tinted rgba values (see `--shadow-sm/md/lg` in themes).
- Enzyme cards: `bg-secondary`, 1px `border-default`, 3px left border in success color, hover `bg-tertiary` + `glow-success`.
- Confidence color scale: green ≥0.9, yellow 0.6–0.89, red <0.6. Use `formatConfidenceLabel()` from `src/lib/utils/formatting.ts`.
- Custom utilities: `.glow-green`, `.glow-green-sm`, `.glow-success`, `.text-glow`.
- Fonts: IBM Plex Sans (sans) + JetBrains Mono (mono), loaded from Google Fonts.
- Path alias `@/` → `src/`.

### Functional pages

- **SettingsPage** — theme (via `useTheme` from next-themes), default AI model, display density (stored in localStorage, sets `data-density` on `<html>`).
- **ProfilePage** — shows mock user from `useAuth`, edit form stub, account info, danger zone (AlertDialog).

### Adding new shadcn/ui components
```bash
npx shadcn@latest add <component>
```
Config in `components.json`.

### Environment variables
Copy `.env.example` to `.env.local`. Key var: `VITE_API_URL` (defaults to `http://localhost:8000/api`).

### Tests
Vitest + jsdom. Test files: `src/**/*.{test,spec}.{ts,tsx}`. Setup: `src/test/setup.ts`.
