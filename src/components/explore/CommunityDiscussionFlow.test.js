import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const TOPIC_COMMUNITY_PAGE = path.resolve('src/pages/user/TopicCommunityPage.jsx');
const POST_DISC_PAGE = path.resolve('src/pages/user/PostDiscussionPage.jsx');
const APP_ROUTES = path.resolve('src/routes/AppRoutes.jsx');
const EXPLORE_PAGE = path.resolve('src/pages/user/ExplorePage.jsx');
const TRENDING_DISC_CARD = path.resolve('src/components/explore/TrendingDiscussionCard.jsx');
const TOPIC_DISC_CSS = path.resolve('src/styles/topic-discussion.css');

test('Core Journey - File Structure and Architectural Separation', () => {
  assert.ok(fs.existsSync(TOPIC_COMMUNITY_PAGE), 'TopicCommunityPage.jsx must exist');
  assert.ok(fs.existsSync(POST_DISC_PAGE), 'PostDiscussionPage.jsx must exist');
  assert.ok(fs.existsSync(APP_ROUTES), 'AppRoutes.jsx must exist');
  assert.ok(fs.existsSync(EXPLORE_PAGE), 'ExplorePage.jsx must exist');
});

test('Experience 1: Explore Page - Topic Cards and Discussion Cards Navigation', () => {
  const exploreContent = fs.readFileSync(EXPLORE_PAGE, 'utf8');
  assert.ok(
    exploreContent.includes('/topic/${topicSlug}') || exploreContent.includes('/topic/'),
    'Popular topic cards must navigate to /topic/:topicSlug'
  );

  const cardContent = fs.readFileSync(TRENDING_DISC_CARD, 'utf8');
  assert.ok(
    cardContent.includes('/post/${postId}'),
    'Trending discussion cards must navigate to /post/:postId'
  );
  assert.ok(cardContent.includes('Join Discussion'), 'Card must have Join Discussion button');
});

test('Experience 2: Topic Community Page - Cover, Post Composer, Feed & Join', () => {
  const content = fs.readFileSync(TOPIC_COMMUNITY_PAGE, 'utf8');

  // Hero Banner Requirements
  assert.ok(content.includes('community-hero-banner'), 'Must render community hero banner');
  assert.ok(content.includes('community-hero-cover-img'), 'Must render cover image');
  assert.ok(content.includes('community-hero-title'), 'Must render community title');
  assert.ok(content.includes('community-hero-description'), 'Must render community description');
  assert.ok(content.includes('community-join-btn'), 'Must render Join Topic button');
  assert.ok(content.includes('mka_joined_topics'), 'Must track joined status in localStorage');

  // "What's on your mind?" Composer with pre-selected topic
  assert.ok(content.includes('ExploreComposer'), 'Must render ExploreComposer');
  assert.ok(content.includes('defaultTopic={topicMeta.id}'), 'Must pre-select active community topic in composer');

  // Filtered Community Feed
  assert.ok(content.includes('community-feed-section'), 'Must render community feed');
  assert.ok(content.includes('community-feed-sort-tabs'), 'Must render Trending and Latest sort tabs');
  assert.ok(content.includes('community-view-discussion-btn'), 'Must render View Discussion button');
  assert.ok(content.includes('/post/${postId}'), 'View Discussion must navigate to post discussion');
});

test('Experience 3: Individual Post Discussion Page - 3-Column Grid and Main Post', () => {
  const content = fs.readFileSync(POST_DISC_PAGE, 'utf8');

  // Layout Requirements
  assert.ok(content.includes('post-disc-desktop-grid'), 'Must render 3-column desktop grid');
  assert.ok(content.includes('DesktopSidebar'), 'Must reuse global DesktopSidebar in left column');
  assert.ok(content.includes('post-disc-center-col'), 'Must render center column for main post');
  assert.ok(content.includes('post-disc-right-panel'), 'Must render right column discussion panel');

  // Breadcrumbs & Back Navigation
  assert.ok(content.includes('topic-disc-breadcrumb'), 'Must render breadcrumbs');
  assert.ok(content.includes('post-disc-back-btn'), 'Must render back navigation button');

  // Original Post Article
  assert.ok(content.includes('post-disc-original-card'), 'Must render original post card');
  assert.ok(content.includes('post-disc-title'), 'Must render post title');
  assert.ok(content.includes('post-disc-content'), 'Must render post content');
  assert.ok(content.includes('post-disc-engagement-bar'), 'Must render reactions and actions bar');
});

test('Experience 4: Message Composer - Matches Awaaj Pulse Requirements', () => {
  const content = fs.readFileSync(POST_DISC_PAGE, 'utf8');

  // Anchored Bottom Discussion Composer
  assert.ok(content.includes('post-disc-bottom-composer'), 'Must anchor composer at bottom of discussion panel');
  assert.ok(content.includes('avatarSilhouette'), 'Must display anonymous silhouette avatar');
  assert.ok(content.includes('post-disc-composer-textarea'), 'Must render textarea input');
  assert.ok(content.includes('EmojiPicker'), 'Must integrate EmojiPicker');
  assert.ok(content.includes('useVoiceRecorder'), 'Must integrate voice-to-text recording');
  assert.ok(content.includes("['EN', 'HI', 'MR']"), 'Must render EN, HI, MR language selector pills');
  assert.ok(content.includes('post-disc-char-count'), 'Must display character counter');
  assert.ok(content.includes('post-disc-send-btn'), 'Must render Post/Reply send button');

  // Discussion stream capabilities
  assert.ok(content.includes('post-disc-comments-stream'), 'Must render scrollable comments stream');
  assert.ok(content.includes('TruncatedCommentText'), 'Must clamp comments with Read more');
  assert.ok(content.includes('post-disc-nested-replies'), 'Must render nested replies');
  assert.ok(content.includes('handleDeleteComment'), 'Must implement owner-only delete');
});

test('Routing Integration in AppRoutes.jsx', () => {
  const routesContent = fs.readFileSync(APP_ROUTES, 'utf8');
  assert.ok(routesContent.includes('TopicCommunityPage'), 'AppRoutes must import TopicCommunityPage');
  assert.ok(routesContent.includes('PostDiscussionPage'), 'AppRoutes must import PostDiscussionPage');
  assert.ok(routesContent.includes("normalizedPath.startsWith('/topic/')"), 'AppRoutes must handle /topic/');
  assert.ok(routesContent.includes("normalizedPath.startsWith('/post/')"), 'AppRoutes must handle /post/');
});

test('CSS Verification in topic-discussion.css', () => {
  const cssContent = fs.readFileSync(TOPIC_DISC_CSS, 'utf8');
  assert.ok(cssContent.includes('.community-hero-banner'), 'Must include .community-hero-banner');
  assert.ok(cssContent.includes('.post-disc-desktop-grid'), 'Must include .post-disc-desktop-grid');
  assert.ok(cssContent.includes('.post-disc-right-panel'), 'Must include .post-disc-right-panel');
  assert.ok(cssContent.includes('.post-disc-bottom-composer'), 'Must include .post-disc-bottom-composer');
});

test('Experience 5: YouTube-Style In-Feed Expandable Comments on Topic Feed', () => {
  const content = fs.readFileSync(TOPIC_COMMUNITY_PAGE, 'utf8');

  // Must have InFeedPostComments with single-expanded-post state
  assert.ok(content.includes('InFeedPostComments'), 'Must render InFeedPostComments in feed');
  assert.ok(content.includes('expandedPostId'), 'Must manage expandedPostId state for single open comments section');
  assert.ok(content.includes('commentDrafts'), 'Must preserve comment drafts per post across collapses');
  assert.ok(content.includes('infeed-comments-container'), 'Must render infeed comments container');
  assert.ok(content.includes('infeed-composer-box'), 'Must render in-feed comment composer');
  assert.ok(content.includes('infeed-comments-stream'), 'Must render in-feed comments stream');
  assert.ok(content.includes('infeed-nested-replies-wrap'), 'Must render nested replies with connector guide line');
  assert.ok(content.includes('infeed-lang-selector'), 'Must render EN, HI, MR language pills');
});

