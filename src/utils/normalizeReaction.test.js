import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeReactionType, VALID_BACKEND_REACTIONS } from './normalizeReaction.js';

test('Reaction Normalization — maps all backend ReactionType values correctly', () => {
  VALID_BACKEND_REACTIONS.forEach((type) => {
    assert.equal(normalizeReactionType(type), type);
    assert.equal(normalizeReactionType(type.toLowerCase()), type);
  });
});

test('Reaction Normalization — maps heart, like, love, and heart emoji to RELATE', () => {
  assert.equal(normalizeReactionType('HEART'), 'RELATE');
  assert.equal(normalizeReactionType('heart'), 'RELATE');
  assert.equal(normalizeReactionType('LIKE'), 'RELATE');
  assert.equal(normalizeReactionType('like'), 'RELATE');
  assert.equal(normalizeReactionType('LOVE'), 'RELATE');
  assert.equal(normalizeReactionType('love'), 'RELATE');
  assert.equal(normalizeReactionType('❤️'), 'RELATE');
});

test('Reaction Normalization — maps support, care, helpful, stay_strong to SUPPORT', () => {
  assert.equal(normalizeReactionType('SUPPORT'), 'SUPPORT');
  assert.equal(normalizeReactionType('support'), 'SUPPORT');
  assert.equal(normalizeReactionType('CARE'), 'SUPPORT');
  assert.equal(normalizeReactionType('HELPFUL'), 'SUPPORT');
  assert.equal(normalizeReactionType('STAY_STRONG'), 'SUPPORT');
  assert.equal(normalizeReactionType('🤝'), 'SUPPORT');
  assert.equal(normalizeReactionType('🔥'), 'SUPPORT');
});

test('Reaction Normalization — maps agree, well_said, thumbs_up to AGREE', () => {
  assert.equal(normalizeReactionType('AGREE'), 'AGREE');
  assert.equal(normalizeReactionType('agree'), 'AGREE');
  assert.equal(normalizeReactionType('WELL_SAID'), 'AGREE');
  assert.equal(normalizeReactionType('wellSaid'), 'AGREE');
  assert.equal(normalizeReactionType('THUMBS_UP'), 'AGREE');
});

test('Reaction Normalization — maps interesting, insightful, made_me_think to INTERESTING', () => {
  assert.equal(normalizeReactionType('INTERESTING'), 'INTERESTING');
  assert.equal(normalizeReactionType('interesting'), 'INTERESTING');
  assert.equal(normalizeReactionType('INSIGHTFUL'), 'INTERESTING');
  assert.equal(normalizeReactionType('MADE_ME_THINK'), 'INTERESTING');
  assert.equal(normalizeReactionType('madeMeThink'), 'INTERESTING');
  assert.equal(normalizeReactionType('💯'), 'INTERESTING');
});

test('Reaction Normalization — maps disagree to DISAGREE', () => {
  assert.equal(normalizeReactionType('DISAGREE'), 'DISAGREE');
  assert.equal(normalizeReactionType('disagree'), 'DISAGREE');
});

test('Reaction Normalization — unknown and falsy inputs safely default to RELATE', () => {
  assert.equal(normalizeReactionType(null), 'RELATE');
  assert.equal(normalizeReactionType(undefined), 'RELATE');
  assert.equal(normalizeReactionType(''), 'RELATE');
  assert.equal(normalizeReactionType('RANDOM_JIBBERISH'), 'RELATE');
});

test('Reaction Normalization — never returns any value outside backend ReactionType enum', () => {
  const inputs = ['HEART', 'LIKE', 'LOVE', 'CARE', 'HELPFUL', 'WELL_SAID', 'INSIGHTFUL', 'RANDOM', null, undefined];
  inputs.forEach((input) => {
    const result = normalizeReactionType(input);
    assert.ok(
      VALID_BACKEND_REACTIONS.includes(result),
      `Expected ${result} to be in ${VALID_BACKEND_REACTIONS}`
    );
  });
});
