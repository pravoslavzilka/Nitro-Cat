# NitroCat UI/UX Guide

This document is the single source of truth for visual and interaction design in NitroCat. Read it before touching any component. It supplements `CLAUDE.md` with design intent, not just technical facts.

---

## 1. Brand & Identity

**Product name:** NitroCat (rendered as "NitroCat" in UI, file/URL slug `nitro-cat`)
**Tagline:** *Discover enzymes for your impossible reactions*
**Personality:** Precision scientific tool — clean, dark-lab aesthetic, not a consumer app. Think terminal + lab notebook, not a SaaS dashboard.
**Logo:** `/images/logo3.png` (dark mode) / `/images/logo4.png` (light mode). Always use the theme-resolved logo. Never use a hardcoded path.

---

## 2. Color System

### Semantic token usage
Never use raw Tailwind colors (e.g. `text-green-500`). Always use semantic CSS variables or the Tailwind config aliases that map to them.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--bg-primary` | `#FFFFFF` | `#0A0F0D` | Page backgrounds |
| `--bg-secondary` | `#F7FBF9` | `#0F1612` | Card/panel backgrounds |
| `--bg-tertiary` | `#EFF6F3` | `#1A2420` | Hover states, inset areas |
| `--bg-elevated` | `#FFFFFF` | `#141C18` | Modals, popovers |
| `--primary-500` | `#10B981` | `#10B981` | CTA buttons, active states, accents |
| `--primary-600` | `#059669` | `#34D399` | Hover on primary elements |
| `--border-default` | `#E2E8F0` | `#2D3932` | All default borders |
| `--border-interactive` | `#059669` | `#3FB950` | Focused inputs, hover borders |

### Confidence color scale (enzyme scoring)
This is a core visual language — keep it consistent everywhere:

| Score | Label | Color token | Usage |
|---|---|---|---|
| ≥ 0.9 | `high` | `--success-*` (green) | `border-l-success-500` on enzyme cards |
| 0.6 – 0.89 | `medium` | `--warning-*` (amber) | `border-l-warning-500` on enzyme cards |
| < 0.6 | `low` | `--danger-*` (red) | `border-l-danger-500` on enzyme cards |

Always use `formatConfidenceLabel()` from `src/lib/utils/formatting.ts` to derive this label. Do not inline the threshold logic.

### Glow utilities
Use these sparingly for emphasis — not decoration:

- `.glow-green` — hero CTAs, prominent interactive elements
- `.glow-green-sm` — subtle hover glow on secondary elements
- `.glow-success` — enzyme card hover (confidence-positive feedback)
- `.text-glow` — hero headings only

---

## 3. Typography

| Role | Font | Tailwind class |
|---|---|---|
| Body / UI text | IBM Plex Sans | `font-sans` |
| Monospace data | JetBrains Mono | `font-mono` |

**Rules:**
- Molecular formulas, enzyme EC numbers, kinetic values (k_cat, K_m, pH, temp), catalog numbers → always `font-mono`
- Section labels / micro-headings → `text-[10px] font-semibold uppercase tracking-widest text-muted-foreground`
- Page/card titles → `font-bold text-foreground`, size contextual (hero: `text-4xl sm:text-5xl`, panel header: `text-2xl`, modal: `text-xl`)
- Muted descriptions → `text-sm text-muted-foreground leading-relaxed`

---

## 4. Layout

### Outer shell
`DashboardLayout` = collapsible `Sidebar` (w-64 / w-14) + `Header` + scrollable main content area.

The sidebar collapses to icon-only mode. When collapsed, navigation labels and session history are hidden but icon buttons remain. The collapse state is local to the component (not persisted). Keep this behaviour — don't make it global state.

### PathwayDetailPage — the core screen
Two-panel `ResizablePanelGroup`:
- **Left panel** (`PathwayBuilder`) — vertical graph: `MoleculeCard → StepArrow → PathwayStep → StepArrow → MoleculeCard → …`
- **Right panel** (`ChatPanel`) — AI chat assistant

Both panels scroll independently. The left panel has `overflow-y-auto p-6`. Never put overflow on the outer layout — it must sit on the scroll containers.

### Molecule cards
Bordered, `rounded-xl border border-border bg-card`. Molecule name: `text-xl font-bold font-mono`. Formula: `text-sm font-semibold font-mono text-muted-foreground`. The `MoleculeViewer` renders an SVG structure centered at 300×190px.

### Step arrows
`StepArrow` connects molecule cards to reaction sections — a thin `bg-primary/40` vertical line + `ArrowDown` icon in `text-primary/70`. Keep them subtle. Do not remove or replace with horizontal dividers.

### Enzyme card layout (in `PathwayStep`)
Cards are offset with `ml-[20%]` and left-padded. The label "Possible enzymes:" is italic and `mb-5`. Cards stack vertically with `gap-1.5`. This indent creates visual hierarchy — the reaction name is centered, the enzyme options feel subordinate.

---

## 5. Component Patterns

### EnzymeCard
- `inline-flex` (not `w-full`) — card sizes to content, not the column
- 3px left border colored by confidence: `border-l-[3px]` + `border-l-{success|warning|danger}-500`
- Hover: `bg-muted hover:glow-success transition-all`
- Group hover: icon brightens (`group-hover:text-primary`), name brightens (`group-hover:text-foreground`)
- Always show: enzyme name, EC number · organism (monospace, muted), `ConfidenceScore` chip

### EnzymeModal
- `max-w-lg`, `p-0 overflow-hidden` — padding lives inside sections, not on the dialog itself
- Header section: `px-6 pt-6 pb-4 border-b` — title, EC + organism badges, confidence score, description
- Projected yield: large `text-2xl font-bold font-mono` in a `bg-muted/30` banner with `TrendingUp` icon — this is the hero metric
- Kinetic grid: 2-column, each cell `bg-muted/50 rounded-lg p-2.5`, icon + label (micro) + value (mono)
- Vendor row: logo initials avatar + vendor name + catalog number + price + "Order" button
- Dialog background: `var(--bg-elevated)` (not Tailwind bg classes) — avoids theme flicker

### ChatPanel
- Header: model selector (`Select`) + web search toggle + title
- Messages area: scrollable `ref` div, messages rendered by `ChatMessage`
- Input: auto-resizing `Textarea` + paperclip attachment icon + send `Button`
- Typing indicator shown while simulated response is pending
- Welcome message is generated dynamically from the pathway data — never hardcoded

### BruteForceModal (in PathwayStep)
- Only appears when `step.hasBruteForce === true` and no enzymes exist for that step
- Warning color scheme (`--warning-*`), `Zap` icon
- Contains a feature list (4 items with icons), an estimated-time callout, and a "Contact Research Team" CTA
- The modal is a dead-end flow for now — "Contact Research Team" just closes the modal

### Header card (PathwayBuilder)
- Gradient: `bg-gradient-to-br from-primary/10 via-primary/5 to-transparent`
- Border: `border-primary/20`
- Contains: pathway name, status badge, step count badge (info/blue), enzyme count badge
- Status badge font: `text-[10px] font-mono font-semibold` — keep tiny, right-aligned

---

## 6. Sidebar

- **Logo**: theme-resolved via `useTheme().resolvedTheme`. Never render both and hide one.
- **New Reaction button**: `variant="outline"` with `border-dashed`. Navigates to `/pathways/new`.
- **Session history**: grouped by Today / Yesterday / Older. Each item truncated with `truncate`.
- **Active state**: `bg-accent text-accent-foreground font-medium` — driven by `location.pathname`.
- **Bottom section**: ThemeToggle + Settings + Profile — always visible, even when collapsed (icon-only).
- Collapse transition: `transition-all duration-300`.

---

## 7. LandingPage

- Full-width, `min-h-screen bg-background`, no sidebar
- Hero: centered, `py-24`, logo at 300px height (hero treatment), `text-glow` on the headline
- CTAs: "Get Started" (`glow-green`) + "View Demo" (`variant="outline"`)
- Features: 3-column grid on `sm:`, single column on mobile. Each card: `bg-secondary border rounded-lg p-6 hover:bg-muted transition-colors`. Icon in `bg-primary/10` rounded container.
- No footer yet — don't add one without design spec.

---

## 8. Spacing & Shape

- Border radius: `rounded-md` (small components), `rounded-lg` (cards, badges, containers), `rounded-xl` (molecule cards, pathway header card)
- Card padding: `p-4` to `p-6` depending on prominence
- Section gaps: `space-y-5` inside modals/panels
- Inline gaps: `gap-2` to `gap-3` for icon+label combos
- All interactive elements: minimum touch target of 32px (use `h-8 w-8` for icon buttons)

---

## 9. Interaction & Motion

- All hover transitions: `transition-all` or `transition-colors` — no custom durations unless sidebar collapse (`duration-300`)
- No page transition animations currently — don't add without a spec
- Modal open/close: shadcn/ui default Radix animation — do not override
- Simulated AI response delay: 1100ms — keep this realistic but snappy. Don't increase it.
- Auto-scroll to bottom on new chat messages via `scrollRef` — preserve this pattern for any new messaging UI

---

## 10. Accessibility & States

- All buttons must have visible focus states (Radix/shadcn handles this for ui/ components)
- Icon-only buttons (collapsed sidebar) must have accessible labels — add `aria-label` if missing
- Confidence scores must not rely on color alone — the label text ("High", "Medium", "Low") must also be present
- Modals use Radix `Dialog` — keyboard trap and focus management are provided. Don't roll custom modals.
- Empty states: use italic muted text + relevant icon (e.g. `<Beaker>` + "No enzymes found"), never a blank area

---

## 11. What NOT to Do

- **Don't use raw hex colors** in className or style props — use CSS variables via `var(--token)` or Tailwind aliases
- **Don't use `w-full` on EnzymeCard** — it intentionally sizes to content
- **Don't remove `font-mono` from numeric/scientific data** — it's functional, not decorative
- **Don't add Tailwind green shades directly** (e.g. `bg-green-500`) — always go through the design token layer
- **Don't hardcode logo paths** — always resolve through `useTheme()`
- **Don't add a footer to the LandingPage** without a design spec
- **Don't change the confidence threshold values** (0.9 / 0.6) without updating `formatConfidenceLabel()` and this guide
- **Don't put `overflow` on the outer layout shell** — it belongs on the scroll containers only
- **Don't use bullet-point lists in UI text** — prose descriptions only, except in the BruteForceModal feature list which is intentional

---

## 12. File & Component Ownership Map

| What you're changing | Files to touch |
|---|---|
| Colors / tokens | `src/styles/globals.css`, `src/styles/themes/light.css`, `src/styles/themes/dark.css` |
| Enzyme card look | `src/components/enzyme/EnzymeCard.tsx`, `src/components/enzyme/ConfidenceScore.tsx` |
| Enzyme detail modal | `src/components/enzyme/EnzymeModal.tsx` |
| Pathway graph | `src/components/pathway/PathwayBuilder.tsx`, `src/components/pathway/PathwayStep.tsx` |
| Chat UI | `src/components/chat/ChatPanel.tsx`, `src/components/chat/ChatMessage.tsx` |
| Navigation / layout | `src/components/layout/Sidebar.tsx`, `src/components/layout/DashboardLayout.tsx`, `src/components/layout/Header.tsx` |
| Landing page | `src/pages/LandingPage.tsx` |
| Confidence logic | `src/lib/utils/formatting.ts` |
| Sample data (for UI preview) | `src/data/pathwayData.ts` |
