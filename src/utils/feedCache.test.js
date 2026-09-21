import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeFeed } from './feedCache.js';

test('feed stays bounded over repeated refreshes and updates existing items', () => {
  let feed = [];
  for (let id = 0; id < 500; id++) feed = mergeFeed([{ id }], feed);
  assert.equal(feed.length, 200);
  assert.equal(feed[0].id, 499);
  feed = mergeFeed([{ id: 499, content: 'updated' }], feed);
  assert.equal(feed[0].content, 'updated');
  assert.equal(feed.filter(post => post.id === 499).length, 1);
});

test('empty successful feeds clear stale data but preserve pending writes', () => {
  assert.deepEqual(mergeFeed([], [{ id: 1 }, { id: 'temp_post_2' }]), [{ id: 'temp_post_2' }]);
});

test('post and topic opinion identities do not collide', () => {
  const items = [{ id: 1, feedItemId: 'POST_1' }, { id: 1, feedItemId: 'TOPIC_OPINION_1' }];
  assert.equal(mergeFeed(items).length, 2);
});
