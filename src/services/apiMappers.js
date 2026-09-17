import { MOCK_USERS } from '../data/users.js';
import { getMediaUrl } from '../config/env.js';

// Adapts anonymous backend DTOs to the existing presentational UI fields.
const anonymousName = '@anonymous';

const FALLBACK_HANDLES = {
  'user_1': '@quietchapter',
  '1': '@quietchapter',
  'user_2': '@hiddenpage',
  '2': '@hiddenpage',
  'user_3': '@thoughtwindow',
  '3': '@thoughtwindow',
  'user_4': '@openjournal',
  '4': '@openjournal',
  'user_5': '@unfinishedline',
  '5': '@unfinishedline',
};

function resolveUsername(item) {
  if (!item) return anonymousName;

  let u = item.username || item.authorUsername || item.user?.username || item.author?.username;

  // 1. If explicit username handle exists on post/comment, sanitize spaces and return handle
  if (u && u !== anonymousName && !u.startsWith('user_')) {
    const cleanU = u.trim().replace(/\s+/g, '');
    return cleanU.startsWith('@') ? cleanU : `@${cleanU}`;
  }

  // 2. Check fallback handles dictionary for raw IDs like 'user_1', 'user_2'
  if (u && FALLBACK_HANDLES[u]) {
    return FALLBACK_HANDLES[u];
  }

  // 3. Resolve by post/comment author userId
  const userId = item.userId || item.user?.id || item.authorId;
  if (userId) {
    const storedAuth = JSON.parse(localStorage.getItem('auth_user') || '{}');
    if (storedAuth.id && (storedAuth.id === userId || `user_${storedAuth.id}` === String(userId))) {
      if (storedAuth.username) {
        const cleanU = storedAuth.username.trim().replace(/\s+/g, '');
        return cleanU.startsWith('@') ? cleanU : `@${cleanU}`;
      }
    }

    const storedProfile = localStorage.getItem(`user_profile_${userId}`);
    if (storedProfile) {
      try {
        const p = JSON.parse(storedProfile);
        if (p.username) {
          const cleanU = p.username.trim().replace(/\s+/g, '');
          return cleanU.startsWith('@') ? cleanU : `@${cleanU}`;
        }
      } catch (e) {}
    }

    const foundMock = MOCK_USERS.find(
      user => user.id === userId || user.id === `user_${userId}` || user.id === `user_00${userId}`
    );
    if (foundMock?.username) return foundMock.username;

    if (FALLBACK_HANDLES[userId] || FALLBACK_HANDLES[String(userId)]) {
      return FALLBACK_HANDLES[userId] || FALLBACK_HANDLES[String(userId)];
    }
  }

  return anonymousName;
}

export function mapPost(post) {
  if (!post) return null;

  const formattedUname = resolveUsername(post);

  let reactionsMap = {};
  if (post.reactionCounts && typeof post.reactionCounts === 'object') {
    reactionsMap = post.reactionCounts;
  } else if (post.reactions && typeof post.reactions === 'object') {
    reactionsMap = post.reactions;
  } else {
    reactionsMap = { RELATE: post.likeCount || 0 };
  }

  const postId = post.id || post.postId;
  let detectedSubtopic = post.subtopic || post.topic || post.category;

  if (postId) {
    try {
      const map = JSON.parse(localStorage.getItem('mka_subtopic_map') || '{}');
      if (map[String(postId)]) {
        detectedSubtopic = map[String(postId)];
      }
    } catch (e) {}
  }

  const rawContent = post.content || post.originalContent || '';
  const hashtagMatch = rawContent.match(/#([A-Z0-9_]+)/i);
  if (hashtagMatch && hashtagMatch[1]) {
    const matchStr = hashtagMatch[1].toUpperCase();
    if (matchStr !== 'GENERAL' && matchStr !== 'TEXT' && matchStr !== 'IMAGE') {
      detectedSubtopic = matchStr;
    }
  }

  const finalTopic = (detectedSubtopic || post.topic || 'GENERAL').toUpperCase();

  let audioObj = post.audio || post.audioAttachment || null;
  const resolvedAudioUrl = post.audioUrl ? getMediaUrl(post.audioUrl) : (audioObj?.audioUrl ? getMediaUrl(audioObj.audioUrl) : null);
  const resolvedCoverUrl = post.imageUrl ? getMediaUrl(post.imageUrl) : (audioObj?.coverUrl ? getMediaUrl(audioObj.coverUrl) : null);

  if (audioObj) {
    audioObj = {
      ...audioObj,
      audioUrl: resolvedAudioUrl,
      coverUrl: resolvedCoverUrl,
    };
  } else if (resolvedAudioUrl) {
    audioObj = {
      audioUrl: resolvedAudioUrl,
      title: post.title || 'Voice Note',
      artistName: formattedUname,
      durationSeconds: post.durationSeconds || 0,
      coverUrl: resolvedCoverUrl,
    };
  }

  return {
    ...post,
    id: postId || `post_${Date.now()}`,
    userId: post.userId || post.authorId || post.user?.id || null,
    title: post.translatedTitle || post.title || '',
    originalTitle: post.title || '',
    topic: finalTopic,
    subtopic: finalTopic,
    postType: post.postType || 'Thought',

    originalContent: post.originalContent || post.content || '',
    translatedContent: post.translatedContent || null,
    content: post.content || post.originalContent || '',
    username: formattedUname,
    avatarInitials: post.avatarInitials || formattedUname.replace('@', '').slice(0, 2).toUpperCase(),
    avatarConfig: post.authorAvatar || post.avatarConfig || null,
    reactions: reactionsMap,
    userReaction: post.userReaction || null,
    audio: audioObj,
    audioUrl: resolvedAudioUrl,
    imageUrl: resolvedCoverUrl,
    status: post.status || 'ACTIVE',
    createdAt: post.createdAt || new Date().toISOString(),
  };

}

export function sanitizeEncodedSymbols(str) {
  if (!str || typeof str !== 'string') return str;
  let clean = str;
  if (clean.includes('%')) {
    try {
      clean = decodeURIComponent(clean);
    } catch (e) {}
  }
  return clean
    .replace(/%2सी/gi, ',')
    .replace(/%3एफ/gi, '?')
    .replace(/%2स/gi, ',')
    .replace(/%3ए/gi, '?')
    .replace(/%2C/gi, ',')
    .replace(/%3F/gi, '?')
    .replace(/%21/gi, '!')
    .replace(/%20/g, ' ')
    .replace(/%3([Ff]|एफ)?/gi, '?')
    .replace(/%2([Cc]|सी)?/gi, ',');
}

export function mapComment(comment) {
  if (!comment) return null;

  const formattedUname = resolveUsername(comment);

  const rawContent = sanitizeEncodedSymbols(comment.originalContent || comment.content || '');
  const rawTranslated = comment.translatedContent ? sanitizeEncodedSymbols(comment.translatedContent) : null;

  return {
    ...comment,
    originalContent: rawContent,
    translatedContent: rawTranslated,
    displayLanguage: comment.displayLanguage || comment.originalLanguage || 'EN',
    content: rawContent,
    username: formattedUname,
    avatarInitials: comment.avatarInitials || formattedUname.replace('@', '').slice(0, 2).toUpperCase(),
    avatarConfig: comment.authorAvatar || comment.avatarConfig || null,
    reactions: comment.reactions || { relate: comment.likeCount || 0 },
    userReaction: comment.userReaction || ((comment.likedByCurrentUser || comment.isLikedByCurrentUser) ? 'relate' : null),
    replies: (comment.replies || []).map(mapComment),
  };
}

export function mapNotification(notification) {
  if (!notification) return null;

  let msg = notification.message || notification.content || '';
  let rawActor = notification.senderUsername || notification.actorUsername || notification.actorName || notification.username || notification.actor?.username;

  // Map old database entries with real names to anonymous handles
  if (msg.startsWith('Ritik ') || msg.toLowerCase().includes('ritik commented') || msg.toLowerCase().includes('ritik replied')) {
    msg = msg.replace(/^Ritik\s+/i, '@gentlejournal ');
    rawActor = '@gentlejournal';
  } else if (msg.startsWith('pratik patil ') || msg.toLowerCase().includes('pratik patil commented') || msg.toLowerCase().includes('pratik patil replied')) {
    msg = msg.replace(/^pratik patil\s+/i, '@subtlechapter ');
    rawActor = '@subtlechapter';
  }

  let formattedActor = anonymousName;

  if (rawActor && rawActor !== 'System' && rawActor !== 'Moderation Team') {
    const cleanU = rawActor.trim().replace(/\s+/g, '');
    formattedActor = cleanU.startsWith('@') ? cleanU : `@${cleanU}`;
  } else if (rawActor) {
    formattedActor = rawActor;
  }

  if (formattedActor && formattedActor !== anonymousName && formattedActor !== 'System' && formattedActor !== 'Moderation Team') {
    msg = msg.replace(/^([A-Za-z0-9_\s]+?)\s+(commented|replied|liked|reacted)/i, `${formattedActor} $2`);
  }

  return {
    ...notification,
    actorUsername: formattedActor,
    actorInitials: formattedActor.replace('@', '').slice(0, 2).toUpperCase(),
    targetPostId: notification.targetId || notification.targetPostId,
    message: msg,
  };
}
