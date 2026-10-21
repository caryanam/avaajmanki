import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const EXPLORE_DIR = path.resolve('src/components/explore');
const EXPLORE_PAGE_PATH = path.resolve('src/pages/user/ExplorePage.jsx');
const EXPLORE_CSS_PATH = path.resolve('src/styles/explore.css');

test('Explore Architecture - Component Structure Integrity', () => {
  const expectedFiles = [
    'ExploreHeader.jsx',
    'ExploreComposer.jsx',
    'ExploreCategoryPills.jsx',
    'PopularTopicCard.jsx',
    'PopularTopicsCarousel.jsx',
    'TrendingDiscussionCard.jsx',
    'TrendingDiscussionsHeader.jsx',
    'ExploreRightSidebar.jsx',
  ];

  for (const file of expectedFiles) {
    const fullPath = path.join(EXPLORE_DIR, file);
    assert.ok(fs.existsSync(fullPath), `Expected component file ${file} must exist`);
  }
});

test('ExploreHeader - Single Create Topic Button and Search Wrap', () => {
  const content = fs.readFileSync(path.join(EXPLORE_DIR, 'ExploreHeader.jsx'), 'utf8');
  assert.ok(content.includes('explore-create-topic-btn'), 'ExploreHeader must render explore-create-topic-btn');
  assert.ok(content.includes('Create Topic'), 'Button must state "Create Topic"');
  assert.ok(content.includes('explore-search-input'), 'Must provide explore-search-input');
  assert.ok(content.includes('onCreateTopic'), 'Must invoke onCreateTopic');
});

test('PopularTopicsCarousel - Navigation Chevrons and Track', () => {
  const content = fs.readFileSync(path.join(EXPLORE_DIR, 'PopularTopicsCarousel.jsx'), 'utf8');
  assert.ok(content.includes('popular-topics-track'), 'Must render popular-topics-track');
  assert.ok(content.includes('ChevronLeft'), 'Must render ChevronLeft');
  assert.ok(content.includes('ChevronRight'), 'Must render ChevronRight');
  assert.ok(content.includes('PopularTopicCard'), 'Must render PopularTopicCard instances');
});

test('PopularTopicCard - Responsive Cropping and Real Discussion Count', () => {
  const content = fs.readFileSync(path.join(EXPLORE_DIR, 'PopularTopicCard.jsx'), 'utf8');
  assert.ok(content.includes('explore-topic-thumb-img'), 'Must render explore-topic-thumb-img');
  assert.ok(content.includes('discussions'), 'Must show discussion count');
});

test('TrendingDiscussionCard - Anonymous User Info and Join Discussion Action', () => {
  const content = fs.readFileSync(path.join(EXPLORE_DIR, 'TrendingDiscussionCard.jsx'), 'utf8');
  assert.ok(content.includes('discussion-author-avatar'), 'Must render anonymous avatar');
  assert.ok(content.includes('discussion-topic-badge'), 'Must render topic/category badge');
  assert.ok(content.includes('join-discussion-action-btn'), 'Must render Join Discussion action button');
  assert.ok(content.includes('Join Discussion'), 'Button text must be Join Discussion');
  assert.ok(content.includes('reactToPost'), 'Must support reactions');
  assert.ok(content.includes('toggleSavePost'), 'Must support bookmarking');
});

test('TrendingDiscussionsHeader - Three Filter Tabs', () => {
  const content = fs.readFileSync(path.join(EXPLORE_DIR, 'TrendingDiscussionsHeader.jsx'), 'utf8');
  assert.ok(content.includes("'trending'"), 'Must include trending tab');
  assert.ok(content.includes("'latest'"), 'Must include latest tab');
  assert.ok(content.includes("'most_commented'"), 'Must include most_commented tab');
});

test('ExploreRightSidebar - Widgets and No Duplicate Create Topic Card', () => {
  const content = fs.readFileSync(path.join(EXPLORE_DIR, 'ExploreRightSidebar.jsx'), 'utf8');
  assert.ok(content.includes('Trending Topics'), 'Must render Trending Topics widget');
  assert.ok(content.includes('Suggested for You'), 'Must render Suggested for You widget');
  assert.ok(content.includes('Community Guidelines'), 'Must render Community Guidelines widget');

  // STRICT REQUIREMENT: No duplicate Create Topic button or card in right sidebar
  assert.ok(!content.includes('Create Topic'), 'Right sidebar must NOT have a duplicate Create Topic card or button');
});

test('ExplorePage - 3-Column Desktop Grid Integration', () => {
  const content = fs.readFileSync(EXPLORE_PAGE_PATH, 'utf8');
  assert.ok(content.includes('explore-desktop-grid'), 'Must use explore-desktop-grid 3-column layout');
  assert.ok(content.includes('DesktopSidebar'), 'Must render left DesktopSidebar');
  assert.ok(content.includes('ExploreHeader'), 'Must render ExploreHeader');
  assert.ok(content.includes('ExploreComposer'), 'Must render ExploreComposer');
  assert.ok(content.includes('ExploreCategoryPills'), 'Must render ExploreCategoryPills');
  assert.ok(content.includes('PopularTopicsCarousel'), 'Must render PopularTopicsCarousel');
  assert.ok(content.includes('TrendingDiscussionCard'), 'Must render TrendingDiscussionCard');
  assert.ok(content.includes('ExploreRightSidebar'), 'Must render ExploreRightSidebar');
  assert.ok(content.includes('TopicCreateModal'), 'Must integrate TopicCreateModal');
});

test('Explore CSS - Responsive Breakpoints and object-fit', () => {
  const content = fs.readFileSync(EXPLORE_CSS_PATH, 'utf8');
  assert.ok(content.includes('grid-template-columns: 240px minmax(0, 1fr) 330px;'), 'Must define 3-column desktop grid');
  assert.ok(content.includes('object-fit: cover;'), 'Must use object-fit: cover for topic images');
  assert.ok(content.includes('@media (max-width: 768px)'), 'Must define mobile breakpoint');
});
