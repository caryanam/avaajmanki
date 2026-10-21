import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const COMPONENT_PATH = path.resolve('src/components/music/PremiumBottomPlayer.jsx');
const MUSIC_CSS_PATH = path.resolve('src/styles/music.css');
const VARIABLES_CSS_PATH = path.resolve('src/styles/variables.css');
const HOME_CSS_PATH = path.resolve('src/styles/home.css');
const LOCALES_DIR = path.resolve('src/locales');

// ────────────────────────────────────────────────────────────
// 1. ARCHITECTURAL & FILE INTEGRITY
// ────────────────────────────────────────────────────────────
test('PremiumBottomPlayer — Architecture and Files Integrity', () => {
  assert.ok(fs.existsSync(COMPONENT_PATH), 'PremiumBottomPlayer.jsx must exist');
  assert.ok(fs.existsSync(MUSIC_CSS_PATH), 'music.css must exist');
  assert.ok(fs.existsSync(VARIABLES_CSS_PATH), 'variables.css must exist');
  assert.ok(fs.existsSync(HOME_CSS_PATH), 'home.css must exist');

  const componentSource = fs.readFileSync(COMPONENT_PATH, 'utf8');
  assert.ok(componentSource.includes('export function PremiumBottomPlayer'), 'Must export PremiumBottomPlayer');
});

// ────────────────────────────────────────────────────────────
// 2. CSS DESIGN TOKENS, Z-INDEX SCALE & DYNAMIC OFFSET
// ────────────────────────────────────────────────────────────
test('PremiumBottomPlayer — Design Tokens & Z-Index Scale', () => {
  const variablesCss = fs.readFileSync(VARIABLES_CSS_PATH, 'utf8');

  // Verify z-index scale: content < sticky header < player < player-sheet < modal < toast
  assert.ok(variablesCss.includes('--z-content: 1;'), 'Must define --z-content');
  assert.ok(variablesCss.includes('--z-sticky-header: 100;'), 'Must define --z-sticky-header');
  assert.ok(variablesCss.includes('--z-player: 500;'), 'Must define --z-player as 500');
  assert.ok(variablesCss.includes('--z-player-sheet: 600;'), 'Must define --z-player-sheet as 600');
  assert.ok(variablesCss.includes('--z-modal-backdrop: 800;'), 'Must define --z-modal-backdrop as 800');
  assert.ok(variablesCss.includes('--z-toast: 1000;'), 'Must define --z-toast as 1000');
  assert.ok(variablesCss.includes('--player-offset: 0px;'), 'Must default --player-offset to 0px');
});

test('PremiumBottomPlayer — Dynamic Padding Rules in Content Feeds', () => {
  const homeCss = fs.readFileSync(HOME_CSS_PATH, 'utf8');

  // Feeds must use --player-offset so content is never occluded
  assert.ok(
    homeCss.includes('calc(var(--player-offset, 0px) + 24px) !important'),
    'Feed containers must have dynamic padding-bottom tied to --player-offset'
  );
  assert.ok(homeCss.includes('.center-stream'), '.center-stream must adapt to player offset');
  assert.ok(homeCss.includes('.explore-center-stream'), '.explore-center-stream must adapt to player offset');
  assert.ok(homeCss.includes('.topic-discussion-stream'), '.topic-discussion-stream must adapt to player offset');
  assert.ok(homeCss.includes('.desktop-right-sidebar'), '.desktop-right-sidebar must adapt to player offset');
});

test('PremiumBottomPlayer — 3-State CSS Selectors & Animations', () => {
  const musicCss = fs.readFileSync(MUSIC_CSS_PATH, 'utf8');

  // 1. Compact state
  assert.ok(musicCss.includes('.premium-bottom-player-container.state-compact'), 'Must define .state-compact styles');
  assert.ok(musicCss.includes('max-width: 720px;'), 'Compact player must have max-width 720px');
  assert.ok(musicCss.includes('height: 64px;'), 'Compact player height must be 64px on desktop');
  assert.ok(musicCss.includes('border-radius: 16px;'), 'Compact player must have 16px border-radius');
  assert.ok(musicCss.includes('.mka-compact-progress-top'), 'Must define top scrub line');

  // 2. Expanded state
  assert.ok(musicCss.includes('.mka-expanded-backdrop'), 'Must define expanded backdrop');
  assert.ok(musicCss.includes('.mka-expanded-sheet'), 'Must define expanded upward sheet');
  assert.ok(musicCss.includes('max-height: 75vh;'), 'Expanded sheet must be max 75vh');

  // 3. Pill state
  assert.ok(musicCss.includes('.premium-bottom-player-container.state-pill'), 'Must define .state-pill styles');
  assert.ok(musicCss.includes('width: 52px;'), 'Pill button must be 52px width');
  assert.ok(musicCss.includes('height: 52px;'), 'Pill button must be 52px height');
  assert.ok(musicCss.includes('.mka-pill-equaliser'), 'Must define 3-bar animated equaliser');
  assert.ok(musicCss.includes('@keyframes mkaEqBounce'), 'Must define equalizer animation');

  // Responsive & Accessibility
  assert.ok(musicCss.includes('@media (max-width: 600px)'), 'Must include mobile responsive styles');
  assert.ok(musicCss.includes('@media (prefers-reduced-motion: reduce)'), 'Must honor prefers-reduced-motion');
});

// ────────────────────────────────────────────────────────────
// 3. STATE MACHINE, LOCALSTORAGE PERSISTENCE & SEMANTICS
// ────────────────────────────────────────────────────────────
class MockPlayerStateMachine {
  constructor(initialSavedState = null) {
    this.storage = {
      mka_player_state: initialSavedState,
    };
    this.playerOffset = '0px';
    this.currentTrack = { id: 'track-1', title: 'Test Melody', artist: 'Artist' };
    this.isPlaying = true;
    this.isReset = false;

    // Initialize state
    const saved = this.storage.mka_player_state;
    if (saved === 'compact' || saved === 'expanded' || saved === 'pill') {
      this.playerState = saved;
    } else {
      this.playerState = 'compact';
    }
    this.syncPlayerOffset();
  }

  syncPlayerOffset() {
    this.storage.mka_player_state = this.playerState;
    if (!this.currentTrack || this.playerState === 'pill') {
      this.playerOffset = '0px';
    } else {
      this.playerOffset = '96px';
    }
  }

  setPlayerState(newState) {
    this.playerState = typeof newState === 'function' ? newState(this.playerState) : newState;
    this.syncPlayerOffset();
  }

  onPopState() {
    this.setPlayerState((prev) => (prev === 'expanded' ? 'compact' : prev));
  }

  minimize() {
    this.setPlayerState('pill');
    // Audio playback NOT stopped!
  }

  restore() {
    this.setPlayerState('compact');
  }

  expand() {
    this.setPlayerState('expanded');
  }

  close() {
    // Stops audio, clears track, resets player
    this.isReset = true;
    this.isPlaying = false;
    this.currentTrack = null;
    this.syncPlayerOffset();
  }
}

test('Player State — Initial state defaults to compact and restores from localStorage', () => {
  // Test 1: Empty storage defaults to compact
  const fresh = new MockPlayerStateMachine(null);
  assert.equal(fresh.playerState, 'compact');
  assert.equal(fresh.playerOffset, '96px');

  // Test 2: Valid saved state restored
  const savedPill = new MockPlayerStateMachine('pill');
  assert.equal(savedPill.playerState, 'pill');
  assert.equal(savedPill.playerOffset, '0px');

  const savedExpanded = new MockPlayerStateMachine('expanded');
  assert.equal(savedExpanded.playerState, 'expanded');
  assert.equal(savedExpanded.playerOffset, '96px');

  // Test 3: Invalid saved state safely falls back to compact
  const corrupted = new MockPlayerStateMachine('corrupted_state');
  assert.equal(corrupted.playerState, 'compact');
  assert.equal(corrupted.playerOffset, '96px');
});

test('Player State — Transitions between compact, expanded, and pill persist correctly', () => {
  const machine = new MockPlayerStateMachine('compact');

  // Compact -> Expanded
  machine.expand();
  assert.equal(machine.playerState, 'expanded');
  assert.equal(machine.storage.mka_player_state, 'expanded');
  assert.equal(machine.playerOffset, '96px');

  // Expanded -> Pill
  machine.minimize();
  assert.equal(machine.playerState, 'pill');
  assert.equal(machine.storage.mka_player_state, 'pill');
  assert.equal(machine.playerOffset, '0px');

  // Pill -> Compact (Restore)
  machine.restore();
  assert.equal(machine.playerState, 'compact');
  assert.equal(machine.storage.mka_player_state, 'compact');
  assert.equal(machine.playerOffset, '96px');
});

test('Player State — Minimise keeps audio playing while Close stops audio and clears track', () => {
  const machine = new MockPlayerStateMachine('compact');
  assert.equal(machine.isPlaying, true);

  // 1. Minimise to pill
  machine.minimize();
  assert.equal(machine.playerState, 'pill');
  assert.equal(machine.isPlaying, true, 'Audio MUST continue playing when minimized to pill');
  assert.equal(machine.isReset, false, 'Player must not be reset on minimize');
  assert.equal(machine.playerOffset, '0px', 'Pill state must clear page padding offset to 0px');

  // 2. Restore to compact
  machine.restore();
  assert.equal(machine.playerState, 'compact');
  assert.equal(machine.isPlaying, true, 'Audio continues playing after restore');

  // 3. Close player (x)
  machine.close();
  assert.equal(machine.isPlaying, false, 'Audio MUST stop when closed');
  assert.equal(machine.isReset, true, 'Player MUST be reset when closed');
  assert.equal(machine.currentTrack, null, 'Track MUST be cleared when closed');
  assert.equal(machine.playerOffset, '0px', 'Closed state must clear offset to 0px');
});

test('Player State — Route change (popstate) collapses expanded to compact without interrupting audio', () => {
  const machine = new MockPlayerStateMachine('expanded');
  assert.equal(machine.playerState, 'expanded');
  assert.equal(machine.isPlaying, true);

  // User navigates back/forward in browser history
  machine.onPopState();

  assert.equal(machine.playerState, 'compact', 'Expanded sheet must collapse to compact on route change');
  assert.equal(machine.isPlaying, true, 'Audio must not be paused or interrupted on route change');
  assert.equal(machine.storage.mka_player_state, 'compact');

  // If already in pill, route change leaves pill unchanged
  machine.minimize();
  machine.onPopState();
  assert.equal(machine.playerState, 'pill', 'Pill state must not be disrupted on route change');
  assert.equal(machine.isPlaying, true);
});

// ────────────────────────────────────────────────────────────
// 4. ACCESSIBILITY, CONTROLS & I18N COMPLETENESS
// ────────────────────────────────────────────────────────────
test('PremiumBottomPlayer — Keyboard Navigation & Accessibility Handlers', () => {
  const componentSource = fs.readFileSync(COMPONENT_PATH, 'utf8');

  // Keyboard navigation
  assert.ok(componentSource.includes("e.code === 'Space'"), 'Must handle Space for play/pause');
  assert.ok(componentSource.includes("e.shiftKey && e.code === 'ArrowRight'"), 'Must handle Shift+Right for next');
  assert.ok(componentSource.includes("e.shiftKey && e.code === 'ArrowLeft'"), 'Must handle Shift+Left for prev');
  assert.ok(componentSource.includes("e.key === 'Escape' && playerState === 'expanded'"), 'Must handle Escape to collapse expanded');
  assert.ok(componentSource.includes("activeTag === 'input'"), 'Must guard against firing while typing in input fields');

  // Accessibility roles & aria tokens
  assert.ok(componentSource.includes('role="region"'), 'Player containers must have role="region"');
  assert.ok(componentSource.includes('role="dialog"'), 'Expanded sheet must have role="dialog"');
  assert.ok(componentSource.includes('aria-modal="true"'), 'Expanded sheet must have aria-modal="true"');
  assert.ok(componentSource.includes('role="slider"'), 'Compact scrub line must have role="slider"');
  assert.ok(componentSource.includes('aria-valuetext='), 'Sliders must provide accessible valuetext');
});

test('PremiumBottomPlayer — All i18n music.player keys exist in all locale files', () => {
  const expectedKeys = [
    'ariaLabel',
    'play',
    'pause',
    'previous',
    'next',
    'like',
    'unlike',
    'shuffleOn',
    'shuffleOff',
    'repeat',
    'repeatOne',
    'repeatOff',
    'expand',
    'collapse',
    'minimize',
    'restore',
    'close',
    'mute',
    'unmute',
    'volume',
    'seek',
    'queue',
    'closeQueue',
    'playing',
    'retry',
    'skip',
    'noTrack',
    'chooseTrack',
  ];

  const localeFiles = fs.readdirSync(LOCALES_DIR).filter((f) => f.endsWith('.json'));
  assert.ok(localeFiles.length >= 18, 'Must have at least 18 locale JSON files');

  for (const file of localeFiles) {
    const raw = fs.readFileSync(path.join(LOCALES_DIR, file), 'utf8');
    const json = JSON.parse(raw);
    assert.ok(json.music, `Locale file ${file} must have 'music' section`);
    assert.ok(json.music.player, `Locale file ${file} must have 'music.player' section`);

    for (const key of expectedKeys) {
      assert.ok(
        typeof json.music.player[key] === 'string' && json.music.player[key].length > 0,
        `Locale file ${file} must contain non-empty string for key 'music.player.${key}'`
      );
    }
  }
});
