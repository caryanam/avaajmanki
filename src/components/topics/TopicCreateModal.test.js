import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const MODAL_COMPONENT_PATH = path.resolve('src/components/topics/TopicCreateModal.jsx');
const MODAL_CSS_PATH = path.resolve('src/styles/create-topic-modal.css');
const GLOBAL_CSS_PATH = path.resolve('src/styles/global.css');

test('Create Topic Modal — Component File & Architecture Integrity', () => {
  assert.ok(fs.existsSync(MODAL_COMPONENT_PATH), 'TopicCreateModal.jsx must exist');
  assert.ok(fs.existsSync(MODAL_CSS_PATH), 'create-topic-modal.css must exist');
  
  const globalCss = fs.readFileSync(GLOBAL_CSS_PATH, 'utf8');
  assert.ok(globalCss.includes("create-topic-modal.css"), 'global.css must import create-topic-modal.css');
});

test('Create Topic Modal — 10 Approved Categories & Backend Parent Topic Mapping', () => {
  const content = fs.readFileSync(MODAL_COMPONENT_PATH, 'utf8');

  // Must include all 10 approved category labels
  const expectedCategories = [
    'Love',
    'Life & Work',
    'Mental Health',
    'Family',
    'Personal Growth',
    'Education',
    'Motivation',
    'Relationships',
    'Friendship',
    'Others',
  ];

  for (const cat of expectedCategories) {
    assert.ok(content.includes(`'${cat}'`), `Modal must include category option '${cat}'`);
  }

  // Must map to valid backend parent topics
  assert.ok(content.includes("backendParentTopic: 'FEELINGS'"), 'Must map to FEELINGS parent topic');
  assert.ok(content.includes("backendParentTopic: 'LIFE_WORK'"), 'Must map to LIFE_WORK parent topic');
  assert.ok(content.includes("backendParentTopic: 'PARENTING'"), 'Must map to PARENTING parent topic');
  assert.ok(content.includes("backendParentTopic: 'EXPRESSION'"), 'Must map to EXPRESSION parent topic');
  assert.ok(content.includes("backendParentTopic: 'EDUCATION'"), 'Must map to EDUCATION parent topic');
  assert.ok(content.includes("backendParentTopic: 'RELATIONSHIPS'"), 'Must map to RELATIONSHIPS parent topic');
  assert.ok(content.includes("backendParentTopic: 'GENERAL'"), 'Must map to GENERAL parent topic');
});

test('Create Topic Modal — 4 Numbered Steps & Form Elements', () => {
  const content = fs.readFileSync(MODAL_COMPONENT_PATH, 'utf8');

  // Step 1: Topic Name with 50 char limit and duplicate check
  assert.ok(content.includes('className="ct-step-num"') && content.includes('>1</div>'), 'Must render Step 1 badge');
  assert.ok(content.includes('MAX_NAME_LENGTH = 50'), 'Must enforce max 50 characters for name');
  assert.ok(content.includes('existingTopicNames'), 'Must check duplicate topic names');

  // Step 2: Category Grid
  assert.ok(content.includes('>2</div>'), 'Must render Step 2 badge');
  assert.ok(content.includes('ct-category-grid'), 'Must render category grid');
  assert.ok(content.includes('ct-category-check-badge'), 'Must render checkmark badge on selected category');

  // Step 3: Topic Description with 300 char limit
  assert.ok(content.includes('>3</div>'), 'Must render Step 3 badge');
  assert.ok(content.includes('MAX_DESCRIPTION_LENGTH = 300'), 'Must enforce max 300 characters for description');
  assert.ok(content.includes('ct-textarea-field'), 'Must render description textarea');

  // Step 4: Cover Image Dropzone & Preview
  assert.ok(content.includes('>4</div>'), 'Must render Step 4 badge');
  assert.ok(content.includes('ct-upload-dropzone'), 'Must render dropzone upload container');
  assert.ok(content.includes('ct-upload-preview-card'), 'Must render image preview container');
  assert.ok(content.includes('ct-upload-remove-btn'), 'Must render remove image button');
});

test('Create Topic Modal — Accessibility & Interaction Controls', () => {
  const content = fs.readFileSync(MODAL_COMPONENT_PATH, 'utf8');

  assert.ok(content.includes('role="dialog"'), 'Must have role="dialog"');
  assert.ok(content.includes('aria-modal="true"'), 'Must have aria-modal="true"');
  assert.ok(content.includes('aria-labelledby="ct-modal-title"'), 'Must have accessible title label');
  assert.ok(content.includes("e.key === 'Escape'"), 'Must listen for Escape key to close modal');
  assert.ok(content.includes("document.body.style.overflow = 'hidden'"), 'Must lock body scrolling when open');
  assert.ok(content.includes('role="radio"'), 'Category tiles must have radio role for a11y');
  assert.ok(content.includes("getUiText('cancel', 'Cancel')"), 'Cancel button must default to Cancel in English');
});

test('Create Topic Modal — CSS Design Tokens & Styling Verification', () => {
  const css = fs.readFileSync(MODAL_CSS_PATH, 'utf8');

  // Must define all requested refined --ct-* tokens
  const expectedTokens = [
    '--ct-primary: #F50057;',
    '--ct-primary-hover: #D60050;',
    '--ct-gradient-end: #AE17B5;',
    '--ct-header-pink: #FFF4F8;',
    '--ct-header-soft: #FFFFFF;',
    '--ct-selected-bg: #FFF2F7;',
    '--ct-input-bg: #FFFFFF;',
    '--ct-upload-bg: #FAFBFC;',
    '--ct-surface: #FFFFFF;',
    '--ct-heading: #101A38;',
    '--ct-text: #273453;',
    '--ct-muted: #66738F;',
    '--ct-border: #E5E9F1;',
    '--ct-selected-border: #F50057;',
    '--ct-error: #DC264B;',
    '--ct-button-gradient:',
    '--ct-header-gradient:',
    '--ct-overlay: rgba(16, 24, 51, 0.36);',
    '--ct-modal-shadow:',
    '--ct-card-shadow:',
  ];

  for (const token of expectedTokens) {
    assert.ok(css.includes(token), `CSS must include token '${token}'`);
  }

  // Backdrop blur
  assert.ok(css.includes('backdrop-filter: blur(7px);'), 'Must include 7px backdrop blur');

  // Desktop 5-column grid
  assert.ok(css.includes('grid-template-columns: repeat(5, 1fr);'), 'Must use 5-column grid on desktop');

  // Responsive breakpoints
  assert.ok(css.includes('@media (max-width: 768px)'), 'Must define tablet breakpoint');
  assert.ok(css.includes('grid-template-columns: repeat(3, 1fr);'), 'Must use 3 columns on tablet');
  assert.ok(css.includes('@media (max-width: 480px)'), 'Must define mobile breakpoint');
  assert.ok(css.includes('grid-template-columns: repeat(2, 1fr);'), 'Must use 2 columns on mobile');

  // Smooth entrance animation & prefers-reduced-motion
  assert.ok(css.includes('cubic-bezier(0.22, 1, 0.36, 1)'), 'Must use specified cubic-bezier easing');
  assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'Must honor prefers-reduced-motion');
});
