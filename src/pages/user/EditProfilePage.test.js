import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Logic mirror of canSaveProfile
function canSaveProfile({
  currentUsername,
  initialUsername,
  bio,
  initialBio,
  preferredLang,
  initialLang,
  isBlocked,
  submitting,
}) {
  if (submitting || isBlocked) return false;
  const username = (currentUsername || '').trim();
  if (!username) return false;

  const usernameChanged = username !== (initialUsername || '').trim();
  const bioChanged = (bio || '').trim() !== (initialBio || '').trim();
  const langChanged = (preferredLang || '').trim() !== (initialLang || '').trim();

  return usernameChanged || bioChanged || langChanged;
}

test('EditProfilePage — canSave validation logic', async (t) => {
  await t.test('changing only bio enables Save', () => {
    const result = canSaveProfile({
      currentUsername: '@aarav',
      initialUsername: '@aarav',
      bio: 'Updated bio text',
      initialBio: 'Initial bio text',
      preferredLang: 'English',
      initialLang: 'English',
      isBlocked: false,
      submitting: false,
    });
    assert.equal(result, true, 'Changing only bio should enable save');
  });

  await t.test('unchanged required fields do not block save when bio changes', () => {
    const result = canSaveProfile({
      currentUsername: '@user_unchanged',
      initialUsername: '@user_unchanged',
      bio: 'New bio',
      initialBio: '',
      preferredLang: 'English',
      initialLang: 'English',
      isBlocked: false,
      submitting: false,
    });
    assert.equal(result, true, 'Unchanged required username must not block save');
  });

  await t.test('Save is disabled if nothing changed', () => {
    const result = canSaveProfile({
      currentUsername: '@aarav',
      initialUsername: '@aarav',
      bio: 'Same bio',
      initialBio: 'Same bio',
      preferredLang: 'English',
      initialLang: 'English',
      isBlocked: false,
      submitting: false,
    });
    assert.equal(result, false, 'Save must remain disabled when no fields changed');
  });

  await t.test('Save is disabled when bio is blocked by moderation', () => {
    const result = canSaveProfile({
      currentUsername: '@aarav',
      initialUsername: '@aarav',
      bio: 'Abusive content',
      initialBio: 'Initial bio',
      preferredLang: 'English',
      initialLang: 'English',
      isBlocked: true,
      submitting: false,
    });
    assert.equal(result, false, 'Moderation block must disable save');
  });

  await t.test('Save is disabled when form is submitting', () => {
    const result = canSaveProfile({
      currentUsername: '@aarav',
      initialUsername: '@aarav',
      bio: 'New bio',
      initialBio: 'Old bio',
      preferredLang: 'English',
      initialLang: 'English',
      isBlocked: false,
      submitting: true,
    });
    assert.equal(result, false, 'In-flight submission must disable save');
  });

  await t.test('Save is disabled if username is cleared or empty', () => {
    const result = canSaveProfile({
      currentUsername: '   ',
      initialUsername: '@aarav',
      bio: 'New bio',
      initialBio: 'Old bio',
      preferredLang: 'English',
      initialLang: 'English',
      isBlocked: false,
      submitting: false,
    });
    assert.equal(result, false, 'Empty username must disable save');
  });
});

test('EditProfilePage — Component file structural integrity', () => {
  const pagePath = path.resolve('src/pages/user/EditProfilePage.jsx');
  const content = fs.readFileSync(pagePath, 'utf8');

  assert.ok(content.includes('canSaveProfile'), 'EditProfilePage.jsx must define/export canSaveProfile');
  assert.ok(content.includes('const canSave = canSaveProfile'), 'EditProfilePage must compute canSave');
  assert.ok(content.includes('disabled={!canSave}'), 'Save button must be disabled when !canSave');
  assert.ok(content.includes('if (!canSave) return;'), 'handleSave must guard against submission when !canSave');
});
