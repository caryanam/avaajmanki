# Awaaj Man Ki — Phase 6A: Complete UI/UX & Design System Audit
## 09. Page-by-Page Visual and UX Audit

This document conducts an in-depth visual hierarchy, readability, interaction, and responsiveness audit of every user-facing page and key admin views.

---

### 1. Landing Page (`/` or `/index.html`)
- **Visual Hierarchy:** Top-heavy hero with serif headline (*मनातलं बोला…*), followed by 3 value prop cards, an avatar illustration showcase, and footer.
- **Most Prominent Element:** The purple gradient CTA button (*"Join Anonymous Community"*).
- **Primary User Action:** Click CTA to register or log in.
- **Secondary Actions:** Browse public info links (About, Guidelines, FAQ).
- **Information Density:** Low to Medium.
- **Whitespace Balance:** Well-spaced on desktop, but overly elongated on mobile (requires ~2.5 full scroll heights).
- **Readability:** High contrast; DM Serif Display renders warmly.
- **Discoverability:** Lacks any sample user discussions or live Pulse news previews.
- **Responsiveness:** Hero image stacks below text on mobile; CTA button remains full width.
- **Accessibility:** Missing `alt` tags on some decorative SVG illustrations.
- **What Works Well:** Warm vernacular cultural tone; clear message of safety and privacy.
- **What Feels Outdated:** Static marketing style reminiscent of 2018 SaaS landing pages rather than a buzzing consumer social network.

---

### 2. Login Page (`/login`)
- **Visual Hierarchy:** Split-screen layout on desktop: Left half features brand art and quote; Right half hosts the login card.
- **Most Prominent Element:** "Sign In" button with plum gradient.
- **Primary User Action:** Enter identifier and password to authenticate.
- **Secondary Actions:** "Forgot Password?", "Create New Account", Admin toggle.
- **Information Density:** Low and focused.
- **Whitespace Balance:** Balanced.
- **Readability:** Clean labels and clear inputs.
- **Responsiveness:** Left art column hides on `< 900px`, centering the form card.
- **Accessibility:** Form fields have associated labels; password toggle is slightly small (16px icon inside 30px touch zone).
- **Interaction Problems:** When errors occur (e.g. incorrect password), toast notification fires, but no persistent inline field error appears.
- **What Works Well:** Fast auto-focus on identifier field; smooth transition.

---

### 3. Registration Page (`/register`)
- **Visual Hierarchy:** Two-step progress card: 1. Credentials, 2. OTP Verification.
- **Most Prominent Element:** "Continue to Verification" button.
- **Primary User Action:** Submit details and enter 6-digit OTP code.
- **Information Density:** Medium.
- **Whitespace Balance:** Good.
- **UX & Accessibility Issues:** Requires "Full Name" which confuses visitors on an anonymous platform; OTP countdown timer is 60 seconds without an instant fallback.
- **What Works Well:** Step indicator clearly signals where the user is in the process.

---

### 4. Home Page (`/home`)
- **Visual Hierarchy:** 
  1. Top Navbar (dynamic purple-shifting bar)
  2. Hero Banner (dark plum with saffron "+ Create Topic" button)
  3. Happening Now in India (Awaaj Pulse news carousel)
  4. Category filter pills (All Topics, Feelings, Expression, Life, Politics, etc.)
  5. 2-to-3 column Topic Channel Cards grid
- **Most Prominent Element:** Hero Banner and Saffron "+ Create Topic" button.
- **Primary User Action:** Click a topic card to enter discussion room.
- **Secondary Actions:** Swipe Pulse news carousel, search topics, filter by category tab, open music widget.
- **Information Density:** Extremely High. Presents 82+ interactive targets on a single screen.
- **Whitespace Balance:** Crowded. Topic cards contain dense lists of subtopic pills that wrap tightly.
- **Readability:** Excellent text contrast on individual cards, but excessive competing visual stimuli.
- **Responsiveness:** On mobile (390px), page height stretches past 4,200px. Subtopic pills shrink to 26px height, making thumb tapping error-prone (81.7% failure rate on 44px tap guideline).
- **What Works Well:** Vibrant cultural topics (Shayari, Bollywood, Cricket, Feelings); live Pulse news carousel provides real-time freshness.
- **What Feels Inconsistent:** Home contains NO social post stream. Users expecting a social feed see only a directory of channels.

---

### 5. Explore Page (`/explore`)
- **Visual Hierarchy:** Search bar at top, trending hashtag filter strip, followed by single-column infinite scroll feed of community posts.
- **Most Prominent Element:** Post card stream.
- **Primary User Action:** Read posts, listen to voice notes, tap reactions.
- **Secondary Actions:** Filter by media type (Text, Voice, Image), search posts.
- **Information Density:** Medium.
- **Whitespace Balance:** Clean 20px card spacing.
- **Readability:** High; post font size (15px/16px) is comfortable.
- **Responsiveness:** Feed expands to 100% width on mobile; reactions bar wraps gracefully.
- **What Works Well:** Real social feed experience; voice notes render with interactive audio wave bars.
- **What Feels Outdated:** Search input lacks instant debounced auto-complete; hashtag chips lack post count badges.

---

### 6. Topic Discussion Page (`/topic/:id`)
- **Visual Hierarchy:** Topic header banner (Emoji, topic title, description, subscriber count), "+ New Post" button, followed by chronological topic posts.
- **Most Prominent Element:** Topic Header and Post Composer card.
- **Primary User Action:** Read channel posts or submit a new post to the topic.
- **Interaction Flaw:** In `LeftSidebar.jsx`, entering a topic page sets `isTopicPage = true`, causing the left sidebar to collapse into a 10px hover strip offscreen. This causes the main feed to violently jump leftwards by 68px.
- **Responsiveness:** Banner takes up 35% of the mobile viewport, pushing the first post below the fold.
- **What Works Well:** Focused community discussion vibe; distinct ambient background colors per category.

---

### 7. Post Details Page (`/post/:id`)
- **Visual Hierarchy:** Post header (author avatar, handle, time), post title, body text, audio player (if voice note), reaction counter, comment composer, and threaded comment list.
- **Most Prominent Element:** Post content card and reaction bar.
- **Primary User Action:** Read comments and type a reply.
- **Readability:** Stretched line lengths on desktop wide mode (up to 1,160px wide / 140 chars per line), which hurts reading endurance.
- **Mobile Usability:** When the user taps the comment composer, the mobile virtual keyboard pushes the reply box up, often hiding the comment they are replying to.
- **What Works Well:** Threaded reply nesting; instant optimistic UI updates on comment submission.

---

### 8. Create Post Page (`/create-post`)
- **Visual Hierarchy:** Centered card with topic dropdown, title input, content editor, voice note recorder, spoiler toggle, and submit button.
- **Most Prominent Element:** "Publish Anonymously" button.
- **Primary User Action:** Type content and publish.
- **Secondary Actions:** Record voice note, attach image, pick mood tag.
- **Information Density:** Balanced.
- **Accessibility:** Form fields have clear labels and placeholder cues.
- **Friction:** No auto-save draft functionality; accidental navigation wipes draft.

---

### 9. Awaaj Pulse Featured News Section (`HappeningNowSection` on `/home`)
- **Visual Hierarchy:** Section header with flame icon and "LIVE PULSE" badge, left/right navigation arrows, and horizontal card slider.
- **Most Prominent Element:** 16:9 news thumbnail with high contrast publisher badge.
- **Primary User Action:** Click card to read news details.
- **Secondary Actions:** Scroll horizontally through cards.
- **Information Density:** High and engaging.
- **Responsiveness:** On desktop, displays 3.5 cards with desktop arrow controls. On mobile, snaps smoothly to 1 card at a time with touch swipe.
- **What Works Well:** Publisher source attribution (`The Hindu`, `BBC News`) establishes immediate credibility; high editorial aesthetic.
- **What Needs Improvement:** Arrow buttons are invisible on small screens; cards have fixed 340px width that can cause horizontal drag stiffness.

---

### 10. Awaaj Pulse Article Details Page (`/pulse/:id`)
- **Visual Hierarchy:** 
  1. Breadcrumb navigation (← Back to Home)
  2. Verified Publisher attribution badge and external source link
  3. Article Headline (24px bold)
  4. Full-width 16:9 featured news photography
  5. Editorial Summary and background context
  6. Action Bar: "Write Your Take" button, like count, take count
  7. Community Takes stream (speech bubble cards)
- **Most Prominent Element:** News photo and "Write Your Take" CTA.
- **Primary User Action:** Read editorial context and write a take.
- **Secondary Actions:** View original publisher link, upvote takes.
- **Public Accessibility:** Open to unauthenticated guests for reading.
- **What Works Well:** Clean editorial magazine feel; community takes section creates lively discourse.
- **What Needs Improvement:** The editorial summary is short (often just 2–3 sentences from RSS). Readers looking for the full article must click external links that take them off-platform.

---

### 11. Pulse Community Takes and Discussion Flow
- **Visual Hierarchy:** Speech bubble cards with distinct quotation notches, anonymous avatar, take text (max 280 chars), and agree/disagree badges.
- **Most Prominent Element:** The "Write Your Take" modal dialog.
- **Interaction Evaluation:** Very high engagement potential. Takes resemble quick Twitter/Threads reactions, creating a fast-paced debate without long-form essay burden.
- **Flaw:** Clicking "Join Discussion" redirects the user to create a post under `/topic/GENERAL`, fragmenting comments across two locations.

---

### 12. Music Station Page (`/music`)
- **Visual Hierarchy:** Top 3D frequency visualizer canvas, mood filter pills (Sad, Romantic, Devotional, Lofi), currently playing track card, and curated playlist table.
- **Most Prominent Element:** Audio spectrum visualizer and vinyl spinning artwork.
- **Primary User Action:** Select track and play.
- **Information Density:** Medium.
- **Responsiveness:** Visualizer canvas scales down on mobile; track table converts to tap cards.
- **What Works Well:** Immersive audio experience; tracks stream smoothly in background across all routes.
- **What Needs Improvement:** Heavy CPU/GPU usage when 3D visualizer is running on lower-spec mobile devices.

---

### 13. Profile Page (`/profile`)
- **Visual Hierarchy:** Centered avatar card with mood badge, anonymous handle, join date, bio, stats bar (Posts, Takes, Reactions received), and activity tab switcher.
- **Most Prominent Element:** 3D/2D Avatar graphic.
- **Primary User Action:** Review personal activity or tap "Edit Profile".
- **Information Density:** Medium.
- **What Works Well:** Strong emphasis on the anonymous persona.
- **What Needs Improvement:** Anonymous handle is static; user cannot see breakdown of which posts earned reactions.

---

### 14. Settings Page (`/settings` & sub-pages)
- **Visual Hierarchy:** List of settings categories (Privacy, Account, Notifications, Safety, Language, Delete Account) with chevron arrows.
- **Information Density:** Low.
- **Responsiveness:** Clean list layout across all viewports.
- **What Works Well:** Straightforward; clear privacy toggles.
- **What Needs Improvement:** Separate sub-pages (`/settings/privacy`, `/settings/account`) force full page transitions rather than tabs.

---

### 15. Notifications Page (`/notifications`)
- **Visual Hierarchy:** Filter tabs (All, Mentions, Reactions, System), followed by vertical alert cards with unread dot indicators.
- **Most Prominent Element:** Unread notification cards with plum border highlight.
- **Primary User Action:** Tap notification to navigate to relevant post or take.
- **What Needs Improvement:** No "Mark All as Read" button; tapping a notification lands at the top of the post rather than scrolling to the specific comment.

---

### 16. Admin Editorial Hub (`/admin/pulse` & `/admin/dashboard`)
- **Visual Hierarchy:** Admin topbar with pending candidate badges, tab switcher (Live Items, Candidates Queue, RSS Sources, Analytics), and data table with action buttons (Approve, Edit, Reject, Feature).
- **Most Prominent Element:** Candidate review queue table and editorial modals.
- **Information Density:** Extremely High (Professional Editorial Tool).
- **Responsiveness:** Desktop-first (optimized for 1366px - 1920px); horizontal scroll on tablet/mobile.
- **What Works Well:** Complete editorial workflow: RSS ingestion, AI candidate staging, manual editing, placement pinning, and audit logging.
- **What Needs Improvement:** Modals are very dense; candidate queue needs bulk multi-select actions.
