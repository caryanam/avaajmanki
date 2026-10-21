export const SYSTEM_TOPICS = [
  'GENERAL',
  'BOLLYWOOD',
  'CRICKET',
  'TECHNOLOGY',
  'POLITICS',
  'LIFESTYLE',
  'LIFE',
  'ENTERTAINMENT',
  'SPORTS',
  'NEWS',
  'LOVE',
  'BREAKUP',
  'SHAYARI',
  'POETRY',
  'CONFESSION',
  'JOB',
  'BUSINESS',
  'MONEY',
];

export const TOPIC_CATEGORIES = [
  {
    name: 'Feelings',
    categoryKey: 'FEELINGS_CAT',
    translationKey: 'topic.categoryFeelings',
    iconName: 'Heart',
    accent: '#D81B60',
    gradient: 'linear-gradient(135deg, rgba(216,27,96,0.1) 0%, rgba(255,255,255,0.95) 100%)',
    subtopics: [
      { id: 'LOVE', label: 'Love', translationKey: 'topic.subtopicLove', icon: '❤️' },
      { id: 'BREAKUP', label: 'Breakup', translationKey: 'topic.subtopicBreakup', icon: '💔' },
      { id: 'MISSING_SOMEONE', label: 'Missing Someone', translationKey: 'topic.subtopicMissingSomeone', icon: '🥺' },
      { id: 'LONELINESS', label: 'Loneliness', translationKey: 'topic.subtopicLoneliness', icon: '🌙' },
      { id: 'FRIENDSHIP', label: 'Friendship', translationKey: 'topic.subtopicFriendship', icon: '🤝' },
      { id: 'FAMILY', label: 'Family', translationKey: 'topic.subtopicFamily', icon: '🏡' },
      { id: 'HAPPINESS', label: 'Happiness', translationKey: 'topic.subtopicHappiness', icon: '😊' },
      { id: 'FRUSTRATION', label: 'Frustration', translationKey: 'topic.subtopicFrustration', icon: '😤' },
    ]
  },
  {
    name: 'Expression',
    categoryKey: 'EXPRESSION_CAT',
    translationKey: 'topic.categoryExpression',
    iconName: 'Feather',
    accent: '#7B1FA2',
    gradient: 'linear-gradient(135deg, rgba(123,31,162,0.1) 0%, rgba(255,255,255,0.95) 100%)',
    subtopics: [
      { id: 'POETRY', label: 'Poetry', translationKey: 'topic.subtopicPoetry', icon: '📜' },
      { id: 'SHAYARI', label: 'Shayari', translationKey: 'topic.subtopicShayari', icon: '✍️' },
      { id: 'CONFESSION', label: 'Confession', translationKey: 'topic.subtopicConfession', icon: '🤫' },
      { id: 'PERSONAL_STORY', label: 'Personal Story', translationKey: 'topic.subtopicPersonalStory', icon: '📖' },
      { id: 'QUOTES', label: 'Quotes', translationKey: 'topic.subtopicQuotes', icon: '💬' },
    ]
  },
  {
    name: 'Life & Work',
    categoryKey: 'LIFE_WORK_CAT',
    translationKey: 'topic.categoryLifeWork',
    iconName: 'Briefcase',
    accent: '#1565C0',
    gradient: 'linear-gradient(135deg, rgba(215,101,192,0.1) 0%, rgba(255,255,255,0.95) 100%)',
    subtopics: [
      { id: 'LIFE', label: 'Life', translationKey: 'topic.subtopicLife', icon: '🌿' },
      { id: 'JOB', label: 'Job', translationKey: 'topic.subtopicJob', icon: '💼' },
      { id: 'BOSS', label: 'Boss', translationKey: 'topic.subtopicBoss', icon: '👔' },
      { id: 'BUSINESS', label: 'Business', translationKey: 'topic.subtopicBusiness', icon: '📈' },
      { id: 'MONEY', label: 'Money', translationKey: 'topic.subtopicMoney', icon: '💰' },
      { id: 'EDUCATION', label: 'Education', translationKey: 'topic.subtopicEducation', icon: '🎓' },
      { id: 'CAREER', label: 'Career', translationKey: 'topic.subtopicCareer', icon: '🚀' },
    ]
  },
  {
    name: 'Society & Politics',
    categoryKey: 'SOCIETY_POLITICS_CAT',
    translationKey: 'topic.categorySocietyPolitics',
    iconName: 'Landmark',
    accent: '#C62828',
    gradient: 'linear-gradient(135deg, rgba(198,40,40,0.1) 0%, rgba(255,255,255,0.95) 100%)',
    subtopics: [
      { id: 'POLITICS', label: 'Politics', translationKey: 'topic.subtopicPolitics', icon: '🏛️' },
      { id: 'GOVERNMENT', label: 'Government', translationKey: 'topic.subtopicGovernment', icon: '⚖️' },
      { id: 'ELECTIONS', label: 'Elections', translationKey: 'topic.subtopicElections', icon: '🗳️' },
      { id: 'LOCAL_ISSUES', label: 'Local Issues', translationKey: 'topic.subtopicLocalIssues', icon: '📍' },
      { id: 'SOCIAL_ISSUES', label: 'Social Issues', translationKey: 'topic.subtopicSocialIssues', icon: '📢' },
      { id: 'PUBLIC_PROBLEMS', label: 'Public Problems', translationKey: 'topic.subtopicPublicProblems', icon: '⚠️' },
    ]
  },
  {
    name: 'Entertainment',
    categoryKey: 'ENTERTAINMENT_CAT',
    translationKey: 'topic.categoryEntertainment',
    iconName: 'Film',
    accent: '#E5A93C',
    gradient: 'linear-gradient(135deg, rgba(229,169,60,0.1) 0%, rgba(255,255,255,0.95) 100%)',
    subtopics: [
      { id: 'MOVIE_REVIEW', label: 'Movie Review', translationKey: 'topic.subtopicMovieReview', icon: '🎬' },
      { id: 'MUSIC', label: 'Music', translationKey: 'topic.subtopicMusic', icon: '🎵' },
      { id: 'WEB_SERIES', label: 'Web Series', translationKey: 'topic.subtopicWebSeries', icon: '📺' },
      { id: 'CELEBRITY_DISCUSSION', label: 'Celebrity Discussion', translationKey: 'topic.subtopicCelebrityDiscussion', icon: '🌟' },
      { id: 'BOLLYWOOD', label: 'Bollywood', translationKey: 'topic.subtopicBollywood', icon: '🍿' },
    ]
  },
  {
    name: 'Sports',
    categoryKey: 'SPORTS_CAT',
    translationKey: 'topic.categorySports',
    iconName: 'Trophy',
    accent: '#2E7D32',
    gradient: 'linear-gradient(135deg, rgba(46,125,50,0.1) 0%, rgba(255,255,255,0.95) 100%)',
    subtopics: [
      { id: 'CRICKET', label: 'Cricket', translationKey: 'topic.subtopicCricket', icon: '🏏' },
      { id: 'FOOTBALL', label: 'Football', translationKey: 'topic.subtopicFootball', icon: '⚽' },
      { id: 'OTHER_SPORTS', label: 'Other Sports', translationKey: 'topic.subtopicOtherSports', icon: '🏆' },
    ]
  },
  {
    name: 'Other & Community',
    categoryKey: 'OTHER_CAT',
    translationKey: 'topic.categoryOtherCommunity',
    iconName: 'Compass',
    accent: '#6F405F',
    gradient: 'linear-gradient(135deg, rgba(111,64,95,0.1) 0%, rgba(255,255,255,0.95) 100%)',
    subtopics: [
      { id: 'GENERAL', label: 'General', translationKey: 'topic.subtopicGeneral', icon: '💬' },
      { id: 'TECHNOLOGY', label: 'Technology', translationKey: 'topic.subtopicTechnology', icon: '💻' },
      { id: 'OTHER', label: 'Other', translationKey: 'topic.subtopicOther', icon: '✨' },
    ]
  }
];

export const ALL_SUBTOPIC_IDS = TOPIC_CATEGORIES.flatMap(cat => cat.subtopics.map(st => st.id));

export function getCategoryDisplayName(cat, t) {
  if (!cat) return '';
  const key = cat.translationKey || (cat.name ? `topic.category${cat.name.replace(/[^A-Za-z0-9]/g, '')}` : null);
  if (t && key) {
    return t(key, cat.name || '');
  }
  return cat.name || '';
}

export function getSubtopicDisplayLabel(subtopicOrId, t) {
  if (!subtopicOrId) return '';
  const id = typeof subtopicOrId === 'string' ? subtopicOrId : subtopicOrId.id;
  const rawLabel = typeof subtopicOrId === 'object' && subtopicOrId.label ? subtopicOrId.label : id;
  if (!t) return rawLabel;

  for (const cat of TOPIC_CATEGORIES) {
    const found = cat.subtopics.find(st => st.id === id);
    if (found && found.translationKey) {
      return t(found.translationKey, found.label || rawLabel);
    }
  }
  return rawLabel;
}

export function isTopicName(name) {
  if (!name || typeof name !== 'string') return false;
  const upper = name.trim().toUpperCase().replace(/^#/, '');
  if (SYSTEM_TOPICS.includes(upper)) return true;
  if (ALL_SUBTOPIC_IDS.includes(upper)) return true;

  // Check user-created custom topics (handles both string[] and object[] formats)
  const custom = getCustomTopics();
  const customIds = custom.map(c => {
    if (typeof c === 'string') return c.toUpperCase();
    return (c.id || c.name || '').toUpperCase();
  });
  if (customIds.includes(upper)) return true;

  return false;
}


export function getCustomTopics() {
  try {
    const stored = localStorage.getItem('mka_custom_topics_v2');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }

    const legacy = localStorage.getItem('mka_custom_topics');
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed)) {
        return parsed.map(item => {
          if (typeof item === 'string') return { id: item, name: item, label: item, icon: '💡' };
          return item;
        });
      }
    }
    return [];
  } catch (e) {
    return [];
  }
}

import { apiTopicService } from '../services/apiTopicService.js';

export async function syncTopicsWithDatabase() {
  try {
    const dbTopics = await apiTopicService.getTopics();
    if (Array.isArray(dbTopics) && dbTopics.length > 0) {
      const current = getCustomTopics();
      const currentMap = new Map();
      current.forEach(t => {
        const key = typeof t === 'string' ? t : (t.id || t.name);
        currentMap.set(key, t);
      });

      dbTopics.forEach(dt => {
        const cleanName = (dt.name || dt.topicName || '').toUpperCase().replace(/[^A-Z0-9_]/g, '');
        if (cleanName && !SYSTEM_TOPICS.includes(cleanName) && !ALL_SUBTOPIC_IDS.includes(cleanName)) {
          if (!currentMap.has(cleanName)) {
            currentMap.set(cleanName, {
              id: cleanName,
              dbId: dt.id,
              name: cleanName,
              label: (dt.label || cleanName).replace(/_/g, ' '),
              icon: dt.icon || '💡',
              createdAt: dt.createdAt || new Date().toISOString(),
              parentTopic: dt.parentTopic || 'GENERAL',
            });
          } else {
            currentMap.set(cleanName, { ...currentMap.get(cleanName), dbId: dt.id, parentTopic: dt.parentTopic || 'GENERAL' });
          }
        }
      });

      const merged = Array.from(currentMap.values());
      try {
        localStorage.setItem('mka_custom_topics_v2', JSON.stringify(merged));
      } catch (e) {}
      return merged;
    }
  } catch (err) {
    console.warn('[topicUtils] Sync topics DB error notice:', err?.message || err);
  }
  return getCustomTopics();
}

export function saveCustomTopic(topicName, emojiIcon = '💡', createdByUsername = '@anonymous') {
  if (!topicName || !topicName.trim()) return getCustomTopics();
  const clean = topicName.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
  if (!clean || SYSTEM_TOPICS.includes(clean)) return getCustomTopics();

  const current = getCustomTopics();
  const exists = current.find(t => (typeof t === 'string' ? t === clean : t.id === clean || t.name === clean));

  if (!exists) {
    const newTopic = {
      id: clean,
      name: clean,
      label: clean.replace(/_/g, ' '),
      icon: emojiIcon || '💡',
      createdAt: new Date().toISOString(),
    };
    const updated = [...current, newTopic];
    try {
      localStorage.setItem('mka_custom_topics_v2', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    // Persist custom topic to database asynchronously
    apiTopicService.createTopic({
      name: clean,
      icon: emojiIcon || '💡',
      createdByUsername,
    }).catch(err => console.warn('[topicUtils] DB persist topic notice:', err?.message || err));

    return updated;
  }
  return current;
}


export function computeTopicStats(posts = []) {
  const nowMs = Date.now();
  const fiveMinsMs = 5 * 60 * 1000;
  const fifteenMinsMs = 15 * 60 * 1000;
  const customTopics = getCustomTopics();

  const statsMap = {};
  SYSTEM_TOPICS.forEach((t) => {
    statsMap[t] = {
      name: t,
      count: 0,
      recent5MinCount: 0,
      lastPostTime: null,
      lastPostMs: 0,
      isTrending: false,
      isNew: false,
      isUserAdded: false,
    };
  });

  ALL_SUBTOPIC_IDS.forEach((stId) => {
    if (!statsMap[stId]) {
      statsMap[stId] = {
        name: stId,
        count: 0,
        recent5MinCount: 0,
        lastPostTime: null,
        lastPostMs: 0,
        isTrending: false,
        isNew: false,
        isUserAdded: false,
      };
    }
  });

  customTopics.forEach((ct) => {
    const ctName = typeof ct === 'string' ? ct : (ct.name || ct.id);
    if (!statsMap[ctName]) {
      statsMap[ctName] = {
        name: ctName,
        count: 0,
        recent5MinCount: 0,
        lastPostTime: null,
        lastPostMs: 0,
        isTrending: false,
        isNew: false,
        isUserAdded: true,
      };
    }
  });


  posts.forEach((p) => {
    if (!p) return;
    const normTopic = (p.topic || 'GENERAL').toUpperCase().trim();

    if (!SYSTEM_TOPICS.includes(normTopic) && !ALL_SUBTOPIC_IDS.includes(normTopic) && normTopic !== 'GENERAL') {
      saveCustomTopic(normTopic);
    }

    if (!statsMap[normTopic]) {
      statsMap[normTopic] = {
        name: normTopic,
        count: 0,
        recent5MinCount: 0,
        lastPostTime: null,
        lastPostMs: 0,
        isTrending: false,
        isNew: false,
        isUserAdded: !SYSTEM_TOPICS.includes(normTopic) && !ALL_SUBTOPIC_IDS.includes(normTopic),
      };
    }


    const stat = statsMap[normTopic];
    stat.count += 1;

    const createdAt = p.createdAt ? new Date(p.createdAt).getTime() : 0;
    if (createdAt > stat.lastPostMs) {
      stat.lastPostMs = createdAt;
      stat.lastPostTime = p.createdAt;
    }

    if (createdAt > 0 && nowMs - createdAt <= fiveMinsMs) {
      stat.recent5MinCount += 1;
    }
  });

  return Object.values(statsMap).map((stat) => {
    const timeDiffMs = stat.lastPostMs > 0 ? nowMs - stat.lastPostMs : Infinity;
    const hasRealPosts = stat.count > 0;
    const isTrending = hasRealPosts && stat.recent5MinCount >= 2;
    const isNew = hasRealPosts && timeDiffMs <= fifteenMinsMs;
    const isUserAdded = stat.isUserAdded || (!SYSTEM_TOPICS.includes(stat.name) && !ALL_SUBTOPIC_IDS.includes(stat.name));

    return {
      ...stat,
      isTrending,
      isNew,
      isUserAdded,
      priority: isTrending ? 3 : isNew ? 2 : (hasRealPosts ? 1 : 0),
    };
  }).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.lastPostMs - a.lastPostMs;
  });
}
