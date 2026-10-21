import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('SettingsPage — Structural & Architectural Integrity Suite', async (t) => {
  const settingsPath = path.resolve('src/pages/user/SettingsPage.jsx');
  const content = fs.readFileSync(settingsPath, 'utf8');

  await t.test('1. Core Layout and 3-Column Desktop Grid', () => {
    assert.ok(content.includes('settings-layout-grid'), 'Must include settings-layout-grid container');
    assert.ok(content.includes('settings-left-col'), 'Must include settings-left-col');
    assert.ok(content.includes('settings-center-col'), 'Must include settings-center-col');
    assert.ok(content.includes('settings-right-col'), 'Must include settings-right-col');
  });

  await t.test('2. Hero Banner & Curved Shoulder Transition', () => {
    assert.ok(content.includes('settings-hero-card'), 'Must render hero card');
    assert.ok(content.includes('heroProfileBanner'), 'Must import and render approved hero profile banner asset');
    assert.ok(content.includes('Privacy') && content.includes('Choice'), 'Must include Privacy and Choice flourish text');
    assert.ok(content.includes('settings-cover-curve-svg'), 'Must render curved SVG transition');
    assert.ok(content.includes('settings-avatar-container'), 'Must render overlapping circular avatar container');
    assert.ok(content.includes('settings-camera-badge-btn'), 'Must render camera badge on avatar');
  });

  await t.test('3. Left Navigation — 5 Canonical Categories', () => {
    assert.ok(content.includes('Profile'), 'Must include Profile tab');
    assert.ok(content.includes('Privacy'), 'Must include Privacy tab');
    assert.ok(content.includes('Notifications'), 'Must include Notifications tab');
    assert.ok(content.includes('Account Security'), 'Must include Account Security tab');
    assert.ok(content.includes('Delete Account'), 'Must include Delete Account tab');
  });

  await t.test('4. Center Column — Profile Information Form', () => {
    assert.ok(content.includes('Profile Information'), 'Must include Profile Information title');
    assert.ok(content.includes('This information will be visible to others on AwaajManKi'), 'Must include subtitle');
    assert.ok(content.includes('Profile Photo'), 'Must include Profile Photo label');
    assert.ok(content.includes('Change Photo'), 'Must include Change Photo button');
    assert.ok(content.includes('JPG, PNG or WebP. Max size 5MB.'), 'Must display accepted file types and size limit');
    assert.ok(content.includes('Display Name'), 'Must include Display Name label');
    assert.ok(content.includes('Username'), 'Must include Username label');
    assert.ok(content.includes('settings-username-prefix'), 'Must include @ prefix container');
    assert.ok(content.includes('Bio (Optional)'), 'Must include Bio (Optional) label');
    assert.ok(content.includes('/200'), 'Must render 200 character counter');
    assert.ok(content.includes('Save Changes'), 'Must include Save Changes submit button');
  });

  await t.test('5. Right Column — Quick Actions & Need Help Cards', () => {
    assert.ok(content.includes('Quick Actions'), 'Must include Quick Actions title');
    assert.ok(content.includes('Common account actions'), 'Must include Quick Actions subtitle');
    assert.ok(content.includes('Change Password'), 'Must include Change Password action');
    assert.ok(content.includes('Manage Email'), 'Must include Manage Email action');
    assert.ok(content.includes('Change Language'), 'Must include Change Language action');
    assert.ok(content.includes('Delete Account'), 'Must include Delete Account action');

    // Verify ordering within Quick Actions: Manage Email -> Change Language -> Delete Account
    const quickActionsIdx = content.indexOf('Quick Actions');
    const quickActionsSlice = content.slice(quickActionsIdx, content.indexOf('Need Help?'));
    const manageEmailIdx = quickActionsSlice.indexOf('Manage Email');
    const changeLangIdx = quickActionsSlice.indexOf('Change Language');
    const deleteAccountIdx = quickActionsSlice.indexOf('Delete Account');
    assert.ok(manageEmailIdx !== -1 && changeLangIdx !== -1 && deleteAccountIdx !== -1, 'All three rows must exist in Quick Actions');
    assert.ok(manageEmailIdx < changeLangIdx, 'Manage Email must appear before Change Language');
    assert.ok(changeLangIdx < deleteAccountIdx, 'Change Language must appear before Delete Account');

    // Verify Language modal and dropdown integration
    assert.ok(content.includes('LanguageSelectorDropdown'), 'Must integrate LanguageSelectorDropdown in modal');

    assert.ok(content.includes('Need Help?'), 'Must include Need Help? card');
    assert.ok(content.includes('Get support or read our guides.'), 'Must include Need Help subtitle');
    assert.ok(content.includes('Help Center'), 'Must include Help Center action');
    assert.ok(content.includes('Contact Support'), 'Must include Contact Support action');
  });

  await t.test('6. Backend API Integration & Validation Safety', () => {
    assert.ok(content.includes('apiProfileService.updateProfile'), 'Must call apiProfileService.updateProfile');
    assert.ok(content.includes('apiUserService.updatePassword'), 'Must call apiUserService.updatePassword');
    assert.ok(content.includes('apiUserService.deactivateAccount'), 'Must call apiUserService.deactivateAccount');
    assert.ok(content.includes('apiClient.post(\'/api/upload\''), 'Must upload images via multipart /api/upload');
    assert.ok(content.includes('5 * 1024 * 1024'), 'Must enforce 5MB client-side size check');
  });
});
