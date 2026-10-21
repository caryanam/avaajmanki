import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const API_TOPIC_SERVICE_PATH = path.resolve('src/services/apiTopicService.js');
const TOPIC_MODAL_PATH = path.resolve('src/components/topics/TopicCreateModal.jsx');
const EXPLORE_PAGE_PATH = path.resolve('src/pages/user/ExplorePage.jsx');
const TOPIC_DIRECTORY_PAGE_PATH = path.resolve('src/pages/user/TopicDirectoryPage.jsx');
const TOPIC_COMMUNITY_PAGE_PATH = path.resolve('src/pages/user/TopicCommunityPage.jsx');
const MY_POSTS_PAGE_PATH = path.resolve('src/pages/user/MyPostsPage.jsx');
const APP_ROUTES_PATH = path.resolve('src/routes/AppRoutes.jsx');

test('apiTopicService — Supports getTopicById & Strict Error Throwing', () => {
  assert.ok(fs.existsSync(API_TOPIC_SERVICE_PATH), 'apiTopicService.js must exist');
  const code = fs.readFileSync(API_TOPIC_SERVICE_PATH, 'utf8');
  assert.ok(code.includes('getTopicById('), 'apiTopicService must export getTopicById method');
  assert.ok(code.includes('throw err;'), 'apiTopicService.createTopic must rethrow error on failure');
});

test('TopicCreateModal — Real Backend ID Validation and Global Invalidation Event', () => {
  assert.ok(fs.existsSync(TOPIC_MODAL_PATH), 'TopicCreateModal.jsx must exist');
  const code = fs.readFileSync(TOPIC_MODAL_PATH, 'utf8');
  assert.ok(code.includes('!createdTopic || (!createdTopic.id && !createdTopic.name)'), 'Must strictly validate backend topic ID');
  assert.ok(code.includes('mka:topicCreated'), 'Must dispatch mka:topicCreated event on window for instantaneous cache refresh');
});

test('ExplorePage — Real Server Topics Integration & View All Target', () => {
  assert.ok(fs.existsSync(EXPLORE_PAGE_PATH), 'ExplorePage.jsx must exist');
  const code = fs.readFileSync(EXPLORE_PAGE_PATH, 'utf8');
  assert.ok(code.includes('apiTopicService'), 'ExplorePage must import apiTopicService');
  assert.ok(code.includes('loadServerTopics'), 'ExplorePage must load server topics');
  assert.ok(code.includes('mka:topicCreated'), 'ExplorePage must listen for topicCreated event');
  assert.ok(code.includes("onViewAll={() => (onNavigate ? onNavigate('/topics') : (window.location.href = '/topics'))}"), 'PopularTopicsCarousel onViewAll must navigate to /topics');
});

test('TopicDirectoryPage — Complete Topic Directory Architecture', () => {
  assert.ok(fs.existsSync(TOPIC_DIRECTORY_PAGE_PATH), 'TopicDirectoryPage.jsx must exist');
  const code = fs.readFileSync(TOPIC_DIRECTORY_PAGE_PATH, 'utf8');
  assert.ok(code.includes('export function TopicDirectoryPage'), 'Must export TopicDirectoryPage component');
  assert.ok(code.includes('apiTopicService') && code.includes('getTopics'), 'Must fetch all topics via apiTopicService');
  assert.ok(code.includes('explore-search-input'), 'Must provide live search input');
  assert.ok(code.includes('explore-category-pill'), 'Must provide category filter tabs');
  assert.ok(code.includes('ITEMS_PER_PAGE'), 'Must support pagination');
  assert.ok(code.includes('TopicCreateModal'), 'Must integrate TopicCreateModal');
});

test('AppRoutes — Mapping of /topics Route', () => {
  assert.ok(fs.existsSync(APP_ROUTES_PATH), 'AppRoutes.jsx must exist');
  const code = fs.readFileSync(APP_ROUTES_PATH, 'utf8');
  assert.ok(code.includes('TopicDirectoryPage'), 'AppRoutes must import TopicDirectoryPage');
  assert.ok(code.includes("normalizedPath === '/topics'"), 'AppRoutes must route /topics');
});

test('TopicCommunityPage — Custom Topic Loading & Initial Discussion Integration', () => {
  assert.ok(fs.existsSync(TOPIC_COMMUNITY_PAGE_PATH), 'TopicCommunityPage.jsx must exist');
  const code = fs.readFileSync(TOPIC_COMMUNITY_PAGE_PATH, 'utf8');
  assert.ok(code.includes('apiTopicService') && code.includes('getTopicById'), 'Must resolve custom topic via apiTopicService.getTopicById');
  assert.ok(code.includes('apiCommentService') && code.includes('getCommentsByTopicId'), 'Must fetch topic opinions from /api/topics/{topicId}/comments');
  assert.ok(code.includes('SPORTCAR') || code.includes('Sport Car'), 'Must format Sport Car label cleanly');
});

test('MyPostsPage — Real-Time Topic Synchronization & Category Inclusivity', () => {
  assert.ok(fs.existsSync(MY_POSTS_PAGE_PATH), 'MyPostsPage.jsx must exist');
  const code = fs.readFileSync(MY_POSTS_PAGE_PATH, 'utf8');
  assert.ok(code.includes('mka:topicCreated'), 'MyPostsPage must listen to mka:topicCreated event');
  assert.ok(code.includes('fetchMyTopics'), 'MyPostsPage must provide fetchMyTopics callback');
  assert.ok(code.includes('TopicCreateModal'), 'MyPostsPage must integrate TopicCreateModal');
});
