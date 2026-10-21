import { apiClient } from './apiClient.js';

export const apiPulseService = {
  /**
   * GET /api/v1/pulse/featured?limit=10
   * Retrieves active featured Pulse editorial items for discovery carousel/section.
   */
  async getFeaturedPulseItems(limit = 10) {
    try {
      const response = await apiClient.get('/api/v1/pulse/featured', {
        params: { limit },
      });
      return response.data?.data || response.data || [];
    } catch (err) {
      console.error('[apiPulseService] Failed to fetch featured Pulse items:', err);
      throw err;
    }
  },

  /**
   * GET /api/v1/pulse?topic={topic}&page={page}&size={size}
   * Retrieves paginated public Pulse items.
   */
  async getPulseItems(params = {}) {
    try {
      const queryParams = {
        page: params.page || 0,
        size: params.size || 20,
      };
      if (params.topic && params.topic !== 'ALL' && params.topic !== 'All') {
        queryParams.topic = params.topic;
      }
      const response = await apiClient.get('/api/v1/pulse', { params: queryParams });
      return response.data?.data || response.data || { content: [] };
    } catch (err) {
      console.error('[apiPulseService] Failed to list Pulse items:', err);
      throw err;
    }
  },

  /**
   * GET /api/v1/pulse/{id}
   * Retrieves a single published, visible Pulse item.
   */
  async getPulseItemById(id) {
    if (!id) throw new Error('Pulse item ID is required');
    try {
      const response = await apiClient.get(`/api/v1/pulse/${id}`);
      return response.data?.data || response.data;
    } catch (err) {
      console.error(`[apiPulseService] Failed to fetch Pulse item ${id}:`, err);
      throw err;
    }
  },

  /**
   * GET /api/v1/pulse/{id}/takes?page={page}&size={size}
   * Retrieves community takes (posts linked to this Pulse item).
   */
  async getPulseTakes(id, params = {}) {
    if (!id) throw new Error('Pulse item ID is required');
    try {
      const queryParams = {
        page: params.page || 0,
        size: params.size || 20,
      };
      const response = await apiClient.get(`/api/v1/pulse/${id}/takes`, { params: queryParams });
      return response.data?.data || response.data || { content: [] };
    } catch (err) {
      console.error(`[apiPulseService] Failed to fetch takes for Pulse item ${id}:`, err);
      throw err;
    }
  },

  /**
   * GET /api/v1/pulse/{id}/comments?page={page}&size={size}
   * Retrieves comments linked directly to this Pulse item.
   */
  async getPulseComments(id, params = {}) {
    if (!id) throw new Error('Pulse item ID is required');
    try {
      const queryParams = {
        page: params.page || 0,
        size: params.size || 20,
      };
      const response = await apiClient.get(`/api/v1/pulse/${id}/comments`, { params: queryParams });
      return response.data?.data || response.data || { content: [] };
    } catch (err) {
      console.error(`[apiPulseService] Failed to fetch comments for Pulse item ${id}:`, err);
      throw err;
    }
  },

  /**
   * POST /api/v1/pulse/{id}/comments
   * Add a comment directly to a Pulse item.
   */
  async createPulseComment(id, content, originalLanguage = 'EN', imageUrl = null) {
    if (!id) throw new Error('Pulse item ID is required');
    try {
      const payload = {
        content,
        originalLanguage,
      };
      if (imageUrl) {
        payload.imageUrl = imageUrl;
      }
      const response = await apiClient.post(`/api/v1/pulse/${id}/comments`, payload);
      return response.data?.data || response.data;
    } catch (err) {
      console.error(`[apiPulseService] Failed to create comment on Pulse item ${id}:`, err);
      throw err;
    }
  },

  /**
   * POST /api/v1/pulse/{id}/like
   * Toggle like reaction on a Pulse item.
   */
  async toggleLikePulseItem(id) {
    if (!id) throw new Error('Pulse item ID is required');
    try {
      const response = await apiClient.post(`/api/v1/pulse/${id}/like`);
      return response.data?.data || response.data;
    } catch (err) {
      console.error(`[apiPulseService] Failed to toggle like on Pulse item ${id}:`, err);
      throw err;
    }
  },

  /**
   * POST /api/v1/pulse/{id}/react
   * Add or update reaction on a Pulse item.
   */
  async reactToPulseItem(id, reactionType) {
    if (!id) throw new Error('Pulse item ID is required');
    try {
      const response = await apiClient.post(`/api/v1/pulse/${id}/react`, { reactionType });
      return response.data?.data || response.data;
    } catch (err) {
      console.error(`[apiPulseService] Failed to react to Pulse item ${id}:`, err);
      throw err;
    }
  },

  /**
   * DELETE /api/v1/pulse/{id}/react
   * Remove reaction from a Pulse item.
   */
  async removeReactionFromPulseItem(id) {
    if (!id) throw new Error('Pulse item ID is required');
    try {
      const response = await apiClient.delete(`/api/v1/pulse/${id}/react`);
      return response.data?.data || response.data;
    } catch (err) {
      console.error(`[apiPulseService] Failed to remove reaction from Pulse item ${id}:`, err);
      throw err;
    }
  },
};
