# Awaaj Man Ki — Phase 6A: Complete UI/UX & Design System Audit
## 13. Prioritized UX Issues Matrix

This document categorizes all confirmed UX, visual design, responsive, and architectural problems discovered during the Phase 6A audit, ranked by severity from Critical to Low.

---

### 1. The Top 10 Major UX Problems Summary

| # | Issue Summary | Severity | Impacted Surfaces | Root Cause |
|:---:|:---|:---:|:---|:---|
| **1** | **Mobile Touch Target Failure on Home (81.7% Failure Rate)** | **CRITICAL** | `/home`, Mobile Navigation | 67 of 82 interactive buttons/chips on `/home` measure < 44×44px; subtopic pills measure ~26px height. |
| **2** | **Disjointed Pulse Conversational Silos ("Take" vs "Join Discussion")** | **CRITICAL** | `/pulse/:id`, `/topic/GENERAL` | "Write Your Take" stores opinions in Pulse; "Join Discussion" redirects users to create an orphaned topic post. |
| **3** | **Hard Guest Auth Wall with Zero Content Preview** | **CRITICAL** | `/home`, `/explore`, `/topic/*` | Visiting any community page unauthenticated triggers a sudden redirect to `/login` with no social proof. |
| **4** | **Unthrottled Navbar Scroll Re-rendering & Contrast Dips** | **HIGH** | Global (`TopNavbar.jsx`) | Unthrottled `setScrollProgress` on every scroll event; mid-scroll color values cause placeholder contrast to dip to 3.1:1. |
| **5** | **Abrupt 68px Layout Shift on Topic Room Entry** | **HIGH** | `/topic/:id`, `LeftSidebar.jsx` | `isTopicPage` state forcibly collapses desktop left sidebar into a 10px hover strip, shifting feed 68px leftwards. |
| **6** | **Excessive Reading Line Lengths on Wide Displays (1,160px / 140+ CPL)** | **HIGH** | `/pulse/:id`, `/topic/:id`, `/post/:id` | `main-content-wide` stretches content to 1,160px; lines exceed 140 characters, hurting reading endurance. |
| **7** | **Inverted Home vs. Explore Mental Model** | **HIGH** | `/home`, `/explore` | Home serves as a static catalog of topics; Explore serves as the post feed. Users expect fresh posts on Home. |
| **8** | **Mobile Music Mini-Player Obstructs Bottom Navigation** | **HIGH** | Mobile global (`MoodMusicWidget.jsx`) | Docked mini-player sits directly above the bottom nav bar, consuming ~120px of cumulative vertical screen height. |
| **9** | **Desktop Mystery Navigation (68px Icon-Only Sidebar)** | **MEDIUM** | Desktop global (`LeftSidebar.jsx`) | Left sidebar has no text labels; users must hover over icons to see tooltips to figure out where they go. |
| **10** | **Complete Absence of `@media (prefers-reduced-motion)`** | **MEDIUM** | Global CSS (`layout.css`, animations) | No motion reduction queries; users with vestibular conditions are forced to view sliding panels and rotating graphics. |

---

### 2. Comprehensive Issue Breakdown by Category

#### A. Architecture, Routing & Navigation

##### Issue A.1: Session Storage Tampering Disconnects Deep Links
- **Severity:** **High**
- **Impacted Pages:** Global (`main.jsx#L6-L32`)
- **Evidence:** `Object.defineProperty(window, 'localStorage', { value: window.sessionStorage, ... })`
- **Root Cause:** Developed to facilitate multi-tab multi-account testing, but breaks standard browser session persistence across tabs and window reloads.
- **Recommended Direction:** Remove the `sessionStorage` proxy in production. Use isolated React contexts or test profile switchers for multi-account testing.

##### Issue A.2: Loss of Redirect Intent Post-Login
- **Severity:** **High**
- **Impacted Pages:** `/login`, all protected routes
- **Evidence:** Unauthenticated users clicking a shared link (e.g. `/post/42`) are bounced to `/login`. Upon successful login, they are dumped onto `/home` with no return path.
- **Root Cause:** Custom history router lacks query param redirection (`?redirect=/post/42`).
- **Recommended Direction:** Implement `returnTo` state parameters in auth routes.

##### Issue A.3: "My Reports" Elevated Over Core Social Features
- **Severity:** **Medium**
- **Impacted Pages:** `LeftSidebar.jsx#L29`
- **Evidence:** "My Reports" sits at item #5 in the primary sidebar, while "Saved Posts" is completely missing.
- **Root Cause:** Developed during safety/moderation sprints and never re-evaluated from a consumer engagement perspective.
- **Recommended Direction:** Demote "My Reports" to the Settings menu; promote "Saved" or "Bookmarks" to the primary sidebar.

---

#### B. Responsive & Mobile Usability

##### Issue B.1: Extreme Vertical Scroll Depth on Mobile Home
- **Severity:** **High**
- **Impacted Pages:** `/home` (Mobile 375px/390px)
- **Evidence:** Computed scroll height is **4,230px** on iPhone 13.
- **Root Cause:** 12 topic categories and 60+ subtopics are rendered in a continuous stacked vertical layout.
- **Recommended Direction:** Use collapsible category accordions or horizontal chip carousels to cut scroll depth by 60%.

##### Issue B.2: Keyboard Obscuration on Comment Composer
- **Severity:** **High**
- **Impacted Pages:** `/post/:id`, `CommentComposer.jsx`
- **Evidence:** On iOS Safari, focusing the reply textarea causes the soft keyboard to open, pushing the reply container directly over the comment being replied to.
- **Root Cause:** Fixed bottom positioning without dynamic `visualViewport.height` offsetting.
- **Recommended Direction:** Use `window.visualViewport` resize listener to smoothly dock the composer above the virtual keyboard.

---

#### C. Awaaj Pulse Editorial Integration

##### Issue C.1: Fragmented Conversation Models
- **Severity:** **Critical**
- **Impacted Pages:** `/pulse/:id`, `PulseDetailsPage.jsx`
- **Evidence:** Two competing conversation CTAs: *"Write Your Take"* creates an in-page bubble take; *"Join Discussion"* creates a separate post under `/topic/GENERAL`.
- **Root Cause:** Merging an editorial feature into an existing forum-based topic architecture without unifying the data layer.
- **Recommended Direction:** Eliminate the split model. Anchor all news conversations directly on the Pulse page as Community Takes with threaded replies.

##### Issue C.2: Off-Platform Drop-off for Full News Reading
- **Severity:** **High**
- **Impacted Pages:** `/pulse/:id`
- **Evidence:** Editorial summaries are only 1–2 paragraphs long. Users who want the full story must click an external link, leading them off-platform.
- **Root Cause:** Pulse items only store RSS summaries and external URLs.
- **Recommended Direction:** Add structured editorial briefs (Key Takeaways, Background, Community Question) to provide sufficient in-app context.

---

#### D. Accessibility & Design System Cohesion

##### Issue D.1: Fragmented Dark Purple Color Palette
- **Severity:** **Medium**
- **Impacted Pages:** Global (`variables.css`, `HomePage.jsx`, `LeftSidebar.jsx`, `TopNavbar.jsx`)
- **Evidence:** 4 different dark purples used simultaneously: `#6F405F`, `#3D2334`, `#4A2B40`, `#5A334D`.
- **Root Cause:** Developers used manual inline hex values instead of referencing the CSS variable `--deep-plum`.
- **Recommended Direction:** Consolidate into a strict semantic color token system (e.g., `--color-plum-900`, `--color-plum-800`, `--color-plum-700`).

##### Issue D.2: Stripped Focus Indicators on Interactive Chips
- **Severity:** **Medium**
- **Impacted Pages:** `/home`, `HappeningNowSection.jsx`
- **Evidence:** Category buttons and subtopic pills use `outline: none` without `:focus-visible` styles. Keyboard users cannot see which element is focused.
- **Root Cause:** Aggressive CSS reset without accessibility follow-through.
- **Recommended Direction:** Implement a consistent 2px focus ring (`:focus-visible { outline: 2px solid var(--deep-plum); outline-offset: 2px; }`).
