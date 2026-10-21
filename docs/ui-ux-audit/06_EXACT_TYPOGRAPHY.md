# Awaaj Man Ki — Phase 6A: Complete UI/UX & Design System Audit
## 06. Exact Existing Design System: Typography Inventory

This document extracts and audits all typographic styles, font families, font sizes, weights, line heights, letter-spacings, and computed rendering values across the application.

---

### 1. Declared Font Families & Google Fonts Imports

**Source Files:**
- [`src/styles/typography.css#L1`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/styles/typography.css#L1)
- [`src/styles/variables.css#L23-L26`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/styles/variables.css#L23-L26)

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');

--font-serif: 'DM Serif Display', 'Playfair Display', Georgia, serif;
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

#### Typographic Roles
1. **`--font-serif` (DM Serif Display):** Intended for expressive, emotional hero headings, editorial article titles, and cultural literary touchpoints (e.g., Shayari, Love, Life).
2. **`--font-sans` (Inter):** Intended for functional UI elements, navigation labels, data tables, news summaries, and discussion comments.

---

### 2. Comprehensive Typography Matrix

| Element / Role | Font Family | Size (px / clamp) | Weight | Line Height | Letter Spacing | Text Color | Source & Selector |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **Hero Heading** | `var(--font-serif)` | `clamp(38px, 6vw, 64px)` | 400 | `1.2` (45.6px - 76.8px) | `-0.02em` | `var(--eclipse)` (`#2D1D15`) | `typography.css#L10` (`.hero-heading`) |
| **Home Hero H1** | `var(--font-serif)` | `28px` | 900 (Bolder override) | `1.2` (`33.6px`) | `-0.02em` | `#FFFFFF` | `HomePage.jsx#L306` (`h1`) |
| **Section Heading** | `var(--font-serif)` | `clamp(28px, 4vw, 42px)` | 400 | `1.2` (33.6px - 50.4px) | `-0.01em` | `var(--eclipse)` | `typography.css#L15` (`.section-heading`) |
| **Page Heading** | `var(--font-serif)` | `clamp(24px, 3vw, 34px)` | 400 | `1.2` (28.8px - 40.8px) | `normal` | `var(--eclipse)` | `typography.css#L20` (`.page-heading`) |
| **Card Heading** | `var(--font-serif)` | `20px` | 400 | `1.2` (`24px`) | `normal` | `var(--eclipse)` | `typography.css#L24` (`.card-heading`) |
| **Pulse Section H2** | `var(--font-sans)` | `20px` | 900 | `1.2` (`24px`) | `-0.02em` | `#2D1D15` | `HappeningNowSection.jsx#L78` |
| **Pulse Featured Headline** | `var(--font-sans)` | `16px` (Desktop) / `15px` (Mobile) | 800 | `1.3` (`20.8px`) | `-0.01em` | `#2D1D15` | `PulseFeaturedCard.jsx#L141` |
| **Pulse Article H1** | `var(--font-sans)` | `24px` | 900 | `1.3` (`31.2px`) | `-0.02em` | `#2D1D15` | `PulseDetailsPage.jsx#L210` |
| **Pulse Article Summary** | `var(--font-sans)` | `15px` | 500 | `1.6` (`24px`) | `normal` | `#4A3E3D` | `PulseDetailsPage.jsx#L240` |
| **Body Text Primary** | `var(--font-sans)` | `16px` | 400 | `1.6` (`25.6px`) | `normal` | `var(--eclipse)` (`#2D1D15`) | `typography.css#L29` (`.body-text`) |
| **Secondary Body / Post Body** | `var(--font-sans)` | `14px` | 400 | `1.5` (`21px`) | `normal` | `var(--hurricane)` (`#8C8385`) | `typography.css#L36` (`.secondary-text`) |
| **Caption / Timestamps** | `var(--font-sans)` | `12px` | 400 | `1.4` (`16.8px`) | `normal` | `var(--hurricane)` | `typography.css#L42` (`.caption-text`) |
| **Topic Tag Pill Text** | `var(--font-sans)` | `11px` | 800 | `1.2` (`13.2px`) | `0.02em` | `#6F405F` | `HomePage.jsx#L520` |
| **Category Tab Button** | `var(--font-sans)` | `13px` | 800 | `1.2` (`15.6px`) | `normal` | `#FFFFFF` / `#4A3E3D` | `HomePage.jsx#L387` |
| **Primary Button Text** | `var(--font-sans)` | `14px` | 700 | `1.2` (`16.8px`) | `0.01em` | `#FFFFFF` | `Button.jsx#L25` |
| **Navbar Search Input** | `var(--font-sans)` | `13.5px` | 500 | `1.2` (`16.2px`) | `normal` | Dynamic `rgb(rText, gText, bText)` | `TopNavbar.jsx#L125` |
| **Left Sidebar Tooltip** | `var(--font-sans)` | `12px` | 600 | `1.2` (`14.4px`) | `normal` | `#FFFFFF` | `LeftSidebar.jsx#L120` |
| **Mobile Nav Label** | `var(--font-sans)` | `10.5px` | 600 | `1.1` (`11.5px`) | `normal` | `#2D1D15` / `#6F405F` | `MobileNavigation.jsx#L115` |
| **Live Pulse Tag** | `var(--font-sans)` | `10.5px` | 800 | `1` (`10.5px`) | `0.06em` (Uppercase) | `#FFFFFF` | `HappeningNowSection.jsx#L90` |
| **Publisher Attribution** | `var(--font-sans)` | `11px` | 700 | `1.2` (`13.2px`) | `0.02em` | `#2D1D15` | `PulseFeaturedCard.jsx#L115` |
| **Comment Body** | `var(--font-sans)` | `14px` | 400 | `1.5` (`21px`) | `normal` | `#2D1D15` | `CommentCard.jsx#L85` |

---

### 3. Font Scale Rhythm & Ratio Evaluation

The current scale is an ad-hoc hybrid rather than a mathematical modular scale (e.g. Major Second 1.125 or Minor Third 1.2):
- **10.5px** (Micro badges)
- **11px** (Attribution / Subtopics)
- **12px** (Captions / Tooltips)
- **13px** (Category Tabs)
- **13.5px** (Search Input)
- **14px** (Comments / Secondary body)
- **15px** (Article summary)
- **16px** (Body / News Card headline)
- **20px** (Card headings / Pulse section H2)
- **24px** (Pulse details H1)
- **28px** (Home hero H1)
- **38px - 64px** (Landing hero clamp)

#### Typographic Inconsistencies & Flaws:
1. **Font Family Collision on Headlines:**
   - In `typography.css#L3`, `h1, h2, h3, h4` are globally set to `var(--font-serif)` (`DM Serif Display`).
   - However, in `HappeningNowSection.jsx#L83`, the H2 headline explicitly overrides the global serif with `fontFamily: 'var(--font-sans)'` (`Inter`), creating a disjointed heading feel on the same page.
2. **Sub-Pixel & Fractional Font Sizes:**
   - The codebase introduces fractional sizes (`10.5px`, `13.5px`) that cause blurry text rendering on standard non-Retina screens (e.g. 1366×768 laptops at 100% DPI scaling).
3. **Line Height Clamping on Body Text:**
   - Long comment threads render at `14px` with `line-height: 1.4` in compact mode, causing ascenders and descenders to collide on regional Devnagari scripts (Marathi/Hindi matras like ो, ौ, ी, ू).
4. **Line Length Excess:**
   - When viewing `/pulse/:id` or `/post/:id` in desktop wide mode (`main-content-wide`), line lengths reach **1,160px**, resulting in **130–150 characters per line**. Optimal reading typography recommends **60–75 characters per line** for comprehension.
