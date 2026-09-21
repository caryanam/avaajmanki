// Keep a bounded recent feed while retaining optimistic posts until they settle.
export function mergeFeed(fresh, previous = [], limit = 200) {
  if (!Array.isArray(fresh)) return previous;
  const pending = previous.filter(post => String(post.id).startsWith('temp_post_'));
  if (fresh.length === 0) return pending;
  const seen = new Set();
  return [...pending, ...fresh, ...previous].filter(post => {
    const id = String(post.feedItemId || post.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  }).slice(0, limit);
}
