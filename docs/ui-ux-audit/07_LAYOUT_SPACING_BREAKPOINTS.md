# Awaaj Man Ki — Phase 6A: Complete UI/UX & Design System Audit
## 07. Exact Existing Design System: Layout, Spacing & Breakpoints

This document inventories layout dimensions, container widths, spacing scales, border radii, z-index layering, and responsive media queries extracted directly from the codebase and computed DOM measurements.

---

### 1. Declared Dimensions vs. Computed DOM Measurements

**Source Files:**
- [`src/styles/layout.css`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/styles/layout.css)
- [`src/styles/responsive.css`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/styles/responsive.css)
- Computed measurements from [`docs/ui-ux-audit/metrics.json`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/docs/ui-ux-audit/metrics.json)

| Layout Element | Declared CSS Specification | Computed Value (Desktop 1440px) | Computed Value (Mobile 390px) | Source Selector |
|:---|:---|:---|:---|:---|
| **Top Header Height** | `height: 58px` | `58px` | `58px` | `TopNavbar.jsx#L101` |
| **Header Outer Margin** | `margin: 8px 80px 0px` (Desktop) / `margin: 0` (Mobile) | `8px 80px 0px` (Left/Right margin = 80px) | `0px` (Flush to edges) | `TopNavbar.jsx#L102` |
| **Desktop Sidebar Width** | `width: 68px` | `68px` | `0px` (`display: none` via `.desktop-only`) | `LeftSidebar.jsx#L64` |
| **Desktop Sidebar Height** | `min-height: calc(100vh - 110px)` | `790px` (at 900px viewport) | `0px` | `LeftSidebar.jsx#L61` |
| **Main Wrapper Max-Width** | `max-width: 1280px` | `1280px` | `390px` | `layout.css#L19` (`.main-wrapper`) |
| **Feed Column (Standard)** | `max-width: 820px; flex: 1` | `820px` | `366px` | `layout.css#L38` (`.main-content`) |
| **Feed Column (Wide Mode)** | `width: 100%; flex: 1` | `1160px` | `366px` | `layout.css#L43` (`.main-content-wide`) |
| **Right Sidebar Width** | Not formally declared | `0px` (No standard persistent right rail) | `0px` | Single/dual column architecture |
| **Mobile Bottom Nav Height** | `calc(60px + env(safe-area-inset-bottom))` | `0px` (`display: none` on Desktop) | `60px` | `MobileNavigation.jsx#L51` |
| **Page Outer Margins** | Padding in `.main-wrapper`: `20px 24px 20px 96px` (Desktop) | Top: 20px, Right: 24px, Bottom: 20px, Left: 96px | Top: 12px, Right: 12px, Bottom: 80px, Left: 12px | `UserLayout.jsx#L45-L51` |
| **Topic Grid Gap** | `gap: 20px` | `20px` | `14px` | `HomePage.jsx#L433` |
| **Hero Banner Padding** | `padding: 28px 32px` | `28px 32px` | `20px 16px` | `HomePage.jsx#L290` |
| **Standard Card Padding** | `padding: 24px` (`.mka-card`) | `24px` | `16px` | `layout.css#L55` |
| **Panel Padding** | `padding: 16px` (`.mka-panel`) | `16px` | `12px` | `layout.css#L68` |
| **Pulse News Card Size** | `min-width: 340px; max-width: 340px` | `340px × 380px` | `290px × 360px` | `PulseFeaturedCard.jsx#L88` |
| **Pulse Image Aspect Ratio** | `height: 180px; width: 100%` (~16:9) | `340px × 180px` | `290px × 160px` | `PulseFeaturedCard.jsx#L98` |
| **Button Heights** | Primary: `42px`; Pill/Category: `34px`; Small: `28px` | `42px` / `34px` | `40px` / `32px` | `Button.jsx`, `HomePage.jsx` |
| **Input Heights** | Form inputs: `46px`; Search: `44px` | `46px` / `44px` | `44px` / `42px` | `Input.jsx`, `TopNavbar.jsx` |
| **Modal Max-Widths** | Standard: `520px`; Wide: `840px`; Large Discussion: `1100px` | `520px` / `840px` | `calc(100vw - 24px)` | `Modal.jsx`, `LargeDiscussionWindow.jsx` |

---

### 2. Border Radius Tokens

**Source File:** [`src/styles/variables.css#L33-L37`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/styles/variables.css#L33-L37)

| Token Name | Declared Value | Rendered Usage |
|:---|:---|:---|
| `--radius-sm` | `8px` | Tooltips, small badges, tag corners |
| `--radius-md` | `14px` | Form inputs, sub-panels (`.mka-panel`), secondary buttons |
| `--radius-lg` | `22px` | Primary cards (`.mka-card`), topic tiles, news cards |
| `--radius-xl` | `26px` | Hero banner corners, search bar, major dialog containers |
| `--radius-pill` | `9999px` | Round avatars, category filter tabs, FAB, reaction buttons |

---

### 3. Z-Index Layering Hierarchy

The application currently has multiple competing z-index layers declared in CSS and inline styles:

```
┌────────────────────────────────────────────────────────┐
│ z-index: 2000  → Modal Backdrops & Dialogs             │
│ z-index: 1500  → Global Translation Overlay & Toasts   │
│ z-index: 1000  → Desktop LeftSidebar                   │
│ z-index: 990   → Mobile Navigation (Bottom Bar)        │
│ z-index: 950   → Floating Mini-Player (Music Widget)   │
│ z-index: 900   → TopNavbar (Sticky Header)             │
│ z-index: 10    → Standard Sticky Sidebar Fallbacks     │
│ z-index: 2     → Hero Banner Interactive Overlays      │
│ z-index: 1     → Card Background Vignettes & Badges    │
└────────────────────────────────────────────────────────┘
```

#### Collision Hazards:
- `LeftSidebar` is at `z-index: 1000`, while `TopNavbar` is at `z-index: 900`. When the page scrolls and the sidebar collapses or expands, the top edge of the sidebar overlays the navbar shadow.
- `Floating Mini-Player` is at `z-index: 950`, while `MobileNavigation` is at `z-index: 990`. On mobile devices, the mini-player sits directly beneath the bottom bar, but its expand button can be obscured by bottom nav touch areas.

---

### 4. Responsive Breakpoints Inventory

**Source File:** [`src/styles/responsive.css`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/styles/responsive.css)

| Breakpoint | Target Devices | Layout Rules Applied |
|:---|:---|:---|
| `@media (max-width: 1200px)` | Small desktops & landscape tablets | Main wrapper padding narrows; topic grid changes from 4 to 3 columns. |
| `@media (max-width: 900px)` | Portrait tablets & large phablets | `LeftSidebar` transitions to hidden (`display: none` via `.desktop-only`); `UserLayout` switches `padding-left` from `96px` to `12px`; bottom padding becomes `80px` for bottom nav. |
| `@media (max-width: 640px)` | Standard mobile phones (iPhone, Pixel, Samsung) | Main wrapper padding drops to `10px 8px 76px`; grid gap collapses to `10px`; cards padding drops from `24px` to `14px`; topic cards become 1-column. |
| `@media (max-width: 420px)` | Compact mobile phones (iPhone SE, Galaxy A) | Hero banner typography clamps to `22px`; category tabs horizontal scrollbar becomes critical; news cards width clamped to `280px`. |

---

### 5. Layout Architecture Flaws

1. **Arbitrary Left Padding Offset:**  
   In `UserLayout.jsx#L49`, desktop layout relies on an arbitrary `padding: 20px 24px 20px 96px` to avoid the fixed 68px sidebar. When entering a topic page (`isTopicPage === true`), it abruptly changes to `20px 24px 20px 28px`. This shifts the entire main feed column 68px to the left, creating visual twitching during route changes.
2. **Absence of a 3-Column Standard:**  
   The application oscillates between a narrow 820px feed and a stretched 1160px wide feed, leaving vast empty space on 1920×1080 screens on standard pages, but stretching text beyond comfortable readability on wide pages.
3. **Hardcoded Inline Layout Calculations:**  
   Spacing and widths are hardcoded across 25+ files (e.g., `style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}`) rather than inheriting from layout container classes.
