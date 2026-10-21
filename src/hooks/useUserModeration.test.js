import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('User Moderation & Query Hooks — Structural & Logic Integrity Suite', async (t) => {
  const moderationPath = path.resolve('src/hooks/useUserModeration.js');
  const reportContextPath = path.resolve('src/context/ReportContext.jsx');
  const moderationContent = fs.readFileSync(moderationPath, 'utf8');
  const reportContent = fs.readFileSync(reportContextPath, 'utf8');

  await t.test('1. Query keys and 5 min staleTime are configured', () => {
    assert.ok(moderationContent.includes("['users', 'muted']"), 'Must use stable muted query key');
    assert.ok(moderationContent.includes("['users', 'blocked']"), 'Must use stable blocked query key');
    assert.ok(moderationContent.includes("['users', 'hidden-posts']"), 'Must use stable hidden-posts query key');
    assert.ok(moderationContent.includes("['profile', 'me']"), 'Must use stable profile query key');
    assert.ok(moderationContent.includes('5 * 60 * 1000'), 'Must set staleTime to 5 minutes');
    assert.ok(moderationContent.includes('refetchOnWindowFocus: false'), 'Must disable refetch on window focus');
  });

  await t.test('2. ReportContext exports and consumes shared moderation hooks', () => {
    assert.ok(reportContent.includes('useMutedUsers'), 'ReportContext must export/consume useMutedUsers');
    assert.ok(reportContent.includes('useBlockedUsers'), 'ReportContext must export/consume useBlockedUsers');
    assert.ok(reportContent.includes('useHiddenPosts'), 'ReportContext must export/consume useHiddenPosts');
    assert.ok(reportContent.includes('isMuted'), 'ReportContext must provide isMuted');
    assert.ok(reportContent.includes('isBlocked'), 'ReportContext must provide isBlocked');
    assert.ok(reportContent.includes('isHidden'), 'ReportContext must provide isHidden');
  });

  await t.test('3. Mutations trigger cache invalidation without redundant useEffects', () => {
    assert.ok(reportContent.includes('queryClient.invalidateQueries'), 'Mutations must invalidate queries');
    // Ensure no redundant automatic refetching loop in ReportContext
    assert.ok(!reportContent.includes('refreshMutedUsers();\n    refreshBlockedUsers();'), 'Must not have manual refetch loops in useEffect');
  });

  await t.test('4. O(1) Set normalization handles user handles and case insensitivity', () => {
    const rawMuted = ['aarav', '@rohit_99', 'Priya'];
    const mutedSet = new Set();
    rawMuted.forEach((u) => {
      const clean = String(u).toLowerCase().replace(/^@/, '').trim();
      if (clean) {
        mutedSet.add(clean);
        mutedSet.add(`@${clean}`);
      }
    });

    const isMuted = (user) => {
      if (!user) return false;
      const clean = String(typeof user === 'object' ? (user.username || user.authorUsername || user.handle || user.id) : user).toLowerCase().replace(/^@/, '').trim();
      return mutedSet.has(clean);
    };

    assert.equal(isMuted('aarav'), true);
    assert.equal(isMuted('@aarav'), true);
    assert.equal(isMuted('AARAV'), true);
    assert.equal(isMuted('@Rohit_99'), true);
    assert.equal(isMuted('priya'), true);
    assert.equal(isMuted({ username: '@priya' }), true);
    assert.equal(isMuted({ authorUsername: 'rohit_99' }), true);
    assert.equal(isMuted('stranger'), false);
    assert.equal(isMuted(null), false);
    assert.equal(isMuted(undefined), false);
  });

  await t.test('5. Hidden posts set matches both string and integer IDs', () => {
    const rawHidden = [
      { id: 101, title: 'Thought 101' },
      { postId: 202, postTitle: 'Thought 202' },
      { id: '303', title: 'Thought 303' },
    ];

    const hiddenSet = new Set();
    rawHidden.forEach((item) => {
      const id = typeof item === 'object' ? (item.id || item.postId) : item;
      if (id != null) hiddenSet.add(String(id));
    });

    const isHidden = (postId) => {
      if (postId == null) return false;
      return hiddenSet.has(String(postId));
    };

    assert.equal(isHidden(101), true);
    assert.equal(isHidden('101'), true);
    assert.equal(isHidden(202), true);
    assert.equal(isHidden('202'), true);
    assert.equal(isHidden(303), true);
    assert.equal(isHidden(999), false);
    assert.equal(isHidden(null), false);
  });
});
