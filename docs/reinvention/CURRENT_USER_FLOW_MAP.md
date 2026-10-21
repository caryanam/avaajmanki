# Awaaj Man Ki — Current User Flow Map
## Document: CURRENT_USER_FLOW_MAP.md

**Role:** Principal UX Architect & Product Design Director  
**Purpose:** Map the exact step-by-step user journeys on the current platform, comparing designed flows against user realities, friction barriers, and dead ends.

---

### Journey A: First-Time Visitor Experience

```mermaid
journey
    title Current First-Time Visitor Journey (High Friction)
    section 1. Discovery
      Arrives at "/" via search or shared link: 4: Visitor
      Scans landing headline & marketing text: 3: Visitor
      Looks for live community posts or news: 1: Visitor
    section 2. Auth Wall Barrier
      Clicks "Explore Topics" or post card: 2: Visitor
      Hit with immediate redirect to "/login": 1: Visitor
      Clicks "Create Account" -> enters registration: 2: Visitor
      Fills Name, Mobile/Email, Password: 2: Visitor
      Waits for 6-digit OTP delivery: 2: Visitor
      Submits OTP successfully: 4: Visitor
    section 3. Mandatory Setup Blockade
      Forced into Avatar Setup Wizard (/setup-profile): 2: Visitor
      Must pick 2D or 3D avatar & username: 3: Visitor
      Forced into Interest Selection (/onboarding): 2: Visitor
      Finally redirected to "/home": 4: Visitor
    section 4. First Content Interaction
      Overwhelmed by 82+ topic chips & Pulse carousel: 2: Visitor
      Clicks topic card -> reaches first post: 4: Visitor
```

#### Analytical Breakdown:
- **Entry Point:** Direct URL (`/`), search engine, or shared social link.
- **The Core Friction Point:** The landing page displays zero live content. When a visitor attempts to see what real people are saying, they are immediately bounced to `/login`.
- **Registration Pain:** The signup form requires a "Full Name", contradicting the platform's core promise of anonymity.
- **Wizard Lockout:** Visitors cannot browse after signup until they complete both the Avatar Studio and the Onboarding interest picker. This multi-step gate causes high abandonment before the user ever experiences product value.

---

### Journey B: Returning Community Member Experience

```mermaid
sequenceDiagram
    autonumber
    actor Member as Returning Member
    participant Home as /home
    participant Topic as /topic/:id
    participant Post as /post/:id
    participant Comment as CommentComposer

    Member->>Home: Opens website (Active session)
    Note over Home: Sees Hero + Pulse Carousel + 82 Topic Chips
    Member->>Home: Looks for fresh posts from followed topics
    Note over Home: No post feed on Home! Must pick a topic
    Member->>Home: Clicks #SHAYARI topic channel card
    Home->>Topic: Navigates to /topic/3
    Note over Topic: Sidebar collapses into 10px hover strip (68px layout jump)
    Member->>Topic: Scrolls topic post stream
    Topic->>Post: Clicks interesting poem post
    Note over Post: Content + Voice Player + Threaded Comments
    Member->>Post: Taps Heart reaction
    Member->>Comment: Types anonymous reply & clicks Send
    Comment-->>Post: Optimistic comment inserted into thread
```

#### Analytical Breakdown:
- **Entry Point:** Bookmarked `/home` or push notification.
- **The Core Flaw:** The home page is a static directory of topics rather than a personalized, dynamic feed of unread posts. A returning user cannot see what happened since their last visit without clicking into individual topic silos.
- **Layout Jitter:** The sudden collapse of the desktop sidebar on topic rooms shifts the entire reading layout by 68px.

---

### Journey C: Awaaj Pulse News Reader Experience

```mermaid
flowchart TD
    Start["Discovers 'Happening Now' on Home"] --> OpenArticle["Clicks featured news card (e.g. Starlink Feud)"]
    OpenArticle --> ReadSummary["Navigates to /pulse/:id (Reads 2-3 sentence RSS summary)"]
    ReadSummary --> CheckSource["Reviews verified publisher badge (The Hindu)"]
    CheckSource --> ForkDecision{"Wants to read full article or discuss?"}
    
    ForkDecision -->|"Wants full story"| ExternalLink["Clicks 'Read original coverage ↗'<br/>(Leaves Awaaj Man Ki completely)"]
    
    ForkDecision -->|"Wants to write short take"| TakeModal["Clicks 'Write Your Take'<br/>(Opens 280-char modal on same page)"]
    TakeModal --> SubmitTake["Submits take -> Appears in Community Takes stream"]
    
    ForkDecision -->|"Wants in-depth debate"| JoinDisc["Clicks 'Join Discussion' CTA"]
    JoinDisc --> OrphanPost["Redirects to /create-post under /topic/GENERAL<br/>(Loses headline, publisher badge & photo context)"]
```

#### Analytical Breakdown:
- **Entry Point:** Horizontal carousel on `/home` or direct deep link (`/pulse/8`).
- **Public Gating:** Excellent public reading access. Unauthenticated visitors can read summaries and community reactions freely.
- **The Breakdown Point:** The user experience fragments at the point of discussion. Users are presented with two conflicting actions: *"Write Your Take"* (keeps comments local) versus *"Join Discussion"* (creates an orphaned thread in `/topic/GENERAL`).

---

### Journey D: Content Creator Experience

```mermaid
sequenceDiagram
    actor Author as Anonymous Creator
    participant UI as /create-post
    participant Audio as Voice Recorder
    participant AI as AI Moderation
    participant Feed as Topic Feed

    Author->>UI: Clicks "+" (Navbar or Mobile Center FAB)
    UI->>UI: Selects Topic from Category dropdown
    UI->>UI: Types Title & Body text
    Author->>Audio: Taps "Record Voice Note" (Optional)
    Audio-->>UI: Attaches 60s WebM voice recording
    Author->>UI: Toggles "Spoiler / Sensitive Content"
    Author->>UI: Clicks "Publish Anonymously"
    UI->>AI: Sends payload to moderation engine
    Note over AI: Scans for hate speech, abuse, and PII
    AI-->>UI: Status: ACTIVE (Passed)
    UI->>Feed: Navigates to Topic feed with published post
```

#### Analytical Breakdown:
- **Entry Point:** Top navbar "+" icon or mobile bottom navigation center FAB.
- **Strengths:** Excellent voice recording integration; clean anonymous badge assurances.
- **Weaknesses:** No draft auto-saving; accidental navigation or browser refresh causes complete loss of composed content; no image cropping or filter adjustment.

---

### Journey E: Mood Music Listener Experience

```mermaid
flowchart LR
    A["Browses any page"] --> B["Taps Mood Widget in Top Navbar"]
    B --> C["Opens MoodSelectionModal (Picks 'Romantic')"]
    C --> D["Audio streams in background via MoodMusicContext"]
    D --> E["Persistent Mini-Player docks in lower right"]
    E --> F["Navigates /home -> /topic/1 -> /pulse/8<br/>(Playback never stutters)"]
    F --> G["Clicks 'Music' in Left Sidebar"]
    G --> H["Enters /music Station<br/>(Mini-player automatically hides to prevent duplicate controls)"]
```

#### Analytical Breakdown:
- **Entry Point:** Navbar mood widget or sidebar Music link.
- **Strengths:** Seamless audio streaming managed in root React context; tracks never reload during route hops.
- **Weaknesses:** On mobile devices, the mini-player sits directly on top of the bottom navigation bar, causing accidental mis-taps between player controls and navigation tabs.

---

### Journey F: Account, Safety & Moderation Flow

```mermaid
flowchart TD
    A["User encounters abusive comment/post"] --> B["Clicks three-dot menu (...) on card"]
    B --> C["Selects 'Report Content'"]
    C --> D["Opens ReportModal (Picks reason: Harassment / Hate Speech)"]
    D --> E["Submits report to backend"]
    E --> F["Post is immediately hidden for reporting user"]
    E --> G["Report is logged in Admin Content Review Queue"]
    F --> H["User checks /my-reports to track investigation status"]
```

#### Analytical Breakdown:
- **Entry Point:** Card overflow menu.
- **Strengths:** High transparency; users can track whether admins took action on their reports via `/my-reports`.
- **Weaknesses:** "My Reports" is over-promoted to a primary top-level menu item in the left sidebar, crowding out higher-value consumer features like "Saved Posts".

---

### Journey G: Mobile User Journey Matrix (Differences vs. Desktop)

| Flow / Touchpoint | Desktop Experience (1440px) | Mobile Experience (390px) | Usability Friction on Mobile |
|:---|:---|:---|:---|
| **App Navigation** | Fixed left rail (68px) + Top header | Fixed bottom 5-tab bar + Top drawer | Bottom nav consumes 60px; top drawer requires awkward reach to top-left. |
| **Home Scanning** | 3.5 Pulse cards visible; 3-column topic grid | 1 Pulse card visible; 1-column topic stack | Page scroll depth exceeds 4,200px; extensive scrolling required. |
| **Subtopic Tapping** | Generous cursor hover target | Tiny 26px chip buttons | **81.7% fail 44px tap target rule**; high rate of accidental mis-clicks. |
| **Music Playback** | Floating widget in bottom-right corner | Docked bar above bottom nav | Overlaps bottom navigation tabs; combined bottom bars consume ~15% of screen height. |
| **Comment Composer** | Fixed at bottom of post card | Docked above mobile bottom bar | Mobile virtual keyboard pushes composer up, obscuring the parent comment. |
