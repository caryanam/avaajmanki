# Awaaj Man Ki — Phase 6A: Complete UI/UX & Design System Audit
## 05. Exact Existing Design System: Color Tokens Extraction

This document extracts all declared CSS variables, computed values, inline style overrides, and hardcoded color literals currently powering Awaaj Man Ki.

---

### 1. Declared Design Tokens in CSS Variables

**Source File:** [`src/styles/variables.css`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/styles/variables.css#L1-L43)

| CSS Variable Name | Declared Value | Computed RGB / RGBA | Semantic Purpose |
|:---|:---|:---|:---|
| `--swiss-coffee` | `#E1DCDB` | `rgb(225, 220, 219)` | Secondary brand warm neutral / page tint |
| `--eclipse` | `#2D1D15` | `rgb(45, 29, 21)` | Primary brand dark / deep espresso text color |
| `--zorba` | `#9F9794` | `rgb(159, 151, 148)` | Neutral gray / secondary icon tint |
| `--hurricane` | `#8C8385` | `rgb(140, 131, 133)` | Muted body copy / secondary text / captions |
| `--deep-plum` | `#6F405F` | `rgb(111, 64, 95)` | Primary accent brand color / button fills / hero tints |
| `--deep-plum-hover` | `#5A334D` | `rgb(90, 51, 77)` | Hover & active state for primary buttons |
| `--deep-plum-light` | `rgba(111, 64, 95, 0.1)` | `rgba(111, 64, 95, 0.1)` | Subtle chip backgrounds / focus rings |
| `--soft-white` | `#F8F5F4` | `rgb(248, 245, 244)` | Secondary panel backgrounds (`.mka-panel`) |
| `--pure-white` | `#FFFFFF` | `rgb(255, 255, 255)` | Card backgrounds (`.mka-card`), navbar, modals |
| `--success` | `#3F7772` | `rgb(63, 119, 114)` | Success status / verified icons / approval |
| `--success-bg` | `rgba(63, 119, 114, 0.12)` | `rgba(63, 119, 114, 0.12)` | Success badge backgrounds |
| `--warning` | `#D96C3D` | `rgb(217, 108, 61)` | Terracotta accent / live pulse tags / flame icons |
| `--warning-bg` | `rgba(217, 108, 61, 0.12)` | `rgba(217, 108, 61, 0.12)` | Warning & live tag backgrounds |
| `--error` | `#C46F76` | `rgb(196, 111, 118)` | Destructive actions / error badges / report triggers |
| `--error-bg` | `rgba(196, 111, 118, 0.12)` | `rgba(196, 111, 118, 0.12)` | Error alerts / ban notification backgrounds |
| `--border-light` | `#CEC7C5` | `rgb(206, 199, 197)` | Card borders / dividers / input borders |
| `--border-hover` | `#9F9794` | `rgb(159, 151, 148)` | Interactive card hover borders |

---

### 2. Comprehensive Color Inventory (Declared + Inlined)

| Token / Selector | Exact Value | Usage Context | Source File & Line |
|:---|:---|:---|:---|
| `body` background | `linear-gradient(180deg, #FAF4F8 0%, #F3E6EF 25%, #E8D3E2 50%, #D6B7CD 75%, #C29BB7 100%)` | Full page container gradient backdrop | [`layout.css#L6`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/styles/layout.css#L6) |
| `.mka-card` fill | `#FFFFFF` | Core content container surfaces (Posts, News, Topics) | [`layout.css#L51`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/styles/layout.css#L51) |
| `LeftSidebar` background | `linear-gradient(180deg, #6F405F 0%, #3D2334 100%)` | Desktop 68px floating vertical menu rail | [`LeftSidebar.jsx#L62`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/layout/LeftSidebar.jsx#L62) |
| `LeftSidebar` border | `#5A334D` | Border framing the left rail card | [`LeftSidebar.jsx#L63`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/layout/LeftSidebar.jsx#L63) |
| `LeftSidebar` active icon | `rgba(255, 255, 255, 0.28)` | Active menu button background fill | [`LeftSidebar.jsx#L89`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/layout/LeftSidebar.jsx#L89) |
| `TopNavbar` dynamic scroll | `rgb(r1, g1, b1)` from `#FFFFFF` to `#6F405F` & `#3D2334` | Dynamic navbar background transition interpolated on scroll | [`TopNavbar.jsx#L42-L56`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/layout/TopNavbar.jsx#L42-L56) |
| `TopNavbar` text dynamic | `rgb(rText, gText, bText)` from `#2D1D15` to `#FFFFFF` | Text & icon color dynamic shift | [`TopNavbar.jsx#L51-L56`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/layout/TopNavbar.jsx#L51-L56) |
| Hero Banner fill | `linear-gradient(135deg, #6F405F 0%, #4A2B40 50%, #2D1D15 100%)` | Home discovery hero header card | [`HomePage.jsx#L288`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/pages/user/HomePage.jsx#L288) |
| Ambient Lighting Orb | `rgba(255, 209, 232, 0.15)` | Blur sphere inside Home hero banner | [`HomePage.jsx#L298`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/pages/user/HomePage.jsx#L298) |
| Tagline Badge text | `#FFD1E8` | Hero subtitle pill text | [`HomePage.jsx#L302`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/pages/user/HomePage.jsx#L302) |
| "+ Create Topic" button | `linear-gradient(135deg, #FF9933 0%, #D96C3D 100%)` | Primary custom topic creation button fill | [`HomePage.jsx#L321`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/pages/user/HomePage.jsx#L321) |
| Active Category Tab | `linear-gradient(135deg, #6F405F 0%, #3D2334 100%)` | Selected filter pill on `/home` | [`HomePage.jsx#L390`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/pages/user/HomePage.jsx#L390) |
| Inactive Category Tab border | `rgba(111, 64, 95, 0.18)` / `#EFEAE8` | Unselected topic filter pill border | [`HomePage.jsx#L391`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/pages/user/HomePage.jsx#L391) |
| Inactive Category Tab text | `#4A3E3D` | Unselected topic pill typography color | [`HomePage.jsx#L413`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/pages/user/HomePage.jsx#L413) |
| Live Pulse Badge | `linear-gradient(135deg, #6F405F 0%, #D96C3D 100%)` | "LIVE PULSE" pill in `HappeningNowSection` | [`HappeningNowSection.jsx#L94`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/pulse/HappeningNowSection.jsx#L94) |
| Pulse Card Overlay | `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(45,29,21,0.85) 100%)` | Image vignette over editorial article thumbnail | [`PulseFeaturedCard.jsx#L104`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/pulse/PulseFeaturedCard.jsx#L104) |
| Publisher Source Badge fill | `rgba(255, 255, 255, 0.92)` | High contrast badge behind publisher name | [`PulseFeaturedCard.jsx#L112`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/pulse/PulseFeaturedCard.jsx#L112) |
| Pulse Category Pill | `#3F7772` / `#D96C3D` | Category tagging (Technology, Politics, Sports) | [`PulseFeaturedCard.jsx#L125`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/pulse/PulseFeaturedCard.jsx#L125) |
| Mobile Bottom Nav fill | `#FFFFFF` | Sticky bottom navigation surface | [`MobileNavigation.jsx#L53`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/layout/MobileNavigation.jsx#L53) |
| Mobile Center FAB fill | `var(--deep-plum)` (#6F405F) | Floating "+" button background | [`MobileNavigation.jsx#L80`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/layout/MobileNavigation.jsx#L80) |
| Music Visualizer Gradient | `linear-gradient(90deg, #6F405F, #D96C3D, #FF9933)` | Audio frequency bar canvas gradient | [`music.css#L142`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/styles/music.css#L142) |

---

### 3. Shadows and Elevation Tokens

| Shadow Token | Declared CSS Value | Usage | Source |
|:---|:---|:---|:---|
| `--shadow-soft` | `0 8px 24px rgba(45, 29, 21, 0.06)` | Default cards (`.mka-card`), post cards | `variables.css#L28` |
| `--shadow-medium` | `0 12px 32px rgba(45, 29, 21, 0.10)` | Card hover states, dropdown menus | `variables.css#L29` |
| `--shadow-subtle` | `0 2px 8px rgba(45, 29, 21, 0.04)` | Subtle chips, inactive buttons | `variables.css#L30` |
| Hero Shadow | `0 12px 36px rgba(45, 29, 21, 0.2)` | Hero banner elevation | `HomePage.jsx#L292` |
| Mobile Nav Shadow | `0 -4px 20px rgba(45, 29, 21, 0.08)` | Bottom navigation upward elevation | `MobileNavigation.jsx#L60` |
| FAB Floating Shadow | `0 4px 14px rgba(111, 64, 95, 0.4)` | Center mobile "+" action button | `MobileNavigation.jsx#L85` |

---

### 4. Color System Deficiencies & Inconsistencies

1. **Duplicate Dark Purples:**
   - Declared token: `--deep-plum` (`#6F405F`).
   - Hardcoded inlines: `#3D2334`, `#4A2B40`, `#5A334D`.
   - Four distinct dark purples are used interchangeably across buttons, sidebars, and cards without a formal tint/shade scale (e.g. Plum 900, Plum 800, Plum 700).
2. **Conflicting Neutral Borders:**
   - Declared token: `--border-light` (`#CEC7C5`).
   - Hardcoded inlines: `#EFEAE8`, `rgba(111, 64, 95, 0.18)`, `rgba(255, 255, 255, 0.25)`, `rgba(45, 29, 21, 0.08)`.
   - Causes mismatched border weights and colors between adjacent cards on `/home` and `/explore`.
3. **Terracotta / Orange Inconsistencies:**
   - Declared token: `--warning` (`#D96C3D`).
   - Hardcoded inlines: `#FF9933` (Indian saffron gradient stop), `#E65100`, `#F57C00`.
   - Used both for status alerts (Warning) and for high-engagement features (Create Topic, Pulse live tag), conflating error prevention with primary CTAs.
4. **Contrast Deficiencies:**
   - Inactive category tab text (`#4A3E3D` on `#FFFFFF`) yields a contrast ratio of 9.2:1 (Pass).
   - But placeholder text on the dynamically shifting navbar (`rgba(rText, gText, bText, 0.65)`) dips to 3.1:1 when scrolled past 250px on mid-purple backgrounds, failing WCAG AA (4.5:1 required).
