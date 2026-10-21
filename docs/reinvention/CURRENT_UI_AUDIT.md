# Awaaj Man Ki — Current UI/UX Architectural Audit
## Document: CURRENT_UI_AUDIT.md

**Role:** Product Design Director, Principal UX Architect, Senior Frontend Engineer, Design Systems Specialist  
**Target Application:** Awaaj Man Ki (React 19 Frontend + Spring Boot 3.4 Backend)  
**Methodology:** Direct inspection of React JSX source code, CSS stylesheet definitions, computed DOM styling in Chromium, and REST API network calls. (Strictly Read-Only).

---

### 1. Technology Stack & Architectural Foundations

| Layer | Implementation | Source References | Observations & Architectural Impact |
|:---|:---|:---|:---|
| **Core Framework** | React 19.2.7 + Vite 8.1.1 | [`package.json`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/package.json) | High performance rendering; React 19 StrictMode enabled. |
| **Routing Layer** | Custom History API Router | [`AppRoutes.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/routes/AppRoutes.jsx) | Uses `window.history.pushState` and `window.addEventListener('popstate')`. No `react-router-dom`. Requires `onNavigate` prop-drilling through all layouts and components. |
| **Data Layer** | TanStack React Query 5.101.4 + Axios 1.18.1 | [`App.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/App.jsx#L17), [`apiClient.js`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/services/apiClient.js) | Global cache stale time configured at 3 minutes (`staleTime: 180000`). Pulse featured items cached at 60s with 120s auto-refetch. |
| **State Management** | Context API (9 Domain Providers) + Zustand 5.0.14 | [`App.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/App.jsx#L29-L51), `useAvatarStore.js` | Domain providers for Auth, Toast, Language, MoodMusic, Post, Comment, Notification, Report, and Chat. |
| **Styling Paradigm** | Hybrid Global CSS + Inline React Styles | `src/styles/*.css` + Component JSX | 8 CSS stylesheets in `src/styles/` define design tokens, but components rely heavily on hardcoded inline `style={{ ... }}` blocks, causing style fragmentation. |
| **3D & Canvas** | Three.js 0.185.1, R3F 9.6.1, Drei 10.7.7 | `ThreeAvatarViewer.jsx` | WebGL canvas for custom 3D avatar generation. Heavy bundle weight (~2.8MB). |
| **Iconography** | Lucide React 1.27.0 | Component imports | Clean vector icon system. |

---

### 2. Comprehensive Route, Page & Authentication Inventory

| Path | Component | Purpose | Auth Level | Layout Shell | Primary API Dependencies |
|:---|:---|:---|:---|:---|:---|
| `/` | `LandingPage.jsx` | Public value proposition & join CTA | Public | Landing Custom | None (Static) |
| `/about` | `AboutPage.jsx` | Mission & anonymous philosophy | Public | `PublicLayout.jsx` | None |
| `/privacy-policy` | `PrivacyPolicyPage.jsx` | Legal & privacy disclosure | Public | `PublicLayout.jsx` | None |
| `/community-guidelines` | `CommunityGuidelinesPage.jsx` | Behavioral standards & safety | Public | `PublicLayout.jsx` | None |
| `/contact` | `ContactPage.jsx` | Support contact form | Public | `PublicLayout.jsx` | `POST /api/enquiries` |
| `/faq` | `FaqPage.jsx` | Frequently asked questions | Public | `PublicLayout.jsx` | None |
| `/login` | `LoginPage.jsx` | User/Admin authentication | Public | `AuthLayout.jsx` | `POST /api/auth/login` |
| `/register` | `RegisterPage.jsx` | Account creation & OTP initiation | Public | `AuthLayout.jsx` | `POST /api/auth/register`, `POST /api/auth/verify-otp` |
| `/forgot-password` | `ForgotPasswordPage.jsx` | Password reset request | Public | `AuthLayout.jsx` | `POST /api/auth/forgot-password` |
| `/setup-profile` | `ProfileSetupWizardPage.jsx` | Avatar selection & handle creation | Login Required | Wizard Custom | `POST /api/profile`, `GET /api/profile/suggestions` |
| `/onboarding` | `OnboardingPage.jsx` | Initial topic interest selection | Login Required | Wizard Custom | `POST /api/profile/interests` |
| `/pulse/:id` | `PulseDetailsPage.jsx` | Editorial news story, publisher attribution, and takes | **Public Reading** (Auth required for takes) | `UserLayout.jsx` (if auth) / `PublicLayout.jsx` | `GET /api/pulse/items/:id`, `GET /api/pulse/:id/takes`, `POST /api/pulse/:id/takes` |
| `/home` | `HomePage.jsx` | Central portal: Hero, Pulse carousel, Topic grid | Login Required | `UserLayout.jsx` | `GET /api/pulse/featured`, `GET /api/topics/categories`, `GET /api/topics/custom` |
| `/explore` | `ExplorePage.jsx` | Global post feed & keyword search | Login Required | `UserLayout.jsx` | `GET /api/posts/feed`, `GET /api/posts/search` |
| `/topic/:id` | `TopicDiscussionPage.jsx` | Dedicated topic channel post stream | Login Required | `UserLayout.jsx` | `GET /api/topics/:id`, `GET /api/posts/topic/:id` |
| `/post/:id` | `PostDetailsPage.jsx` | Deep post view, voice player, threaded replies | Login Required | `UserLayout.jsx` | `GET /api/posts/:id`, `GET /api/comments/post/:id`, `POST /api/comments` |
| `/create-post` | `CreatePostPage.jsx` | Anonymous post authoring & audio upload | Login Required | `UserLayout.jsx` | `POST /api/posts`, `POST /api/moderation/check` |
| `/music` | `MusicPage.jsx` | Full-screen mood music visualizer station | Login Required | `UserLayout.jsx` | `GET /api/music/tracks`, `GET /api/music/moods`, `POST /api/music/vote` |
| `/profile` | `ProfilePage.jsx` | User avatar, bio, activity tabs | Login Required | `UserLayout.jsx` | `GET /api/profile/me`, `GET /api/posts/my` |
| `/notifications`| `NotificationsPage.jsx` | Activity alerts, replies, reactions | Login Required | `UserLayout.jsx` | `GET /api/notifications`, `PUT /api/notifications/read` |
| `/saved` | `SavedPostsPage.jsx` | Bookmarked posts archive | Login Required | `UserLayout.jsx` | `GET /api/posts/saved` |
| `/my-posts` | `MyPostsPage.jsx` | Authored posts management | Login Required | `UserLayout.jsx` | `GET /api/posts/my` |
| `/my-reports` | `MyReportsPage.jsx` | User-submitted moderation reports status | Login Required | `UserLayout.jsx` | `GET /api/reports/my` |
| `/settings` | `SettingsPage.jsx` | Preferences, privacy, security | Login Required | `UserLayout.jsx` | `GET /api/users/settings`, `PUT /api/users/settings` |
| `/help` | `HelpSupportPage.jsx` | Self-serve help center & contact | Login Required | `UserLayout.jsx` | None |
| `/admin/pulse` | `AdminPulsePage.jsx` | Editorial news curation, RSS feeds, candidates | Admin Required | `AdminLayout.jsx` | `GET/POST /api/admin/pulse/*` |
| `/admin/dashboard`| `AdminDashboardPage.jsx`| System metrics & analytics | Admin Required | `AdminLayout.jsx` | `GET /api/admin/metrics`, `GET /api/admin/stats` |

---

### 3. Detailed Audit of the 15 Core Experiences

#### 1. Home and Topic Discovery
- **Layout & Structure:** Stacks an artistic Hero Banner (dark plum gradient with glowing ambient lighting orbs), an inline search bar, a horizontal Awaaj Pulse news carousel, 8 category filter tabs, and an expansive 2-to-3 column grid of rounded white topic cards.
- **User Actions:** Search topics, switch category filter, click topic card, click "+ Create Topic" button, scroll news carousel.
- **Usability Issues:** Extreme information overload (82+ interactive items on mobile); page length exceeds 4,200px on mobile; topic cards display cramped 26px subtopic chips (81.7% failure rate on 44px tap target guideline); no chronological post feed exists on Home.
- **Dependencies:** `apiPulseService.getFeaturedPulseItems()`, `apiTopicService.getCustomTopics()`.

#### 2. Explore and Community Feed
- **Layout & Structure:** Single-column feed (820px desktop width) with top search input, trending hashtag pills, and stacked post cards (`.mka-card`).
- **User Actions:** Scroll infinite feed, filter by media (Text / Audio / Image), filter by hashtag, play voice notes, trigger reactions.
- **Usability Issues:** Search input is not debounced and requires a form submit; infinite scrolling layout shift occurs when audio visualizer mounts; lacks a dedicated filter for Awaaj Pulse editorial discussions.
- **Dependencies:** `apiPostService.getFeed()`, `apiPostService.search()`.

#### 3. Individual Topic Discussions (`/topic/:id`)
- **Layout & Structure:** Top topic header card (Emoji, channel title, description, subscriber count, "+ Post" button), followed by single-column post stream.
- **Interaction Flaw:** Entering a topic page activates `isTopicPage = true` in [`LeftSidebar.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/layout/LeftSidebar.jsx#L14-L22), causing the desktop sidebar to collapse into a 10px hover strip offscreen. This causes the main feed column to abruptly jump 68px to the left, disorienting the user.
- **Dependencies:** `apiTopicService.getTopicById()`, `apiPostService.getPostsByTopic()`.

#### 4. Post Creation and Commenting
- **Composer Layout:** Full card with category dropdown, title input, markdown text area, voice note recorder, mood picker, and spoiler toggle.
- **Commenting Experience:** Threaded replies with nested indentations up to 2 levels deep; inline reaction bar; optimistic updates.
- **Usability Issues:** No auto-saving of drafts (accidental back-navigation wipes text); on mobile devices, opening the comment composer triggers the virtual keyboard, which obscures the parent comment being replied to.
- **Dependencies:** `apiPostService.createPost()`, `apiCommentService.createComment()`, `apiAiService.moderate()`.

#### 5. Image and Media Viewer
- **Current State:** Images within posts render as fixed-aspect inline image blocks (`max-height: 480px; object-fit: cover`).
- **Usability Issues:** No lightbox modal overlay; users cannot click to view full-resolution photos, pinch-to-zoom on mobile, or navigate multi-image galleries.

#### 6. Music Discovery and Playback
- **Implementation:** Global HTML5 audio streaming orchestrated via [`MoodMusicContext.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/context/MoodMusicContext.jsx).
- **Persistent Player:** Floating waveform bar in bottom-right corner (Desktop) / Docked bar directly above bottom navigation (Mobile).
- **Usability Issues:** On mobile screens, the docked player + bottom navigation bar consumes ~125px of vertical screen height (~15% of an iPhone 13 screen); floating player on desktop frequently covers bottom-right card actions.
- **Dependencies:** `apiMusicService.getTracks()`, `apiMusicService.vote()`.

#### 7. Mood Selection
- **Implementation:** Triggered from top navbar widget or `/music`. Opens `MoodSelectionModal.jsx` featuring 6 ambient emotion cards (Heartbreak, Romantic, Late Night, Devotional, Chill, Energized).
- **User Actions:** Click mood card to instantly filter background playlist and update profile mood badge.
- **Usability Issues:** Mood cards use photographic backgrounds with low-contrast white text overlays; lacks custom mood creation.

#### 8. Notifications
- **Implementation:** List of system, comment, reply, and reaction alerts on `/notifications`.
- **Usability Issues:** No "Mark All as Read" batch action; tapping a notification routes to `/post/:id` but fails to auto-scroll or highlight the specific targeted comment.

#### 9. My Topics
- **Implementation:** Dedicated page at `/my-posts` listing content authored by current anonymous account.
- **Usability Issues:** Lacks analytics (e.g. view count, reaction breakdown); delete action uses inconsistent confirmation modals.

#### 10. Safety Reports
- **Implementation:** Modal dialog (`ReportModal.jsx`) allowing users to report content for harassment, hate speech, misinformation, or NSFW. Status monitored on `/my-reports`.
- **Usability Issues:** "My Reports" is elevated to primary desktop sidebar navigation item #5, creating clutter for an action rarely used by general consumers.

#### 11. Settings and Account Management
- **Implementation:** Grouped settings on `/settings` with separate routes (`/settings/privacy`, `/settings/account`, `/settings/notifications`, `/delete-account`).
- **Usability Issues:** Each sub-setting requires a full page navigation reload rather than modern tabbed navigation; anonymous handle is immutable without full account reset.

#### 12. Help and Support
- **Implementation:** Static informational hub with FAQ accordions, guidelines links, and contact support form.
- **Usability Issues:** Duplicates links present in the footer; lacks search bar for self-serve troubleshooting.

#### 13. Awaaj Pulse News Discovery
- **Implementation:** `HappeningNowSection.jsx` embedded in `/home` between Hero and Category tabs. Horizontal carousel displaying up to 10 verified news stories.
- **Design Elements:** 16:9 thumbnail, verified publisher badge (`The Hindu`, `BBC News`), category pill, title clamp, summary clamp, relative timestamp.
- **Usability Issues:** Cards have fixed 340px width; on 375px mobile screens only 1 card is visible, forcing extensive horizontal swiping; desktop arrow navigation buttons are hidden on touchscreens.

#### 14. Awaaj Pulse Article Details and Discussions
- **Implementation:** Deep editorial reading view on `/pulse/:id` with external publisher link, summary, "Write Your Take" modal (280 chars max), and Community Takes speech-bubble stream.
- **Public Access:** Publicly readable without logging in (Pass).
- **Usability Issues:** Fragmented conversation: "Write Your Take" posts locally on the story, but "Join Discussion" creates an orphaned post in `/topic/GENERAL`; summary is very brief (2–3 sentences from RSS), forcing users off-platform for full story reading.

#### 15. Admin Pulse Editorial Hub
- **Implementation:** Comprehensive editorial workbench at `/admin/pulse` featuring candidate review queue, RSS source management, placement pinning, and manual article creator.
- **Usability Issues:** High information density; modal forms require screens >=1200px wide; lack of batch candidate approval actions.

---

### 4. Design System Tokens (Extracted & Computed)

#### A. Exact Colors Extracted from CSS & Computed DOM
- **Primary Brand / Dark Espresso:** `#2D1D15` (`--eclipse` / `rgb(45, 29, 21)`)
- **Primary Accent / Plum:** `#6F405F` (`--deep-plum` / `rgb(111, 64, 95)`)
- **Accent Hover:** `#5A334D` (`--deep-plum-hover`)
- **Accent Wash:** `rgba(111, 64, 95, 0.1)` (`--deep-plum-light`)
- **Secondary Neutral Tint:** `#E1DCDB` (`--swiss-coffee` / `rgb(225, 220, 219)`)
- **Muted Grays:** `#9F9794` (`--zorba`), `#8C8385` (`--hurricane`)
- **Card Surface:** `#FFFFFF` (`--pure-white`)
- **Panel Surface:** `#F8F5F4` (`--soft-white`)
- **Status Green:** `#3F7772` (`--success`), background `rgba(63, 119, 114, 0.12)`
- **Status Terracotta / Warning / Live:** `#D96C3D` (`--warning`), saffron `#FF9933`
- **Status Error / Danger:** `#C46F76` (`--error`), background `rgba(196, 111, 118, 0.12)`
- **Border Light:** `#CEC7C5` (`--border-light`)
- **Border Hover:** `#9F9794` (`--border-hover`)

#### B. Exact Typography Extracted
- **Serif Font Family:** `'DM Serif Display'`, `'Playfair Display'`, Georgia, serif
- **Sans-Serif Font Family:** `'Inter'`, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Hero Headings:** `clamp(38px, 6vw, 64px)` (Line Height: 1.2, Letter Spacing: -0.02em)
- **Home Hero H1:** `28px` bold (`33.6px` line height)
- **Card & Section Headings:** `20px` serif / `20px` sans bold (`24px` line height)
- **News Article H1:** `24px` sans bold (`31.2px` line height)
- **Primary Body:** `16px` (`25.6px` line height)
- **Secondary Body / Comments:** `14px` (`21px` line height)
- **Badges / Captions:** `10.5px` to `12px` (`13.2px` to `16.8px` line height)

#### C. Exact Spacing, Dimensions & Breakpoints
- **Top Header:** `58px` height; desktop margin `8px 80px 0px`.
- **Sidebar Rail:** `68px` fixed width.
- **Main Wrapper Max-Width:** `1280px` centered.
- **Feed Column Width:** Standard `820px`; Wide mode `1160px`.
- **Card Padding:** `24px` desktop / `16px` mobile.
- **Border Radii:** `8px` (`--radius-sm`), `14px` (`--radius-md`), `22px` (`--radius-lg`), `26px` (`--radius-xl`), `9999px` (`--radius-pill`).
- **Responsive Media Query Breakpoints:** `1200px`, `900px`, `640px`, `420px`.

---

### 5. Accessibility & Motion Findings
1. **WCAG AA Failures:** 
   - Navbar placeholder text drops to **3.1:1** contrast during mid-scroll purple transitions (failing 4.5:1 minimum).
   - Live Pulse badge text (10.5px) on saffron/orange background has **3.2:1** contrast (failing 4.5:1 for small text).
2. **Missing Focus Indicators:** Keyboard tab focus outlines are stripped (`outline: none`) on category pills and topic subtopic chips without `:focus-visible` replacements.
3. **Absence of Motion Queries:** No `@media (prefers-reduced-motion)` rules exist in stylesheets.
4. **Scroll Performance:** Unthrottled `setScrollProgress` on `window.scroll` triggers re-renders on every scroll frame in `TopNavbar.jsx`.
