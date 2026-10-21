import { apiClient } from './apiClient.js';

export const apiTopicService = {
  async getParentTopics() {
    const fallback = ['FEELINGS', 'EXPRESSION', 'LIFE_WORK', 'SOCIETY_POLITICS', 'ENTERTAINMENT', 'SPORTS', 'GENERAL'];
    try {
      const response = await apiClient.get('/api/topics/parents', { timeout: 10000 });
      const topics = response.data?.data;
      if (!Array.isArray(topics) || topics.length === 0) return fallback;
      return [...topics.filter((topic) => topic !== 'GENERAL'), 'GENERAL'];
    } catch (err) {
      console.warn('[apiTopicService] parent topic fallback:', err?.message || err);
      return fallback;
    }
  },

  async getTopics() {
    try {
      const response = await apiClient.get('/api/topics', { timeout: 10000 });
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[apiTopicService] getTopics network/DB fallback notice:', err?.message || err);
      return [];
    }
  },

  // GET /api/topics/me?page=0&size=20
  async getMyTopics(params = {}) {
    try {
      const response = await apiClient.get('/api/topics/me', {
        params: { page: params.page || 0, size: params.size || 20 },
      });
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data : (data.content || []);
    } catch (err) {
      console.warn('[apiTopicService] getMyTopics error:', err?.message || err);
      return [];
    }
  },

  async createTopic(topicData) {
    try {
      const payload = {
        name: topicData.name || topicData.topicName,
        icon: topicData.icon || '💡',
        createdByUsername: topicData.createdByUsername || '@anonymous',
        parentTopic: topicData.parentTopic || 'GENERAL',
      };
      const response = await apiClient.post('/api/topics', payload, { timeout: 10000 });
      const data = response.data?.data || response.data;
      if (!data) throw new Error('No topic data returned by server');
      return data;
    } catch (err) {
      console.error('[apiTopicService] createTopic error:', err?.message || err);
      throw err;
    }
  },

  async getTopicById(idOrSlug) {
    if (!idOrSlug) return null;
    try {
      const topics = await this.getTopics();
      const clean = String(idOrSlug).trim().toLowerCase();
      const cleanNorm = clean.replace(/[^a-z0-9]/g, '');
      return (
        topics.find((t) => {
          const tId = String(t.id).toLowerCase();
          const tName = String(t.name || '').trim().toLowerCase();
          const tNorm = tName.replace(/[^a-z0-9]/g, '');
          const tLabel = String(t.label || '').trim().toLowerCase();
          const tLabelNorm = tLabel.replace(/[^a-z0-9]/g, '');
          return (
            tId === clean ||
            tName === clean ||
            tNorm === cleanNorm ||
            tLabel === clean ||
            tLabelNorm === cleanNorm
          );
        }) || null
      );
    } catch (err) {
      console.warn('[apiTopicService] getTopicById error:', err?.message || err);
      return null;
    }
  },
};

