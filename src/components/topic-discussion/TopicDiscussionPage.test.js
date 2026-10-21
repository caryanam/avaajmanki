import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const TOPIC_DISC_DIR = path.resolve('src/components/topic-discussion');
const TOPIC_DISC_PAGE = path.resolve('src/pages/user/TopicDiscussionPage.jsx');
const TOPIC_DISC_CSS = path.resolve('src/styles/topic-discussion.css');
const TOPIC_META = path.resolve('src/utils/topicMetadata.js');

test('Topic Discussion Architecture - Component Structure Integrity', () => {
  const expectedFiles = [
    'TopicDiscussionBreadcrumb.jsx',
    'TopicDiscussionHeader.jsx',
    'OriginalDiscussionPost.jsx',
    'TopicDiscussionComments.jsx',
    'TopicOverviewWidget.jsx',
    'TopicGuidelinesWidget.jsx',
    'RelatedDiscussionsWidget.jsx',
  ];

  for (const file of expectedFiles) {
    const fullPath = path.join(TOPIC_DISC_DIR, file);
    assert.ok(fs.existsSync(fullPath), `Expected component file ${file} must exist`);
  }
  assert.ok(fs.existsSync(TOPIC_DISC_PAGE), 'TopicDiscussionPage.jsx must exist');
  assert.ok(fs.existsSync(TOPIC_DISC_CSS), 'topic-discussion.css must exist');
  assert.ok(fs.existsSync(TOPIC_META), 'topicMetadata.js must exist');
});

test('TopicDiscussionBreadcrumb - Path Hierarchy', () => {
  const content = fs.readFileSync(path.join(TOPIC_DISC_DIR, 'TopicDiscussionBreadcrumb.jsx'), 'utf8');
  assert.ok(content.includes('Home'), 'Must include Home');
  assert.ok(content.includes('Explore'), 'Must include Explore');
  assert.ok(content.includes('topicName'), 'Must render topicName');
  assert.ok(content.includes('Discussion'), 'Terminal item must be Discussion');
});

test('TopicDiscussionHeader - Header Card with Join and Action Menu', () => {
  const content = fs.readFileSync(path.join(TOPIC_DISC_DIR, 'TopicDiscussionHeader.jsx'), 'utf8');
  assert.ok(content.includes('topic-header-back-btn'), 'Must render back arrow button');
  assert.ok(content.includes('topic-header-icon-badge'), 'Must render topic square icon badge');
  assert.ok(content.includes('Join Topic'), 'Must render Join Topic button');
  assert.ok(content.includes('topic-header-menu-trigger'), 'Must render action menu trigger');
  assert.ok(content.includes('mka_joined_topics'), 'Must track joined state in localStorage');
});

test('OriginalDiscussionPost - Anonymous Card with Reactions and Actions', () => {
  const content = fs.readFileSync(path.join(TOPIC_DISC_DIR, 'OriginalDiscussionPost.jsx'), 'utf8');
  assert.ok(content.includes('Anonymous'), 'Must render anonymous author');
  assert.ok(content.includes('original-post-title'), 'Must render post title');
  assert.ok(content.includes('post-topic-tag-pill'), 'Must render hashtag/topic pill');
  assert.ok(content.includes('heart-btn'), 'Must render heart reaction button');
  assert.ok(content.includes('bookmark-btn'), 'Must render bookmark/save button');
  assert.ok(content.includes('share-btn'), 'Must render share button');
  assert.ok(content.includes('reactToPost'), 'Must wire reactToPost');
  assert.ok(content.includes('toggleSavePost'), 'Must wire toggleSavePost');
});

test('TopicDiscussionComments - Compact Composer and Clamped Comments', () => {
  const content = fs.readFileSync(path.join(TOPIC_DISC_DIR, 'TopicDiscussionComments.jsx'), 'utf8');
  assert.ok(content.includes('compact-comment-composer-card'), 'Must render compact composer card');
  assert.ok(content.includes('Share your thoughts anonymously...'), 'Must render composer placeholder');
  assert.ok(content.includes('TruncatedCommentText'), 'Must implement two-line clamped comments');
  assert.ok(content.includes('Read more'), 'Must include Read more button');
  assert.ok(content.includes('Read less'), 'Must include Read less button');
  assert.ok(content.includes('replies-nested-container'), 'Must render nested replies');
  assert.ok(content.includes('inline-reply-composer-wrap'), 'Must support single active reply composer');
  assert.ok(content.includes('MOST_LIKED'), 'Must support Most Liked sorting');
});

test('TopicOverviewWidget - Cover Image, Stats and Tags', () => {
  const content = fs.readFileSync(path.join(TOPIC_DISC_DIR, 'TopicOverviewWidget.jsx'), 'utf8');
  assert.ok(content.includes('topic-overview-cover-img'), 'Must render cover image');
  assert.ok(content.includes('topic-overview-floating-badge'), 'Must render floating badge');
  assert.ok(content.includes('Discussions'), 'Must render discussions stat');
  assert.ok(content.includes('Members'), 'Must render members stat');
  assert.ok(content.includes('topic-overview-join-btn'), 'Must render full-width Join Topic button');
  assert.ok(content.includes('topic-overview-tags-cloud'), 'Must render tags cloud');
});

test('TopicGuidelinesWidget - Community Guidelines Rules', () => {
  const content = fs.readFileSync(path.join(TOPIC_DISC_DIR, 'TopicGuidelinesWidget.jsx'), 'utf8');
  assert.ok(content.includes('Topic Guidelines'), 'Must render Topic Guidelines title');
  assert.ok(content.includes('CheckCircle2'), 'Must render circular checkmark icons');
  assert.ok(content.includes('guidelines-items-list'), 'Must render guidelines list');
});

test('RelatedDiscussionsWidget - 4 Discussion Items and Navigation', () => {
  const content = fs.readFileSync(path.join(TOPIC_DISC_DIR, 'RelatedDiscussionsWidget.jsx'), 'utf8');
  assert.ok(content.includes('Related Discussions'), 'Must render Related Discussions title');
  assert.ok(content.includes('View all'), 'Must render View all link');
  assert.ok(content.includes('related-item-thumb-img'), 'Must render photographic thumbnail');
  assert.ok(content.includes('related-item-arrow-btn'), 'Must render circular arrow button');
});

test('Topic Discussion Layout - 3-Column Desktop Grid and Responsive Rules', () => {
  const pageContent = fs.readFileSync(TOPIC_DISC_PAGE, 'utf8');
  assert.ok(pageContent.includes('topic-discussion-desktop-grid'), 'TopicDiscussionPage must render 3-column grid');
  assert.ok(pageContent.includes('DesktopSidebar'), 'Must reuse DesktopSidebar');
  assert.ok(pageContent.includes('TopicDiscussionBreadcrumb'), 'Must render breadcrumbs');
  assert.ok(pageContent.includes('TopicDiscussionHeader'), 'Must render header');
  assert.ok(pageContent.includes('OriginalDiscussionPost'), 'Must render post card');
  assert.ok(pageContent.includes('TopicDiscussionComments'), 'Must render comments section');
  assert.ok(pageContent.includes('TopicOverviewWidget'), 'Must render topic overview');
  assert.ok(pageContent.includes('TopicGuidelinesWidget'), 'Must render guidelines');
  assert.ok(pageContent.includes('RelatedDiscussionsWidget'), 'Must render related discussions');

  const cssContent = fs.readFileSync(TOPIC_DISC_CSS, 'utf8');
  assert.ok(cssContent.includes('grid-template-columns: 240px minmax(0, 1fr) 330px'), 'Desktop grid must match approved 3-column proportion');
  assert.ok(cssContent.includes('@media (max-width: 1200px)'), 'Must define tablet breakpoint');
  assert.ok(cssContent.includes('@media (max-width: 900px)'), 'Must define mobile breakpoint');
});
