# Awaaj Man Ki — Implementation-Ready Design System Specification
## Document: PROPOSED_DESIGN_SYSTEM.md

**Design Foundation:** Based on **Concept A: Modern Editorial Community** (Warm Parchment, Carbon Ink, Terracotta Saffron, River Jade).  
**Architecture:** Tokenized CSS Custom Properties with mathematical scales, responsive typography, and WCAG 2.1 AA accessible contrast.

---

### 1. Tokenized Color Palette (Exact HEX & RGBA Values)

```css
:root {
  /* ── 1. BACKGROUNDS & SURFACES ── */
  --bg-canvas: #FBF9F5;             /* Warm, non-glare parchment body background */
  --bg-surface: #FFFFFF;            /* Pure alabaster card & modal surface */
  --bg-subtle: #F3EFEA;             /* Secondary container, quote wells, panels */
  --bg-hover: #ECE6DE;              /* Interactive item hover state */
  --bg-active: #E4DDD3;             /* Interactive item active/pressed state */

  /* ── 2. TYPOGRAPHY & INK ── */
  --text-primary: #1A1817;          /* Carbon ink: primary titles, headers, body */
  --text-secondary: #5C5752;        /* Dark stone: secondary descriptions, comments */
  --text-muted: #8C867F;            /* Warm gray: timestamps, metadata, captions */
  --text-inverse: #FFFFFF;          /* Pure white text on dark accents */

  /* ── 3. BORDERS & DIVIDERS ── */
  --border-subtle: #EBE6DE;         /* Card boundaries, horizontal rules (1px) */
  --border-medium: #D8D2C7;         /* Form inputs, category tab outlines */
  --border-strong: #A8A196;         /* Focused form fields, active boundaries */

  /* ── 4. BRAND ACCENTS ── */
  --brand-terracotta: #C85A32;       /* Primary CTA, flame reactions, live tags */
  --brand-terracotta-hover: #B24B25; /* Primary CTA hover */
  --brand-terracotta-light: rgba(200, 90, 50, 0.10); /* Soft wash for pills/tags */
  --brand-amber: #E28743;            /* Saffron warmth, star ratings, voice notes */

  /* ── 5. STATUS & UTILITY ── */
  --status-success: #2D6A5F;        /* River Jade: verified publisher, success toast */
  --status-success-bg: rgba(45, 106, 95, 0.12);
  --status-warning: #D97706;        /* Warning banners, moderation review */
  --status-warning-bg: rgba(217, 119, 6, 0.12);
  --status-danger: #C0392B;         /* Error alerts, destructive delete button */
  --status-danger-bg: rgba(192, 57, 43, 0.12);

  /* ── 6. ACCESSIBILITY FOCUS ── */
  --focus-ring: #C85A32;            /* 2px solid offset ring on all interactive items */
  --focus-ring-offset: 2px;

  /* ── 7. AWAAJ PULSE CATEGORY ACCENTS ── */
  --pulse-cat-general: #2C3E55;     /* Slate Navy for Politics & General News */
  --pulse-cat-general-bg: rgba(44, 62, 85, 0.10);
  --pulse-cat-tech: #1F5E6B;        /* Teal Petrol for Technology & AI */
  --pulse-cat-tech-bg: rgba(31, 94, 107, 0.10);
  --pulse-cat-sports: #C85A32;      /* Terracotta Saffron for Sports & Cricket */
  --pulse-cat-sports-bg: rgba(200, 90, 50, 0.10);
  --pulse-cat-entertainment: #8A4568; /* Muted Berry for Cinema, OTT & Culture */
  --pulse-cat-entertainment-bg: rgba(138, 69, 104, 0.10);
}
```

---

### 2. Typographic Scale & Font Stacks

#### Font Families
- **Display & Headings:** `'Newsreader'`, `'Fraunces'`, or `'DM Serif Display'`, serif.
- **UI & Body Copy:** `'Plus Jakarta Sans'`, `'Inter'`, system-ui, sans-serif.
- **Vernacular Devnagari Script:** `'Noto Sans Devanagari'`, `'Plus Jakarta Sans'`, sans-serif.
- **Code, Timestamps & Audio Data:** `'JetBrains Mono'`, monospace.

#### Typographic Hierarchy Table

| Scale Token | Font Size (Desktop) | Font Size (Mobile) | Line Height | Weight | Letter Spacing | Ideal Characters / Line |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| `--font-display-h1` | 36px | 28px | 1.25 (45px) | 700 Serif | -0.02em | Title headlines (40–60 CPL) |
| `--font-heading-h2` | 26px | 22px | 1.30 (34px) | 700 Serif | -0.015em| News article H1, Channel header |
| `--font-heading-h3` | 20px | 18px | 1.35 (27px) | 600 Sans | -0.01em | Section headers, card titles |
| `--font-heading-h4` | 16px | 15px | 1.40 (22px) | 600 Sans | normal | Subtopic headers, modal titles |
| `--font-body-lead` | 17px | 16px | 1.60 (27px) | 400 Sans | normal | Editorial summaries, lead paragraphs |
| `--font-body-regular`| 15px | 14.5px | 1.60 (24px) | 400 Sans | normal | Primary post body (65–75 CPL) |
| `--font-body-sm` | 13.5px | 13px | 1.50 (20px) | 400 Sans | normal | Threaded comments, sub-replies |
| `--font-caption` | 12px | 11.5px | 1.40 (17px) | 500 Sans | 0.02em | Timestamps, author handles, badges |
| `--font-micro` | 10.5px | 10px | 1.20 (13px) | 700 Sans | 0.04em | Publisher tag, uppercase LIVE pill |

---

### 3. Layout Grid, Spacing & Container Scale

```css
:root {
  /* ── 1. CONTAINER & COLUMN WIDTHS ── */
  --layout-max-width: 1280px;       /* Outer canvas width */
  --nav-sidebar-width: 240px;       /* Left navigation rail */
  --feed-column-width: 680px;       /* Central content reading column */
  --context-sidebar-width: 320px;   /* Right dynamic contextual rail */
  --reading-max-width: 680px;       /* Maximum text line length */

  /* ── 2. MODAL & OVERLAY WIDTHS ── */
  --modal-width-sm: 440px;          /* Confirmation, prompt */
  --modal-width-md: 580px;          /* Post composer, Take modal */
  --modal-width-lg: 840px;          /* Avatar studio, Media lightbox */

  /* ── 3. SPACING SCALE (8pt Grid Standard) ── */
  --space-2xs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* ── 4. BORDER RADII (Restrained & Architectural) ── */
  --radius-xs: 4px;                 /* Micro badges, checkboxes */
  --radius-sm: 8px;                 /* Inputs, buttons, tooltips */
  --radius-md: 12px;                /* Content cards, sub-panels */
  --radius-lg: 16px;                /* Hero containers, modals */
  --radius-pill: 9999px;            /* Category tabs, avatars, FAB */

  /* ── 5. ELEVATION SHADOWS (Subtle & Flat-first) ── */
  --shadow-flat: none;              /* Cards use 1px border instead of heavy drop shadow */
  --shadow-sm: 0 1px 3px rgba(26, 24, 23, 0.04);
  --shadow-md: 0 4px 16px rgba(26, 24, 23, 0.08); /* Dropdowns, floating player */
  --shadow-lg: 0 12px 36px rgba(26, 24, 23, 0.12); /* Modal backdrops */

  /* ── 6. RESPONSIVE BREAKPOINTS ── */
  --bp-mobile-sm: 360px;
  --bp-mobile: 480px;
  --bp-tablet: 768px;
  --bp-laptop: 1024px;
  --bp-desktop: 1280px;
  --bp-wide: 1440px;
}
```

---

### 4. Reusable Component Specifications

#### A. Buttons (`<Button />`)
- **Primary:** Background `--brand-terracotta` (`#C85A32`), text `--text-inverse`, radius `--radius-sm` (8px), height 40px (Desktop) / 44px (Mobile).
- **Secondary / Outline:** Background transparent, border `1px solid --border-medium`, text `--text-primary`.
- **Ghost:** Background transparent, hover background `--bg-hover`, text `--text-secondary`.
- **States:** `:hover` (lighten/darken 5%), `:active` (scale 0.98), `:focus-visible` (2px terracotta ring with 2px offset), `:disabled` (opacity 0.45, cursor not-allowed).

#### B. Inputs & Search Fields (`<Input />`, `<SearchInput />`)
- **Dimensions:** Height 44px (Strict mobile touch compliance). Padding 0 14px.
- **Border:** `1px solid --border-medium` (`#D8D2C7`). Radius `--radius-sm` (8px). Background `--bg-surface`.
- **Focus:** Border `--border-strong` (`#A8A196`), focus ring `2px solid var(--brand-terracotta)`.
- **Search Variant:** Leading search icon in `--text-muted`, inline clear "x" button when populated, instant debounced auto-complete popup.

#### C. Content Cards (`<PostCard />`, `<PulseCard />`)
- **Card Geometry:** Background `--bg-surface` (`#FFFFFF`), border `1px solid --border-subtle` (`#EBE6DE`), radius `--radius-md` (12px), padding 20px.
- **Elevation:** Zero heavy drop shadow (`box-shadow: none`). Content is delineated by crisp architectural borders.
- **Hover:** Border color shifts to `--border-medium` (`#D8D2C7`); thumbnail subtly zooms (scale 1.02 over 250ms).

#### D. Category Filter Pills (`<CategoryFilter />`)
- **Active Tab:** Background `--brand-terracotta` (`#C85A32`), text `--text-inverse`, radius `--radius-pill`.
- **Inactive Tab:** Background `--bg-subtle` (`#F3EFEA`), border `1px solid transparent`, text `--text-secondary`.
- **Touch Target:** Minimum height 44px on touchscreens.

#### E. Awaaj Pulse Community Take Card (`<CommunityTakeCard />`)
- **Design:** Editorial quote block with 3px solid left accent border (colored by topic: Technology, Politics, etc.), anonymous author avatar, handle, verified badge, take text, and agree/disagree counters.

#### F. Persistent Ambient Audio Player (`<AmbientPlayer />`)
- **Docking:** Embedded cleanly at the bottom of the right contextual rail on desktop; docked as a sleek top banner strip or bottom swipe sheet on mobile.
- **Visuals:** Warm amber/terracotta animated waveform canvas, track title, mood pill, play/pause, volume slider. Never covers bottom navigation tabs.

#### G. Modal Dialogs (`<Modal />`)
- **Backdrop:** `rgba(26, 24, 23, 0.45)` with subtle `backdrop-filter: blur(4px)`.
- **Surface:** Max-width 580px, background `--bg-surface`, radius `--radius-lg` (16px), border `1px solid --border-subtle`, shadow `--shadow-lg`.
- **Accessibility:** `role="dialog"`, `aria-modal="true"`, focus trap enabled, `Escape` key listener, focus returns to trigger element on close.
