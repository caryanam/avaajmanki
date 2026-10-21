import topicLove from '../assets/explore/topic-love.jpg';
import topicLifeWork from '../assets/explore/topic-life-work.jpg';
import topicMentalHealth from '../assets/explore/mental-health-cover.jpg';
import topicFamily from '../assets/explore/topic-family.jpg';
import topicEducation from '../assets/explore/education-cover.jpg';
import topicMotivation from '../assets/explore/motivation-cover.jpg';
import topicRelationships from '../assets/explore/relationships-cover.jpg';
import topicFriendship from '../assets/explore/friendship-cover.jpg';

export const CANONICAL_TOPICS = {
  MENTAL_HEALTH: {
    id: 'MENTAL_HEALTH',
    name: 'Mental Health',
    icon: '🌱',
    badgeBg: '#DCFCE7',
    badgeColor: '#15803D',
    image: topicMentalHealth,
    description: 'A safe space to talk about emotions, anxiety, self-care and overall well-being.',
    discussionCount: '8.1K',
    discussionCountRaw: 8100,
    memberCount: '124K',
    memberCountRaw: 124000,
    tags: [
      'Anxiety',
      'Self-Care',
      'Overthinking',
      'Depression',
      'Positive Thinking',
      'Stress',
      'Emotional Support',
    ],
  },
  LOVE: {
    id: 'LOVE',
    name: 'Love',
    icon: '❤️',
    badgeBg: '#FFE4E6',
    badgeColor: '#BE123C',
    image: topicLove,
    description: 'A space to share your feelings, experiences, questions and thoughts about love, relationships and everything in between.',
    discussionCount: '12.4K',
    discussionCountRaw: 12400,
    memberCount: '45.6K',
    memberCountRaw: 45600,
    tags: ['Relationships', 'Dating', 'Breakup', 'Self-Love', 'Long Distance', 'Marriage', 'Friendship', 'Emotions'],
  },
  LIFE_WORK: {
    id: 'LIFE_WORK',
    name: 'Life & Work',
    icon: '💼',
    badgeBg: '#E0F2FE',
    badgeColor: '#0369A1',
    image: topicLifeWork,
    description: 'Discussions on work-life balance, career growth, office culture, and productivity.',
    discussionCount: '9.8K',
    discussionCountRaw: 9800,
    memberCount: '86K',
    memberCountRaw: 86000,
    tags: ['Career', 'Work-Life Balance', 'Productivity', 'Job Search', 'Burnout', 'Leadership'],
  },
  FAMILY: {
    id: 'FAMILY',
    name: 'Family',
    icon: '🏠',
    badgeBg: '#FFEDD5',
    badgeColor: '#C2410C',
    image: topicFamily,
    description: 'Sharing family dynamics, parenting journeys, sibling bonds, and generational insights.',
    discussionCount: '7.9K',
    discussionCountRaw: 7900,
    memberCount: '65K',
    memberCountRaw: 65000,
    tags: ['Parenting', 'Family Dynamics', 'Generational Gap', 'Traditions', 'Home Life'],
  },
  PERSONAL_GROWTH: {
    id: 'PERSONAL_GROWTH',
    name: 'Personal Growth',
    icon: '📈',
    badgeBg: '#FFE4E6',
    badgeColor: '#E11D48',
    image: topicMotivation,
    description: 'Empowering habits, discipline, mindset shifts, and lifelong self-improvement.',
    discussionCount: '6.6K',
    discussionCountRaw: 6600,
    memberCount: '72K',
    memberCountRaw: 72000,
    tags: ['Habits', 'Discipline', 'Mindset', 'Goal Setting', 'Self Confidence', 'Learning'],
  },
  EDUCATION: {
    id: 'EDUCATION',
    name: 'Education',
    icon: '🎓',
    badgeBg: '#E0F2FE',
    badgeColor: '#0284C7',
    image: topicEducation,
    description: 'Navigating academics, exams, college choices, skill development, and learning paths.',
    discussionCount: '5.2K',
    discussionCountRaw: 5200,
    memberCount: '58K',
    memberCountRaw: 58000,
    tags: ['Exams', 'College Life', 'Study Tips', 'Higher Education', 'Skills'],
  },
  RELATIONSHIPS: {
    id: 'RELATIONSHIPS',
    name: 'Relationships',
    icon: '💞',
    badgeBg: '#FCE7F3',
    badgeColor: '#BE185D',
    image: topicRelationships,
    description: 'Navigating communication, trust, boundaries, and emotional connections in relationships.',
    discussionCount: '7.2K',
    discussionCountRaw: 7200,
    memberCount: '68K',
    memberCountRaw: 68000,
    tags: ['Communication', 'Trust', 'Boundaries', 'Mutual Respect', 'Friendships'],
  },
  FRIENDSHIP: {
    id: 'FRIENDSHIP',
    name: 'Friendship',
    icon: '🤝',
    badgeBg: '#FEF3C7',
    badgeColor: '#B45309',
    image: topicFriendship,
    description: 'Honoring lifelong friendships, making new friends, and overcoming misunderstandings.',
    discussionCount: '5.4K',
    discussionCountRaw: 5400,
    memberCount: '49K',
    memberCountRaw: 49000,
    tags: ['Best Friends', 'Making Friends', 'Loyalty', 'Drifting Apart', 'Support'],
  },
};

export const STANDARD_COMMUNITY_GUIDELINES = [
  'Be respectful and supportive',
  'Keep discussions positive and constructive',
  'No hate speech or bullying',
  'Share personal experiences (not professional advice)',
  'Maintain anonymity and respect others\' privacy',
  'Report inappropriate content',
];

/**
 * Resolves topic metadata from a string identifier, topic name, or category string
 */
export function getTopicMetadata(identifier = '') {
  if (!identifier) return CANONICAL_TOPICS.MENTAL_HEALTH;

  const key = String(identifier).toUpperCase().replace(/[-\s&]+/g, '_');

  if (CANONICAL_TOPICS[key]) return CANONICAL_TOPICS[key];

  if (key.includes('MENTAL') || key.includes('ANXIETY') || key.includes('DEPRESSION') || key.includes('FEELING') || key.includes('OVERTHINK')) {
    return CANONICAL_TOPICS.MENTAL_HEALTH;
  }
  if (key.includes('WORK') || key.includes('JOB') || key.includes('CAREER') || key.includes('LIFE')) {
    return CANONICAL_TOPICS.LIFE_WORK;
  }
  if (key.includes('LOVE') || key.includes('ROMANCE') || key.includes('CRUSH') || key.includes('BREAKUP')) {
    return CANONICAL_TOPICS.LOVE;
  }
  if (key.includes('FAMILY') || key.includes('PARENT') || key.includes('HOME')) {
    return CANONICAL_TOPICS.FAMILY;
  }
  if (key.includes('GROWTH') || key.includes('MOTIVAT') || key.includes('HABIT') || key.includes('SELF')) {
    return CANONICAL_TOPICS.PERSONAL_GROWTH;
  }
  if (key.includes('EDUCAT') || key.includes('COLLEGE') || key.includes('STUDY') || key.includes('EXAM')) {
    return CANONICAL_TOPICS.EDUCATION;
  }
  if (key.includes('FRIEND')) {
    return CANONICAL_TOPICS.FRIENDSHIP;
  }
  if (key.includes('RELATION')) {
    return CANONICAL_TOPICS.RELATIONSHIPS;
  }

  // Fallback default
  return {
    id: key,
    name: String(identifier).replace(/_/g, ' '),
    icon: '🌱',
    badgeBg: '#DCFCE7',
    badgeColor: '#15803D',
    image: topicMentalHealth,
    description: 'A community space to talk and share authentic experiences.',
    discussionCount: '1.2K',
    discussionCountRaw: 1200,
    memberCount: '15K',
    memberCountRaw: 15000,
    tags: ['Community', 'Sharing', 'Experiences'],
  };
}
