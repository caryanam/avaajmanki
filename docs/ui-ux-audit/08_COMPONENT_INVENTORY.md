# Awaaj Man Ki — Phase 6A: Complete UI/UX & Design System Audit
## 08. Exact Existing Design System: Component Inventory

This document catalogs every reusable UI component across `src/components/`, inspecting its variants, states, accessibility attributes, and stylistic inconsistencies.

---

### 1. Navigation and Shell Components

| Component | File Path | Props / Variants | Rendered States | UX & Design Observations |
|:---|:---|:---|:---|:---|
| `TopNavbar` | [`src/components/layout/TopNavbar.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/layout/TopNavbar.jsx) | `activeRoute`, `onNavigate` | Normal (White), Scrolled (Plum), Mobile Drawer Open | Uses JavaScript per-frame RGB interpolation on scroll. Highly custom, but creates color-contrast dips at mid-scroll points. |
| `LeftSidebar` | [`src/components/layout/LeftSidebar.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/layout/LeftSidebar.jsx) | `activeRoute`, `onNavigate` | Expanded, Collapsed (68px), Hover-strip (10px on `/topic/*`) | Fixed 68px width is icon-only. Labels only appear on hover tooltip, making discovery difficult for new users. |
| `MobileNavigation` | [`src/components/layout/MobileNavigation.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/layout/MobileNavigation.jsx) | `activeRoute`, `onNavigate` | Default, Active tab, Center FAB active | Sticky bottom 60px bar. Floating "+" button in center has strong plum glow. Fixed z-index (990). |
| `Footer` | [`src/components/layout/Footer.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/layout/Footer.jsx) | `onNavigate` | Public footer, Collapsed copyright | Contains 7 informational links (About, Guidelines, Privacy, Contact, FAQ, Child Safety). Clean but plain. |

---

### 2. Cards and Content Presentation

| Component | File Path | Usage | Rendered Structure | Inconsistencies & Issues |
|:---|:---|:---|:---|:---|
| `PulseFeaturedCard` | [`src/components/pulse/PulseFeaturedCard.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/pulse/PulseFeaturedCard.jsx) | Featured news card on `/home` | 16:9 thumbnail, publisher badge, category pill, 2-line title, 2-line summary, timestamp, reaction count | Fixed width (340px) requires horizontal scroll. Uses `#2D1D15` text, high quality image rendering. |
| `PulseDiscussionCard` | [`src/components/pulse/PulseDiscussionCard.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/pulse/PulseDiscussionCard.jsx) | Community Take card on `/pulse/:id` | Anonymous avatar, handle, verified badge, take body, agree/disagree counters | Uses speech-bubble styling; high contrast and very engaging. Good design pattern. |
| `PostCard` | [`src/components/posts/PostCard.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/posts/PostCard.jsx) | Social post card in feeds | Avatar, author handle, time, topic badge, title, body, voice player, reaction bar, menu | Card padding (24px) feels slightly loose on mobile. Actions bar has 4 distinct reaction icons. |
| `ContentReviewCard` | [`src/components/admin/ContentReviewCard.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/admin/ContentReviewCard.jsx) | Admin moderation queue | Flagged snippet, AI moderation score, approve/reject buttons | Functional table-card hybrid. |

---

### 3. Inputs, Forms, and Interactive Controls

| Component | File Path | States Handled | Validation / Accessibility | Inconsistencies & Issues |
|:---|:---|:---|:---|:---|
| `Button` | [`src/components/common/Button.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/common/Button.jsx) | `primary`, `secondary`, `outline`, `ghost`, `danger`, `loading` | Focus ring, Disabled state, `aria-busy` | Many pages bypass this component and declare inline `<button style={{ ... }}>`, leading to inconsistent border radii. |
| `Input` | [`src/components/common/Input.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/common/Input.jsx) | `default`, `error`, `disabled`, `withIcon` | Error helper text, Label, `aria-invalid` | Clean 14px border radius. However, search inputs on navbar and home are hardcoded raw `<input>` elements. |
| `Textarea` | [`src/components/common/Textarea.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/common/Textarea.jsx) | `default`, `autoGrow`, `error` | Character counter, helper label | Character counter text color (`#8C8385`) is small (11px). |
| `Select` / `Dropdown` | [`src/components/common/Dropdown.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/common/Dropdown.jsx) | Open, Closed, Hover, Selected | Escape key handler, outside-click listener | Dropdown menus do not support full keyboard arrow-key navigation. |

---

### 4. Discussion, Comments, and Social Interaction

| Component | File Path | Purpose | Key Sub-Elements | UX Evaluation |
|:---|:---|:---|:---|:---|
| `CommentComposer` | [`src/components/comments/CommentComposer.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/comments/CommentComposer.jsx) | Post reply form | Avatar preview, auto-expanding textarea, emoji picker, send button | Clean docked layout, but covers bottom comment when virtual keyboard opens on mobile. |
| `CommentCard` | [`src/components/comments/CommentCard.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/comments/CommentCard.jsx) | Individual comment | Avatar, username, timestamp, comment text, reply trigger, reaction button | Clean layout; reply nesting beyond 2 levels causes narrow text column on mobile. |
| `SpeechBubbleComment` | [`src/components/comments/SpeechBubbleComment.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/comments/SpeechBubbleComment.jsx) | Pulse takes bubble | Speech triangle notch, author badge, agree counter | Distinctive styling, highly effective for quick 280-character hot-takes. |
| `ReactionsBar` | [`src/components/posts/ReactionsBar.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/posts/ReactionsBar.jsx) | Post reactions | Heart, Flame, Laugh, Sad, Share | Uses subtle scaling animation on tap (`transform: scale(1.2)`). Good tactile feedback. |
| `WriteYourTakeModal` | [`src/components/pulse/WriteYourTakeModal.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/pulse/WriteYourTakeModal.jsx) | Compose pulse take | News thumbnail context, 280-char countdown, anonymous posture badge | Excellent context preservation within modal, but should ideally offer an inline composer as well. |

---

### 5. Dialogs, Modals, and Overlays

| Component | File Path | Dimensions | Trigger / Dismissal | Flaws & Inconsistencies |
|:---|:---|:---|:---|:---|
| `Modal` | [`src/components/common/Modal.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/common/Modal.jsx) | Max-width: 520px | Backdrop click, 'X' button, Escape key | Smooth fade-in, but backdrop blur (`backdrop-filter: blur(8px)`) causes GPU lag on older Android devices. |
| `LargeDiscussionWindow`| [`src/components/posts/LargeDiscussionWindow.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/posts/LargeDiscussionWindow.jsx) | Max-width: 1100px | Topic card expand action | Massive modal overlay that duplicates the `/topic/:id` page within a modal window. Creates routing disorientation. |
| `AvatarStudioModal` | [`src/components/avatar/AvatarStudioModal.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/avatar/AvatarStudioModal.jsx) | Fullscreen / 840px | Profile setup, edit profile | Contains Three.js 3D canvas viewer. Beautiful feature, but heavy initial load. |
| `TopicCreateModal` | [`src/components/topics/TopicCreateModal.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/topics/TopicCreateModal.jsx) | Max-width: 480px | "+ Create Topic" button on `/home` | Clean emoji selector + text input. |
| `ToastContainer` | [`src/components/common/Toast.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/common/Toast.jsx) | Fixed top-right | Auto-dismiss after 3000ms | Sits at z-index 1500; sometimes overlaps top-right user avatar menu. |

---

### 6. Music & Audio Components

| Component | File Path | Placement | Interactive Features | Issues |
|:---|:---|:---|:---|:---|
| `MoodMusicWidget` | [`src/components/music/MoodMusicWidget.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/music/MoodMusicWidget.jsx) | Floating bottom-right (Desktop) / Docked above bottom bar (Mobile) | Play/Pause, track name, mood icon, expand button | Floating widget obstructs bottom-right content on desktop when browsing long threads. |
| `NavbarMoodWidget`| [`src/components/mood/NavbarMoodWidget.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/mood/NavbarMoodWidget.jsx) | Inside TopNavbar | Pulsing music note, current mood label | Compact, elegant entry point into mood selection. |
| `WaveformPlayer` | [`src/components/music/WaveformPlayer.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/music/WaveformPlayer.jsx) | Inside post cards with voice notes | Interactive scrub bar, play toggle, duration timestamp | Renders audio waveform cleanly; touch scrubbing on mobile is slightly sensitive. |
| `NowPlayingPanel` | [`src/components/music/NowPlayingPanel.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/music/NowPlayingPanel.jsx) | On `/music` page | Full album art, mood tags, queue control, volume | Premium feel with vinyl spin animation. |

---

### 7. Skeletons, Feedback, and Empty States

| Component | File Path | Presentation | Consistency Score |
|:---|:---|:---|:---|
| `PulseCardSkeleton`| [`src/components/pulse/PulseCardSkeleton.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/pulse/PulseCardSkeleton.jsx) | Pulsing gray shimmer matching 340×380px news card | High (Exact match for loaded card geometry) |
| `Loader` | [`src/components/common/Loader.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/common/Loader.jsx) | Spinning circular plum border | Medium (Generic spinner; causes layout shifts where skeletons would be better) |
| `EmptyState` | [`src/components/common/EmptyState.jsx`](file:///c:/Users/Niraj%20Ghube/OneDrive/Desktop/fron35/avaajmanki/src/components/common/EmptyState.jsx) | Illustrated icon, heading, descriptive text, CTA button | High (Polished empty state presentation) |
