export const VALID_BACKEND_REACTIONS = Object.freeze([
  'RELATE',
  'AGREE',
  'DISAGREE',
  'INTERESTING',
  'SUPPORT',
]);

/**
 * Normalizes UI reaction names or emojis to the backend ReactionType enum:
 * RELATE, AGREE, DISAGREE, INTERESTING, SUPPORT.
 * 
 * Never returns an invalid reaction type that would fail backend enum deserialization.
 */
export function normalizeReactionType(reactionType) {
  if (!reactionType) return 'RELATE';
  const raw = String(reactionType).trim().toUpperCase();

  switch (raw) {
    case 'HEART':
    case 'LIKE':
    case 'LOVE':
    case 'RELATE':
    case '❤️':
    case '👍': // Default like maps to relate/agree
      return 'RELATE';

    case 'SUPPORT':
    case 'CARE':
    case 'HELPFUL':
    case 'STAY_STRONG':
    case 'STAYSTRONG':
    case '🤝':
    case '🔥':
      return 'SUPPORT';

    case 'AGREE':
    case 'WELL_SAID':
    case 'WELLSAID':
    case 'THUMBS_UP':
    case 'THUMBSUP':
      return 'AGREE';

    case 'DISAGREE':
    case 'THUMBS_DOWN':
    case 'THUMBSDOWN':
      return 'DISAGREE';

    case 'INTERESTING':
    case 'INSIGHTFUL':
    case 'MADE_ME_THINK':
    case 'MADEMETHINK':
    case 'THINK':
    case 'LIGHTBULB':
    case '💯':
      return 'INTERESTING';

    default:
      if (VALID_BACKEND_REACTIONS.includes(raw)) {
        return raw;
      }
      return 'RELATE';
  }
}
