import { apiClient } from './apiClient.js';

export const apiAdminPulseService = {
  // ==========================================
  // 1. SOURCES MANAGEMENT
  // ==========================================

  // GET /api/v1/admin/pulse/sources
  async getSources(params = {}) {
    try {
      const response = await apiClient.get('/api/v1/admin/pulse/sources', {
        params: {
          isActive: params.isActive,
          page: params.page ?? 0,
          size: params.size ?? 20,
        },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/v1/admin/pulse/sources/{id}
  async getSourceById(id) {
    try {
      const response = await apiClient.get(`/api/v1/admin/pulse/sources/${id}`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // POST /api/v1/admin/pulse/sources
  async createSource(data) {
    try {
      const response = await apiClient.post('/api/v1/admin/pulse/sources', {
        name: data.name?.trim(),
        feedUrl: data.feedUrl?.trim(),
        siteUrl: data.siteUrl?.trim() || null,
        category: data.category?.trim() || 'GENERAL',
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/v1/admin/pulse/sources/{id}
  async updateSource(id, data) {
    try {
      const response = await apiClient.put(`/api/v1/admin/pulse/sources/${id}`, {
        name: data.name?.trim(),
        feedUrl: data.feedUrl?.trim(),
        siteUrl: data.siteUrl?.trim() || null,
        category: data.category?.trim() || 'GENERAL',
        isActive: data.isActive,
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PATCH /api/v1/admin/pulse/sources/{id}/toggle-active
  async toggleSourceActive(id) {
    try {
      const response = await apiClient.patch(`/api/v1/admin/pulse/sources/${id}/toggle-active`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // POST /api/v1/admin/pulse/sources/{id}/fetch
  async fetchSource(id) {
    try {
      const response = await apiClient.post(`/api/v1/admin/pulse/sources/${id}/fetch`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // ==========================================
  // 2. CANDIDATES REVIEW QUEUE
  // ==========================================

  // GET /api/v1/admin/pulse/candidates
  async getCandidates(params = {}) {
    try {
      const response = await apiClient.get('/api/v1/admin/pulse/candidates', {
        params: {
          status: params.status || 'PENDING_REVIEW',
          sourceId: params.sourceId || undefined,
          category: params.category && params.category !== 'ALL' ? params.category : undefined,
          page: params.page ?? 0,
          size: params.size ?? 20,
        },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/v1/admin/pulse/candidates/counts
  async getCandidateCategoryCounts(params = {}) {
    try {
      const response = await apiClient.get('/api/v1/admin/pulse/candidates/counts', {
        params: {
          status: params.status && params.status !== 'ALL' ? params.status : undefined,
          sourceId: params.sourceId || undefined,
        },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/v1/admin/pulse/candidates/{id}
  async getCandidateById(id) {
    try {
      const response = await apiClient.get(`/api/v1/admin/pulse/candidates/${id}`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // POST /api/v1/admin/pulse/candidates/{id}/approve
  async approveCandidate(id, overrides = {}) {
    try {
      const payload = {
        title: overrides.title?.trim() || undefined,
        summary: overrides.summary !== undefined ? overrides.summary : undefined,
        content: overrides.content !== undefined ? overrides.content : undefined,
        category: overrides.category?.trim() || overrides.topic?.trim() || undefined,
        topic: overrides.topic?.trim() || overrides.category?.trim() || undefined,
        subtopic: overrides.subtopic?.trim() || undefined,
        imageUrl: overrides.imageUrl?.trim() || undefined,
        placement: overrides.placement || 'FEATURED_PULSE',
        publicationStatus: overrides.publicationStatus || 'PUBLISHED',
        scheduledTime: overrides.scheduledTime || undefined,
        featuredPriority: overrides.featuredPriority !== undefined ? Number(overrides.featuredPriority) : undefined,
        promotionEndTime: overrides.promotionEndTime || undefined,
      };
      const response = await apiClient.post(`/api/v1/admin/pulse/candidates/${id}/approve`, payload);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // POST /api/v1/admin/pulse/candidates/{id}/reject
  async rejectCandidate(id, { reason }) {
    try {
      const response = await apiClient.post(`/api/v1/admin/pulse/candidates/${id}/reject`, {
        reason: reason?.trim(),
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // ==========================================
  // 3. PULSE ITEMS & EDITORIAL MANAGEMENT
  // ==========================================

  // GET /api/v1/admin/pulse/items
  async getItems(params = {}) {
    try {
      const response = await apiClient.get('/api/v1/admin/pulse/items', {
        params: {
          publicationStatus: params.publicationStatus || undefined,
          placement: params.placement || undefined,
          moderationStatus: params.moderationStatus || undefined,
          topic: params.topic || undefined,
          page: params.page ?? 0,
          size: params.size ?? 20,
        },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/v1/admin/pulse/items/{id}
  async getItemById(id) {
    try {
      const response = await apiClient.get(`/api/v1/admin/pulse/items/${id}`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // POST /api/v1/admin/pulse/items
  async createItem(data) {
    try {
      const payload = {
        title: data.title?.trim(),
        summary: data.summary?.trim() || null,
        content: data.content?.trim() || null,
        sourceName: data.sourceName?.trim() || null,
        sourceUrl: data.sourceUrl?.trim() || null,
        imageUrl: data.imageUrl?.trim() || null,
        topic: data.topic?.trim() || 'GENERAL',
        subtopic: data.subtopic?.trim() || null,
        publicationStatus: data.publicationStatus || 'PUBLISHED',
        placement: data.placement || 'FEATURED_PULSE',
        moderationStatus: data.moderationStatus || 'VISIBLE',
        featuredPriority: data.featuredPriority !== undefined ? Number(data.featuredPriority) : 0,
        publishedAt: data.publishedAt || null,
        promotionEndTime: data.promotionEndTime || null,
        candidateId: data.candidateId ? Number(data.candidateId) : null,
      };
      const response = await apiClient.post('/api/v1/admin/pulse/items', payload);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/v1/admin/pulse/items/{id}
  async updateItem(id, data) {
    try {
      const payload = {
        title: data.title?.trim(),
        summary: data.summary?.trim() || null,
        content: data.content?.trim() || null,
        sourceName: data.sourceName?.trim() || null,
        sourceUrl: data.sourceUrl?.trim() || null,
        imageUrl: data.imageUrl?.trim() || null,
        topic: data.topic?.trim() || 'GENERAL',
        subtopic: data.subtopic?.trim() || null,
      };
      const response = await apiClient.put(`/api/v1/admin/pulse/items/${id}`, payload);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/v1/admin/pulse/items/{id}/publication-status
  async updatePublicationStatus(id, { publicationStatus, publishedAt }) {
    try {
      const response = await apiClient.put(`/api/v1/admin/pulse/items/${id}/publication-status`, {
        publicationStatus,
        publishedAt: publishedAt || null,
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/v1/admin/pulse/items/{id}/placement
  async updatePlacement(id, { placement, featuredPriority, promotionEndTime }) {
    try {
      const response = await apiClient.put(`/api/v1/admin/pulse/items/${id}/placement`, {
        placement,
        featuredPriority: featuredPriority !== undefined ? Number(featuredPriority) : 0,
        promotionEndTime: promotionEndTime || null,
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // PUT /api/v1/admin/pulse/items/{id}/moderation-status
  async updateModerationStatus(id, { moderationStatus, reason }) {
    try {
      const response = await apiClient.put(`/api/v1/admin/pulse/items/${id}/moderation-status`, {
        moderationStatus,
        reason: reason?.trim() || null,
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // DELETE /api/v1/admin/pulse/items/{id}
  async deleteItem(id, reason) {
    const trimmedReason = reason?.trim();
    if (!trimmedReason) {
      throw new Error('Deletion reason is required');
    }
    try {
      const response = await apiClient.delete(`/api/v1/admin/pulse/items/${id}`, {
        data: { reason: trimmedReason },
        params: { reason: trimmedReason },
      });
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },

  // GET /api/v1/admin/pulse/items/{id}/audit-logs
  async getAuditLogs(id) {
    try {
      const response = await apiClient.get(`/api/v1/admin/pulse/items/${id}/audit-logs`);
      return response.data;
    } catch (err) {
      if (err.response?.data) throw err.response.data;
      throw err;
    }
  },
};
