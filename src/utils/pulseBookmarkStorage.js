const STORAGE_KEY = 'awaaj_saved_pulse_article_ids';
const EVENT_NAME = 'awaaj-pulse-bookmark-change';

export function getSavedPulseArticleIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function isPulseArticleSaved(id) {
  if (!id) return false;
  const list = getSavedPulseArticleIds();
  return list.some((item) => String(item) === String(id));
}

export function toggleSavePulseArticle(id) {
  if (!id) return false;
  const list = getSavedPulseArticleIds();
  const strId = String(id);
  const exists = list.some((item) => String(item) === strId);
  const updated = exists ? list.filter((item) => String(item) !== strId) : [...list, strId];
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update saved pulse articles in localStorage:', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { id: strId, saved: !exists } }));
  }

  return !exists;
}

export function subscribeToPulseBookmarks(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => callback(e.detail);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
