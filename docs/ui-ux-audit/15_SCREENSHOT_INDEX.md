# Awaaj Man Ki — Phase 6A: Complete UI/UX & Design System Audit
## 15. Screenshot Evidence Index

All screenshots captured during the Phase 6A automated Playwright audit are saved in `docs/ui-ux-audit/screenshots/` and mirrored in `avaajmanki/docs/ui-ux-audit/screenshots/`.

---

### 1. Public & Guest Screens (Desktop 1440 × 900)

| Screenshot Filename | Route | Viewport | View Description |
|:---|:---|:---:|:---|
| `01_landing_guest_1440x900.png` | `/` | 1440 × 900 | Public Landing Page: Hero headline, branding, feature cards, and CTA. |
| `02_login_page_1440x900.png` | `/login` | 1440 × 900 | Split-screen login view: Left artistic branding column, right credentials card. |
| `03_register_page_1440x900.png` | `/register` | 1440 × 900 | Registration form view with credential inputs and step indicator. |
| `04_forgot_password_1440x900.png` | `/forgot-password` | 1440 × 900 | Password recovery request form with email/mobile input. |
| `05_about_page_1440x900.png` | `/about` | 1440 × 900 | Public About page: Vernacular platform philosophy and mission statement. |
| `06_pulse_article_guest_1440x900.png` | `/pulse/8` | 1440 × 900 | Unauthenticated Guest reading view of Elon Musk vs Ambani Starlink story. |

---

### 2. Authenticated User Screens (Desktop 1440 × 900 — Logged in as Aarav)

| Screenshot Filename | Route | Viewport | View Description |
|:---|:---|:---:|:---|
| `07_home_with_pulse_feed_1440x900.png` | `/home` | 1440 × 900 | User Home Portal: Hero banner, Happening Now (Pulse) carousel, topic channels grid. |
| `08_explore_page_1440x900.png` | `/explore` | 1440 × 900 | Global Community Feed: Post cards, voice notes, and hashtag filters. |
| `09_pulse_article_user_1440x900.png` | `/pulse/8` | 1440 × 900 | Authenticated Pulse details page with "Write Your Take" active CTA and comments. |
| `10_create_post_page_1440x900.png` | `/create-post` | 1440 × 900 | Anonymous Post Composer: Topic selector, text area, voice note recorder. |
| `11_topic_discussion_page_1440x900.png` | `/topic/1` | 1440 × 900 | Topic Room (`#MERANETA` Politics): Header banner, topic posts, sidebar collapsed. |
| `12_post_details_page_1440x900.png` | `/post/1` | 1440 × 900 | Deep Post Detail view with reaction counter, comment stream, and reply box. |
| `13_music_page_1440x900.png` | `/music` | 1440 × 900 | Mood Music Station: 3D visualizer canvas, mood playlist, and vinyl turntable. |
| `14_profile_page_1440x900.png` | `/profile` | 1440 × 900 | Anonymous User Profile: Avatar graphic, handle, bio, mood badge, activity tabs. |
| `15_notifications_page_1440x900.png` | `/notifications` | 1440 × 900 | Notifications Dashboard with reaction alerts and unread indicators. |
| `16_settings_page_1440x900.png` | `/settings` | 1440 × 900 | Account & Privacy Settings menu with chevron navigation tiles. |

---

### 3. Admin Editorial & Moderation Hub (Desktop 1440 × 900 — Logged in as Admin)

| Screenshot Filename | Route | Viewport | View Description |
|:---|:---|:---:|:---|
| `17_admin_pulse_hub_1440x900.png` | `/admin/pulse` | 1440 × 900 | Awaaj Pulse Editorial Hub: Candidate review queue, RSS feeds, live stats. |
| `18_admin_dashboard_1440x900.png` | `/admin/dashboard` | 1440 × 900 | System Analytics Dashboard: User metrics, active posts, moderation stats. |

---

### 4. Multi-Viewport Responsive Matrix (6 Breakpoints)

#### A. Home Page Across All 6 Viewports
| Viewport Tier | Exact Resolution | Screenshot Filename |
|:---|:---:|:---|
| **Small Mobile** | 375 × 812 | `resp_home_mobile_small_375x812.png` |
| **Standard Mobile** | 390 × 844 | `resp_home_mobile_std_390x844.png` |
| **Tablet** | 768 × 1024 | `resp_home_tablet_768x1024.png` |
| **Laptop** | 1366 × 768 | `resp_home_laptop_1366x768.png` |
| **Desktop** | 1440 × 900 | `resp_home_desktop_1440x900.png` |
| **Large Desktop** | 1920 × 1080 | `resp_home_desktop_large_1920x1080.png` |

#### B. Awaaj Pulse Article Page Across All 6 Viewports
| Viewport Tier | Exact Resolution | Screenshot Filename |
|:---|:---:|:---|
| **Small Mobile** | 375 × 812 | `resp_pulse_article_mobile_small_375x812.png` |
| **Standard Mobile** | 390 × 844 | `resp_pulse_article_mobile_std_390x844.png` |
| **Tablet** | 768 × 1024 | `resp_pulse_article_tablet_768x1024.png` |
| **Laptop** | 1366 × 768 | `resp_pulse_article_laptop_1366x768.png` |
| **Desktop** | 1440 × 900 | `resp_pulse_article_desktop_1440x900.png` |
| **Large Desktop** | 1920 × 1080 | `resp_pulse_article_desktop_large_1920x1080.png` |

#### C. Landing & Login Pages Responsive Views
| Viewport Tier | Exact Resolution | Landing Page Screenshot | Login Page Screenshot |
|:---|:---:|:---|:---|
| **Small Mobile** | 375 × 812 | `resp_landing_mobile_small_375x812.png` | `resp_login_mobile_small_375x812.png` |
| **Standard Mobile** | 390 × 844 | `resp_landing_mobile_std_390x844.png` | `resp_login_mobile_std_390x844.png` |
| **Tablet** | 768 × 1024 | `resp_landing_tablet_768x1024.png` | `resp_login_tablet_768x1024.png` |
| **Laptop** | 1366 × 768 | `resp_landing_laptop_1366x768.png` | `resp_login_laptop_1366x768.png` |
| **Desktop** | 1440 × 900 | `resp_landing_desktop_1440x900.png` | `resp_login_desktop_1440x900.png` |
| **Large Desktop** | 1920 × 1080 | `resp_landing_desktop_large_1920x1080.png` | `resp_login_desktop_large_1920x1080.png` |

---

*Total Screenshots Generated & Verified:* **42 Screenshots (100% Captured)**
