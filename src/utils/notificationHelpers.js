import mentalHealthThumb from '../assets/explore/mental-health-cover.jpg';
import motivationThumb from '../assets/explore/motivation-cover.jpg';
import relationshipsThumb from '../assets/explore/relationships-cover.jpg';
import educationThumb from '../assets/explore/education-cover.jpg';
import lifeWorkThumb from '../assets/explore/topic-life-work.jpg';
import friendshipThumb from '../assets/explore/friendship-cover.jpg';
import fallbackThumb from '../assets/home/post-image-fallback.jpg';

export function getNotificationCategory(item) {
  if (!item) return 'all';
  const type = (item.type || '').toUpperCase();
  const msg = (item.message || '').toLowerCase();

  // 1. Mentions
  if (type === 'MENTION' || msg.includes('mentioned in') || msg.includes('@you') || msg.includes('@aarav') || msg.includes('@quietchapter')) {
    if (msg.includes('mentioned in') || msg.includes('@you')) {
      return 'mentions';
    }
  }

  // 2. Follows
  if (type === 'FOLLOW' || type === 'USER_FOLLOW' || msg.includes('started following you') || msg.includes('new follower')) {
    return 'follows';
  }

  // 3. Likes
  if (type === 'POST_LIKE' || type === 'COMMENT_LIKE' || type === 'LIKE' || type === 'RELATE' || msg.includes('liked your') || msg.includes('received a new like') || msg.includes('reacted to')) {
    return 'likes';
  }

  // 4. Replies
  if (type === 'REPLY' || msg.includes('replied to your')) {
    return 'replies';
  }

  // 5. Comments
  if (type === 'COMMENT' || msg.includes('commented on your')) {
    return 'comments';
  }

  // 6. System / Topic updates
  if (type === 'SYSTEM' || type === 'WARNING' || type === 'ACCOUNT_BLOCKED' || type === 'MUSIC_UPLOAD_APPROVED' || type === 'MUSIC_UPLOAD_REJECTED' || type === 'TOPIC_UPDATE' || msg.includes('update in your topic') || msg.includes('discussions in') || msg.includes('welcome to')) {
    return 'system';
  }

  return 'comments';
}

export function parseNotification(item) {
  if (!item) return {};

  const category = getNotificationCategory(item);
  const rawMsg = item.message || '';
  const sender = item.actorUsername || item.senderUsername || 'Someone';
  const cleanSender = sender.startsWith('@') ? sender : `@${sender}`;

  let title = '';
  let snippet = '';
  let tag = 'Post · General';
  let thumbnail = fallbackThumb;
  let actionType = 'view'; // 'view' | 'follow' | 'arrow'

  // Extract quotes or colon snippets if present
  let extractedQuote = '';
  const allQuotes = [...rawMsg.matchAll(/["“](.+?)["”]/g)];
  if (allQuotes.length >= 2) {
    extractedQuote = `“${allQuotes[allQuotes.length - 1][1]}”`;
  } else if (allQuotes.length === 1) {
    extractedQuote = `“${allQuotes[0][1]}”`;
  }

  switch (category) {
    case 'comments': {
      if (rawMsg.toLowerCase().includes('mental health')) {
        tag = 'Post · Mental Health';
        thumbnail = mentalHealthThumb;
      } else if (rawMsg.toLowerCase().includes('motivation')) {
        tag = 'Post · Motivation';
        thumbnail = motivationThumb;
      } else if (rawMsg.toLowerCase().includes('relationship')) {
        tag = 'Post · Relationships';
        thumbnail = relationshipsThumb;
      } else {
        tag = 'Post · Mental Health';
        thumbnail = mentalHealthThumb;
      }

      title = `${cleanSender} commented on your post`;
      snippet = extractedQuote || '“This is really relatable. I have gone through the same phase...”';
      break;
    }

    case 'replies': {
      if (rawMsg.toLowerCase().includes('how to stay motivated') || rawMsg.toLowerCase().includes('motivation')) {
        title = `${cleanSender} replied to your comment on "How to stay motivated?"`;
        tag = 'Comment · Motivation';
        thumbnail = motivationThumb;
      } else if (rawMsg.toLowerCase().includes('education')) {
        title = `${cleanSender} replied to your comment`;
        tag = 'Reply · Education';
        thumbnail = educationThumb;
      } else {
        title = `${cleanSender} replied to your comment`;
        tag = 'Comment · Motivation';
        thumbnail = motivationThumb;
      }
      snippet = extractedQuote || '“Totally agree! Consistency is the key 💯”';
      break;
    }

    case 'likes': {
      if (rawMsg.toLowerCase().includes('comment')) {
        title = `${cleanSender} liked your comment`;
        snippet = 'Your comment received a new like';
        tag = 'Comment · Relationships';
        thumbnail = relationshipsThumb;
      } else {
        title = `${cleanSender} liked your post`;
        snippet = 'Your post received a new like';
        tag = 'Post · Personal Growth';
        thumbnail = friendshipThumb;
      }
      break;
    }

    case 'mentions': {
      if (rawMsg.toLowerCase().includes('reply')) {
        title = 'You were mentioned in a reply';
        tag = 'Reply · Education';
        thumbnail = educationThumb;
      } else {
        title = 'You were mentioned in a comment';
        tag = 'Comment · Life & Work';
        thumbnail = lifeWorkThumb;
      }
      snippet = extractedQuote || `“@You this is a great point!”`;
      break;
    }

    case 'follows': {
      title = `${cleanSender} started following you`;
      snippet = 'You have a new follower on AwaajManKi';
      tag = 'Community · Network';
      actionType = 'follow';
      thumbnail = null;
      break;
    }

    case 'system':
    default: {
      if (rawMsg.toLowerCase().includes('update in your topic') || rawMsg.toLowerCase().includes('discussions in')) {
        title = 'New update in your topic';
        snippet = rawMsg.includes(':') ? rawMsg.split(':')[1].trim() : '5 new discussions in Mental Health topic';
        tag = 'Topic · Mental Health';
        actionType = 'arrow';
        thumbnail = null;
      } else {
        title = 'System Notification';
        snippet = rawMsg;
        tag = 'System · Announcement';
        actionType = 'arrow';
        thumbnail = null;
      }
      break;
    }
  }

  return {
    category,
    title,
    snippet,
    tag,
    thumbnail,
    actionType,
  };
}

export function formatTimeAgo(isoString) {
  if (!isoString) return 'Just now';
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin === 1) return '1 minute ago';
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
