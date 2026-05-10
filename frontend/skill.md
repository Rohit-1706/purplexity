---
name: aesthetic-ui
description: >
  Build production-grade, visually exceptional UIs in the style of modern AI-native products
  like Perplexity, Lovable, Linear, Vercel, Clerk, and Raycast. Use this skill whenever the
  user asks to build a UI, component, dashboard, landing page, app shell, or any frontend
  interface — especially when they want it to look "clean", "modern", "polished", "minimal",
  "premium", or "like a real product". Also trigger when the user says things like "make it
  look good", "redesign this", "make this aesthetic", or "build a beautiful UI". This skill
  produces real, working code with meticulous attention to spacing, typography, motion, and
  color that avoids generic AI-slop aesthetics.
---

# Aesthetic UI Skill

This skill produces **beautiful, production-quality UIs** that look and feel like the best
modern software products: Perplexity, Lovable, Linear, Vercel, Loom, Raycast, Arc, Clerk,
Resend, and similar. These products share a specific sensibility — not a template to copy,
but a standard of quality to meet.

---

## Step 0 — Read the Design Brief

Before writing a single line of code, extract:

| Question | Why it matters |
|---|---|
| What does this UI *do*? | Drives hierarchy and information density |
| Who uses it? | Tone, density, interactivity level |
| Light / dark / system? | Color strategy |
| Framework constraint? | React, HTML, Vue, etc. |
| Any brand colors or fonts given? | Override defaults if yes |

If the user gave a vague prompt ("make a dashboard", "build a chat UI"), **make confident
decisions** and state them briefly. Do not stall asking questions.

---

## The Aesthetic Standard

### What these products have in common

Study these products before designing:

- **Perplexity** — Dark-first, tight information density, prose + citations in one flow,
  monospace accents, subtle border separators, clean search bar as hero.
- **Lovable** — Warm neutrals, generous whitespace, playful but refined, strong iconography,
  smooth micro-animations, glassy sidebars.
- **Linear** — Ultra-dense, keyboard-first, dark default, cyan/purple accent, sharp grid,
  near-zero border radius on data tables, pixel-precise spacing.
- **Vercel** — Monochrome base, white on black or black on white, geist mono for code,
  generous padding, deploy/status as the hero element.
- **Raycast** — Spotlight-style command palette, frosted glass, dark, compact list items,
  iconography-first, instant-feedback hover states.
- **Clerk / Resend** — Light mode, clean card-based layouts, generous padding, strong
  typographic hierarchy, subtle shadows.

**Extract the pattern**: All of them are **intentional**. Every spacing value, every border,
every font size is a decision — not a default.

---

## Design Tokens

### Typography

Never use Inter, Roboto, or system-ui as your *only* font. Instead:

```css
/* Option A: Geist — Vercel's open-source font, clinical and precise */
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');

/* Option B: Outfit + JetBrains Mono — warm but technical */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* Option C: DM Sans + DM Mono — editorial, product-native feel */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

/* Option D: Plus Jakarta Sans — modern humanist, slightly warm */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
```

**Type scale** (use `rem`, not `px`):

```css
:root {
  --text-xs:   0.6875rem;  /* 11px — labels, captions */
  --text-sm:   0.8125rem;  /* 13px — secondary body */
  --text-base: 0.9375rem;  /* 15px — primary body */
  --text-md:   1.0625rem;  /* 17px — lead text */
  --text-lg:   1.25rem;    /* 20px — section titles */
  --text-xl:   1.5625rem;  /* 25px — page titles */
  --text-2xl:  2rem;       /* 32px — hero */
  --text-3xl:  2.75rem;    /* 44px — marketing hero */

  --font-weight-regular: 400;
  --font-weight-medium:  500;
  --font-weight-semibold: 600;
}
```

### Color Systems

**Dark (Perplexity / Linear / Raycast style)**:

```css
:root {
  --bg-base:       #0a0a0a;   /* true near-black */
  --bg-surface:    #111111;   /* cards, panels */
  --bg-elevated:   #1a1a1a;   /* hover state backgrounds */
  --bg-overlay:    #222222;   /* modals, dropdowns */

  --border-subtle: rgba(255,255,255,0.06);
  --border-default:rgba(255,255,255,0.10);
  --border-strong: rgba(255,255,255,0.18);

  --text-primary:  #f0f0f0;
  --text-secondary:#a0a0a0;
  --text-muted:    #606060;
  --text-disabled: #3a3a3a;

  --accent:        #7c6af7;   /* or: #00d4aa, #3b82f6, #f97316 */
  --accent-subtle: rgba(124,106,247,0.12);
  --accent-hover:  #9585f9;

  --success:       #22c55e;
  --warning:       #f59e0b;
  --danger:        #ef4444;
  --info:          #3b82f6;
}
```

**Light (Lovable / Clerk / Resend style)**:

```css
:root {
  --bg-base:       #fafafa;
  --bg-surface:    #ffffff;
  --bg-elevated:   #f4f4f5;
  --bg-overlay:    #ececec;

  --border-subtle: rgba(0,0,0,0.04);
  --border-default:rgba(0,0,0,0.08);
  --border-strong: rgba(0,0,0,0.14);

  --text-primary:  #0f0f0f;
  --text-secondary:#525252;
  --text-muted:    #a3a3a3;
  --text-disabled: #d4d4d4;

  --accent:        #6366f1;
  --accent-subtle: rgba(99,102,241,0.08);
  --accent-hover:  #4f46e5;
}
```

### Spacing

Use an **8px grid** strictly. Never use arbitrary values like `14px` or `22px`.

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
}
```

### Border Radius

Pick **one radius philosophy** and be consistent:

```css
/* Soft / Lovable / Notion style */
--radius-sm: 6px;  --radius-md: 10px; --radius-lg: 16px; --radius-xl: 24px;

/* Tight / Linear / Vercel style */
--radius-sm: 4px;  --radius-md: 6px;  --radius-lg: 8px;  --radius-xl: 12px;

/* Rounded / consumer app style */
--radius-sm: 8px;  --radius-md: 12px; --radius-lg: 20px; --radius-xl: 9999px;
```

### Shadows

```css
/* Light mode */
--shadow-xs:  0 1px 2px rgba(0,0,0,0.04);
--shadow-sm:  0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
--shadow-md:  0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04);
--shadow-lg:  0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04);
--shadow-xl:  0 20px 25px rgba(0,0,0,0.08), 0 10px 10px rgba(0,0,0,0.04);

/* Dark mode — glow instead of drop shadows */
--shadow-sm:  0 0 0 1px var(--border-subtle);
--shadow-md:  0 0 0 1px var(--border-default), 0 4px 16px rgba(0,0,0,0.4);
--shadow-glow-accent: 0 0 20px rgba(124,106,247,0.25);
```

---

## Component Patterns

### Sidebar Navigation (app shell)

```css
.sidebar {
  width: 220px;
  height: 100vh;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  padding: var(--space-3) 0;
  position: fixed;
  left: 0; top: 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  margin: 1px var(--space-2);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
}
.nav-item:hover  { background: var(--bg-elevated); color: var(--text-primary); }
.nav-item.active { background: var(--accent-subtle); color: var(--accent); }
```

### Cards

```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--space-5);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
}
```

### Buttons

```css
/* Primary */
.btn-primary {
  display: inline-flex; align-items: center; gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: opacity 120ms ease, transform 80ms ease;
}
.btn-primary:hover  { opacity: 0.9; }
.btn-primary:active { transform: scale(0.98); }

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-default);
}
.btn-ghost:hover { background: var(--bg-elevated); color: var(--text-primary); }
```

### Input Fields

```css
.input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: var(--text-base);
  outline: none;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.input::placeholder { color: var(--text-muted); }
.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}
```

### Badges / Tags

```css
.badge {
  display: inline-flex; align-items: center;
  padding: 2px var(--space-2);
  border-radius: 9999px;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.02em;
}
.badge-default { background: var(--bg-elevated); color: var(--text-secondary); }
.badge-accent  { background: var(--accent-subtle); color: var(--accent); }
.badge-success { background: rgba(34,197,94,0.12); color: #22c55e; }
.badge-danger  { background: rgba(239,68,68,0.12);  color: #ef4444; }
```

### Data Tables (Linear style)

```css
.table { width: 100%; border-collapse: collapse; }
.table th {
  padding: var(--space-2) var(--space-3);
  text-align: left;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-subtle);
}
.table td {
  padding: var(--space-3);
  font-size: var(--text-sm);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-subtle);
}
.table tr:hover td { background: var(--bg-elevated); }
```

### Command Palette / Search Bar (Perplexity / Raycast style)

```css
.search-bar {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.search-bar:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle), var(--shadow-lg);
}
.search-bar input {
  flex: 1; border: none; background: transparent;
  color: var(--text-primary); font-size: var(--text-md);
  outline: none;
}
```

---

## Motion Principles

Motion should feel **instant, purposeful, and never in the way**.

```css
/* Global defaults — fast and eased */
* { transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }

/* Fade-in on mount */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-in { animation: fadeUp 200ms forwards; }

/* Stagger children */
.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 40ms; }
.list-item:nth-child(3) { animation-delay: 80ms; }

/* Skeleton loading */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    var(--bg-elevated) 25%,
    var(--bg-overlay)  50%,
    var(--bg-elevated) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: var(--radius-sm);
}
```

### React / Tailwind motion (if Framer Motion available)

```jsx
import { motion, AnimatePresence } from 'framer-motion'

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
}

// Usage
<motion.div {...fadeUp}>...</motion.div>

// Stagger container
const stagger = {
  animate: { transition: { staggerChildren: 0.05 } }
}
<motion.ul variants={stagger} animate="animate">
  {items.map(item => (
    <motion.li key={item.id} variants={fadeUp}>{item.name}</motion.li>
  ))}
</motion.ul>
```

---

## Layout Patterns

### App Shell

```
┌──────────────────────────────────────────────────┐
│  Sidebar (220px fixed) │  Main Content            │
│  ─────────────────────  │  ─────────────────────   │
│  Logo                   │  Topbar (56px)           │
│  Nav items              │  ─────────────────────   │
│                         │  Page content            │
│                         │    (scrolls)             │
│  ─────────────────────  │                          │
│  User / Settings        │                          │
└──────────────────────────────────────────────────┘
```

### Dashboard Grid

```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
  padding: var(--space-6);
}
```

### Two-Panel (chat / detail view)

```css
.two-panel {
  display: grid;
  grid-template-columns: 340px 1fr;
  height: 100vh;
  overflow: hidden;
}
.panel-left  { overflow-y: auto; border-right: 1px solid var(--border-subtle); }
.panel-right { overflow-y: auto; }
```

---

## Common Anti-Patterns — Never Do These

| Anti-pattern | Better alternative |
|---|---|
| `border-radius: 50px` on cards | Use 8–16px for cards |
| Purple gradient on white bg | Pick a considered accent, use it sparingly |
| Box shadow on everything | Reserve shadows for elevated/modal elements |
| `font-size: 12px` for body | 13–15px minimum for readable body text |
| Full-opacity accent background on sidebar nav | Use `accent-subtle` (10–15% opacity) |
| Generic loading spinners | Skeleton screens or shimmer |
| Hard-coded pixel values everywhere | Use spacing tokens on the 8px grid |
| Gray `#888` on dark bg | Ensure contrast ≥ 4.5:1 for secondary text |
| No hover / focus states | Every interactive element needs both |
| Flat color backgrounds only | Add texture: subtle noise, mesh gradients, grain |

---

## Background Texture (depth without distraction)

```css
/* Subtle noise grain overlay */
.bg-grain::before {
  content: '';
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.025;
}

/* Radial gradient hero glow */
.hero-glow {
  background:
    radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,106,247,0.12), transparent),
    var(--bg-base);
}

/* Mesh gradient (light mode) */
.mesh-bg {
  background:
    radial-gradient(at 20% 30%, rgba(99,102,241,0.07) 0%, transparent 50%),
    radial-gradient(at 80% 70%, rgba(236,72,153,0.05) 0%, transparent 50%),
    var(--bg-base);
}
```

---

## Iconography

- Use **Lucide** (React) or **Phosphor** (multi-framework) — clean, consistent stroke weight
- Icon size follows a **strict scale**: 12 / 14 / 16 / 20 / 24px
- Always pair icon + label; never icon-only without a tooltip
- Stroke width 1.5 for UI icons, 2 for emphasis icons

```jsx
import { Search, Command, ArrowRight } from 'lucide-react'

// Correct sizing
<Search size={16} strokeWidth={1.5} />   // In nav items, inputs
<Command size={20} strokeWidth={1.5} />  // In command palette
```

---

## Accessibility — Non-Negotiable

- All interactive elements have `:focus-visible` ring using `var(--accent)`
- Color contrast ≥ 4.5:1 for text, ≥ 3:1 for UI components
- Never rely on color alone to convey meaning (pair with icon/text)
- Keyboard navigable: `Tab`, `Enter`, `Escape` for modals/dropdowns
- Use semantic HTML: `<button>`, `<nav>`, `<main>`, `<dialog>`

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

---

## Implementation Checklist

Before delivering code, verify:

- [ ] Tokens defined as CSS variables (no magic numbers in component styles)
- [ ] Font imported, set on `body`, with fallback stack
- [ ] 8px grid respected throughout
- [ ] Hover, focus, active states on all interactive elements
- [ ] Loading/empty states for async content
- [ ] Responsive: collapses gracefully at 768px and 375px
- [ ] No purple-gradient-on-white. No Inter as sole font. No flat gray cards.
- [ ] Motion: entry animations present, under 250ms, respects `prefers-reduced-motion`
- [ ] Consistent border-radius philosophy applied everywhere

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```